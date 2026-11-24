import { test, expect } from "@playwright/test";

test("Swedish contact form is localized and retains its API contract", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/contact", async route => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/sv/contact");
  await page.getByLabel("Namn *").fill("Test Person");
  await page.getByLabel("E-post *").fill("test@example.com");
  await page.getByLabel("Ämne").selectOption("AI development project");
  await page.getByLabel("Meddelande *").fill("Jag vill diskutera ett projekt.");
  await page.getByRole("checkbox", { name: /Jag godkänner/ }).check();
  await page.getByRole("button", { name: "Skicka meddelande" }).click();
  await expect(page.getByRole("status")).toContainText("Meddelande mottaget");
  expect(body).toMatchObject({ subject: "AI development project", consent: true, email: "test@example.com" });
});

test("Swedish contact failure is visible and keeps the draft", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
  await page.route("**/api/contact", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"not_configured"}' }));
  await page.goto("/sv/contact");
  await page.getByLabel("Namn *").fill("Test Person");
  await page.getByLabel("E-post *").fill("test@example.com");
  await page.getByLabel("Meddelande *").fill("Ett meddelande");
  await page.getByRole("checkbox", { name: /Jag godkänner/ }).check();
  await page.getByRole("button", { name: "Skicka meddelande" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("inte konfigurerat");
  await expect(page.getByLabel("Meddelande *")).toHaveValue("Ett meddelande");
});

test("Labs draft is transferred only on request and never sent automatically", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
  let submissions = 0;
  await page.route("**/api/contact", async route => { submissions++; await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await page.goto("/sv/labs");
  const workshop = page.locator(".labs-brief");
  const send = workshop.getByRole("button", { name: "Ta utkastet till kontaktformuläret" });
  await expect(send).toBeDisabled();
  await workshop.getByLabel("Vad vill du lösa?").fill("En privat projektidé");
  await send.click();
  await expect(page).toHaveURL(/\/sv\/contact$/);
  const form = page.locator("form");
  const msg = page.getByLabel("Meddelande *");
  await expect(form.getByText("En privat projektidé")).toBeVisible();
  await expect(msg).toHaveValue("");
  await msg.fill("Behåll min egen text");
  page.once("dialog", dialog => dialog.dismiss());
  await form.getByRole("button", { name: "Använd utkastet" }).click();
  await expect(msg).toHaveValue("Behåll min egen text");
  await expect(form.getByText("En privat projektidé")).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await form.getByRole("button", { name: "Använd utkastet" }).click();
  await expect(msg).toHaveValue(/En privat projektidé/);
  await expect(form.getByText("Utkast från idéverkstaden")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("stilledev:labs-brief-handoff:v1"))).toBeNull();
  expect(submissions).toBe(0);
  await page.reload();
  await expect(form.getByText("Utkast från idéverkstaden")).toHaveCount(0);
});

test("idea handoff offers manual fallback when session storage is blocked", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
  await page.goto("/labs");
  const workshop = page.locator(".labs-brief");
  await workshop.getByLabel("What would you like to solve?").fill("A local draft");
  await page.evaluate(() => { Object.defineProperty(window, "sessionStorage", { configurable: true, get() { throw new Error("blocked"); } }); });
  await workshop.getByRole("button", { name: "Take draft to contact form" }).click();
  await expect(workshop.getByRole("alert")).toContainText("Copy it above");
  await expect(workshop.locator("pre")).toContainText("A local draft");
  await expect(page).toHaveURL(/\/labs$/);
});

test("English phone can review and remove a transferred draft", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 640 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
  await page.goto("/labs");
  await page.locator(".labs-brief").getByLabel("Who is it for?").fill("My team");
  await page.getByRole("button", { name: "Take draft to contact form" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByText("Draft from the idea workshop")).toBeVisible();
  await expect(page.locator("form pre")).toContainText("My team");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Remove draft" }).click();
  await expect(page.getByText("Draft from the idea workshop")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("stilledev:labs-brief-handoff:v1"))).toBeNull();
  await expect(page.getByLabel("Message *")).toHaveValue("");
  await context.close();
});
