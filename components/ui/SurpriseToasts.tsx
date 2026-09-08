"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, MapPin, Trophy, Heart } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

type Toast = {
  id: number;
  icon: "spark" | "pin" | "trophy" | "heart";
  title: string;
  body: string;
};

const ICONS = {
  spark: Sparkles,
  pin: MapPin,
  trophy: Trophy,
  heart: Heart,
};

/**
 * Surprise #1 — on-screen toasts for tiny moments:
 * - type "budai"
 * - triple-click the logo
 * - scroll to the very bottom (Vision)
 */
export default function SurpriseToasts() {
  const { lang } = useLang();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrolledEnd, setScrolledEnd] = useState(false);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  useEffect(() => {
    const onEgg = () => {
      push({
        icon: "spark",
        title: lang === "sv" ? "Hej, developer 👋" : "Hey, developer 👋",
        body:
          lang === "sv"
            ? "Du hittade easter egget. BudAI byggs med passion i Sverige."
            : "You found the easter egg. BudAI is built with passion in Sweden.",
      });
    };
    const onLogo = () => {
      push({
        icon: "trophy",
        title: lang === "sv" ? "Founder mode" : "Founder mode",
        body:
          lang === "sv"
            ? "Triple-click. Vi gillar nyfikna människor."
            : "Triple-click. We like curious people.",
      });
      document.documentElement.classList.add("egg-flash");
      setTimeout(() => document.documentElement.classList.remove("egg-flash"), 1000);
    };

    window.addEventListener("budai:egg", onEgg);
    window.addEventListener("budai:logo-secret", onLogo);
    return () => {
      window.removeEventListener("budai:egg", onEgg);
      window.removeEventListener("budai:logo-secret", onLogo);
    };
  }, [lang, push]);

  // Scroll-to-end surprise (once per session)
  useEffect(() => {
    if (scrolledEnd) return;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.92) {
        setScrolledEnd(true);
        try {
          if (sessionStorage.getItem("budai-end-toast") === "1") return;
          sessionStorage.setItem("budai-end-toast", "1");
        } catch {
          /* ignore */
        }
        push({
          icon: "heart",
          title: lang === "sv" ? "Du läste hela vägen" : "You made it to the end",
          body:
            lang === "sv"
              ? "Tack. Gå med i väntelistan om du vill vara med från start."
              : "Thanks. Join the waitlist if you want in from day one.",
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang, push, scrolledEnd]);

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none max-w-[min(320px,calc(100vw-2rem))]">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.icon];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto rounded-xl glass-strong border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-3.5 py-3 flex gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-accent-cyan" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-snug">{t.title}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.body}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
