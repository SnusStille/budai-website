"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, Cpu, Database, FileText, Image, Mic, Search, ShieldCheck, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import PageHero from "./PageHero";
import { useLang } from "@/components/ui/LanguageContext";
import { LIMITS } from "@/lib/limits";

type LocalText = { en: string; sv: string };
type KnowledgeSection = { id: string; icon: LucideIcon; title: LocalText; intro: LocalText; points: Array<{ title: LocalText; body: LocalText }> };

const SECTIONS: KnowledgeSection[] = [
  {
    id: "how-it-works", icon: Workflow,
    title: { en: "How BudAI works", sv: "Så fungerar BudAI" },
    intro: { en: "One real request path connects the Playground to an AI model. The interface never invents a response when a provider is unavailable.", sv: "En verklig anropsväg kopplar Playground till en AI-modell. Gränssnittet hittar aldrig på ett svar när en leverantör inte är tillgänglig." },
    points: [
      { title: { en: "Conversation to response", sv: "Från samtal till svar" }, body: { en: "Your message, recent thread context, selected language and mode are sent to the server-side Playground route. The route calls Anthropic and streams the reply back. Personas and Chat / Research / Create / Analyze modes steer the instruction; they are not presented as separate AI systems.", sv: "Ditt meddelande, aktuell trådkontext, valt språk och läge skickas till Playgroundens serverroute. Routen anropar Anthropic och strömmar svaret tillbaka. Personas och lägena Chatt / Research / Skapa / Analys styr instruktionen; de presenteras inte som separata AI-system." } },
      { title: { en: "Research without false browsing claims", sv: "Research utan falska webblöften" }, body: { en: "Research mode organizes analysis of the context you provide. BudAI does not currently search the web or verify live sources in this mode. Check facts, citations and important decisions yourself.", sv: "Research-läget organiserar analys av den kontext du ger. BudAI söker för närvarande inte på webben eller verifierar livekällor i detta läge. Kontrollera fakta, källor och viktiga beslut själv." } },
      { title: { en: "Preview limits", sv: "Gränser i previewn" }, body: { en: `Guests can send ${LIMITS.guest.messagesPerDay} messages per UTC day. A free account currently provides ${LIMITS.member.messagesPerDay} messages per day. The visible usage meter shows the current allowance; limits may evolve during the preview.`, sv: `Gäster kan skicka ${LIMITS.guest.messagesPerDay} meddelanden per UTC-dygn. Ett gratiskonto ger för närvarande ${LIMITS.member.messagesPerDay} meddelanden per dag. Den synliga användningsmätaren visar aktuell gräns; gränserna kan ändras under previewn.` } },
    ],
  },
  {
    id: "models", icon: Cpu,
    title: { en: "AI models", sv: "AI-modeller" },
    intro: { en: "BudAI is a product and workspace built around external foundation models, not a claim that Stilledev trains its own foundation model.", sv: "BudAI är en produkt och arbetsyta byggd kring externa grundmodeller, inte ett påstående att Stilledev tränar sin egen grundmodell." },
    points: [
      { title: { en: "Anthropic for conversations and vision", sv: "Anthropic för samtal och bild" }, body: { en: "Chat and image analysis use Anthropic’s API. The Quality tier is always configured server-side; Fast and Deep tiers appear only when the deployment configures them. API keys remain on the server.", sv: "Chatt och bildanalys använder Anthropics API. Kvalitetsnivån konfigureras alltid på servern; snabba och djupa nivåer visas bara när driftsättningen konfigurerar dem. API-nycklar stannar på servern." } },
      { title: { en: "Optional OpenAI image generation", sv: "Valfri bildgenerering med OpenAI" }, body: { en: "The repository includes an optional OpenAI Images integration. It works only when the deployment enables it and a signed-in user explicitly requests generation. Its availability is not presented as a universal live feature.", sv: "Kodbasen innehåller en valfri integration med OpenAI Images. Den fungerar bara när driftsättningen aktiverar den och en inloggad användare uttryckligen begär generering. Dess tillgänglighet presenteras inte som en allmän livefunktion." } },
      { title: { en: "No model training claim", sv: "Inget påstående om egen modellträning" }, body: { en: "Stilledev does not train its own models on your BudAI messages. Provider-side data practices are separate from this statement; review the linked legal information and provider terms for the full picture.", sv: "Stilledev tränar inte egna modeller på dina BudAI-meddelanden. Leverantörernas egen datahantering är en separat fråga; läs den juridiska informationen och leverantörernas villkor för hela bilden." } },
    ],
  },
  {
    id: "memory", icon: BrainCircuit,
    title: { en: "Memory", sv: "Minne" },
    intro: { en: "Memory can make later conversations more relevant, and the current implementation gives you direct control over it.", sv: "Minnet kan göra senare samtal mer relevanta, och den nuvarande implementeringen ger dig direkt kontroll över det." },
    points: [
      { title: { en: "Accounts: on by default", sv: "Konton: på som standard" }, body: { en: "For signed-in accounts, memory is on by default. BudAI may automatically save a durable fact it notices—such as a role, company or preference—and use it as context in later replies. It is not intended for temporary task details or secrets.", sv: "För inloggade konton är minnet på som standard. BudAI kan automatiskt spara en beständig detalj den upptäcker — till exempel roll, företag eller preferens — och använda den som kontext i senare svar. Den är inte avsedd för tillfälliga uppgiftsdetaljer eller hemligheter." } },
      { title: { en: "Your controls", sv: "Dina kontroller" }, body: { en: "Open Playground → Memory to inspect saved facts, add or edit a memory, delete individual items, clear all memory or turn automatic saving off. A temporary chat does not use memory.", sv: "Öppna Playground → Minne för att se sparade fakta, lägga till eller redigera minnen, radera enskilda poster, rensa allt minne eller stänga av automatisk sparning. Ett tillfälligt samtal använder inte minnet." } },
      { title: { en: "Guests: no long-term memory", sv: "Gäster: inget långtidsminne" }, body: { en: "Guest chats do not create account memories. Guest history, drafts and routines are stored in your browser’s local storage so they can remain available on that device.", sv: "Gästsamtal skapar inga kontominnen. Gästhistorik, utkast och rutiner lagras i webbläsarens lokala lagring så att de kan finnas kvar på samma enhet." } },
    ],
  },
  {
    id: "privacy", icon: ShieldCheck,
    title: { en: "Privacy & data handling", sv: "Integritet & datahantering" },
    intro: { en: "Different actions have different storage and transmission paths. This is the practical summary; the legal pages contain the formal policy.", sv: "Olika åtgärder har olika lagrings- och överföringsvägar. Detta är den praktiska sammanfattningen; de juridiska sidorna innehåller den formella policyn." },
    points: [
      { title: { en: "What is transmitted", sv: "Vad som överförs" }, body: { en: "Playground messages, recent context, selected instructions and any supplied memory context are transmitted to Stilledev’s server route and to Anthropic to produce a response. Attached images are also sent for analysis. Dictated text becomes a normal message only when you submit it.", sv: "Playground-meddelanden, aktuell kontext, valda instruktioner och eventuell minneskontext överförs till Stilledevs serverroute och till Anthropic för att skapa ett svar. Bifogade bilder skickas också för analys. Dikterad text blir ett vanligt meddelande först när du skickar det." } },
      { title: { en: "What is stored", sv: "Vad som lagras" }, body: { en: "Guest history and routines stay in browser storage. Signed-in history, memories and daily usage counters are stored in Supabase under account access rules. Waitlist details are stored only with consent. A shared conversation is stored as a read-only share; treat its link as public.", sv: "Gästhistorik och rutiner stannar i webbläsarens lagring. Inloggad historik, minnen och dygnsräknare lagras i Supabase under kontots åtkomstregler. Väntelisteuppgifter lagras bara med samtycke. Ett delat samtal lagras som en skrivskyddad delning; behandla länken som offentlig." } },
      { title: { en: "Service providers and analytics", sv: "Tjänsteleverantörer och analys" }, body: { en: "Supabase provides authentication and database functionality. Anthropic provides chat and vision. OpenAI is involved only if the optional generation integration is configured and used. Vercel Analytics loads only after consent; no third-party advertising trackers are used.", sv: "Supabase tillhandahåller autentisering och databas. Anthropic tillhandahåller chatt och bildanalys. OpenAI används bara om den valfria generationsintegrationen är konfigurerad och används. Vercel Analytics laddas bara efter samtycke; inga tredjepartsannonsspårare används." } },
      { title: { en: "Your choices", sv: "Dina val" }, body: { en: "Use guest mode or a temporary chat, disable memory, delete memories, avoid share links, and change cookie consent in the footer. Contact Stilledev for access, correction or deletion requests. Do not enter sensitive personal data, passwords, API keys or secrets in the preview.", sv: "Använd gästläge eller ett tillfälligt samtal, stäng av minne, radera minnen, undvik delningslänkar och ändra cookiesamtycke i sidfoten. Kontakta Stilledev för begäran om tillgång, rättelse eller radering. Ange inte känsliga personuppgifter, lösenord, API-nycklar eller hemligheter i previewn." } },
    ],
  },
  {
    id: "image-voice", icon: Image,
    title: { en: "Image & voice capabilities", sv: "Bild- och röstfunktioner" },
    intro: { en: "BudAI supports image understanding and voice input; these are distinct from optional image generation.", sv: "BudAI stöder bildförståelse och röstinmatning; detta skiljer sig från valfri bildgenerering." },
    points: [
      { title: { en: "Image analysis", sv: "Bildanalys" }, body: { en: `Signed-in users can attach JPEG, PNG, GIF or WebP images up to ${LIMITS.member.maxAttachmentBytes / (1024 * 1024)} MB for analysis. The current account allowance is ${LIMITS.member.imagesPerDay} image analyses per day. Guests are asked to sign in before attaching an image.`, sv: `Inloggade användare kan bifoga JPEG-, PNG-, GIF- eller WebP-bilder upp till ${LIMITS.member.maxAttachmentBytes / (1024 * 1024)} MB för analys. Nuvarande kontogräns är ${LIMITS.member.imagesPerDay} bildanalyser per dag. Gäster ombeds logga in innan de bifogar en bild.` } },
      { title: { en: "Voice input", sv: "Röstinmatning" }, body: { en: "Voice mode uses browser speech-recognition support and requires microphone permission. Availability and any browser-side speech processing depend on your browser and platform. You can edit the dictated text before sending it.", sv: "Röstläget använder webbläsarens stöd för röstigenkänning och kräver mikrofontillåtelse. Tillgänglighet och eventuell röstbehandling i webbläsaren beror på din webbläsare och plattform. Du kan redigera den dikterade texten innan du skickar den." } },
    ],
  },
  {
    id: "workspace", icon: FileText,
    title: { en: "Workspace, routines & export", sv: "Workspace, rutiner & export" },
    intro: { en: "BudAI is designed to carry a response into editable, portable work rather than leaving it trapped in a chat bubble.", sv: "BudAI är utformat för att föra ett svar vidare till redigerbart, portabelt arbete i stället för att lämna det i en pratbubbla." },
    points: [
      { title: { en: "Workspace drafts", sv: "Workspace-utkast" }, body: { en: "Structured or longer answers can open in Workspace. Edit or preview the draft, save a local copy, and use actions such as Improve, SV ↔ EN and Checklist. The original thread remains available.", sv: "Strukturerade eller längre svar kan öppnas i Workspace. Redigera eller förhandsgranska utkastet, spara en lokal kopia och använd åtgärder som Förbättra, SV ↔ EN och Checklista. Den ursprungliga tråden finns kvar." } },
      { title: { en: "Routines and sharing", sv: "Rutiner och delning" }, body: { en: "Reusable routines use editable {{field}} placeholders. Export a thread as Markdown, Word or PDF. A share link creates a server-stored, read-only page marked noindex; anyone with the link may still be able to read it.", sv: "Återanvändbara rutiner använder redigerbara {{field}}-platshållare. Exportera en tråd som Markdown, Word eller PDF. En delningslänk skapar en serverlagrad, skrivskyddad sida markerad noindex; alla med länken kan ändå läsa den." } },
    ],
  },
];

