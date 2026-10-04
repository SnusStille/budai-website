"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import BackToTop from "@/components/ui/BackToTop";
import SiteAmbient from "@/components/effects/SiteAmbient";
import BudAILogo from "@/components/ui/BudAILogo";

/**
 * BudAI — the Playground IS the home page.
 * No marketing hero, no gateway: you land straight in the product.
 */
const PlaygroundApp = dynamic(() => import("@/components/playground/PlaygroundApp"), {
  // the product is the page — give it a quiet, branded moment while the
  // module streams in instead of an empty rectangle
  loading: () => (
    <div className="pgx-boot" role="status" aria-live="polite" aria-label="Loading the Playground">
      <span className="pgx-boot-mark">
        <BudAILogo size="xl" animated boot />
      </span>
      <span className="pgx-boot-line" aria-hidden>
        <span />
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main id="main-content" className="site-page relative min-h-screen overflow-x-clip bg-background text-white">
      <SiteAmbient />
      <Navbar />
      <div className="relative z-10 pt-[70px] lg:pt-[76px]">
        <section id="playground" className="pgx-section relative min-h-[80vh] overflow-hidden">
          <h1 className="sr-only">BudAI Playground — an AI work assistant for Swedish and English</h1>
          <div className="relative z-10 mx-auto max-w-[86rem] px-3 pb-10 pt-5 sm:px-6 sm:pt-8 lg:px-8">
            <PlaygroundApp />
          </div>
        </section>
        <Footer />
      </div>
      <BackToTop />
      <CookieConsent />
    </main>
  );
}
