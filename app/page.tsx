"use client";

import dynamic from "next/dynamic";
import CookieConsent from "@/components/ui/CookieConsent";
import FeedbackButton from "@/components/ui/FeedbackButton";
import Stage from "@/components/cinema/Stage";
import { Hud, Leader, StudioNav } from "@/components/cinema/Chrome";
import Arrival from "@/components/cinema/scenes/Arrival";
import Premise from "@/components/cinema/scenes/Premise";
import Intelligence from "@/components/cinema/scenes/Intelligence";
import Construction from "@/components/cinema/scenes/Construction";
import Systems from "@/components/cinema/scenes/Systems";
import Works from "@/components/cinema/scenes/Works";
import Contact from "@/components/cinema/scenes/Contact";
import StudioFooter from "@/components/cinema/StudioFooter";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { usePrefersReducedMotion } from "@/components/cinema/motion";
import { SCENE_ORDER } from "@/lib/cinema/timeline";
import { scrollToScene } from "@/lib/cinema/scroll";
import { useEffect } from "react";

// kept from the product page: pointer glow + the studio feedback flow, both lazy
const CursorGlow = dynamic(() => import("@/components/effects/CursorGlow"), { ssr: false });

/**
 * STILLEDEV — the cinematic experience.
 *
 * The film is a *layer*, not a gate: all seven scenes are ordinary semantic HTML in this
 * document, so the page is readable, crawlable and keyboard-navigable with WebGL unavailable,
 * the animation disabled, or the canvas failing to boot. Heavy preserved features (the live
 * BudAI playground, the waitlist) are mounted only when they come near the viewport, and the
 * whole 3D module lives in its own chunk.
 *
 * The BudAI product landing lives on /budai with every anchor it had here intact.
 */
export default function Home() {
  const reduced = usePrefersReducedMotion();

  // a deep link to a chapter (#intelligence …) is honoured once the layout has settled
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id || !SCENE_ORDER.includes(id as (typeof SCENE_ORDER)[number])) return;
    const t = window.setTimeout(() => scrollToScene(id), 420);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <main id="main" tabIndex={-1} className="st-page relative min-h-screen text-white">
      {/* desktop garnish kept from the product page; skipped when motion is reduced */}
      {!reduced && <CursorGlow />}

      <ErrorBoundary>
        <Stage reduced={reduced} />
      </ErrorBoundary>

      <Hud />
      <StudioNav />
      {!reduced && <Leader />}

      <div className="relative z-10">
        <Arrival />
        <Premise />
        <Intelligence />
        <Construction />
        <Systems />
        <Works />
        <Contact />
      </div>

      <StudioFooter />
      <FeedbackButton />
      <CookieConsent />
    </main>
  );
}
