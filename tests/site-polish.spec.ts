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

test("the film is only a compact corner dock, with a responsive portrait player on demand", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
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

  const dock = page.locator(".showcase-film-player");
  await expect(page.locator(".showcase-film-section")).toHaveCount(0);
  await expect(dock).toBeVisible();
  await expect(dock).toHaveAttribute("data-minimized", "true");
  await expect(dock).toHaveAttribute("data-dock-visible", "true");
  await expect(dock.locator("iframe")).toHaveCount(0);
  await expect(page.locator(".mobile-playground-nudge")).toBeHidden();

  await page.getByRole("button", { name: "Play the showcase film" }).click();
  const frame = dock.locator("iframe");
  await expect(frame).toHaveAttribute("src", "https://streamable.com/e/bhs4y1?autoplay=1&muted=1&loop=1");
  await expect(frame).toHaveAttribute("loading", "lazy");
  await expect(frame).toHaveAttribute("title", "Stilledev showcase film");
  await expect(frame).toHaveAttribute("allowfullscreen", "");
  await expect(dock.locator(".showcase-film-player-label")).toHaveText("STILLEDEV · FILM 01");

  const desktopFrame = await dock.locator(".showcase-film-player-screen").boundingBox();
  expect(desktopFrame).not.toBeNull();
  expect(Math.abs(desktopFrame!.width / desktopFrame!.height - 9 / 16)).toBeLessThan(.03);
  expect(desktopFrame!.width).toBeLessThanOrEqual(185);

  await page.getByRole("button", { name: "View fullscreen" }).click();
  await expect(dock).toHaveAttribute("aria-modal", "true");
  await page.keyboard.press("Escape");
  await expect(dock).toHaveAttribute("data-expanded", "false");
  await page.getByRole("button", { name: "Minimize film player" }).click();
  await expect(page.locator(".showcase-film-mini")).toBeVisible();
  await expect(frame).toHaveCount(0);
  await page.getByRole("button", { name: "Play the showcase film" }).click();
  await expect(frame).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileFrame = await dock.locator(".showcase-film-player-screen").boundingBox();
  expect(mobileFrame).not.toBeNull();
  expect(Math.abs(mobileFrame!.width / mobileFrame!.height - 9 / 16)).toBeLessThan(.03);
  expect(mobileFrame!.width).toBeLessThanOrEqual(159);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".showcase-film-section")).toHaveCount(0);
  await expect(page.locator(".showcase-film-player iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Play the showcase film" }).click();
  await expect(page.locator(".showcase-film-player iframe")).toHaveAttribute("src", "https://streamable.com/e/bhs4y1?muted=1");
  await expect(page.locator(".showcase-film-player")).toHaveCSS("animation-name", "none");
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
  await page.getByRole("button", { name: "Close film player" }).click();
  await page.locator("#signal").scrollIntoViewIfNeeded();
  await expect(nudge).toBeVisible();
  await nudge.click();
  await expect(page.locator("#playground")).toBeInViewport();
  await expect(nudge).toHaveCount(0);
  await expect(page.locator(".showcase-film-section")).toHaveCount(0);
  await expect(nudge).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
