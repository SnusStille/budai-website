import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";
import { RULES, checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(req, RULES.share), RULES.share);
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many share links created. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, limit.retryAfterSeconds)) } }
    );
  }
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Sharing is not configured" }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { title?: string; messages?: { role?: string; content?: string }[] };
  const msgs = Array.isArray(body.messages) ? body.messages.slice(0, 80) : [];
  const clean = msgs
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role as string, content: (m.content as string).slice(0, 20000) }));
  if (!clean.length || JSON.stringify(clean).length > 200_000) return NextResponse.json({ error: "Nothing to share" }, { status: 400 });
  const { data, error } = await sb.from("shared_conversations").insert({ title: String(body.title || "Shared chat").slice(0, 120), messages: clean }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Could not share" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
