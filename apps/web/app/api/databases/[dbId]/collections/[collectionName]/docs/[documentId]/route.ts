import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";
import { logDbEvent } from "@/app/lib/server/log-event";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      dbId: string;
      collectionName: string;
      documentId: string;
    }>;
  },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbId, collectionName, documentId } = await params;

    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rows = await sql`
      SELECT key, value FROM kv_store
      WHERE db_id = ${dbId} AND collection = ${collectionName} AND key = ${documentId}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const existingDoc =
      typeof rows[0].value === "string"
        ? JSON.parse(rows[0].value)
        : rows[0].value;

    const now = new Date().toISOString();
    const updatedDoc = {
      ...existingDoc,
      ...body,
      _id: documentId,
      createdAt: existingDoc.createdAt,
      updatedAt: now,
    };

    await sql`
      UPDATE kv_store
      SET value = ${JSON.stringify(updatedDoc)}, updated_at = ${now}
      WHERE db_id = ${dbId} AND collection = ${collectionName} AND key = ${documentId}
    `;

    await logDbEvent({ dbId, collection: collectionName, action: "UPDATE", docId: documentId });

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      dbId: string;
      collectionName: string;
      documentId: string;
    }>;
  },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbId, collectionName, documentId } = await params;

    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await sql`
      DELETE FROM kv_store
      WHERE db_id = ${dbId} AND collection = ${collectionName} AND key = ${documentId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    await logDbEvent({ dbId, collection: collectionName, action: "DELETE", docId: documentId });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
