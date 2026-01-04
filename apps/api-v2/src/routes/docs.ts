import { Hono } from "hono";
import { nanoid } from "nanoid";
import { sql } from "../lib/db.js";
import { getDbIdFromApiKey } from "../lib/auth.js";
import { validateAgainstSchema, type SchemaDefinition } from "../lib/schema.js";
import { logDbEvent } from "../lib/log-event.js";
import { publishDbEvent } from "../lib/publish-event.js";
import { createAutoIndexIfNeeded } from "../lib/create-auto-index-if-needed.js";

export const docsRoutes = new Hono<{
  Variables: { dbId: string; collection: string };
}>();

// Middleware to extract dbId and collection
docsRoutes.use("*", async (c, next) => {
  const authHeader = c.req.header("authorization");
  const dbId = await getDbIdFromApiKey(authHeader ?? null);

  if (!dbId) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  // Get collection from the parent path
  const collection = c.req.param("collection") ?? "";
  c.set("dbId", dbId);
  c.set("collection", collection);

  await next();
});

// GET /:collection/docs - Get documents from collection
docsRoutes.get("/", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");

  const query = c.req.query();
  const limit = parseInt(query.limit || "50");
  const offset = parseInt(query.offset || "0");

  // Collect type hints from query params
  const typeHints: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    const match = key.match(/^type\[([^\]]+)\]$/);
    if (match) {
      typeHints[match[1]] = value;
    }
  }

  // Parse filters
  const filters: { field: string; op: string; value: any }[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("filter[")) {
      const match = key.match(/^filter\[([^\]]+)\](?:\[([^\]]+)\])?$/);
      if (match) {
        const field = match[1];
        const op = match[2] || "eq";
        const declaredType = typeHints[field];

        let parsed: any = value;
        if (declaredType === "boolean") {
          parsed = value === "true";
        } else if (declaredType === "number") {
          parsed = Number(value);
        } else if (declaredType === "string") {
          parsed = value;
        } else {
          if (value === "true") parsed = true;
          else if (value === "false") parsed = false;
          else parsed = value;
        }

        filters.push({ field, op, value: parsed });
        await createAutoIndexIfNeeded(dbId, collection, field);
      }
    }
  }

  try {
    // Build the query dynamically
    let baseQuery = `SELECT key, value FROM kv_store WHERE db_id = $1 AND collection = $2`;
    const args: any[] = [dbId, collection];
    let paramIndex = 3;

    for (const { field, op, value } of filters) {
      let sqlOp = "=";
      if (op === "gt") sqlOp = ">";
      else if (op === "lt") sqlOp = "<";
      else if (op === "gte") sqlOp = ">=";
      else if (op === "lte") sqlOp = "<=";

      baseQuery += ` AND value->>'${field}' ${sqlOp} $${paramIndex}`;
      args.push(String(value));
      paramIndex++;
    }

    // Sorting
    const sort = query.sort;
    if (sort) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      baseQuery += ` ORDER BY value->>'${field}' ${desc ? "DESC" : "ASC"}`;
      await createAutoIndexIfNeeded(dbId, collection, field);
    } else {
      baseQuery += ` ORDER BY created_at DESC`;
    }

    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    args.push(limit, offset);

    const rows = await sql.unsafe(baseQuery, args);
    const docs = rows.map((row: any) =>
      typeof row.value === "string" ? JSON.parse(row.value) : row.value,
    );

    await logDbEvent({
      dbId,
      collection,
      action: "READ",
      docId: undefined,
    });

    return c.json(docs);
  } catch (err) {
    console.error("Failed to fetch docs", err);
    return c.json({ error: "Failed to fetch documents" }, 500);
  }
});

