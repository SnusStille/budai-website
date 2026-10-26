"use client";

import { useEffect } from "react";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SectionDots from "@/components/ui/SectionDots";
import CookieConsent from "@/components/ui/CookieConsent";
import BackToTop from "@/components/ui/BackToTop";
import SurpriseToasts from "@/components/ui/SurpriseToasts";
import Signature from "@/components/ui/Signature";
import FocusMode from "@/components/ui/FocusMode";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import BrainScrollStory from "@/components/sections/BrainScrollStory";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import LazyEgg from "@/components/effects/LazyEgg";
import FeedbackButton from "@/components/ui/FeedbackButton";
import Journey from "@/components/sections/Journey";
import WhatsNew from "@/components/ui/WhatsNew";
import Shortcuts from "@/components/ui/Shortcuts";
import Footer from "@/components/sections/Footer";
import WorldStage from "@/components/experience/WorldStage";
import About from "@/components/sections/About";
import AIPlayground from "@/components/sections/AIPlayground";


export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("%cBudAI · Stilledev", "color:#00e5ff;font-weight:bold;");
    }

    let eggTimer = 0;
    let buffer = "";
    const target = "budai";
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable)
        return;
      buffer += e.key.toLowerCase();
      if (buffer.length > target.length) buffer = buffer.slice(-target.length);
      if (buffer === target) {
        console.log("%c🚀 Welcome, developer.", "color: #00e5ff; font-size: 14px; font-weight: bold;");
        console.log("%cYou found the easter egg.", "color: #2dd4bf; font-size: 12px;");
        document.documentElement.classList.add("egg-flash");
        clearTimeout(eggTimer);
        eggTimer = window.setTimeout(() => document.documentElement.classList.remove("egg-flash"), 1200);
        window.dispatchEvent(new Event("budai:egg"));
        buffer = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(eggTimer);
      document.documentElement.classList.remove("egg-flash");
    };
  }, []);

  useEffect(() => {
    const originalTitle = document.title;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        document.title = "Stilledev.se · BudAI";
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
    <main id="main" tabIndex={-1} className="journey-page relative min-h-screen text-white">
      <WorldStage />
      <ScrollProgress />
      <SectionDots />
      <div className="universe-atmosphere" aria-hidden="true" />

      <div className="relative z-10">
        <Navbar />
        <WhatsNew />
        <Shortcuts />
        <FeedbackButton />
        <LazyEgg />
        <Hero />
        <BrainScrollStory />
        <ErrorBoundary>
          <AIPlayground />
        </ErrorBoundary>
        <Capabilities />
        <About />
        <Journey />
        <Footer />
      </div>

      <BackToTop />
      <SurpriseToasts />
      <Signature />
      <FocusMode />
      <CookieConsent />
    </main>
  );
}
