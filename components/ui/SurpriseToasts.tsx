"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import { useToast } from "@/components/ui/ToastStack";

/**
 * Bridges surprise events into the global stacked toast corner.
 */
export default function SurpriseToasts() {
  const { lang } = useLang();
  const { push } = useToast();
  const [scrolledEnd, setScrolledEnd] = useState(false);

  useEffect(() => {
    const onEgg = () => {
      push({
        icon: "spark",
        title: lang === "sv" ? "Hej, developer 👋" : "Hey, developer 👋",
        body:
          lang === "sv"
            ? "Du hittade easter egget. BudAI byggs med passion i Sverige."
            : "You found the easter egg. BudAI is built with passion in Sweden.",
        duration: 5000,
      });
    };
    const onLogo = () => {
      push({
        icon: "trophy",
        title: lang === "sv" ? "Founder mode" : "Founder mode",
        body:
          lang === "sv"
            ? "Triple-click. Vi gillar nyfikna människor."
            : "Triple-click. We like curious people.",
        duration: 4500,
      });
      document.documentElement.classList.add("egg-flash");
      setTimeout(() => document.documentElement.classList.remove("egg-flash"), 1000);
    };

    window.addEventListener("budai:egg", onEgg);
    window.addEventListener("budai:logo-secret", onLogo);
    return () => {
      window.removeEventListener("budai:egg", onEgg);
      window.removeEventListener("budai:logo-secret", onLogo);
    };
  }, [lang, push]);

  useEffect(() => {
    if (scrolledEnd) return;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.92) {
        setScrolledEnd(true);
        try {
          if (sessionStorage.getItem("budai-end-toast") === "1") return;
          sessionStorage.setItem("budai-end-toast", "1");
        } catch {
          /* ignore */
        }
        push({
          icon: "heart",
          title: lang === "sv" ? "Du läste hela vägen" : "You made it to the end",
          body:
            lang === "sv"
              ? "Tack. Gå med i väntelistan om du vill vara med från start — 10% early access."
              : "Thanks. Join the waitlist if you want in from day one — 10% early access.",
          duration: 5500,
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang, push, scrolledEnd]);

  return null;
}
