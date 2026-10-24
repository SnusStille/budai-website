"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import StatusStaticStory from "@/components/status/StatusStaticStory";

const StatusFlight = dynamic(() => import("@/components/status/StatusFlight"), {
  ssr: false,
  loading: () => <StatusStaticStory />,
});

export default function StatusJourney() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [startFlight, setStartFlight] = useState(false);

  useEffect(() => {
    const start = () => setStartFlight(true);
    if (document.documentElement.dataset.budaiStartupComplete === "true") {
      start();
      return;
    }
    window.addEventListener("budai:startup-complete", start, { once: true });
    return () => window.removeEventListener("budai:startup-complete", start);
  }, []);

  return (
    <section data-budai-route-ready="true" className="relative z-10" aria-labelledby="journey-heading">
      <div className="mx-auto max-w-6xl px-5 pb-5 sm:px-8">
        <div className="flex items-end justify-between gap-5 border-b border-white/[0.08] pb-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">01 — 05</p>
            <h2 id="journey-heading" className="mt-1 text-sm font-medium text-white/70">
              <span className="sr-only">{sv ? "Resa genom systemet" : "Journey through the system"}</span>
              <span aria-hidden="true">{sv ? "Resa genom systemet" : "Journey through the system"}</span>
            </h2>
          </div>
          <p className="max-w-xs text-right text-xs leading-relaxed text-white/35">
            {sv ? "Följ signalen från fråga till svar." : "Follow the signal from prompt to response."}
          </p>
        </div>
      </div>
      {startFlight ? <StatusFlight /> : <StatusStaticStory />}
    </section>
  );
}
