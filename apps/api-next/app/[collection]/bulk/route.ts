import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { turso } from "../../lib/turso";
import { logDbEvent } from "../../lib/log-event";
import { publishDbEvent } from "../../lib/publish-event";
import { getDbIdFromApiKey } from "../../lib/auth";

// POST /api/[collection]/bulk - Insert multiple documents
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const authHeader = request.headers.get("authorization");
  const dbId = await getDbIdFromApiKey(authHeader);

  if (!dbId) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { collection } = await params;
  const body = await request.json();

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "Expected an array of documents" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const insertedDocs: any[] = [];

  const sqlChunks: string[] = [];
  const args: any[] = [];

  for (const raw of body) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return NextResponse.json(
        { error: "Each document must be a valid object" },
        { status: 400 }
      );
    }

    const { unique, ...data } = raw;
    const id = raw.key ?? nanoid();

    if (Array.isArray(unique)) {
      for (const field of unique) {
        const value = data[field];
        if (typeof value === "undefined") continue;

        const { rows } = await turso.execute({
          sql: `
            SELECT id FROM kv_store
            WHERE db_id = ? AND collection = ?
            AND json_extract(value, ?) = ?
            LIMIT 1
          `,
          args: [dbId, collection, `$.${field}`, value],
        });

        if (rows.length > 0) {
          return NextResponse.json(
            { error: `Unique field violation — '${field}' already exists.` },
            { status: 409 }
          );
        }
      }
    }

    const doc = {
      ...data,
      _id: id,
      createdAt: now,
      updatedAt: now,
    };

    sqlChunks.push(`(?, ?, ?, ?, ?, ?, ?)`);
    args.push(id, dbId, collection, id, JSON.stringify(doc), now, now);
    insertedDocs.push(doc);
  }

  try {
    await turso.execute({
      sql: `
        INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
        VALUES ${sqlChunks.join(",")}
      `,
      args,
    });

    // Log bulk insert event
    await logDbEvent({
      dbId,
      collection,
      action: "CREATE",
      docId: undefined, // For bulk operations, we don't track individual doc IDs
    });

    // Publish events for each inserted document
    for (const doc of insertedDocs) {
      await publishDbEvent({
        dbId,
        collection,
        type: "insert",
        doc,
      });
    }

    return NextResponse.json(insertedDocs, { status: 201 });
  } catch (err) {
    console.error("Bulk insert failed", err);
    return NextResponse.json({ error: "Bulk insert failed" }, { status: 500 });
  }
}
