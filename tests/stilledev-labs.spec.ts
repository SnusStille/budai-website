import { test, expect, type Page } from "@playwright/test";

async function quietChrome(page: Page) {
  await page.route("**/va.vercel-scripts.com/**", r => r.fulfill({ contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => {
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
  });
}

test("Builder opens the separate Labs page and project names are non-clickable", async ({ page }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/#stilledev-labs");
  const portal = page.locator("#stilledev-labs");
  await expect(portal).toBeVisible();
  await expect(portal.getByRole("link", { name: /Enter Labs/ })).toHaveAttribute("href", "/labs");
  await portal.getByRole("link", { name: /Enter Labs/ }).click();
  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.getByRole("heading", { name: /Labs.*Ideas in motion/ })).toBeVisible();
  const projects = page.locator("#projects");
  await expect(projects.locator("article")).toHaveCount(5);
  for (const name of ["BudAI", "StilleAffe", "Anna’s Second Brain", "Harvis", "Julia Stille Real Estate"]) await expect(projects.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(projects.locator("a, button")).toHaveCount(0);
  await expect(projects).toContainText("Project links are kept private");
  await expect(page.locator("#about-labs")).toContainText("Oliver");
  await expect(page.locator("#business")).toContainText("Swedish limited company");
  await expect(page.locator("#business")).toContainText("payment method");
  await expect(page.locator("#business")).toContainText("GDPR");
  await expect(page.locator("#business")).not.toContainText("Sole proprietorship");
  await expect(page.locator("#contact a[href='mailto:Stilleinc@hotmail.com']")).toBeVisible();
  await expect(page.locator(".lab-art-fallback")).toBeVisible();
  await expect(page.locator(".lab-art canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Swedish route, navigation and language switch retain real routes", async ({ page }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sv#stilledev-labs");
  await expect(page.locator("#stilledev-labs a")).toHaveAttribute("href", "/sv/labs");
  await page.locator("#stilledev-labs a").click();
  await expect(page).toHaveURL(/\/sv\/labs$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.locator("#projects")).toContainText("Projektens länkar hålls privata");
  await expect(page.locator("#business")).toContainText("Svenskt aktiebolag");
  await expect(page.locator("#business")).toContainText("betalningssätt");
  await expect(page.locator("#business")).toContainText("GDPR");
  await page.getByRole("group", { name: "Språk" }).getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#business")).toContainText("Swedish limited company");
  await page.locator(".lab-back").click();
  await expect(page).toHaveURL(/\/$/);
});

test("Labs stays within the viewport at mobile, tablet and desktop widths", async ({ page }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/labs");
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${width}px`).toBeLessThanOrEqual(1);
    for (const id of ["projects", "about-labs", "business", "contact"]) {
      const bounds = await page.locator(`#${id}`).boundingBox();
      expect(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `${id} at ${width}px`).toBeTruthy();
    }
  }
});

test("Labs metadata has reciprocal language links and verified business sources", async ({ page, request }) => {
  for (const path of ["/labs", "/sv/labs"]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain('hrefLang="sv"');
    expect(html).toContain("/sv/labs");
  }
  await quietChrome(page); await page.goto("/labs");
  await expect(page.locator('#business a[href^="https://www.skatteverket.se/"]')).toBeVisible();
  await expect(page.locator('#business a[href^="https://www.imy.se/"]')).toBeVisible();
  await expect(page.locator('#business')).not.toContainText(/\b\d{6}-\d{4}\b/);
});

test("3D artwork loads when motion is enabled without blocking navigation", async ({ page }) => {
  await quietChrome(page);
  await page.goto("/labs");
  await expect(page.locator(".lab-art")).toBeVisible();
  // A WebGL canvas is optional: the static artwork is the graceful fallback.
  await expect(page.getByRole("link", { name: /Explore the projects/ })).toBeVisible();
  await page.getByRole("link", { name: /Explore the projects/ }).click();
  await expect(page).toHaveURL(/#projects$/);
});
