"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  Users,
  Languages,
  MessageCircle,
  CornerDownLeft,
  Home,
  Info,
} from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string;
}

export default function CommandPalette() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPlayground = path.startsWith("/playground");

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "playground",
        label: lang === "sv" ? "Öppna Playground" : "Open Playground",
        icon: MessageCircle,
        action: () => {
          setOpen(false);
          router.push("/playground");
        },
        keywords: "chat demo try ai product",
      },
      {
        id: "waitlist",
        label: lang === "sv" ? "Gå med i väntelistan" : "Join the Waitlist",
        icon: Users,
        action: () => {
          setOpen(false);
          router.push("/waitlist");
        },
        keywords: "signup access request join founding 10",
      },
      {
        id: "home",
        label: lang === "sv" ? "Hem" : "Home",
        icon: Home,
        action: () => {
          setOpen(false);
          router.push("/");
        },
        keywords: "start landing",
      },
      {
        id: "about",
        label: lang === "sv" ? "Om BudAI" : "About BudAI",
        icon: Info,
        action: () => {
          setOpen(false);
          router.push("/about");
        },
        keywords: "about sweden nordic",
      },
      {
        id: "lang",
        label: lang === "sv" ? "Switch to English" : "Byt till svenska",
        icon: Languages,
        action: () => {
          setLang(lang === "sv" ? "en" : "sv");
          setOpen(false);
        },
        keywords: "language svenska english translate",
      },
    ],
    [lang, setLang, router]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.keywords?.includes(q));
  }, [query, commands]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPlayground) return;
      const isTypingTarget = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !isTypingTarget && !open) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isPlayground]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIndex]?.action();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[16vh] left-1/2 -translate-x-1/2 z-[91] w-[92vw] max-w-lg rounded-2xl glass-strong border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={lang === "sv" ? "Vart vill du gå?" : "Where do you want to go?"}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-muted focus:outline-none"
              />
              <kbd className="text-[10px] text-muted/60 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  {lang === "sv" ? "Inga resultat." : "No results."}
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      i === activeIndex ? "bg-white/[0.06] text-white" : "text-muted hover:text-white"
                    }`}
                  >
                    <cmd.icon className={`w-4 h-4 shrink-0 ${i === activeIndex ? "text-accent-cyan" : "text-muted"}`} />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {i === activeIndex && <ArrowRight className="w-3.5 h-3.5 text-accent-cyan" />}
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] text-[11px] text-muted/50">
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded border border-white/10">↑</span>
                <span className="px-1.5 py-0.5 rounded border border-white/10">↓</span>
                {lang === "sv" ? "navigera" : "navigate"}
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                {lang === "sv" ? "välj" : "select"}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
