"use client";

import { useEffect, useRef, useState } from "react";
import { markIntroDone } from "@/components/effects/introState";

const WORD = "BudAI";
const GLYPHS = "01<>{}/=+*#";
const BOOT = ["init core", "load models", "warm up playground", "ready"];
const DURATION = 2200;

/** Each letter of the wordmark scrambles through code characters, then locks in. */
function Scramble({ start }: { start: number }) {
  const [out, setOut] = useState<string[]>(() => WORD.split("").map(() => ""));
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const el = t - t0;
      setOut(WORD.split("").map((c, i) => {
        const s = start + i * 300;
        if (el < s) return "";
        if (el > s + 520) return c;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }));
      if (el < start + WORD.length * 300 + 600) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start]);

  return (
    <span aria-label={WORD}>
      {WORD.split("").map((c, i) => (
        <span key={i} className="relative inline-block" aria-hidden>
          <span className="invisible">{c}</span>
          <span className={`absolute inset-0 flex items-center justify-center ${i >= 3 ? "text-accent-cyan" : ""} ${out[i] && out[i] !== c ? "opacity-60 font-mono" : ""}`}>
            {out[i]}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [out, setOut] = useState(false);
  const [p, setP] = useState(0);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    let fresh = true;
    try {
      const ts = Number(localStorage.getItem("budai_intro_ts") || 0);
      fresh = !ts || Date.now() - ts > 30 * 60 * 1000;
    } catch {
      /* ignore */
    }
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const slow = !!nav.connection?.saveData || (!!nav.deviceMemory && nav.deviceMemory <= 2);
    if (!fresh || slow) {
      markIntroDone();
      setShow(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 350 : DURATION;
    document.body.style.overflow = "hidden";
    let raf = 0;
    let closing = false;
    finish.current = () => {
      if (closing) return;
      closing = true;
      cancelAnimationFrame(raf);
      try {
        localStorage.setItem("budai_intro_ts", String(Date.now()));
      } catch {
        /* ignore */
      }
      setP(1);
      setOut(true);
      markIntroDone(); // hero starts entering as the intro flies away
      window.setTimeout(() => {
        document.body.style.overflow = "";
        setShow(false);
      }, 900);
    };
    const start = performance.now();
    const tick = (t: number) => {
      const v = Math.min(1, (t - start) / duration);
      setP(v);
      if (v < 1) raf = requestAnimationFrame(tick);
      else finish.current();
    };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;
  const thresholds = [0.1, 0.36, 0.62, 0.9];

  return (
    <div
      role="status"
      aria-label="Loading BudAI"
      onClick={() => finish.current()}
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#020205] transition-[opacity,transform,filter] duration-[900ms] ease-out ${
        out ? "opacity-0 scale-110 blur-md pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="ai-grid absolute inset-0 opacity-30" aria-hidden />
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.35),transparent_55%)] transition-opacity duration-700 ${out ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
      {/* CSS-only core: the intro must never compete with the page for GPU time */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="relative h-[min(78vw,540px)] w-[min(78vw,540px)]">
          <div className="absolute inset-[16%] rounded-full bg-accent-cyan/[0.10] blur-[90px]" />
          <div className="absolute inset-[26%] rounded-full bg-accent-purple/[0.12] blur-[80px]" />
          <div
            className="intro-orbit absolute inset-0 rounded-full opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(0,229,255,0.5) 14%, transparent 34%, rgba(124,92,255,0.45) 58%, transparent 78%, rgba(45,212,191,0.35) 92%, transparent 100%)",
              maskImage: "radial-gradient(circle, transparent 58%, #000 66%, #000 74%, transparent 82%)",
              WebkitMaskImage:
                "radial-gradient(circle, transparent 58%, #000 66%, #000 74%, transparent 82%)",
            }}
          />
          <div className="intro-orbit absolute inset-[12%] rounded-full border border-dashed border-white/10" style={{ animationDirection: "reverse", animationDuration: "26s" }} />
          <div className="absolute inset-[32%] rounded-full border border-accent-cyan/25 intro-pulse" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_40px_12px_rgba(0,229,255,0.55)]" />
        </div>
      </div>

      {/* top: credit, tagline, wordmark */}
      <div className="absolute inset-x-0 top-[6%] sm:top-[8%] flex flex-col items-center gap-2 text-center">
        <p className="bud-pop font-mono text-[11px] uppercase tracking-[0.35em] text-white/40" style={{ animationDelay: "0.3s" }}>
          DEVELOPED BY <b className="font-bold text-accent-cyan [text-shadow:0_0_14px_rgba(0,229,255,0.6)]">STILLEDEV</b>
        </p>
        <p className="bud-pop text-base sm:text-xl font-medium tracking-wide text-white/80" style={{ animationDelay: "0.7s" }}>
          Your new <span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">ChatGPT</span>
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white [text-shadow:0_0_50px_rgba(0,229,255,0.45)]">
          <Scramble start={900} />
        </h1>
      </div>

      {/* bottom: progress + boot log */}
      <div className="absolute inset-x-0 bottom-[4%] flex flex-col items-center">
        <div className="relative h-px w-64 bg-white/10 sm:w-72">
          <div className="h-px bg-gradient-to-r from-accent-cyan to-accent-purple" style={{ width: `${p * 100}%` }} />
          <span className="absolute -top-[3px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(0,229,255,1)]" style={{ left: `${p * 100}%` }} />
        </div>
        <ul className="mt-3 h-[68px] w-64 space-y-1 font-mono text-[11px] text-white/45 sm:w-72">
          {BOOT.map((b, i) =>
            p >= thresholds[i] ? (
              <li key={b} className="bud-pop flex justify-between" style={{ animationDuration: "0.5s" }}>
                <span>&gt; {b}</span>
                <span className="text-accent-green">ok</span>
              </li>
            ) : null
          )}
        </ul>
        <p className="bud-pop text-[11px] text-white/25" style={{ animationDelay: "0.8s" }}>click to skip</p>
      </div>
    </div>
  );
}
