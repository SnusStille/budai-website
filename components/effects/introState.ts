/**
 * Tiny shared flag: the intro (LoadingScreen) marks itself done, and the hero waits for it.
 * Lets the hero animate in as the intro flies away, instead of hidden underneath it.
 */
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((l) => l());
}

export function isIntroDone() {
  return done;
}

export function subscribeIntro(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
