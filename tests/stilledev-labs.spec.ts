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
  await expect(page.getByRole("heading", { name: /Ideas made.*real/i })).toBeVisible();
  const projects = page.locator("#projects");
  await expect(projects.locator(".lab-project-row")).toHaveCount(5);
  for (const name of ["BudAI", "StilleAffe", "Anna’s Second Brain", "Harvis", "Julia Stille Real Estate"]) await expect(projects.locator(".lab-project-list").getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(projects.locator("article a")).toHaveCount(0);
  await expect(projects).toContainText("Project links are kept private");
  await expect(page.locator("#about-labs")).toContainText("Oliver");
  await expect(page.locator("#business")).toContainText("Swedish sole proprietorship");
  await expect(page.locator("#business")).toContainText("payment method");
  await expect(page.locator("#business")).toContainText("GDPR");
  await expect(page.locator("#business")).not.toContainText("limited company");
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
  await expect(page.locator("#business")).toContainText("Svensk enskild firma");
  await expect(page.locator("#business")).toContainText("betalningssätt");
  await expect(page.locator("#business")).toContainText("GDPR");
  await page.getByRole("group", { name: "Språk" }).getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#business")).toContainText("Swedish sole proprietorship");
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
  await expect(page.locator('#business .lab-business-grid a[href^="https://www.skatteverket.se/"]')).toBeVisible();
  await expect(page.locator('#business .lab-business-grid a[href^="https://www.imy.se/"]')).toBeVisible();
  await expect(page.locator('#business')).not.toContainText(/\b\d{6}-\d{4}\b/);
});

test("3D artwork loads when motion is enabled without blocking navigation", async ({ page }) => {
  await quietChrome(page);
  await page.goto("/labs");
  await expect(page.locator(".lab-art")).toBeVisible();
  // A WebGL canvas is optional: the static artwork is the graceful fallback.
  await expect(page.locator(".lab-primary")).toBeVisible();
  await page.locator(".lab-primary").click();
  await expect(page).toHaveURL(/#projects$/);
});


test("featured videos, custom services and legal disclosure are accessible", async ({ page }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/labs");
  const videos = page.locator(".lab-case video");
  await expect(videos).toHaveCount(2);
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("poster", /labs-media/);
    expect(await video.evaluate((node: HTMLVideoElement) => node.paused)).toBeTruthy();
  }
  await expect(page.locator(".lab-screen-caption").first()).toContainText("FICTIONAL DATA");
  await expect(page.locator(".lab-duo-disclaimer")).toContainText("future scenario");
  await expect(page.locator(".lab-case").first()).toContainText("leads");
  await expect(page.locator(".lab-case").nth(1)).toContainText("not a claim of a live integration");
  await expect(page.locator("#services")).toContainText("GTA 5 and Roblox");
  const legal = page.locator("#legal");
  await expect(legal).not.toHaveAttribute("open", "");
  await legal.locator("summary").click();
  await expect(legal).toHaveAttribute("open", "");
  await expect(legal).toContainText("personally responsible");
  await expect(legal).toContainText("not automatically permit");
  await expect(legal).toContainText("To be confirmed");
  await expect(legal).toContainText("direct marketing at any time");
  await expect(legal.locator("a[href^='mailto:']")).toBeVisible();
  await expect(legal.locator(".lab-legal-sources a")).toHaveCount(5);
});

test("homepage Labs is beside the developer attribution and reachable on mobile", async ({ page }) => {
  await quietChrome(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const nav = page.locator(".site-navigation");
  const desktopLabs = nav.getByRole("link", { name: /Labs/ });
  await expect(desktopLabs).toBeVisible();
  await expect(desktopLabs).toHaveAttribute("href", "/labs");
  await expect(nav.locator("a a")).toHaveCount(0);
  await expect(nav.locator("[data-budai-logo]")).toContainText("STILLEDEV");
  await page.setViewportSize({ width: 390, height: 844 });
  await nav.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#mobile-navigation").getByRole("link", { name: "Labs" })).toHaveAttribute("href", "/labs");
});


test("concept videos play when visible and respect a manual pause", async ({ page, request }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const path of ["/labs-media/julia.mp4", "/labs-media/harvis-concept.mp4"]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("video/mp4");
  }
  await page.goto("/labs");
  const video = page.locator(".lab-case video").first();
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2)).toBe(true);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
  await page.locator("#top").scrollIntoViewIfNeeded();
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});


