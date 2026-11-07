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
