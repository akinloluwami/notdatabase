import { auth } from "@/app/lib/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { sql } from "@/app/lib/server/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Database name is required" },
        { status: 400 },
      );
    }

    const dbId = nanoid();
    const apiKeyId = nanoid();
    const apiKey = nanoid(32);

    const now = new Date().toISOString();

    await sql`
      INSERT INTO databases (id, name, user_id, created_at)
      VALUES (${dbId}, ${name}, ${session.user.id}, ${now})
    `;

    await sql`
      INSERT INTO api_keys (id, key, name, user_id, db_id, created_at, revoked)
      VALUES (${apiKeyId}, ${apiKey}, ${`Default key for ${name}`}, ${session.user.id}, ${dbId}, ${now}, 0)
    `;

    return NextResponse.json(
      {
        id: dbId,
        name,
        apiKey,
        createdAt: now,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating database:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT 
        d.id, 
        d.name,
        COUNT(DISTINCT kv.collection) as collection_count,
        COUNT(kv.key) as document_count
      FROM databases d
      LEFT JOIN kv_store kv ON d.id = kv.db_id
      WHERE d.user_id = ${session.user.id} AND d.deleted_at IS NULL
      GROUP BY d.id, d.name
    `;

    const result = rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      collectionCount: Number(r.collection_count),
      documentCount: Number(r.document_count),
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error listing databases:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
