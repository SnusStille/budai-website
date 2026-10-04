"use client";

import { ArrowRight, ArrowUp, BadgePercent, Sparkles } from "lucide-react";
import BudAILogo, { StilledevLink, StilledevMark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

export default function Footer() {
  const { lang } = useLang();
  const isSv = lang === "sv";

  return (
    <footer className="site-footer relative overflow-hidden">
      <div className="footer-glow" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-10">
        {/* closing CTA */}
        <div className="footer-cta">
          <div className="min-w-0">
            <span className="footer-cta-kicker">
              <BadgePercent className="h-3.5 w-3.5" />
              {isSv ? "Founding members" : "Founding members"}
            </span>
            <h2>
              {isSv ? "Testa BudAI i dag — och lås " : "Try BudAI today — and lock in "}
              <span className="text-gradient">10 %</span>
              {isSv ? " för framtiden." : " for the future."}
            </h2>
            <p>
              {isSv
                ? "Playground är öppen utan konto. Väntelistan ger dig early access och founding-rabatten."
                : "The Playground is open without an account. The waitlist gives you early access and the founding discount."}
            </p>
          </div>
          <div className="footer-cta-actions">
            <a href="#playground" className="button-primary group">
              <span>{isSv ? "Öppna Playground" : "Open the Playground"}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a href="#waitlist" className="button-secondary">
              <Sparkles className="h-4 w-4" />
              <span>{isSv ? "Gå med i väntelistan" : "Join the waitlist"}</span>
            </a>
          </div>
        </div>

        <div className="grid gap-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr] lg:gap-12">
          <div>
            <a href="#home" className="inline-flex items-center gap-3" aria-label="BudAI home">
              <BudAILogo size="sm" animated motion="idle" />
              <span className="text-lg font-semibold tracking-tight text-white">
                Bud<span className="text-[var(--cyan)]">AI</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/48">
              {isSv
                ? "En AI-arbetsassistent i tidig förhandsvisning. Byggd i Sverige av Stilledev."
                : "An AI work assistant in early preview. Built in Sweden by Stilledev."}
            </p>
            <div className="footer-status">
              <span className="footer-status-dot" aria-hidden />
              <span>{isSv ? "Preview igång" : "Preview live"}</span>
              <span className="footer-status-sep" aria-hidden />
              <span>v5.3</span>
            </div>
          </div>

          <div>
            <h2 className="footer-heading">{isSv ? "Utforska" : "Explore"}</h2>
            <ul className="footer-link-list">
              <li>
                <a href="#playground">Playground</a>
              </li>
              <li>
                <a href="#about">{isSv ? "Om BudAI" : "About BudAI"}</a>
              </li>
              <li>
                <a href="#waitlist">{isSv ? "Early access" : "Early access"}</a>
              </li>
              <li>
                <a href="https://stilledev.se" target="_blank" rel="noopener noreferrer">
                  Stilledev
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">{isSv ? "Genvägar" : "Shortcuts"}</h2>
            <ul className="footer-link-list">
              <li>
                <span className="footer-kbd">
                  <kbd>⌘K</kbd> {isSv ? "Kommandon" : "Commands"}
                </span>
              </li>
              <li>
                <span className="footer-kbd">
                  <kbd>⌘N</kbd> {isSv ? "Ny chatt" : "New chat"}
                </span>
              </li>
              <li>
                <span className="footer-kbd">
                  <kbd>/</kbd> {isSv ? "Kommandon i fältet" : "Commands in the field"}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">{isSv ? "Information" : "Information"}</h2>
            <ul className="footer-link-list">
              <li>
                <a href="/logo" className="footer-link">
              Logo Lab
            </a>
            <a href="/legal/privacy">{isSv ? "Integritetspolicy" : "Privacy policy"}</a>
              </li>
              <li>
                <a href="/legal/terms">{isSv ? "Användarvillkor" : "Terms of service"}</a>
              </li>
              <li>
                <a href="/legal/cookies">{isSv ? "Cookiepolicy" : "Cookie policy"}</a>
              </li>
              <li>
                <a href="mailto:Stilleinc@hotmail.com">{isSv ? "Kontakta oss" : "Contact"}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <StilledevMark size={16} />
            © 2026 BudAI · {isSv ? "av " : "by "}
            <StilledevLink className="!text-white/60 hover:!text-white" />
          </p>
          <div className="flex items-center gap-4">
            <p>{isSv ? "Preview först. Vi bygger vidare." : "Preview first. Still building."}</p>
            <a href="#home" className="footer-top" aria-label={isSv ? "Till toppen" : "Back to top"}>
              <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
