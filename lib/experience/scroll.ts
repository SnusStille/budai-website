import { CHAPTERS, closingProgressAt, journeyAt, type JourneyFrame, type SectionBounds } from "./timeline";

type Continuous = boolean | ((frame: JourneyFrame) => boolean);
type Subscriber = { callback: (frame: JourneyFrame) => void; continuous: Continuous;phase:"update"|"render" };
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
  let approachTop = Infinity,footerTop=Infinity;
  let disposed = false;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const measure = () => {
    bounds = CHAPTERS.flatMap(({ id }) => {
      const el = document.getElementById(id);
      return el ? [{ id, top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight }] : [];
    });
    const approach = document.querySelector(".next-signal-approach");
    approachTop = approach ? approach.getBoundingClientRect().top + window.scrollY : Infinity;
    const footer=document.getElementById("continuation");
    footerTop=footer?footer.getBoundingClientRect().top+scrollY:Infinity;
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
      current.closing=closingProgressAt(y,footerTop,height,document.documentElement.scrollHeight-height);
      current.departure = Math.max(0, Math.min(1, (y - approachTop + height * .85) / (height * .85)));
      if (y + height * .4 >= approachTop && current.active === "about") current.active = "waitlist";
      // All DOM transforms settle before either renderer reads their bounds.
      subscribers.forEach(sub=>{if(sub.phase==="update")sub.callback(current);});
      subscribers.forEach(sub=>{if(sub.phase==="render")sub.callback(current);});
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
  // Never synchronously publish a previous route's cached bounds on re-entry.
  measure();
  current={...journeyAt(window.scrollY,innerHeight,document.documentElement.scrollHeight,bounds),y:scrollY,height:innerHeight,width:innerWidth,reduced:media.matches,time:performance.now()/1000,closing:closingProgressAt(scrollY,footerTop,innerHeight,document.documentElement.scrollHeight-innerHeight)};
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

export function subscribeJourney(callback: (frame: JourneyFrame) => void, options: { continuous?: Continuous;phase?:"update"|"render" } = {}) {
  const subscriber:Subscriber = { callback, continuous: options.continuous ?? false,phase:options.phase??"update" };
  subscribers.add(subscriber);
  if (!stop && typeof window !== "undefined") stop = start();
  if(current.y===scrollY&&current.width===innerWidth&&current.height===innerHeight)callback(current);
  wake?.();
  return () => {
    subscribers.delete(subscriber);
    if (!subscribers.size) { stop?.(); stop = null; }
  };
}

/** Reconcile the same native snapshot after a non-geometric intro handoff. */
export function refreshJourney() { wake?.(); }
