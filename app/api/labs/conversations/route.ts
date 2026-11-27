/**
 * Stilledev Labs — Conversations API
 *
 * GET /api/labs/conversations          → list user's conversations
 * GET /api/labs/conversations?id=...   → single conversation with messages + project
 */
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";
import { getSessionFromRequest, isValidConversationId } from "@/lib/labs/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  const sessionId = getSessionFromRequest(req);
  if (!sessionId) {
    return NextResponse.json({ conversations: [], messages: [] });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    if (!isValidConversationId(id)) {
      return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
    }

    const { data: conv } = await sb
      .from("labs_conversations")
      .select("*")
      .eq("id", id)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const { data: messages } = await sb
      .from("labs_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    const { data: project } = await sb
      .from("labs_projects")
      .select("id, status, contact_name, contact_email, contact_phone, company, preferred_contact, project_title, summary_generated_at, contact_collected_at, priority_score")
      .eq("conversation_id", id)
      .maybeSingle();

    return NextResponse.json({
      conversation: conv,
      messages: (messages || []).map((m) => ({
        ...m,
        content: m.content.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim(),
      })),
      project: project || null,
    });
  }

  const { data: conversations } = await sb
    .from("labs_conversations")
    .select("id, title, created_at, updated_at, last_message_at, message_count, language, project_category, priority_score")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ conversations: conversations || [] });
}
