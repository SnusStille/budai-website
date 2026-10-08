import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";
import { clientIp, createRateLimiter, readJsonObject } from "@/lib/requestGuard";

// Creating share links is public; cap it per address.
const isLimited = createRateLimiter(20, 60 * 60 * 1000);
const MAX_BODY_CHARS = 200_000;

type ShareBody = { title?: unknown; messages?: unknown };

export async function POST(req: NextRequest) {
  if (isLimited(clientIp(req))) {
    return NextResponse.json({ error: "Too many shares. Try again later." }, { status: 429 });
  }
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Sharing is not configured" }, { status: 503 });

  const body = await readJsonObject<ShareBody>(req);
  const raw = Array.isArray(body.messages) ? body.messages.slice(0, 80) : [];
  const clean = raw
    .filter(
      (m): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
        typeof (m as { content?: unknown }).content === "string" &&
        (m as { content: string }).content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 20000) }));

  if (!clean.length || JSON.stringify(clean).length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: "Nothing to share" }, { status: 400 });
  }
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 120) : "Shared chat";

  const { data, error } = await sb
    .from("shared_conversations")
    .insert({ title, messages: clean })
    .select("id")
    .single();
  if (error || !data) return NextResponse.json({ error: "Could not share" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