const FAQ = [
  { q: { en: "Does BudAI search the web?", sv: "Söker BudAI på webben?" }, a: { en: "No. Research mode structures analysis of the information you provide, but it does not currently perform live web search or source verification.", sv: "Nej. Research-läget strukturerar analys av informationen du ger, men utför för närvarande inte livesökningar på webben eller källverifiering." } },
  { q: { en: "Can I try BudAI without an account?", sv: "Kan jag prova BudAI utan konto?" }, a: { en: `Yes. Guest mode includes ${LIMITS.guest.messagesPerDay} messages per day with local browser history. Accounts add a higher current limit, cloud history, memory controls and image analysis.`, sv: `Ja. Gästläget inkluderar ${LIMITS.guest.messagesPerDay} meddelanden per dag med lokal webbläsarhistorik. Konton ger en högre nuvarande gräns, molnhistorik, minneskontroller och bildanalys.` } },
  { q: { en: "Is BudAI free?", sv: "Är BudAI gratis?" }, a: { en: "The Basic developer preview is free. Consumer and Business plans are in development, and pricing has not been set.", sv: "Basic-utvecklarpreviewn är gratis. Consumer- och Business-planer är under utveckling och priser har inte satts." } },
  { q: { en: "Can I turn off or delete memory?", sv: "Kan jag stänga av eller radera minnet?" }, a: { en: "Yes. Playground → Memory lets you turn memory off, edit or delete individual facts and clear all memory. Temporary chats do not use memory. Contact Stilledev for broader data requests.", sv: "Ja. Playground → Minne låter dig stänga av minnet, redigera eller radera enskilda fakta och rensa allt minne. Tillfälliga samtal använder inte minnet. Kontakta Stilledev för bredare databegäran." } },
  { q: { en: "Are AI answers guaranteed to be correct?", sv: "Är AI-svar garanterat korrekta?" }, a: { en: "No. AI output can be incomplete or wrong. Review important content, verify facts and sources, and do not rely on BudAI alone for consequential decisions.", sv: "Nej. AI-svar kan vara ofullständiga eller felaktiga. Granska viktigt innehåll, verifiera fakta och källor och förlita dig inte enbart på BudAI för betydelsefulla beslut." } },
  { q: { en: "Is image generation available to everyone?", sv: "Är bildgenerering tillgängligt för alla?" }, a: { en: "No universal availability is claimed. The integration requires a signed-in account and a deployment with OpenAI image generation configured. Image analysis is the currently documented account capability.", sv: "Ingen allmän tillgänglighet utlovas. Integrationen kräver ett inloggat konto och en driftsättning där OpenAI-bildgenerering är konfigurerad. Bildanalys är den dokumenterade kontofunktionen idag." } },
];

