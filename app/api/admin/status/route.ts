import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Booleans only: tells the admin which env vars are set, never their values. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = serviceClient();
  let feedbackCount: number | null = null;
  if (sb) {
    const { count } = await sb.from("feedback").select("id", { count: "exact", head: true });
    feedbackCount = count ?? null;
  }
  return NextResponse.json({
    adminPassword: !!(process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD),
    adminPasswordLegacyName: !process.env.ADMIN_PASSWORD && !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    model: process.env.ANTHROPIC_MODEL || null,
    feedbackCount,
  });
}
