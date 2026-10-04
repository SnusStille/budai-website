/** sessionStorage key: the intro has been seen in this browser session. */
export const INTRO_SEEN_KEY = "budai-intro-seen";

/**
 * Runs before the first paint. If this is a fresh session on the home route,
 * it marks the document so the intro overlay is visible immediately — no flash
 * of content behind it — with a failsafe that removes the mark if the app never
 * hydrates (so nobody can ever get stuck on a loading screen).
 */
const INTRO_SCRIPT = `(function(){try{
var key='${INTRO_SEEN_KEY}';
if(document.documentElement.hasAttribute('data-intro-opt-out'))return;
var seen=sessionStorage.getItem(key);
var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(seen||reduced){sessionStorage.setItem(key,'1');return;}
document.documentElement.setAttribute('data-intro','on');
setTimeout(function(){document.documentElement.removeAttribute('data-intro');},4500);
}catch(e){}})();`;

export default INTRO_SCRIPT;
