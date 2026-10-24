"use client";

/**
 * Tiny pub/sub so DOM scenes can talk to the WebGL world without threading React props
 * (and, more importantly, without re-rendering React on every frame).
 */
export type CinemaEvent =
  | { type: "hover"; value: number }
  | { type: "intro"; value: number }
  | { type: "paused"; value: boolean };

const EVENT = "st:cinema";
const last: Partial<Record<CinemaEvent["type"], number | boolean>> = {};

export function emitCinema(e: CinemaEvent) {
  if (typeof window === "undefined") return;
  last[e.type] = e.value;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: e }));
}

/** The most recent value for a channel — a late-mounting world can catch up on boot. */
export function lastCinema(type: CinemaEvent["type"]): number | undefined {
  const v = last[type];
  return typeof v === "number" ? v : undefined;
}

export function onCinema(fn: (e: CinemaEvent) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (ev: Event) => {
    const detail = (ev as CustomEvent<CinemaEvent>).detail;
    if (detail) fn(detail);
  };
  window.addEventListener(EVENT, handler as EventListener);
  return () => window.removeEventListener(EVENT, handler as EventListener);
}

/** Hover a project display → the matching mount in the 3D world lights up. */
export const hoverMount = (index: number) => emitCinema({ type: "hover", value: index });

/** Length of the film leader in ms — the DOM and the WebGL world both sync to this. */
export const LEADER_MS = 2300;
