import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = db().prepare("SELECT * FROM items ORDER BY created_at DESC").all();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, size, category, image_path } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const result = db()
    .prepare(
      "INSERT INTO items (name, description, size, category, image_path) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name.trim(), description?.trim() || null, size?.trim() || null, category?.trim() || null, image_path || null);

  const item = db().prepare("SELECT * FROM items WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(item, { status: 201 });
}
