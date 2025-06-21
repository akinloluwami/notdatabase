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

    // Check if user owns the database
    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get total events count
    const totalResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM db_events WHERE db_id = ?`,
      args: [dbId],
    });
    const total = totalResult.rows[0].total as number;

    // Get events by action type
    const actionResult = await turso.execute({
      sql: `
        SELECT action, COUNT(*) as count 
        FROM db_events 
        WHERE db_id = ? 
        GROUP BY action
      `,
      args: [dbId],
    });

    const actionCounts = {
      CREATE: 0,
      READ: 0,
      UPDATE: 0,
      DELETE: 0,
    };

    actionResult.rows.forEach((row: any) => {
      const action = row.action as string;
      const count = row.count as number;
      if (action in actionCounts) {
        actionCounts[action as keyof typeof actionCounts] = count;
      }
    });

    return NextResponse.json({
      total,
      byAction: actionCounts,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
