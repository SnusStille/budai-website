"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Beams drawn between measured DOM nodes.
 *
 * Technique researched in magicui's `animated-beam` (MIT, https://github.com/magicuidesign/magicui),
 * rewritten for this page: one SVG for the whole group, paths solved from live element rects so the
 * same component works across a 5-across desktop row and a stacked phone column, re-measured on
 * resize rather than on scroll, and never animated while off screen.
 *
 * Scene E is about systems wired together, so the wiring is drawn from the real layout instead of
 * being faked with a static gradient. Purely decorative: pointer-transparent and hidden from AT.
 *
 * Render as the first child of a `position: relative` container holding the nodes.
 */
export default function Beams({
  refs,
  gap = 4,
}: {
  refs: React.RefObject<HTMLElement | null>[];
  /** px the beam pulls back from each node edge */
  gap?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  const inView = useInView(svgRef, { margin: "200px" });
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [geo, setGeo] = useState<{ d: string[]; w: number; h: number }>({ d: [], w: 0, h: 0 });

  const measure = useCallback(() => {
    const host = svgRef.current?.parentElement as HTMLElement | null;
    hostRef.current = host;
    if (!host || refs.length < 2) return;
    const box = host.getBoundingClientRect();
    const d: string[] = [];
    for (let i = 0; i < refs.length - 1; i++) {
      const a = refs[i].current;
      const b = refs[i + 1].current;
      if (!a || !b) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      // leave the source through its right edge when the next node sits beside it, else its bottom
      const sideways = rb.left - ra.right > 2 || Math.abs(rb.top - ra.bottom) > 40;
      const x1 = (sideways ? ra.right : ra.left + ra.width / 2) - box.left + (sideways ? gap : 0);
      const y1 = (sideways ? ra.top + ra.height / 2 : ra.bottom) - box.top;
      const x2 = (sideways ? rb.left : rb.left + rb.width / 2) - box.left - (sideways ? gap : 0);
      const y2 = (sideways ? rb.top + rb.height / 2 : rb.top) - box.top;
      const bend = 0.45;
      const c1x = sideways ? x1 + Math.abs(x2 - x1) * bend : x1;
      const c1y = sideways ? y1 : y1 + Math.abs(y2 - y1) * bend;
      const c2x = sideways ? x2 - Math.abs(x2 - x1) * bend : x2;
      const c2y = sideways ? y2 : y2 - Math.abs(y2 - y1) * bend;
      d.push(
        `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
      );
    }
    if (!d.length) return;
    setGeo((prev) =>
      prev.w === box.width && prev.h === box.height && prev.d.join("|") === d.join("|")
        ? prev
        : { d, w: box.width, h: box.height }
    );
  }, [refs, gap]);

  useEffect(() => {
    measure();
    const host = hostRef.current;
    if (typeof ResizeObserver !== "undefined" && host) {
      const ro = new ResizeObserver(() => measure());
      ro.observe(host);
      window.addEventListener("orientationchange", measure);
      return () => {
        ro.disconnect();
        window.removeEventListener("orientationchange", measure);
      };
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // webfonts and lazy panels change node positions after first paint
  useEffect(() => {
    const t = [140, 620, 1800].map((ms) => window.setTimeout(measure, ms));
    return () => t.forEach(window.clearTimeout);
  }, [measure]);

  // always mounted (an empty box until measured) so the in-view observer has a target
  return (
    <svg
      ref={svgRef}
      className="st-beams"
      viewBox={geo.w ? `0 0 ${geo.w} ${geo.h}` : "0 0 0 0"}
      width={geo.w}
      height={geo.h}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--st-signal)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--st-signal)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--st-bleed)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {geo.d.map((d, i) => (
        <g key={i}>
          <path d={d} className="st-beams__track" />
          {reduced || !inView ? (
            <path d={d} stroke={`url(#${uid}-g)`} strokeWidth={1.2} fill="none" opacity={0.5} />
          ) : (
            <motion.path
              d={d}
              stroke={`url(#${uid}-g)`}
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 0.9, 1], opacity: [0, 1, 0.12] }}
              transition={{
                duration: 2.8,
                times: [0, 0.6, 1],
                delay: 0.3 + i * 0.44,
                ease: [0.16, 1, 0.3, 1],
                repeat: Infinity,
                repeatDelay: 2.2,
              }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
