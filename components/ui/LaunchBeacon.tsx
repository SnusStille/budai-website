"use client";

import { useEffect } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import { useToast } from "@/components/ui/ToastStack";

/** Idle beacon → stacked toast (same corner as other notices). */
export default function LaunchBeacon() {
  const { lang } = useLang();
  const { push } = useToast();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("budai-beacon")) return;
    } catch {
      /* ignore */
    }

    const show = () => {
      try {
        if (sessionStorage.getItem("budai-beacon")) return;
        sessionStorage.setItem("budai-beacon", "1");
      } catch {
        /* ignore */
      }
      push({
        icon: "spark",
        title: lang === "sv" ? "Beacon online" : "Beacon online",
        body:
          lang === "sv"
            ? "BudAI v0.93 · 93% till launch. Du är tidig — bra grej. 10% early access på waitlist."
            : "BudAI v0.93 · 93% to launch. You're early — that's good. 10% early access on the waitlist.",
        duration: 8000,
      });
    };

    const timer = setTimeout(show, 45000);
    return () => clearTimeout(timer);
  }, [lang, push]);

  return null;
}
