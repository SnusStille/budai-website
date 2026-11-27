"use client";

import { openCookieSettings } from "@/lib/consent";

export default function CookieSettingsButton({ lang = "en" }: { lang?: "en" | "sv" }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="mt-5 text-xs text-muted underline decoration-white/20 underline-offset-4 hover:text-white"
    >
      {lang === "sv" ? "Cookieinställningar" : "Cookie settings"}
    </button>
  );
}
