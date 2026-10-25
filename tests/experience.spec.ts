import { test, expect, type Page } from "@playwright/test";

type Sample = { t: number; word: string | null; loaders: number; brains: number; phase?: string };
declare global {
  interface Window {
    __introSamples: Sample[];
    __layoutShifts: number[];
    __introObserver: MutationObserver;
    __firstBrain: HTMLCanvasElement | null;
    __brainDraws: number;
    __worldDraws: number;
    __gpuQA: { programs: number; shaders: number; freedPrograms: number; freedShaders: number };
  }
}

async function quietChrome(page: Page, skipIntro = true) {
  await page.route("**/va.vercel-scripts.com/**", r => r.fulfill({ contentType: "application/javascript", body: "" }));
  await page.route("**/_vercel/insights/**", r => r.fulfill({ contentType: "application/javascript", body: "" }));
  await page.addInitScript(({ skip }) => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
    if (skip) sessionStorage.setItem("budai:cinematic-intro:v1", "1");
  }, { skip: skipIntro });
}

async function observeLayout(page: Page) {
  await page.addInitScript(() => {
    window.__layoutShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

async function assertSmallLayoutShift(page: Page) {
  const shifts = await page.evaluate(() => window.__layoutShifts);
  await test.info().attach("layout-shift-observations", { body: JSON.stringify(shifts), contentType: "application/json" });
  expect(shifts.reduce((sum, value) => sum + value, 0)).toBeLessThan(.03);
}

async function scrollSection(page: Page, id: string, offset = 0) {
  await page.locator(`#${id}`).evaluate((element, amount) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + amount, behavior: "instant" as ScrollBehavior });
  }, offset);
  await page.waitForTimeout(400);
}

test("fresh visit: readiness-gated actual brain, one surface, no hero renderer and bounded layout shift",async({page})=>{
  await quietChrome(page,false);await observeLayout(page);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const brain=page.locator("[data-brain-canvas]");await expect(brain).toHaveAttribute("data-rendered","true");
  const canvas=await brain.elementHandle();await expect(brain).toHaveAttribute("data-render-driver","shared");
  await expect(page.locator("[data-global-loader] svg,[data-global-loader] [data-budai-mark]")).toHaveCount(0);
  await page.screenshot({path:"test-results/intro-desktop.png"});
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);expect(await canvas!.evaluate(el=>el.isConnected)).toBe(false);
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe("hidden");await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await page.screenshot({path:"test-results/hero-desktop.png"});await assertSmallLayoutShift(page);expect(errors).toEqual([]);
});

test("the story sleeps under settled interaction, resumes the same warm scene, and is disposed before hero",async({page})=>{
  await quietChrome(page);
  await page.addInitScript(()=>{window.__brainDraws=0;const original=WebGL2RenderingContext.prototype.drawArrays;WebGL2RenderingContext.prototype.drawArrays=function(this:WebGL2RenderingContext,...args:Parameters<typeof original>){if((this.canvas as HTMLCanvasElement).hasAttribute("data-brain-canvas"))window.__brainDraws++;return original.apply(this,args);};});
  await page.goto("/#signal");
  const dive=async(p:number)=>{await page.locator("#signal").evaluate((el,p)=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.clientHeight-innerHeight)*p,behavior:"instant" as ScrollBehavior}),p);await page.waitForTimeout(400);};
  await dive(.55);await expect(page.locator("[data-brain-canvas]")).toHaveAttribute("data-rendered","true");
  const canvas=await page.locator("[data-brain-canvas]").elementHandle();
  await dive(1);await expect(page.locator("[data-scene-role=journey]")).toHaveAttribute("data-scene-sleeping","true");
  const stopped=await page.evaluate(()=>window.__brainDraws);await page.waitForTimeout(500);expect(await page.evaluate(()=>window.__brainDraws)).toBe(stopped);
  await dive(.55);await expect.poll(()=>page.evaluate(()=>window.__brainDraws)).toBeGreaterThan(stopped);expect(await canvas!.evaluate(el=>el.isConnected)).toBe(true);
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant" as ScrollBehavior}));await expect(page.locator("[data-brain-canvas]")).toHaveCount(0);
});

