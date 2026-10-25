import { CHAPTERS, journeyAt, type JourneyFrame, type SectionBounds } from "./timeline";

type Continuous = boolean | ((frame: JourneyFrame) => boolean);
type Subscriber = { callback: (frame: JourneyFrame) => void; continuous: Continuous };
const subscribers = new Set<Subscriber>();
let stop: (() => void) | null = null;
let wake: (() => void) | null = null;
let current: JourneyFrame = { y: 0, height: 900, width: 1440, progress: 0, chapter: 0, active: "intelligence", sections: {}, bounds: {}, reduced: false, time: 0 };

export function getJourneyFrame() { return current; }

/**
 * One passive native-scroll listener for the entire cinematic layer + navigation.
 * No virtual scrolling. No React renders per frame. Only the world requests ambient
 * frames (30fps); otherwise the bus sleeps until a scroll/resize/preferences change.
 * Reference-counted setup/teardown is safe under React Strict Mode and navigation.
 */
function start() {
  let raf = 0;
  let last = 0;
  let bounds: SectionBounds[] = [];
  let dirty = true;
  let approachTop = Infinity;
  let disposed = false;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const measure = () => {
    bounds = CHAPTERS.flatMap(({ id }) => {
      const el = document.getElementById(id);
      return el ? [{ id, top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight }] : [];
    });
    const approach = document.querySelector(".next-signal-approach");
    approachTop = approach ? approach.getBoundingClientRect().top + window.scrollY : Infinity;
    dirty = false;
  };
  const frame = (now: number) => {
    raf = 0;
    if (disposed || document.hidden) return;
    if (dirty) measure();
    if (now - last >= 30 || !last) {
      last = now;
      const y = window.scrollY;
      const height = window.innerHeight;
      current = { ...journeyAt(y, height, document.documentElement.scrollHeight, bounds), y, height, width: window.innerWidth, reduced: media.matches, time: now / 1000 };
      current.departure = Math.max(0, Math.min(1, (y - approachTop + height * .85) / (height * .85)));
      if (y + height * .4 >= approachTop && current.active === "about") current.active = "waitlist";
      subscribers.forEach((sub) => sub.callback(current));
    }
    if (!media.matches && Array.from(subscribers).some((s) => typeof s.continuous === "function" ? s.continuous(current) : s.continuous)) schedule();
  };
  const schedule = () => { if (!raf && !disposed) raf = requestAnimationFrame(frame); };
  const onScroll = () => { last = 0; schedule(); };
  wake = onScroll;
  const onResize = () => { dirty = true; onScroll(); };
  const onVisibility = () => {
    cancelAnimationFrame(raf); raf = 0;
    if (!document.hidden) onResize();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  media.addEventListener("change", onResize);
  const resize = new ResizeObserver(onResize);
  resize.observe(document.body);
  schedule();
  return () => {
    disposed = true;
    wake = null;
    cancelAnimationFrame(raf);
    resize.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    media.removeEventListener("change", onResize);
  };
}

export function subscribeJourney(callback: (frame: JourneyFrame) => void, options: { continuous?: Continuous } = {}) {
  const subscriber = { callback, continuous: options.continuous ?? false };
  subscribers.add(subscriber);
  if (!stop && typeof window !== "undefined") stop = start();
  callback(current);
  wake?.();
  return () => {
    subscribers.delete(subscriber);
    if (!subscribers.size) { stop?.(); stop = null; }
  };
}

/** Reconcile the same native snapshot after a non-geometric intro handoff. */
export function refreshJourney() { wake?.(); }
