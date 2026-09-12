"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, Cookie, Scale } from "lucide-react";
import Link from "next/link";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

type Page = {
  title: { en: string; sv: string };
  icon: React.ElementType;
  paragraphs: { en: string[]; sv: string[] };
};

const content: Record<string, Page> = {
  privacy: {
    title: { en: "Privacy Policy", sv: "Integritetspolicy" },
    icon: Shield,
    paragraphs: {
      en: [
        "BudAI values your privacy. We only collect data necessary to provide our services. Personal information is processed in line with GDPR and stored on secure infrastructure.",
        "We do not sell your data. We do not share personal data with third parties without a lawful basis or your consent where required.",
        "Data we may process includes: waitlist contact details, account email (if you sign in), anonymized usage metrics, and short-lived API logs needed to operate the preview.",
        "You can request access, correction, or deletion by contacting Stilleinc@hotmail.com. We will respond within a reasonable time under GDPR.",
      ],
      sv: [
        "BudAI värnar din integritet. Vi samlar bara in data som behövs för att leverera tjänsten. Personuppgifter behandlas enligt GDPR och lagras på säker infrastruktur.",
        "Vi säljer inte dina data. Vi delar inte personuppgifter med tredje part utan laglig grund eller ditt samtycke när det krävs.",
        "Uppgifter vi kan behandla: kontaktuppgifter från väntelistan, konto-e-post (om du loggar in), anonymiserad användningsstatistik och kortlivade API-loggar för preview-drift.",
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
        "BudAI uses necessary cookies/local storage so the site and auth can function (language preference, session, consent).",
        "With your consent we may use light analytics (e.g. Vercel Analytics) to understand traffic. You can decline non-essential cookies.",
        "You can clear site data in your browser at any time. We do not use invasive third-party ad trackers.",
      ],
      sv: [
        "BudAI använder nödvändiga cookies/local storage så att sajten och inloggning fungerar (språk, session, samtycke).",
        "Med ditt samtycke kan vi använda lätt analys (t.ex. Vercel Analytics) för att förstå trafik. Du kan tacka nej till icke-nödvändiga cookies.",
        "Du kan rensa webbplatsdata i webbläsaren när som helst. Vi använder inte aggressiva tredjeparts-annonsspårare.",
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
        "If a personal data breach occurs that requires notification, we will follow applicable GDPR timelines.",
      ],
      sv: [
        "BudAI är utformad med GDPR i åtanke. Dina rättigheter inkluderar tillgång, rättelse, radering, begränsning, dataportabilitet och invändning där det är tillämpligt.",
        "Personuppgiftsansvarig: Stilledev · Stilleinc@hotmail.com.",
        "Rättslig grund kan vara samtycke (väntelista), avtal/förberedande steg (konto) och berättigat intresse (säkerhet, förbättring) vägt mot dina rättigheter.",
        "Om en personuppgiftsincident inträffar som kräver anmälan följer vi tillämpliga GDPR-tidsramar.",
      ],
    },
  },
};

export default function LegalPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "privacy";
  const page = content[slug] || content.privacy;
  const Icon = page.icon;
  const { lang } = useLang();
  const L = lang === "sv" ? "sv" : "en";

  return (
    <main className="min-h-screen bg-background text-white pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {L === "sv" ? "Tillbaka till BudAI" : "Back to BudAI"}
          </Link>
          <BudAILogo size="sm" animated={false} />
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
