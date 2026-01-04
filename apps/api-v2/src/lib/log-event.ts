import { nanoid } from "nanoid";
import { sql } from "./db";

export async function logDbEvent({
  dbId,
  collection,
  action,
  docId,
}: {
  dbId: string;
  collection: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE";
  docId?: string;
}) {
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO db_events (id, db_id, collection, action, doc_id, created_at)
      VALUES (${nanoid()}, ${dbId}, ${collection}, ${action}, ${docId ?? null}, ${now})
    `;
  } catch (err) {
    console.error("Failed to log db event", err);
  }
}
