"use client";

import { useEffect, useState } from "react";
import BudAILogo, { BudAIWordmark, type LogoSize, type LogoVariant } from "@/components/ui/BudAILogo";

/**
 * Logo Lab — the one place to judge the BudAI mark.
 * Dark, light, mono, every size, every state, live animation, favicon crop.
 * Nothing here ships to users; it exists so the mark can be judged honestly.
 */

const SIZES: LogoSize[] = ["xs", "sm", "md", "lg", "xl", "hero"];
const STATES = [
  { id: "idle", label: "Idle — breathing", hint: "the default: slow light, calm nodes" },
  { id: "thinking", label: "Thinking — BudAI at work", hint: "the light runs ~3× faster" },
  { id: "alert", label: "Alert — needs attention", hint: "a quicker pulse, for errors" },
  { id: "static", label: "Static — no motion", hint: "reduced motion, print, screenshots" },
] as const;

export default function LogoLab() {
  const [state, setState] = useState<(typeof STATES)[number]["id"]>("idle");
  const [bootKey, setBootKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="logo-lab">
      <section className="logo-lab-hero">
        <p className="logo-lab-eyebrow">BudAI · brand mark</p>
        <h1 className="logo-lab-title">
          One line. It becomes a B,
          <br />
          and opens like a bud.
        </h1>
        <p className="logo-lab-lede">
          A single unbroken stroke rises from a base node, folds into the two bowls of a B, and opens at the top — BudAI
          growing in public. Four nodes are the network. The light travelling the line is the AI at work.
        </p>
        <div className="logo-lab-bigwrap">
          <BudAILogo size="hero" motion={state} animated />
        </div>
        <div className="logo-lab-states" role="tablist" aria-label="Logo state">
          {STATES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={state === s.id}
              className={`logo-lab-state ${state === s.id ? "is-active" : ""}`}
              onClick={() => setState(s.id)}
              title={s.hint}
            >
              {s.label}
            </button>
          ))}
          <button type="button" className="logo-lab-state" onClick={() => setBootKey((k) => k + 1)}>
            Replay boot ↺
          </button>
        </div>
        {reduceMotion && <p className="logo-lab-note">prefers-reduced-motion is on in this browser — motion is parked.</p>}
      </section>

      <section className="logo-lab-block">
        <h2>Every size it has to survive</h2>
        <p className="logo-lab-sub">
          Favicon at the far left (18px) up to the loading screen (180px). If it stops reading as a B, it is not done.
        </p>
        <div className="logo-lab-sizes">
          {SIZES.map((size) => (
            <div key={size} className="logo-lab-size">
              <div className="logo-lab-size-mark" key={`${size}-${bootKey}`}>
                <BudAILogo size={size} motion={state} animated boot={bootKey > 0} />
              </div>
              <span className="logo-lab-size-label">
                {size}
                <em>{size === "xs" ? "18 · favicon" : size === "hero" ? "180 · loading" : ""}</em>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="logo-lab-block">
        <h2>On the backgrounds it must live on</h2>
        <div className="logo-lab-surfaces">
          {([
            ["dark", "dark", "Dark surface"],
            ["light", "light", "Light surface"],
            ["mono", "dark", "Mono · one colour"],
          ] as Array<[LogoVariant, "dark" | "light", string]>).map(([variant, surface, label]) => (
            <div key={variant} className={`logo-lab-surface is-${surface}`}>
              <BudAILogo size="xl" variant={variant} motion={state} animated />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="logo-lab-block">
        <h2>In place</h2>
        <p className="logo-lab-sub">Lockup, navbar height, footer, and the state it takes while a response streams.</p>
        <div className="logo-lab-placements">
          <div className="logo-lab-place is-nav">
            <span className="logo-lab-place-label">Navbar</span>
            <span className="logo-lab-navbar">
              <span className="site-brand">
                <BudAILogo size="sm" motion={state} animated interactive />
                <span className="site-brand-word">
                  Bud<span>AI</span>
                </span>
                <span className="site-brand-tag">PREVIEW</span>
              </span>
            </span>
          </div>
          <div className="logo-lab-place">
            <span className="logo-lab-place-label">Lockup</span>
            <BudAIWordmark size="md" motion={state} animated />
          </div>
          <div className="logo-lab-place">
            <span className="logo-lab-place-label">Favicon crop · 32px</span>
            <span className="logo-lab-favicon">
              <BudAILogo size="sm" motion={state} animated />
            </span>
          </div>
        </div>
      </section>

      <section className="logo-lab-block">
        <h2>Why this one</h2>
        <ul className="logo-lab-reasons">
          <li>
            <strong>Reads as a B at 16px.</strong> A straight stem and two clearly separated bowls — tested down to
            favicon size, not just at hero size.
          </li>
          <li>
            <strong>One unbroken line.</strong> No letters stacked on shapes: a single stroke, like one continuous
            conversation.
          </li>
          <li>
            <strong>Open, never closed.</strong> The stroke does not loop back on itself — the bud is still opening,
            which is exactly where BudAI is.
          </li>
          <li>
            <strong>Alive by construction.</strong> Nodes and a travelling light give it motion for free — no added
            decoration, the motion is the drawing.
          </li>
          <li>
            <strong>Not a template.</strong> No gradient orb, no generic sparkle, no plain letter in a rounded square.
          </li>
        </ul>
      </section>
    </div>
  );
}
