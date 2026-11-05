import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dayKey, LIMITS, type AccessTier, limitFor } from "@/lib/limits";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key || url.includes("YOUR_PROJECT")) return null;
  return createClient(url, key);
}

async function userFromAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anon) return null;
  const sb = createClient(url, anon);
  const { data } = await sb.auth.getUser(token);
  return data.user ?? null;
}

export async function GET(req: NextRequest) {
  const day = req.nextUrl.searchParams.get("day") || dayKey();
  const guest = req.nextUrl.searchParams.get("guest");
  const user = await userFromAuth(req);
  const sb = admin();
  if (!sb) {
    return NextResponse.json({ messages: 0, images: 0, generations: 0, tier: user ? "member" : "guest" });
  }

  try {
    if (user) {
      const { data } = await sb
        .from("usage_daily")
        .select("messages,images,generations")
        .eq("user_id", user.id)
        .eq("day", day)
        .maybeSingle();
      return NextResponse.json({
        messages: data?.messages ?? 0,
        images: data?.images ?? 0,
        generations: data?.generations ?? 0,
        tier: "member" as AccessTier,
        limits: LIMITS.member,
      });
    }
    if (guest) {
      const { data } = await sb
        .from("usage_guest_daily")
        .select("messages,images,generations")
        .eq("guest_key", guest.slice(0, 80))
        .eq("day", day)
        .maybeSingle();
      return NextResponse.json({
        messages: data?.messages ?? 0,
        images: data?.images ?? 0,
        generations: data?.generations ?? 0,
        tier: "guest" as AccessTier,
        limits: LIMITS.guest,
      });
    }
    return NextResponse.json({ messages: 0, images: 0, generations: 0, tier: "guest" });
  } catch {
    return NextResponse.json({ messages: 0, images: 0, generations: 0 });
  }
}

/**
 * Writes are intentionally disabled (B6). Quota increments happen server-side
 * in /api/playground and /api/generate-image after a completed upstream call.
 * A public POST here let anyone burn or race another visitor's quota.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Usage is recorded server-side after a completed request. This endpoint does not accept writes." },
    { status: 405, headers: { Allow: "GET" } }
  );
}
