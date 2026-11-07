import { test, expect, type Page } from "@playwright/test";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const android = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
async function quiet(page: Page) {
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("budai-buddy-popup-dismissed", "true"); sessionStorage.setItem("budai:cinematic-intro:v1", "1"); });
}

test("Builder introduces Oliver and links to the Labs holding page in both languages", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [path, button] of [["/", /Enter Labs/i], ["/sv", /Öppna Labs/i]] as const) {
    await page.goto(`${path}#stilledev-labs`);
    const person = page.locator(".builder-heading .builder-byline");
    await expect(person).toBeVisible();
    await expect(person).toContainText(/Oliver Stille/i); await expect(person).toContainText(/Helsingborg/i);
    await expect(person).toContainText("SkandiaMäklarna"); await expect(person).toContainText("STILLEDEV EF");
    await expect(page.locator(".builder-person")).toHaveCount(0);
    const portal = page.locator("#stilledev-labs");
    await expect(portal.getByRole("link", { name: button })).toHaveAttribute("href", path === "/sv" ? "/sv/labs" : "/labs");
    await expect(page.locator("nav").getByRole("link", { name: /Labs/ }).first()).toBeAttached();
  }
});

test("Labs is a bilingual holding page with no previous projects or links", async ({ page, request }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sv/labs");
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.getByRole("heading", { name: /Något kul.*är på gång/ })).toBeVisible();
  await expect(page.locator(".labs-wait")).toContainText("UNDER UTVECKLING");
  await expect(page.locator(".labs-wait")).toContainText("STILLEDEV EF");
  await expect(page.locator(".labs-bot-fallback")).toBeVisible();
  await expect(page.locator(".labs-bot canvas")).toHaveCount(0);
  for (const old of ["StilleAffe", "Harvis", "Julia Stille Real Estate", "Anna’s Second Brain", "AI Video Studio"]) await expect(page.locator(".labs-wait")).not.toContainText(old);
  await expect(page.locator(".labs-wait video, .labs-wait #projects, .labs-wait #services")).toHaveCount(0);
  await expect(page.locator(".labs-wait a")).toHaveCount(5);
  await page.getByRole("group", { name: "Språk" }).getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /Something good.*is brewing/ })).toBeVisible();
  await expect(page.locator(".labs-wait-cta")).toHaveText(/Back to Builder/);
  await page.locator(".labs-wait-cta").click(); await expect(page).toHaveURL(/\/#stilledev-labs$/);
  await expect(page.locator("#stilledev-labs")).toBeVisible();
  for (const asset of ["julia.mp4", "harvis-concept.mp4", "labs-atmosphere.jpg"]) expect((await request.get(`/labs-media/${asset}`)).status()).toBe(404);
});

test("holding page metadata reflects the temporary state", async ({ request }) => {
  for (const path of ["/labs", "/sv/labs"]) {
    const response = await request.get(path); expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('name="robots" content="noindex, follow"');
    expect(html).toContain('hrefLang="en"'); expect(html).toContain('hrefLang="sv"');
    expect(html).not.toContain("Julia Stille Real Estate"); expect(html).not.toContain("Harvis");
  }
});

