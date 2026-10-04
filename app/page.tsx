"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";
import CookieConsent from "@/components/ui/CookieConsent";

const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"));

export default function Home() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <div className="site-ambient" aria-hidden="true" />
      <Navbar />
      <div className="relative z-10">
        <Hero />
        <AIPlayground />
        <Capabilities />
        <Waitlist />
        <Footer />
      </div>
      <CookieConsent />
    </main>
  );
}
