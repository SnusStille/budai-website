"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Cookie, Database, FileText, FlaskConical, History, Mail, Scale, Shield, UserRound } from "lucide-react";
import BackToBudAI from "@/components/ui/BackToBudAI";
import { useLang } from "@/components/ui/LanguageContext";

const PAGE_ICONS = { cookie: Cookie, data: Database, file: FileText, labs: FlaskConical, history: History, contact: Mail, gdpr: Scale, privacy: Shield, founder: UserRound };
type PageIcon = keyof typeof PAGE_ICONS;

type StandalonePageShellProps = {
  title: string;
  eyebrow?: string;
  icon: PageIcon;
  lang: "en" | "sv";
  enHref: string;
  svHref: string;
  backHref?: string;
  nativeBackLink?: boolean;
  children: ReactNode;
};

/** A shared, quiet reading surface for every supporting Stilledev page. */
export default function StandalonePageShell({
  title,
  eyebrow = "stilledev.se · BudAI",
  icon,
  lang,
  enHref,
  svHref,
  backHref,
  nativeBackLink = false,
  children,
}: StandalonePageShellProps) {
  const router = useRouter();
  const { setLang } = useLang();
  const Icon = PAGE_ICONS[icon];
  const selectLanguage = (next: "en" | "sv", href: string) => {
    setLang(next);
    if (href === window.location.pathname) router.refresh();
    else router.push(href);
  };

  return (
    <main id="main" tabIndex={-1} className="standalone-page-shell min-h-screen bg-background px-4 pb-16 pt-20 text-white sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <nav className="standalone-page-nav mb-8 flex items-center justify-between gap-3" aria-label={lang === "sv" ? "Sidnavigering och språk" : "Page navigation and language"}>
          <BackToBudAI href={backHref ?? (lang === "sv" ? "/sv" : "/")} lang={lang} nativeLink={nativeBackLink} />
          <div className="standalone-page-languages" role="group" aria-label={lang === "sv" ? "Välj språk" : "Choose language"}>
            <button type="button" aria-pressed={lang === "en"} onClick={() => selectLanguage("en", enHref)}>EN</button>
            <button type="button" aria-pressed={lang === "sv"} onClick={() => selectLanguage("sv", svHref)}>SV</button>
          </div>
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="standalone-page-card rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
        >
          <header className="standalone-page-card-header mb-6 flex items-center gap-3">
            <div className="standalone-page-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan/90 to-accent-purple/90">
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-0.5 font-mono text-[11px] text-muted">{eyebrow}</p>
            </div>
          </header>
          <div className="standalone-page-content">{children}</div>
        </motion.article>
      </div>
    </main>
  );
}
