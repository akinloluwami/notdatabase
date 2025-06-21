import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { turso } from "@/app/lib/server/turso";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dbId: string; collectionName: string }> }
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
    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sort = searchParams.get("sort");

    // Build filters
    const filters: [string, any][] = [];
    for (const [key, value] of searchParams.entries()) {
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

    const args: any[] = [dbId, collectionName];

    for (const [field, value] of filters) {
      sql += ` AND json_extract(value, ?) = ?`;
      args.push(`$.${field}`, value);
    }

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

    const { rows } = await turso.execute({ sql, args });
    const docs = rows.map((row: any) => JSON.parse(row.value));

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
