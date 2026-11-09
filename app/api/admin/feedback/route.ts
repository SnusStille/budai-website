import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
import { logAudit } from "@/lib/admin/audit";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 503 });
  const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 100));
  const { data, error } = await sb.from("feedback").select("id, kind, message, page, rating, created_at, status, is_read").order("created_at", { ascending: false }).limit(limit);
  if (error) return NextResponse.json({ error: "Could not read feedback. Run MIGRATION_v9 + v14 in Supabase." }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 503 });
  const { id, fields } = (await req.json().catch(() => ({}))) as { id?: string; fields?: Record<string, unknown> };
  if (!id || !fields) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const clean: Record<string, unknown> = {};
  if (["new","in_progress","resolved","archived"].includes(String(fields.status))) clean.status = fields.status;
  if (typeof fields.is_read === "boolean") clean.is_read = fields.is_read;
  if (Object.keys(clean).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const { error } = await sb.from("feedback").update(clean).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logAudit(req, "feedback.update", "feedback", id, { status: String(clean.status || "") });
  return NextResponse.json({ ok: true });
}
