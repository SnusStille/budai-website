"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import AboutBudAI from "@/components/sections/AboutBudAI";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import BackToTop from "@/components/ui/BackToTop";
import SiteAmbient from "@/components/effects/SiteAmbient";

const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"));

export default function Home() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <SiteAmbient />
      <Navbar />
      <div className="relative z-10">
        <Hero />
        <AIPlayground />
        <AboutBudAI />
        <Waitlist />
        <Footer />
      </div>
      <BackToTop />
      <CookieConsent />
    </main>
  );
}
