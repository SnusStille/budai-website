"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/components/cinema/motion";

/**
 * The house motion signature: lines of type rise out of a mask on one easing curve,
 * staggered. Everything else on the page is allowed to move less than this.
 */
export function Lines({
  as: Tag = "h2",
  lines,
  className = "",
  accentIndex,
  accentClass = "text-[color:var(--st-signal)]",
  id,
}: {
  as?: ElementType;
  lines: (string | ReactNode)[];
  className?: string;
  accentIndex?: number;
  accentClass?: string;
  id?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`st-lines ${shown ? "is-in" : ""}`}>
      <Tag className={className} id={id}>
        {lines.map((line, i) => (
          <span key={i} className="st-line">
            <span style={{ ["--i" as string]: i }} className={accentIndex === i ? accentClass : undefined}>
              {line}
            </span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

/** Fade + rise, staggered by `i`. */
export function Fade({
  children,
  i = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  i?: number;
  className?: string;
  as?: ElementType;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>(0.1);
  return (
    <Tag ref={ref} className={`st-fade ${shown ? "is-in" : ""} ${className}`} style={{ ["--i" as string]: i }}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="st-eyebrow flex items-center gap-3">
      <span className="st-num">{index}</span>
      <span aria-hidden className="h-px w-8" style={{ background: "var(--st-line)" }} />
      {children}
    </p>
  );
}

/** The chapter rule: a hairline that draws itself in. */
export function Rule({ className = "" }: { className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={`${shown ? "is-in" : ""}`}>
      <div className={`st-rule ${className}`} />
    </div>
  );
}

/**
 * A slow typographic ticker. Keeps a still frame alive without asking the GPU for anything.
 * Pauses on hover and disappears entirely under reduced motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="st-marquee-wrap" role="presentation">
      <div className="st-marquee" aria-hidden>
        {[0, 1].map((copy) => (
          <span key={copy} className="st-marquee__row">
            {row.map((t, i) => (
              <span key={`${copy}-${i}`} className="st-marquee__cell">
                <span className="st-mono uppercase">{t}</span>
                <span className="st-marquee__dot" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
