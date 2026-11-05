import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";
import { validateWaitlist } from "@/lib/waitlist-validation";
import { RULES, checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { WAITLIST_STATUS_COOKIE, signWaitlistEmail } from "@/lib/waitlist-status";

/**
 * Server-authoritative waitlist signup.
 *
 * The browser no longer inserts into Supabase directly. Validation, consent,
 * honeypot, per-IP throttling and priority all live here. Double opt-in is NOT
 * implemented yet — it needs an email provider (see E9 in the audit).
 */
export async function POST(req: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(req, RULES.waitlist), RULES.waitlist);
  if (limit.limited) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.max(1, limit.retryAfterSeconds)) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const result = validateWaitlist(body);
  if (!result.ok) {
    // Do not tell a bot that it was detected.
    if (result.error === "honeypot") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const sb = serviceClient();
  if (!sb) {
    // Local development has no database; keep the preview form usable without
    // pretending anything was persisted.
    if (process.env.NODE_ENV === "development") return NextResponse.json({ ok: true, dev: true });
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { error } = await sb.from("waitlist_users").insert([result.value]);
  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already")) {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    console.error("Waitlist insert error:", error.message);
    return NextResponse.json({ error: "could_not_save" }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  const token = signWaitlistEmail(result.value.email);
  if (token) {
    res.cookies.set(WAITLIST_STATUS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  }
  return res;
}
