/**
 * Stilledev Labs — Contact submission API
 *
 * POST { conversationId, name, email, phone?, company?, preferredContact? }
 *
 * Creates or updates the labs_projects record with contact information and
 * sends notification to Oliver.
 */
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";
import { checkRateLimit, rateLimitKey, RULES } from "@/lib/rate-limit";
import { getSessionFromRequest, isValidConversationId } from "@/lib/labs/session";
import { createLabsNotification } from "@/lib/labs/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(req, RULES.labs_contact), RULES.labs_contact);
  if (limit.limited) {
    return NextResponse.json(
      { error: "För många försök. Försök senare." },
      { status: 429 }
    );
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Databasen är inte tillgänglig." }, { status: 503 });
  }

  const sessionId = getSessionFromRequest(req);
  if (!sessionId) {
    return NextResponse.json({ error: "Session saknas." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const company = typeof body?.company === "string" ? body.company.trim() : "";
    const preferredContact = ["email", "phone", "digital_meeting"].includes(body?.preferredContact)
      ? body.preferredContact
      : "email";

    if (!isValidConversationId(conversationId)) {
      return NextResponse.json({ error: "Ogiltig konversation." }, { status: 400 });
    }

    // Validate conversation ownership
    const { data: conv } = await sb
      .from("labs_conversations")
      .select("id, session_id, title")
      .eq("id", conversationId)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ error: "Konversationen hittades inte." }, { status: 404 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Vänligen ange ditt namn." }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Vänligen ange en giltig e-postadress." }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Find or create project
    const { data: existing } = await sb
      .from("labs_projects")
      .select("id")
      .eq("conversation_id", conversationId)
      .maybeSingle();

    let projectId: string;

    if (existing) {
      await sb
        .from("labs_projects")
        .update({
          contact_name: name,
          contact_email: email,
          contact_phone: phone || null,
          company: company || null,
          preferred_contact: preferredContact,
          contact_collected_at: now,
          status: "meeting_requested",
          is_read: false,
        })
        .eq("id", existing.id);
      projectId = existing.id;
    } else {
      const { data: newProject } = await sb
        .from("labs_projects")
        .insert({
          conversation_id: conversationId,
          status: "meeting_requested",
          contact_name: name,
          contact_email: email,
          contact_phone: phone || null,
          company: company || null,
          preferred_contact: preferredContact,
          contact_collected_at: now,
          project_title: conv.title || null,
        })
        .select("id")
        .single();

      if (!newProject) {
        return NextResponse.json({ error: "Kunde inte spara projektet." }, { status: 500 });
      }
      projectId = newProject.id;
    }

    // Mark conversation as having consent
    await sb
      .from("labs_conversations")
      .update({ consent_given: true })
      .eq("id", conversationId);

    // Send notification to Oliver
    await createLabsNotification({
      projectId,
      kind: "contact_received",
      title: "Kontaktuppgifter mottagna",
      body: `${name} (${email}${company ? `, ${company}` : ""}) vill bli kontaktad. Konversation: "${conv.title}"`,
      email: true,
    });

    // Store a system-like message noting contact was collected
    // (stored as assistant message for history visibility)
    await sb.from("labs_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: `[Kontaktuppgifter sparade: ${name} <${email}>${phone ? `, ${phone}` : ""}${company ? `, ${company}` : ""}. Oliver kommer att granska projektet och höra av sig.]`,
    });

    return NextResponse.json({
      success: true,
      projectId,
    });
  } catch (err) {
    console.error("labs/contact error:", err);
    return NextResponse.json({ error: "Ett fel uppstod." }, { status: 500 });
  }
}
