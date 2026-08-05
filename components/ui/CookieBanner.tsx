"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:max-w-md"
        >
          <div className="glass-strong p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{t.cookies.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  {t.cookies.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptCookies}
                    className="px-6 py-2.5 rounded-xl bg-accent-cyan text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    {t.cookies.accept}
                  </button>
                  <button
                    onClick={declineCookies}
                    className="px-6 py-2.5 rounded-xl bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    {t.cookies.decline}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
