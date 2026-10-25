"use client";

import { useEffect } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import { useToast } from "@/components/ui/ToastStack";

/**
 * Bridges surprise events into the global stacked toast corner.
 */
export default function SurpriseToasts() {
  const { lang } = useLang();
  const { push } = useToast();

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


  return null;
}
