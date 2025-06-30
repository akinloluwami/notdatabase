import { turso } from "../lib/turso";

const MAX_INDEXES_PER_COLLECTION = 20;

const isSafeFieldName = (field: string) =>
  /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field);

export async function createAutoIndexIfNeeded(
  dbId: string,
  collection: string,
  field: string
) {
  if (!isSafeFieldName(field)) return;

  const safeColumnName = `${collection}_${field}`.replace(
    /[^a-zA-Z0-9_]/g,
    "_"
  );

  // 1. Bump usage count
  await turso.execute({
    sql: `
      INSERT INTO kv_index_usage (db_id, collection, field, usage_count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(db_id, collection, field)
      DO UPDATE SET usage_count = usage_count + 1;
    `,
    args: [dbId, collection, field],
  });

  // 2. Check if already indexed
  const { rows: existing } = await turso.execute({
    sql: `
      SELECT 1 FROM kv_indexed_fields
      WHERE db_id = ? AND collection = ? AND field = ? LIMIT 1;
    `,
    args: [dbId, collection, field],
  });
  if (existing.length > 0) return;

  // 3. Check how many fields are already indexed
  const { rows: countRows } = await turso.execute({
    sql: `
      SELECT COUNT(*) AS count
      FROM kv_indexed_fields
      WHERE db_id = ? AND collection = ?;
    `,
    args: [dbId, collection],
  });

  const raw = countRows?.[0]?.count;

  const currentCount =
    typeof raw === "bigint"
      ? Number(raw)
      : typeof raw === "string"
        ? parseInt(raw, 10)
        : typeof raw === "number"
          ? raw
          : 0;

  if (currentCount >= MAX_INDEXES_PER_COLLECTION) return;

  try {
    // 4. Add column + index
    await turso.execute({
      sql: `
        ALTER TABLE kv_store
        ADD COLUMN IF NOT EXISTS ${safeColumnName} TEXT
        GENERATED ALWAYS AS (json_extract(value, '$.${field}')) STORED;
      `,
    });

    await turso.execute({
      sql: `
        CREATE INDEX IF NOT EXISTS idx_${safeColumnName}
        ON kv_store(${safeColumnName});
      `,
    });

    await turso.execute({
      sql: `
        INSERT INTO kv_indexed_fields (db_id, collection, field)
        VALUES (?, ?, ?);
      `,
      args: [dbId, collection, field],
    });

    console.info(
      `✅ Auto-indexed field '${field}' for '${collection}' (db: ${dbId})`
    );
  } catch (err) {
    console.error("Auto-indexing failed::", err);
  }
}
