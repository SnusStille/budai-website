import { test, expect, type Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
  });
}

test("Oliver Stille has crawlable, bilingual profile pages linked to the Stilledev entity", async ({ page }) => {
  await prepare(page);
  for (const [path, language, title, heading, canonical] of [
    ["/oliver-stille", "en", "Oliver Stille — Founder of Stilledev", "Oliver Stille", "https://stilledev.se/oliver-stille"],
    ["/sv/oliver-stille", "sv", "Oliver Stille — grundare av Stilledev", "Oliver Stille", "https://stilledev.se/sv/oliver-stille"],
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.locator("meta[name='description']")).toHaveAttribute("content", /Oliver Stille.*Stilledev/);
    const html = await response!.text();
    expect(html).toContain(`href="${canonical}"`);
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain('hrefLang="sv"');
    const structuredData = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent || "{}")));
    const profile = structuredData.find(item => item["@type"] === "ProfilePage");
    expect(profile).toMatchObject({ url: canonical, mainEntity: { "@id": "https://stilledev.se/#person" } });
    await expect(page.getByRole("link", { name: language === "sv" ? "Kontakta Stilledev" : "Contact Stilledev" })).toHaveAttribute("href", language === "sv" ? "/sv/contact" : "/contact");
  }
});

test("homepage identifies Oliver and publishes Stilledev's own search logo and Person relationship", async ({ page }) => {
  await prepare(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/Stilledev.*Oliver Stille/i);
  await expect(page.locator("meta[name='description']")).toHaveAttribute("content", /Stilledev.*Oliver Stille/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /stilledev-social\.png/);
  const icons = await page.locator('link[rel="icon"]').evaluateAll(nodes => nodes.map(node => (node as HTMLLinkElement).href).join(" "));
  expect(icons).toContain("stilledev-mark.svg");
  const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
  expect(appleIcon).toContain("stilledev-icon-180.png");

  const scripts = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent || "{}")));
  const graph = scripts.find(item => Array.isArray(item["@graph"]))?.["@graph"] as Array<Record<string, unknown>>;
  expect(graph).toBeTruthy();
  const organization = graph.find(node => node["@type"] === "Organization");
  const person = graph.find(node => node["@type"] === "Person");
  expect(organization?.url).toBe("https://stilledev.se");
  expect(organization?.logo).toMatchObject({ url: "https://stilledev.se/stilledev-mark-512.png", width: 512, height: 512 });
  expect(person).toMatchObject({ name: "Oliver Stille", url: "https://stilledev.se/oliver-stille", worksFor: { "@id": "https://stilledev.se/#organization" } });
  await expect(page.getByRole("navigation", { name: "Company" }).getByRole("link", { name: "Oliver Stille" })).toHaveAttribute("href", "/oliver-stille");
  await expect(page.locator(".builder-byline a", { hasText: "Oliver Stille" })).toHaveAttribute("href", "/oliver-stille");
  await expect(page.locator(".hero-credit a", { hasText: "Stilledev" })).toHaveAttribute("href", "#about");
  await expect(page.locator(".hero-credit a", { hasText: "Oliver Stille" })).toHaveAttribute("href", "/oliver-stille");
});

test("English and Swedish contact pages provide consistent direct contact, canonical and alternate metadata", async ({ page }) => {
  await prepare(page);
  for (const [path, language, expectedHeading, locale] of [["/contact", "en", "Contact Stilledev", "en_US"], ["/sv/contact", "sv", "Kontakta Stilledev", "sv_SE"]]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { name: expectedHeading, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "info@stilledev.se" }).first()).toHaveAttribute("href", "mailto:info@stilledev.se");
    await expect(page.getByLabel(language === "sv" ? "Namn *" : "Name *")).toBeVisible();
    const html = await response!.text();
    expect(html).toContain(`content="${locale}"`);
    expect(html).toContain(`href="https://stilledev.se${path}"`);
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain('hrefLang="sv"');
    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent || "{}")));
    expect(blocks.some(item => item["@type"] === "ContactPage" && item.url === `https://stilledev.se${path}`)).toBe(true);
  }
});

test("founder profile pages remain readable and overflow-free on mobile", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await prepare(page);
  for (const [path, heading, contact] of [["/oliver-stille", "Oliver Stille", "Contact Stilledev"], ["/sv/oliver-stille", "Oliver Stille", "Kontakta Stilledev"]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: contact })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("sitemap and robots publish the founder profile while keeping Labs non-indexable", async ({ request }) => {
  const [robotsResponse, sitemapResponse] = await Promise.all([request.get("/robots.txt"), request.get("/sitemap.xml")]);
  expect(robotsResponse.status()).toBe(200);
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  for (const path of ["/", "/sv", "/oliver-stille", "/sv/oliver-stille", "/contact", "/sv/contact"]) expect(sitemap).toContain(`https://stilledev.se${path}`);
  for (const path of ["/labs", "/sv/labs"]) expect(sitemap).not.toContain(`https://stilledev.se${path}`);
  expect(sitemap).not.toContain("<lastmod>");
  const robots = await robotsResponse.text();
  expect(robots).toContain("https://stilledev.se/sitemap.xml");
  expect(robots).not.toMatch(/Disallow:\s*\/admin/i);
  const admin = await request.get("/admin");
  expect(admin.headers()["x-robots-tag"]).toMatch(/noindex/i);
});
