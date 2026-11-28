"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, Share2, ArrowUpRight } from "lucide-react";
import StilledevWordmark from "@/components/ui/StilledevWordmark";
import { StilledevMark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { CONTACT_MAILTO } from "@/lib/contact";

const socials = [
  { icon: Github, href: "https://github.com/SnusStille", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", label: "LinkedIn" },
  { icon: Mail, href: CONTACT_MAILTO, label: "Email" },
];

export default function LabsFooter({ journeyStage }: { journeyStage: string }) {
  const { lang } = useLang();
  const isSv = lang === "sv";
  void journeyStage;
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "error">("idle");
  const [year] = useState(() => new Date().getFullYear());

  const groupsData = [
    {
      title: isSv ? "Produkt" : "Product",
      color: "bg-accent-cyan",
      links: [
        { label: isSv ? "BudAI" : "BudAI", href: isSv ? "/sv" : "/" },
        { label: isSv ? "Starta en ny upptäckt" : "Start a new discovery", href: isSv ? "/sv/labs" : "/labs", newTab: false },
        { label: isSv ? "Vad är nytt" : "What's new", href: "/changelog" },
      ],
    },
    {
      title: isSv ? "Företag" : "Company",
      color: "bg-accent-purple",
      links: [
        { label: "Oliver Stille", href: isSv ? "/sv/oliver-stille" : "/oliver-stille" },
        { label: isSv ? "Kontakt" : "Contact", href: isSv ? "/sv/contact" : "/contact" },
        { label: "Stilledev", href: "https://stilledev.se", external: true },
      ],
    },
    {
      title: isSv ? "Juridik" : "Legal",
      color: "bg-accent-green",
      links: [
        { label: isSv ? "Integritetspolicy" : "Privacy Policy", href: "/legal/privacy" },
        { label: isSv ? "Användarvillkor" : "Terms of Service", href: "/legal/terms" },
        { label: isSv ? "Cookiepolicy" : "Cookie Policy", href: "/legal/cookies" },
      ],
    },
  ];

  const shareLabs = async () => {
    const url = new URL(isSv ? "/sv/labs" : "/labs", window.location.origin).href;
    const payload = {
      title: isSv ? "Stilledev.Labs — Projektskisser på direkten" : "Stilledev.Labs — Project Blueprints Live",
      text: isSv ? "Upptäck Stilledev.Labs och få en projektskiss på några minuter." : "Try Stilledev.Labs and get a project blueprint in minutes.",
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
    <footer className="labs-footer-full">
      <div className="labs-footer-top-border" aria-hidden />
      <div className="labs-footer-inner">
        <div className="labs-footer-grid">
          {/* Brand column */}
          <div className="labs-footer-brand-col">
            <Link
              href={isSv ? "/sv/labs" : "/labs"}
              aria-label={isSv ? "Stilledev.Labs startsida" : "Stilledev.Labs home"}
              className="labs-footer-brand-link"
            >
              <StilledevWordmark size="md" showTagline={false} suffix="Labs" />
            </Link>
            <p className="labs-footer-desc">
              {isSv
                ? "Stilledev.Labs hjälper dig forma projektidéer till konkreta blåböcker. Utvecklat av Stilledev, grundat av Oliver Stille i Sverige."
                : "Stilledev.Labs turns project ideas into concrete blueprints. Built by Stilledev, founded by Oliver Stille in Sweden."}
            </p>
            <div className="labs-footer-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  aria-label={s.label}
                  className="labs-footer-social-btn"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {groupsData.map((g) => (
            <nav key={g.title} aria-label={g.title} className="labs-footer-nav-col">
              <h4 className="labs-footer-nav-title">
                <span className={`labs-footer-nav-dot ${g.color}`} />
                {g.title}
              </h4>
              <ul className="labs-footer-nav-list">
                {g.links.map((l) => {
                  const isExt = (l as any).external;
                  const LinkTag: any = isExt ? "a" : Link;
                  const linkProps: any = isExt
                    ? { href: l.href, target: "_blank", rel: "noopener noreferrer" }
                    : { href: l.href };
                  return (
                    <li key={l.label}>
                      <LinkTag {...linkProps} className="labs-footer-nav-link">
                        {l.label}
                        <ArrowUpRight className="w-3 h-3 labs-footer-arrow" />
                      </LinkTag>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        {/* Share row */}
        <div className="labs-footer-share-row">
          <button
            type="button"
            onClick={shareLabs}
            className="labs-footer-share-btn"
            aria-label={isSv ? "Dela Labs" : "Share Labs"}
          >
            <Share2 className="h-4 w-4 text-accent-cyan" aria-hidden />
            {shareState === "shared"
              ? (isSv ? "Delat" : "Shared")
              : shareState === "copied"
                ? (isSv ? "Länk kopierad" : "Link copied")
                : shareState === "error"
                  ? (isSv ? "Kunde inte dela" : "Could not share")
                  : (isSv ? "Dela Labs" : "Share Labs")}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {shareState === "shared"
              ? (isSv ? "Delningsmenyn öppnad." : "Share sheet opened.")
              : shareState === "copied"
                ? (isSv ? "Länk kopierad." : "Link copied.")
                : shareState === "error"
                  ? (isSv ? "Kunde inte dela eller kopiera länken." : "Could not share or copy the link.")
                  : ""}
          </span>
        </div>

        {/* Bottom row */}
        <div className="labs-footer-bottom">
          <p className="labs-footer-copy">
            © {year} {isSv ? "Stilledev. Alla rättigheter förbehållna." : "Stilledev. All rights reserved."}
          </p>
          <p className="labs-footer-credit">
            {isSv ? "Utvecklad av" : "Developed by"}{" "}
            <span className="labs-footer-stilledev">
              <StilledevMark size={16} />
              Stilledev
            </span>
            <span className="labs-footer-dot">·</span>
            <span className="text-xs">{isSv ? "Sverige" : "Sweden"}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
