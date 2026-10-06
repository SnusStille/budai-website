"use client";

import { useEffect, useState } from "react";

const WORD = "BudAI";

/** "BudAI" that types itself, holds, deletes and types again, like a prompt that never stops. */
export default function TypeWordmark() {
  const [n, setN] = useState(WORD.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let timer: number;
    const wait = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)));
    (async () => {
      await wait(1600);
      while (alive) {
        for (let i = WORD.length - 1; i >= 0 && alive; i--) {
          setN(i);
          await wait(110);
        }
        await wait(450);
        for (let i = 1; i <= WORD.length && alive; i++) {
          setN(i);
          await wait(170);
        }
        await wait(4200);
      }
    })();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  const typed = WORD.slice(0, n);
  return (
    <span className="relative inline-block text-xl font-bold tracking-tight" aria-label={WORD}>
      <span className="invisible" aria-hidden>{WORD}</span>
      <span className="absolute inset-y-0 left-0 whitespace-nowrap" aria-hidden>
        {typed.slice(0, 3)}
        <span className="text-accent-cyan">{typed.slice(3)}</span>
        <span className="bud-caret" />
      </span>
    </span>
  );
}
