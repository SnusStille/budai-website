import { test, expect, type Page } from "@playwright/test";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
async function quiet(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
  });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
}

test("companion is quiet, keyboard accessible, localized and dismissible for the session", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/");
  const buddy = page.locator("[data-builder-companion]");
  await expect(buddy).toHaveCount(0); // no competition with initial content
  await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot-fallback")).toBeVisible();
  await expect(buddy.locator("canvas")).toHaveCount(0); // reduced motion is a static, zero-WebGL fallback
  await expect(buddy.locator(".companion-note")).toHaveCount(0); // reduced motion never auto-opens
  const launcher = buddy.getByRole("button", { name: "Meet the BudAI companion" });
  await launcher.focus(); await page.keyboard.press("Enter");
  await expect(buddy.locator(".companion-message")).toHaveText("Well, look who found us.");
  await expect(buddy.getByRole("link", { name: "Enter Playground" })).toHaveAttribute("href", "#playground");
  await buddy.getByRole("button", { name: "Another thought" }).click();
  await expect(buddy.locator(".companion-message")).toHaveText("Think it. Build it. BudAI.");
  await buddy.getByRole("button", { name: "Minimize BudAI", exact: true }).click();
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await buddy.getByRole("button", { name: "Hide for this visit" }).click();
  await expect(buddy).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("budai:companion:hidden:v1"))).toBe("1");
  await page.reload(); await page.waitForTimeout(7500); await expect(buddy).toHaveCount(0);
});

test("desktop companion uses the Labs model, gives way to dialogs and Playground, and supports Swedish", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/sv");
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot")).toBeAttached();
  await buddy.getByRole("button", { name: "Möt BudAI-kompanjonen" }).click();
  await expect(buddy.getByRole("link", { name: "Öppna Playground" })).toBeVisible();
  await expect(buddy.getByText("Think it. Build it. BudAI.")).toBeVisible();
  await page.screenshot({ path: "test-results/companion-desktop.png" });
  await buddy.getByRole("link", { name: "Öppna Playground" }).click();
  await expect(page.locator("#playground")).toBeInViewport(); await expect(buddy).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Meddelande till BudAI", exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(buddy).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible(); await expect(buddy).toHaveCount(0);
  await page.keyboard.press("Escape"); await expect(buddy).toBeVisible();
});

test("phone companion waits for the desktop notice, avoids the working chat and can be hidden", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page); await page.goto("/");
  const notice = page.locator(".desktop-notice"); await expect(notice).toBeVisible();
  await page.waitForTimeout(7200); await expect(page.locator("[data-builder-companion]")).toHaveCount(0);
  await notice.getByRole("button", { name: "I understand, continue" }).click();
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await page.screenshot({ path: "test-results/companion-phone.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await buddy.getByRole("link", { name: "Enter Playground" }).click();
  await expect(page.locator("#playground")).toBeInViewport(); await expect(buddy).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Message BudAI", exact: true })).toBeVisible();
  await context.close();
});

test("save-data keeps the shared fallback without creating a robot WebGL canvas", async ({ page }) => {
  await quiet(page);
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.goto("/"); const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot-fallback")).toBeVisible(); await expect(buddy.locator("canvas")).toHaveCount(0);
});

test("automatic thoughts are rare, temporary and stop when a visitor takes control", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" });
  // Keep this timing test independent of GPU availability while exercising the normal-motion policy.
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.clock.install(); await page.goto("/");
  await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await page.clock.fastForward(8100);
  await expect(buddy.locator(".companion-note")).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("budai:companion:appearances:v1"))).toBe("1");
  await page.clock.fastForward(11200);
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await buddy.getByRole("button", { name: "Minimize BudAI", exact: true }).click();
  await expect(buddy.getByRole("button", { name: "Meet the BudAI companion" })).toBeFocused();
  await page.clock.fastForward(240000);
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
});
