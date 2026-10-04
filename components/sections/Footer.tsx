"use client";

import Link from "next/link";
import { BadgePercent, Github } from "lucide-react";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

/** Quiet footer: who we are, where to go, and the launch offer. */
export default function Footer() {
  const { lang } = useLang();
  const isSv = lang === "sv";

  return (
    <footer className="site-footer relative overflow-hidden">
      <div className="footer-glow" aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="footer-top-row">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="BudAI — home">
            <BudAILogo size="sm" animated />
            <span className="footer-wordmark">
              Bud<span>AI</span>
            </span>
          </Link>
          <span className="footer-status">
            <span className="footer-status-dot" aria-hidden />
            {isSv ? "Tidig förhandsvisning" : "Early preview"}
          </span>
        </div>

        <p className="footer-lede">
          {isSv
            ? "En AI-arbetsassistent för svenska och engelska arbetsdagar. Under uppbyggnad — öppen att testa redan nu."
            : "An AI work assistant for Swedish and English workdays. Being built in the open — ready to try today."}
        </p>

        <div className="footer-columns">
          <nav aria-label={isSv ? "Sidor" : "Pages"}>
            <span className="footer-heading">{isSv ? "Sidor" : "Pages"}</span>
            <Link href="/">Playground</Link>
            <Link href="/about">{isSv ? "Om BudAI" : "About BudAI"}</Link>
            <Link href="/waitlist">{isSv ? "Väntelista" : "Waitlist"}</Link>
            <Link href="/logo">Logo Lab</Link>
          </nav>

          <nav aria-label={isSv ? "Juridik" : "Legal"}>
            <span className="footer-heading">{isSv ? "Juridik" : "Legal"}</span>
            <Link href="/legal/privacy">{isSv ? "Integritet" : "Privacy"}</Link>
            <Link href="/legal/terms">{isSv ? "Villkor" : "Terms"}</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/gdpr">GDPR</Link>
          </nav>

          <div className="footer-offer">
            <span className="footer-heading">{isSv ? "Erbjudande" : "Offer"}</span>
            <span className="footer-offer-chip">
              <BadgePercent className="h-3.5 w-3.5" />
              <strong>10%</strong>
              {isSv ? "vid lansering" : "off at launch"}
            </span>
            <Link href="/waitlist" className="footer-offer-link">
              {isSv ? "Säkra din plats" : "Reserve your spot"}
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <a
            href="https://github.com/SnusStille/budai-website"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-dev"
          >
            <span className="footer-dev-mark">
              <StilledevMark size={18} />
            </span>
            <span>
              <span className="footer-dev-label">{isSv ? "Utvecklad av" : "Developed by"}</span>
              <span className="footer-dev-name">Stilledev</span>
            </span>
          </a>

          <div className="footer-meta">
            <span>© {new Date().getFullYear()} BudAI</span>
            <span className="footer-meta-sep" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" />
              {isSv ? "Byggd i Kista, Stockholm" : "Built in Kista, Stockholm"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
