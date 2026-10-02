"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** One clear way back to the Playground from anywhere on the page. */
export default function BackToTop() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          onClick={() =>
            document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="glass-strong fixed bottom-5 right-5 z-[25] flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] pl-3 pr-3.5 text-[12.5px] text-white/75 transition-all hover:border-accent-cyan/30 hover:text-accent-cyan hover:shadow-[0_0_24px_rgba(0,229,255,0.14)]"
          aria-label={t.intro.backToPlayground}
          title={t.intro.backToPlayground}
        >
          <ArrowUp className="h-4 w-4" />
          <span className="hidden sm:inline">{t.nav.playground}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
