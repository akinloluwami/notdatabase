import { Hono } from "hono";
import { sql } from "../lib/db.js";
import { getDbIdFromApiKey } from "../lib/auth.js";

type Variables = {
  dbId: string;
  collection: string;
};

export const schemaRoutes = new Hono<{ Variables: Variables }>();

// Middleware to extract dbId and collection
schemaRoutes.use("*", async (c, next) => {
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

// POST /:collection/schema - Save or update collection schema
schemaRoutes.post("/", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");

  try {
    const body = await c.req.json();
    const { schema } = body as {
      schema?: Record<string, { type: string; required?: boolean }>;
    };

    if (!schema || typeof schema !== "object") {
      return c.json({ error: "Invalid schema" }, 400);
    }

    const schemaJson = JSON.stringify(schema);

    // Upsert the schema
    await sql`
      INSERT INTO collection_schema (db_id, collection, schema)
      VALUES (${dbId}, ${collection}, ${schemaJson})
      ON CONFLICT (db_id, collection)
      DO UPDATE SET schema = ${schemaJson}
    `;

    return c.json({ success: true, collection, schema });
  } catch (error) {
    console.error("Schema save error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /:collection/schema - Get collection schema
schemaRoutes.get("/", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");

  try {
    const result = await sql`
      SELECT schema FROM collection_schema WHERE db_id = ${dbId} AND collection = ${collection}
    `;

    if (result.length === 0) {
      return c.json({ schema: null });
    }

    const schema = JSON.parse(result[0].schema as string);
    return c.json({ collection, schema });
  } catch (error) {
    console.error("Schema get error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
