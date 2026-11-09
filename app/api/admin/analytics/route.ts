import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
import { logAudit } from "@/lib/admin/audit";
export const dynamic = "force-dynamic";
/** GDPR retention: purge page_views older than N days (7–3650). Audit-logged. */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  const days = Math.min(3650, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 180));
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
  const { count, error } = await sb.from("page_views").delete({ count: "exact" }).lt("created_at", cutoff);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logAudit(req, "analytics.purge", "page_views", undefined, { olderThanDays: days, deleted: count ?? 0 });
  return NextResponse.json({ ok: true, deleted: count ?? 0, olderThanDays: days });
}
