"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, Sparkles, Terminal as TerminalIcon, Users, Map,
  Activity, Cpu, Languages, MessageCircle, CornerDownLeft, Command,
} from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string;
}

// A command menu (⌘K / Ctrl+K) — the kind of thing Linear, Vercel, Raycast
// and Stripe's docs have and most marketing sites don't bother building.
// Lets a visitor jump anywhere on the site without hunting through the nav.
export default function CommandPalette() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const goTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const commands: CommandItem[] = useMemo(
    () => [
      { id: "capabilities", label: "Go to Capabilities", icon: Sparkles, action: () => goTo("capabilities"), keywords: "features what budai does" },
      { id: "playground", label: "Try the Playground", icon: MessageCircle, action: () => goTo("playground"), keywords: "chat demo try ai" },
      { id: "terminal", label: "Watch the Terminal", icon: TerminalIcon, action: () => goTo("terminal"), keywords: "code live activity" },
      { id: "roadmap", label: "View Roadmap", icon: Map, action: () => goTo("roadmap"), keywords: "timeline plan future" },
      { id: "status", label: "Check System Status", icon: Activity, action: () => goTo("status"), keywords: "uptime health services" },
      { id: "waitlist", label: "Join the Waitlist", icon: Users, action: () => goTo("waitlist"), keywords: "signup access request join" },
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
      {
        id: "discord",
        label: "Message Stilledev on Discord",
        icon: Cpu,
        action: () => {
          window.open("https://discord.com/users/353944097301594123", "_blank", "noopener,noreferrer");
          setOpen(false);
        },
        keywords: "developer contact discord stilledev",
      },
    ],
    [lang, setLang]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.keywords?.includes(q));
  }, [query, commands]);

  // Global ⌘K / Ctrl+K listener, plus "/" as a quick alternative — Esc closes.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
  }, [open]);

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
    <>
      {/* Discoverable trigger, not just a hidden shortcut */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[25] hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full glass-strong border border-white/[0.08] text-xs text-muted hover:text-white hover:border-accent-cyan/30 transition-colors"
        aria-label="Open command menu"
      >
        <Search className="w-3.5 h-3.5" />
        <span>{lang === "sv" ? "Sök" : "Search"}</span>
        <span className="flex items-center gap-0.5 pl-1.5 ml-0.5 border-l border-white/10">
          <Command className="w-3 h-3" />K
        </span>
      </button>

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
                        i === activeIndex ? "bg-accent-cyan/10 text-white" : "text-muted hover:text-white"
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
    </>
  );
}
