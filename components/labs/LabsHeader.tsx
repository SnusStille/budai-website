"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Plus, Globe, ArrowLeft } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLabsWordmark } from "@/components/ui/StilledevLogo";
import { useLabsTranslation } from "@/lib/labs/i18n";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE } from "@/lib/lang";

interface LabsHeaderProps {
  onToggleHistory?: () => void;
  onNewChat?: () => void;
  showHistoryButton?: boolean;
  compact?: boolean;
}

export default function LabsHeader({
  onToggleHistory,
  onNewChat,
  showHistoryButton = true,
  compact = false,
}: LabsHeaderProps) {
  const { lang, setLang } = useLang();
  const t = useLabsTranslation(lang);
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close lang dropdown on outside click / Escape
  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLangOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [langOpen]);

  // Navigate to language counterpart when switching language
  const handleLangChange = (newLang: "sv" | "en") => {
    setLang(newLang);
    setLangOpen(false);
    try {
      document.cookie = `${LANG_COOKIE}=${newLang}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
      localStorage.setItem(LANG_COOKIE, newLang);
    } catch { /* storage blocked */ }
    document.documentElement.lang = newLang;

    // Route to the language-appropriate URL
    const current = pathname;
    if (newLang === "sv") {
      if (current === "/labs") router.push("/sv/labs");
      else if (current.startsWith("/labs/")) router.push(`/sv${current}`);
      else if (current === "/" || current === "") router.push("/sv/labs");
    } else {
      if (current === "/sv/labs") router.push("/labs");
      else if (current.startsWith("/sv/labs/")) router.push(current.replace(/^\/sv/, ""));
      else router.push("/labs");
    }
  };

  const isOnDeepLink = pathname.match(/\/(?:sv\/)?labs\/[a-f0-9-]+$/i);
  const backHref = lang === "sv" ? "/sv/labs" : "/labs";

  return (
    <header className="labs-header" role="banner">
      <div className="labs-header-inner">
        {/* Left side */}
        <div className="labs-header-left">
          {isOnDeepLink ? (
            <Link
              href={backHref}
              className="labs-header-icon-btn"
              aria-label={t.nav.backToSite}
            >
              <ArrowLeft size={16} />
            </Link>
          ) : showHistoryButton && onToggleHistory ? (
            <button
              type="button"
              onClick={onToggleHistory}
              className="labs-header-icon-btn"
              aria-label={t.nav.history}
            >
              <Menu size={16} />
            </button>
          ) : null}

          <Link
            href={lang === "sv" ? "/sv/labs" : "/labs"}
            className="labs-header-brand"
            aria-label="Stilledev Labs"
          >
            <StilledevLabsWordmark />
          </Link>
        </div>

        {/* Right side */}
        <div className="labs-header-right">
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="labs-header-action-btn"
              aria-label={t.nav.newChat}
              title={t.nav.newChat}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">{t.nav.newChat}</span>
            </button>
          )}

          {/* Language switcher */}
          <div className="labs-lang-switch" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="labs-header-icon-btn"
              aria-label="Language"
              aria-expanded={langOpen}
              aria-haspopup="menu"
            >
              <Globe size={15} />
              <span className="labs-lang-code">{lang.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="labs-lang-menu"
                  role="menu"
                >
                  {(["en", "sv"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLangChange(code)}
                      role="menuitem"
                      aria-pressed={lang === code}
                      className={`labs-lang-option ${lang === code ? "active" : ""}`}
                    >
                      <span className="labs-lang-option-code">{code.toUpperCase()}</span>
                      <span className="labs-lang-option-name">
                        {code === "en" ? "English" : "Svenska"}
                      </span>
                      {lang === code && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
