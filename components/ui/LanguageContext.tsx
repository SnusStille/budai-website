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
  const [lang, setLangState] = useState<Lang>("sv");

  useEffect(() => {
    const saved = localStorage.getItem("budai-lang") as Lang;
    if (saved && (saved === "sv" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("budai-lang", l);
    document.documentElement.lang = l;
  };

  const t = useTranslation(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
