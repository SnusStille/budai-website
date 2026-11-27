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

test("repeated Back to BudAI controls share one upper-left position and the BudAI mark", async ({ page }) => {
  await prepare(page);
  for (const path of ["/labs", "/oliver-stille", "/changelog", "/legal/privacy", "/sv/labs", "/sv/oliver-stille"]) {
    await page.goto(path);
    const back = page.locator(".standalone-back-link");
    await expect(back).toBeVisible();
    await expect(back.locator("[data-budai-mark=confluence]")).toHaveCount(1);
    const rect = await back.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.y).toBeLessThan(150);
    expect(rect!.x).toBeLessThan((await page.evaluate(() => innerWidth)) / 2);
  }
});

test("secondary pages share the legal reading surface, typography and language controls", async ({ page }) => {
  await prepare(page);
  const surface = [] as Array<{ background: string; radius: string; headingSize: string }>;
  for (const path of ["/legal/privacy", "/legal/data", "/labs", "/sv/labs", "/oliver-stille", "/sv/oliver-stille", "/contact", "/sv/contact", "/changelog"]) {
    await page.goto(path);
    await expect(page.locator(".standalone-page-shell")).toBeVisible();
    await expect(page.locator(".standalone-page-card")).toBeVisible();
    await expect(page.getByRole("group", { name: /Choose language|Välj språk/ })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: /Reading progress|Läsförlopp/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Share page|Dela sidan/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Share page|Dela sidan/ })).toHaveCount(1);
    if (path.includes("labs")) await expect(page.locator(".labs-share-button, .labs-share-wrap")).toHaveCount(0);
    await expect(page.locator(".standalone-page-tools")).toContainText(/\d+ min (read|läsning)/);
    surface.push(await page.locator(".standalone-page-shell").evaluate(main => ({
      background: getComputedStyle(main).backgroundColor,
      radius: getComputedStyle(main.querySelector(".standalone-page-card")!).borderRadius,
      headingSize: getComputedStyle(main.querySelector(".standalone-page-card h1")!).fontSize,
    })));
  }
  expect(new Set(surface.map(item => item.background)).size).toBe(1);
  expect(new Set(surface.map(item => item.radius)).size).toBe(1);
  expect(new Set(surface.map(item => item.headingSize)).size).toBe(1);

  await page.goto("/legal/privacy");
  await page.getByRole("button", { name: "SV" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.getByRole("heading", { name: "Integritetspolicy" })).toBeVisible();
});

test("standalone pages expose useful reading progress and copy a shareable canonical URL", async ({ page }) => {
  await prepare(page);
  await page.addInitScript(() => {
    let copied = "";
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async (value: string) => { copied = value; },
      readText: async () => copied,
    } });
  });
  await page.goto("/legal/privacy");
  const share = page.locator(".standalone-page-tools button");
  await expect(share).toHaveAccessibleName("Share page");
  await share.click();
  await expect(share).toContainText("Link copied");
  await expect(page.locator(".standalone-page-tools [role='status']")).toHaveText("Page link copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());

  const progress = page.getByRole("progressbar", { name: "Reading progress" });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(progress).toHaveAttribute("aria-valuenow", "100");
});

test("homepage uses BudAI site icons while keeping Stilledev and Oliver linked in search metadata", async ({ page }) => {
  await prepare(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/Stilledev.*Oliver Stille/i);
  await expect(page.locator("meta[name='description']")).toHaveAttribute("content", /Stilledev.*Oliver Stille/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /stilledev-social\.png/);
  const icons = await page.locator('link[rel="icon"]').evaluateAll(nodes => nodes.map(node => (node as HTMLLinkElement).href).join(" "));
  expect(icons).toContain("favicon.svg");
  expect(icons).toContain("favicon-32.png");
  expect(icons).not.toContain("stilledev-mark.svg");
  const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
  expect(appleIcon).toBe("/apple-touch-icon.png");

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
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await prepare(page);
  for (const [path, heading, contact] of [["/oliver-stille", "Oliver Stille", "Contact Stilledev"], ["/sv/oliver-stille", "Oliver Stille", "Kontakta Stilledev"]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to BudAI|Tillbaka till BudAI/ })).toHaveAttribute("href", path.startsWith("/sv") ? "/sv" : "/");
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