test("holding page layout fits narrow, tablet and desktop windows", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/labs");
  for (const width of [320, 360, 390, 600, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${width}px`).toBeLessThanOrEqual(1);
    await expect(page.locator(".labs-wait-cta")).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "test-results/labs-holding-desktop.png" });
});

test("animated 3D has a graceful fallback and no client errors", async ({ page }) => {
  await quiet(page); const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/labs"); await expect(page.locator(".labs-bot")).toBeVisible();
  await page.waitForTimeout(1800);
  expect(await page.locator(".labs-bot canvas").count() || await page.locator(".labs-bot-fallback").isVisible()).toBeTruthy();
  await page.screenshot({ path: "test-results/labs-holding-3d.png" });
  expect(errors).toEqual([]);
});

test("save-data uses the static mascot", async ({ page }) => {
  await quiet(page); await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.goto("/labs"); await expect(page.locator(".labs-bot-fallback")).toBeVisible(); await expect(page.locator(".labs-bot canvas")).toHaveCount(0);
});

for (const ua of [iphone, android]) {
  test(`phones get a usable Playground and desktop notice (${ua.includes("iPhone") ? "iPhone" : "Android"})`, async ({ browser, request }) => {
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage(); await quiet(page);
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/sv", "/labs", "/sv/labs"]) {
      const response = await page.goto(route); expect(response?.headers()["cache-control"]).toMatch(/private|no-store/i);
      await expect(page.locator(".phone-welcome")).toBeVisible();
      await expect(page.locator("#playground")).toBeVisible();
      await expect(page.locator(".labs-wait, .builder-byline, nav, [data-playground-bridge]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    }
    await expect(page.getByRole("heading", { name: /Stor sajt.*Liten skärm/ })).toBeVisible();
    await expect(page.locator(".phone-desktop-notice")).toContainText("Dator behövs för resten");
    await page.locator(".phone-languages").getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Big site.*Little screen/ })).toBeVisible();
    await expect(page.locator(".phone-desktop-notice")).toContainText("Computer needed for the rest");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.screenshot({ path: `test-results/phone-${ua.includes("iPhone") ? "iphone" : "android"}.png` });
    for (const width of [320, 360, 390, 414]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px`).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const requests: unknown[] = [];
    await page.route("**/api/playground", async route => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: "text/plain", body: 'A pocket-sized answer.\u0000{"memory":null}' });
    });
    await page.getByRole("link", { name: "Open Playground" }).click();
    const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
    await expect(input).toBeVisible();
    await input.fill("Hello from my phone");
    await page.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(page.locator("#playground").getByText("A pocket-sized answer.", { exact: true })).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(JSON.stringify(requests[0])).toContain("Hello from my phone");
    await expect(input).toHaveValue("");
    expect(await input.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Your BudAI" })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("button", { name: "Expand Playground" }).click();
    await expect(page.getByRole("button", { name: "Minimize Playground" })).toBeVisible();
    await expect(page.locator("#playground").getByText("A pocket-sized answer.", { exact: true })).toBeVisible();
    // Simulate a mobile keyboard changing the visual viewport, not the layout viewport.
    await page.evaluate(() => {
      const vv = window.visualViewport!;
      Object.defineProperty(vv, "height", { configurable: true, value: 544 });
      Object.defineProperty(vv, "offsetTop", { configurable: true, value: 0 });
      vv.dispatchEvent(new Event("resize"));
    });
    await expect(page.locator("html")).toHaveAttribute("data-pg-keyboard", "open");
    const inputBox = await input.boundingBox();
    expect(inputBox && inputBox.y + inputBox.height).toBeLessThanOrEqual(545);
    await page.evaluate(() => { Reflect.deleteProperty(window.visualViewport!, "height"); window.visualViewport!.dispatchEvent(new Event("resize")); });
    await page.getByRole("button", { name: "Minimize Playground" }).click();
    await expect(page.locator('#playground a[href="#capabilities"]')).toHaveCount(0);
    await page.locator(".phone-footer").getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/legal\/privacy$/);
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    await page.getByRole("link", { name: "Back to BudAI" }).click();
    await expect(page.locator("#playground")).toBeVisible();
    await page.getByRole("button", { name: "Cookie settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("link", { name: "More" }).click();
    await expect(page).toHaveURL(/\/legal\/cookies$/);
    await expect(page.getByRole("heading", { name: "Cookie Policy" })).toBeVisible();
    for (const host of ["stilledev.se", "www.stilledev.se", "preview.vercel.app", "localhost:3000"]) {
      const response = await request.get("/labs", { headers: { host, "user-agent": ua } });
      const html = await response.text(); expect(html).toContain("phone-welcome"); expect(html).not.toContain("labs-wait-shell");
      expect(response.headers()["cache-control"]).toMatch(/private|no-store/i);
    }
    const api = await request.post("/api/playground", { headers: { "user-agent": ua }, data: {} });
    expect(api.status()).not.toBe(403); expect(await api.json()).not.toMatchObject({ code: "desktop_only" });
    expect(errors).toEqual([]);
    await context.close();
  });
}

test("tablet and bot user agents retain the desktop site", async ({ request }) => {
  for (const ua of ["Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]) {
    const response = await request.get("/labs", { headers: { "user-agent": ua } });
    const html = await response.text(); expect(html).toContain("labs-wait-shell"); expect(html).not.toContain('class="phone-welcome"');
  }
});

test("footer navigation is concise, real and localized in both languages", async ({ page, request }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [path, groupLabels, banned, expectedLab] of [
    ["/", ["Product", "Company", "Legal"], ["Plans", "Projects", "Pricing"], "/labs"],
    ["/sv", ["Produkt", "Företag", "Juridik"], ["Paket", "Projekt", "Priser"], "/sv/labs"],
  ] as const) {
    await page.goto(path); const footer = page.locator("#continuation");
    for (const name of groupLabels) await expect(footer.getByRole("navigation", { name, exact: true })).toBeAttached();
    for (const name of banned) await expect(footer.getByRole("link", { name, exact: true })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: "Labs", exact: true })).toHaveAttribute("href", expectedLab);
    await expect(footer).toContainText("Stilledev EF");
    const links = await footer.locator("nav a").evaluateAll(nodes => nodes.map(node => node.getAttribute("href") || ""));
    expect(new Set(links).size).toBe(links.length);
    for (const link of links) {
      if (link.startsWith("#")) expect(await page.locator(link).count(), `${path} ${link}`).toBeGreaterThan(0);
      else if (link.startsWith("/")) expect((await request.get(link)).status(), `${path} ${link}`).toBe(200);
      else expect(link).toMatch(/^mailto:/);
    }
  }
  // Legal links lead directly to the full policy rather than a second, potentially stale summary.
  await page.locator("#continuation").getByRole("link", { name: "Integritetspolicy", exact: true }).click();
  await expect(page).toHaveURL(/\/legal\/privacy$/);
  await expect(page.getByRole("heading", { name: "Integritetspolicy" })).toBeVisible();
});

