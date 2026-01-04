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
    const { searchParams } = new URL(req.url);
    const timeFrame = searchParams.get("timeFrame") || "24h";

    // Check if user owns the database
    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Calculate time range based on timeFrame
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    switch (timeFrame) {
      case "3d":
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        groupByFormat = "YYYY-MM-DD";
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupByFormat = "YYYY-MM-DD";
        break;
      default: // 24h
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupByFormat = "YYYY-MM-DD HH24:00:00";
        break;
    }

    const startDateStr = startDate.toISOString();

    // Get total events count
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM db_events WHERE db_id = ${dbId} AND created_at >= ${startDateStr}
    `;
    const total = Number(totalResult[0].total);

    // Get events by action type
    const actionResult = await sql`
      SELECT action, COUNT(*) as count 
      FROM db_events 
      WHERE db_id = ${dbId} AND created_at >= ${startDateStr}
      GROUP BY action
    `;

    const actionCounts = {
      CREATE: 0,
      READ: 0,
      UPDATE: 0,
      DELETE: 0,
    };

    actionResult.forEach((row) => {
      const action = row.action as string;
      const count = Number(row.count);
      if (action in actionCounts) {
        actionCounts[action as keyof typeof actionCounts] = count;
      }
    });

    // Get timeseries data using PostgreSQL date formatting
    const timeseriesResult = await sql.unsafe(
      `
      SELECT 
        TO_CHAR(created_at, '${groupByFormat}') as time_bucket,
        action,
        COUNT(*) as count
      FROM db_events 
      WHERE db_id = $1 AND created_at >= $2
      GROUP BY TO_CHAR(created_at, '${groupByFormat}'), action
      ORDER BY time_bucket ASC
    `,
      [dbId, startDateStr],
    );

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

    timeseriesResult.forEach((row) => {
      const timeBucket = row.time_bucket as string;
      const action = row.action as string;
      const count = Number(row.count);

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
        (timeseries[timeBucket] as Record<string, unknown>)[action] = count;
      }
    });

    // Convert to array and fill missing time buckets
    const timeseriesArray = Object.values(timeseries).sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
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
      { status: 500 },
    );
  }
}
