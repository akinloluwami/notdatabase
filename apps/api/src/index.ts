import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { apiKeyAuth } from "./middleware/auth";
import { turso } from "./lib/turso";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
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

  const now = new Date().toISOString();
  const id = nanoid();
  const key = body.key ?? id;

  const doc = {
    ...data,
    _id: key,
    createdAt: now,
    updatedAt: now,
  };

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

app.get("/:collection/docs", apiKeyAuth, async (c) => {
  const collection = c.req.param("collection");
  const dbId = c.get("dbId");
  if (!dbId) return c.json({ error: "Missing dbId" }, 401);

  const url = new URL(c.req.url);
  const query = url.searchParams;

  const limit = parseInt(query.get("limit") || "50");
  const offset = parseInt(query.get("offset") || "0");

  const filters: [string, string][] = [];

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

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
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

serve(
  {
    fetch: app.fetch,
    port: 3344,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
