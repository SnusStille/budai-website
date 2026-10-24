"use client";

import type { ReactNode } from "react";
import type { SceneId } from "@/lib/cinema/timeline";

/**
 * Semantic shell for a chapter. The id doubles as the journey anchor (see lib/cinema/scroll.ts)
 * and the label target, so the film is navigable by assistive tech without knowing WebGL exists.
 */
export default function Scene({
  id,
  children,
  className = "",
  titleId,
  tone = "default",
}: {
  id: SceneId;
  children: ReactNode;
  className?: string;
  titleId?: string;
  tone?: "default" | "veil";
}) {
  return (
    <section
      id={id}
      data-scene={id}
      aria-labelledby={titleId}
      className={`st-scene ${tone === "veil" ? "st-scene--veil" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
