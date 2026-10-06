import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";

const ALLOWED = ["access_status", "notes", "priority", "last_contacted_at", "tags"];

function guard(req: NextRequest) {
  if (!isAdmin(req)) return { err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const sb = serviceClient();
  if (!sb) return { err: NextResponse.json({ error: "Service role not configured" }, { status: 503 }) };
  return { sb };
}

export async function GET(req: NextRequest) {
  const g = guard(req);
  if (g.err) return g.err;
  const { data, error } = await g.sb!.from("waitlist_users").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data || [] });
}

export async function PATCH(req: NextRequest) {
  const g = guard(req);
  if (g.err) return g.err;
  const { id, fields } = (await req.json().catch(() => ({}))) as { id?: string; fields?: Record<string, unknown> };
  if (!id || !fields) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const clean = Object.fromEntries(Object.entries(fields).filter(([k]) => ALLOWED.includes(k)));
  const { error } = await g.sb!.from("waitlist_users").update({ ...clean, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const g = guard(req);
  if (g.err) return g.err;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { error } = await g.sb!.from("waitlist_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
