import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";
import { RULES, checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

type FeedbackBody = {
  kind?: string;
  message?: string;
  page?: string;
  rating?: string;
  messageId?: string;
  model?: string;
  lang?: string;
};

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(req, RULES.feedback), RULES.feedback);
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, limit.retryAfterSeconds)) } }
    );
  }

  // Validate before touching the database, so malformed requests never depend
  // on Supabase being configured (and can be regression-tested without it).
  const b = (await req.json().catch(() => ({}))) as FeedbackBody;
  const message = String(b.message || "").trim().slice(0, 2000);
  if (message.length < 3) return NextResponse.json({ error: "Too short" }, { status: 400 });

  const rating = b.rating === "up" || b.rating === "down" ? b.rating : null;
  const kind = rating
    ? "rating"
    : ["idea", "bug", "other"].includes(String(b.kind))
    ? String(b.kind)
    : "other";
  if (String(b.kind) === "rating" && !rating) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const row: Record<string, unknown> = {
    kind,
    message,
    page: String(b.page || "").slice(0, 200),
  };
  // Structured rating metadata goes in dedicated columns (MIGRATION v11),
  // never into the free-text message. Plain feedback is unaffected by v11.
  if (rating) {
    row.rating = rating;
    row.message_id = String(b.messageId || "").slice(0, 80);
    row.model = String(b.model || "").slice(0, 40);
    row.lang = b.lang === "sv" ? "sv" : "en";
  }

  const { error } = await sb.from("feedback").insert(row);
  if (error) return NextResponse.json({ error: "Could not save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
