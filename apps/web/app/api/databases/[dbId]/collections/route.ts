import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { turso } from "@/app/lib/server/turso";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dbId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbId } = await params;

    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const collectionsResult = await turso.execute({
      sql: `SELECT DISTINCT collection FROM kv_store WHERE db_id = ?`,
      args: [dbId],
    });
    const collections = collectionsResult.rows.map(
      (r) => r["collection"] as string
    );

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
