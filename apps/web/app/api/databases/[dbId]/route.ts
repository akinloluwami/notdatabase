import { auth } from "@/app/lib/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/app/lib/server/db";

export async function DELETE(
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
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id} AND deleted_at IS NULL
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await sql`
      UPDATE databases SET deleted_at = ${new Date().toISOString()} WHERE id = ${dbId}
    `;

    return NextResponse.json({ message: "Database deleted successfully" });
  } catch (error) {
    console.error("Error deleting database:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
