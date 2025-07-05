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

  const filters: { field: string; op: string; value: any }[] = [];
  const typeHints: Record<string, string> = {};

  // Parse type hints
  for (const [key, value] of query.entries()) {
    if (key.startsWith("type[")) {
      const match = key.match(/^type\[([^\]]+)\]$/);
      if (match) {
        const field = match[1];
        typeHints[field] = value;
      }
    }
  }

  // Parse filters
  for (const [key, value] of query.entries()) {
    if (key.startsWith("filter[")) {
      const match = key.match(/^filter\[([^\]]+)\](?:\[([^\]]+)\])?$/);
      if (!match) continue;

      const field = match[1];
      const op = match[2] || "eq";

      let parsed: any = value;

      const hint = typeHints[field];

      if (hint === "boolean") {
        parsed = value === "true";
      } else if (hint === "number") {
        parsed = Number(value);
      } else if (!hint) {
        // No hint: fallback to naive parse
        if (value === "true") parsed = true;
        else if (value === "false") parsed = false;
        else if (!isNaN(Number(value))) parsed = Number(value);
      }

      filters.push({ field, op, value: parsed });
    }
  }

  const args: any[] = [dbId, collection];
  const filterClauses: string[] = [];

  for (const { field, op, value } of filters) {
    let sqlOp = "=";
    if (op === "gt") sqlOp = ">";
    else if (op === "lt") sqlOp = "<";
    else if (op === "gte") sqlOp = ">=";
    else if (op === "lte") sqlOp = "<=";

    filterClauses.push(`json_extract(value, ?) ${sqlOp} ?`);
    args.push(`$.${field}`, value);

    await createAutoIndexIfNeeded(dbId, collection, field);
  }

  let sql = `
    SELECT COUNT(*) as count
    FROM kv_store
    WHERE db_id = ? AND collection = ?
  `;

  if (filterClauses.length > 0) {
    sql += " AND " + filterClauses.join(" AND ");
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
