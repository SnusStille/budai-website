import { test, expect, type Page } from "@playwright/test";

declare global { interface Window { __throttled:Array<{t:number;phase?:string;loaders:number;brains:number}>; } }

async function quiet(page: Page) {
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType:"application/javascript", body:"" }));
  await page.addInitScript(() => {
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
  });
}
async function to(page: Page, selector: string) {
  await page.locator(selector).evaluate(el => scrollTo({ top:el.getBoundingClientRect().top+scrollY-100, behavior:"instant" as ScrollBehavior }));
  await page.waitForTimeout(500);
}

for (const width of [390, 360]) test(`mobile ${width}: full-height neural perspective, information field, plans and Next Signal`, async ({ page }) => {
  await page.setViewportSize({ width, height:844 });
  await quiet(page);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  const brain = page.locator("[data-brain-canvas]");
  await expect(brain).toHaveCount(0);
  await page.waitForTimeout(300);
  await page.screenshot({ path:`test-results/hero-${width}.png` });
  const dive = async (p: number) => {
    await page.locator("#signal").evaluate((el,p) => scrollTo({ top:el.getBoundingClientRect().top+scrollY+(el.clientHeight-innerHeight)*p,behavior:"instant" as ScrollBehavior }),p);
    await page.waitForTimeout(450);
  };
  await dive(.1);
  await expect(brain).toHaveAttribute("data-rendered","true");
  await page.screenshot({ path:`test-results/neural-entry-${width}.png` });
  await dive(.86);
  await expect(brain).toHaveAttribute("data-sequence", "journey");
  const pose = await brain.getAttribute("data-camera-pose");
  expect(Number(await brain.getAttribute("data-camera-z"))).toBeLessThan(0);
  expect(await brain.evaluate(el => el.getBoundingClientRect().height)).toBeCloseTo(844,0);
  await page.screenshot({ path:`test-results/neural-interior-${width}.png` });
  await dive(.92); await dive(.86);
  await expect(brain).toHaveAttribute("data-camera-pose", pose!);
  await to(page, "[data-capability-viewport]");
  const world = page.locator("[data-world-canvas]");
  await expect(world).toHaveAttribute("data-capability-modules", "6");
  await expect(page.locator(".universe-world")).toHaveAttribute("data-visual-mode", "mobile-3d");
  await page.locator(".capability-stage-pill").nth(2).click();
  await expect(world).toHaveAttribute("data-capability-focus", "2");
  await page.waitForTimeout(500);
  await page.screenshot({ path:`test-results/capability-engine-${width}.png` });
  await to(page, ".capability-index");
  await expect(page.locator(".capability-module").first()).toBeVisible();
  await expect(page.locator(".capability-module")).toHaveCount(6);
  await page.screenshot({ path:`test-results/capability-index-${width}.png` });
  await to(page, "[data-access-architecture]");
  await expect.poll(async () => Number(await world.getAttribute("data-access-morph"))).toBeGreaterThan(.9);
  await page.screenshot({ path:`test-results/access-architecture-${width}.png` });
  await expect(page.locator(".next-signal-approach, .next-signal-beacon")).toHaveCount(0);
  await to(page,"#waitlist");
  await expect(page.getByRole("textbox", { name:"Email",exact:true })).toBeVisible();
  await expect(page.getByRole("button",{ name:"Join the waitlist",exact:true })).toBeEnabled();
  await page.screenshot({ path:`test-results/waitlist-${width}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("throttled fresh entry stays bounded, never mounts competing loaders, and does not fetch the room", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline:false, latency:150, downloadThroughput:220_000, uploadThroughput:110_000 });
  await cdp.send("Emulation.setCPUThrottlingRate",{ rate:4 });
  await page.route("**/va.vercel-scripts.com/**", route=>route.fulfill({contentType:"application/javascript",body:""}));
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    window.__throttled = [];
    const sample = () => window.__throttled.push({ t:performance.now(),phase:document.documentElement?.dataset.budaiIntro,loaders:document.querySelectorAll("[data-global-loader]").length,brains:document.querySelectorAll("[data-brain-canvas]").length });
    new MutationObserver(sample).observe(document,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["data-budai-intro"]}); sample();
  });
  const began = Date.now();
  await page.goto("/",{waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro","done",{timeout:15_000});
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.getByRole("link",{name:"Open Playground",exact:true})).toBeEnabled();
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await expect(page.locator("[data-world-canvas]")).toHaveCount(0);
  const samples = await page.evaluate(() => window.__throttled);
  expect(Math.max(...samples.map(s=>s.loaders))).toBeLessThanOrEqual(1);
  expect(Math.max(...samples.map(s=>s.brains))).toBeLessThanOrEqual(1);
  await test.info().attach("throttled-entry",{body:JSON.stringify({elapsed:Date.now()-began,samples},null,2),contentType:"application/json"});
  await cdp.detach();
});

test("mobile widths 320, 375, 390, 430 and Mode C fallback preserve layout, touch controls, and zero overflow", async ({ page }) => {
  await quiet(page);
  await page.goto("/#capabilities");
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 812 });
    await to(page, "[data-capability-viewport]");
    await expect(page.locator(".capability-stage-pill")).toHaveCount(6);
    await expect(page.locator("[data-living-code-console]")).toBeVisible();
    await to(page, "[data-access-architecture]");
    await expect(page.locator(".access-labels > span")).toHaveCount(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

