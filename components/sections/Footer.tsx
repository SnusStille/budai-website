"use client";

import StatusPill from "@/components/ui/StatusPill";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail, ArrowUpRight, Share2 } from "lucide-react";
import {subscribeJourney} from "@/lib/experience/scroll";
import StilledevWordmark from "@/components/ui/StilledevWordmark";
import { useLang } from "@/components/ui/LanguageContext";
import { CONTACT_MAILTO } from "@/lib/contact";

const groups = (lang: string) => [
  {
    title: lang === "sv" ? "Produkt" : "Product",
    links: [
      { label: lang === "sv" ? "Förmågor" : "Capabilities", href: "#capabilities" },
      { label: lang === "sv" ? "Vanliga frågor" : "FAQ", href: "#faq" },
      { label: "AI Playground", href: "#playground" },
      { label: "Roadmap", href: "#roadmap" },
      { label: lang === "sv" ? "Väntelista" : "Waitlist", href: "#waitlist" },
    ],
  },
  {
    title: lang === "sv" ? "Företag" : "Company",
    links: [
      { label: "Oliver Stille", href: lang === "sv" ? "/sv/oliver-stille" : "/oliver-stille" },
      { label: lang === "sv" ? "Om Stilledev" : "About Stilledev", href: "#about" },
      { label: lang === "sv" ? "Kontakt" : "Contact", href: lang === "sv" ? "/sv/contact" : "/contact" },
      { label: lang === "sv" ? "Vad är nytt" : "What's new", href: "/changelog" },
    ],
  },
  {
    title: lang === "sv" ? "Juridik" : "Legal",
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
  { icon: Linkedin, href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", label: "LinkedIn" },
  { icon: Mail, href: CONTACT_MAILTO, label: "Email" },
];

export default function Footer() {
  const footer=useRef<HTMLElement>(null);
  useEffect(()=>subscribeJourney(frame=>{const el=footer.current;if(!el)return;const p=frame.closing??0;el.style.setProperty("--closing-progress",String(p));el.dataset.closingProgress=p.toFixed(4);}),[]);
  const { lang, t } = useLang();
  const groupsData = groups(lang);
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "error">("idle");

  const shareBudAI = async () => {
    const url = new URL(lang === "sv" ? "/sv" : "/", window.location.origin).href;
    const payload = {
      title: "BudAI by Stilledev",
      text: lang === "sv" ? "Upptäck BudAI från Stilledev." : "Explore BudAI by Stilledev.",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 2400);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 3000);
    }
  };


  return (
    <footer ref={footer} id="continuation" className="site-footer relative border-t border-white/[0.04]">
      <div className="closing-composition">
        <div className="closing-field" aria-hidden="true"><span/><i data-outro-anchor/><span/></div>
        <span className="closing-kicker">{lang==="sv"?"STILLEDEV · BUDAI":"STILLEDEV · BUDAI"}</span>
        <h2>{lang==="sv"?"Prova BudAI.":"Try BudAI."}</h2>
        <p>{lang==="sv"?"Testa arbetsytan på svenska eller engelska. För projektförfrågningar och samarbeten, kontakta Stilledev.":"Try the workspace in Swedish or English. For project enquiries and collaborations, contact Stilledev."}</p>
        <a href="#playground">{lang==="sv"?"Öppna Playground":"Open the Playground"}<ArrowUpRight size={15}/></a>
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-16">
        <div className="site-footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href={lang === "sv" ? "/sv" : "/"} aria-label={lang === "sv" ? "Stilledev startsida" : "Stilledev home"} className="flex items-center gap-3 mb-5 group">
              <StilledevWordmark size="md" suffix="BudAI" />
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
              {lang === "sv"
                ? "BudAI utvecklas av Stilledev, grundat av Oliver Stille i Sverige. En AI-arbetsyta för skrivande, planering och analys på svenska och engelska."
                : "BudAI is built by Stilledev, founded by Oliver Stille in Sweden. An AI workspace for writing, planning and analysis in Swedish and English."}
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  aria-label={s.label}
                  className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 hover:border-accent-cyan/20 border border-transparent transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {groupsData.map((g, gi) => (
            <nav key={g.title} aria-label={g.title} className="site-footer-nav">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-1.5 w-1.5 rounded-full ${["bg-accent-cyan", "bg-accent-purple", "bg-accent-green"][gi % 3]}`} />
                {g.title}
              </h4>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="min-h-8 text-sm text-muted hover:text-white focus-visible:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-white/[0.04] pt-6">
          <button type="button" onClick={shareBudAI} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors hover:border-accent-cyan/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            <Share2 className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
            {shareState === "shared" ? (lang === "sv" ? "Delat" : "Shared") : shareState === "copied" ? (lang === "sv" ? "Länk kopierad" : "Link copied") : shareState === "error" ? (lang === "sv" ? "Kunde inte dela" : "Could not share") : (lang === "sv" ? "Dela BudAI" : "Share BudAI")}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {shareState === "shared" ? (lang === "sv" ? "Delningsmenyn öppnad." : "Share sheet opened.") : shareState === "copied" ? (lang === "sv" ? "Länk kopierad." : "Link copied.") : shareState === "error" ? (lang === "sv" ? "Kunde inte dela eller kopiera länken." : "Could not share or copy the link.") : ""}
          </span>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">{t.footer.rights}</p>
          <p className="text-sm text-muted flex items-center gap-1.5">
            {lang === "sv" ? "Utvecklad av" : "Developed by"}{" "}
            <span className="text-accent-cyan font-medium">Stilledev</span>
            <span className="text-muted/30">·</span>
            <span className="text-xs">{lang === "sv" ? "Sverige" : "Sweden"}</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center pb-4"><StatusPill /></div>
      <div className="closing-endline" aria-hidden="true"><i/></div>
    </footer>
  );
}
