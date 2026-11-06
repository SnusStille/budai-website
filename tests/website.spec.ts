import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
  });
  await page.route("**/*.supabase.co/**", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Database unavailable in browser QA" }) }));
});

test("company-first homepage leads to the actual product without the retired cinematic gate", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A workspace that thinks with you.");
  await expect(page.getByText("BUDAI BY STILLEDEV", { exact: false }).first()).toBeVisible();
  await expect(page.locator("#intelligence").getByRole("link", { name: "About Stilledev", exact: true })).toHaveAttribute("href", "/about");
  await expect(page.locator(".v2-product-screenshot img")).toHaveAttribute("alt", /real BudAI Playground/);
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await expect(page.locator("#brain-story, #experience-story")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro", "done");
  await expect(page.locator(".v2-neural-canvas")).toHaveCount(0);
  await expect(page.locator(".v2-neural-poster img")).toBeVisible();
  await page.getByRole("link", { name: "Explore BudAI", exact: true }).click();
  await expect(page).toHaveURL(/#playground$/);
  await expect(page.getByRole("textbox", { name: "Message BudAI", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("all public destinations resolve with localized metadata and no placeholder links", async ({ page, request }) => {
  const routes = {
    "/budai": "A clearer way to move work forward.",
    "/roadmap": "What’s real. What’s next.",
    "/knowledge": "Understand the workspace.",
    "/labs": "Products, experiments and what comes next.",
    "/about": "Independent software & AI development.",
    "/feedback": "Help build what matters next.",
    "/changelog": "Progress, documented honestly.",
  } as const;
  for (const [route, heading] of Object.entries(routes)) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.locator(".site-navigation")).toBeVisible();
    await expect(page.locator("#continuation")).toBeVisible();
    await expect(page.locator('a[href="#"], a[href=""]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route}$`));
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const route of Object.keys(routes)) expect(sitemap).toContain(route);
  const legacy = await request.get("/whats-new", { maxRedirects: 0 });
  expect([307, 308]).toContain(legacy.status());
  expect(legacy.headers().location).toBe("/changelog");
});

test("product captures use keyboard tabs and launch the real composer, not a demo", async ({ page }) => {
  await page.goto("/");
  const workspace = page.getByRole("tab", { name: "Workspace", exact: true });
  await workspace.click();
  await expect(workspace).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Keep the thinking. Finish the work.");
  await workspace.press("ArrowRight");
  const memory = page.getByRole("tab", { name: "Memory & control", exact: true });
  await expect(memory).toBeFocused();
  await expect(memory).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Useful context, under your control.");
  await page.getByRole("button", { name: "Try a workflow", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Message BudAI", exact: true })).toHaveValue("Help me describe how I prefer your answers to be structured and written.");
});

test("roadmap separates verified live work, development and plans without launch promises", async ({ page }) => {
  await page.goto("/roadmap");
  const main = page.locator("main");
  await expect(main.locator(".v2-roadmap-group")).toHaveCount(3);
  await expect(main.getByRole("heading", { name: "Live", exact: true })).toBeVisible();
  await expect(main.getByRole("heading", { name: "In development", exact: true })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Planned", exact: true })).toBeVisible();
  await expect(main).toContainText("Bilingual AI conversations");
  await expect(main).toContainText("Individual paid plan");
  await expect(main).toContainText("Team governance");
  const copy = await main.innerText();
  expect(copy).not.toMatch(/Q[1-4]\s+20\d\d|launch(?:es|ing)?\s+(?:in|on)\s+20\d\d/i);
  await main.getByRole("link", { name: "Send feedback", exact: true }).click();
  await expect(page).toHaveURL(/\/feedback$/);
});

test("Knowledge Center search, empty state, reset and Swedish answers work", async ({ page }) => {
  await page.goto("/knowledge");
  const search = page.getByRole("searchbox", { name: "Search the Knowledge Center", exact: true });
  await search.fill("Research");
  await expect(page.getByRole("heading", { name: "How BudAI works", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI models", exact: true })).toHaveCount(0);
  await expect(page.getByText(/results for “Research”/)).toBeVisible();
  await search.fill("no-such-knowledge-topic-123");
  await expect(page.getByRole("heading", { name: "No results", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show all topics", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("heading", { name: "AI models", exact: true })).toBeVisible();
  await page.locator(".site-navigation").getByRole("button", { name: "SV", exact: true }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Förstå arbetsytan.");
  await expect(page.getByText("Gästläget inkluderar 12 meddelanden per dag", { exact: false })).toBeAttached();
});

test("feedback portal submits feature requests and exposes honest failure and email fallback", async ({ page }) => {
  let fail = false;
  let submitted: { kind?: string; message?: string; page?: string } = {};
  await page.route("**/api/feedback", async route => {
    submitted = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({ status: fail ? 429 : 200, contentType: "application/json", body: JSON.stringify(fail ? { error: "Rate limited" } : { ok: true }) });
  });
  await page.goto("/feedback");
  await page.getByRole("button", { name: "Feature request", exact: true }).click();
  await page.getByRole("textbox", { name: "Describe the problem, suggestion or workflow", exact: true }).fill("Add a browser regression workflow for the public Knowledge Center.");
  await page.locator("main").getByRole("button", { name: "Send feedback", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Thank you for the feedback.", exact: true })).toBeVisible();
  expect(submitted).toEqual({ kind: "feature", message: "Add a browser regression workflow for the public Knowledge Center.", page: "/feedback" });
  fail = true;
  await page.getByRole("button", { name: "Send another", exact: true }).click();
  await page.getByRole("button", { name: "Bug report", exact: true }).click();
  await page.getByRole("textbox", { name: "Describe the problem, suggestion or workflow", exact: true }).fill("A controlled failure verifies the fallback.");
  await page.locator("main").getByRole("button", { name: "Send feedback", exact: true }).click();
  await expect(page.locator(".v2-feedback-error")).toContainText("Too many submissions");
  await expect(page.getByRole("link", { name: "Use email instead", exact: true })).toHaveAttribute("href", /mailto:Stilleinc@hotmail.com/);
  await expect(page.getByRole("heading", { name: "Thank you for the feedback.", exact: true })).toHaveCount(0);
});

test("feedback modal, quick changelog peek and command palette remain keyboard usable", async ({ page }) => {
  await page.goto("/");
  const fab = page.getByRole("button", { name: "Send feedback", exact: true });
  await fab.click();
  const feedback = page.getByRole("dialog", { name: "Your feedback shapes what gets better.", exact: true });
  await expect(feedback).toBeVisible();
  expect(await feedback.evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(feedback).toHaveCount(0);
  await expect(fab).toBeFocused();
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "Command palette", exact: true });
  await expect(palette).toBeVisible();
  await palette.getByRole("button", { name: /What’s new|What's new/ }).click();
  const peek = page.getByRole("dialog", { name: /What.s new/ });
  await expect(peek).toBeVisible();
  await peek.getByRole("link", { name: "View the full changelog", exact: true }).click();
  await expect(page).toHaveURL(/\/changelog$/);
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".v2-release")).toHaveCount(1);
  await page.getByRole("button", { name: "Fixes", exact: true }).click();
  await expect(page.locator(".v2-release")).toHaveCount(1);
  await page.getByRole("button", { name: "All updates", exact: true }).click();
  expect(await page.locator(".v2-release").count()).toBeGreaterThanOrEqual(3);
});

test("mobile navigation, language switch and layouts remain usable at narrow widths", async ({ page }) => {
  for (const width of [320, 390, 768, 900]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu", exact: true });
  await toggle.click();
  await expect(page.locator(".v2-menu-toggle")).toHaveAttribute("aria-expanded", "true");
  const mobile = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
  await expect(mobile).toBeVisible();
  expect(await mobile.evaluate(menu => menu.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
  await page.locator(".site-navigation").getByRole("button", { name: "SV", exact: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("En arbetsyta som tänker med dig.");
  await page.getByRole("button", { name: "Öppna meny", exact: true }).click();
  await page.getByRole("navigation", { name: "Mobilnavigation", exact: true }).getByRole("link", { name: /Kunskap/ }).click();
  await expect(page).toHaveURL(/\/knowledge$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Förstå arbetsytan.");
});

test("WebGL failure retains the product hero and static neural poster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes("webgl")) return null;
      return original.call(this, type, ...args as []);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.locator(".v2-neural-poster img")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore BudAI", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message BudAI", exact: true })).toBeVisible();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});
