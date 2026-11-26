import { test, expect, type Page } from "@playwright/test";

async function quiet(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("budai:cinematic-intro:v1", "1"); });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
}

test("Labs is a static bilingual under-development placeholder with no interactive product surface", async ({ page }) => {
  await quiet(page);
  for (const [path, language, status, statement] of [["/labs", "en", "UNDER DEVELOPMENT", "Something new is taking shape."], ["/sv/labs", "sv", "UNDER UTVECKLING", "Något nytt tar form."]]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { name: "STILLEDEV LABS" })).toBeVisible();
    await expect(page.locator(".labs-hold-status")).toHaveText(status);
    await expect(page.locator(".labs-hold-line")).toHaveText(statement);
    await expect(page.locator(".labs-bot, .labs-hold-page button, .labs-hold-page input")).toHaveCount(0);
    const html = await response!.text();
    expect(html).toContain('name="robots" content="noindex, follow"');
    expect(html).not.toContain("LabsMascot");
    expect(html).not.toContain("StilledevLabs");
  }
});

test("public navigation links to localized Labs while keeping placeholders off the homepage", async ({ page }) => {
  await quiet(page);
  for (const [path, href] of [["/", "/labs"], ["/sv", "/sv/labs"]]) {
    await page.goto(path);
    await expect(page.locator(`a[href="${href}"]`).first()).toHaveText("Labs");
    await expect(page.locator('a[href="/oliver-stille"],a[href="/sv/oliver-stille"]')).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(/Labs is under development|Labs är under utveckling/i);
  }
});

test("the static Labs placeholder remains available on mobile instead of the phone chat gate", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page); await page.goto("/sv/labs");
  await expect(page.getByRole("heading", { name: "STILLEDEV LABS" })).toBeVisible();
  await expect(page.locator(".phone-welcome")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await context.close();
});

test("Labs has no dedicated API or private public assets", async ({ request }) => {
  const [api, assets] = await Promise.all([
    request.get("/api/labs/telemetry"),
    request.get("/labs-media/labs-atmosphere.jpg"),
  ]);
  expect(api.status()).toBe(404);
  expect(assets.status()).toBe(404);
});
