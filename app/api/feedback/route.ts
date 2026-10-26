import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";

const feedbackCounts = new Map<string, { count: number; resetAt: number }>();
const FEEDBACK_LIMIT = 15;
const FEEDBACK_WINDOW_MS = 60 * 60 * 1000;

function isFeedbackRateLimited(ip: string): boolean {
  const now = Date.now();
  if (feedbackCounts.size > 500) {
    feedbackCounts.forEach((val, key) => {
      if (now > val.resetAt) feedbackCounts.delete(key);
    });
  }
  const entry = feedbackCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    feedbackCounts.set(ip, { count: 1, resetAt: now + FEEDBACK_WINDOW_MS });
    return false;
  }
  if (entry.count >= FEEDBACK_LIMIT) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isFeedbackRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { kind?: string; message?: string; page?: string };
  const message = String(b.message || "").trim().slice(0, 2000);
  if (message.length < 3) return NextResponse.json({ error: "Too short" }, { status: 400 });
  const kind = ["idea", "bug", "other"].includes(String(b.kind)) ? String(b.kind) : "other";
  const { error } = await sb.from("feedback").insert({ kind, message, page: String(b.page || "").slice(0, 200) });
  if (error) return NextResponse.json({ error: "Could not save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
