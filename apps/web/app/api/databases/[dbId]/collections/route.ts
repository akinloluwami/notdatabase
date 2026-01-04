import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dbId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbId } = await params;

    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const collectionsResult = await sql`
      SELECT DISTINCT collection FROM kv_store WHERE db_id = ${dbId}
    `;
    const collections = collectionsResult.map((r) => r.collection as string);

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
