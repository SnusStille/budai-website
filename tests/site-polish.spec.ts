import { test, expect, type Page } from "@playwright/test";

async function quiet(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
  });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
}

test("the landing has one ambient orbit, no robot, and no command-key control in the top bar", async ({ page }) => {
  await quiet(page);
  await page.goto("/");
  await expect(page.locator(".universe-depth-field .ambient-orbit")).toHaveCount(1);
  await expect(page.locator(".hero-signal-sculpture, .hero-light")).toHaveCount(0);
  expect(await page.locator(".universe-atmosphere").evaluate(node => getComputedStyle(node, "::before").content)).toBe("none");
  await expect(page.locator("[data-builder-companion], .bot-avatar, img[src*='builder-bot']")).toHaveCount(0);
  await expect(page.locator(".site-navigation").getByRole("button", { name: /⌘K|command palette/i })).toHaveCount(0);
  await expect(page.locator(".hero-universe .hero-surprise")).toHaveCount(0);
  await expect(page.locator(".feedback-launcher-spark")).toHaveCount(0);
  const box = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(box).toBeLessThanOrEqual(1);
});

test("the film is launched only from the landing CTA in a clean portrait dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:3000" });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
  });
  await page.route("**/e/bhs4y1**", route => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: "<!doctype html><title>Mock Streamable player</title><body>Embed test</body>",
  }));
  const response = await page.goto("/");
  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("frame-src 'self' https://streamable.com");

  await expect(page.locator(".showcase-film-section")).toHaveCount(0);
  await expect(page.locator(".showcase-film-player")).toHaveCount(0);
  await expect(page.locator(".showcase-film-overlay")).toHaveCount(0);
  await expect(page.locator(".showcase-film-reopen")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show film" })).toHaveCount(0);
  await page.getByRole("button", { name: "Copy info@stilledev.se" }).click();
  await expect(page.locator(".hero-email-copy small")).toHaveText("COPIED");

  const watchButton = page.getByRole("button", { name: "Watch Showcase" });
  await expect(watchButton).toBeVisible();
  await watchButton.click();
  const modal = page.locator(".showcase-film-modal");
  const frame = modal.locator("iframe");
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute("aria-modal", "true");
  await expect(modal.getByRole("heading", { name: "An idea, in motion." })).toBeVisible();
  await expect(frame).toHaveAttribute("src", "https://streamable.com/e/bhs4y1?autoplay=1&muted=1&loop=1");
  await expect(frame).toHaveAttribute("loading", "lazy");
  await expect(frame).toHaveAttribute("title", "Stilledev showcase film");
  await expect(frame).toHaveAttribute("allowfullscreen", "");
  const desktopFrame = await modal.locator(".showcase-film-modal-screen").boundingBox();
  expect(desktopFrame).not.toBeNull();
  expect(Math.abs(desktopFrame!.width / desktopFrame!.height - 9 / 16)).toBeLessThan(.03);

  await page.getByRole("button", { name: "Expand film" }).click();
  await expect(modal).toHaveClass(/is-expanded/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".showcase-film-modal")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await watchButton.click();
  const mobileFrame = await page.locator(".showcase-film-modal-screen").boundingBox();
  expect(mobileFrame).not.toBeNull();
  expect(Math.abs(mobileFrame!.width / mobileFrame!.height - 9 / 16)).toBeLessThan(.03);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.locator(".showcase-film-overlay").click({ position: { x: 4, y: 4 } });
  await expect(page.locator(".showcase-film-modal")).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await watchButton.click();
  await expect(page.locator(".showcase-film-modal iframe")).toHaveAttribute("src", "https://streamable.com/e/bhs4y1?muted=1");
  await expect(page.locator(".showcase-film-overlay")).toHaveCSS("animation-name", "none");
  await page.getByRole("dialog").getByRole("link", { name: "Try the Playground" }).click();
  await expect(page.locator(".showcase-film-modal")).toHaveCount(0);
  await expect(page.locator("#playground")).toBeInViewport();

  await page.goto("/sv");
  await page.getByRole("button", { name: "Se showreelen" }).click();
  await expect(page.getByRole("heading", { name: "En idé blir till." })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Prova Playground" })).toBeVisible();
  await page.getByRole("button", { name: "Stäng filmen" }).click();
  await expect(page.locator(".showcase-film-modal")).toHaveCount(0);

  await page.goto("/contact");
  await expect(page.locator(".hero-film-trigger")).toHaveCount(0);
});

test("the bilingual FAQ opens natively and uses the same centrally configured limits", async ({ page }) => {
  await quiet(page);
  for (const [path, question, answer, privacyLink] of [
    ["/", "Is BudAI free to use?", "5 messages a day as a guest and 20 with an account", "Read the privacy details"],
    ["/sv", "Är BudAI gratis?", "5 meddelanden per dag som gäst och 20 med konto", "Läs om integritet"],
  ] as const) {
    await page.goto(path);
    const faq = page.locator("#faq");
    const item = faq.locator("details").filter({ hasText: question });
    await item.locator("summary").click();
    await expect(item).toHaveAttribute("open", "");
    await expect(item).toContainText(answer);
    const privacyItem = faq.locator("details").filter({ hasText: path === "/sv" ? "Hur fungerar minnet?" : "How does memory work?" });
    await privacyItem.locator("summary").click();
    await expect(faq.getByRole("link", { name: privacyLink })).toBeVisible();
  }
});

test("the mobile Playground shortcut only appears between the landing and Playground", async ({ page }) => {
  await quiet(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nudge = page.locator(".mobile-playground-nudge");
  await expect(nudge).toHaveCount(0);
  await page.locator("#signal").scrollIntoViewIfNeeded();
  await expect(nudge).toBeVisible();
  await nudge.click();
  await expect(page.locator("#playground")).toBeInViewport();
  await expect(nudge).toHaveCount(0);
  await expect(page.locator(".showcase-film-section")).toHaveCount(0);
  await expect(nudge).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