test("brain shader failure frees partial GPU allocations and leaves a usable fallback", async ({ page }) => {
  await quietChrome(page, false);
  await observeLayout(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__gpuQA = { programs: 0, shaders: 0, freedPrograms: 0, freedShaders: 0 };
    const p = WebGL2RenderingContext.prototype;
    const createProgram = p.createProgram, createShader = p.createShader, deleteProgram = p.deleteProgram, deleteShader = p.deleteShader, parameter = p.getShaderParameter;
    p.createProgram = function () { window.__gpuQA.programs++; return createProgram.call(this); };
    p.createShader = function (type) { window.__gpuQA.shaders++; return createShader.call(this, type); };
    p.deleteProgram = function (program) { window.__gpuQA.freedPrograms++; return deleteProgram.call(this, program); };
    p.deleteShader = function (shader) { window.__gpuQA.freedShaders++; return deleteShader.call(this, shader); };
    p.getShaderParameter = function (shader, name) { return name === this.COMPILE_STATUS ? false : parameter.call(this, shader, name); };
  });
  await page.goto("/");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("[data-brain-canvas],#intelligence [data-brain-poster],#intelligence [data-budai-mark]")).toHaveCount(0);
  const gpu = await page.evaluate(() => window.__gpuQA);
  expect(gpu.programs).toBeGreaterThan(0);
  expect(gpu.freedPrograms).toBe(gpu.programs);
  expect(gpu.freedShaders).toBe(gpu.shaders);
  expect(errors).toEqual([]);
});

