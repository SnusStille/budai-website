"use client";

import Link from "next/link";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLink } from "@/components/ui/BudAILogo";

export default function SiteFooter() {
  const { lang, t } = useLang();

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/40">
          <span>{t.footer.rights}</span>
          <span className="hidden sm:inline text-white/15">·</span>
          <span className="flex items-center gap-1.5">
            {lang === "sv" ? "Utvecklad av" : "Developed by"} <StilledevLink />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-white/40">
          <Link href="/about" className="hover:text-white transition-colors">
            {t.nav.about}
          </Link>
          <Link href="/legal/privacy" className="hover:text-white transition-colors">
            {lang === "sv" ? "Integritet" : "Privacy"}
          </Link>
          <Link href="/legal/terms" className="hover:text-white transition-colors">
            {lang === "sv" ? "Villkor" : "Terms"}
          </Link>
          <a href="mailto:Stilleinc@hotmail.com" className="hover:text-white transition-colors">
            {lang === "sv" ? "Kontakt" : "Contact"}
          </a>
        </div>
      </div>
    </footer>
  );
}
