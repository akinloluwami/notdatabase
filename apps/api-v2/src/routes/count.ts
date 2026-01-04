import { Hono } from "hono";
import { sql } from "../lib/db.js";
import { getDbIdFromApiKey } from "../lib/auth.js";

type Variables = {
  dbId: string;
  collection: string;
};

export const countRoutes = new Hono<{ Variables: Variables }>();

// Middleware to extract dbId and collection
countRoutes.use("*", async (c, next) => {
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

// GET /:collection/count - Count documents
countRoutes.get("/", async (c) => {
  const dbId = c.get("dbId");
  const collection = c.get("collection");

  try {
    const filter = c.req.query("filter");

    let count: number;

    if (filter) {
      // Parse the filter and count matching documents
      const parsed = JSON.parse(filter) as Record<string, unknown>;

      // Get all documents and filter in memory
      // For simple equality filters, we can filter in SQL if indexed
      const rows = await sql`
        SELECT data FROM kv_store WHERE db_id = ${dbId} AND collection = ${collection}
      `;

      const matchingDocs = rows.filter((row) => {
        const data = JSON.parse(row.data as string) as Record<string, unknown>;
        return Object.entries(parsed).every(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle operators like $gt, $lt, $gte, $lte
            const ops = value as Record<string, unknown>;
            const fieldValue = data[key];

            if (
              ops.$gt !== undefined &&
              !(Number(fieldValue) > Number(ops.$gt))
            )
              return false;
            if (
              ops.$lt !== undefined &&
              !(Number(fieldValue) < Number(ops.$lt))
            )
              return false;
            if (
              ops.$gte !== undefined &&
              !(Number(fieldValue) >= Number(ops.$gte))
            )
              return false;
            if (
              ops.$lte !== undefined &&
              !(Number(fieldValue) <= Number(ops.$lte))
            )
              return false;
            if (ops.$ne !== undefined && fieldValue === ops.$ne) return false;
            if (ops.$in !== undefined && !Array.isArray(ops.$in)) return false;
            if (
              ops.$in !== undefined &&
              !(ops.$in as unknown[]).includes(fieldValue)
            )
              return false;

            return true;
          }
          return data[key] === value;
        });
      });

      count = matchingDocs.length;
    } else {
      // Simple count without filter
      const result = await sql`
        SELECT COUNT(*) as count FROM kv_store WHERE db_id = ${dbId} AND collection = ${collection}
      `;
      count = Number(result[0].count);
    }

    return c.json({ count });
  } catch (error) {
    console.error("Count error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
