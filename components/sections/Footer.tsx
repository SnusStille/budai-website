"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowUpRight, Github, Linkedin, Mail, MessageSquare, X } from "lucide-react";
import BudAILogo, { StilledevLink } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const SOCIALS = [
  { icon: Github, href: "https://github.com/SnusStille", label: "GitHub" },
  { icon: MessageSquare, href: "https://discord.com/users/353944097301594123", label: "Discord" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:Stilleinc@hotmail.com", label: "Email" },
];

export default function Footer() {
  const { lang, t } = useLang();
  const sv = lang === "sv";
  const [showLegal, setShowLegal] = useState<string | null>(null);

  const groups = [
    {
      title: t.footer.product,
      links: [
        { label: t.nav.playground, href: "#playground" },
        { label: sv ? "Vad är BudAI?" : "What is BudAI?", href: "#budai" },
        { label: t.nav.vision, href: "#vision" },
        { label: "FAQ", href: "#faq" },
        { label: t.nav.waitlist, href: "#waitlist" },
        { label: sv ? "Läget / Roadmap" : "Status / Roadmap", href: "/roadmap" },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { label: "Stilledev", href: "https://stilledev.se", external: true },
        { label: t.footer.contact, href: "mailto:Stilleinc@hotmail.com" },
        { label: t.footer.pricing, href: "#waitlist" },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { label: sv ? "Integritetspolicy" : "Privacy Policy", href: "/legal/privacy" },
        { label: sv ? "Användarvillkor" : "Terms of Service", href: "/legal/terms" },
        { label: sv ? "Cookiepolicy" : "Cookie Policy", href: "/legal/cookies" },
        { label: "GDPR", href: "/legal/gdpr" },
      ],
    },
  ];

  const legalContent: Record<string, { title: string; content: string[] }> = {
    privacy: {
      title: sv ? "Integritetspolicy" : "Privacy Policy",
      content: [
        sv
          ? "BudAI värnar om din integritet. Vi samlar endast in data som är nödvändig för att tillhandahålla tjänsten — din e-post när du skriver upp dig på väntelistan, och dina konversationer om du väljer att skapa ett konto."
          : "BudAI values your privacy. We only collect data necessary to provide the service — your email when you join the waitlist, and your conversations if you choose to create an account.",
        sv
          ? "Vi delar aldrig din data med tredje part utan ditt uttryckliga samtycke. Du har rätt att begära radering av dina data när som helst genom att kontakta oss på Stilleinc@hotmail.com."
          : "We never share your data with third parties without your explicit consent. You have the right to request deletion of your data at any time by contacting us at Stilleinc@hotmail.com.",
      ],
    },
    terms: {
      title: sv ? "Användarvillkor" : "Terms of Service",
      content: [
        sv
          ? "Genom att använda BudAI godkänner du dessa villkor. Tjänsten är en utvecklarförhandsvisning och tillhandahålls i befintligt skick — vi garanterar inte att den alltid är tillgänglig eller felfri."
          : "By using BudAI you accept these terms. The service is a developer preview provided as-is — we do not guarantee that it is always available or error-free.",
        sv
          ? "Du får inte använda BudAI för olagliga aktiviteter eller på ett sätt som skadar vår infrastruktur. Vi förbehåller oss rätten att stänga av konton som bryter mot dessa villkor."
          : "You may not use BudAI for illegal activities or in a way that damages our infrastructure. We reserve the right to terminate accounts that violate these terms.",
      ],
    },
    cookies: {
      title: sv ? "Cookiepolicy" : "Cookie Policy",
      content: [
        sv
          ? "BudAI använder cookies för att hålla dig inloggad, komma ihåg ditt språkval och förstå hur sidan används. Analyscookies aktiveras endast med ditt samtycke."
          : "BudAI uses cookies to keep you signed in, remember your language choice, and understand how the site is used. Analytics cookies are only enabled with your consent.",
        sv
          ? "Du kan när som helst ändra dina cookie-inställningar eller återkalla ditt samtycke. Nödvändiga cookies kan inte inaktiveras eftersom de krävs för att webbplatsen ska fungera."
          : "You can change your cookie settings or withdraw consent at any time. Necessary cookies cannot be disabled since the site needs them to function.",
      ],
    },
    gdpr: {
      title: "GDPR",
      content: [
        sv
          ? "BudAI följer EU:s dataskyddsförordning (GDPR). Som användare har du rätt till tillgång, rättelse, radering, begränsning av behandling, dataportabilitet och att göra invändningar."
          : "BudAI complies with the EU General Data Protection Regulation (GDPR). As a user you have the right to access, rectification, erasure, restriction of processing, data portability, and to object.",
        sv
          ? "Personuppgiftsansvarig: Stilledev. Kontakta oss på Stilleinc@hotmail.com för frågor om GDPR eller för att utöva dina rättigheter."
          : "Data controller: Stilledev. Contact us at Stilleinc@hotmail.com for GDPR questions or to exercise your rights.",
      ],
    },
  };

  return (
    <footer className="relative border-t border-white/[0.06]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent"
      />

      <div className="mx-auto w-full max-w-shell px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ── Brand ───────────────────────────────────────────── */}
          <div className="lg:col-span-4">
            <a href="#playground" className="group inline-flex items-center gap-2.5" aria-label="BudAI">
              <BudAILogo size="md" animated />
              <span className="text-xl font-bold tracking-tight text-white">
                Bud<span className="text-accent-cyan">AI</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-muted">{t.footer.tagline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <a href="#playground" className="btn-ghost !px-4 !py-2.5 !text-[13px]">
                {sv ? "Till Playground" : "Back to Playground"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href="#waitlist" className="btn-quiet !text-[13px]">
                {t.nav.requestAccess}
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] border border-white/[0.07] bg-white/[0.025] text-muted transition-all duration-200 hover:border-accent-cyan/25 hover:bg-white/[0.06] hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Links ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {groups.map((g) => (
              <div key={g.title}>
                <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted/60">{g.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {g.links.map((l) => {
                    const isLegal = l.href.startsWith("/legal/");
                    const isRoute = l.href.startsWith("/") && !isLegal;
                    const className =
                      "group inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-white";
                    const inner = (
                      <>
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </>
                    );
                    return (
                      <li key={l.label}>
                        {isRoute ? (
                          <Link href={l.href} className={className}>
                            {inner}
                          </Link>
                        ) : (
                          <a
                            href={l.href}
                            target={"external" in l && l.external ? "_blank" : undefined}
                            rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                            onClick={(e) => {
                              if (isLegal) {
                                e.preventDefault();
                                setShowLegal(l.href.replace("/legal/", ""));
                              }
                            }}
                            className={className}
                          >
                            {inner}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.06] pt-7">
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted/60">
            <span className="preview-tag mt-[1px] shrink-0">{t.nav.preview}</span>
            {t.footer.previewNote}
          </p>

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-[12.5px] text-muted/70">{t.footer.rights}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="flex items-center gap-1.5 text-[12.5px] text-muted/70">
                {t.nav.developedBy} <StilledevLink showMark />
                <span className="text-muted/30">·</span>
                <span className="text-[11.5px]">Sweden</span>
              </p>
              <a
                href="#playground"
                className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-white/[0.08] px-2.5 py-1.5 text-[11.5px] text-muted transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan"
              >
                <ArrowUp className="h-3 w-3" />
                {t.footer.backToTop}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-[98] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowLegal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="card pg-scroll-thin relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-title"
            >
              <button
                type="button"
                className="icon-btn absolute right-4 top-4"
                onClick={() => setShowLegal(null)}
                aria-label={sv ? "Stäng" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
              <h3 id="legal-title" className="pr-8 text-xl font-bold text-white">
                {legalContent[showLegal]?.title}
              </h3>
              <div className="mt-4 space-y-3">
                {legalContent[showLegal]?.content.map((paragraph, i) => (
                  <p key={i} className="text-[13.5px] leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
              <Link
                href={`/legal/${showLegal}`}
                className="link-arrow mt-6 inline-flex text-[13px] text-accent-cyan"
              >
                {sv ? "Läs hela sidan" : "View the full page"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