test("keyboard users can reach Skip, leave the intro and focus the real page", async ({ page }) => {
  await quietChrome(page, false);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#main")).toHaveAttribute("inert");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("button", { name: /Skip intro/ });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("link", { name: "Skip to content", exact: true }).focus();
  await expect(page.getByRole("link", { name: "Skip to content", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("a stalled animation clock cannot hold the page or restart a completed intro", async ({ page }) => {
  await quietChrome(page, false);
  await page.addInitScript(() => {
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    const delayed = new Set<number>();
    window.requestAnimationFrame = callback => {
      if (document.documentElement.dataset.budaiIntro !== "playing") return request(callback);
      const id = window.setTimeout(() => { delayed.delete(id); callback(performance.now()); }, 6000);
      delayed.add(id); return id;
    };
    window.cancelAnimationFrame = id => { if (delayed.has(id)) { clearTimeout(id); delayed.delete(id); } else cancel(id); };
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-global-loader]")).toHaveCount(0, { timeout: 7_000 });
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await page.waitForTimeout(3000);
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro", "done");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("budai:cinematic-intro:v1"))).toBe("1");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro", "done");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});

test("a slow brain bundle falls back; unrelated assets never gate the reveal", async ({ page }) => {
  await quietChrome(page, false);
  let delayed = false;
  await page.route("**/_next/static/chunks/*.js", async route => {
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes("data-brain-canvas")) { delayed = true; await new Promise(resolve => setTimeout(resolve, 2500)); }
    await route.fulfill({ response, body });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-global-loader]")).toHaveCount(0, { timeout: 8_000 });
  expect(delayed).toBe(true);
  await expect(page.locator("[data-brain-canvas],#intelligence [data-brain-poster],#intelligence [data-budai-mark]")).toHaveCount(0);
  await expect(page.locator("[data-world-canvas]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Playground", exact: true })).toBeEnabled();
});

test("reload, ordinary anchors, legal navigation, and history do not replay the intro", async ({ page }) => {
  await quietChrome(page);
  await page.goto("/");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await page.locator(".hero-secondary").click();
  await expect(page).toHaveURL(/#waitlist/);
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("#waitlist")).toBeVisible();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});

test("Builder is real 3D; native scroll drives the camera and code, including exact reverse reconstruction", async ({ page }) => {
  await quietChrome(page);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", r => { if (r.url().includes("/api/playground")) requests.push(r.url()); });
  await page.goto("/#about");
  await scrollSection(page, "about", 80);
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state", "ready");
  const canvas = page.locator("[data-world-canvas]");
  await expect(canvas).toHaveCount(1);

  await expect(canvas).toHaveAttribute("data-chapter", "4.000");
  const a = await canvas.getAttribute("data-camera");
  const first = Number(await page.locator(".world-editor-mount [data-code-characters]").getAttribute("data-code-characters"));
  await scrollSection(page, "about", 900);
  await expect.poll(async () => Number(await page.locator(".world-editor-mount [data-code-characters]").getAttribute("data-code-characters"))).toBeGreaterThan(first + 100);
  const b = await canvas.getAttribute("data-camera");
  const second = await page.locator(".world-editor-mount [data-code-characters]").getAttribute("data-code-characters");
  expect(b).not.toBe(a);
  expect(await canvas.getAttribute("data-draw-calls")).not.toBe("0");
  await page.waitForTimeout(750);
  await page.screenshot({ path: "test-results/builder-desktop.png" });
  await scrollSection(page, "about", 80);
  await expect.poll(() => canvas.getAttribute("data-camera")).toBe(a);
  await scrollSection(page, "about", 900);
  await expect.poll(() => canvas.getAttribute("data-camera")).toBe(b);
  await expect(page.locator(".world-editor-mount [data-code-characters]")).toHaveAttribute("data-code-characters", second!);
  await expect(page.getByText("Prepared example · not a live AI response", { exact: true })).toBeVisible();
  const y = await page.evaluate(() => window.scrollY);
  await page.mouse.move(800, 500);
  await page.mouse.wheel(0, -200);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(y);
  expect(requests).toEqual([]); // The illustrative monitor NEVER sends an AI request.
  expect(errors).toEqual([]);
});

test("capabilities, waitlist and roadmap evolve the same background without hiding content", async ({ page }) => {
  await quietChrome(page);
  await page.goto("/#capabilities");
  await scrollSection(page, "capabilities", 0);
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state", "ready");
  const camera = page.locator("[data-world-canvas]");
  const values: (string | null)[] = [];
  for (const id of ["capabilities", "waitlist", "roadmap"]) {
    await scrollSection(page, id, 20);
    await expect(page.locator("html")).toHaveAttribute("data-chapter", id);
    values.push(await camera.getAttribute("data-camera"));
    await expect(page.locator(`#${id}`)).toBeVisible();
    await page.waitForTimeout(750);
    await page.screenshot({ path: `test-results/${id}-desktop.png` });
  }
  expect(new Set(values).size).toBe(3);
  await expect(page.locator(".roadmap-milestone")).toHaveCount(4);
  await expect(page.locator(".roadmap-milestone > ul:visible")).toHaveCount(4);
  await page.getByRole("button", { name: /Next/ }).click();
  await expect(page.locator(".roadmap-milestone").nth(2)).toHaveClass(/is-active/);
});

test("reduced motion: no intro, no WebGL, full static code and accessible forms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await quietChrome(page, false);
  await page.goto("/");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("[data-brain-canvas],#intelligence [data-brain-poster],#intelligence [data-budai-mark]")).toHaveCount(0);
  await scrollSection(page, "signal", 0);
  await expect(page.locator(".brain-journey-fallback [data-brain-poster]")).toBeVisible();
  await expect(page.locator("#signal")).toHaveCSS("height", "1000px");
  await scrollSection(page, "about", 0);
  await expect(page.locator("[data-world-canvas], [data-brain-canvas]")).toHaveCount(0);
  await expect(page.locator(".fallback-central-screen [data-code-characters]")).toHaveAttribute("data-code-characters", String((await import("../lib/experience/code")).CODE_LENGTH));
  await expect(page.locator(".builder-fallback-workspace")).toBeVisible();
  await scrollSection(page, "waitlist");
  await expect(page.locator("#waitlist input[type=email]")).toBeVisible();
  await page.screenshot({ path: "test-results/reduced-motion.png" });
});

test("no WebGL degrades without trapping the page", async ({ page }) => {
  await quietChrome(page, false);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0, { timeout: 9_000 });
  await expect(page.locator("[data-brain-canvas],#intelligence [data-brain-poster],#intelligence [data-budai-mark]")).toHaveCount(0);
  await scrollSection(page, "about", 500);
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state", "fallback");
  await expect(page.locator(".builder-fallback-workspace")).toBeVisible();
  await scrollSection(page, "waitlist");
  await expect(page.getByRole("button", { name: "Join the waitlist", exact: true })).toBeEnabled();
});

test("context loss and changing reduced motion clean up the shared world", async ({ page }) => {
  await quietChrome(page);
  await page.goto("/#about");
  await scrollSection(page, "about", 500);
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
  await page.locator("[data-world-canvas]").evaluate((canvas) => (canvas as HTMLCanvasElement).getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext());
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state", "fallback");
  await expect(page.locator("[data-world-canvas]")).toHaveCount(0);
  await expect(page.locator(".builder-fallback-workspace")).toBeVisible();
  await page.reload();
  await scrollSection(page, "about", 500);
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-world-canvas], [data-brain-canvas]")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state", "ready");
  await page.evaluate(() => scrollTo({top:0,behavior:"instant" as ScrollBehavior}));
  await expect(page.locator("[data-brain-canvas]")).toHaveCount(0);
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);

});

