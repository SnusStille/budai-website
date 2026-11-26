import { test, expect, type Page } from "@playwright/test";

const expectedProfiles = [
  "https://github.com/SnusStille",
  "https://www.linkedin.com/in/oliver-stille-8bb48a403/",
];

async function prepare(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
  });
}

function meta(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ?? "";
}

test("Oliver profile has unique localized metadata, canonical URLs and one visible H1", async ({ page }) => {
  await prepare(page);
  for (const [path, language, title, canonical] of [
    ["/oliver-stille", "en", "Oliver Stille – Founder of Stilledev", "https://stilledev.se/oliver-stille"],
    ["/sv/oliver-stille", "sv", "Oliver Stille – Grundare av Stilledev", "https://stilledev.se/sv/oliver-stille"],
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Oliver Stille", level: 1 })).toBeVisible();
    await expect(page.locator(".oliver-profile")).toContainText("SkandiaMäklarna");
    await expect(page.locator(".oliver-profile")).toContainText("BudAI");
    await expect(page.locator(".oliver-profile")).toContainText("Stilledev Labs");
    await expect(page.locator(".oliver-profile")).toContainText("info@stilledev.se");
    await expect(page.locator(".oliver-profile")).not.toContainText("Helsingborg");
    await expect(page.locator(".phone-welcome")).toHaveCount(0);
    const html = await response!.text();
    expect(meta(html, /<title>(.*?)<\/title>/i).replaceAll("&#x27;", "'")).toBe(title);
    expect(meta(html, /<link rel="canonical" href="([^"]+)"/i)).toBe(canonical);
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toContain('property="og:type" content="profile"');
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain('hrefLang="sv"');

    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent || "{}")));
    const pageGraph = blocks.find((item) => item["@type"] === "ProfilePage");
    expect(pageGraph).toMatchObject({ "@type": "ProfilePage", url: canonical, inLanguage: language });
    expect(pageGraph.mainEntity["@id"]).toBe("https://stilledev.se/oliver-stille#person");
    expect(pageGraph.isPartOf["@id"]).toBe("https://stilledev.se/#website");
    expect(pageGraph.publisher["@id"]).toBe("https://stilledev.se/#organization");
    expect(pageGraph.breadcrumb.itemListElement).toHaveLength(2);
  }
});

test("the site entity graph links only verified profiles and adds a distinct WebSite node", async ({ page }) => {
  await prepare(page);
  await page.goto("/");
  const scripts = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent || "{}")));
  const graph = scripts.find((item) => Array.isArray(item["@graph"]))["@graph"] as Array<Record<string, unknown>>;
  const website = graph.find((node) => node["@type"] === "WebSite");
  const organization = graph.find((node) => node["@type"] === "Organization");
  const person = graph.find((node) => node["@type"] === "Person");
  expect(website).toMatchObject({ "@id": "https://stilledev.se/#website", name: "Stilledev", url: "https://stilledev.se" });
  expect(organization?.["founder"]).toEqual({ "@id": person?.["@id"] });
  expect(person).toMatchObject({ name: "Oliver Stille", url: "https://stilledev.se/oliver-stille", worksFor: { "@id": "https://stilledev.se/#organization" } });
  expect(person?.sameAs).toEqual(expectedProfiles);
  await expect(page.locator("footer").getByRole("link", { name: "Oliver Stille" })).toHaveAttribute("href", "/oliver-stille");
  await expect(page.locator(".builder-byline").getByRole("link", { name: /professional profile/i })).toHaveAttribute("href", "/oliver-stille");
});

test("Labs and profile pages are indexable, present in sitemap, and use clean robots rules", async ({ request }) => {
  for (const path of ["/labs", "/sv/labs"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toContain("BudAI");
    expect(html).toContain("Oliver Stille");
  }
  const [robotsResponse, sitemapResponse] = await Promise.all([request.get("/robots.txt"), request.get("/sitemap.xml")]);
  expect(robotsResponse.status()).toBe(200);
  expect(sitemapResponse.status()).toBe(200);
  const robots = await robotsResponse.text();
  expect(robots).toContain("https://stilledev.se/sitemap.xml");
  expect(robots).not.toMatch(/Disallow:\s*\/admin/i);
  const sitemap = await sitemapResponse.text();
  for (const path of ["/oliver-stille", "/sv/oliver-stille", "/labs", "/sv/labs"]) expect(sitemap).toContain(`https://stilledev.se${path}`);
  expect(sitemap).not.toContain("<lastmod>");
  const admin = await request.get("/admin");
  expect(admin.headers()["x-robots-tag"]).toMatch(/noindex/i);
});

test("profile and Labs remain real crawlable pages on phone and Googlebot-smartphone requests", async ({ browser, request }) => {
  const phoneUa = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const context = await browser.newContext({ userAgent: phoneUa, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await prepare(page);
  for (const [path, selector, text] of [
    ["/oliver-stille", ".oliver-profile", "Oliver Stille"],
    ["/sv/oliver-stille", ".oliver-profile", "Oliver Stille"],
    ["/labs", ".labs-wait-details", "BudAI"],
    ["/sv/labs", ".labs-wait-details", "BudAI"],
  ]) {
    await page.goto(path);
    await expect(page.locator(selector)).toContainText(text);
    await expect(page.locator(".phone-welcome")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await context.close();
  for (const path of ["/oliver-stille", "/labs"]) {
    const response = await request.get(path, { headers: { "user-agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 Googlebot/2.1" } });
    const html = await response.text();
    expect(response.status()).toBe(200);
    expect(html).toContain("Oliver Stille");
    expect(html).not.toContain('class="phone-welcome"');
  }
});

test("personal profile remains lightweight and stable in a mobile lab run", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await page.addInitScript(() => {
    const target = window as Window & { __profileVitals?: { lcp: number; cls: number } };
    target.__profileVitals = { lcp: 0, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) target.__profileVitals!.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) target.__profileVitals!.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch { /* browser metric support is recorded separately from page access */ }
  });
  await page.goto("/oliver-stille");
  await expect(page.getByRole("heading", { name: "Oliver Stille", level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    const state = (window as Window & { __profileVitals?: { lcp: number; cls: number } }).__profileVitals;
    return {
      lcpMs: state?.lcp ?? 0,
      cls: state?.cls ?? 0,
      fcpMs: paint?.startTime ?? 0,
      domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? 0,
      threeJsRequested: performance.getEntriesByType("resource").some((entry) => /three(?:\.module)?\.js|BrainFlight/i.test(entry.name)),
      horizontalOverflowPx: document.documentElement.scrollWidth - innerWidth,
    };
  });
  await test.info().attach("mobile-profile-lab-metrics.json", { body: JSON.stringify(metrics, null, 2), contentType: "application/json" });
  expect(metrics.lcpMs).toBeGreaterThan(0);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.threeJsRequested).toBe(false);
  expect(metrics.horizontalOverflowPx).toBeLessThanOrEqual(1);
});
