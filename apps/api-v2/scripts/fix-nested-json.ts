import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const BATCH_SIZE = 1000;

// Check if a string looks like JSON
function isJsonString(str: string): boolean {
  return (
    typeof str === "string" &&
    ((str.startsWith("{") && str.endsWith("}")) ||
      (str.startsWith("[") && str.endsWith("]")))
  );
}

// Parse nested JSON strings in a document
function parseNestedJson(doc: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  let hasChanges = false;

  for (const [key, value] of Object.entries(doc)) {
    if (isJsonString(value)) {
      try {
        result[key] = JSON.parse(value);
        hasChanges = true;
      } catch {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return hasChanges ? result : doc;
}

// Check if document has any stringified JSON fields
function hasStringifiedJsonFields(doc: Record<string, any>): boolean {
  for (const value of Object.values(doc)) {
    if (isJsonString(value)) {
      try {
        JSON.parse(value);
        return true;
      } catch {
        // Not valid JSON, ignore
      }
    }
  }
  return false;
}

async function fixNestedJson() {
  console.log("🔧 Starting to fix double-encoded JSON fields...\n");

  // Get total count
  const countResult = await sql`SELECT COUNT(*) as count FROM kv_store`;
  const totalDocs = Number(countResult[0].count);
  console.log(`📊 Total documents in kv_store: ${totalDocs}\n`);

  let offset = 0;
  let fixedCount = 0;
  let scannedCount = 0;

  while (offset < totalDocs) {
    // Fetch batch of documents
    const rows = await sql`
      SELECT id, key, db_id, collection, value 
      FROM kv_store 
      ORDER BY id 
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `;

    if (rows.length === 0) break;

    for (const row of rows) {
      scannedCount++;

      // Parse the value (it might be a string or already an object)
      let doc: Record<string, any>;
      try {
        doc = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      } catch {
        console.log(`⚠️  Skipping invalid JSON for key: ${row.key}`);
        continue;
      }

      // Check if this document has stringified JSON fields
      if (!hasStringifiedJsonFields(doc)) {
        continue;
      }

      // Parse the nested JSON
      const fixedDoc = parseNestedJson(doc);

      // Update the document
      await sql`
        UPDATE kv_store 
        SET value = ${JSON.stringify(fixedDoc)}::jsonb
        WHERE id = ${row.id}
      `;

      fixedCount++;
      console.log(`✅ Fixed: ${row.collection}/${row.key}`);
    }

    offset += BATCH_SIZE;
    console.log(
      `📈 Progress: ${Math.min(offset, totalDocs)}/${totalDocs} scanned, ${fixedCount} fixed`,
    );
  }

  console.log(
    `\n🎉 Done! Fixed ${fixedCount} documents out of ${scannedCount} scanned.`,
  );

  await sql.end();
}

fixNestedJson().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
