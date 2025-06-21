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
    const { searchParams } = new URL(req.url);
    const timeFrame = searchParams.get("timeFrame") || "24h";

    // Check if user owns the database
    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Calculate time range based on timeFrame
    const now = new Date();
    let startDate: Date;
    let groupBy: string;
    let dateFormat: string;

    switch (timeFrame) {
      case "3d":
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        groupBy = "DATE(created_at)";
        dateFormat = "%Y-%m-%d";
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "DATE(created_at)";
        dateFormat = "%Y-%m-%d";
        break;
      default: // 24h
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = "strftime('%Y-%m-%d %H:00:00', created_at)";
        dateFormat = "%Y-%m-%d %H:00:00";
        break;
    }

    const startDateStr = startDate.toISOString();

    // Get total events count
    const totalResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM db_events WHERE db_id = ? AND created_at >= ?`,
      args: [dbId, startDateStr],
    });
    const total = totalResult.rows[0].total as number;

    // Get events by action type
    const actionResult = await turso.execute({
      sql: `
        SELECT action, COUNT(*) as count 
        FROM db_events 
        WHERE db_id = ? AND created_at >= ?
        GROUP BY action
      `,
      args: [dbId, startDateStr],
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

    // Get timeseries data
    const timeseriesResult = await turso.execute({
      sql: `
        SELECT 
          ${groupBy} as time_bucket,
          action,
          COUNT(*) as count
        FROM db_events 
        WHERE db_id = ? AND created_at >= ?
        GROUP BY ${groupBy}, action
        ORDER BY time_bucket ASC
      `,
      args: [dbId, startDateStr],
    });

    // Process timeseries data
    const timeseries: Record<
      string,
      {
        time: string;
        CREATE: number;
        READ: number;
        UPDATE: number;
        DELETE: number;
      }
    > = {};

    timeseriesResult.rows.forEach((row: any) => {
      const timeBucket = row.time_bucket as string;
      const action = row.action as string;
      const count = row.count as number;

      if (!timeseries[timeBucket]) {
        timeseries[timeBucket] = {
          time: timeBucket,
          CREATE: 0,
          READ: 0,
          UPDATE: 0,
          DELETE: 0,
        };
      }

      if (action in timeseries[timeBucket]) {
        (timeseries[timeBucket] as any)[action] = count;
      }
    });

    // Convert to array and fill missing time buckets
    const timeseriesArray = Object.values(timeseries).sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return NextResponse.json({
      total,
      byAction: actionCounts,
      timeseries: timeseriesArray,
      timeFrame,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
