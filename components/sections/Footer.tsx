"use client";

import StatusPill from "@/components/ui/StatusPill";
import { useState, useEffect, useRef } from "react";
import { Github, MessageSquare, Linkedin, Mail, ArrowUpRight, X } from "lucide-react";
import BudAIWordmark from "@/components/ui/BudAIWordmark";
import {subscribeJourney} from "@/lib/experience/scroll";
import BudAILogo, { StilledevLink, StilledevMark } from "@/components/ui/BudAILogo";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/ui/LanguageContext";
import { openCookieSettings } from "@/lib/consent";

const groups = (lang: string) => [
  {
    title: lang === "sv" ? "Produkt" : "Product",
    links: [
      { label: lang === "sv" ? "Förmågor" : "Capabilities", href: "#capabilities" },
      { label: "AI Playground", href: "#playground" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: lang === "sv" ? "Företag" : "Company",
    links: [
      { label: "Stilledev", href: "https://stilledev.se", external: true },
      { label: lang === "sv" ? "Byggaren" : "Builder", href: "#about" },
      { label: lang === "sv" ? "Early access" : "Early access", href: "#waitlist" },
      { label: lang === "sv" ? "Paket" : "Plans", href: "#capabilities" },
      { label: lang === "sv" ? "Kontakt" : "Contact", href: "mailto:Stilleinc@hotmail.com" },
      { label: lang === "sv" ? "Skicka feedback" : "Send feedback", href: "mailto:Stilleinc@hotmail.com?subject=BudAI%20preview%20feedback" },
      { label: lang === "sv" ? "Vad är nytt" : "What's new", href: "/changelog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: lang === "sv" ? "Integritetspolicy" : "Privacy Policy", href: "/legal/privacy" },
      { label: lang === "sv" ? "Användarvillkor" : "Terms of Service", href: "/legal/terms" },
      { label: lang === "sv" ? "Cookiepolicy" : "Cookie Policy", href: "/legal/cookies" },
      { label: "GDPR", href: "/legal/gdpr" },
      { label: lang === "sv" ? "Så hanteras dina data" : "How your data is handled", href: "/legal/data" },
    ],
  },
];

const socials = [
  { icon: Github, href: "https://github.com/SnusStille", label: "GitHub" },
  { icon: MessageSquare, href: "https://discord.com/users/353944097301594123", label: "Discord" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:Stilleinc@hotmail.com", label: "Email" },
];

export default function Footer() {
  const footer=useRef<HTMLElement>(null);
  useEffect(()=>subscribeJourney(frame=>{const el=footer.current;if(!el)return;const p=frame.closing??0;el.style.setProperty("--closing-progress",String(p));el.dataset.closingProgress=p.toFixed(4);}),[]);
  const { lang, t } = useLang();
  const [showLegal, setShowLegal] = useState<string | null>(null);
  const groupsData = groups(lang);

  useEffect(() => {
    if (!showLegal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLegal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLegal]);

  const legalContent: Record<string, { title: string; content: string[] }> = {
    privacy: {
      title: lang === "sv" ? "Integritetspolicy" : "Privacy Policy",
      content: [
        lang === "sv"
          ? "BudAI värnar din integritet. Vi samlar bara in data som behövs för att leverera tjänsten (såsom väntelisteuppgifter, konto-e-post vid inloggning och kortlivade driftloggar). Personuppgifter behandlas enligt GDPR och lagras på säker infrastruktur."
          : "BudAI values your privacy. We only collect data necessary to provide the service (such as waitlist details, account email if you sign in, and short-lived operational logs). Personal information is processed in line with GDPR and stored on secure infrastructure.",
        lang === "sv"
          ? "Vi säljer inte dina data och delar aldrig personuppgifter med tredje part utan laglig grund eller ditt samtycke. Du kan när som helst begära tillgång, rättelse eller radering genom att kontakta Stilleinc@hotmail.com."
          : "We do not sell your data and never share personal data with third parties without a lawful basis or your consent. You can request access, correction, or deletion at any time by contacting Stilleinc@hotmail.com.",
        lang === "sv"
          ? "För inloggade konton är minnet på som standard: BudAI kan automatiskt spara beständiga fakta (namn, roll, företag, preferenser) som långtidsminnen. Du ser, stänger av, redigerar och raderar dem i Playground → Minne. Gästchattar sparar inga minnen."
          : "For signed-in accounts memory is on by default: BudAI may automatically save durable facts (name, role, company, preferences) as long-term memories. You can see, switch off, edit and delete them in Playground → Memory. Guest chats save no memories.",
      ],
    },
    terms: {
      title: lang === "sv" ? "Användarvillkor" : "Terms of Service",
      content: [
        lang === "sv"
          ? "Genom att använda BudAI godkänner du dessa villkor. Utvecklarförhandsvisningen tillhandahålls i befintligt skick och kan ändras, pausas eller ha dagliga kvoter utan föregående meddelande."
          : "By using BudAI, you agree to these terms. The developer preview is provided as-is and may change, pause, or enforce daily quotas without prior notice.",
        lang === "sv"
          ? "AI-svar kan innehålla fel — du ansvarar själv för hur du använder genererat innehåll. Använd inte BudAI för olaglig verksamhet eller för att missbruka infrastrukturen."
          : "AI output can contain mistakes — you are responsible for how you use generated content. Do not use BudAI for illegal activities or to abuse the infrastructure.",
      ],
    },
    cookies: {
      title: lang === "sv" ? "Cookiepolicy" : "Cookie Policy",
      content: [
        lang === "sv"
          ? "BudAI sparar bara det sajten behöver för att fungera: språkval, inloggningssession och ditt cookieval. Den lagringen är alltid aktiv."
          : "BudAI stores only what the site needs to work: your language choice, the sign-in session and your cookie choice. That storage is always active.",
        lang === "sv"
          ? "Anonym trafikanalys (Vercel Analytics) laddas bara om du trycker Acceptera. Vid Avböj laddas den inte alls, och vi använder inga tredjeparts-annonsspårare. Du kan ändra eller återkalla ditt val när som helst via Cookieinställningar i sidfoten."
          : "Anonymous traffic analytics (Vercel Analytics) loads only after you press Accept. If you decline it never loads, and we use no third-party ad trackers. You can change or withdraw your choice at any time via Cookie settings in the footer.",
      ],
    },
    data: {
      title: lang === "sv" ? "Så hanteras dina data" : "How your data is handled",
      content: [
        lang === "sv"
          ? "Playground-meddelanden skickas till vår AI-leverantör (Anthropic) för att skapa ett svar. Vi tränar inte egna modeller på dem och publicerar inte chattar. Ange inte känsliga uppgifter eller hemligheter i en förhandsvisning."
          : "Playground messages go to our AI provider (Anthropic) to generate a reply. We do not train our own models on them or publish chats. Do not enter sensitive data or secrets in a preview.",
        lang === "sv"
          ? "Gästchattar stannar i webbläsarens lokala lagring. För konton sparas historik, minne och dygnsräknare i databasen under kontots åtkomstregler — minnet är på som standard och kan stängas av, redigeras och raderas i Playground → Minne."
          : "Guest chats stay in your browser's local storage. For accounts, history, memory and daily counters are stored under your account's access rules — memory is on by default and can be switched off, edited and deleted in Playground → Memory.",
        lang === "sv"
          ? "Analys laddas bara efter Acceptera, delningslänkar är skrivskyddade och noindex, och driftloggar innehåller bara tokenantal, modell, nivå, löptid och utfall — aldrig innehåll, e-post, IP eller nycklar."
          : "Analytics loads only after Accept, share links are read-only and noindex, and operational logs contain only token counts, model, tier, duration and outcome — never content, email, IP or keys.",
      ],
    },
    gdpr: {
      title: "GDPR",
      content: [
        lang === "sv"
          ? "BudAI följer EU:s dataskyddsförordning (GDPR). Som användare har du följande rättigheter: rätt till tillgång, rätt till rättelse, rätt till radering, rätt till begränsning av behandling, rätt till dataportabilitet, och rätt att göra invändningar."
          : "BudAI complies with the EU General Data Protection Regulation (GDPR). As a user, you have the following rights: right of access, right to rectification, right to erasure, right to restriction of processing, right to data portability, and right to object.",
        lang === "sv"
          ? "Personuppgiftsansvarig: Stilledev. Kontakta oss på Stilleinc@hotmail.com för frågor om GDPR eller för att utöva dina rättigheter."
          : "Data controller: Stilledev. Contact us at Stilleinc@hotmail.com for GDPR questions or to exercise your rights.",
        lang === "sv"
          ? "Automatiskt minne är på som standard för konton. Du kan när som helst stänga av det eller radera enskilda minnen i Playground → Minne, och begära full radering via personuppgiftsansvarig."
          : "Automatic memory is on by default for accounts. You can turn it off or erase individual memories at any time in Playground → Memory, and request full erasure from the controller.",
      ],
    },
  };

  return (
    <footer ref={footer} id="continuation" className="site-footer relative border-t border-white/[0.04]">
      <div className="closing-composition">
        <div className="closing-field" aria-hidden="true"><span/><i data-outro-anchor/><span/></div>
        <span className="closing-kicker">{lang==="sv"?"SIGNALEN FORTSÄTTER":"THE SIGNAL CONTINUES"}</span>
        <h2>{lang==="sv"?"Fortsätt samtalet.":"Continue the conversation."}</h2>
        <p>{lang==="sv"?"Öppna Playground för att testa på svenska eller engelska — och var med när nästa steg byggs.":"Open the Playground to test live in Swedish or English — and help shape what gets built next."}</p>
        <a href="#playground">{lang==="sv"?"Tillbaka till Playground":"Back to Playground"}<ArrowUpRight size={15}/></a>
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5 group">
              <BudAILogo size="md" animated />
              <BudAIWordmark className="text-xl" />
            </a>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
              {lang === "sv"
                ? "Utvecklad i Sverige av Stilledev för riktigt arbete på svenska och engelska — med live Playground, minne du kan styra och tydlig väg från tanke till handling."
                : "Built in Sweden by Stilledev for real work in Swedish and English — featuring a live Playground, memory you control, and a clear path from raw context to action."}
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 hover:border-accent-cyan/20 border border-transparent transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {groupsData.map((g, gi) => (
            <div key={g.title}>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-1.5 w-1.5 rounded-full ${["bg-accent-cyan", "bg-accent-purple", "bg-accent-green"][gi % 3]}`} />
                {g.title}
              </h4>
              <ul className="space-y-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={"external" in l && l.external ? "_blank" : undefined}
                      rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        if (l.href.startsWith("/legal/")) {
                          e.preventDefault();
                          setShowLegal(l.href.replace("/legal/", ""));
                        }
                      }}
                      className="text-sm text-muted hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">{t.footer.rights}</p>
          <p className="text-sm text-muted flex items-center gap-1.5">
            {lang === "sv" ? "Utvecklad av" : "Developed by"}{" "}
            <StilledevLink showMark />
            <span className="text-muted/30">·</span>
            <span className="text-xs">Sweden</span>
          </p>
          <button
            type="button"
            onClick={openCookieSettings}
            className="text-xs text-muted underline decoration-white/20 underline-offset-4 hover:text-white transition-colors"
          >
            {lang === "sv" ? "Cookieinställningar" : "Cookie settings"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowLegal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 max-w-lg w-full rounded-2xl bg-[#0a0a14] border border-white/[0.08] p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-title"
            >
              <button
                className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
                onClick={() => setShowLegal(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 id="legal-title" className="text-xl font-bold text-white mb-4 pr-8">
                {legalContent[showLegal]?.title}
              </h3>
              <div className="space-y-3">
                {legalContent[showLegal]?.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              <a
                href={`/legal/${showLegal}`}
                className="mt-5 inline-flex items-center gap-1 text-sm text-accent-cyan hover:text-white transition-colors"
              >
                {lang === "sv" ? "Läs fullständig sida" : "View full page"}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex justify-center pb-4"><StatusPill /></div>
      <div className="closing-endline" aria-hidden="true"><i/></div>
    </footer>
  );
}