export default function KnowledgeView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const sections = useMemo(() => !normalized ? SECTIONS : SECTIONS.filter((section) => [section.title[lang], section.intro[lang], ...section.points.flatMap((point) => [point.title[lang], point.body[lang]])].join(" ").toLowerCase().includes(normalized)), [lang, normalized]);
  const faqs = useMemo(() => !normalized ? FAQ : FAQ.filter((item) => `${item.q[lang]} ${item.a[lang]}`.toLowerCase().includes(normalized)), [lang, normalized]);

  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <PageHero
        kicker={{ en: "KNOWLEDGE CENTER", sv: "KUNSKAPSCENTER" }}
        title={{ en: "Understand the workspace.", sv: "Förstå arbetsytan." }}
        description={{ en: "Clear answers about models, memory, privacy, image and voice capabilities, Workspace and the current developer preview—based on how BudAI is actually implemented.", sv: "Tydliga svar om modeller, minne, integritet, bild- och röstfunktioner, Workspace och den aktuella utvecklarpreviewn — utifrån hur BudAI faktiskt är implementerat." }}
      >
        <label className="v2-knowledge-search"><Search size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={sv ? "Sök i kunskapscentret…" : "Search the Knowledge Center…"} aria-label={sv ? "Sök i kunskapscentret" : "Search the Knowledge Center"} />{query && <button type="button" onClick={() => setQuery("")}>{sv ? "Rensa" : "Clear"}</button>}</label>
      </PageHero>

      <div className="v2-container v2-knowledge-layout">
        <aside className="v2-knowledge-nav"><div><BookOpen size={16} /><span>{sv ? "ÄMNEN" : "TOPICS"}</span></div><nav aria-label={sv ? "Kunskapsämnen" : "Knowledge topics"}>{SECTIONS.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title[lang]}<ArrowRight size={12} /></a>)}<a href="#faq">FAQ<ArrowRight size={12} /></a></nav><p>{sv ? "Behöver du formell information?" : "Need the formal wording?"}<Link href="/legal/data">{sv ? "Så hanteras dina data" : "How your data is handled"}<ArrowUpRight size={12} /></Link></p></aside>
        <div className="v2-knowledge-content">
          <p className="v2-search-status" aria-live="polite">{normalized ? (sv ? `${sections.length + faqs.length} träffar för ”${query}”` : `${sections.length + faqs.length} results for “${query}”`) : (sv ? "Sex guider och vanliga frågor" : "Six guides and frequently asked questions")}</p>
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section id={section.id} key={section.id} className="v2-knowledge-section" aria-labelledby={`knowledge-${section.id}`}>
                <div className="v2-knowledge-section-heading"><div><Icon size={21} /><span>0{index + 1}</span></div><h2 id={`knowledge-${section.id}`}>{section.title[lang]}</h2><p>{section.intro[lang]}</p></div>
                <div className="v2-knowledge-points">{section.points.map((point) => <article key={point.title.en}><h3>{point.title[lang]}</h3><p>{point.body[lang]}</p></article>)}</div>
              </section>
            );
          })}
          {faqs.length > 0 && <section id="faq" className="v2-knowledge-section v2-faq" aria-labelledby="faq-title"><div className="v2-knowledge-section-heading"><div><Mic size={21} /><span>FAQ</span></div><h2 id="faq-title">{sv ? "Vanliga frågor" : "Frequently asked questions"}</h2><p>{sv ? "Snabba svar på det vanligaste om den aktuella previewn." : "Quick answers about the current preview."}</p></div><div className="v2-faq-list">{faqs.map((item, index) => <details key={item.q.en} open={Boolean(normalized) || (!normalized && index === 0)}><summary>{item.q[lang]}<span>+</span></summary><p>{item.a[lang]}</p></details>)}</div></section>}
          {sections.length === 0 && faqs.length === 0 && <div className="v2-empty-state"><Search size={26} /><h2>{sv ? "Inga träffar" : "No results"}</h2><p>{sv ? "Prova ett bredare sökord, eller skicka frågan till Stilledev." : "Try a broader search, or send your question to Stilledev."}</p><button type="button" className="v2-button v2-button-secondary" onClick={() => setQuery("")}>{sv ? "Visa alla ämnen" : "Show all topics"}</button></div>}
          <div className="v2-knowledge-contact"><Database size={24} /><div><h2>{sv ? "Har du en annan fråga?" : "Have another question?"}</h2><p>{sv ? "Kontakta Stilledev direkt, eller skicka en produktfråga genom feedbackportalen." : "Contact Stilledev directly, or send a product question through the feedback portal."}</p></div><Link href="/feedback" className="v2-text-link">{sv ? "Ställ en fråga" : "Ask a question"}<ArrowRight size={15} /></Link></div>
        </div>
      </div>
    </main>
  );
}
