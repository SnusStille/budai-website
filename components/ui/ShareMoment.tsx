"use client";

import { useEffect } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import { useToast } from "@/components/ui/ToastStack";

/** After meaningful scroll — stacked toast with share hint. */
export default function ShareMoment() {
  const { lang } = useLang();
  const { push } = useToast();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("budai-share-moment")) return;
    } catch {
      /* ignore */
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max < 0.45) return;
      try {
        sessionStorage.setItem("budai-share-moment", "1");
      } catch {
        /* ignore */
      }
      window.removeEventListener("scroll", onScroll);
      push({
        icon: "info",
        title: lang === "sv" ? "Dela BudAI?" : "Share BudAI?",
        body:
          lang === "sv"
            ? "Kopiera stilledev.se till teamet när du är redo."
            : "Copy stilledev.se for your team when ready.",
        duration: 7000,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang, push]);

  return null;
}
