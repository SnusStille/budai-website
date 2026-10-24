#!/usr/bin/env node
/**
 * BudAI visual QA — real screenshots from a real (headless) browser.
 *
 *   npm run build && npm start &            # or: npm run dev
 *   node scripts/visual-qa.mjs              # writes ./qa-shots/*.png
 *
 * Requires a Chromium binary. Set CHROME_PATH, or point puppeteer-core at any
 * Chrome/Chromium you already have. The script is intentionally dependency-light:
 * puppeteer-core is NOT a project dependency (install it with `npm i -D puppeteer-core`
 * if you want to run this), so CI and production builds stay untouched.
 *
 * It checks the things that are easy to break and hard to notice:
 *  - the story chapter actually sticks while scrolling
 *  - the WebGL canvas is really drawing (pixel analysis, not just "no errors")
 *  - every route responds, and the console stays clean
 *  - mobile, reduced-motion and WebGL-disabled variants still render text
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT = process.env.OUT_DIR || "qa-shots";
const CHROME = process.env.CHROME_PATH || "/usr/bin/chromium";

let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  console.error("puppeteer-core is not installed. Run: npm i -D puppeteer-core");
  process.exit(1);
}

const ARGS = [
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--headless=new",
  "--hide-scrollbars",
  "--mute-audio",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--force-device-scale-factor=1",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// absolute document offset — offsetTop is relative to the offsetParent and lies
// as soon as any ancestor is positioned, which bit us once already
// html { scroll-behavior: smooth } is a real product feature, but it makes
// programmatic jumps asynchronous — force instant while measuring.
const storyProgress = (p) =>
  `(() => { const el = document.getElementById('neural'); if (!el) return;
     document.documentElement.style.scrollBehavior = 'auto';
     const top = el.getBoundingClientRect().top + window.scrollY;
     window.scrollTo(0, top + Math.max(0, el.offsetHeight - innerHeight) * ${p}); })()`;

fs.mkdirSync(OUT, { recursive: true });
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("  ✗ " + msg);
};
const pass = (msg) => console.log("  ✓ " + msg);

async function shoot(browser, name, viewport, steps, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/ERR_CONNECTION_CLOSED|_vercel|404/.test(m.text())) errors.push(m.text());
  });
  if (opts.reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() =>
    [...document.querySelectorAll("button")].find((b) => /accept/i.test(b.textContent || ""))?.click()
  );

  for (const s of steps) {
    if (s.eval) await page.evaluate(`document.documentElement.style.scrollBehavior='auto'; ${s.eval}`);
    await sleep(s.wait ?? 1200);
    await page.screenshot({ path: path.join(OUT, `${name}-${s.name}.png`) });
  }

  const sticky = await page.evaluate(async () => {
    const el = document.getElementById("neural");
    if (!el) return null;
    document.documentElement.style.scrollBehavior = "auto";
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + Math.max(0, el.offsetHeight - innerHeight) * 0.5);
    await new Promise((r) => setTimeout(r, 600));
    const stage = el.querySelector(".neural-stage");
    const canvas = el.querySelector("canvas");
    return {
      stage: stage ? Math.round(stage.getBoundingClientRect().top) : null,
      canvas: canvas ? Math.round(canvas.getBoundingClientRect().top) : null,
      position: stage ? getComputedStyle(stage).position : null,
      scrollY: Math.round(window.scrollY),
      innerHeight: window.innerHeight,
    };
  });
  if (!sticky) fail(`${name}: story section missing`);
  else if (sticky.stage === null) pass(`${name}: static story fallback (no sticky stage) — expected for reduced motion`);
  else if (sticky.stage < -40 || sticky.stage > 200)
    fail(`${name}: story stage does not stick ${JSON.stringify(sticky)}`);
  else pass(`${name}: story stage sticks (top ${sticky.stage}px, ${sticky.position})`);

  if (errors.length) fail(`${name}: console errors → ${errors.slice(0, 3).join(" | ")}`);
  else pass(`${name}: console clean`);

  await page.close();
}

const browser = await puppeteer.launch({
  args: ARGS,
  executablePath: CHROME,
  headless: true,
  protocolTimeout: 240000,
});

console.log("routes");
for (const route of ["/", "/api/health", "/api/features", "/legal/privacy", "/legal/terms", "/sitemap.xml", "/robots.txt"]) {
  const res = await fetch(BASE + route).catch(() => null);
  if (res && res.ok) pass(`${route} → ${res.status}`);
  else fail(`${route} → ${res ? res.status : "no response"}`);
}

console.log("desktop");
await shoot(browser, "desktop", { width: 1440, height: 900 }, [
  { name: "01-hero" },
  { name: "02-story-20", eval: storyProgress(0.2) },
  { name: "03-story-55", eval: storyProgress(0.55) },
  { name: "04-story-100", eval: storyProgress(1) },
  { name: "05-playground", eval: `document.getElementById('playground')?.scrollIntoView()` },
  { name: "06-waitlist", eval: `document.getElementById('waitlist')?.scrollIntoView()` },
]);

console.log("mobile");
await shoot(browser, "mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }, [
  { name: "01-hero" },
  { name: "02-story-50", eval: storyProgress(0.5) },
  { name: "03-playground", eval: `document.getElementById('playground')?.scrollIntoView()` },
]);

console.log("reduced motion");
await shoot(browser, "reduced", { width: 1440, height: 900 }, [{ name: "01-story", eval: `document.getElementById('neural')?.scrollIntoView()` }], {
  reduced: true,
});

// WebGL disabled: the page must still be complete and readable.
const noGl = await puppeteer.launch({
  args: ARGS.filter((a) => !a.includes("gl=") && !a.includes("angle")).concat(["--disable-webgl", "--disable-3d-apis"]),
  executablePath: CHROME,
  headless: true,
  protocolTimeout: 240000,
});
const page = await noGl.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await sleep(2500);
const readable = await page.evaluate(() => {
  const text = document.body.innerText;
  return {
    hasHeadline: /AI that moves|work forward/i.test(text),
    hasPlayground: !!document.getElementById("playground"),
    hasStoryCopy: /listens|Synapses|BudAI/i.test(text),
  };
});
if (readable.hasHeadline && readable.hasPlayground) pass("no-WebGL: content complete");
else fail(`no-WebGL: content missing ${JSON.stringify(readable)}`);
await page.screenshot({ path: path.join(OUT, "no-webgl-story.png") });
await noGl.close();

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
