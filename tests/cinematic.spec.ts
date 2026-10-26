import { test, expect, type Page } from "@playwright/test";

async function prepare(page: Page, intro = false) {
  await page.route("**/va.vercel-scripts.com/**", r => r.fulfill({ contentType: "application/javascript", body: "" }));
  await page.addInitScript(({ intro }) => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
    if (!intro) sessionStorage.setItem("budai:cinematic-intro:v1", "1");
  }, { intro });
}
async function move(page: Page, selector: string, amount = 0) {
  await page.locator(selector).evaluate((el, offset) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: "instant" as ScrollBehavior }), amount);
  await page.waitForTimeout(450);
}
async function dive(page: Page, p: number) {
  await page.locator("#signal").evaluate((el, progress) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.clientHeight - innerHeight) * progress, behavior: "instant" as ScrollBehavior }), p);
  await page.waitForTimeout(450);
}

test("restored neural journey is after landing and before the REAL Playground; one reversible 3D camera", async ({ page }) => {
  await prepare(page);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/#signal");
  const brain = page.locator("[data-brain-canvas]");
  await expect(brain).toHaveAttribute("data-rendered", "true");
  await expect(brain).toHaveCount(1);
  expect(await page.evaluate(() => {
    const hero = document.querySelector("#intelligence")!, signal = document.querySelector("#signal")!, pg = document.querySelector("#playground")!;
    return !!(hero.compareDocumentPosition(signal) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(signal.compareDocumentPosition(pg) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
  await expect(page.locator("#signal [data-global-loader], #signal input, #signal textarea")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Ask BudAI", exact: true })).toHaveCount(0);
  await dive(page, .12);
  await expect(brain).toHaveAttribute("data-sequence", "journey");
  const a = await brain.getAttribute("data-camera-pose");
  await page.screenshot({ path: "test-results/neural-entry-desktop.png" });
  await dive(page, .55);
  const b = await brain.getAttribute("data-camera-pose");
  expect(b).not.toBe(a);
  await page.screenshot({ path: "test-results/neural-interior-desktop.png" });
  await dive(page, .83);
  expect(Number(await brain.getAttribute("data-camera-z"))).toBeLessThan(-1.5);
  await page.screenshot({ path: "test-results/neural-exit-desktop.png" });
  await dive(page, .12);
  await expect.poll(() => brain.getAttribute("data-camera-pose")).toBe(a);
  await dive(page, .55);
  await expect.poll(() => brain.getAttribute("data-camera-pose")).toBe(b);
  await move(page, "#playground");
  await dive(page, 1);
  await expect(page.locator("#playground textarea")).toBeVisible();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  expect(await page.locator("[data-intelligence-stage]").evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.01);
  // Real wheel input can skip the story in either direction, without a virtual
  // scroller, hidden input trap, extra intro or competing brain renderer.
  await page.mouse.wheel(0, 50_000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(5000);
  await page.mouse.wheel(0, -50_000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("[data-brain-canvas]")).toHaveAttribute("data-sequence", "hero");
  expect(errors).toEqual([]);
});

test("one sparse information register organises six capabilities and three accurate access levels", async ({ page }) => {
  await prepare(page);
  await page.goto("/#capabilities");
  await move(page, "[data-capability-system]", 180);
  const canvas = page.locator("[data-world-canvas]");
  await expect(canvas).toHaveAttribute("data-capability-architecture", "information-field");
  await expect(canvas).toHaveAttribute("data-capability-modules", "6");
  await expect(canvas).toHaveAttribute("data-capability-paths","0");
  await expect(canvas).toHaveAttribute("data-information-records","6");
  expect(Number(await canvas.getAttribute("data-draw-calls"))).toBeGreaterThan(0);
  await expect(page.locator(".capability-network")).toHaveCount(0);
  await expect(page.locator(".capability-module")).toHaveCount(6);
  await expect(page.locator("[data-living-code-console]")).toBeVisible();
  const studioScreen = page.locator(".world-capability-mount [data-capability-studio-screen]");
  await expect(studioScreen).toHaveAttribute("data-studio-mode", "capability");
  await page.waitForTimeout(600);
  const initialChamberProgress = Number(await canvas.getAttribute("data-chamber-progress"));
  await page.screenshot({ path: "test-results/capability-engine-desktop.png" });
  await move(page, "[data-capability-system]", 680);
  await expect.poll(async () => Number(await canvas.getAttribute("data-chamber-progress"))).toBeGreaterThan(initialChamberProgress + 0.15);
  await page.screenshot({ path: "test-results/capability-engine-midscroll-desktop.png" });
  await move(page, "[data-capability-system]", 180);
  await expect.poll(async () => Number(await canvas.getAttribute("data-chamber-progress"))).toBeCloseTo(initialChamberProgress, 1);
  await page.locator(".capability-module").nth(4).hover();
  await expect(canvas).toHaveAttribute("data-capability-focus", "4");
  await move(page, "[data-access-architecture]", -120);
  await expect.poll(async () => Number(await canvas.getAttribute("data-access-morph"))).toBeGreaterThan(.9);
  await expect.poll(async () => Number(await canvas.getAttribute("data-assembly-progress"))).toBeGreaterThan(0.2);
  await expect(studioScreen).toHaveAttribute("data-studio-mode", "pipeline");
  await page.screenshot({ path: "test-results/access-architecture-desktop.png" });
  const plans = page.locator("[data-plan-comparison]");
  await expect(plans.getByRole("heading", { name: "Basic", exact: true })).toHaveCount(1);
  await expect(plans.getByText("Available now", { exact: true })).toHaveCount(1);
  await expect(plans.getByText("Coming soon", { exact: true })).toHaveCount(2);
  await expect(plans.getByText("Free", { exact: false }).first()).toBeVisible();
});

test("scrolling past Playground into Capabilities is smooth, pre-warmed, and free of back-and-forth jumps", async ({ page }) => {
  await prepare(page);
  await page.goto("/");
  await move(page, "#playground", 60);
  // WorldStage should pre-warm as soon as the user is in the Playground
  await expect(page.locator("html")).toHaveAttribute("data-world-state", "ready", { timeout: 15000 });
  const startY = await page.evaluate(() => window.scrollY);
  const topsDown: number[] = [];
  const chaptersDown: number[] = [];
  for (let step = 1; step <= 14; step++) {
    await page.evaluate(y => window.scrollTo(0, y), startY + step * 160);
    await page.waitForTimeout(30);
    const rectTop = await page.locator("[data-capability-viewport]").evaluate(el => el.getBoundingClientRect().top);
    const ch = await page.evaluate(() => Number(document.documentElement.style.getPropertyValue("--journey-phase")));
    topsDown.push(rectTop);
    chaptersDown.push(ch);
  }
  // Every downward scroll step must move the viewport up monotonically (or hold when sticky) and advance chapter monotonically without jumping backward
  for (let i = 1; i < topsDown.length; i++) {
    expect(topsDown[i]).toBeLessThanOrEqual(topsDown[i - 1] + 0.5);
    expect(chaptersDown[i]).toBeGreaterThanOrEqual(chaptersDown[i - 1] - 0.001);
  }
  await page.screenshot({ path: "test-results/post-playground-scroll-transition.png" });
});

test("05 / THE NEXT SIGNAL standalone section remains removed while early-access waitlist form and 05 Roadmap work cleanly", async ({ page }) => {
  await prepare(page);
  await page.goto("/#waitlist");
  await expect(page.locator(".next-signal-approach, .next-signal-beacon")).toHaveCount(0);
  await expect(page.getByText("05 / THE NEXT SIGNAL", { exact: false })).toHaveCount(0);
  await expect(page.locator("#roadmap")).toContainText("05 / THE SYSTEM EVOLVES");
  await move(page, "#waitlist");
  const email = page.locator("#waitlist input[type=email]");
  await expect(email).toBeVisible();
  const box = await email.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(900);
  await expect(page.locator("#waitlist .bud-spin-conic")).toHaveCount(0);
  await email.focus();
  await expect(email).toBeFocused();
  await page.screenshot({ path: "test-results/next-signal-form-desktop.png" });
});
