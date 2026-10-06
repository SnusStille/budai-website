"use client";

const C = { cyan: "#00e5ff", purple: "#b967ff", green: "#00ff9d" };

// x/y in %, d = depth (1 = near, sharp, moves most; 0.4 = far, blurred), s = size px
const ITEMS = [
  { g: "</>", x: 4, y: 16, d: 0.9, s: 58, c: C.cyan, r: -8, dur: 9 },
  { g: "{ }", x: 92, y: 22, d: 0.6, s: 50, c: C.purple, r: 10, dur: 11 },
  { g: "01", x: 90, y: 58, d: 0.95, s: 54, c: C.cyan, r: -6, dur: 8 },
  { g: "AI", x: 6, y: 52, d: 0.5, s: 46, c: C.purple, r: 12, dur: 12 },
  { g: "fn()", x: 5, y: 80, d: 0.75, s: 62, c: C.green, r: -10, dur: 10 },
  { g: "=>", x: 93, y: 84, d: 0.45, s: 46, c: C.cyan, r: 8, dur: 13 },
];

/** Page-wide depth layer: glass code tiles that float and drift at different speeds while you scroll. */
export default function FloatingGlyphs() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden>
      {ITEMS.map((it, i) => (
        <div
          key={it.g}
          className={`absolute ${i > 3 ? "hidden md:block" : i > 1 ? "hidden sm:block" : ""}`}
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            transform: `translate3d(0, calc(var(--sy, 0) * ${-0.03 * it.d}px), 0)`,
          }}
        >
          <div
            className="bud-float flex items-center justify-center rounded-2xl border font-mono"
            style={
              {
                width: it.s,
                height: it.s,
                fontSize: it.s * 0.3,
                color: it.c,
                borderColor: `${it.c}33`,
                background: `linear-gradient(135deg, ${it.c}14, rgba(255,255,255,0.02))`,
                boxShadow: `0 0 ${24 * it.d}px ${it.c}22, inset 0 0 14px ${it.c}12`,
                opacity: 0.35 + it.d * 0.4,
                filter: it.d < 0.55 ? "blur(1.2px)" : undefined,
                "--r": `${it.r}deg`,
                "--dur": `${it.dur}s`,
                animationDelay: `${i * -1.7}s`,
              } as React.CSSProperties
            }
          >
            {it.g}
          </div>
        </div>
      ))}
    </div>
  );
}
