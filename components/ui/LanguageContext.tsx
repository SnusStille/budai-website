"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, useTranslation } from "@/lib/i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: ReturnType<typeof useTranslation>;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  // Default English (product default). Saved preference wins after mount.
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("budai-lang") as Lang | null;
      // EN is default. Only switch to SV if user explicitly saved sv.
      const next: Lang = saved === "sv" ? "sv" : "en";
      setLangState(next);
      document.documentElement.lang = next;
    } catch {
      document.documentElement.lang = "en";
    }
    setReady(true);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("budai-lang", l);
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
