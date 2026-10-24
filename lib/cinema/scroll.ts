"use client";

/**
 * STILLEDEV — one scroll signal for the whole film.
 *
 * A single rAF loop reads `scrollY`, eases it, and publishes state to every subscriber
 * (the WebGL world, the HUD, the chapter rail, the progress bar). Nothing else listens to
 * `scroll` and nothing React-re-renders per frame — that is what keeps 60fps while also
 * keeping the browser's native scrolling, keyboard, find-in-page and anchor jumps intact.
 */

import { SCENE_ORDER, cameraAt, clamp01, damp, type SceneId } from "@/lib/cinema/timeline";

export type ScrollState = {
  /** Eased 0..1 across the journey. */
  p: number;
  /** Raw (uneased) 0..1. */
  raw: number;
  /** Camera segment index and local progress. */
  index: number;
  t: number;
  /** Scenes actually present in the DOM, in journey order. */
  ids: SceneId[];
  /** Scene owning the frame. */
  scene: SceneId;
  /** Eased scroll speed, 0..~1 — feeds lens strain and motion streaks. */
  vel: number;
  /** Normalised pixels travelled this frame (signed). */
  delta: number;
  /** True while the visitor is moving. */
  moving: boolean;
  /** Journey anchors resolved from the live DOM. */
  ready: boolean;
};

type Listener = (s: ScrollState) => void;

const listeners = new Set<Listener>();

const state: ScrollState = {
  p: 0,
  raw: 0,
  index: 0,
  t: 0,
  ids: [...SCENE_ORDER],
  scene: "arrival",
  vel: 0,
  delta: 0,
  moving: false,
  ready: false,
};

let anchors: number[] = [];
let raf = 0;
let last = 0;
let lastScroll = 0;
let started = false;
let measureTimer: ReturnType<typeof setTimeout> | null = null;
let ro: ResizeObserver | null = null;

function readAnchors() {
  if (typeof document === "undefined") return;
  const ids: SceneId[] = [];
  const ys: number[] = [];
  for (const id of SCENE_ORDER) {
    const el = document.querySelector<HTMLElement>(`[data-scene="${id}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    ids.push(id);
    ys.push(top + Math.max(r.height * 0.5, window.innerHeight * 0.34));
  }
  if (ids.length < 2) {
    anchors = [];
    state.ready = false;
    return;
  }
  anchors = ys;
  state.ids = ids;
  state.ready = true;
}

/** Debounced re-measure — dynamic panels, font swap and resizes all re-sync it. */
function scheduleMeasure(delay = 140) {
  if (measureTimer) clearTimeout(measureTimer);
  measureTimer = setTimeout(() => {
    measureTimer = null;
    readAnchors();
  }, delay);
}

function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0.0005, (now - last) / 1000)) || 0.016;
  last = now;

  const vh = window.innerHeight;
  const y = window.scrollY;
  const start = anchors[0];
  const end = anchors[anchors.length - 1];
  const ready = anchors.length > 1;
  const centre = y + vh * 0.5;

  const raw = ready ? clamp01((centre - start) / Math.max(1, end - start)) : state.raw;

  let index = 0;
  if (ready) {
    for (let i = 0; i < anchors.length - 1; i++) if (centre >= anchors[i]) index = i;
    index = Math.min(index, anchors.length - 2);
  }
  const t = ready
    ? clamp01((centre - anchors[index]) / Math.max(1, anchors[index + 1] - anchors[index]))
    : 0;

  const deltaPx = y - lastScroll;
  lastScroll = y;

  // easing the *value*, not the scroll: the camera never fights the browser
  state.raw = raw;
  state.p = damp(state.p, raw, 7.4, dt);
  state.index = index;
  state.t = t;
  const key = cameraAt(index, t, state.p, state.ids);
  state.scene = key.scene;
  state.delta = clamp01(Math.abs(deltaPx) / (vh * 0.09)) * Math.sign(deltaPx);
  const speed = clamp01(Math.abs(deltaPx) / (vh * 0.11));
  state.vel = damp(state.vel, speed, speed > state.vel ? 18 : 4.2, dt);
  state.moving = state.vel > 0.02;

  listeners.forEach((l) => l(state));
}

export function subscribeScroll(fn: Listener) {
  listeners.add(fn);
  if (!started && typeof window !== "undefined") {
    started = true;
    readAnchors();
    last = performance.now();
    lastScroll = window.scrollY;
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", () => scheduleMeasure(60), { passive: true });
    window.addEventListener("orientationchange", () => scheduleMeasure(220), { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => scheduleMeasure(200));
      ro.observe(document.documentElement);
    }
    // late-mounting sections (dynamic imports) — re-measure a few times, then stop
    [60, 320, 900, 2000, 4200].forEach((ms) => setTimeout(readAnchors, ms));
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready?.then(() => scheduleMeasure(80)).catch(() => undefined);
  }
  fn(state);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && typeof window !== "undefined") {
      cancelAnimationFrame(raf);
      raf = 0;
      started = false;
      ro?.disconnect();
      ro = null;
    }
  };
}

/**
 * Programmatic scroll used by the nav. Centres the target scene when it is taller than the
 * viewport, otherwise lands it just under the header — eased so a click reads as a camera move.
 */
export function scrollToScene(id: string) {
  if (typeof document === "undefined") return;
  const key = id.replace(/^#/, "");
  const el =
    document.querySelector<HTMLElement>(`[data-scene="${key}"]`) ?? document.getElementById(key);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const offset = r.height > vh ? Math.max(0, r.height * 0.12) : 72;
  const top = Math.max(0, r.top + window.scrollY - offset);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  try {
    history.replaceState(null, "", `#${key}`);
  } catch {
    /* ignore in sandboxed frames */
  }
}

/** Current eased state, for imperative reads (e.g. right before a transition). */
export function getScrollState(): ScrollState {
  return state;
}
