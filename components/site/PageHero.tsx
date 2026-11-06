"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import type { Localized } from "@/lib/roadmap";

export default function PageHero({ kicker, title, description, children }: { kicker: Localized; title: Localized; description: Localized; children?: ReactNode }) {
  const { lang } = useLang();
  return (
    <header className="v2-page-hero">
      <div className="v2-container">
        <nav className="v2-breadcrumb" aria-label={lang === "sv" ? "Brödsmulor" : "Breadcrumb"}><Link href="/">{lang === "sv" ? "Hem" : "Home"}</Link><ChevronRight size={12} /><span>{kicker[lang]}</span></nav>
        <div className="v2-page-hero-grid">
          <div><p className="v2-kicker">{kicker[lang]}</p><h1>{title[lang]}</h1></div>
          <div className="v2-page-hero-aside"><p>{description[lang]}</p>{children}</div>
        </div>
      </div>
    </header>
  );
}
