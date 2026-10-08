"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, CornerDownLeft, Sparkles } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** Ask box under the hero: type, and the Playground opens with your question filled in. */
export default function HeroAsk() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [v, setV] = useState("");
  const [sent, setSent] = useState(false);

  const chips = sv
    ? [
        "Skriv ett vänligt påminnelsemejl",
        "Planera min vecka",
        "Förklara ränta på ränta enkelt",
      ]
    : [
        "Write a friendly reminder email",
        "Plan my week",
        "Explain compound interest simply",
      ];

  const go = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setSent(true);
    window.setTimeout(() => setSent(false), 900);
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: clean }));
    const ta = document.querySelector<HTMLTextAreaElement>("#playground textarea");
    (ta ?? document.getElementById("playground"))?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const empty = !v.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto -mt-4 mb-6 max-w-2xl px-4 sm:px-6"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(v);
        }}
      >
        <div
          className={`group flex items-center gap-2 rounded-2xl border border-white/10 bg-[#07070e]/80 p-2 pl-5 backdrop-blur-xl transition-all duration-300 focus-within:border-accent-cyan/40 focus-within:shadow-[0_0_60px_-18px_rgba(0,229,255,0.55)] ${
            sent ? "border-accent-green/40 shadow-[0_0_60px_-18px_rgba(45,212,191,0.55)]" : ""
          }`}
        >
          <Sparkles
            aria-hidden
            className="h-4 w-4 shrink-0 text-accent-cyan/70 transition-colors group-focus-within:text-accent-cyan"
          />
          <input
            value={v}
            onChange={(e) => {
              setV(e.target.value);
              window.dispatchEvent(new Event("budai:typing"));
            }}
            placeholder={sv ? "Fråga BudAI vad som helst…" : "Ask BudAI anything…"}
            aria-label={sv ? "Fråga BudAI" : "Ask BudAI"}
            enterKeyHint="send"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-muted/70"
          />
          <kbd
            aria-hidden
            className="mr-1 hidden items-center gap-1 rounded-md border border-white/10 bg-black/30 px-1.5 py-1 font-mono text-[10px] text-muted/60 sm:flex group-focus-within:border-accent-cyan/25 group-focus-within:text-accent-cyan/80"
          >
            <CornerDownLeft className="h-2.5 w-2.5" />
            Enter
          </kbd>
          <button
            type="submit"
            aria-label={sv ? "Skicka till Playground" : "Send to the Playground"}
            disabled={empty}
            className={`press flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan text-[#020205] transition-all duration-200 hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none ${
              sent ? "bg-accent-green" : ""
            }`}
          >
            <ArrowUp className={`h-5 w-5 transition-transform ${sent ? "rotate-45" : ""}`} />
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {chips.map((c, i) => (
          <motion.button
            key={c}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.62 + i * 0.07 }}
            onClick={() => go(c)}
            className="press rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-cyan/30 hover:bg-accent-cyan/[0.05] hover:text-white"
          >
            {c}
          </motion.button>
        ))}
      </div>

      <p className="mt-2 text-center text-[11px] text-muted/60">
        {sv ? "Ingen registrering behövs för att prova." : "No signup needed to try it."}
      </p>
    </motion.div>
  );
}
