"use client";

import { useEffect, useRef } from "react";
import { subscribeJourney } from "@/lib/experience/scroll";

/** Transform-based progress bar — no React re-renders on every scroll tick */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeJourney((frame) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${frame.progress})`;
  }), []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[100] bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green"
      style={{ transform: "scaleX(0)", willChange: "transform" }}
      aria-hidden
    />
  );
}
