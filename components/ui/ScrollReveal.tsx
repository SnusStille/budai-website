"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  duration?: number;
}

/** HTML is visible by default; only offscreen, motion-enabled elements opt in. */
export default function ScrollReveal({ children, className = "", delay = 0, direction = "up", duration = .7 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.dataset.reveal = "visible"; observer.disconnect(); } }, { rootMargin: "0px 0px -25px", threshold: .06 });
    const show = () => { if (media.matches) { el.dataset.reveal = "visible"; observer.disconnect(); } };
    if (!media.matches && el.getBoundingClientRect().top > window.innerHeight) { el.dataset.reveal = "pending"; observer.observe(el); }
    media.addEventListener("change", show);
    return () => { observer.disconnect(); media.removeEventListener("change", show); };
  }, []);
  return <div ref={ref} className={`journey-reveal ${className}`} data-direction={direction} style={{ "--reveal-delay": `${delay}s`, "--reveal-duration": `${duration}s` } as CSSProperties}>{children}</div>;
}
