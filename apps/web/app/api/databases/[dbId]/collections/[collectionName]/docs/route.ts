import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dbId: string; collectionName: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbId, collectionName } = await params;

    // Check if user owns the database
    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sort = searchParams.get("sort");

    // Build filters
    const filters: [string, unknown][] = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("filter[")) {
        const field = key.slice(7, -1);
        let parsed: unknown = value;

        if (value === "true") parsed = true;
        else if (value === "false") parsed = false;
        else if (!isNaN(Number(value))) parsed = Number(value);

        filters.push([field, parsed]);
      }
    }

    // Build dynamic query with PostgreSQL JSONB operators
    let query = sql`
      SELECT key, value
      FROM kv_store
      WHERE db_id = ${dbId} AND collection = ${collectionName}
    `;

    // For filters, we need to use raw SQL since we have dynamic conditions
    if (filters.length > 0 || sort) {
      // Use unsafe for dynamic query building
      let queryStr = `
        SELECT key, value
        FROM kv_store
        WHERE db_id = $1 AND collection = $2
      `;
      const args: (string | number)[] = [dbId, collectionName];
      let argIndex = 3;

      for (const [field, value] of filters) {
        queryStr += ` AND value->>'${field}' = $${argIndex}`;
        args.push(String(value));
        argIndex++;
      }

      if (sort) {
        const desc = sort.startsWith("-");
        const field = desc ? sort.slice(1) : sort;
        queryStr += ` ORDER BY value->>'${field}' ${desc ? "DESC" : "ASC"}`;
      } else {
        queryStr += ` ORDER BY created_at DESC`;
      }

      queryStr += ` LIMIT $${argIndex} OFFSET $${argIndex + 1}`;
      args.push(limit, offset);

      const rows = await sql.unsafe(queryStr, args);
      const docs = rows.map(
        (row) => (row as unknown as { value: unknown }).value,
      );
      return NextResponse.json(docs);
    }

    // Simple query without filters
    const rows = await sql`
      SELECT key, value
      FROM kv_store
      WHERE db_id = ${dbId} AND collection = ${collectionName}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const docs = rows.map((row) => row.value);

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
