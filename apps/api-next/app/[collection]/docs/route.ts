import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { turso } from "../../lib/turso";
import { validateAgainstSchema } from "../../lib/schema";
import { logDbEvent } from "../../lib/log-event";
import { getDbIdFromApiKey } from "../../lib/auth";

// GET /api/[collection]/docs - Get documents from collection
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

  const limit = parseInt(query.get("limit") || "50");
  const offset = parseInt(query.get("offset") || "0");

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
    SELECT key, value
    FROM kv_store
    WHERE db_id = ? AND collection = ?
  `;

  const args: any[] = [dbId, collection];

  for (const [field, value] of filters) {
    sql += ` AND json_extract(value, ?) = ?`;
    args.push(`$.${field}`, value);
  }

  const sort = query.get("sort");
  if (sort) {
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    sql += ` ORDER BY json_extract(value, ?) ${desc ? "DESC" : "ASC"}`;
    args.push(`$.${field}`);
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  args.push(limit, offset);

  try {
    const { rows } = await turso.execute({ sql, args });
    const docs = rows.map((row: any) => JSON.parse(row.value));

    await logDbEvent({
      dbId,
      collection,
      action: "READ",
      docId: undefined,
    });

    return NextResponse.json(docs);
  } catch (err) {
    console.error("Failed to fetch docs", err);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/[collection] - Create a new document
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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { unique, ...data } = body;

  // Schema validation
  const { rows: schemaRows } = await turso.execute({
    sql: `SELECT schema FROM collection_schema WHERE db_id = ? AND collection = ? LIMIT 1`,
    args: [dbId, collection],
  });

  if (schemaRows.length > 0) {
    let schema;
    const schemaValue = schemaRows[0].schema;
    if (typeof schemaValue !== "string") {
      return NextResponse.json(
        { error: "Collection schema is not valid JSON" },
        { status: 500 }
      );
    }
    try {
      schema = JSON.parse(schemaValue);
    } catch {
      return NextResponse.json(
        { error: "Collection schema is not valid JSON" },
        { status: 500 }
      );
    }

    const err = validateAgainstSchema(data, schema);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  const now = new Date().toISOString();
  const key = body.key ?? nanoid();

  const doc = {
    ...data,
    _id: key,
    createdAt: now,
    updatedAt: now,
  };

  // Unique field constraint check
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
          {
            error: `Unique field violation — '${field}' already exists in this collection.`,
          },
          { status: 409 }
        );
      }
    }
  }

  // Save to kv_store
  try {
    await turso.execute({
      sql: `
        INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [key, dbId, collection, key, JSON.stringify(doc), now, now],
    });

    await logDbEvent({
      dbId,
      collection,
      action: "CREATE",
      docId: key,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err: any) {
    console.error("Insert failed", err);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}
