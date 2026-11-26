import { test, expect, type Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
  });
}

test("retired Oliver profile URLs permanently redirect to the localized homepages", async ({ request }) => {
  for (const [path, destination] of [["/oliver-stille", "/"], ["/sv/oliver-stille", "/sv"]]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
});

test("homepage has Stilledev-first metadata and a linked founder entity without profile URLs", async ({ page }) => {
  await prepare(page);
  await page.goto("/");
  const title = await page.title();
  expect(title).toMatch(/Stilledev/i);
  expect(title).not.toContain("Founder of Stilledev");
  const scripts = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent || "{}")));
  const graph = scripts.find(item => Array.isArray(item["@graph"]))?.["@graph"] as Array<Record<string, unknown>>;
  expect(graph).toBeTruthy();
  const organization = graph.find(node => node["@type"] === "Organization");
  const person = graph.find(node => node["@type"] === "Person");
  expect(organization?.url).toBe("https://stilledev.se");
  expect(person).toMatchObject({ name: "Oliver Stille", url: "https://stilledev.se", worksFor: { "@id": "https://stilledev.se/#organization" } });
  await expect(page.getByRole("link", { name: "Oliver Stille" })).toHaveAttribute("href", "#oliver-stille");
  await expect(page.locator(".builder-byline")).not.toContainText("SkandiaMäklarna");
  await expect(page.locator(".builder-byline")).not.toHaveAttribute("href", /oliver-stille/);
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

test("both contact routes remain readable and overflow-free on mobile", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await prepare(page);
  for (const [path, heading] of [["/contact", "Contact Stilledev"], ["/sv/contact", "Kontakta Stilledev"]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "info@stilledev.se" }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("sitemap and robots exclude retired profile and non-indexable Labs placeholder", async ({ request }) => {
  const [robotsResponse, sitemapResponse] = await Promise.all([request.get("/robots.txt"), request.get("/sitemap.xml")]);
  expect(robotsResponse.status()).toBe(200);
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  for (const path of ["/", "/sv", "/contact", "/sv/contact"]) expect(sitemap).toContain(`https://stilledev.se${path}`);
  for (const path of ["/oliver-stille", "/sv/oliver-stille", "/labs", "/sv/labs"]) expect(sitemap).not.toContain(`https://stilledev.se${path}`);
  expect(sitemap).not.toContain("<lastmod>");
  const robots = await robotsResponse.text();
  expect(robots).toContain("https://stilledev.se/sitemap.xml");
  expect(robots).not.toMatch(/Disallow:\s*\/admin/i);
  const admin = await request.get("/admin");
  expect(admin.headers()["x-robots-tag"]).toMatch(/noindex/i);
});
