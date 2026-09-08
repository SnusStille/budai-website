"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Surprise #2 — live Stockholm clock + soft time-of-day greeting.
 * Tiny, premium, zero lag (1s tick).
 */
export default function StockholmClock({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Stockholm",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setTime(fmt);

      // Hour in Stockholm
      const hour = Number(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Stockholm",
          hour: "numeric",
          hour12: false,
        }).format(now)
      );

      if (lang === "sv") {
        if (hour < 5) setGreeting("Natt i Stockholm");
        else if (hour < 10) setGreeting("God morgon");
        else if (hour < 12) setGreeting("Förmiddag");
        else if (hour < 17) setGreeting("God eftermiddag");
        else if (hour < 22) setGreeting("God kväll");
        else setGreeting("Natt i Stockholm");
      } else {
        if (hour < 5) setGreeting("Night in Stockholm");
        else if (hour < 10) setGreeting("Good morning");
        else if (hour < 12) setGreeting("Late morning");
        else if (hour < 17) setGreeting("Good afternoon");
        else if (hour < 22) setGreeting("Good evening");
        else setGreeting("Night in Stockholm");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);

  if (!time) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-mono text-muted/70 ${className}`}
      title={lang === "sv" ? "Tid i Stockholm" : "Time in Stockholm"}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green/80 animate-ping opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
      </span>
      <span className="hidden sm:inline text-muted/50">{greeting}</span>
      <span className="text-white/70 tabular-nums tracking-wide">{time}</span>
      <span className="text-muted/40">STO</span>
    </div>
  );
}
