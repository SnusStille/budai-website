"use client";

import { useState } from "react";
import { Cpu, Github, MessageSquare, Linkedin, Mail, ArrowUpRight, X, Shield, FileText, Cookie, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/components/ui/LanguageContext";

const groups = (lang: string) => [
  {
    title: lang === "sv" ? "Produkt" : "Product",
    links: [
      { label: lang === "sv" ? "Förmågor" : "Capabilities", href: "#capabilities" },
      { label: "AI Playground", href: "#playground" },
      { label: "Terminal", href: "#terminal" },
      { label: lang === "sv" ? "Roadmap" : "Roadmap", href: "#roadmap" },
      { label: lang === "sv" ? "Systemstatus" : "System Status", href: "#status" },
    ],
  },
  {
    title: lang === "sv" ? "Företag" : "Company",
    links: [
      { label: "Stilledev", href: "https://stilledev.se", external: true },
      { label: lang === "sv" ? "Karriär" : "Careers", href: "#waitlist" },
      { label: lang === "sv" ? "Kontakt" : "Contact", href: "mailto:Stilleinc@hotmail.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: lang === "sv" ? "Integritetspolicy" : "Privacy Policy", href: "/legal/privacy", icon: Shield },
      { label: lang === "sv" ? "Användarvillkor" : "Terms of Service", href: "/legal/terms", icon: FileText },
      { label: lang === "sv" ? "Cookiepolicy" : "Cookie Policy", href: "/legal/cookies", icon: Cookie },
      { label: "GDPR", href: "/legal/gdpr", icon: Scale },
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
  const { lang, t } = useLang();
  const [showLegal, setShowLegal] = useState<string | null>(null);
  const groupsData = groups(lang);

  const legalContent: Record<string, { title: string; content: string[] }> = {
    privacy: {
      title: lang === "sv" ? "Integritetspolicy" : "Privacy Policy",
      content: [
        lang === "sv"
          ? "BudAI värnar om din integritet. Vi samlar endast in data som är nödvändig för att tillhandahålla våra tjänster. All personlig information behandlas i enlighet med GDPR och lagras säkert på servrar inom EU."
          : "BudAI values your privacy. We only collect data necessary to provide our services. All personal information is processed in accordance with GDPR and stored securely on servers within the EU.",
        lang === "sv"
          ? "Vi delar aldrig din data med tredje part utan ditt uttryckliga samtycke. Du har rätt att begära radering av dina data när som helst genom att kontakta oss på Stilleinc@hotmail.com."
          : "We never share your data with third parties without your explicit consent. You have the right to request deletion of your data at any time by contacting us at Stilleinc@hotmail.com.",
      ],
    },
    terms: {
      title: lang === "sv" ? "Användarvillkor" : "Terms of Service",
      content: [
        lang === "sv"
          ? "Genom att använda BudAI godkänner du dessa villkor. Tjänsten tillhandahålls i befintligt skick och vi garanterar inte att den alltid är tillgänglig eller felfri."
          : "By using BudAI, you agree to these terms. The service is provided as-is and we do not guarantee that it will always be available or error-free.",
        lang === "sv"
          ? "Du får inte använda BudAI för olagliga aktiviteter eller på ett sätt som skadar vår infrastruktur. Vi förbehåller oss rätten att stänga av konton som bryter mot dessa villkor."
          : "You may not use BudAI for illegal activities or in a way that damages our infrastructure. We reserve the right to terminate accounts that violate these terms.",
      ],
    },
    cookies: {
      title: lang === "sv" ? "Cookiepolicy" : "Cookie Policy",
      content: [
        lang === "sv"
          ? "BudAI använder cookies för att förbättra din upplevelse och analysera trafik. Vi använder endast nödvändiga cookies och analytiska cookies med ditt samtycke."
          : "BudAI uses cookies to enhance your experience and analyze traffic. We only use necessary cookies and analytical cookies with your consent.",
        lang === "sv"
          ? "Du kan när som helst ändra dina cookie-inställningar eller återkalla ditt samtycke. Nödvändiga cookies kan inte inaktiveras eftersom de krävs för att webbplatsen ska fungera."
          : "You can change your cookie settings or withdraw your consent at any time. Necessary cookies cannot be disabled as they are required for the website to function.",
      ],
    },
    gdpr: {
      title: "GDPR",
      content: [
        lang === "sv"
          ? "BudAI följer EU:s dataskyddsförordning (GDPR). Som användare har du följande rättigheter: rätt till tillgång, rätt till rättelse, rätt till radering, rätt till begränsning av behandling, rätt till dataportabilitet, och rätt att göra invändningar."
          : "BudAI complies with the EU General Data Protection Regulation (GDPR). As a user, you have the following rights: right of access, right to rectification, right to erasure, right to restriction of processing, right to data portability, and right to object.",
        lang === "sv"
          ? "Personuppgiftsansvarig: Stilledev AB. Kontakta oss på Stilleinc@hotmail.com för frågor om GDPR eller för att utöva dina rättigheter."
          : "Data controller: Stilledev AB. Contact us at Stilleinc@hotmail.com for GDPR questions or to exercise your rights.",
      ],
    },
  };

  return (
    <footer className="relative border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Bud<span className="text-accent-cyan">AI</span></span>
            </a>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
              {lang === "sv"
                ? "En avancerad AI-plattform som hjälper svenska företag att spara tid, automatisera uppgifter och förbättra arbetsflöden."
                : "An advanced AI platform that helps Swedish companies save time, automate tasks, and improve workflows."}
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {groupsData.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{g.title}</h4>
              <ul className="space-y-3">
                {g.links.map((l: any) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
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

        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">© 2026 BudAI. {lang === "sv" ? "Alla rättigheter förbehållna." : "All rights reserved."}</p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted flex items-center gap-1.5">
              {lang === "sv" ? "Utvecklad av" : "Developed by"} <span className="text-accent-cyan font-medium">Stilledev</span>
              <span className="text-muted/30">·</span>
              <span className="text-xs">Sweden</span>
            </p>
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      {showLegal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLegal(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 max-w-lg w-full rounded-2xl bg-[#0a0a14] border border-white/[0.08] p-6 shadow-2xl"
          >
            <button
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
              onClick={() => setShowLegal(null)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 pr-8">{legalContent[showLegal]?.title}</h3>
            <div className="space-y-3">
              {legalContent[showLegal]?.content.map((paragraph, i) => (
                <p key={i} className="text-sm text-muted leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </footer>
  );
}