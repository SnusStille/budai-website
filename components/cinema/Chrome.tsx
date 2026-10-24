"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emitCinema } from "@/lib/cinema/bus";
import { subscribeScroll } from "@/lib/cinema/scroll";
import { scrollToScene } from "@/lib/cinema/scroll";
import { SCENE_ORDER, clamp01, type SceneId } from "@/lib/cinema/timeline";
import { useActiveScene } from "@/components/cinema/motion";
import { useLang } from "@/components/ui/LanguageContext";
import StockholmClock from "@/components/ui/StockholmClock";

export const SCENE_META: Record<SceneId, { n: string; label: string; labelSv: string }> = {
  arrival: { n: "01", label: "Arrival", labelSv: "Ankomst" },
  descent: { n: "02", label: "Premise", labelSv: "Premiss" },
  intelligence: { n: "03", label: "Intelligence", labelSv: "Intelligens" },
  construction: { n: "04", label: "Construction", labelSv: "Konstruktion" },
  systems: { n: "05", label: "Systems", labelSv: "System" },
  works: { n: "06", label: "Work", labelSv: "Arbeten" },
  contact: { n: "07", label: "Contact", labelSv: "Kontakt" },
};

/* ── film leader ───────────────────────────────────────────────────────────────
   A 2.3s countdown, not a spinner. It never locks the page: it fades on a timer, on
   click, on Esc, and unconditionally after its safety timeout — a visitor can always
   reach the content, and if JS never runs the leader is never in the DOM at all.      */
export function Leader() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [out, setOut] = useState(false);
  const [count, setCount] = useState(3);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    emitCinema({ type: "intro", value: 1 });
    setOut(true);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduced || saveData) {
      finish();
      return;
    }
    const DUR = 2300;
    const t0 = performance.now();
    let raf = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const tick = (t: number) => {
      const p = clamp01((t - t0) / DUR);
      emitCinema({ type: "intro", value: ease(p) });
      setCount(3 - Math.floor(p * 3));
      if (p < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);
    const guard = setTimeout(finish, DUR + 700);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(guard);
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  return (
    <div
      className="st-leader"
      data-out={out}
      onClick={finish}
      aria-hidden={out ? true : undefined}
    >
      <div className="st-leader__frame" />
      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <p className="st-eyebrow">STILLEDEV · STOCKHOLM</p>
        <p className="st-count" aria-hidden>
          {count > 0 ? count : "0"}
        </p>
        <p className="st-mono uppercase">Software, directed</p>
      </div>
      <button
        type="button"
        onClick={finish}
        className="st-leader__skip"
        aria-label={sv ? "Hoppa över introt" : "Skip the intro"}
        autoFocus
      >
        {sv ? "Hoppa över" : "Skip intro"}
      </button>
    </div>
  );
}

/* ── chapter rail: you always know where you are in the film ─────────────────── */
export function Hud() {
  const { lang } = useLang();
  const active = useActiveScene();
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(
    () =>
      subscribeScroll((s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.p.toFixed(4)})`;
      }),
    []
  );
  return (
    <>
      <div className="st-progress" aria-hidden>
        <span ref={bar} className="st-progress__fill" />
      </div>
      <nav className="st-hud" aria-label="Chapters">
        {SCENE_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className="st-hud__item"
            data-active={active === id}
            onClick={() => scrollToScene(id)}
            aria-current={active === id ? "true" : undefined}
          >
            <span className="st-hud__label">{lang === "sv" ? SCENE_META[id].labelSv : SCENE_META[id].label}</span>
            <span className="st-hud__n">{SCENE_META[id].n}</span>
            <span className="st-hud__bar" />
          </button>
        ))}
      </nav>
    </>
  );
}

/* ── top chrome ──────────────────────────────────────────────────────────────── */
export function StudioNav() {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveScene();

  useEffect(
    () =>
      subscribeScroll((s) => {
        setSolid((prev) => (prev !== s.p > 0.015 ? s.p > 0.015 : prev));
      }),
    []
  );

  useEffect(() => {
    document.documentElement.classList.toggle("st-menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("st-menu-open");
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToScene(id);
  };

  const links: { id: SceneId; label: string }[] = SCENE_ORDER.filter((id) => id !== "arrival").map((id) => ({
    id,
    label: sv ? SCENE_META[id].labelSv : SCENE_META[id].label,
  }));

  return (
    <header className={`st-nav ${solid ? "is-solid" : ""}`}>
      <div className="st-nav__inner">
        <button type="button" className="st-nav__brand" onClick={() => go("arrival")} aria-label="STILLEDEV — top">
          <span className="st-nav__mark" aria-hidden>
            <i />
          </span>
          <span className="st-nav__word">STILLEDEV</span>
        </button>

        <nav className="st-nav__links" aria-label="Sections">
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              data-active={active === l.id}
              className="st-nav__link"
            >
              {l.label}
            </button>
          ))}
          <a className="st-nav__link" href="/budai">
            {sv ? "Produkten" : "Product"}
          </a>
        </nav>

        <div className="st-nav__right">
          <StockholmClock className="hidden xl:flex" />
          <div className="st-nav__lang" role="group" aria-label="Language">
            {(["en", "sv"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                data-active={lang === code}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="st-nav__cta" onClick={() => go("contact")}>
            {sv ? "Börja ett projekt" : "Start a project"}
          </button>
          <button
            type="button"
            className="st-nav__burger"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="st-nav__sheet">
          <nav aria-label="Sections mobile">
            {links.map((l, i) => (
              <button key={l.id} type="button" onClick={() => go(l.id)} style={{ ["--i" as string]: i }}>
                <span className="st-num mr-3">{SCENE_META[l.id].n}</span>
                {l.label}
              </button>
            ))}
            <a href="/budai" className="st-nav__sheet-product">
              <span className="st-num mr-3">→</span>
              {sv ? "BudAI — produktsidan" : "BudAI — product site"}
            </a>
          </nav>
          <a className="st-btn st-nav__sheet-cta" href="mailto:Stilleinc@hotmail.com">
            Stilleinc@hotmail.com
          </a>
        </div>
      )}
    </header>
  );
}
