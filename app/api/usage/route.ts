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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const kind = body?.kind as "messages" | "images" | "generations";
  const n = Math.min(5, Math.max(1, Number(body?.n) || 1));
  const day = dayKey();
  if (!["messages", "images", "generations"].includes(kind)) {
    return NextResponse.json({ error: "bad kind" }, { status: 400 });
  }

  const user = await userFromAuth(req);
  const tier: AccessTier = user ? "member" : "guest";
  const guest = typeof body?.guest === "string" ? body.guest.slice(0, 80) : null;
  const sb = admin();
  if (!sb) {
    // No DB — allow (client still tracks UX)
    return NextResponse.json({ ok: true, soft: true, remaining: 999 });
  }

  try {
    if (user) {
      const { data: row } = await sb
        .from("usage_daily")
        .select("*")
        .eq("user_id", user.id)
        .eq("day", day)
        .maybeSingle();
      const cur = {
        messages: row?.messages ?? 0,
        images: row?.images ?? 0,
        generations: row?.generations ?? 0,
      };
      if (cur[kind] + n > limitFor(tier, kind)) {
        return NextResponse.json(
          { error: "limit", remaining: Math.max(0, limitFor(tier, kind) - cur[kind]), tier },
          { status: 429 }
        );
      }
      const next = { ...cur, [kind]: cur[kind] + n };
      await sb.from("usage_daily").upsert({
        user_id: user.id,
        day,
        ...next,
      });
      return NextResponse.json({
        ok: true,
        ...next,
        remaining: limitFor(tier, kind) - next[kind],
        tier,
      });
    }

    if (!guest) return NextResponse.json({ error: "guest key required" }, { status: 400 });
    const { data: row } = await sb
      .from("usage_guest_daily")
      .select("*")
      .eq("guest_key", guest)
      .eq("day", day)
      .maybeSingle();
    const cur = {
      messages: row?.messages ?? 0,
      images: row?.images ?? 0,
      generations: row?.generations ?? 0,
    };
    if (cur[kind] + n > limitFor("guest", kind)) {
      return NextResponse.json(
        { error: "limit", remaining: Math.max(0, limitFor("guest", kind) - cur[kind]), tier: "guest" },
        { status: 429 }
      );
    }
    const next = { ...cur, [kind]: cur[kind] + n };
    await sb.from("usage_guest_daily").upsert({ guest_key: guest, day, ...next });
    return NextResponse.json({
      ok: true,
      ...next,
      remaining: limitFor("guest", kind) - next[kind],
      tier: "guest",
    });
  } catch (e) {
    console.error("usage post", e);
    return NextResponse.json({ ok: true, soft: true });
  }
}
