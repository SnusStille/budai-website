"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Command,
  Globe2,
  Layers,
  Link2,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { prefillPlayground } from "@/lib/playground/events";

type PaletteAction = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
};

export const SITE_PALETTE_EVENT = "budai:palette";

const QUICK: Record<"sv" | "en", { label: string; prompt: string; icon: string }[]> = {
  sv: [
    { label: "Skriv ett mejl", prompt: "Skriv ett kort, varmt mejl till en kund och be om feedback senast fredag.", icon: "✎" },
    { label: "Planera veckan", prompt: "Hjälp mig planera veckan med fokusblock, möten och pauser.", icon: "☑" },
    { label: "Sammanfatta en text", prompt: "Sammanfatta texten nedan i tre punkter och ge ett nästa steg:\n\n", icon: "≡" },
    { label: "Översätt till engelska", prompt: "Översätt följande till naturlig engelska med samma ton:\n\n", icon: "⇄" },
    { label: "Förklara enkelt", prompt: "Förklara detta enkelt med en vardaglig jämförelse:\n\n", icon: "◇" },
    { label: "Brainstorma idéer", prompt: "Ge mig fem kreativa men realistiska idéer kring: ", icon: "✷" },
  ],
  en: [
    { label: "Write an email", prompt: "Write a short, warm email to a client asking for feedback by Friday.", icon: "✎" },
    { label: "Plan my week", prompt: "Help me plan my week with focus blocks, meetings and breaks.", icon: "☑" },
    { label: "Summarize a text", prompt: "Summarize the text below in three bullets and give one next step:\n\n", icon: "≡" },
    { label: "Translate to Swedish", prompt: "Translate the following into natural Swedish with the same tone:\n\n", icon: "⇄" },
    { label: "Explain it simply", prompt: "Explain this simply with an everyday analogy:\n\n", icon: "◇" },
    { label: "Brainstorm ideas", prompt: "Give me five creative but realistic ideas about: ", icon: "✷" },
  ],
};

/** Site-wide ⌘K palette — jump anywhere, or start a prompt in the Playground. */
export default function SitePalette() {
  const { lang, setLang } = useLang();
  const isSv = lang === "sv";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.key.toLowerCase() !== "k") return;
      const target = event.target as HTMLElement | null;
      // the Playground owns ⌘K inside its own shell
      if (target?.closest?.(".pgx-shell")) return;
      event.preventDefault();
      setOpen((v) => !v);
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(SITE_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SITE_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  const goTo = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      const node = document.querySelector(href);
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.location.href = "/";
      return;
    }
    window.location.href = href;
  };

  const actions: PaletteAction[] = useMemo(() => {
    const sections: PaletteAction[] = [
      {
        id: "playground",
        group: isSv ? "Gå till" : "Go to",
        label: "Playground",
        hint: isSv ? "Testa BudAI live" : "Try BudAI live",
        icon: <Sparkles className="h-3.5 w-3.5" />,
        run: () => goTo("/"),
      },
      {
        id: "about",
        group: isSv ? "Gå till" : "Go to",
        label: isSv ? "Om BudAI" : "About BudAI",
        hint: isSv ? "Vad BudAI gör" : "What BudAI does",
        icon: <Layers className="h-3.5 w-3.5" />,
        run: () => goTo("/about"),
      },
      {
        id: "waitlist",
        group: isSv ? "Gå till" : "Go to",
        label: isSv ? "Väntelista — 10 %" : "Waitlist — 10%",
        hint: isSv ? "Founding-rabatt och early access" : "Founding discount and early access",
        icon: <Sparkles className="h-3.5 w-3.5" />,
        run: () => goTo("/waitlist"),
      },
      {
        id: "home",
        group: isSv ? "Gå till" : "Go to",
        label: isSv ? "Till toppen" : "Back to top",
        icon: <ArrowUp className="h-3.5 w-3.5" />,
        run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
    ];

    const prompts = QUICK[lang].map<PaletteAction>((item) => ({
      id: `prompt-${item.label}`,
      group: isSv ? "Starta i Playground" : "Start in the Playground",
      label: item.label,
      hint: item.prompt.replace(/\s+/g, " ").slice(0, 62),
      icon: <Wand2 className="h-3.5 w-3.5" />,
      run: () => {
        prefillPlayground(item.prompt);
        window.setTimeout(() => goTo("/"), 60);
      },
    }));

    const system: PaletteAction[] = [
      {
        id: "lang",
        group: isSv ? "Inställningar" : "Settings",
        label: lang === "sv" ? "Switch to English" : "Byt till svenska",
        icon: <Globe2 className="h-3.5 w-3.5" />,
        run: () => setLang(lang === "sv" ? "en" : "sv"),
      },
      {
        id: "copy",
        group: isSv ? "Inställningar" : "Settings",
        label: isSv ? "Kopiera länk till sidan" : "Copy page link",
        icon: <Link2 className="h-3.5 w-3.5" />,
        run: () => {
          void navigator.clipboard.writeText(window.location.href);
        },
      },
      {
        id: "privacy",
        group: isSv ? "Information" : "Information",
        label: isSv ? "Integritetspolicy" : "Privacy policy",
        icon: <Link2 className="h-3.5 w-3.5" />,
        run: () => {
          window.location.href = "/legal/privacy";
        },
      },
    ];

    return [...prompts, ...sections, ...system];
  }, [isSv, lang, setLang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.group.toLowerCase().includes(q) ||
        (a.hint || "").toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setIndex((i) => (i + 1) % Math.max(filtered.length, 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const action = filtered[index];
        if (action) {
          action.run();
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, index]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pgx-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label={isSv ? "Kommandopalett" : "Command palette"}
        >
          <button type="button" className="pgx-modal-backdrop" onClick={() => setOpen(false)} aria-label="close" />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pgx-modal"
          >
            <div className="pgx-modal-head">
              <span className="pgx-modal-title">
                <Command className="h-4 w-4" />
                BudAI — {isSv ? "snabbt" : "quick actions"}
              </span>
              <kbd className="pgx-kbd">esc</kbd>
            </div>
            <div className="pgx-modal-body">
              <div className="pgx-palette-search">
                <Search className="h-4 w-4" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setIndex(0);
                  }}
                  placeholder={isSv ? "Sök eller skriv en uppgift…" : "Search or pick a task…"}
                />
              </div>
              <div className="pgx-palette-list">
                {filtered.length === 0 && (
                  <p className="pgx-empty-note">{isSv ? "Inget matchade." : "Nothing matched."}</p>
                )}
                {filtered.map((action, i) => (
                  <button
                    key={action.id}
                    type="button"
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => {
                      action.run();
                      setOpen(false);
                    }}
                    className={`pgx-palette-item ${i === index ? "is-active" : ""}`}
                  >
                    <span className="pgx-palette-icon">{action.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] text-white/90">{action.label}</span>
                      {action.hint && (
                        <span className="block truncate text-[11px] text-white/40">{action.hint}</span>
                      )}
                    </span>
                    <span className="pgx-palette-group">{action.group}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
