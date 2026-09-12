"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
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
import Timeline from "@/components/sections/Timeline";
import Vision from "@/components/sections/Vision";
import Footer from "@/components/sections/Footer";

const AIEnvironment = dynamic(() => import("@/components/effects/AIEnvironment"), {
  ssr: false,
});
const CursorGlow = dynamic(() => import("@/components/effects/CursorGlow"), { ssr: false });

const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"));
const Terminal = dynamic(() => import("@/components/sections/Terminal"));
const SystemStatus = dynamic(() => import("@/components/sections/SystemStatus"));

export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("%cBudAI · v0.93 · Stilledev", "color:#00e5ff;font-weight:bold;");
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
        console.log("%cYou found the easter egg.", "color: #00ff9d; font-size: 12px;");
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
    <main className="page-transition relative min-h-screen text-white overflow-x-hidden bg-background">
      <ScrollProgress />
      <AIEnvironment />
      <CursorGlow />
      <SectionDots />
      <div className="fixed inset-0 z-[1] pointer-events-none ai-grid opacity-[0.35]" aria-hidden />
      <div className="fixed inset-0 z-[1] pointer-events-none ai-vignette" aria-hidden />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Capabilities />
        <AIPlayground />
        <Terminal />
        <Waitlist />
        <Timeline />
        <SystemStatus />
        <Vision />
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
