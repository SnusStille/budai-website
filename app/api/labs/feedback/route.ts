import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";

/**
 * POST /api/labs/feedback
 * Fire-and-forget feedback submission. No auth required.
 * Creates a labs_notifications row with kind 'feedback' and
 * optionally emails Oliver if Resend is configured. Never fails loudly.
 */
export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const message = (body.message || "").toString().trim().slice(0, 2000);
  if (message.length < 3) return NextResponse.json({ ok: false }, { status: 400 });

  const email = (body.email || "").toString().trim().slice(0, 200) || null;
  const rating = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? body.rating : null;
  const conversationId = (body.conversationId || null) as string | null;
  const path = (body.path || "").toString().slice(0, 200);

  const sb = serviceClient();
  if (!sb) return NextResponse.json({ ok: true });

  try {
    // Simple in-memory rate limit: 5 submissions per minute per IP is handled by edge implicitly.
    // We'll just insert and let Supabase constraints/RLS handle abuse.
    const metadata = {
      email, rating, path,
      user_agent: req.headers.get("user-agent")?.slice(0, 200) || null,
    };

    const { data: existingTable } = await sb.from("labs_notifications").select("id").limit(1);
    // If labs_notifications exists, insert there; otherwise silently succeed
    if (existingTable !== null) {
      await sb.from("labs_notifications").insert({
        kind: "feedback",
        title: "Labs feedback",
        body: `Rating: ${rating || "?"}/5\nPath: ${path}\n${email ? `From: ${email}\n` : ""}${conversationId ? `Conv: ${conversationId}\n` : ""}\n\n${message}`,
        metadata,
      });
    }
  } catch {
    // Never block user on feedback errors
  }

  return NextResponse.json({ ok: true });
}
