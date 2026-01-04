import { Hono } from "hono";
import { nanoid } from "nanoid";
import { sql } from "../lib/db.js";
import { getDbIdFromApiKey } from "../lib/auth.js";
import { validateAgainstSchema, type SchemaDefinition } from "../lib/schema.js";
import { logDbEvent } from "../lib/log-event.js";
import { publishDbEvent } from "../lib/publish-event.js";
import { createAutoIndexIfNeeded } from "../lib/create-auto-index-if-needed.js";

type Variables = {
  dbId: string;
  collection: string;
};

export const bulkRoutes = new Hono<{ Variables: Variables }>();

// Middleware to extract dbId and collection
bulkRoutes.use("*", async (c, next) => {
  const authHeader = c.req.header("authorization");
  const dbId = await getDbIdFromApiKey(authHeader ?? null);

  if (!dbId) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const collection = c.req.param("collection") ?? "";
  c.set("dbId", dbId);
  c.set("collection", collection);

  await next();
});

// POST /:collection/bulk - Bulk insert documents
bulkRoutes.post("/", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");

  try {
    const body = await c.req.json();
    const { documents } = body as { documents?: unknown[] };

    if (!Array.isArray(documents) || documents.length === 0) {
      return c.json({ error: "Invalid or empty documents array" }, 400);
    }

    // Validate each document against schema if exists
    const schemaResult = await sql`
      SELECT schema FROM collection_schema WHERE db_id = ${dbId} AND collection = ${collection}
    `;

    let parsedSchema: SchemaDefinition | null = null;
    if (schemaResult.length > 0 && schemaResult[0].schema) {
      parsedSchema = JSON.parse(schemaResult[0].schema as string);
    }

    const insertedDocs: { id: string; data: unknown }[] = [];
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (typeof doc !== "object" || doc === null) {
        errors.push({ index: i, error: "Document must be an object" });
        continue;
      }

      // Validate against schema
      if (parsedSchema) {
        const validation = validateAgainstSchema(
          doc as Record<string, unknown>,
          parsedSchema,
        );
        if (!validation.valid) {
          errors.push({
            index: i,
            error: validation.error || "Schema validation failed",
          });
          continue;
        }
      }

      const id = nanoid();
      const dataJson = JSON.stringify(doc);

      await sql`
        INSERT INTO kv_store (id, db_id, collection, data)
        VALUES (${id}, ${dbId}, ${collection}, ${dataJson})
      `;

      insertedDocs.push({ id, data: doc });

      // Log event
      await logDbEvent({ dbId, collection, action: "CREATE", docId: id });

      // Publish event for real-time
      await publishDbEvent({
        dbId,
        collection,
        type: "insert",
        doc: { id, data: doc },
      });

      // Create auto-index if needed (for each field in the document)
      const docObj = doc as Record<string, unknown>;
      for (const field of Object.keys(docObj)) {
        await createAutoIndexIfNeeded(dbId, collection, field);
      }
    }

    return c.json({
      inserted: insertedDocs.length,
      failed: errors.length,
      documents: insertedDocs,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk insert error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
