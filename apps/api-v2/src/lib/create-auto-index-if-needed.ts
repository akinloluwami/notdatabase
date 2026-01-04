import { sql } from "./db";

const MAX_INDEXES_PER_COLLECTION = 20;

const isSafeFieldName = (field: string) =>
  /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field);

export async function createAutoIndexIfNeeded(
  dbId: string,
  collection: string,
  field: string,
) {
  if (!isSafeFieldName(field)) return;

  // 1. Bump usage count
  await sql`
    INSERT INTO kv_index_usage (db_id, collection, field, usage_count)
    VALUES (${dbId}, ${collection}, ${field}, 1)
    ON CONFLICT(db_id, collection, field)
    DO UPDATE SET usage_count = kv_index_usage.usage_count + 1
  `;

  // 2. Check if already indexed
  const existing = await sql`
    SELECT 1 FROM kv_indexed_fields
    WHERE db_id = ${dbId} AND collection = ${collection} AND field = ${field} LIMIT 1
  `;
  if (existing.length > 0) return;

  // 3. Check how many fields are already indexed
  const countRows = await sql`
    SELECT COUNT(*) AS count
    FROM kv_indexed_fields
    WHERE db_id = ${dbId} AND collection = ${collection}
  `;

  const currentCount = Number(countRows[0]?.count ?? 0);

  if (currentCount >= MAX_INDEXES_PER_COLLECTION) return;

  try {
    // 4. Record the indexed field (PostgreSQL doesn't support generated columns the same way)
    await sql`
      INSERT INTO kv_indexed_fields (db_id, collection, field)
      VALUES (${dbId}, ${collection}, ${field})
    `;

    console.info(
      `✅ Recorded indexed field '${field}' for '${collection}' (db: ${dbId})`,
    );
  } catch (err) {
    console.error("Auto-indexing failed::", err);
  }
}
