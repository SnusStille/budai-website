"use client";

import { Gift, Languages, Code2, ShieldCheck } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

export default function ProofBar() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const items = [
    { i: Gift, t: sv ? "Gratis under preview" : "Free during the preview", c: "text-accent-cyan" },
    { i: Languages, t: sv ? "Svenska och engelska" : "Swedish and English", c: "text-accent-purple" },
    { i: Code2, t: sv ? "10 år av kod bakom" : "10 years of code behind it", c: "text-accent-green" },
    { i: ShieldCheck, t: sv ? "Du äger ditt minne" : "You own your memory", c: "text-accent-pink" },
  ];
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 -mt-2 mb-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-4 bud-3d-in">
        {items.map((x) => (
          <div key={x.t} className="flex items-center gap-3 bg-[#05050b]/90 px-4 py-4 backdrop-blur-xl">
            <x.i className={`h-5 w-5 shrink-0 ${x.c}`} />
            <span className="text-[13px] font-medium text-white/85">{x.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
