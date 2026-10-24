"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Ask box under the cinematic entrance: type a question, and the Playground
 * opens with it pre-filled. Stripped to its function — no status strip,
 * no suggestion chips, no fine print between the brain and the product.
 */
export default function HeroAsk() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [v, setV] = useState("");

  const go = (text: string) => {
    if (!text.trim()) return;
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: text.trim() }));
    const ta = document.querySelector<HTMLTextAreaElement>("#playground textarea");
    (ta ?? document.getElementById("playground"))?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div id="enter" className="relative z-10 mx-auto mb-0 max-w-2xl px-4 pt-8 sm:px-6 sm:pt-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(v);
        }}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#07070e]/80 p-2 pl-5 shadow-[0_0_60px_-20px_rgba(0,229,255,0.45)] backdrop-blur-xl transition-colors focus-within:border-accent-cyan/40"
      >
        <input
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            window.dispatchEvent(new Event("budai:typing"));
          }}
          placeholder={sv ? "Fråga BudAI vad som helst…" : "Ask BudAI anything…"}
          aria-label={sv ? "Fråga BudAI" : "Ask BudAI"}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-muted/70"
        />
        <button type="submit" aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan text-[#020205] transition-opacity hover:opacity-90">
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
