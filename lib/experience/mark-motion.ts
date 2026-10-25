/** One visibility/preferences observer for every lightweight SVG identity.
 * No animation RAF, canvas, React frame-state or observer per logo.
 */
const marks = new Map<HTMLElement, boolean>();
let observer: IntersectionObserver | null = null;
let media: MediaQueryList | null = null;
let cleanup: (() => void) | null = null;
function update() {
  marks.forEach((visible, element) => {
    element.dataset.markMotion = visible && !document.hidden && !media?.matches ? "running" : "paused";
  });
}
export function observeMark(element: HTMLElement) {
  if (!observer) {
    media = matchMedia("(prefers-reduced-motion: reduce)");
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (marks.has(entry.target as HTMLElement)) marks.set(entry.target as HTMLElement, entry.isIntersecting); });
      update();
    }, { rootMargin:"24px" });
    media.addEventListener("change",update);
    document.addEventListener("visibilitychange",update);
    cleanup=()=>{media?.removeEventListener("change",update);document.removeEventListener("visibilitychange",update);observer?.disconnect();observer=null;media=null;};
  }
  marks.set(element,false); observer.observe(element);
  return () => {
    observer?.unobserve(element);marks.delete(element);
    if (!marks.size) {cleanup?.();cleanup=null;}
  };
}
