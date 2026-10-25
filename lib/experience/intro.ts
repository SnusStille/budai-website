/** The only intro policy. The pre-hydration guard and React owner use the same key. */
export const INTRO_SESSION_KEY = "budai:cinematic-intro:v1";
export const INTRO_READY_MS = 1400;
export const INTRO_MS = 2500;
export const INTRO_REVEAL_MS = 500;

// Run before first paint: return visits/deep links never flash an overlay. If the
// application bundle fails, the independent safety guard still releases the page.
export const introBootstrap = `(()=>{try{const n=navigator;const play=location.pathname==='/'&&!location.hash&&!sessionStorage.getItem('${INTRO_SESSION_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!n.connection?.saveData;document.documentElement.dataset.budaiIntro=play?'preparing':'done';if(play){sessionStorage.setItem('${INTRO_SESSION_KEY}','1');window.__budaiIntroGuard=setTimeout(()=>{document.documentElement.dataset.budaiIntro='done';const m=document.getElementById('main');if(m){m.inert=false;m.removeAttribute('aria-busy')}dispatchEvent(new Event('budai:intro-guard'))},4500)}}catch{document.documentElement.dataset.budaiIntro='done'}})()`;
