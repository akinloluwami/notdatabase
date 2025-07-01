import { NextRequest, NextResponse } from "next/server";
import { turso } from "../../../lib/turso";
import { logDbEvent } from "../../../lib/log-event";
import { publishDbEvent } from "../../../lib/publish-event";
import { getDbIdFromApiKey } from "../../../lib/auth";

// GET /api/[collection]/docs/[id] - Get a specific document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  const dbId = await getDbIdFromApiKey(authHeader);

  if (!dbId) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { collection, id } = await params;

  const url = new URL(request.url);
  const selectParam = url.searchParams.get("select");
  const selectedFields = selectParam?.split(",").map((f) => f.trim());

  const { rows } = await turso.execute({
    sql: `
      SELECT value FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
      LIMIT 1
    `,
    args: [dbId, collection, id],
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const rawValue = rows[0].value;
  if (typeof rawValue !== "string") {
    return NextResponse.json(
      { error: "Invalid document value" },
      { status: 500 }
    );
  }

  const doc = JSON.parse(rawValue);

  if (selectedFields && selectedFields.length > 0) {
    const selectedDoc: Record<string, any> = {};
    for (const field of selectedFields) {
      if (field in doc) {
        selectedDoc[field] = doc[field];
      }
    }

    await logDbEvent({
      dbId,
      collection,
      action: "READ",
      docId: id,
    });

    return NextResponse.json(selectedDoc);
  }

  await logDbEvent({
    dbId,
    collection,
    action: "READ",
    docId: id,
  });

  return NextResponse.json(doc);
}

// PATCH /api/[collection]/docs/[id] - Update a specific document
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  const dbId = await getDbIdFromApiKey(authHeader);

  if (!dbId) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { collection, id } = await params;
  const body = await request.json();

  const { rows } = await turso.execute({
    sql: `
      SELECT value FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
      LIMIT 1
    `,
    args: [dbId, collection, id],
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const value = rows[0].value;
  if (typeof value !== "string") {
    return NextResponse.json(
      { error: "Invalid document value" },
      { status: 500 }
    );
  }

  const existing = JSON.parse(value);

  // Handle increment/decrement operations
  const updated = { ...existing };
  let hasSpecialOp = false;
  for (const [key, val] of Object.entries(body)) {
    if (
      val &&
      typeof val === "object" &&
      (Object.prototype.hasOwnProperty.call(val, "increment") ||
        Object.prototype.hasOwnProperty.call(val, "decrement"))
    ) {
      hasSpecialOp = true;
      const current = typeof updated[key] === "number" ? updated[key] : 0;
      if (typeof (val as any).increment === "number") {
        updated[key] = current + (val as any).increment;
      } else if (typeof (val as any).decrement === "number") {
        updated[key] = current - (val as any).decrement;
      }
    } else {
      updated[key] = val;
    }
  }
  updated.updatedAt = new Date().toISOString();

  await turso.execute({
    sql: `
      UPDATE kv_store
      SET value = ?, updated_at = ?
      WHERE db_id = ? AND collection = ? AND key = ?
    `,
    args: [JSON.stringify(updated), updated.updatedAt, dbId, collection, id],
  });

  await logDbEvent({
    dbId,
    collection,
    action: "UPDATE",
    docId: id,
  });

  await publishDbEvent({
    dbId,
    collection,
    type: "update",
    doc: updated,
  });

  return NextResponse.json(updated);
}

// DELETE /api/[collection]/docs/[id] - Delete a specific document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  const dbId = await getDbIdFromApiKey(authHeader);

  if (!dbId) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { collection, id } = await params;

  // Get the document before deleting it for the event
  const { rows } = await turso.execute({
    sql: `
      SELECT value FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
      LIMIT 1
    `,
    args: [dbId, collection, id],
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const value = rows[0].value;
  let deletedDoc = null;
  if (typeof value === "string") {
    deletedDoc = JSON.parse(value);
  }

  const { rowsAffected } = await turso.execute({
    sql: `
      DELETE FROM kv_store
      WHERE db_id = ? AND collection = ? AND key = ?
    `,
    args: [dbId, collection, id],
  });

  if (rowsAffected === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await logDbEvent({
    dbId,
    collection,
    action: "DELETE",
    docId: id,
  });

  await publishDbEvent({
    dbId,
    collection,
    type: "delete",
    doc: deletedDoc,
  });

  return NextResponse.json({ message: "Document deleted" });
}
