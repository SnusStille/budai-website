"use client";

import { useEffect, useRef, useState } from "react";

type Seg = [string, string];
const STATUSES = ["developer preview", "shipping weekly", "building in public", "your new ChatGPT"];
const STACK = ["Next.js", "TypeScript", "Tailwind", "Supabase", "Claude API"];
const S = "text-accent-cyan";

function build(status: string): Seg[][] {
  return [
    [["const", "text-accent-purple"], [" stilledev = {", ""]],
    [["  codingFor: ", ""], ['"10 years"', S], [",", ""]],
    [["  buildingBudAI: ", ""], ['"2 years"', S], [",", ""]],
    [["  stack: [", ""]],
    ...STACK.map((s, i): Seg[] => [["    ", ""], [`"${s}"`, S], [i < STACK.length - 1 ? "," : "", ""]]),
    [["  ],", ""]],
    [["  goal: ", ""], ['"your new ChatGPT"', S], [",", ""]],
    [["  status: ", ""], [`"${status}"`, S], [",", ""]],
    [["};", ""]],
  ];
}

/** A code card that types itself, compiles, then keeps editing its own status line. */
export default function CodeTyper() {
  const box = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(STATUSES[0]);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const lines = build(status);
  const lens = lines.map((l) => l.reduce((a, [t]) => a + t.length, 0));
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b + 1, 0));
  const total = lens.reduce((a, b) => a + b + 1, 0);
  const statusLine = lines.length - 2;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(9999);
      setDone(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setStarted(true);
        io.disconnect();
      }
    });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || done) return;
    const id = window.setInterval(() => {
      setN((v) => {
        if (v + 1 >= total) {
          window.clearInterval(id);
          setDone(true);
          return total;
        }
        return v + 1;
      });
    }, 22);
    return () => window.clearInterval(id);
  }, [started, done, total]);

  useEffect(() => {
    if (!done || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let timer: number;
    const wait = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)));
    (async () => {
      let i = 0;
      while (alive) {
        await wait(3600);
        const cur = STATUSES[i % STATUSES.length];
        const next = STATUSES[(i + 1) % STATUSES.length];
        for (let c = cur.length - 1; c >= 0 && alive; c--) {
          setStatus(cur.slice(0, c));
          await wait(34);
        }
        for (let c = 1; c <= next.length && alive; c++) {
          setStatus(next.slice(0, c));
          await wait(58);
        }
        i++;
      }
    })();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [done]);

  return (
    <div ref={box} className="relative overflow-hidden">
      <div className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.85] text-white/80">
        {lines.map((segs, li) => {
          if (li > 0 && n < starts[li]) return null;
          let left = Math.max(0, n - starts[li]);
          const typing = !done && n >= starts[li] && n < starts[li] + lens[li] + 1;
          return (
            <div key={li} className="flex whitespace-pre">
              <span className="mr-4 w-5 shrink-0 select-none text-right text-white/20">{li + 1}</span>
              <span>
                {segs.map(([t, cls], si) => {
                  const take = Math.min(left, t.length);
                  left -= take;
                  return take ? (
                    <span key={si} className={cls}>
                      {t.slice(0, take)}
                    </span>
                  ) : null;
                })}
                {(typing || (done && li === statusLine)) && <span className="bud-caret" />}
              </span>
            </div>
          );
        })}
        {done && (
          <div className="bud-pop mt-1 flex whitespace-pre text-accent-green/80">
            <span className="mr-4 w-5 shrink-0" />
            <span>{'// ✓ compiled in 0.4s'}</span>
          </div>
        )}
      </div>
      {started && <div aria-hidden className="bud-codescan pointer-events-none absolute inset-x-0 top-0 h-12" />}
    </div>
  );
}
