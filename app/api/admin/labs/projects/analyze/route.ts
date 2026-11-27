/**
 * Admin API — Analyze a Stilledev Labs project
 *
 * POST { id } → runs an AI analysis against full conversation history and
 * returns a structured internal brief: technical analysis, red flags,
 * missing requirements, recommended next question for Oliver to ask.
 *
 * Result is NOT persisted automatically — Oliver sees it in the admin panel
 * and can copy/save what's useful.
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { serviceClient, isAdmin } from "@/lib/adminAuth";
import { configuredModels } from "@/lib/ai-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANALYSIS_PROMPT = `Du är Oliver Stilles interna projektanalysator. Du får hela konversationen mellan en potentiell kund och BudAI (den publika AI-konsulten), samt den projektprofil (project_profile) BudAI sammanställt.

Din uppgift är att förse Oliver med en SKARP, KORTFATTAD intern analys han kan använda när han kontaktar kunden. Var ärlig och direkt — ingen säljsnack.

Returnera ett SVENSKT svar i denna struktur (använd rubrikerna):

## Teknisk bedömning
- Vilken teknisk lösning ser ut att passa?
- Uppskattad komplexitet (Låg / Medel / Hög)
- Ett viktigt tekniskt övervägande Oliver bör ha med sig

## Vad som är tydligt
- Lista 3-5 saker kunden uttryckligen sagt eller bekräftat

## Vad som saknas (kritisk info innan offert)
- Lista 2-5 kritiska frågor som inte är besvarade

## Rekommenderad nästa fråga
- En konkret, välformulerad fråga Oliver bör ställa först när han tar kontakt. Ska vara öppen och hjälpa kunden att tänka klart.

## Varningsflaggor
- När det finns tecken på: orealistisk budget/tidsram, lösning som inte matchar problemet, scope creep, spretiga krav, eller kunden som verkar prisshoppa utan tydligt mål — lista dem. Utelämna rubriken om inga flaggor finns.

## Förslag på approach
- En mening om hur Oliver borde vinkla första samtalet.

Håll hela analysen under 400 ord. Punktform när det passar. Använd svenska. Var konkret och handlingsinriktad.`;

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  // Fetch project + conversation + messages
  const { data: project } = await sb.from("labs_projects").select("*").eq("id", id).maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data: conversation } = await sb
    .from("labs_conversations")
    .select("*")
    .eq("id", project.conversation_id)
    .maybeSingle();

  const { data: messages } = await sb
    .from("labs_messages")
    .select("role, content, created_at")
    .eq("conversation_id", project.conversation_id)
    .order("created_at", { ascending: true });

  const msgText = (messages || [])
    .map((m) => `${m.role === "user" ? "KUND" : "BUDAI"}: ${(m.content || "").slice(0, 2000)}`)
    .join("\n\n")
    .slice(0, 20000);

  const profile = conversation?.project_profile || {};

  const client = new Anthropic({ apiKey: key, timeout: 60_000, maxRetries: 1 });
  const model = configuredModels().quality;

  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 1024,
      system: ANALYSIS_PROMPT,
      messages: [
        {
          role: "user",
          content: `Projekt-ID: ${id}
Projekttitel: ${project.project_title || "(saknas)"}
Kategori: ${project.project_category || conversation?.selected_service || "(okänd)"}
Kontakt: ${project.contact_name || ""} ${project.contact_email ? `<${project.contact_email}>` : ""}
Status: ${project.status || "new"}
Budget (nämnd): ${project.budget || "(nämndes ej)"}
Tidsram: ${project.timeline || "(nämndes ej)"}

--- BUDAI:S PROFILE (intern JSON) ---
${JSON.stringify(profile, null, 2)}

--- KONVERSATION ---
${msgText}

---
Analysera nu enligt instruktionerna.`,
        },
      ],
    });

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ analysis: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Analysis failed", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
