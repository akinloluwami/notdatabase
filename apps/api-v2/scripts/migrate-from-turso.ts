import "dotenv/config";
import { createClient } from "@libsql/client";
import postgres from "postgres";

// Turso connection
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// PostgreSQL connection
const sql = postgres(process.env.DATABASE_URL!);

const BATCH_SIZE = 500;

// Helper function to safely get value or null
function safeValue<T>(val: unknown, defaultVal: T | null = null): T | null {
  return val === undefined ? defaultVal : (val as T);
}

async function getTursoSchema() {
  // Get all tables in Turso
  const { rows } = await turso.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",
  );
  return rows;
}

async function truncateTables() {
  console.log("🗑️  Truncating all tables...");
  await sql`TRUNCATE TABLE kv_indexed_fields, kv_index_usage, db_events, collection_schema, kv_store, api_keys, databases, verification, account, session, "user" CASCADE`;
  console.log("✅ All tables truncated\n");
}

async function createPostgresTables() {
  console.log("Creating PostgreSQL tables...");

  // Create user table (better-auth)
  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `;

  // Create session table (better-auth)
  await sql`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT NOT NULL PRIMARY KEY,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS session_userId_idx ON session ("userId")
  `;

  // Create account table (better-auth)
  await sql`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT NOT NULL PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMPTZ,
      "refreshTokenExpiresAt" TIMESTAMPTZ,
      scope TEXT,
      password TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS account_userId_idx ON account ("userId")
  `;

  // Create verification table (better-auth)
  await sql`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT NOT NULL PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification (identifier)
  `;

  // Create databases table
  await sql`
    CREATE TABLE IF NOT EXISTS databases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      db_id TEXT NOT NULL REFERENCES databases(id),
      key TEXT NOT NULL UNIQUE,
      name TEXT,
      revoked INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kv_store (
      id TEXT PRIMARY KEY,
      db_id TEXT NOT NULL,
      collection TEXT NOT NULL,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(db_id, collection, key)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_kv_store_db_collection ON kv_store(db_id, collection)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS collection_schema (
      id SERIAL PRIMARY KEY,
      db_id TEXT NOT NULL,
      collection TEXT NOT NULL,
      schema JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(db_id, collection)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS db_events (
      id TEXT PRIMARY KEY,
      db_id TEXT NOT NULL,
      collection TEXT NOT NULL,
      action TEXT NOT NULL,
      doc_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_db_events_db_id ON db_events(db_id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kv_index_usage (
      id SERIAL PRIMARY KEY,
      db_id TEXT NOT NULL,
      collection TEXT NOT NULL,
      field TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      UNIQUE(db_id, collection, field)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kv_indexed_fields (
      id SERIAL PRIMARY KEY,
      db_id TEXT NOT NULL,
      collection TEXT NOT NULL,
      field TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(db_id, collection, field)
    )
  `;

  console.log("✅ PostgreSQL tables created");
}

async function migrateData() {
  console.log("\n📦 Starting data migration...\n");

  // Migrate user table (better-auth)
  console.log("Migrating user...");
  try {
    const { rows } = await turso.execute("SELECT * FROM user");
    console.log(`  Found ${rows.length} users`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await sql`
        INSERT INTO "user" ${sql(
          batch.map((row) => ({
            id: row.id as string,
            name: row.name as string,
            email: row.email as string,
            emailVerified: Boolean(row.emailVerified),
            image: safeValue<string>(row.image),
            createdAt: row.createdAt as string,
            updatedAt: row.updatedAt as string,
          })),
        )}
      `;
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ user migrated");
  } catch (err) {
    console.log("  ⚠️ user:", (err as Error).message);
  }

  // Migrate session table (better-auth)
  console.log("Migrating session...");
  try {
    const { rows } = await turso.execute("SELECT * FROM session");
    console.log(`  Found ${rows.length} sessions`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await sql`
        INSERT INTO session ${sql(
          batch.map((row) => ({
            id: row.id as string,
            expiresAt: row.expiresAt as string,
            token: row.token as string,
            createdAt: row.createdAt as string,
            updatedAt: row.updatedAt as string,
            ipAddress: safeValue<string>(row.ipAddress),
            userAgent: safeValue<string>(row.userAgent),
            userId: row.userId as string,
          })),
        )}
      `;
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ session migrated");
  } catch (err) {
    console.log("  ⚠️ session:", (err as Error).message);
  }

  // Migrate account table (better-auth)
  console.log("Migrating account...");
  try {
    const { rows } = await turso.execute("SELECT * FROM account");
    console.log(`  Found ${rows.length} accounts`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await sql`
        INSERT INTO account ${sql(
          batch.map((row) => ({
            id: row.id as string,
            accountId: row.accountId as string,
            providerId: row.providerId as string,
            userId: row.userId as string,
            accessToken: safeValue<string>(row.accessToken),
            refreshToken: safeValue<string>(row.refreshToken),
            idToken: safeValue<string>(row.idToken),
            accessTokenExpiresAt: safeValue<string>(row.accessTokenExpiresAt),
            refreshTokenExpiresAt: safeValue<string>(row.refreshTokenExpiresAt),
            scope: safeValue<string>(row.scope),
            password: safeValue<string>(row.password),
            createdAt: row.createdAt as string,
            updatedAt: row.updatedAt as string,
          })),
        )}
      `;
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ account migrated");
  } catch (err) {
    console.log("  ⚠️ account:", (err as Error).message);
  }

  // Migrate verification table (better-auth)
  console.log("Migrating verification...");
  try {
    const { rows } = await turso.execute("SELECT * FROM verification");
    console.log(`  Found ${rows.length} verifications`);
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        await sql`
          INSERT INTO verification ${sql(
            batch.map((row) => ({
              id: row.id as string,
              identifier: row.identifier as string,
              value: row.value as string,
              expiresAt: row.expiresAt as string,
              createdAt: row.createdAt as string,
              updatedAt: row.updatedAt as string,
            })),
          )}
        `;
        console.log(
          `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
        );
      }
    }
    console.log("  ✅ verification migrated");
  } catch (err) {
    console.log("  ⚠️ verification:", (err as Error).message);
  }

  // Migrate databases table
  console.log("Migrating databases...");
  try {
    const { rows } = await turso.execute("SELECT * FROM databases");
    console.log(`  Found ${rows.length} databases`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      for (const row of batch) {
        const id = row.id ?? "";
        const userId = row.user_id ?? "";
        const name = row.name ?? "";
        const deletedAt = row.deleted_at ?? null;
        const createdAt = row.created_at ?? new Date().toISOString();
        const updatedAt = row.updated_at ?? createdAt;
        await sql`
          INSERT INTO databases (id, user_id, name, deleted_at, created_at, updated_at)
          VALUES (
            ${id as string},
            ${userId as string},
            ${name as string},
            ${deletedAt as string | null},
            ${createdAt as string},
            ${updatedAt as string}
          )
        `;
      }
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ databases migrated");
  } catch (err) {
    console.log("  ⚠️ databases:", (err as Error).message);
  }

  // Migrate api_keys table
  console.log("Migrating api_keys...");
  try {
    const { rows } = await turso.execute("SELECT * FROM api_keys");
    console.log(`  Found ${rows.length} api_keys`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      for (const row of batch) {
        const id = row.id ?? "";
        const userId = row.user_id ?? "";
        const dbId = row.db_id ?? "";
        const key = row.key ?? "";
        const name = row.name ?? null;
        const revoked = (row.revoked as number) ?? 0;
        const createdAt = row.created_at ?? new Date().toISOString();
        const updatedAt = row.updated_at ?? createdAt;
        await sql`
          INSERT INTO api_keys (id, user_id, db_id, key, name, revoked, created_at, updated_at)
          VALUES (
            ${id as string},
            ${userId as string},
            ${dbId as string},
            ${key as string},
            ${name as string | null},
            ${revoked},
            ${createdAt as string},
            ${updatedAt as string}
          )
        `;
      }
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ api_keys migrated");
  } catch (err) {
    console.log("  ⚠️ api_keys:", (err as Error).message);
  }

  // Migrate kv_store table
  console.log("Migrating kv_store...");
  try {
    const { rows } = await turso.execute(
      "SELECT id, db_id, collection, key, value, created_at, updated_at FROM kv_store",
    );
    console.log(`  Found ${rows.length} kv_store entries`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      for (const row of batch) {
        const updatedAt =
          row.updated_at !== undefined ? row.updated_at : row.created_at;
        await sql`
          INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
          VALUES (
            ${row.id as string},
            ${row.db_id as string},
            ${row.collection as string},
            ${row.key as string},
            ${row.value as string}::jsonb,
            ${row.created_at as string},
            ${updatedAt as string}
          )
        `;
      }
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ kv_store migrated");
  } catch (err) {
    console.log("  ⚠️ kv_store:", (err as Error).message);
  }

  // Migrate collection_schema table
  console.log("Migrating collection_schema...");
  try {
    const { rows } = await turso.execute("SELECT * FROM collection_schema");
    console.log(`  Found ${rows.length} collection_schema entries`);
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        for (const row of batch) {
          await sql`
            INSERT INTO collection_schema (db_id, collection, schema, created_at)
            VALUES (
              ${row.db_id as string},
              ${row.collection as string},
              ${row.schema as string}::jsonb,
              ${safeValue<string>(row.created_at) || new Date().toISOString()}
            )
          `;
        }
        console.log(
          `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
        );
      }
    }
    console.log("  ✅ collection_schema migrated");
  } catch (err) {
    console.log("  ⚠️ collection_schema:", (err as Error).message);
  }

  // Migrate db_events table
  console.log("Migrating db_events...");
  try {
    const { rows } = await turso.execute("SELECT * FROM db_events");
    console.log(`  Found ${rows.length} db_events entries`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await sql`
        INSERT INTO db_events ${sql(
          batch.map((row) => ({
            id: row.id as string,
            db_id: row.db_id as string,
            collection: row.collection as string,
            action: row.action as string,
            doc_id: safeValue<string>(row.doc_id),
            created_at: row.created_at as string,
          })),
        )}
      `;
      console.log(
        `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
      );
    }
    console.log("  ✅ db_events migrated");
  } catch (err) {
    console.log("  ⚠️ db_events:", (err as Error).message);
  }

  // Migrate kv_index_usage table
  console.log("Migrating kv_index_usage...");
  try {
    const { rows } = await turso.execute("SELECT * FROM kv_index_usage");
    console.log(`  Found ${rows.length} kv_index_usage entries`);
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        for (const row of batch) {
          await sql`
            INSERT INTO kv_index_usage (db_id, collection, field, usage_count)
            VALUES (
              ${row.db_id as string},
              ${row.collection as string},
              ${row.field as string},
              ${(row.usage_count as number) || 0}
            )
          `;
        }
        console.log(
          `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
        );
      }
    }
    console.log("  ✅ kv_index_usage migrated");
  } catch (err) {
    console.log("  ⚠️ kv_index_usage:", (err as Error).message);
  }

  // Migrate kv_indexed_fields table
  console.log("Migrating kv_indexed_fields...");
  try {
    const { rows } = await turso.execute("SELECT * FROM kv_indexed_fields");
    console.log(`  Found ${rows.length} kv_indexed_fields entries`);
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        for (const row of batch) {
          await sql`
            INSERT INTO kv_indexed_fields (db_id, collection, field, created_at)
            VALUES (
              ${row.db_id as string},
              ${row.collection as string},
              ${row.field as string},
              ${safeValue<string>(row.created_at) || new Date().toISOString()}
            )
          `;
        }
        console.log(
          `    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`,
        );
      }
    }
    console.log("  ✅ kv_indexed_fields migrated");
  } catch (err) {
    console.log("  ⚠️ kv_indexed_fields:", (err as Error).message);
  }
}

async function main() {
  console.log("🚀 Starting migration from Turso to PostgreSQL\n");

  // First, let's see what tables exist in Turso
  console.log("📋 Checking Turso schema...");
  const tables = await getTursoSchema();
  console.log("Tables found in Turso:");
  for (const table of tables) {
    console.log(`  - ${table.name}`);
  }
  console.log("");

  // Create PostgreSQL tables
  await createPostgresTables();

  // Truncate all tables first
  await truncateTables();

  // Migrate data
  await migrateData();

  console.log("\n✅ Migration complete!");

  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
