"use client";

import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

export default function Footer() {
  const { lang } = useLang();
  const isSv = lang === "sv";

  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr] lg:gap-16">
          <div>
            <a href="#home" className="inline-flex items-center gap-3" aria-label="BudAI home">
              <BudAILogo size="sm" animated={false} />
              <span className="text-lg font-semibold tracking-tight text-white">Bud<span className="text-[var(--cyan)]">AI</span></span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/48">
              {isSv
                ? "En AI-arbetsassistent i tidig förhandsvisning. Byggd i Sverige av Stilledev."
                : "An AI work assistant in early preview. Built in Sweden by Stilledev."}
            </p>
          </div>

          <div>
            <h2 className="footer-heading">{isSv ? "Utforska" : "Explore"}</h2>
            <ul className="footer-link-list">
              <li><a href="#playground">Playground</a></li>
              <li><a href="#about">{isSv ? "Om BudAI" : "About BudAI"}</a></li>
              <li><a href="#waitlist">{isSv ? "Early access" : "Early access"}</a></li>
              <li><a href="https://stilledev.se" target="_blank" rel="noopener noreferrer">Stilledev</a></li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">{isSv ? "Information" : "Information"}</h2>
            <ul className="footer-link-list">
              <li><a href="/legal/privacy">{isSv ? "Integritetspolicy" : "Privacy policy"}</a></li>
              <li><a href="/legal/terms">{isSv ? "Användarvillkor" : "Terms of service"}</a></li>
              <li><a href="/legal/cookies">{isSv ? "Cookiepolicy" : "Cookie policy"}</a></li>
              <li><a href="mailto:Stilleinc@hotmail.com">{isSv ? "Kontakta oss" : "Contact"}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom mt-10 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BudAI · Stilledev</p>
          <p>{isSv ? "Preview först. Vi bygger vidare." : "Preview first. Still building."}</p>
        </div>
      </div>
    </footer>
  );
}
