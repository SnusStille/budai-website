import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("budai_intro_seen", "1"); });
});

test("prepared example and workflows prefill without an AI request, in both languages", async ({ page }) => {
  let requests = 0;
  page.on("request", request => { if (request.url().endsWith("/api/playground")) requests++; });
  await page.goto("/#playground");
  const panel = page.locator("[data-signal-workflows]");
  await panel.getByRole("button", { name: "See an example" }).click();
  await expect(panel.getByText("DRAFT · PREPARED EXAMPLE")).toBeVisible();
  await panel.getByRole("button", { name: "Meeting notes → next steps" }).click();
  await expect(page.getByRole("textbox", { name: "Message BudAI" })).toHaveValue(/Do not invent owners or dates/);
  expect(requests).toBe(0);
  await page.locator(".site-navigation").getByRole("button", { name: "SV", exact: true }).first().click();
  page.once("dialog", dialog => dialog.accept());
  await panel.getByRole("button", { name: "Skriv ett mejl" }).click();
  await expect(page.getByRole("textbox", { name: "Meddelande till BudAI" })).toHaveValue(/ämnesrad/);
  expect(requests).toBe(0);
});

test("research is explicit about no search and workspace actions use the edited selected draft", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = fetch.bind(window);
    (window as any).__requests = [];
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).__requests.push(JSON.parse(String(init?.body)));
      return new Response("# Draft\n\n" + "A structured answer with useful details. ".repeat(20) + '\u0000{"memory":null}', { headers: { "Content-Type": "text/plain" } });
    };
  });
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.getByText(/does not search the web/)).toBeVisible();
  await page.getByRole("textbox", { name: "Message BudAI" }).fill("A question");
  await page.getByRole("button", { name: "Send message" }).click();
  const editor = page.getByRole("textbox", { name: "Edit workspace" });
  await expect(editor).toBeVisible();
  await editor.fill("My edited selected draft");
  await page.getByRole("button", { name: "Improve", exact: true }).click();
  await expect.poll(async () => page.evaluate(() => (window as any).__requests.length)).toBe(2);
  const requests = await page.evaluate(() => (window as any).__requests);
  expect(requests[0].messages.at(-1).content).toContain("without web access");
  expect(requests[1].messages.at(-1).content).toContain("My edited selected draft");
  await expect(editor).toHaveValue("My edited selected draft");
});

test("mobile example and workflow remain usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#playground");
  const panel = page.locator("[data-signal-workflows]");
  await panel.getByRole("button", { name: "See an example" }).click();
  await expect(panel.getByText("DRAFT · PREPARED EXAMPLE")).toBeVisible();
  await panel.getByRole("button", { name: "Write an email" }).click();
  await expect(page.getByRole("textbox", { name: "Message BudAI" })).toHaveValue(/subject line/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("guest rename survives a follow-up and reload", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = fetch.bind(window);
    window.fetch = async (resource, init) => String(resource).endsWith("/api/playground")
      ? new Response('Reply.\u0000{"memory":null}', { headers: { "Content-Type": "text/plain" } })
      : original(resource, init);
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("My initial question");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai-pg-history-v2"))).toContain("My initial question");
  const row = page.getByRole("button", { name: "My initial question", exact: true }).locator("..");
  await row.hover();
  await row.getByRole("button", { name: "Rename chat" }).click();
  await page.locator('input[value="My initial question"]').fill("Important work");
  await page.locator('input[value="Important work"]').press("Enter");
  await expect(page.getByRole("button", { name: "Important work", exact: true })).toBeVisible();
  await input.fill("Follow-up question");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai-pg-history-v2"))).toContain("Follow-up question");
  await page.reload();
  await expect(page.getByRole("button", { name: "Important work", exact: true })).toBeVisible();
});
