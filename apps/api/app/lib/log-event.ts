import { nanoid } from "nanoid";
import { turso } from "./turso";

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
    await turso.execute({
      sql: `
        INSERT INTO db_events (id, db_id, collection, action, doc_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [nanoid(), dbId, collection, action, docId ?? null, now],
    });
  } catch (err) {
    console.error("Failed to log db event", err);
  }
}
