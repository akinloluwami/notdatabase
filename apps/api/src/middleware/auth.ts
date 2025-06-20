import type { MiddlewareHandler } from "hono";
import { turso } from "../lib/turso.js";
import "hono";

declare module "hono" {
  interface ContextVariableMap {
    dbId: string;
    userId: string;
  }
}

export const apiKeyAuth: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const key = auth.replace("Bearer ", "").trim();

  const result = await turso.execute(
    `SELECT user_id, db_id FROM api_keys WHERE key = ? AND revoked = 0`,
    [key]
  );

  const row = result.rows[0] as any;

  if (!row || !row.user_id || !row.db_id) {
    return c.json({ error: "Invalid or revoked API key" }, 401);
  }

  c.set("userId", row.user_id);
  c.set("dbId", row.db_id);

  await next();
};
