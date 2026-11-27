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
    await expect(page.getByRole("link", { name: /Back to BudAI|Tillbaka till BudAI/ })).toHaveAttribute("href", language === "sv" ? "/sv" : "/");
    await expect(page.locator(".labs-bot, .labs-hold-page input")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Share Labs|Dela Labs/ })).toBeVisible();
    const html = await response!.text();
    expect(html).toContain('name="robots" content="noindex, follow"');
    expect(html).not.toContain("LabsMascot");
    expect(html).not.toContain("StilledevLabs");
  }
});

test("public navigation links to localized Labs and the founder profile", async ({ page }) => {
  await quiet(page);
  for (const [path, href] of [["/", "/labs"], ["/sv", "/sv/labs"]]) {
    await page.goto(path);
    await expect(page.locator(`a[href="${href}"]`).first()).toHaveText("Labs");
    await expect(page.locator("footer").getByRole("link", { name: "Oliver Stille" })).toHaveAttribute("href", path === "/sv" ? "/sv/oliver-stille" : "/oliver-stille");
    expect(await page.locator("body").innerText()).not.toMatch(/Labs is under development|Labs är under utveckling/i);
  }
});

test("the static Labs placeholder and return link remain available on narrow mobile screens", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page); await page.goto("/sv/labs");
  await expect(page.getByRole("heading", { name: "STILLEDEV LABS" })).toBeVisible();
  await expect(page.locator(".phone-welcome")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Tillbaka till BudAI" })).toHaveAttribute("href", "/sv");
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("Labs share copies the localized public URL and announces the result", async ({ page }) => {
  await quiet(page); await page.goto("/sv/labs");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as any).__labsCopied = value; } } });
  });
  await page.getByRole("button", { name: "Dela Labs" }).click();
  await expect(page.getByRole("button", { name: "Länken kopierad" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__labsCopied)).toBe("http://127.0.0.1:3000/sv/labs");
});

test("Labs has no dedicated API or private public assets", async ({ request }) => {
  const [api, assets] = await Promise.all([
    request.get("/api/labs/telemetry"),
    request.get("/labs-media/labs-atmosphere.jpg"),
  ]);
  expect(api.status()).toBe(404);
  expect(assets.status()).toBe(404);
});
