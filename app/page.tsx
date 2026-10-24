"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SectionDots from "@/components/ui/SectionDots";
import CookieConsent from "@/components/ui/CookieConsent";
import BackToTop from "@/components/ui/BackToTop";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Waitlist from "@/components/sections/Waitlist";
import WhatIsBudAI from "@/components/sections/WhatIsBudAI";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import HeroAsk from "@/components/sections/HeroAsk";
import FeedbackButton from "@/components/ui/FeedbackButton";
import Journey from "@/components/sections/Journey";
import SiteChrome from "@/components/ui/SiteChrome";
import Footer from "@/components/sections/Footer";

const NeuralJourney = dynamic(() => import("@/components/sections/NeuralJourney"));
const About = dynamic(() => import("@/components/sections/About"));
const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"));

export default function Home() {
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
      document.title = document.visibilityState === "hidden" ? "Stilledev.se · BudAI" : originalTitle;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = originalTitle;
    };
  }, []);

  return (
    <main className="page-transition relative min-h-screen overflow-x-hidden bg-background text-white">
      <ScrollProgress />
      <SectionDots />
      <div className="pointer-events-none fixed inset-0 z-[1] ai-grid opacity-[0.28]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-[1] ai-vignette" aria-hidden />

      <div className="relative z-10">
        <Navbar />
        <SiteChrome />
        <FeedbackButton />
        <Hero />
        <WhatIsBudAI />
        <NeuralJourney />
        <HeroAsk />
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
      <CookieConsent />
    </main>
  );
}