test("canonical-domain phone visitors receive the desktop-first welcome, not the site", async ({ request }) => {
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const android = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";
  for (const path of ["/", "/sv", "/labs", "/sv/labs"]) {
    for (const agent of [iphone, android]) {
      const response = await request.get(path, { headers: { host: "stilledev.se", "user-agent": agent } });
      expect(response.ok()).toBeTruthy();
      expect(response.headers()["cache-control"]).toContain("no-store");
      const html = await response.text();
      expect(html).toContain("Fel branch");
      expect(html).toContain("Om Stilledev");
      expect(html).not.toContain('class="lab-page"');
      expect(html).not.toContain('class="journey-page');
    }
  }
  // Ordinary desktop browsers, tablets, crawlers and the preview host stay unchanged.
  for (const [host, agent] of [["stilledev.se", "Mozilla/5.0 (X11; Linux x86_64) Chrome/120"], ["stilledev.se", "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"], ["stilledev.se", "Mozilla/5.0 (Linux; Android 6.0; Nexus 5X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"], ["preview.vercel.app", iphone]]) {
    const html = await (await request.get("/labs", { headers: { host, "user-agent": agent } })).text();
    expect(html).toContain('class="lab-page"');
  }
});

test("phone welcome preview is readable, expandable, bilingual and has no bypass", async ({ page, request }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 720 });
  const response = await request.get("/phone-preview");
  expect((await response.text())).toContain('name="robots" content="noindex, nofollow"');
  await page.goto("/phone-preview");
  await expect(page.getByRole("heading", { name: /Fel branch/ })).toBeVisible();
  await expect(page.locator(".phone-content")).toContainText("dator");
  await page.getByText("Om Stilledev", { exact: true }).click();
  await expect(page.locator(".phone-about")).toContainText("företagare och privatpersoner");
  await expect(page.locator(".phone-about a[href^='mailto:']")).toBeVisible();
  await expect(page.locator(".phone-welcome a[href='/']")).toHaveCount(0);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Wrong branch/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});


test("local signal composer updates and copies an honest template without an AI request", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const aiRequests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/playground")) aiRequests.push(request.url()); });
  await page.goto("/labs");
  const section = page.locator("#signal-studio");
  await expect(section.getByText(/fixed templates, not AI/i)).toBeVisible();
  await section.getByLabel("What do you want to achieve?").fill("Make client follow-up clearer");
  await section.getByRole("button", { name: "Questions" }).click();
  await expect(section.getByRole("button", { name: "Questions" })).toHaveAttribute("aria-pressed", "true");
  await expect(section.getByLabel(/your starting brief/i)).toHaveValue(/Goal: Make client follow-up clearer[\s\S]*Ask the most useful questions/);
  await section.getByRole("button", { name: "Copy the brief" }).click();
  await expect(section.getByRole("status")).toContainText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Make client follow-up clearer");
  expect(aiRequests).toEqual([]);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("unavailable")) } }));
  await section.getByRole("button", { name: "Copy the brief" }).click();
  await expect(section.getByRole("status")).toContainText("Copy it manually");
  await expect(section.getByLabel(/your starting brief/i)).toBeFocused();
  await expect(section.getByRole("link", { name: /open budai playground/i })).toHaveAttribute("href", "/#playground");
});

test("Swedish experiment and expandable ideas work with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sv/labs");
  const section = page.locator("#signal-studio");
  await section.getByLabel("Vad vill du åstadkomma?").fill("Förbättra kunduppföljningen");
  await section.getByRole("button", { name: "Idéer" }).click();
  await expect(section.getByLabel("DITT UNDERLAG")).toHaveValue(/Mål: Förbättra kunduppföljningen[\s\S]*Föreslå flera/);
  await expect(section.getByText(/fasta mallar, inte AI/)).toBeVisible();
  await expect(page.locator(".lab-art canvas")).toHaveCount(0);
  const note = page.locator("#research details").first();
  await expect(note).not.toHaveAttribute("open", "");
  await note.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(note).toHaveAttribute("open", "");
  await expect(note.locator("p")).toBeVisible();
});

test("new Labs sections fit a phone preview viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/labs");
  await expect(page.locator("#signal-studio")).toBeVisible();
  await expect(page.locator("#research")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});


test("save-data mode keeps the sculpture fallback without creating a WebGL canvas", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } }));
  await page.goto("/labs");
  await expect(page.locator(".lab-art-fallback")).toBeVisible();
  await expect(page.locator(".lab-art canvas")).toHaveCount(0);
});

test("Labs navigation and featured work remain usable at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sv/labs");
  const nav = page.getByRole("navigation", { name: "Labs navigering" });
  await expect(nav.getByRole("link", { name: "Projekt" })).toBeVisible();
  await nav.getByRole("link", { name: "Projekt" }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator("#estate-case video")).toBeVisible();
  await expect(page.locator("#harvis-case video")).toBeVisible();
  await nav.getByRole("link", { name: "Experiment" }).click();
  await expect(page).toHaveURL(/#signal-studio$/);
});
