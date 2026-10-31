import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
});

async function mockChat(page: Page, responses: string[]) {
  await page.evaluate((texts) => {
    const original = fetch.bind(window);
    (window as any).__calls = [];
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).__calls.push(JSON.parse(String(init?.body)));
      const response = texts[Math.min((window as any).__calls.length - 1, texts.length - 1)];
      return new Response(response + '\u0000{"memory":null}', { headers: { "Content-Type": "text/plain" } });
    };
  }, responses);
}

test("suggestions are editable, do not send automatically and protect a typed draft", async ({ page }) => {
  await page.goto("/#playground");
  let calls = 0;
  page.on("request", req => { if (req.url().endsWith("/api/playground")) calls++; });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Don't lose this draft");
  page.once("dialog", d => d.dismiss());
  await page.locator("[data-signal-workflows]").getByRole("button", { name: "Write an email" }).click();
  await expect(input).toHaveValue("Don't lose this draft");
  page.once("dialog", d => d.dismiss());
  await page.getByRole("button", { name: "Surprise", exact: true }).last().click();
  await expect(input).toHaveValue("Don't lose this draft");
  await input.fill("");
  await page.getByRole("button", { name: "Surprise", exact: true }).last().click();
  await expect(input).not.toHaveValue("");
  await page.waitForTimeout(600);
  expect(calls).toBe(0);
});

test("over-limit messages stay in the composer without an API request", async ({ page }) => {
  await page.goto("/#playground");
  await mockChat(page, ["ok"]);
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await page.getByRole("button", { name: "Research", exact: true }).click();
  const text = "x".repeat(3900);
  await input.fill(text);
  await expect(page.getByText(/Characters including mode instructions/)).toBeVisible();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/message is too long for this mode/)).toBeVisible();
  await expect(input).toHaveValue(text);
  expect(await page.evaluate(() => (window as any).__calls.length)).toBe(0);
});

test("long earlier answers are labelled in the API request, not cut in the visible thread", async ({ page }) => {
  await page.goto("/#playground");
  const longReply = "Beginning " + "z".repeat(4300) + " End marker";
  await mockChat(page, [longReply, "Follow-up response"]);
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("First question");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/Long earlier messages are shortened/)).toBeVisible();
  await input.fill("Follow-up question");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("log").getByText("Follow-up response")).toBeVisible();
  const calls = await page.evaluate(() => (window as any).__calls);
  const previous = calls[1].messages.find((m: {role:string}) => m.role === "assistant");
  expect(previous.content.length).toBeLessThanOrEqual(4000);
  expect(previous.content).toContain("Earlier message shortened for this request");
  await expect(page.getByRole("log").getByText(/End marker/)).toBeVisible();
});

test("continue on an older response uses that response and preserves the composer", async ({ page }) => {
  await page.goto("/#playground");
  await mockChat(page, ["First selected answer", "Second different answer", "Extended response"]);
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  for (const prompt of ["First prompt", "Second prompt"]) {
    await input.fill(prompt);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("log").getByText(prompt === "First prompt" ? "First selected answer" : "Second different answer", { exact: true })).toBeVisible();
  }
  await input.fill("My unfinished next question");
  const message = page.getByRole("log").getByText("First selected answer", { exact: true }).locator("xpath=ancestor::div[contains(@class, 'flex gap')] ").first();
  await message.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("log").getByText("Extended response")).toBeVisible();
  const calls = await page.evaluate(() => (window as any).__calls);
  expect(calls[2].messages.at(-1).content).toContain("First selected answer");
  await expect(input).toHaveValue("My unfinished next question");
});

test("dictation appends to existing text instead of replacing it", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).SpeechRecognition = class {
      lang = ""; interimResults = false; continuous = false;
      onresult: ((e: any) => void) | null = null; onend: (() => void) | null = null; onerror = null;
      start() { setTimeout(() => { this.onresult?.({ results: [[{ transcript: "and one more detail" }]] }); this.onend?.(); }, 50); }
      stop() { this.onend?.(); }
    };
  });
  await page.goto("/#playground");
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Please include this");
  await page.getByRole("button", { name: /^Speak Voice to text/ }).click();
  await expect(input).toHaveValue("Please include this and one more detail");
});

test("starting a new chat asks before discarding an unsent message", async ({ page }) => {
  await page.goto("/#playground");
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Keep this until I decide");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Start new chat" }).click();
  await expect(input).toHaveValue("Keep this until I decide");
});

test("Swedish mobile composer shows the real budget without losing text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#playground");
  await page.locator(".site-navigation").getByRole("button", { name: "SV", exact: true }).first().click();
  const input = page.getByRole("textbox", { name: "Meddelande till BudAI" });
  const text = "å".repeat(4100);
  await input.fill(text);
  await expect(page.getByText(/Tecken inklusive instruktion för läget/)).toBeVisible();
  await page.getByRole("button", { name: "Skicka meddelande" }).click();
  await expect(page.getByText(/Meddelandet är för långt/)).toBeVisible();
  await expect(input).toHaveValue(text);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
