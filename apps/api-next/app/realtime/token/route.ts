import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDbIdFromApiKey } from "@/app/lib/auth";

const SOCKET_SECRET = process.env.SOCKET_SECRET!;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const dbId = await getDbIdFromApiKey(authHeader);

  if (!dbId) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  let body: {
    expiresIn?: string;
    collections?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const expiresIn = body.expiresIn ?? "1h";
  const collections = body.collections ?? ["*"];

  try {
    const token = jwt.sign(
      {
        dbId,
        collections,
      },
      SOCKET_SECRET,
      {
        expiresIn: expiresIn as import("jsonwebtoken").SignOptions["expiresIn"],
      }
    );

    return NextResponse.json({ token });
  } catch (err) {
    console.error("Token generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
