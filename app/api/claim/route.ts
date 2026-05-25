import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendClaimNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { itemId, claimerName, contactInfo } = await req.json();

  if (!itemId || !claimerName?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const database = db();
  const item = database.prepare("SELECT * FROM items WHERE id = ?").get(itemId) as
    | { id: number; name: string; status: string }
    | undefined;

  if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });
  if (item.status === "reserved") {
    return NextResponse.json({ error: "This item has already been claimed." }, { status: 409 });
  }

  database.prepare("UPDATE items SET status = 'reserved' WHERE id = ?").run(itemId);
  database
    .prepare("INSERT INTO claims (item_id, claimer_name, contact_info) VALUES (?, ?, ?)")
    .run(itemId, claimerName.trim(), contactInfo?.trim() || '');

  // Fire-and-forget email — don't block the response
  sendClaimNotification({
    itemName: item.name,
    claimerName: claimerName.trim(),
    contactInfo: contactInfo.trim(),
  }).catch(console.error);

  return NextResponse.json({ success: true });
}
