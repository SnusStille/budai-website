"use client";

import { useEffect } from "react";
import NeuralNetwork from "@/components/effects/NeuralNetwork";
import ParticleField from "@/components/effects/ParticleField";
import CursorGlow from "@/components/effects/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";
import CookieConsent from "@/components/ui/CookieConsent";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import BuddyCard from "@/components/sections/BuddyCard";
import Capabilities from "@/components/sections/Capabilities";
import AIPlayground from "@/components/sections/AIPlayground";
import Terminal from "@/components/sections/Terminal";
import Waitlist from "@/components/sections/Waitlist";
import Timeline from "@/components/sections/Timeline";
import SystemStatus from "@/components/sections/SystemStatus";
import Vision from "@/components/sections/Vision";
import Footer from "@/components/sections/Footer";

export default function Home() {
  useEffect(() => {
    console.log("%c🧠 BudAI Developer Preview v0.9.2", "color: #00e5ff; font-size: 16px; font-weight: bold;");
    console.log("%cBuilt by Stilledev | Sweden", "color: #b967ff; font-size: 12px;");
    console.log("%cTry typing 'budai' anywhere on the page...", "color: #8892a0; font-size: 11px; font-style: italic;");

    let buffer = "";
    const target = "budai";
    const onKey = (e: KeyboardEvent) => {
      buffer += e.key.toLowerCase();
      if (buffer.length > target.length) buffer = buffer.slice(-target.length);
      if (buffer === target) {
        console.log("%c🚀 Welcome, developer.", "color: #00e5ff; font-size: 14px; font-weight: bold;");
        console.log("%cYou found the easter egg.", "color: #00ff9d; font-size: 12px;");
        console.log("%cBudAI is being built with passion in Sweden.", "color: #8892a0; font-size: 11px;");
        buffer = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="page-transition relative min-h-screen text-white overflow-x-hidden bg-background">
      <ScrollProgress />
      <NeuralNetwork />
      <ParticleField />
      <CursorGlow />
      <div className="fixed inset-0 z-[2] pointer-events-none grid-bg opacity-25" />

      <div className="relative z-10">
        <div className="fixed bottom-4 right-4 z-[30] hidden md:block">
          <BuddyCard />
        </div>
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
      <CookieConsent />
    </main>
  );
}