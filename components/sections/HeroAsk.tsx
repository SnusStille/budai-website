"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** Ask box under the hero: type, and the Playground opens with your question filled in. */
export default function HeroAsk() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [v, setV] = useState("");
  const chips = sv
    ? ["Skriv ett vänligt påminnelsemejl", "Planera min vecka", "Förklara ränta på ränta enkelt"]
    : ["Write a friendly reminder email", "Plan my week", "Explain compound interest simply"];

  const go = (text: string) => {
    if (!text.trim()) return;
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: text.trim() }));
  };

  return (
    <div className="relative z-10 mx-auto -mt-4 mb-6 max-w-2xl px-4 sm:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(v);
        }}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#05050b]/80 p-2 pl-5 shadow-[0_0_60px_-20px_rgba(0,229,255,0.45)] backdrop-blur-xl transition-colors focus-within:border-accent-cyan/40"
      >
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder={sv ? "Fråga BudAI vad som helst…" : "Ask BudAI anything…"}
          aria-label={sv ? "Fråga BudAI" : "Ask BudAI"}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-muted/70"
        />
        <button type="submit" aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan text-[#020205] transition-opacity hover:opacity-90">
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button key={c} type="button" onClick={() => go(c)} className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-cyan/30 hover:text-white">
            {c}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted/60">{sv ? "Ingen registrering behövs för att prova." : "No signup needed to try it."}</p>
    </div>
  );
}
