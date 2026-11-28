/**
 * Stilledev Labs — Chat API
 *
 * Streaming chat endpoint for the BudAI project consultant.
 * - Anonymous sessions via httpOnly cookie (no account required).
 * - Dynamic project profile maintained across turns.
 * - Structured [[PROFILE:]] blocks parsed and persisted.
 * - Priority scoring for admin triage.
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildLabsSystemPrompt,
  MAX_LABS_MESSAGE_CHARS,
  MAX_LABS_HISTORY_MESSAGES,
  PROFILE_SNAPSHOT_INTERVAL,
  EMPTY_PROJECT_PROFILE,
} from "@/lib/labs/prompt";
import {
  extractProfile,
  extractSummary,
  mergeProfile,
  detectContactInfo,
  type ProjectProfile,
} from "@/lib/labs/profile";
import { serviceClient } from "@/lib/supabase/service";
import { checkRateLimit, rateLimitKey, RULES } from "@/lib/rate-limit";
import { errorMessage, logEvent, newRequestId } from "@/lib/log";
import { aiUsageEvent, logAiUsage } from "@/lib/ai-usage";
import { getSessionFromRequest, ensureSessionCookie, generateSessionId, isValidConversationId } from "@/lib/labs/session";
import { configuredModels } from "@/lib/ai-models";
import { createLabsNotification } from "@/lib/labs/notifications";

const LAB_MESSAGE_CHAR_SOFT_LIMIT = 8000; // per-message char limit sent to AI (truncation safety)

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key || key.length < 10 || key.includes("your-")) return null;
  return new Anthropic({ apiKey: key, timeout: 60_000, maxRetries: 2 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeIncrement(stored: unknown, fallback: number): number {
  if (typeof stored === "number" && Number.isFinite(stored)) return stored + 1;
  return fallback + 1;
}

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(req, RULES.labs_chat), RULES.labs_chat);
  if (limit.limited) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, limit.retryAfterSeconds)) } }
    );
  }

  if (process.env.BUDAI_AI_DISABLED === "1") {
    return NextResponse.json({ error: "Temporarily paused.", code: "paused" }, { status: 503 });
  }

  const anthropic = getClient();
  if (!anthropic) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  const startedAt = Date.now();
  const requestId = newRequestId();

  try {
    const body = await req.json();
    const userMessage: string = typeof body?.message === "string" ? body.message : "";
    const conversationIdParam: string | null = typeof body?.conversationId === "string" ? body.conversationId : null;
    const lang = body?.lang === "en" ? "en" : "sv";
    const selectedService: string | null =
      typeof body?.selectedService === "string" ? body.selectedService : null;

    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }
    if (userMessage.length > MAX_LABS_MESSAGE_CHARS) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_LABS_MESSAGE_CHARS} characters).` },
        { status: 400 }
      );
    }

    // --- Session management ---
    let sessionId = getSessionFromRequest(req);
    if (!sessionId) sessionId = generateSessionId();

    // --- Conversation: load or create ---
    let conversationId: string;
    let isNewConversation = false;

    if (conversationIdParam && isValidConversationId(conversationIdParam)) {
      const { data: existing } = await sb
        .from("labs_conversations")
        .select("id, session_id, title")
        .eq("id", conversationIdParam)
        .maybeSingle();

      if (existing && existing.session_id === sessionId) {
        conversationId = existing.id;
      } else {
        const { data: newConv, error: createErr } = await sb
          .from("labs_conversations")
          .insert({
            session_id: sessionId,
            language: lang,
            project_profile: EMPTY_PROJECT_PROFILE,
            selected_service: selectedService || null,
          })
          .select("id")
          .single();
        if (createErr || !newConv) {
          return NextResponse.json({ error: "Failed to create conversation." }, { status: 500 });
        }
        conversationId = newConv.id;
        isNewConversation = true;
      }
    } else {
      const { data: newConv, error: createErr } = await sb
        .from("labs_conversations")
        .insert({
          session_id: sessionId,
          language: lang,
          project_profile: EMPTY_PROJECT_PROFILE,
          selected_service: selectedService || null,
        })
        .select("id")
        .single();
      if (createErr || !newConv) {
        return NextResponse.json({ error: "Failed to create conversation." }, { status: 500 });
      }
      conversationId = newConv.id;
      isNewConversation = true;
    }

    // --- Load conversation state: existing profile + recent messages ---
    const { data: convRow } = await sb
      .from("labs_conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();

    const currentProfile: ProjectProfile = (convRow?.project_profile as unknown as ProjectProfile) || {
      ...EMPTY_PROJECT_PROFILE,
    };
    const turnCount = typeof convRow?.turn_count === "number" ? convRow.turn_count : 0;

    const { data: historyMsgs } = await sb
      .from("labs_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(MAX_LABS_HISTORY_MESSAGES);

    // Build messages array for AI
    const messages: Anthropic.MessageParam[] = [];
    for (const m of historyMsgs || []) {
      if (m.role === "user" || m.role === "assistant") {
        // Strip old [[PROFILE:]] / [[SUMMARY:]] blocks from history so AI doesn't see them
        const content = typeof m.content === "string"
          ? m.content.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim()
          : "";
        if (content && content.length < LAB_MESSAGE_CHAR_SOFT_LIMIT) {
          messages.push({ role: m.role, content });
        }
      }
    }

    messages.push({ role: "user", content: userMessage.trim() });

    // --- Store user message ---
    await sb.from("labs_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: userMessage.trim(),
    });

    // Update conversation metadata
    const newMessageCount = safeIncrement(convRow?.message_count, (historyMsgs?.length || 0));
    const newTurnCount = turnCount + 1;
    await sb
      .from("labs_conversations")
      .update({
        message_count: newMessageCount,
        last_message_at: new Date().toISOString(),
        first_message_at: convRow?.first_message_at || new Date().toISOString(),
        turn_count: newTurnCount,
        title: isNewConversation || (historyMsgs?.length || 0) === 0
          ? userMessage.trim().slice(0, 60)
          : convRow?.title,
      })
      .eq("id", conversationId);

    // --- Notify on first message ---
    if (isNewConversation || (historyMsgs?.length || 0) === 0) {
      await createLabsNotification({
        conversationId,
        kind: "new_conversation",
        title: lang === "sv" ? "Ny konversation startad" : "New conversation started",
        body: `${userMessage.trim().slice(0, 200)}`,
        email: false, // Don't email on every single new conversation
      });
    }

    // --- Build system prompt with current profile ---
    const systemPrompt = buildLabsSystemPrompt({
      lang,
      projectProfile: currentProfile,
      turnCount: newTurnCount,
      isNewConversation,
      selectedService: (selectedService as any) || null,
    });

    const model = configuredModels().quality;

    // --- Streaming response ---
    const enc = new TextEncoder();
    let closed = false;
    let activeStream: { abort: () => void } | null = null;

    const abortUpstream = () => {
      if (closed) return;
      closed = true;
      try { activeStream?.abort(); } catch { /* ignore */ }
    };
    req.signal.addEventListener("abort", abortUpstream, { once: true });

    const readable = new ReadableStream({
      async start(controller) {
        let full = "";
        let sent = 0;

        try {
          const stream = anthropic.messages.stream({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages,
          }, { signal: req.signal });

          activeStream = stream;

          stream.on("text", (delta: string) => {
            if (closed) return;
            full += delta;
            // Hold back potential [[PROFILE:]] / [[SUMMARY:]] block so it never flashes
            const cut = Math.min(
              full.indexOf("[[PROFILE") !== -1 ? full.indexOf("[[PROFILE") : Infinity,
              full.indexOf("[[SUMMARY") !== -1 ? full.indexOf("[[SUMMARY") : Infinity
            );
            let limit = cut === Infinity ? full.length : cut;
            // Also avoid streaming a partial '[' character
            if (cut === Infinity && /\[\[$/.test(full.slice(-3))) limit -= 1;
            if (limit > sent && !closed) {
              controller.enqueue(enc.encode(full.slice(sent, limit)));
              sent = limit;
            }
          });

          const finalMessage = await stream.finalMessage();
          logAiUsage(aiUsageEvent({
            provider: "anthropic",
            operation: "labs_chat",
            model,
            tier: "guest",
            stream: true,
            ok: true,
            inputTokens: finalMessage.usage?.input_tokens,
            outputTokens: finalMessage.usage?.output_tokens,
            durationMs: Date.now() - startedAt,
          }));

          if (closed) return;

          // Try PROFILE block first, then SUMMARY block
          const profileResult = extractProfile(full);
          const summaryResult = profileResult.profile
            ? { clean: profileResult.clean, summary: null }
            : extractSummary(full);

          const cleanText = profileResult.clean || summaryResult.clean;
          const parsedProfile = profileResult.profile;
          const parsedSummary = summaryResult.summary;

          // Send remaining visible text
          if (cleanText.length > sent && !closed) {
            controller.enqueue(enc.encode(cleanText.slice(Math.min(sent, cleanText.length))));
          }

          // --- Persist assistant message ---
          const assistantContent = cleanText || full.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim();

          const newProfile: ProjectProfile = parsedProfile || parsedSummary
            ? mergeProfile(currentProfile, (parsedProfile || parsedSummary) as Partial<ProjectProfile>)
            : currentProfile;

          await sb.from("labs_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: assistantContent,
            tokens_input: finalMessage.usage?.input_tokens,
            tokens_output: finalMessage.usage?.output_tokens,
            model,
            profile_delta: parsedProfile || parsedSummary || null,
          });

          // Update conversation timestamps
          await sb
            .from("labs_conversations")
            .update({
              message_count: newMessageCount + 1,
              last_message_at: new Date().toISOString(),
              last_assistant_message_at: new Date().toISOString(),
            })
            .eq("id", conversationId);

          // --- Update persistent project profile on conversation ---
          const profileUpdate: Record<string, unknown> = {
            project_profile: newProfile,
            priority_score: newProfile.priority_score,
            priority_strengths: newProfile.priority_strengths,
            priority_concerns: newProfile.priority_concerns,
            priority_recommendation: newProfile.priority_recommendation,
            project_category: newProfile.project_category,
          };

          // Update conversation stage
          if (parsedProfile?.conversation_stage) {
            // status stays tracked via profile; if stage is assessment+ and no project exists, consider it needs review
          }

          await sb.from("labs_conversations").update(profileUpdate).eq("id", conversationId);

          // --- Take periodic profile snapshots (every N turns) ---
          if (newTurnCount % PROFILE_SNAPSHOT_INTERVAL === 0) {
            try {
              await sb.from("labs_profile_snapshots").insert({
                conversation_id: conversationId,
                project_profile: newProfile,
                turn_number: newTurnCount,
                summary_text: newProfile.customer_goal,
              });
            } catch { /* ignore snapshot errors */ }
          }

          // --- Handle SUMMARY block (contact info provided) ---
          if (parsedSummary && parsedSummary.contact_email) {
            await handleContactSummary(sb, conversationId, newProfile, parsedSummary, lang);
          }
          // --- Handle high-priority lead notification (score ≥ 75, no project yet) ---
          else if (parsedProfile && parsedProfile.priority_score >= 70 && newTurnCount >= 3) {
            const { data: existingProj } = await sb
              .from("labs_projects")
              .select("id")
              .eq("conversation_id", conversationId)
              .maybeSingle();

            if (!existingProj && parsedProfile.conversation_stage !== "discovery") {
              await createLabsNotification({
                conversationId,
                kind: "high_priority_lead",
                title: lang === "sv" ? "Högprioriterad lead" : "High-priority lead",
                body: `Poäng ${parsedProfile.priority_score}/100 — ${parsedProfile.project_title || parsedProfile.customer_goal || "Projekt"}`,
                email: true,
              });
            }
          }

          // Send metadata event
          if (!closed) {
            const meta = {
              conversationId,
              done: true,
              hasProfile: !!parsedProfile,
              hasSummary: !!parsedSummary,
              stage: newProfile.conversation_stage,
              score: newProfile.priority_score,
            };
            controller.enqueue(enc.encode("\u0000" + JSON.stringify(meta)));
          }
        } catch (err) {
          if (!closed) {
            const status = (err as { status?: number })?.status;
            const errMsg =
              status === 429 || status === 529
                ? (lang === "sv" ? "Hög belastning just nu — försök igen om en stund." : "High load right now — please retry shortly.")
                : status === 401 || status === 403
                ? (lang === "sv" ? "Tekniskt fel på servern." : "Server credential error.")
                : (lang === "sv" ? "Något gick fel. Försök igen." : "Something went wrong. Please try again.");

            logEvent("error", "labs.stream", {
              requestId, status, message: errorMessage(err), durationMs: Date.now() - startedAt,
            });
            logAiUsage(aiUsageEvent({
              provider: "anthropic", operation: "labs_chat", stream: true, ok: false, status,
              durationMs: Date.now() - startedAt,
            }));
            controller.enqueue(enc.encode("\u0000" + JSON.stringify({ error: errMsg })));
          }
        } finally {
          if (!closed) {
            closed = true;
            try { controller.close(); } catch { /* ignore */ }
          }
        }
      },
      cancel() { abortUpstream(); },
    });

    const response = new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });

    ensureSessionCookie(response, sessionId);
    return response;
  } catch (err) {
    logEvent("error", "labs.complete", {
      requestId, message: errorMessage(err), durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Ett oväntat fel uppstod." }, { status: 500 });
  }
}

/**
 * Handle the case where AI has collected contact info and emitted [[SUMMARY:]].
 * Creates or updates a labs_projects record, sends notification to Oliver.
 */
async function handleContactSummary(
  sb: NonNullable<ReturnType<typeof serviceClient>>,
  conversationId: string,
  profile: ProjectProfile,
  summary: ReturnType<typeof extractSummary>["summary"],
  lang: "sv" | "en"
): Promise<void> {
  if (!summary) return;

  const now = new Date().toISOString();

  const { data: existing } = await sb
    .from("labs_projects")
    .select("id")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  const projectFields: Record<string, unknown> = {
    project_title: summary.project_title || profile.project_title,
    project_category: summary.project_category || profile.project_category,
    customer_goal: summary.customer_goal || profile.customer_goal,
    target_audience: summary.target_audience || profile.target_audience,
    problem: summary.problem || profile.problem,
    proposed_solution: summary.proposed_solution || profile.proposed_solution,
    scope_mvp: summary.recommended_mvp || profile.recommended_mvp,
    key_features: summary.key_features?.length ? summary.key_features : profile.key_features,
    technical_requirements: summary.technical_requirements?.length ? summary.technical_requirements : profile.technical_requirements,
    technical_complexity: summary.technical_complexity || profile.technical_complexity,
    budget: summary.budget || profile.budget,
    budget_assessment: summary.budget_assessment || profile.budget_assessment,
    timeline: summary.timeline || profile.timeline,
    timeline_assessment: summary.timeline_assessment || profile.timeline_assessment,
    business_risks: summary.business_risks?.length ? summary.business_risks : profile.business_risks,
    technical_risks: summary.technical_risks?.length ? summary.technical_risks : profile.technical_risks,
    opportunities: summary.opportunities?.length ? summary.opportunities : profile.opportunities,
    competition: summary.competition || profile.competition,
    recommended_mvp: summary.recommended_mvp || profile.recommended_mvp,
    next_steps: summary.next_steps || profile.next_steps,
    project_profile: { ...profile, ...summary },
    priority_score: summary.priority_score || profile.priority_score,
    priority_strengths: summary.priority_strengths?.length ? summary.priority_strengths : profile.priority_strengths,
    priority_concerns: summary.priority_concerns?.length ? summary.priority_concerns : profile.priority_concerns,
    priority_recommendation: summary.priority_recommendation || profile.priority_recommendation,
    contact_name: summary.contact_name || null,
    contact_email: summary.contact_email || null,
    contact_phone: summary.contact_phone || null,
    company: summary.company || null,
    preferred_contact: summary.preferred_contact || "email",
    contact_collected_at: now,
    last_summary_update_at: now,
    status: "meeting_requested",
    is_read: false,
  };

  if (existing) {
    await sb.from("labs_projects").update(projectFields).eq("id", existing.id);
    await createLabsNotification({
      projectId: existing.id,
      kind: "summary_ready",
      title: lang === "sv" ? "Kontaktuppgifter mottagna" : "Contact details received",
      body: `${summary.contact_name || "Kund"} (${summary.contact_email || ""}) — ${summary.project_title || profile.project_title || "Projekt"}`,
      email: true,
    });
  } else {
    const { data: newProject } = await sb
      .from("labs_projects")
      .insert({
        conversation_id: conversationId,
        ...projectFields,
        summary_generated_at: now,
      })
      .select("id")
      .single();

    if (newProject) {
      await createLabsNotification({
        projectId: newProject.id,
        conversationId,
        kind: "contact_received",
        title: lang === "sv" ? "Nytt projekt med kontaktuppgifter" : "New project with contact details",
        body: `${summary.contact_name || "Kund"} — ${summary.project_title || profile.project_title || "Projekt"} (${summary.priority_score || 0}/100)`,
        email: true,
      });
    }
  }

  // Mark conversation consent
  await sb.from("labs_conversations").update({ consent_given: true }).eq("id", conversationId);
}
