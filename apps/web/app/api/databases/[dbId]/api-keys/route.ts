import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";
import { nanoid } from "nanoid";

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

    // Check if user owns the database
    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch API keys
    const keys = await sql`
      SELECT id, key, name, created_at, revoked 
      FROM api_keys 
      WHERE db_id = ${dbId} AND user_id = ${session.user.id} 
      ORDER BY created_at DESC
    `;

    const result = keys.map((row) => ({
      id: row.id as string,
      key: row.key as string,
      name: row.name as string,
      createdAt: row.created_at as string,
      revoked: Boolean(row.revoked),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
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
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 },
      );
    }

    // Check if user owns the database
    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const keyId = nanoid();
    const apiKey = nanoid(32);
    const now = new Date().toISOString();

    await sql`
      INSERT INTO api_keys (id, key, name, user_id, db_id, created_at, revoked)
      VALUES (${keyId}, ${apiKey}, ${name.trim()}, ${session.user.id}, ${dbId}, ${now}, 0)
    `;

    return NextResponse.json(
      {
        id: keyId,
        key: apiKey,
        name: name.trim(),
        createdAt: now,
        revoked: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
