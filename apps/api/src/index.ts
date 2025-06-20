import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { apiKeyAuth } from "./middleware/auth";
import { turso } from "./lib/turso";
import { validateAgainstSchema } from "./lib/schema";

const app = new Hono();

app.post("/schema/:collection", apiKeyAuth, async (c) => {
  const dbId = c.get("dbId");
  const collection = c.req.param("collection");

  const schema = await c.req.json();

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return c.json({ error: "Schema must be a JSON object" }, 400);
  }

  await turso.execute({
    sql: `
      INSERT INTO collection_schema (db_id, collection, schema)
      VALUES (?, ?, ?)
      ON CONFLICT(db_id, collection) DO UPDATE SET schema = excluded.schema
    `,
    args: [dbId, collection, JSON.stringify(schema)],
  });

  return c.json({ message: "Schema saved." });
});

app.post("/:collection/docs", apiKeyAuth, async (c) => {
  const collection = c.req.param("collection");
  const dbId = c.get("dbId");
  if (!dbId) return c.json({ error: "Missing dbId" }, 401);

  const body = await c.req.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { unique, ...data } = body;

  // 🧠 Schema validation
  const { rows: schemaRows } = await turso.execute({
    sql: `SELECT schema FROM collection_schema WHERE db_id = ? AND collection = ? LIMIT 1`,
    args: [dbId, collection],
  });

  if (schemaRows.length > 0) {
    let schema;
    const schemaValue = schemaRows[0].schema;
    if (typeof schemaValue !== "string") {
      return c.json({ error: "Collection schema is not valid JSON" }, 500);
    }
    try {
      schema = JSON.parse(schemaValue);
    } catch {
      return c.json({ error: "Collection schema is not valid JSON" }, 500);
    }

    const err = validateAgainstSchema(data, schema);
    if (err) return c.json({ error: err }, 400);
  }

  const now = new Date().toISOString();
  const key = body.key ?? nanoid();

  const doc = {
    ...data,
    _id: key,
    createdAt: now,
    updatedAt: now,
  };

  // 🔐 Unique field constraint check
  if (Array.isArray(unique)) {
    for (const field of unique) {
      const value = data[field];
      if (typeof value === "undefined") continue;

      const { rows } = await turso.execute({
        sql: `
          SELECT id FROM kv_store
          WHERE db_id = ? AND collection = ?
          AND json_extract(value, ?) = ?
          LIMIT 1
        `,
        args: [dbId, collection, `$.${field}`, value],
      });

      if (rows.length > 0) {
        return c.json(
          {
            error: `Unique field violation — '${field}' already exists in this collection.`,
          },
          409
        );
      }
    }
  }

  // ✅ Save to kv_store
  try {
    await turso.execute({
      sql: `
        INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [key, dbId, collection, key, JSON.stringify(doc), now, now],
    });

    return c.json(doc, 201);
  } catch (err: any) {
    console.error("Insert failed", err);
    return c.json({ error: "Insert failed" }, 500);
  }
});

app.post("/:collection/bulk", apiKeyAuth, async (c) => {
  const collection = c.req.param("collection");
  const dbId = c.get("dbId");
  if (!dbId) return c.json({ error: "Missing dbId" }, 401);

  const body = await c.req.json();

  if (!Array.isArray(body)) {
    return c.json({ error: "Expected an array of documents" }, 400);
  }

  const now = new Date().toISOString();
  const insertedDocs: any[] = [];

  const sqlChunks: string[] = [];
  const args: any[] = [];

  for (const raw of body) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return c.json({ error: "Each document must be a valid object" }, 400);
    }

    const { unique, ...data } = raw;
    const id = raw.key ?? nanoid();

    if (Array.isArray(unique)) {
      for (const field of unique) {
        const value = data[field];
        if (typeof value === "undefined") continue;

        const { rows } = await turso.execute({
          sql: `
            SELECT id FROM kv_store
            WHERE db_id = ? AND collection = ?
            AND json_extract(value, ?) = ?
            LIMIT 1
          `,
          args: [dbId, collection, `$.${field}`, value],
        });

        if (rows.length > 0) {
          return c.json(
            { error: `Unique field violation — '${field}' already exists.` },
            409
          );
        }
      }
    }

    const doc = {
      ...data,
      _id: id,
      createdAt: now,
      updatedAt: now,
    };

    sqlChunks.push(`(?, ?, ?, ?, ?, ?, ?)`);
    args.push(id, dbId, collection, id, JSON.stringify(doc), now, now);
    insertedDocs.push(doc);
  }

  try {
    await turso.execute({
      sql: `
        INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
        VALUES ${sqlChunks.join(",")}
      `,
      args,
    });

    return c.json(insertedDocs, 201);
  } catch (err) {
    console.error("Bulk insert failed", err);
    return c.json({ error: "Bulk insert failed" }, 500);
  }
});

app.get("/:collection/docs", apiKeyAuth, async (c) => {
  const collection = c.req.param("collection");
  const dbId = c.get("dbId");
  if (!dbId) return c.json({ error: "Missing dbId" }, 401);

  const url = new URL(c.req.url);
  const query = url.searchParams;

  const limit = parseInt(query.get("limit") || "50");
  const offset = parseInt(query.get("offset") || "0");

  const filters: [string, any][] = [];

  for (const [key, value] of query.entries()) {
    if (key.startsWith("filter[")) {
      const field = key.slice(7, -1);
      let parsed: any = value;

      if (value === "true") parsed = true;
      else if (value === "false") parsed = false;
      else if (!isNaN(Number(value))) parsed = Number(value);

      filters.push([field, parsed]);
    }
  }

  let sql = `
    SELECT key, value
    FROM kv_store
    WHERE db_id = ? AND collection = ?
  `;

  const args: any[] = [dbId, collection];

  for (const [field, value] of filters) {
    sql += ` AND json_extract(value, ?) = ?`;
    args.push(`$.${field}`, value);
  }

  const sort = query.get("sort");
  if (sort) {
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    sql += ` ORDER BY json_extract(value, ?) ${desc ? "DESC" : "ASC"}`;
    args.push(`$.${field}`);
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  args.push(limit, offset);

  try {
    const { rows } = await turso.execute({ sql, args });
    const docs = rows.map((row: any) => JSON.parse(row.value));
    return c.json(docs);
  } catch (err) {
    console.error("Failed to fetch docs", err);
    return c.json({ error: "Failed to fetch documents" }, 500);
  }
});

app.get("/:collection/docs/:id", apiKeyAuth, async (c) => {
  const dbId = c.get("dbId");
  const collection = c.req.param("collection");
  const id = c.req.param("id");

  const { rows } = await turso.execute({
    sql: `
      SELECT value FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
      LIMIT 1
    `,
    args: [dbId, collection, id],
  });

  if (rows.length === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  const value = rows[0].value;
  if (typeof value !== "string") {
    return c.json({ error: "Invalid document value" }, 500);
  }

  return c.json(JSON.parse(value));
});

app.patch("/:collection/docs/:id", apiKeyAuth, async (c) => {
  const dbId = c.get("dbId");
  const collection = c.req.param("collection");
  const id = c.req.param("id");
  const body = await c.req.json();

  const { rows } = await turso.execute({
    sql: `
      SELECT value FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
      LIMIT 1
    `,
    args: [dbId, collection, id],
  });

  if (rows.length === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  const value = rows[0].value;
  if (typeof value !== "string") {
    return c.json({ error: "Invalid document value" }, 500);
  }

  const existing = JSON.parse(value);

  const updated = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await turso.execute({
    sql: `
      UPDATE kv_store
      SET value = ?, updated_at = ?
      WHERE db_id = ? AND collection = ? AND key = ?
    `,
    args: [JSON.stringify(updated), updated.updatedAt, dbId, collection, id],
  });

  return c.json(updated);
});

app.delete("/:collection/docs/:id", apiKeyAuth, async (c) => {
  const dbId = c.get("dbId");
  const collection = c.req.param("collection");
  const id = c.req.param("id");

  const { rowsAffected } = await turso.execute({
    sql: `
      DELETE FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
    `,
    args: [dbId, collection, id],
  });

  if (rowsAffected === 0) {
    return c.json({ error: "Document not found" }, 404);
  }

  return c.json({ message: "Document deleted" });
});

app.get("/:collection/count", apiKeyAuth, async (c) => {
  const collection = c.req.param("collection");
  const dbId = c.get("dbId");
  if (!dbId) return c.json({ error: "Missing dbId" }, 401);

  const url = new URL(c.req.url);
  const query = url.searchParams;

  const filters: [string, any][] = [];

  for (const [key, value] of query.entries()) {
    if (key.startsWith("filter[")) {
      const field = key.slice(7, -1);
      let parsed: any = value;

      if (value === "true") parsed = true;
      else if (value === "false") parsed = false;
      else if (!isNaN(Number(value))) parsed = Number(value);

      filters.push([field, parsed]);
    }
  }

  let sql = `
    SELECT COUNT(*) as count
    FROM kv_store
    WHERE db_id = ? AND collection = ?
  `;

  const args: any[] = [dbId, collection];

  for (const [field, value] of filters) {
    sql += ` AND json_extract(value, ?) = ?`;
    args.push(`$.${field}`, value);
  }

  try {
    const { rows } = await turso.execute({ sql, args });
    return c.json({ count: rows[0].count });
  } catch (err) {
    console.error("Failed to count docs with filters", err);
    return c.json({ error: "Failed to count documents" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3344,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
