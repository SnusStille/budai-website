"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Floating back-to-top.
 * - rAF-throttled scroll listener (no re-render per pixel)
 * - hidden while the cookie bar is open and while the Playground is on screen,
 *   so it never sits on top of the chat composer on phones
 */
export default function BackToTop() {
  const { lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [overPlayground, setOverPlayground] = useState(false);

  useEffect(() => {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        setScrolled(window.scrollY > 900);
      });
    };
    const onCookie = (e: Event) => setBlocked(!!(e as CustomEvent<boolean>).detail);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("budai:cookie-bar", onCookie);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("budai:cookie-bar", onCookie);
    };
  }, []);

  useEffect(() => {
    const el = document.getElementById("playground");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOverPlayground(entry.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const visible = scrolled && !blocked && !overPlayground;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="press fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[25] flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] glass-strong text-white/70 transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan hover:shadow-[0_0_24px_rgba(0,229,255,0.15)]"
          aria-label={lang === "sv" ? "Till toppen" : "Back to top"}
          title={lang === "sv" ? "Till toppen" : "Back to top"}
        >
          <ArrowUp aria-hidden className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
