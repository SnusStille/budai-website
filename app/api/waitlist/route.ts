import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateWaitlist } from "@/lib/waitlist-validation";
import { RULES, checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

/**
 * Server-authoritative waitlist signup.
 *
 * The browser no longer inserts into Supabase directly. Validation, consent,
 * honeypot, per-IP throttling and priority all live here. Double opt-in is NOT
 * implemented yet — it needs an email provider (see E9 in the audit).
 */
function writeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const placeholder = /your[-_]project/i.test(url);
  if (!url || !key || !url.startsWith("http") || placeholder) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

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

  const sb = writeClient();
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
  return NextResponse.json({ ok: true });
}
