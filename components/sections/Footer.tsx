"use client";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
export default function Footer() {
  const { lang } = useLang();
  return (
    <footer className="site-width footer-final">
      <a href="#" className="brand-lockup">
        <BudAILogo size="xs" />
        <span>BudAI</span>
      </a>
      <span>
        developed by <strong>stilledev</strong> · Sweden
      </span>
      <div>
        <a href="/legal/privacy">{lang === "sv" ? "Integritet" : "Privacy"}</a>
        <a href="/legal/terms">{lang === "sv" ? "Villkor" : "Terms"}</a>
        <span>© {new Date().getFullYear()} Stilledev</span>
      </div>
    </footer>
  );
}
