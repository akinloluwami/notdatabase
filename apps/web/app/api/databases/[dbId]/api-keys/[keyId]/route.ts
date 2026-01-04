import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ dbId: string; keyId: string }> },
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
    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if the API key exists and belongs to this database
    const key = await sql`
      SELECT 1 FROM api_keys WHERE id = ${keyId} AND db_id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (key.length === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Revoke the API key (soft delete)
    await sql`
      UPDATE api_keys SET revoked = 1 WHERE id = ${keyId}
    `;

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