// GET /:collection/docs/:id - Get a specific document
docsRoutes.get("/:id", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");
  const id = c.req.param("id");

  const selectParam = c.req.query("select");
  const selectedFields = selectParam?.split(",").map((f) => f.trim());

  const rows = await sql`
    SELECT value FROM kv_store
    WHERE db_id = ${dbId} AND collection = ${collection} AND key = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  const rawValue = rows[0].value;
  const doc: Record<string, any> =
    typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;

  if (selectedFields && selectedFields.length > 0) {
    const selectedDoc: Record<string, any> = {};
    for (const field of selectedFields) {
      if (field in doc) {
        selectedDoc[field] = doc[field];
      }
    }

    await logDbEvent({
      dbId,
      collection,
      action: "READ",
      docId: id,
    });

    return c.json(selectedDoc);
  }

  await logDbEvent({
    dbId,
    collection,
    action: "READ",
    docId: id,
  });

  return c.json(doc);
});

// POST /:collection/docs - Create a new document
docsRoutes.post("/", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");
  const body = await c.req.json();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { unique, key: providedKey, ...data } = body;

  // Schema validation
  const schemaRows = await sql`
    SELECT schema FROM collection_schema 
    WHERE db_id = ${dbId} AND collection = ${collection} 
    LIMIT 1
  `;

  if (schemaRows.length > 0) {
    const schema = schemaRows[0].schema as SchemaDefinition;
    const result = validateAgainstSchema(data, schema);
    if (!result.valid) return c.json({ error: result.error }, 400);
  }

  const now = new Date().toISOString();
  const key = providedKey ?? nanoid();

  const doc = {
    ...data,
    _id: key,
    createdAt: now,
    updatedAt: now,
  };

  // Unique field constraint check
  if (Array.isArray(unique)) {
    for (const field of unique) {
      const value = data[field];
      if (typeof value === "undefined") continue;

      const existingRows = await sql`
        SELECT id FROM kv_store
        WHERE db_id = ${dbId} AND collection = ${collection}
        AND value->>$${field} = ${String(value)}
        LIMIT 1
      `;

      if (existingRows.length > 0) {
        return c.json(
          {
            error: `Unique field violation — '${field}' already exists in this collection.`,
          },
          409,
        );
      }

      await createAutoIndexIfNeeded(dbId, collection, field);
    }
  }

  try {
    await sql`
      INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
      VALUES (${key}, ${dbId}, ${collection}, ${key}, ${JSON.stringify(doc)}::jsonb, ${now}, ${now})
    `;

    await logDbEvent({
      dbId,
      collection,
      action: "CREATE",
      docId: key,
    });

    await publishDbEvent({
      dbId,
      collection,
      type: "insert",
      doc,
    });

    return c.json(doc, 201);
  } catch (err: any) {
    console.error("Insert failed", err);
    return c.json({ error: "Insert failed" }, 500);
  }
});

// PATCH /:collection/docs/:id - Update a specific document
docsRoutes.patch("/:id", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");
  const id = c.req.param("id");
  const body = await c.req.json();

  const rows = await sql`
    SELECT value FROM kv_store
    WHERE db_id = ${dbId} AND collection = ${collection} AND key = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  const rawExisting = rows[0].value;
  const existing: Record<string, any> =
    typeof rawExisting === "string" ? JSON.parse(rawExisting) : rawExisting;

  // Handle increment/decrement operations
  const updated = { ...existing };
  for (const [key, val] of Object.entries(body)) {
    if (
      val &&
      typeof val === "object" &&
      (Object.prototype.hasOwnProperty.call(val, "increment") ||
        Object.prototype.hasOwnProperty.call(val, "decrement"))
    ) {
      const current = typeof updated[key] === "number" ? updated[key] : 0;
      if (typeof (val as any).increment === "number") {
        updated[key] = current + (val as any).increment;
      } else if (typeof (val as any).decrement === "number") {
        updated[key] = current - (val as any).decrement;
      }
    } else {
      updated[key] = val;
    }
  }
  updated.updatedAt = new Date().toISOString();

  await sql`
    UPDATE kv_store
    SET value = ${JSON.stringify(updated)}::jsonb, updated_at = ${updated.updatedAt}
    WHERE db_id = ${dbId} AND collection = ${collection} AND key = ${id}
  `;

  await logDbEvent({
    dbId,
    collection,
    action: "UPDATE",
    docId: id,
  });

  await publishDbEvent({
    dbId,
    collection,
    type: "update",
    doc: updated,
  });

  return c.json(updated);
});

// DELETE /:collection/docs/:id - Delete a specific document
docsRoutes.delete("/:id", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");
  const id = c.req.param("id");

  // Get the document before deleting it for the event
  const rows = await sql`
    SELECT value FROM kv_store
    WHERE db_id = ${dbId} AND collection = ${collection} AND key = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  const rawDeletedDoc = rows[0].value;
  const deletedDoc =
    typeof rawDeletedDoc === "string"
      ? JSON.parse(rawDeletedDoc)
      : rawDeletedDoc;

  const result = await sql`
    DELETE FROM kv_store
    WHERE db_id = ${dbId} AND collection = ${collection} AND key = ${id}
  `;

  if (result.count === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  await logDbEvent({
    dbId,
    collection,
    action: "DELETE",
    docId: id,
  });

  await publishDbEvent({
    dbId,
    collection,
    type: "delete",
    doc: deletedDoc,
  });

  return c.json({ message: "Document deleted" });
});
