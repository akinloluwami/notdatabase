import { NextRequest, NextResponse } from "next/server";
import { turso } from "../../lib/turso";
import { logDbEvent } from "../../lib/log-event";
import { getDbIdFromApiKey } from "../../lib/auth";

// POST /api/[collection]/schema - Save collection schema
export async function POST(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  const authHeader = request.headers.get("authorization");
  const dbId = await getDbIdFromApiKey(authHeader);

  if (!dbId) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const collection = params.collection;
  const schema = await request.json();

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return NextResponse.json(
      { error: "Schema must be a JSON object" },
      { status: 400 }
    );
  }

  await turso.execute({
    sql: `
      INSERT INTO collection_schema (db_id, collection, schema)
      VALUES (?, ?, ?)
      ON CONFLICT(db_id, collection) DO UPDATE SET schema = excluded.schema
    `,
    args: [dbId, collection, JSON.stringify(schema)],
  });

  await logDbEvent({
    dbId,
    collection,
    action: "UPDATE",
    docId: undefined,
  });

  return NextResponse.json({ message: "Schema saved." });
}
