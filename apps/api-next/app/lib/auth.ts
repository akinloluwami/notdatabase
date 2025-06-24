import { turso } from "./turso";

// Helper function to get database ID from API key
export async function getDbIdFromApiKey(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const key = authHeader.replace("Bearer ", "").trim();

  const result = await turso.execute(
    `SELECT user_id, db_id FROM api_keys WHERE key = ? AND revoked = 0`,
    [key]
  );

  const row = result.rows[0] as any;
  return row?.db_id || null;
}
