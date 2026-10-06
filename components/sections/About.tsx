"use client";

import { useEffect, useRef, useState } from "react";
import { Github, Mail } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";
import Tilt3D from "@/components/ui/Tilt3D";

const CODE = `const stilledev = {
  codingFor: "10 years",
  buildingBudAI: "2 years",
  stack: [
    "Next.js",
    "TypeScript",
    "Tailwind",
    "Supabase",
    "Claude API"
  ],
  goal: "your new ChatGPT",
  status: "developer preview",
};`;

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1400);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v}</span>;
}

export default function About() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [typedChars, setTypedChars] = useState(0);
  const stats = [
    { n: 10, label: sv ? "år av kodande" : "years of coding", c: "text-accent-cyan" },
    { n: 2, label: sv ? "år med BudAI" : "years on BudAI", c: "text-accent-purple" },
    { n: 0, label: "SV · EN", c: "text-accent-green", text: sv ? "Tvåspråkig" : "Bilingual" },
  ];
  const values = sv
    ? ["Kod i produktionskvalitet", "Integritet först", "Öppet på GitHub"]
    : ["Production-grade code", "Privacy first", "Open on GitHub"];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedChars(CODE.length);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let active = true;
    const write = (index: number) => {
      if (!active) return;
      if (index > CODE.length) {
        setTypedChars(0);
        timeout = setTimeout(() => write(1), 320);
        return;
      }
      setTypedChars(index);
      timeout = setTimeout(() => write(index + 1), index === CODE.length ? 1800 : 28);
    };
    write(1);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  const visibleCode = CODE.slice(0, typedChars);
  const codeParts = visibleCode.split(/(const\b|codingFor\b|buildingBudAI\b|stack\b|goal\b|status\b|"(?:[^"]*)?")/g);

  return (
    <section id="about" className="relative section-hairline py-20 md:py-28 overflow-hidden">
      <div className="absolute -left-40 top-1/3 w-[420px] h-[420px] rounded-full bg-accent-green/[0.06] blur-[120px] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <ScrollReveal>
          <span className="section-badge text-accent-green mb-5">{sv ? "Byggaren" : "The builder"}</span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-6">
            {sv ? "10 år av kod." : "10 years of code."}
            <br />
            <span className="text-gradient">{sv ? "2 år av BudAI." : "2 years of BudAI."}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted leading-relaxed mb-8 max-w-lg">
            {sv
              ? "Jag är Stilledev. Jag har skrivit mjukvara i tio år, och de senaste två har jag lagt allt på en sak: BudAI, en AI som faktiskt fungerar i svenskt vardagsarbete. Idag är det en preview. Målet är att bli din nya ChatGPT."
              : "I'm Stilledev. I've been writing software for ten years, and for the last two I've put all of it into one thing: BudAI, an AI that actually works in everyday Swedish work. Today it's a preview. The goal is to become your new ChatGPT."}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg">
            {stats.map((s) => (
              <SpotlightCard key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-4 text-center">
                <p className={`text-3xl sm:text-4xl font-bold ${s.c}`}>{s.n ? <CountUp to={s.n} /> : s.text}</p>
                <p className="mt-1 text-[11px] text-muted">{s.label}</p>
              </SpotlightCard>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {values.map((v) => (
              <span key={v} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80">{v}</span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/SnusStille/budai-website" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#020205] hover:opacity-90 transition-opacity">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a
              href="mailto:Stilleinc@hotmail.com"
              aria-label={sv ? "Skicka e-post till Stilleinc@hotmail.com" : "Email Stilleinc@hotmail.com"}
              className="inline-flex items-center gap-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] px-5 py-3 text-white transition-colors hover:border-accent-cyan/60 hover:bg-accent-cyan/10"
            >
              <Mail className="h-5 w-5 shrink-0 text-accent-cyan" />
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold">{sv ? "Skicka e-post" : "Send an email"}</span>
                <span className="text-xs text-muted">Stilleinc@hotmail.com</span>
              </span>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Tilt3D max={6}>
          <div className="rounded-2xl border border-white/[0.08] bg-[#07070e]/90 shadow-[0_0_80px_-20px_rgba(0,229,255,0.4)] overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
              <span className="ml-3 font-mono text-[11px] text-muted/60">stilledev.ts</span>
            </div>
            <pre
              aria-hidden="true"
              className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.85] text-white/80"
            >
              <code>
                {codeParts.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part === "const"
                        ? "text-accent-purple"
                        : part.startsWith('"')
                          ? "text-accent-cyan"
                          : ""
                    }
                  >
                    {part}
                  </span>
                ))}
                <span className="motion-safe:animate-pulse text-accent-cyan">▍</span>
              </code>
            </pre>
            <span className="sr-only">{CODE}</span>
          </div>
          </Tilt3D>
        </ScrollReveal>
      </div>
    </section>
  );
}
