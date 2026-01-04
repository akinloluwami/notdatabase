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

    const rows = await sql`
      SELECT id, name, created_at FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Database not found" },
        { status: 404 },
      );
    }

    const dbRow = rows[0];

    return NextResponse.json({
      id: dbRow.id as string,
      name: dbRow.name as string,
      createdAt: dbRow.created_at as string,
    });
  } catch (error) {
    console.error("Error fetching database meta:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
