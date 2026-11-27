import { test, expect, type Page } from "@playwright/test";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
async function quiet(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
  });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
}

test("the companion stays visibly docked to the screen edge even after its peek animation is used", async ({ page }) => {
  await quiet(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => sessionStorage.setItem("budai:companion:appearances:v2", "2"));
  await page.goto("/");
  const buddy = page.locator("[data-builder-companion]");
  await expect(buddy).toBeVisible({ timeout: 8000 });
  const launcher = buddy.getByRole("button", { name: "Open BudAI menu" });
  await expect(launcher).toBeVisible();
  await expect.poll(() => buddy.evaluate(node => Number.parseFloat(getComputedStyle(node).opacity))).toBeGreaterThan(.9);
  const visibleSliver = await launcher.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return rect.right > innerWidth && rect.left < innerWidth && innerWidth - rect.left > 50;
  });
  expect(visibleSliver).toBe(true);
});

test("the companion stays unobtrusive, opens a three-link menu, and stops auto-peeking after interaction", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/");
  const buddy = page.locator("[data-builder-companion]");
  await expect(buddy).toHaveCount(0);
  await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator("canvas")).toHaveCount(0);
  const launcher = buddy.getByRole("button", { name: "Open BudAI menu" });
  await launcher.click();
  const menu = buddy.getByRole("dialog", { name: "WHERE TO NEXT?" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link")).toHaveCount(3);
  await expect(menu.getByRole("link").first()).toBeFocused();
  await expect(menu.getByRole("link", { name: /Try the Playground/ })).toHaveAttribute("href", "#playground");
  await expect(menu.getByRole("link", { name: /Explore BudAI/ })).toHaveAttribute("href", "#capabilities");
  await expect(menu.getByRole("link", { name: /Contact Stilledev/ })).toHaveAttribute("href", "/contact");
  await expect(buddy).toHaveClass(/has-interacted/);
  await buddy.getByRole("button", { name: "Hide robot" }).click();
  await expect(buddy).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("budai:companion:hidden:v1"))).toBe("1");
  await page.locator("#continuation").getByRole("button", { name: "Bring back the BudAI companion" }).click();
  await expect(buddy).toBeVisible();
});

test("the full-motion companion makes one brief edge peek and becomes manual-only after contact", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/");
  const buddy = page.locator("[data-builder-companion]");
  await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy).toHaveClass(/is-peeking/, { timeout: 24000 });
  await page.waitForFunction(() => {
    const node = document.querySelector<HTMLElement>(".builder-companion-quiet");
    return !!node && Number.parseFloat(getComputedStyle(node).opacity) > 0.7;
  });
  await expect(buddy.getByRole("button", { name: "Open BudAI menu" })).toBeVisible();
  await buddy.getByRole("button", { name: "Open BudAI menu" }).click();
  await expect(buddy.getByRole("dialog", { name: "WHERE TO NEXT?" })).toBeVisible();
  await expect(buddy).toHaveClass(/has-interacted/);
});

test("the Swedish companion is localized, has a finite menu and remains static under reduced motion", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/sv");
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot-fallback")).toBeVisible();
  await expect(buddy.locator("canvas")).toHaveCount(0);
  await buddy.getByRole("button", { name: "Öppna BudAI-menyn" }).click();
  const menu = buddy.getByRole("dialog", { name: "Välj nästa steg" });
  await expect(menu.getByRole("link")).toHaveCount(3);
  await expect(menu.getByRole("link", { name: /Prova Playground/ })).toHaveAttribute("href", "#playground");
  await expect(menu.getByRole("link", { name: /Kontakta Stilledev/ })).toHaveAttribute("href", "/sv/contact");
  await expect(buddy.getByRole("button", { name: "Dölj roboten" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(buddy.getByRole("button", { name: "Öppna BudAI-menyn" })).toBeFocused();
});

test("the phone companion waits for the welcome notice, stays out of Playground and fits the viewport", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page); await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  const buddy = page.locator("[data-builder-companion]");
  await expect(buddy).toHaveCount(0);
  await page.getByRole("button", { name: /I understand, continue/i }).click();
  await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator("canvas")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await expect(buddy.getByRole("button", { name: "Open BudAI menu" })).toBeVisible();
  await context.close();
});
