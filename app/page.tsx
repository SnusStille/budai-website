"use client";
import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
const AIPlayground = dynamic(
  () => import("@/components/sections/AIPlayground"),
  {
    loading: () => (
      <div
        className="site-width h-[650px] animate-pulse rounded-3xl bg-white/5"
        aria-label="Loading Playground"
      />
    ),
  },
);
export default function Home() {
  return (
    <main className="final-preview relative min-h-screen overflow-x-clip">
      <div className="ambient-field" aria-hidden="true">
        <div />
        <span className="ambient-code">01 — ideas.into(reality)</span>
      </div>
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
