import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const claims = db()
    .prepare(
      `SELECT claims.*, items.name as item_name
       FROM claims
       JOIN items ON claims.item_id = items.id
       ORDER BY claims.claimed_at DESC`
    )
    .all();
  return NextResponse.json(claims);
}
