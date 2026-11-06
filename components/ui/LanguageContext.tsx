"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, useTranslation } from "@/lib/i18n";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, SWEDISH_PATH } from "@/lib/lang";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: ReturnType<typeof useTranslation>;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  // F1: start from the language the SERVER resolved, so SSR HTML and the first
  // client render agree (no hydration mismatch, Swedish is in the raw HTML).
  const serverLang: Lang = initialLang === "sv" ? "sv" : "en";
  const [lang, setLangState] = useState<Lang>(serverLang);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The Swedish URL is authoritative for crawlers and humans; otherwise a
    // saved preference wins. Mirror the result into a functional cookie so the
    // next request is server-rendered in the same language.
    let next: Lang = serverLang;
    const onSwedishUrl = window.location.pathname === SWEDISH_PATH || window.location.pathname.startsWith(`${SWEDISH_PATH}/`);
    try {
      const saved = localStorage.getItem(LANG_COOKIE) as Lang | null;
      if (onSwedishUrl) {
        next = "sv";
        if (saved !== "sv") localStorage.setItem(LANG_COOKIE, "sv");
      } else if (saved === "sv" || saved === "en") {
        next = saved;
      }
    } catch {
      /* storage can be blocked; keep the server language */
    }
    setLangState(next);
    document.documentElement.lang = next;
    try {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
    } catch {
      /* */
    }
    setReady(true);
  }, [serverLang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_COOKIE, l);
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
    } catch {
      /* */
    }
    document.documentElement.lang = l;
  };

  const t = useTranslation(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {/* Avoid flash of wrong language content if needed — children always render */}
      <div className={ready ? undefined : undefined}>{children}</div>
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
