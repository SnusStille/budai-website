"use client";

import type { LegalSlug } from "@/lib/legal-slugs";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, Cookie, Scale, Database } from "lucide-react";
import Link from "next/link";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

type Page = {
  title: { en: string; sv: string };
  icon: React.ElementType;
  paragraphs: { en: string[]; sv: string[] };
};

const content: Record<LegalSlug, Page> = {
  privacy: {
    title: { en: "Privacy Policy", sv: "Integritetspolicy" },
    icon: Shield,
    paragraphs: {
      en: [
        "BudAI values your privacy. We only collect data necessary to provide our services. Personal information is processed in line with GDPR and stored on secure infrastructure.",
        "We do not sell your data. We do not share personal data with third parties without a lawful basis or your consent where required.",
        "Data we may process includes: waitlist contact details, account email (if you sign in), saved memory facts (signed-in accounts), anonymized usage metrics, and short-lived API logs needed to operate the preview.",
        "Memory (signed-in accounts): memory is on by default. The assistant may automatically save durable facts it notices in a chat — such as your name, role, company or preferences — as separate long-term memories tied to your account, and use them to shape later replies. Open Playground → Memory to see every saved fact, switch memory off, or edit and delete them. Guest chats save no memories.",
        "You can request access, correction, or deletion by contacting Stilleinc@hotmail.com. We will respond within a reasonable time under GDPR.",
      ],
      sv: [
        "BudAI värnar din integritet. Vi samlar bara in data som behövs för att leverera tjänsten. Personuppgifter behandlas enligt GDPR och lagras på säker infrastruktur.",
        "Vi säljer inte dina data. Vi delar inte personuppgifter med tredje part utan laglig grund eller ditt samtycke när det krävs.",
        "Uppgifter vi kan behandla: kontaktuppgifter från väntelistan, konto-e-post (om du loggar in), sparade minnesfakta (inloggade konton), anonymiserad användningsstatistik och kortlivade API-loggar för preview-drift.",
        "Minne (inloggade konton): minnet är på som standard. Assistenten kan automatiskt spara beständiga fakta den upptäcker i ett samtal — till exempel namn, roll, företag eller preferenser — som separata långtidsminnen kopplade till ditt konto och använda dem i senare svar. Öppna Playground → Minne för att se alla sparade fakta, stänga av minnet eller redigera och radera dem. Gästchattar sparar inga minnen.",
        "Du kan begära tillgång, rättelse eller radering via Stilleinc@hotmail.com. Vi svarar inom rimlig tid enligt GDPR.",
      ],
    },
  },
  terms: {
    title: { en: "Terms of Service", sv: "Användarvillkor" },
    icon: FileText,
    paragraphs: {
      en: [
        "By using BudAI you agree to these terms. The developer preview is provided as-is and may change, pause, or have limits without notice.",
        "Do not use BudAI for illegal activity or to abuse infrastructure. We may restrict access that harms the service or other users.",
        "AI output can be wrong. You are responsible for how you use generated content. BudAI is not liable for decisions made solely on AI output.",
        "Intellectual property in the BudAI product remains with Stilledev. You retain rights to your own inputs and content.",
      ],
      sv: [
        "Genom att använda BudAI godkänner du villkoren. Utvecklarförhandsvisningen tillhandahålls i befintligt skick och kan ändras, pausas eller begränsas utan föregående meddelande.",
        "Använd inte BudAI för olaglig verksamhet eller för att missbruka infrastruktur. Vi kan begränsa åtkomst som skadar tjänsten eller andra användare.",
        "AI-svar kan vara felaktiga. Du ansvarar för hur du använder genererat innehåll. BudAI ansvarar inte för beslut som enbart baseras på AI-output.",
        "Immateriella rättigheter till BudAI-produkten tillhör Stilledev. Du behåller rättigheterna till ditt eget innehåll.",
      ],
    },
  },
  cookies: {
    title: { en: "Cookie Policy", sv: "Cookiepolicy" },
    icon: Cookie,
    paragraphs: {
      en: [
        "BudAI stores only what the site and sign-in need to function: your language preference, the session, and your cookie choice. That storage is always active.",
        "Anonymous traffic analytics (Vercel Analytics) is loaded only after you press Accept. If you decline, it is not loaded at all. We do not use third-party ad trackers.",
        "You can change or withdraw your choice at any time with Cookie settings in the footer, or clear site data in your browser.",
      ],
      sv: [
        "BudAI sparar bara det sajten och inloggningen behöver: språkval, session och ditt cookieval. Den lagringen är alltid aktiv.",
        "Anonym trafikanalys (Vercel Analytics) laddas bara efter att du tryckt Acceptera. Om du avböjer laddas den inte alls. Vi använder inga tredjeparts-annonsspårare.",
        "Du kan ändra eller återkalla ditt val när som helst via Cookieinställningar i sidfoten, eller rensa webbplatsdata i webbläsaren.",
      ],
    },
  },
  data: {
    title: { en: "How your data is handled", sv: "Så hanteras dina data" },
    icon: Database,
    paragraphs: {
      en: [
        "This page is a plain-language summary of what happens to what you type into BudAI during the developer preview. The Privacy Policy and the GDPR page contain the formal wording.",
        "Playground messages are sent to our AI provider (Anthropic) to produce a reply. We do not train our own models on your messages and we do not publish chats. Because this is a preview, do not enter sensitive personal data, passwords, API keys or other secrets.",
        "Guest mode: conversations, drafts and routines stay in your browser's local storage. No account is created, no long-term memory is saved, and those chats are not written to our database.",
        "Signed-in accounts: thread history, saved memory facts and daily usage counters are stored in our database under your account's access rules (row-level security). Memory is on by default. Playground → Memory shows every saved fact and lets you switch memory off, edit a fact or delete it.",
        "Waitlist: we store what you submit only when you tick the consent box. A signed, httpOnly cookie lets you look up your own status; that lookup runs on the server and never exposes the database to the browser.",
        "Analytics: Vercel Analytics loads only after you press Accept. If you decline, it does not load at all. No third-party advertising trackers are used.",
        "Shared conversations are stored read-only on the server and share pages are marked noindex. Treat a share link as public.",
        "Operational data: daily rate-limit counters and one-line JSON logs with a random request id. Logs record token counts, model, tier, duration and outcome — never prompts, message bodies, emails, IP addresses or keys.",
        "This is a developer preview, so features and data handling may change. For access, correction or deletion, see the GDPR page.",
      ],
      sv: [
        "Den här sidan är en lättläst sammanfattning av vad som händer med det du skriver i BudAI under utvecklarförhandsvisningen. Integritetspolicyn och GDPR-sidan innehåller de formella formuleringarna.",
        "Playground-meddelanden skickas till vår AI-leverantör (Anthropic) för att skapa ett svar. Vi tränar inte egna modeller på dina meddelanden och publicerar inte chattar. Eftersom detta är en förhandsvisning: ange inte känsliga personuppgifter, lösenord, API-nycklar eller andra hemligheter.",
        "Gästläge: samtal, utkast och rutiner sparas i webbläsarens lokala lagring. Inget konto skapas, inget långtidsminne sparas och dessa chattar skrivs inte till vår databas.",
        "Inloggade konton: trådhistorik, sparade minnesfakta och dygnsräknare lagras i vår databas under kontots åtkomstregler (radnivåsäkerhet). Minnet är på som standard. Playground → Minne visar alla sparade fakta och låter dig stänga av minnet, redigera eller radera fakta.",
        "Väntelista: vi sparar det du skickar in bara när du kryssar i samtyckesrutan. En signerad httpOnly-kaka låter dig slå upp din egen status; uppslagningen sker på servern och exponerar aldrig databasen för webbläsaren.",
        "Analys: Vercel Analytics laddas bara efter att du tryckt Acceptera. Avböjer du laddas den inte alls. Vi använder inga tredjeparts-annonsspårare.",
        "Delade samtal lagras skrivskyddat på servern och delningssidor markeras med noindex. Behandla en delningslänk som offentlig.",
        "Driftdata: dygnsvisa begränsningsräknare och enradiga JSON-loggar med ett slumpmässigt request-id. Loggarna innehåller tokenantal, modell, nivå, löptid och utfall — aldrig promptar, meddelandeinnehåll, e-postadresser, IP-adresser eller nycklar.",
        "Detta är en utvecklarförhandsvisning, så funktioner och datahantering kan ändras. För tillgång, rättelse eller radering, se GDPR-sidan.",
      ],
    },
  },
  gdpr: {
    title: { en: "GDPR", sv: "GDPR" },
    icon: Scale,
    paragraphs: {
      en: [
        "BudAI is designed with GDPR in mind. Your rights include access, rectification, erasure, restriction, portability, and objection where applicable.",
        "Controller contact: Stilledev · Stilleinc@hotmail.com.",
        "Processing bases may include consent (waitlist/marketing), contract/pre-contract steps (account), and legitimate interests (security, service improvement) balanced against your rights.",
        "Automatic long-term memory is part of the account service and is on by default. You can turn it off or erase individual facts at any time in Playground → Memory, and you can request full erasure by contacting the controller.",
        "If a personal data breach occurs that requires notification, we will follow applicable GDPR timelines.",
      ],
      sv: [
        "BudAI är utformad med GDPR i åtanke. Dina rättigheter inkluderar tillgång, rättelse, radering, begränsning, dataportabilitet och invändning där det är tillämpligt.",
        "Personuppgiftsansvarig: Stilledev · Stilleinc@hotmail.com.",
        "Rättslig grund kan vara samtycke (väntelista), avtal/förberedande steg (konto) och berättigat intresse (säkerhet, förbättring) vägt mot dina rättigheter.",
        "Automatiskt långtidsminne ingår i kontotjänsten och är på som standard. Du kan när som helst stänga av det eller radera enskilda fakta i Playground → Minne, och begära full radering via personuppgiftsansvarig.",
        "Om en personuppgiftsincident inträffar som kräver anmälan följer vi tillämpliga GDPR-tidsramar.",
      ],
    },
  },
};

export default function LegalView({ slug }: { slug: LegalSlug }) {
  const page = content[slug];
  const Icon = page.icon;
  const { lang } = useLang();
  const L = lang === "sv" ? "sv" : "en";

  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-white pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {L === "sv" ? "Tillbaka till BudAI" : "Back to BudAI"}
          </Link>
          <BudAILogo size="sm" animated />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan/90 to-accent-purple/90 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{page.title[L]}</h1>
              <p className="text-[11px] text-muted font-mono mt-0.5">stilledev.se · BudAI</p>
            </div>
          </div>

          <div className="space-y-4">
            {page.paragraphs[L].map((p, i) => (
              <p key={i} className="text-sm sm:text-[15px] text-muted leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted/60">
            {L === "sv"
              ? "Detta är en tydlig preview-policy. Fullständiga bolagsdokument kan uppdateras före bred lansering."
              : "This is a clear preview policy. Full company documents may be updated before broader launch."}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
