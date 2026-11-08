"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useLang } from "./LanguageContext";
import {
  CONSENT_SETTINGS_EVENT,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * Compact bottom cookie bar — never a full-screen overlay.
 * The choice is written to the shared consent store, which also decides
 * whether Vercel Analytics is allowed to load.
 */
export default function CookieConsent({ forceDocumentNavigation = false }: { forceDocumentNavigation?: boolean } = {}) {
  const [visible, setVisible] = useState(false);
  const { t, lang } = useLang();

  useEffect(() => {
    if (readConsent()) return;
    const timer = window.setTimeout(() => setVisible(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  // "Cookie settings" in the footer lets a visitor change or withdraw consent.
  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  }, []);

  const save = (choice: ConsentChoice) => {
    writeConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[55] w-[calc(100%-1.5rem)] max-w-md ${forceDocumentNavigation ? "phone-cookie-dialog" : ""}`}
          role="dialog"
          aria-label={t.cookie.title}
        >
          <div className="rounded-xl glass-strong border border-white/[0.08] px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white">{t.cookie.title}</p>
                <button
                  type="button"
                  onClick={() => save("declined")}
                  className="p-1 rounded-md text-muted hover:text-white"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted leading-relaxed mt-0.5 mb-2">
                {t.cookie.text}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => save("accepted")}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                >
                  {t.cookie.accept}
                </button>
                <button
                  type="button"
                  onClick={() => save("declined")}
                  className="px-3 py-1.5 text-[11px] text-muted hover:text-white"
                >
                  {t.cookie.decline}
                </button>
                {forceDocumentNavigation ? (
                  /* eslint-disable-next-line @next/next/no-html-link-for-pages -- The phone shell must re-evaluate on document navigation. */
                  <a href="/legal/cookies" className="text-[11px] text-accent-cyan hover:text-white ml-auto">{lang === "sv" ? "Mer" : "More"}</a>
                ) : (
                  <Link href="/legal/cookies" className="text-[11px] text-accent-cyan hover:text-white ml-auto">{lang === "sv" ? "Mer" : "More"}</Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
