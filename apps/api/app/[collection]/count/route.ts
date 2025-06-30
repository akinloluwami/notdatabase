import { NextRequest, NextResponse } from "next/server";
import { turso } from "../../lib/turso";
import { logDbEvent } from "../../lib/log-event";
import { getDbIdFromApiKey } from "../../lib/auth";
import { createAutoIndexIfNeeded } from "../../lib/create-auto-index-if-needed";

// GET /api/[collection]/count - Count documents in collection
export async function GET(
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
  const url = new URL(request.url);
  const query = url.searchParams;

  const filters: [string, any][] = [];

  for (const [key, value] of query.entries()) {
    if (key.startsWith("filter[")) {
      const field = key.slice(7, -1);
      let parsed: any = value;

      if (value === "true") parsed = true;
      else if (value === "false") parsed = false;
      else if (!isNaN(Number(value))) parsed = Number(value);

      filters.push([field, parsed]);
    }
  }

  let sql = `
    SELECT COUNT(*) as count
    FROM kv_store
    WHERE db_id = ? AND collection = ?
  `;

  const args: any[] = [dbId, collection];

  for (const [field, value] of filters) {
    sql += ` AND json_extract(value, ?) = ?`;
    args.push(`$.${field}`, value);

    // Trigger auto-indexing for filtered fields
    await createAutoIndexIfNeeded(dbId, collection, field);
  }

  try {
    const { rows } = await turso.execute({ sql, args });

    await logDbEvent({
      dbId,
      collection,
      action: "READ",
      docId: undefined,
    });

    return NextResponse.json({ count: rows[0].count });
  } catch (err) {
    console.error("Failed to count docs with filters", err);
    return NextResponse.json(
      { error: "Failed to count documents" },
      { status: 500 }
    );
  }
}
