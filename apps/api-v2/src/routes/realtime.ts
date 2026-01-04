import { Hono } from "hono";
import { sign } from "hono/jwt";
import { sql } from "../lib/db.js";
import { getDbIdFromApiKey } from "../lib/auth.js";

export const realtimeRoutes = new Hono();

// POST /realtime/token - Generate a JWT token for real-time subscriptions
realtimeRoutes.post("/token", async (c) => {
  const authHeader = c.req.header("authorization");
  const dbId = await getDbIdFromApiKey(authHeader ?? null);

  if (!dbId) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  try {
    const body = await c.req.json();
    const { collection, permissions } = body as {
      collection?: string;
      permissions?: string[];
    };

    if (!collection) {
      return c.json({ error: "Collection is required" }, 400);
    }

    const validPermissions = ["read", "insert", "update", "delete"];
    const requestedPermissions = permissions || ["read"];

    // Validate permissions
    for (const perm of requestedPermissions) {
      if (!validPermissions.includes(perm)) {
        return c.json({ error: `Invalid permission: ${perm}` }, 400);
      }
    }

    // Get the database info to verify it exists
    const dbResult = await sql`
      SELECT id FROM databases WHERE id = ${dbId}
    `;

    if (dbResult.length === 0) {
      return c.json({ error: "Database not found" }, 404);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET not configured");
      return c.json({ error: "Server configuration error" }, 500);
    }

    // Create JWT token with database, collection, and permissions
    const payload = {
      dbId,
      collection,
      permissions: requestedPermissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    const token = await sign(payload, jwtSecret);

    return c.json({
      token,
      expiresIn: 60 * 60 * 24,
      collection,
      permissions: requestedPermissions,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