test("footer health wording only describes the server ping", async ({ page }) => {
  await quiet(page); await page.route("**/api/health", route => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await page.goto("/");
  await expect(page.locator("#continuation")).toContainText("Server responding");
  await expect(page.locator("#continuation")).not.toContainText("All systems operational");
});


test("the compact Builder introduction fits above its controls at desktop and tablet widths", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/#about");
    await expect(page.locator(".builder-byline")).toBeVisible();
    const intro = await page.locator(".builder-byline").boundingBox();
    const controls = await page.locator(".reality-creation-pills").boundingBox();
    expect(intro && controls && intro.y + intro.height <= controls.y, `${width}px`).toBeTruthy();
    expect(intro && intro.x >= 0 && intro.x + intro.width <= width + 1, `${width}px`).toBeTruthy();
    if (width === 1440) { await page.locator(".builder-heading").scrollIntoViewIfNeeded(); await page.screenshot({ path: "test-results/builder-compact.png" }); }
  }
});

test("Builder shortcuts are real keyboard buttons and keep the Labs status clear", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/#about");
  const shortcuts = page.locator("[data-thought-to-reality]");
  await expect(shortcuts.getByRole("button")).toHaveCount(4);
  await page.evaluate(() => { (window as Window & { __builderPrompt?: string }).__builderPrompt = ""; window.addEventListener("budai:prompt", event => { (window as Window & { __builderPrompt?: string }).__builderPrompt = (event as CustomEvent<string>).detail; }); });
  const button = shortcuts.getByRole("button", { name: /Website interface/ });
  await button.focus(); await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as Window & { __builderPrompt?: string }).__builderPrompt)).toContain("React");
  await expect(page.locator("#stilledev-labs")).toContainText("UNDER DEVELOPMENT");
});

test("homepage stays within the viewport at common desktop and tablet widths", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [768, 834, 900, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px`).toBeLessThanOrEqual(1);
  }
});

test("footer social links have comfortable targets and keyboard focus", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/#continuation");
  const footer = page.locator("#continuation");
  for (const label of ["GitHub", "Discord", "LinkedIn", "Email"]) {
    const link = footer.getByRole("link", { name: label, exact: true });
    const bounds = await link.boundingBox(); expect(bounds?.width).toBeGreaterThanOrEqual(44); expect(bounds?.height).toBeGreaterThanOrEqual(44);
    await link.focus(); await expect(link).toBeFocused();
  }
});

test("Builder examples protect unsent drafts and never send a request", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/#playground");
  const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  let requests = 0; page.on("request", req => { if (req.url().endsWith("/api/playground")) requests++; });
  await input.fill("Keep this draft");
  const shortcut = page.locator("[data-thought-to-reality]").getByRole("button", { name: /Website interface/ });
  page.once("dialog", dialog => dialog.dismiss());
  await shortcut.click(); await expect(input).toHaveValue("Keep this draft");
  await input.fill("");
  await shortcut.click(); await expect(input).toHaveValue(/type-safe React/);
  await page.waitForTimeout(600); expect(requests).toBe(0);
  const labsHeading = page.locator("#stilledev-labs").getByRole("heading", { name: "Labs.", exact: true });
  await expect(labsHeading).toBeVisible();
});


test("Labs offers a clear return to Builder in Swedish", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/sv/labs");
  await expect(page.locator(".labs-wait-cta")).toHaveAttribute("href", "/sv#stilledev-labs");
  await page.locator(".labs-wait-cta").click(); await expect(page).toHaveURL(/\/sv#stilledev-labs$/);
  await expect(page.locator("#stilledev-labs").getByRole("heading", { name: "Labs." })).toBeVisible();
});

test("the static Builder scene does not overlap the heading on desktop", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/#about");
    const heading = await page.locator(".builder-heading").boundingBox();
    const monitor = await page.locator(".fallback-central-screen").boundingBox();
    expect(heading && monitor && heading.y + heading.height <= monitor.y, `${width}px`).toBeTruthy();
  }
});
