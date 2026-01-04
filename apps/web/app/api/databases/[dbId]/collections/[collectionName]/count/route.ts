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

    if (filters.length > 0) {
      // Use unsafe for dynamic query building
      let queryStr = `
        SELECT COUNT(*) as count
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

      const rows = await sql.unsafe(queryStr, args as (string | number)[]);
      return NextResponse.json({
        count: Number((rows[0] as unknown as { count: number }).count),
      });
    }

    // Simple query without filters
    const rows = await sql`
      SELECT COUNT(*) as count
      FROM kv_store
      WHERE db_id = ${dbId} AND collection = ${collectionName}
    `;

    return NextResponse.json({ count: Number(rows[0].count) });
  } catch (error) {
    console.error("Error fetching count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
