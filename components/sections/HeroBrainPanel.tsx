"use client";

import { useEffect, useState } from "react";
import BrainFlight from "@/components/effects/BrainFlight";

/** The only opening brain scene. Its camera is driven by reversible page progress. */
export default function HeroBrainPanel() {
  const [activity, setActivity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        setProgress(reduced ? 0 : Math.max(0, Math.min(1, scrollY / (innerHeight * 0.92))));
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const onActivity = (event: Event) => {
      const level = (event as CustomEvent<{ level: number }>).detail?.level ?? 0;
      setActivity(level > 0 ? 1 : 0);
    };
    addEventListener("budai:activity", onActivity);
    return () => removeEventListener("budai:activity", onActivity);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {failed ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,229,255,0.14),transparent_60%)]" />
      ) : (
        <div className="absolute inset-0 opacity-[0.86] [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_82%)]">
          <BrainFlight
            mode="intro"
            progress={progress}
            activity={activity}
            onFail={() => setFailed(true)}
          />
        </div>
      )}
      <div className="brain-digital-bridge" style={{ opacity: 0.2 + progress * 0.8 }}>
        <span /><span /><span /><i />
      </div>
    </div>
  );
}
