/** The only intro policy. The pre-hydration guard and React owner use the same key. */
export const INTRO_SESSION_KEY = "budai:cinematic-intro:v1";
export const INTRO_MS = 2800;
export const INTRO_REVEAL_MS = 650;

// Run before first paint: return visits/deep links never flash an overlay. If the
// application bundle fails, the independent safety guard still releases the page.
export const introBootstrap = `(()=>{try{const n=navigator;const play=location.pathname==='/'&&!location.hash&&!sessionStorage.getItem('${INTRO_SESSION_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!n.connection?.saveData;document.documentElement.dataset.budaiIntro=play?'playing':'done';if(play)sessionStorage.setItem('${INTRO_SESSION_KEY}','1');if(play)window.__budaiIntroGuard=setTimeout(()=>{document.documentElement.dataset.budaiIntro='done'},4500)}catch{document.documentElement.dataset.budaiIntro='done'}})()`;

export function introLetters(elapsed: number) {
  return Math.max(0, Math.min(5, Math.floor((elapsed - 850) / 210) + 1));
}

/** Never jump over a letter when a shader/JIT/slow frame crosses a clock boundary. */
export function nextIntroLetter(previous: number, elapsed: number, sinceLast: number) {
  const desired = introLetters(elapsed);
  return desired > previous && sinceLast >= 160 ? Math.min(previous + 1, desired) : previous;
}
