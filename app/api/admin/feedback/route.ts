import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 503 });
  const { data, error } = await sb.from("feedback").select("id, kind, message, page, created_at").order("created_at", { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: "Could not read feedback. Run MIGRATION_v9_feedback.sql in Supabase." }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
