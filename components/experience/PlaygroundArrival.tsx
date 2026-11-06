"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Stable, direct product presentation. The former scroll-projection was purely
 * decorative; expansion and overlays retain their stacking behavior here. */
export default function PlaygroundArrival({ children, expanded, overlay = false }: { children: ReactNode; expanded: boolean; overlay?: boolean }) {
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = document.getElementById("playground");
    if (section) section.style.zIndex = expanded || overlay ? "90" : "";
    if (anchor.current) {
      anchor.current.dataset.expanded = String(expanded);
      anchor.current.dataset.arrival = "1.0000";
    }
    return () => { if (section) section.style.zIndex = ""; };
  }, [expanded, overlay]);

  return <div ref={anchor} className="playground-arrival-anchor" data-playground-arrival><div className="playground-plane">{children}</div></div>;
}
