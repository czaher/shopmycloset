import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { db, type Item, type Claim } from "@/lib/db";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const items = db().prepare("SELECT * FROM items ORDER BY created_at DESC").all() as Item[];
  const claims = db()
    .prepare(
      `SELECT claims.*, items.name as item_name
       FROM claims JOIN items ON claims.item_id = items.id
       ORDER BY claims.claimed_at DESC`
    )
    .all() as (Claim & { item_name: string })[];

  return <AdminClient initialItems={items} initialClaims={claims} />;
}
