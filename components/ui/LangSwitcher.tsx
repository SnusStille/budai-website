"use client";

/**
 * Shared language switcher component.
 *
 * Used by both Stilledev Labs (dark, minimal dropdown) and BudAI (hero nav).
 * Provides consistent language switching behavior:
 * - Persists choice to cookie + localStorage
 * - Updates document.documentElement.lang
 * - Routes to language-appropriate URL
 * - Accessible (menuitemradio with aria-checked, Escape to close)
 *
 * Variant: "dropdown" (default) — Globe icon + dropdown menu (Labs style)
 *          "pill"     — compact segmented pill (BudAI style, kept for tight spaces)
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE } from "@/lib/lang";

type Variant = "dropdown" | "pill";

interface LangSwitcherProps {
  variant?: Variant;
  /** When true, routes between /labs and /sv/labs (Labs context).
   *  When "main", routes between / and /sv/.
   *  When false (default), only changes state (no navigation — for anchor-based pages like BudAI landing). */
  labsContext?: boolean | "main";
  /** Extra class name for the root container */
  className?: string;
  /** Button class override (for pill variant) */
  buttonClassName?: string;
}

export default function LangSwitcher({
  variant = "dropdown",
  labsContext = false,
  className = "",
  buttonClassName = "",
}: LangSwitcherProps) {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const doLangChange = (newLang: "sv" | "en") => {
    setLang(newLang);
    setOpen(false);
    try {
      document.cookie = `${LANG_COOKIE}=${newLang}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
      localStorage.setItem(LANG_COOKIE, newLang);
    } catch { /* storage may be blocked */ }
    document.documentElement.lang = newLang;

    // Route to language counterpart (only when explicit context provided)
    const current = pathname;
    if (labsContext === true) {
      // Labs routing — /labs ↔ /sv/labs
      if (newLang === "sv") {
        if (current === "/labs") router.push("/sv/labs");
        else if (current.startsWith("/labs/")) router.push(`/sv${current}`);
        else router.push("/sv/labs");
      } else {
        if (current === "/sv/labs") router.push("/labs");
        else if (current.startsWith("/sv/labs/")) router.push(current.replace(/^\/sv/, ""));
        else router.push("/labs");
      }
    } else if (labsContext === "main") {
      // Main site routing — / ↔ /sv/...
      if (newLang === "sv") {
        if (current === "/") router.push("/sv");
        else if (current.startsWith("/") && !current.startsWith("/sv")) router.push(`/sv${current}`);
      } else {
        if (current === "/sv") router.push("/");
        else if (current.startsWith("/sv/")) router.push(current.replace(/^\/sv/, "") || "/");
      }
    }
    // If labsContext is false/undefined, don't navigate — let the page handle it via context
  };

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-full bg-black/30 border border-white/[0.07] ${className}`}
        role="group"
        aria-label="Language"
        ref={ref}
      >
        {(["en", "sv"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => doLangChange(code)}
            aria-checked={lang === code}
            role="menuitemradio"
            className={`relative min-w-[2.4rem] px-2.5 py-1 text-[10.5px] font-semibold tracking-wide rounded-full transition-all ${
              lang === code
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-muted/60 hover:text-white/80"
            } ${buttonClassName}`}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (default — Labs style)
  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center gap-1.5 h-[34px] px-2.5 text-[12px] font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] rounded-[10px] transition-all cursor-pointer"
        aria-label="Language"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Globe size={15} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.05em]">{lang.toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+6px)] min-w-[160px] bg-[#0c0c14]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl p-1 z-[70] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            role="menu"
          >
            {(["en", "sv"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => doLangChange(code)}
                role="menuitemradio"
                aria-checked={lang === code}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-[13px] rounded-lg transition-colors text-left ${
                  lang === code
                    ? "text-accent-cyan bg-accent-cyan/[0.07]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="font-mono text-[10px] font-semibold w-6 opacity-70">{code.toUpperCase()}</span>
                <span className="flex-1">{code === "en" ? "English" : "Svenska"}</span>
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
  );
}
