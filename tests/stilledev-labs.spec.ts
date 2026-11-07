import { test, expect, type Page } from "@playwright/test";

async function quietChrome(page: Page) {
  await page.route("**/va.vercel-scripts.com/**", (r) =>
    r.fulfill({ contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/insights/**", (r) =>
    r.fulfill({ contentType: "application/javascript", body: "" })
  );
  await page.addInitScript(() => {
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
  });
}

test("Stilledev Labs integrates inside Builder (#about) with founder, studio, projects, contact, and honest company details", async ({
  page,
}) => {
  await quietChrome(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/#stilledev-labs");
  const labs = page.locator("#stilledev-labs");
  await expect(labs).toBeVisible();

  // Naturally integrated inside #about right below #builder-scene
  expect(
    await page.evaluate(() => {
      const about = document.getElementById("about");
      const scene = document.getElementById("builder-scene");
      const labsEl = document.getElementById("stilledev-labs");
      return (
        !!about &&
        !!scene &&
        !!labsEl &&
        about.contains(labsEl) &&
        Boolean(scene.compareDocumentPosition(labsEl) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    })
  ).toBe(true);

  // A. Meet the founder — Oliver Stille
  const founder = labs.locator("#builder-profile");
  await expect(founder).toContainText("Oliver Stille");
  await expect(founder).toContainText("Founder behind Stilledev");
  await expect(founder).toContainText("Sweden");

  // Existing Builder code example drawer remains intact and interactive
  const details = founder.locator("details.builder-source-details");
  await details.locator("summary").click();
  await expect(details.locator("pre")).toContainText('builtBy: "Stilledev"');

  // B. About Stilledev — Sole proprietorship + 5 domains
  const studio = labs.locator("#about-stilledev");
  await expect(studio).toContainText("Enskild firma");
  await expect(studio.locator(".labs-domain-card")).toHaveCount(5);

  // C. Stilledev Projects — BudAI, StilleAffe, Anna's Second Brain
  const projects = labs.locator("#stilledev-projects");
  await expect(projects.locator(".labs-project-card")).toHaveCount(3);
  await expect(projects.getByRole("heading", { name: "BudAI", exact: true })).toBeVisible();
  await expect(projects.getByRole("heading", { name: "StilleAffe", exact: true })).toBeVisible();
  await expect(projects.getByRole("heading", { name: "Anna's Second Brain", exact: true })).toBeVisible();

  // Verified project links & honest private system indicator
  await expect(projects.locator('a[href="#playground"]')).toHaveCount(1);
  await expect(projects.locator('a[href="https://stilleaffe.vercel.app"]')).toHaveCount(1);
  await expect(projects.locator('a[href="https://github.com/SnusStille/budai-website"]')).toHaveCount(1);
  await expect(projects.locator('a[href="https://github.com/SnusStille/Stilleaffe"]')).toHaveCount(1);
  await expect(projects).toContainText("Private platform · no public link");

  // D. Contact & Connect — verified email, Stilledev, GitHub, LinkedIn
  const contact = labs.locator("#stilledev-contact");
  await expect(contact.locator('a[href="mailto:Stilleinc@hotmail.com"]').first()).toBeVisible();
  await expect(contact.locator('a[href="https://stilledev.se"]')).toBeVisible();
  await expect(contact.locator('a[href="https://github.com/SnusStille"]')).toBeVisible();
  await expect(
    contact.locator('a[href="https://www.linkedin.com/in/oliver-stille-8bb48a403/"]')
  ).toBeVisible();

  // E. Company Information — honest verified details, zero invented org numbers
  const company = labs.locator("#stilledev-company");
  await expect(company).toContainText("Stilledev");
  await expect(company).toContainText("Enskild firma");
  await expect(company).toContainText("Oliver Stille");
  await expect(company).toContainText("Digital development, AI & software");
  await expect(company).toContainText("Sweden");
  const companyText = await company.innerText();
  expect(companyText).not.toMatch(/\b\d{6}-\d{4}\b/);

  expect(errors).toEqual([]);
});

test("Stilledev Labs localizes cleanly to Swedish (/sv and language toggle) and works with navigation + ⌘K", async ({
  page,
}) => {
  await quietChrome(page);
  await page.goto("/sv#stilledev-labs");

  const labs = page.locator("#stilledev-labs");
  await expect(labs).toContainText("Grundare bakom Stilledev.");
  await expect(labs).toContainText("AI-utveckling & AI-integrationer");
  await expect(labs).toContainText("Dashboard & försäljningsverktyg");
  await expect(labs).toContainText("Privat plattform · ingen publik länk");
  await expect(labs).toContainText("Digital utveckling, AI och mjukvara");
  await expect(labs).toContainText("Enskild firma");

  // Navbar includes Stilledev Labs link
  await expect(page.locator(".site-navigation a[href='#stilledev-labs']").first()).toBeVisible();

  // Footer includes Stilledev Labs link
  await expect(page.locator("#continuation a[href='#stilledev-labs']")).toBeVisible();

  // Command palette includes Stilledev Labs
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "Kommandopalett", exact: true });
  await expect(palette).toBeVisible();
  await palette.locator("input").fill("Stilledev Labs");
  await expect(palette.getByText(/Stilledev Labs/)).toBeVisible();
  await page.keyboard.press("Escape");
});

test("Stilledev Labs maintains responsive layout and zero horizontal overflow across mobile, tablet, and desktop", async ({
  page,
}) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#stilledev-labs");

  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#stilledev-labs").scrollIntoViewIfNeeded();
    await expect(page.locator("#stilledev-labs")).toBeVisible();
    await expect(page.locator("#stilledev-projects .labs-project-card")).toHaveCount(3);
    const labsMetrics = await page.evaluate(() => {
      const vw = window.innerWidth;
      const labs = document.getElementById("stilledev-labs")!;
      const nav = document.querySelector(".site-navigation") as HTMLElement;
      const sections = [
        "#builder-profile",
        "#about-stilledev",
        "#stilledev-projects",
        "#stilledev-contact",
        "#stilledev-company",
      ];
      const sectionOutOfBounds = sections.some((sel) => {
        const el = labs.querySelector(sel);
        if (!el) return true;
        const r = el.getBoundingClientRect();
        return r.left < -1 || r.right > vw + 1;
      });
      return {
        labsScrollDelta: labs.scrollWidth - labs.clientWidth,
        navScrollDelta: nav ? nav.scrollWidth - nav.clientWidth : 0,
        sectionOutOfBounds,
        docOverflow: document.documentElement.scrollWidth - vw,
      };
    });
    expect(labsMetrics.labsScrollDelta, `labs scroll overflow at ${width}px`).toBeLessThanOrEqual(1);
    expect(labsMetrics.navScrollDelta, `nav scroll overflow at ${width}px`).toBeLessThanOrEqual(1);
    expect(labsMetrics.sectionOutOfBounds, `labs section out-of-bounds at ${width}px`).toBe(false);
    if (width < 768 || width >= 1280) {
      expect(labsMetrics.docOverflow, `document horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("Labs instruments, previews and inquiry composer respond to real input", async ({ page }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value: string) => { (window as unknown as { copied: string }).copied = value; } }, configurable: true });
    window.addEventListener("budai:prompt", (event) => { (window as unknown as { promptValue: string }).promptValue = (event as CustomEvent<string>).detail; });
  });
  await page.goto("/#stilledev-labs");
  const labs = page.locator("#stilledev-labs");
  const dock = labs.locator("[data-labs-dock]");
  await expect(dock.locator(".labs-clock-chip")).toContainText(/SE · \d\d:\d\d/);
  await labs.locator("#builder-profile").scrollIntoViewIfNeeded();
  await expect(dock.locator('a[href="#builder-profile"]')).toHaveAttribute("aria-current", "location");
  const workflow = labs.getByRole("group", { name: "Engineering phases" });
  await workflow.getByRole("button", { name: /Architecture/ }).click();
  await expect(workflow.getByRole("button", { name: /Architecture/ })).toHaveAttribute("aria-pressed", "true");
  await expect(labs.locator(".labs-workflow-readout")).toContainText("Supabase");
  await workflow.getByRole("button", { name: /Shipped product/ }).click();
  await expect(labs.locator(".labs-workflow-readout")).toContainText("Playwright E2E");
  const details = labs.locator("details.builder-source-details");
  await details.locator("summary").click();
  const source = await details.locator(".labs-code-line > span:last-child").allTextContents();
  const { EXAMPLE_SOURCE } = await import("../lib/experience/code");
  expect(source.join("")).toBe(EXAMPLE_SOURCE);
  await details.getByRole("button", { name: "Copy TS" }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(EXAMPLE_SOURCE);

  await labs.getByRole("link", { name: "Test architecture prompt in BudAI" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { promptValue: string }).promptValue)).toContain("streaming AI assistant");
  const projects = labs.locator("#stilledev-projects");
  const filters = projects.getByRole("group", { name: "Filter projects" });
  await filters.getByRole("button", { name: /Private Systems/ }).click();
  await expect(projects.locator(".labs-project-card")).toHaveCount(1);
  await expect(projects).toContainText("Anna's Second Brain");
  await filters.getByRole("button", { name: /Public Live/ }).click();
  await expect(projects.locator(".labs-project-card")).toHaveCount(2);
  await filters.getByRole("button", { name: /^All/ }).click();
  const budai = projects.locator(".labs-project-card").filter({ has: page.getByRole("heading", { name: "BudAI", exact: true }) });
  await budai.getByRole("button", { name: "SV", exact: true }).click();
  await expect(budai).toContainText("minne: användarstyrt");
  await budai.getByRole("button", { name: "Architecture", exact: true }).click();
  await expect(budai.locator(".labs-project-arch-list li")).not.toHaveCount(0);
  await budai.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(budai.locator(".labs-project-arch-list")).toHaveCount(0);
  const affe = projects.locator(".labs-project-card").filter({ has: page.getByRole("heading", { name: "StilleAffe", exact: true }) });
  await affe.getByRole("button", { name: /Manager/ }).click();
  await expect(affe).toContainText("TEAM VIEW · COACHING");
  const brain = projects.locator(".labs-project-card").filter({ has: page.getByRole("heading", { name: "Anna's Second Brain", exact: true }) });
  await brain.getByRole("button", { name: "Context", exact: true }).click();
  await expect(brain.locator(".labs-brain-readout")).toContainText("Long-term memory");
  await expect(brain).toContainText("Illustrative preview · sample data");
  const composer = labs.locator(".labs-inquiry-composer");
  await composer.getByRole("button", { name: "Partnership" }).click();
  await composer.locator("textarea").fill("A & B: Let's build together!\nNext line.");
  const href = await composer.locator(".labs-composer-send").getAttribute("href");
  const params = new URLSearchParams(href!.split("?")[1]);
  expect(params.get("subject")).toBe("Partnership inquiry — Stilledev");
  expect(params.get("body")).toContain("A & B: Let's build together!\nNext line.");
  await composer.getByRole("button", { name: "Copy brief" }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain("Partnership inquiry — Stilledev");
  await labs.getByRole("button", { name: "Copy company information" }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain("Oliver Stille");
});

test("interactive instruments are localized in Swedish", async ({ page }) => {
  await quietChrome(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sv#stilledev-labs");
  const labs = page.locator("#stilledev-labs");
  await labs.getByRole("group", { name: "Utvecklingsfaser" }).getByRole("button", { name: /Arkitektur/ }).click();
  await expect(labs.locator(".labs-workflow-readout")).toContainText("Supabase");
  await labs.getByRole("button", { name: /Privata system/ }).click();
  await expect(labs.locator(".labs-project-card")).toHaveCount(1);
  await expect(labs.locator(".labs-project-card")).toContainText("Illustrativ förhandsvisning · exempeldata");
  await labs.getByRole("button", { name: "Samarbete", exact: true }).click();
  const href = await labs.locator(".labs-composer-send").getAttribute("href");
  expect(new URLSearchParams(href!.split("?")[1]).get("subject")).toBe("Samarbetsförfrågan — Stilledev");
  await expect(labs.locator("#stilledev-company")).toContainText("Arbetsspråk");
});
