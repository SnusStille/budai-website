"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createStatusFlyoverConfig, createStatusScenes } from "@/components/status/status-scenes";
import { useLang } from "@/components/ui/LanguageContext";
import type { FlyoverHandle, ReadyInfo } from "scroll-flyover";
import StatusStaticStory from "@/components/status/StatusStaticStory";

function announceExperienceReady() {
  document.getElementById("status-flight")?.setAttribute("data-experience-ready", "true");
  window.dispatchEvent(new Event("budai:experience-ready"));
}

function nearestSceneDwell(sceneCount: number, progress: number) {
  const index = Math.min(sceneCount - 1, Math.max(0, Math.floor(progress * sceneCount)));
  return (index + 0.5) / sceneCount;
}

export default function StatusFlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<FlyoverHandle | null>(null);
  const { lang } = useLang();
  const [quality] = useState<"light" | "rich">(() => {
    if (typeof window === "undefined") return "light";
    const device = navigator as Navigator & { deviceMemory?: number };
    const highMemory = (device.deviceMemory ?? 0) >= 12;
    const manyCores = navigator.hardwareConcurrency >= 12;
    const desktop = window.innerWidth >= 1200 && window.matchMedia("(pointer: fine)").matches;
    return desktop && highMemory && manyCores ? "rich" : "light";
  });
  const config = useMemo(() => createStatusFlyoverConfig(lang, quality), [lang, quality]);
  const [engineReady, setEngineReady] = useState(false);
  const [engineFailed, setEngineFailed] = useState(false);
  const sv = lang === "sv";

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    let scheduled = 0;
    let lastEnding = false;
    const update = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => {
        const hostRect = host.getBoundingClientRect();
        const total = Math.max(1, host.offsetHeight - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -hostRect.top / total));
        // The ending card is fixed to the viewport, so explicitly release it as the
        // sticky flight leaves the viewport; otherwise it would cover live checks.
        const flightPinned = hostRect.top <= 0 && hostRect.bottom >= window.innerHeight;
        const ending = progress >= 0.8 && flightPinned;
        if (ending !== lastEnding) {
          lastEnding = ending;
          host.dataset.ending = String(ending);
          const panel = host.querySelector<HTMLElement>(".status-flight-ending");
          if (panel) {
            panel.setAttribute("aria-hidden", String(!ending));
            panel.inert = !ending;
          }
        }
        const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const frameProgress = isReducedMotion
          ? nearestSceneDwell(config.scenes.length, progress)
          : progress;
        // renderAt() is the library's deterministic, same-renderer scroll API. Holding
        // each requested frame avoids an idle 60fps GPU loop on a long pinned page.
        handleRef.current?.renderAt(frameProgress, { time: isReducedMotion ? 0 : performance.now() / 1000 });
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(host);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(scheduled);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [config]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    // Language changes rebuild scene copy; keep the text fallback visible until the
    // replacement canvas has presented its first frame.
    setEngineReady(false);
    setEngineFailed(false);
    let disposed = false;
    let handle: FlyoverHandle | undefined;
    const drawCurrentScroll = () => {
      if (!handle) return;
      const total = Math.max(1, host.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -host.getBoundingClientRect().top / total));
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      handle.renderAt(reduced ? nearestSceneDwell(config.scenes.length, progress) : progress, {
        time: reduced ? 0 : performance.now() / 1000,
      });
    };
    const onContextLost = () => { if (!disposed) setEngineFailed(true); };
    const onContextRestored = () => {
      if (disposed) return;
      setEngineFailed(false);
      drawCurrentScroll();
    };

    void import("scroll-flyover").then(({ mountScrollFlyover }) => {
      if (disposed) return;
      try {
        handle = mountScrollFlyover(host, {
          ...config,
          onReady: ({ webgl }: ReadyInfo) => {
            if (!disposed) {
              // Keep the readable chapter story in place until a real scene or the
              // engine's no-WebGL fallback has produced its first frame.
              handleRef.current = handle ?? null;
              setEngineReady(true);
              setEngineFailed(!webgl);
              announceExperienceReady();
            }
          },
        });
        handleRef.current = handle;
        const canvas = host.querySelector("canvas");
        canvas?.addEventListener("webglcontextlost", onContextLost);
        canvas?.addEventListener("webglcontextrestored", onContextRestored);
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("[BudAI status] 3D scene fallback", error);
        if (!disposed) {
          setEngineFailed(true);
          setEngineReady(true);
          announceExperienceReady();
        }
      }
    }).catch((error: unknown) => {
      if (process.env.NODE_ENV === "development") console.error("[BudAI status] 3D engine failed to load", error);
      if (!disposed) {
        setEngineFailed(true);
        setEngineReady(true);
        announceExperienceReady();
      }
    });

    return () => {
      disposed = true;
      handleRef.current = null;
      const canvas = host.querySelector("canvas");
      canvas?.removeEventListener("webglcontextlost", onContextLost);
      canvas?.removeEventListener("webglcontextrestored", onContextRestored);
      handle?.dispose();
    };
  }, [config]);

  return (
    <div className="status-flight-wrap">
      <div
        id="status-flight"
        ref={containerRef}
        className="status-flight"
        role="region"
        aria-labelledby="journey-heading"
        style={{
          position: "relative",
          "--sf-overlay-bg": "rgba(3, 7, 14, 0.78)",
          "--sf-overlay-blur": "14px",
          "--sf-overlay-radius": "20px",
          "--sf-overlay-padding": "1.2em 1.45em",
          "--sf-text-color": "#f5fbff",
          "--sf-tag-border": "rgba(0, 229, 255, 0.38)",
          "--sf-cta-bg": "#00e5ff",
          "--sf-cta-text-color": "#041015",
          "--sf-cta-radius": "999px",
          "--sf-rail-dot": "rgba(255,255,255,0.32)",
          "--sf-rail-dot-active": "#00e5ff",
          "--sf-focus-ring": "#b8f8ff",
          "--sf-focus-ring-shadow": "rgba(0,0,0,0.96)",
          "--sf-rail-gutter": "78px",
          "--sf-panel-inline": "clamp(1rem, 7vw, 6rem)",
          "--sf-panel-bottom": "max(2.25rem, 8%)",
          "--sf-panel-max-width": "min(38rem, 72vw)",
          "--sf-title-size": "clamp(1.35rem, 3.1vw, 2.25rem)",
          "--sf-body-size": "clamp(0.9rem, 1.25vw, 1.05rem)",
        } as CSSProperties}
      >
        <div className="status-flight-ending" aria-hidden="true" inert>
          <div className="status-flight-ending-card">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-cyan/75">{sv ? "Resan landar" : "Journey resolved"}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {sv ? "Fortsätt till livekontrollerna för att se vad som svarar och vad som bara är konfigurerat." : "Continue to the live checks to see what responds and what is only configured."}
            </p>
            <a href="#live-checks" className="mt-3 inline-flex min-h-10 items-center rounded-full bg-accent-cyan px-4 text-xs font-semibold text-[#041015] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {sv ? "Visa livekontroller" : "View live checks"}
            </a>
          </div>
        </div>
      </div>
      {(!engineReady || engineFailed) && <StatusStaticStory />}
      {engineFailed && (
        <div className="status-flight-error" role="region" aria-label={sv ? "Berättelse utan 3D" : "Text-only journey fallback"}>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent-cyan/70">{sv ? "Vy utan 3D" : "Static view"}</span>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {sv
              ? "Den interaktiva 3D-resan kunde inte starta. Livekontrollerna nedan fungerar ändå."
              : "The interactive 3D journey could not start. The live checks below still work."}
          </p>
          <a href="#live-checks" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm text-white transition hover:border-accent-cyan/50">
            {sv ? "Visa livekontroller" : "View live checks"}
          </a>
        </div>
      )}
    </div>
  );
}