test("partial world construction failure releases the canvas and DOM renderer", async ({ page }) => {
  await quietChrome(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "2d") return null; // Room dashboard fails AFTER the WebGL renderer exists.
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto("/#about");
  await scrollSection(page, "about", 400);
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state", "fallback");
  await expect(page.locator("[data-world-canvas], .world-dom-layer")).toHaveCount(0);
  await expect(page.locator(".builder-fallback-workspace")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 740 }]) {
  test(`mobile ${viewport.width}px: intro, normal scrolling, 3D Builder, menu and form fit`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await quietChrome(page, false);
    await observeLayout(page);
    await page.goto("/");
    await expect(page.locator("[data-global-loader]")).toHaveCount(0, { timeout: 9_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/hero-mobile-${viewport.width}.png` });
    await assertSmallLayoutShift(page);
    await scrollSection(page, "about", 450);
    await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
    const monitor = await page.locator(".world-editor-mount").boundingBox();
    expect(monitor!.x).toBeGreaterThan(15);
    expect(monitor!.x + monitor!.width).toBeLessThan(viewport.width - 10);
    expect(monitor!.y).toBeGreaterThan((await page.locator(".builder-heading").boundingBox())!.y + (await page.locator(".builder-heading").boundingBox())!.height);
    await page.screenshot({ path: `test-results/builder-mobile-${viewport.width}.png` });
    await scrollSection(page, "waitlist");
    const email = page.locator("#waitlist input[type=email]");
    await expect(email).toBeVisible();
    expect(Number(await email.evaluate(el => parseFloat(getComputedStyle(el).fontSize)))).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/waitlist-mobile-${viewport.width}.png` });
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await expect(page.getByRole("button", { name: "Close menu", exact: true })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu", exact: true })).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
}

test("resizing preserves one world and realigns the editor to its physical monitor", async ({ page }) => {
  await quietChrome(page);
  await page.goto("/#about");
  await scrollSection(page, "about", 500);
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
  await expect(page.locator(".world-editor-mount")).toHaveAttribute("data-editor-layout", "desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await scrollSection(page, "about", 500);
  await expect(page.locator(".world-editor-mount")).toHaveAttribute("data-editor-layout", "mobile");
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".world-editor-mount")).toHaveAttribute("data-editor-layout", "desktop");
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
});

test("no JavaScript still exposes product content and navigation, never a blocking loader", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-global-loader]")).not.toBeVisible();
  await expect(page.locator("#waitlist input[type=email]")).toBeVisible();
  await expect(page.locator(".roadmap-milestone")).toHaveCount(4);
  await context.close();
});

test("an already-loaded world actually stops GPU draws on reverse-to-landing and resumes the SAME scene", async ({ page }) => {
  await quietChrome(page);
  await page.addInitScript(() => {
    window.__worldDraws = 0;
    const arrays=WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays=function(this:WebGL2RenderingContext,...args:Parameters<typeof arrays>){if((this.canvas as HTMLCanvasElement).hasAttribute("data-world-canvas"))window.__worldDraws++;return arrays.apply(this,args);};
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (this:WebGL2RenderingContext,...args:Parameters<typeof original>) {
      if ((this.canvas as HTMLCanvasElement).hasAttribute("data-world-canvas")) window.__worldDraws++;
      return original.apply(this,args);
    };
  });
  await page.goto("/#capabilities");
  await expect.poll(() => page.evaluate(()=>window.__worldDraws)).toBeGreaterThan(10);
  const canvas = await page.locator("[data-world-canvas]").elementHandle();
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant" as ScrollBehavior}));
  await expect(page.locator(".universe-world")).toHaveCSS("opacity","0");
  const stopped = await page.evaluate(()=>window.__worldDraws);
  await page.waitForTimeout(600);
  expect(await page.evaluate(()=>window.__worldDraws)).toBe(stopped);
  await scrollSection(page,"capabilities",0);
  await expect.poll(()=>page.evaluate(()=>window.__worldDraws)).toBeGreaterThan(stopped);
  expect(await canvas!.evaluate(el=>el.isConnected)).toBe(true);
  await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
});

test("save-data mode keeps static anatomy and all actions without downloading a heavy world", async ({ page }) => {
  await quietChrome(page,false);
  const worlds:string[] = [];
  page.on("request",r=>{if (/world\.|three\./.test(r.url())) worlds.push(r.url());});
  await page.addInitScript(()=>Object.defineProperty(navigator,"connection",{configurable:true,value:{saveData:true}}));
  await page.goto("/");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("[data-brain-canvas],#intelligence [data-brain-poster],#intelligence [data-budai-mark]")).toHaveCount(0);
  await scrollSection(page,"capabilities",0);
  await expect(page.locator(".universe-world")).toHaveAttribute("data-world-state","fallback");
  await expect(page.locator("[data-brain-canvas],[data-world-canvas]")).toHaveCount(0);
  await expect(page.locator(".capability-module")).toHaveCount(6);
  await scrollSection(page,"waitlist",0);
  await expect(page.getByRole("textbox",{name:"Email",exact:true})).toBeVisible();
  expect(worlds).toEqual([]);
});
