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

    // Check if user owns the database
    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete all data associated with the database
    // This includes API keys, collections, and documents
    await turso.execute({
      sql: `DELETE FROM api_keys WHERE db_id = ?`,
      args: [dbId],
    });

    await turso.execute({
      sql: `DELETE FROM kv_store WHERE db_id = ?`,
      args: [dbId],
    });

    await turso.execute({
      sql: `DELETE FROM collection_schema WHERE db_id = ?`,
      args: [dbId],
    });

    // Finally, delete the database itself
    await turso.execute({
      sql: `DELETE FROM databases WHERE id = ?`,
      args: [dbId],
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
