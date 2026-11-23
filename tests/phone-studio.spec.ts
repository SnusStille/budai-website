import { test, expect } from "@playwright/test";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

test("phone studio connects capabilities, Builder, Labs and the existing Playground in both languages", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("stilledev:desktop-notice:v1", "seen"); });
  await page.goto("/sv#capabilities");
  await expect(page.locator("#capabilities .phone-studio-list li")).toHaveCount(6);
  await expect(page.locator("#about")).toContainText("Stilledev utvecklar BudAI");
  await expect(page.locator("#roadmap")).toContainText("Inga lanseringsdatum");
  await expect(page.locator("#waitlist form")).toBeVisible();
  for (const width of [360, 390, 414]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.locator(".phone-studio-nav").getByRole("link", { name: /Labs/ }).click();
  await expect(page.locator(".labs-index-list li")).toHaveCount(5);
  await page.locator(".labs-wait-cta").click();
  await expect(page).toHaveURL(/\/sv#about$/);
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator(".phone-welcome")).not.toHaveAttribute("inert", "");
  await page.locator(".phone-header .phone-languages").getByRole("button", { name: "EN" }).click();
  await expect(page.locator("#capabilities")).toContainText("Six capabilities");
  await expect(page.locator("#playground").getByRole("textbox", { name: "Message BudAI" })).toBeVisible();
  await context.close();
});

test("phone waitlist uses the existing consent and API flow", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("stilledev:desktop-notice:v1", "seen"); });
  let posted: Record<string, unknown> | undefined;
  await page.route("**/api/waitlist", async route => { posted = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await page.goto("/#waitlist");
  const form = page.locator("#waitlist form");
  await form.getByRole("checkbox").check();
  await expect(page.locator(".phone-welcome")).not.toHaveAttribute("inert", "");
  await form.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await form.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.locator("#waitlist").getByRole("status")).toContainText("You're in!");
  expect(posted).toMatchObject({ email: "test@example.com", consent: true });
  await context.close();
});


test("quick routes, safe starter prompts and the FAQ work in both languages", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("budai-buddy-popup-dismissed", "true"); });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Jump directly to" });
  await nav.getByRole("link", { name: "Capabilities" }).click();
  await expect(page).toHaveURL(/#capabilities$/);
  let sent = 0;
  page.on("request", request => { if (request.url().endsWith("/api/playground")) sent++; });
  const composer = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await composer.fill("My unsent draft");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Try Write" }).click();
  await expect(composer).toHaveValue("My unsent draft");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Try Write" }).click();
  await expect(composer).toHaveValue(/turn my notes into a clear email/);
  expect(sent).toBe(0);
  await page.getByText("Do I need an account?").click();
  await expect(page.getByText(/12 messages per day/).first()).toBeVisible();
  await page.locator(".phone-header .phone-languages").getByRole("button", { name: "SV" }).click();
  await expect(page.getByRole("navigation", { name: "Gå direkt till" })).toBeVisible();
  await expect(page.getByText("Behöver jag ett konto?")).toBeVisible();
  await page.getByText("Hur fungerar minnet?").click();
  await expect(page.getByText(/Tillfälliga chattar använder inte minne/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await context.close();
});

test("optional desktop notice closes with Escape and restores focus", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
  await page.goto("/");
  const opener = page.getByRole("button", { name: "About the 3D journey" });
  await opener.click();
  await expect(page.locator(".desktop-notice")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".desktop-notice")).toHaveCount(0);
  await expect(opener).toBeFocused();
  await context.close();
});
