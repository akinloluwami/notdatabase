import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { turso } from "@/app/lib/server/turso";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ dbId: string; keyId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dbId, keyId } = await params;

    // Check if user owns the database
    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if the API key exists and belongs to this database
    const keyResult = await turso.execute({
      sql: `SELECT 1 FROM api_keys WHERE id = ? AND db_id = ? AND user_id = ?`,
      args: [keyId, dbId, session.user.id],
    });
    const key = keyResult.rows[0];

    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Revoke the API key (soft delete)
    await turso.execute({
      sql: `UPDATE api_keys SET revoked = 1 WHERE id = ?`,
      args: [keyId],
    });

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
