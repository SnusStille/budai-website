"use client";

import dynamic from "next/dynamic";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PlaygroundApp = dynamic(() => import("@/components/playground/PlaygroundApp"));

/** The Playground on its own route — full attention, nothing else on the page. */
export default function PlaygroundStage() {
  return (
    <section id="playground" className="pgx-section relative scroll-mt-24 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[86rem] px-3 pb-14 pt-6 sm:px-6 lg:px-8">
        <ScrollReveal>
          <PlaygroundApp />
        </ScrollReveal>
      </div>
    </section>
  );
}
