import { test, expect } from "@playwright/test";
import { BUDAI_MARK_PATH } from "../lib/brand";

test("one Fold identity reaches the real UI, installed icons and both social metadata paths", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("budai-buddy-popup-dismissed", "true"); });
  await page.goto("/");
  const marks = page.locator("[data-budai-mark=fold] svg > path");
  expect(await marks.count()).toBeGreaterThanOrEqual(7);
  for (const mark of await marks.all()) await expect(mark).toHaveAttribute("d", BUDAI_MARK_PATH);
  for (const wordmark of await page.locator("[data-budai-wordmark]").all()) await expect(wordmark).toHaveText("BudAI");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
  await expect(page.locator("nav").getByText("STILLEDEV", { exact: true })).toBeVisible();
  // The separate Stilledev S path is not the BudAI mark, and its attribution remains.
  expect(await page.locator('footer path[d^="M21.5 11.2"]').count()).toBeGreaterThan(0);
  const favicon = await request.get("/favicon.svg");
  expect(favicon.ok()).toBe(true);
  expect(await favicon.text()).toContain(BUDAI_MARK_PATH);
  expect(await favicon.text()).not.toMatch(/linearGradient|animate|filter/);
  for (const [file, size] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]] as const) {
    const response = await request.get(`/${file}`);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([size, size]);
  }
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: "192x192" }),
    expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
  ]));
  const social = await request.get("/og.png");
  const autoSocial = await request.get("/opengraph-image");
  expect(autoSocial.ok()).toBe(true);
  const socialBytes = await social.body();
  expect([socialBytes.readUInt32BE(16), socialBytes.readUInt32BE(20)]).toEqual([1200, 630]);
  expect(await autoSocial.body()).toEqual(socialBytes);
  await page.locator(".site-navigation").screenshot({ path: "test-results/brand-navigation-desktop.png" });
});
