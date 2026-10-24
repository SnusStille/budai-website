"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SectionDots from "@/components/ui/SectionDots";
import CookieConsent from "@/components/ui/CookieConsent";
import BackToTop from "@/components/ui/BackToTop";
import SurpriseToasts from "@/components/ui/SurpriseToasts";
import Signature from "@/components/ui/Signature";
import FocusMode from "@/components/ui/FocusMode";
import BuddyCard from "@/components/sections/BuddyCard";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Waitlist from "@/components/sections/Waitlist";
import WhatIsBudAI from "@/components/sections/WhatIsBudAI";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import HeroAsk from "@/components/sections/HeroAsk";
import LazyEgg from "@/components/effects/LazyEgg";
import FeedbackButton from "@/components/ui/FeedbackButton";
import Journey from "@/components/sections/Journey";
import SiteChrome from "@/components/ui/SiteChrome";
import WhatsNew from "@/components/ui/WhatsNew";
import Shortcuts from "@/components/ui/Shortcuts";
import Footer from "@/components/sections/Footer";

const AIEnvironment = dynamic(() => import("@/components/effects/AIEnvironment"), {
  ssr: false,
});
const CursorGlow = dynamic(() => import("@/components/effects/CursorGlow"), { ssr: false });

const About = dynamic(() => import("@/components/sections/About"));
const AIBackdropFX = dynamic(() => import("@/components/effects/AIBackdropFX"), { ssr: false });
const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"));

/**
 * The BudAI product landing — the page this repository shipped as its home route.
 *
 * Every section, id, easter egg, console greeting, title swap and background layer from the
 * previous `/` is preserved here, so existing anchors (/#playground, #waitlist, #roadmap …)
 * and the Supabase auth redirect to `#playground` keep working with /budai appended. The
 * studio experience took over the root route; the product kept its own identity.
 */
export default function BudAIPage() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("%cBudAI · Stilledev", "color:#00e5ff;font-weight:bold;");
    }

    let buffer = "";
    const target = "budai";
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;
      buffer += e.key.toLowerCase();
      if (buffer.length > target.length) buffer = buffer.slice(-target.length);
      if (buffer === target) {
        console.log("%c🚀 Welcome, developer.", "color: #00e5ff; font-size: 14px; font-weight: bold;");
        console.log("%cYou found the easter egg.", "color: #2dd4bf; font-size: 12px;");
        document.documentElement.classList.add("egg-flash");
        setTimeout(() => document.documentElement.classList.remove("egg-flash"), 1200);
        window.dispatchEvent(new Event("budai:egg"));
        buffer = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const originalTitle = document.title;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        document.title = "BudAI — Stilledev";
      } else {
        document.title = originalTitle;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = originalTitle;
    };
  }, []);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="page-transition relative min-h-screen text-white overflow-x-hidden bg-background"
    >
      <ScrollProgress />
      <AIEnvironment />
      <CursorGlow />
      <SectionDots />
      <div className="fixed inset-0 z-[1] pointer-events-none ai-grid opacity-[0.35]" aria-hidden />
      <div className="fixed inset-0 z-[1] pointer-events-none ai-vignette" aria-hidden />
      <AIBackdropFX />

      <div className="relative z-10">
        {/* one-way door back to the studio, above the product's own nav */}
        <Link
          href="/"
          className="group relative z-[61] mx-auto mt-2 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] text-white/70 transition-colors hover:border-accent-cyan/40 hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden />
          STILLEDEV — the studio site
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
        <Navbar />
        <SiteChrome />
        <WhatsNew />
        <Shortcuts />
        <FeedbackButton />
        <LazyEgg />
        <Hero />
        <HeroAsk />
        <WhatIsBudAI />
        <ErrorBoundary>
          <AIPlayground />
        </ErrorBoundary>
        <Capabilities />
        <About />
        <Waitlist />
        <Journey />
        <Footer />
      </div>

      <BackToTop />
      <SurpriseToasts />
      <Signature />
      <FocusMode />
      <BuddyCard />
      <CookieConsent />
    </main>
  );
}
