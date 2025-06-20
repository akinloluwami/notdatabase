import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { apiKeyAuth } from "./middleware/auth";
import { turso } from "./lib/turso";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// 📝 Write doc to collection
app.post("/:collection/docs", apiKeyAuth, async (c) => {
  const collection = c.req.param("collection");
  // @ts-expect-error: dbId is set in middleware but not typed in ContextVariableMap
  const dbId = c.var["dbId"] as string | undefined;
  if (!dbId) {
    return c.json({ error: "Missing dbId in context" }, 401);
  }
  const body = await c.req.json();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const id = nanoid();
  const now = new Date().toISOString();

  const doc = {
    ...body,
    _id: id,
    createdAt: now,
    updatedAt: now,
  };

  await turso.execute({
    sql: `
      INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, dbId, collection, id, JSON.stringify(doc), now, now],
  });

  return c.json(doc, 201);
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
