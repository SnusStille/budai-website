"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SectionDots from "@/components/ui/SectionDots";
import CookieConsent from "@/components/ui/CookieConsent";
import BackToTop from "@/components/ui/BackToTop";
import Navbar from "@/components/sections/Navbar";
import PlaygroundIntro from "@/components/sections/PlaygroundIntro";
import WhatIsBudAI from "@/components/sections/WhatIsBudAI";
import Vision from "@/components/sections/Vision";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";

const AIEnvironment = dynamic(() => import("@/components/effects/AIEnvironment"), { ssr: false });
const CursorGlow = dynamic(() => import("@/components/effects/CursorGlow"), { ssr: false });
const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"));

/**
 * stilledev.se — one focused product story:
 *
 *   Playground (home)  →  What is BudAI  →  Vision  →  Waitlist  →  Footer
 *
 * The chat is the hero. Everything below it exists to make a visitor
 * understand the product and join the waitlist.
 */
export default function Home() {
  useEffect(() => {
    const originalTitle = document.title;
    const onVisibility = () => {
      document.title = document.visibilityState === "hidden" ? "BudAI · Stilledev.se" : originalTitle;
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
      <AIEnvironment />
      <CursorGlow />
      <SectionDots />
      <div className="ai-grid pointer-events-none fixed inset-0 z-[1] opacity-[0.35]" aria-hidden />
      <div className="ai-vignette pointer-events-none fixed inset-0 z-[1]" aria-hidden />

      <div className="relative z-10">
        <Navbar />

        {/* HOME = Playground */}
        <section id="playground" className="relative scroll-mt-16">
          <PlaygroundIntro />
          <AIPlayground />
          <div className="h-10 sm:h-12 lg:h-0" />
        </section>

        <WhatIsBudAI />
        <Vision />
        <Waitlist />
        <Footer />
      </div>

      <BackToTop />
      <CookieConsent />
    </main>
  );
}
