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
  const box = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(box).toBeLessThanOrEqual(1);
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
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(nudge).toBeVisible();
  await nudge.click();
  await expect(page.locator("#playground")).toBeInViewport();
  await expect(nudge).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
