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

    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const collectionsResult = await sql`
      SELECT DISTINCT collection FROM kv_store WHERE db_id = ${dbId}
    `;
    const collections = collectionsResult.map((r) => r.collection as string);

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
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

    const owned = await sql`
      SELECT 1 FROM databases WHERE id = ${dbId} AND user_id = ${session.user.id}
    `;

    if (owned.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 },
      );
    }

    const collectionName = name.trim();

    if (!/^[a-zA-Z0-9_-]+$/.test(collectionName)) {
      return NextResponse.json(
        { error: "Collection name can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 },
      );
    }

    const existing = await sql`
      SELECT 1 FROM kv_store WHERE db_id = ${dbId} AND collection = ${collectionName} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Collection already exists" },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const key = nanoid();
    const seedDoc = {
      _id: key,
      _seed: true,
      createdAt: now,
      updatedAt: now,
    };

    await sql`
      INSERT INTO kv_store (id, db_id, collection, key, value, created_at, updated_at)
      VALUES (${key}, ${dbId}, ${collectionName}, ${key}, ${JSON.stringify(seedDoc)}, ${now}, ${now})
    `;

    return NextResponse.json({ name: collectionName }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
