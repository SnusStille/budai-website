"use client";

import { useEffect, useRef, useState } from "react";

const WORD = "BudAI";

/** "BudAI" that types itself, holds, deletes and types again. Always fully readable while hovered or pressed. */
export default function TypeWordmark() {
  const [n, setN] = useState(WORD.length);
  const root = useRef<HTMLSpanElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const link = root.current?.closest("a");
    const on = () => {
      paused.current = true;
      setN(WORD.length);
    };
    const off = () => {
      paused.current = false;
    };
    link?.addEventListener("pointerenter", on);
    link?.addEventListener("pointerdown", on);
    link?.addEventListener("pointerleave", off);
    link?.addEventListener("focus", on);
    link?.addEventListener("blur", off);

    let alive = true;
    let timer: number;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)));
    const hold = async () => {
      while (paused.current && alive) await wait(250);
    };
    (async () => {
      if (reduce) return;
      await wait(1600);
      while (alive) {
        for (let i = WORD.length - 1; i >= 0 && alive; i--) {
          await hold();
          if (!alive) return;
          setN(i);
          await wait(110);
        }
        await wait(450);
        for (let i = 1; i <= WORD.length && alive; i++) {
          setN(i);
          await wait(170);
        }
        await wait(4800);
        await hold();
      }
    })();
    return () => {
      alive = false;
      window.clearTimeout(timer);
      link?.removeEventListener("pointerenter", on);
      link?.removeEventListener("pointerdown", on);
      link?.removeEventListener("pointerleave", off);
      link?.removeEventListener("focus", on);
      link?.removeEventListener("blur", off);
    };
  }, []);

  const typed = WORD.slice(0, n);
  return (
    <span ref={root} className="relative inline-block text-xl font-bold tracking-tight" aria-label={WORD}>
      <span className="invisible" aria-hidden>{WORD}</span>
      <span className="absolute inset-y-0 left-0 whitespace-nowrap" aria-hidden>
        {typed.slice(0, 3)}
        <span className="text-accent-cyan">{typed.slice(3)}</span>
        <span className="bud-caret" />
      </span>
    </span>
  );
}
