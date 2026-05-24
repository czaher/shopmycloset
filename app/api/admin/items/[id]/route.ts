import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await req.json();
  db().prepare("UPDATE items SET status = ? WHERE id = ?").run(status, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const item = db().prepare("SELECT image_path FROM items WHERE id = ?").get(id) as
    | { image_path: string | null }
    | undefined;

  if (item?.image_path) {
    const filename = item.image_path.replace("/api/img/", "");
    const filePath = path.join(process.cwd(), "data", "uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db().prepare("DELETE FROM claims WHERE item_id = ?").run(id);
  db().prepare("DELETE FROM items WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
