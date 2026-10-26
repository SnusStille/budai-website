import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";

const shareCounts = new Map<string, { count: number; resetAt: number }>();
const SHARE_LIMIT = 20;
const SHARE_WINDOW_MS = 60 * 60 * 1000;

function isShareRateLimited(ip: string): boolean {
  const now = Date.now();
  if (shareCounts.size > 500) {
    shareCounts.forEach((val, key) => {
      if (now > val.resetAt) shareCounts.delete(key);
    });
  }
  const entry = shareCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    shareCounts.set(ip, { count: 1, resetAt: now + SHARE_WINDOW_MS });
    return false;
  }
  if (entry.count >= SHARE_LIMIT) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isShareRateLimited(ip)) {
    return NextResponse.json({ error: "Too many share links created. Try again later." }, { status: 429 });
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
