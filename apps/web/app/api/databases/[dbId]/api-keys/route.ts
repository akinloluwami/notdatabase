import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { turso } from "@/app/lib/server/turso";
import { nanoid } from "nanoid";

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

    // Fetch API keys
    const keysResult = await turso.execute({
      sql: `SELECT id, key, name, created_at, revoked FROM api_keys WHERE db_id = ? AND user_id = ? ORDER BY created_at DESC`,
      args: [dbId, session.user.id],
    });

    const keys = keysResult.rows.map((row) => ({
      id: row["id"] as string,
      key: row["key"] as string,
      name: row["name"] as string,
      createdAt: row["created_at"] as string,
      revoked: Boolean(row["revoked"]),
    }));

    return NextResponse.json(keys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      );
    }

    // Check if user owns the database
    const ownedResult = await turso.execute({
      sql: `SELECT 1 FROM databases WHERE id = ? AND owner_id = ?`,
      args: [dbId, session.user.id],
    });
    const owned = ownedResult.rows[0];

    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const keyId = nanoid();
    const apiKey = nanoid(32);
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO api_keys (id, key, name, user_id, db_id, created_at, revoked) VALUES (?, ?, ?, ?, ?, ?, 0)`,
      args: [keyId, apiKey, name.trim(), session.user.id, dbId, now],
    });

    return NextResponse.json(
      {
        id: keyId,
        key: apiKey,
        name: name.trim(),
        createdAt: now,
        revoked: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
