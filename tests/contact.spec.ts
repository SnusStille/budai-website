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
