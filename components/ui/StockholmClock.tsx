"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

/** Local studio time; Intl handles Swedish daylight-saving changes. */
export default function StockholmClock() {
  const { lang } = useLang();
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date()));
    tick();
    const id = window.setInterval(tick, 10000);
    return () => window.clearInterval(id);
  }, []);
  if (!time) return null;
  return <div className="studio-clock" aria-label={lang === "sv" ? `Svensk tid ${time}` : `Swedish time ${time}`}><i aria-hidden="true" /><span>{lang === "sv" ? "SVENSK TID" : "SWEDISH TIME"}</span><time>{time}</time><span>SE</span></div>;
}
