"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import CookieConsent from "@/components/ui/CookieConsent";
import { useLang } from "@/components/ui/LanguageContext";

export default function AboutView() {
  const { t, lang } = useLang();

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[60vw] max-w-[640px] h-[40vh] rounded-full bg-accent-cyan/[0.06] blur-[120px]" />
      </div>
      <SiteNav />
      <main className="relative z-10 flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <BudAILogo size="lg" animated />
          <h1 className="mt-8 text-4xl sm:text-5xl font-bold tracking-[-0.04em]">{t.about.title}</h1>
          <p className="mt-5 text-lg text-white/68 leading-relaxed">{t.about.lede}</p>
          <p className="mt-4 text-[15px] text-white/50 leading-relaxed">{t.about.body}</p>
          <p className="mt-6 text-sm text-white/40">{t.about.nordic}</p>

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(lang === "sv"
              ? [
                  "Svenska + engelska i samma yta",
                  "Live Playground — testa nu",
                  "Minne och historik med konto",
                  "10 % rabatt för founding members",
                ]
              : [
                  "Swedish + English in one surface",
                  "Live Playground — try it now",
                  "Memory and history with an account",
                  "10% off for founding members",
                ]
            ).map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white/70"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100"
            >
              {t.about.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center h-11 px-6 rounded-full border border-white/12 text-sm text-white/80 hover:text-white"
            >
              {t.nav.joinWaitlist}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
