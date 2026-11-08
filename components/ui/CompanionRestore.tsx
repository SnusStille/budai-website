"use client";

import { useEffect, useState } from "react";
import { readCompanionHidden, setCompanionHidden, COMPANION_VISIBILITY_EVENT } from "@/lib/companion/preferences";
import { useLang } from "@/components/ui/LanguageContext";

/** A discoverable, reversible way back after hiding the companion for this visit. */
export default function CompanionRestore({ phone = false }: { phone?: boolean }) {
  const [hidden, setHidden] = useState(false);
  const { lang } = useLang();
  useEffect(() => {
    setHidden(readCompanionHidden());
    const sync = (event: Event) => setHidden((event as CustomEvent<boolean>).detail);
    window.addEventListener(COMPANION_VISIBILITY_EVENT, sync);
    return () => window.removeEventListener(COMPANION_VISIBILITY_EVENT, sync);
  }, []);
  if (!hidden) return null;
  const restore = () => {
    setCompanionHidden(false);
    const heading = document.getElementById(phone ? "phone-heading" : "hero-title");
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
  };
  return <button type="button" className="companion-restore" onClick={restore}>{lang === "sv" ? "Visa BudAI-kompanjonen igen" : "Bring back the BudAI companion"} <span aria-hidden="true">↗</span></button>;
}
