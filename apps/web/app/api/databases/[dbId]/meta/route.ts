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

    // Query the database meta
    const dbResult = await turso.execute({
      sql: `SELECT id, name, created_at FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const dbRow = dbResult.rows[0];
    const database = dbRow
      ? {
          id: dbRow["id"] as string,
          name: dbRow["name"] as string,
          createdAt: dbRow["created_at"] as string,
        }
      : undefined;

    if (!database) {
      return NextResponse.json(
        { error: "Database not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: database.id,
      name: database.name,
      createdAt: database.createdAt,
    });
  } catch (error) {
    console.error("Error fetching database meta:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
