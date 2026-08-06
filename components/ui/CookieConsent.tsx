"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield } from "lucide-react";
import { useLang } from "./LanguageContext";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const consent = localStorage.getItem("budai-cookies");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("budai-cookies", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("budai-cookies", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-[60]"
        >
          <div className="relative rounded-2xl glass-strong border border-white/[0.08] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.1), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              }}
            />

            <div className="relative flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">{t.cookie.title}</h3>
                  <button
                    onClick={handleDecline}
                    className="p-1 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  {t.cookie.text}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-accent-cyan to-accent-purple rounded-lg text-white hover:opacity-90 transition-opacity"
                  >
                    {t.cookie.accept}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-4 py-2 text-xs font-medium text-muted hover:text-white transition-colors"
                  >
                    {t.cookie.decline}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
