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
      SELECT COUNT(*) as count
      FROM kv_store
      WHERE db_id = ? AND collection = ?
    `;

    const args: any[] = [dbId, collectionName];

    for (const [field, value] of filters) {
      sql += ` AND json_extract(value, ?) = ?`;
      args.push(`$.${field}`, value);
    }

    const { rows } = await turso.execute({ sql, args });
    return NextResponse.json({ count: rows[0].count });
  } catch (error) {
    console.error("Error fetching count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
