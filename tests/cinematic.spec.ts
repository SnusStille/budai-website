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
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/capability-engine-desktop.png" });
  await page.locator(".capability-module").nth(4).hover();
  await expect(canvas).toHaveAttribute("data-capability-focus", "4");
  await move(page, "[data-access-architecture]", -120);
  await expect.poll(async () => Number(await canvas.getAttribute("data-access-morph"))).toBeGreaterThan(.9);
  await page.screenshot({ path: "test-results/access-architecture-desktop.png" });
  const plans = page.locator("[data-plan-comparison]");
  await expect(plans.getByRole("heading", { name: "Basic", exact: true })).toHaveCount(1);
  await expect(plans.getByText("Available now", { exact: true })).toHaveCount(1);
  await expect(plans.getByText("Coming soon", { exact: true })).toHaveCount(2);
  await expect(plans.getByText("Free", { exact: false }).first()).toBeVisible();
});

test("Next Signal has a real approach but the waitlist anchor goes straight to the usable form", async ({ page }) => {
  await prepare(page);
  await page.goto("/#waitlist");
  await move(page, ".next-signal-approach");
  await page.screenshot({ path: "test-results/next-signal-desktop.png" });
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
