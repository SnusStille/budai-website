"use client";

import { useEffect, useRef, useState } from "react";
import BudAILogo from "@/components/ui/BudAILogo";
import Tilt3D from "@/components/ui/Tilt3D";

const LAYERS = [-28, -20, -12, -6, 0, 6, 12, 20, 28];
const WORD = "BudAI";
const GLYPHS = "01<>{}/=+*#";
const BOOT = ["init core", "load models", "warm up playground", "ready"];
const DURATION = 5600;

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
      setShow(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 1800 : DURATION;
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
    return () => {
      cancelAnimationFrame(raf);
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
      <div className="absolute h-[620px] w-[620px] rounded-full bg-accent-cyan/[0.08] blur-[140px]" aria-hidden />
      <div className="absolute h-[380px] w-[380px] translate-x-24 translate-y-20 rounded-full bg-accent-purple/[0.12] blur-[120px]" aria-hidden />

      {/* top: credit, tagline, wordmark */}
      <div className="absolute inset-x-0 top-[6%] sm:top-[8%] flex flex-col items-center gap-2 text-center">
        <p className="bud-pop font-mono text-[11px] uppercase tracking-[0.35em] text-white/40" style={{ animationDelay: "0.3s" }}>
          DEVELOPED BY <b className="font-bold text-accent-cyan [text-shadow:0_0_14px_rgba(0,229,255,0.6)]">STILLEDEV</b>
        </p>
        <p className="bud-pop text-base sm:text-xl font-medium tracking-wide text-white/80" style={{ animationDelay: "1.6s" }}>
          Your new <span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">ChatGPT</span>
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white [text-shadow:0_0_50px_rgba(0,229,255,0.45)]">
          <Scramble start={2200} />
        </h1>
      </div>

      {/* center: the logo, exactly mid-screen */}
      <div className="relative flex items-center justify-center scale-[0.8] sm:scale-100">
        <span className="bud-shock" style={{ animationDelay: "0.7s" }} aria-hidden />
        <span className="bud-shock" style={{ animationDelay: "3.2s" }} aria-hidden />
        <Tilt3D max={10}>
          <div className="bud-scene" style={{ perspective: 900 }}>
            <div className="bud-logo3d">
              {LAYERS.map((z, i) => (
                <div
                  key={z}
                  className="bud-layer-in absolute inset-0 flex items-center justify-center"
                  style={{ transform: `translateZ(${z}px)`, opacity: z === 0 ? 1 : 0.1 + (28 - Math.abs(z)) / 190, animationDelay: `${0.4 + i * 0.09}s` }}
                >
                  <BudAILogo size="hero" animated={z === 0} />
                </div>
              ))}
              <div className="bud-ring3d" />
              <div className="bud-ring3d bud-ring3d-b" />
            </div>
          </div>
        </Tilt3D>
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
        <p className="bud-pop text-[11px] text-white/25" style={{ animationDelay: "1.5s" }}>click to skip</p>
      </div>
    </div>
  );
}
