import { auth } from "@/app/lib/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/app/lib/server/turso";

export async function DELETE(
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
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ? AND deleted_at IS NULL`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await turso.execute({
      sql: `UPDATE databases SET deleted_at = ? WHERE id = ?`,
      args: [new Date().toISOString(), dbId],
    });

    return NextResponse.json({ message: "Database deleted successfully" });
  } catch (error) {
    console.error("Error deleting database:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
