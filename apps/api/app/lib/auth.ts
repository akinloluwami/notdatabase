import { turso } from "./turso";

export async function getDbIdFromApiKey(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const key = authHeader.replace("Bearer ", "").trim();

  const result = await turso.execute({
    sql: `
      SELECT T1.user_id, T1.db_id
      FROM api_keys AS T1
      INNER JOIN databases AS T2 ON T1.db_id = T2.id
      WHERE T1.key = ? AND T1.revoked = 0 AND T2.deleted_at IS NULL
    `,
    args: [key],
  });

  const row = result.rows[0] as any;
  return row?.db_id || null;
}
