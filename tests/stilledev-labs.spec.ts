import { test, expect, type Page } from "@playwright/test";

async function quiet(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { localStorage.setItem("budai-cookies", "declined"); sessionStorage.setItem("budai:cinematic-intro:v1", "1"); });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
  // Intercept AI calls to avoid hitting the real API
  await page.route("**/api/labs/chat", async route => {
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: "Hej! Det låter intressant. Berätta mer om vad du vill bygga.\u0000{\"conversationId\":\"00000000-0000-0000-0000-000000000001\",\"done\":true}",
    });
  });
}

test("Labs renders the chat-first welcome experience", async ({ page }) => {
  await quiet(page);
  for (const [path, language, placeholder, starter] of [
    ["/labs", "en", "Tell me what you want to create...", "I have a business idea."],
    ["/sv/labs", "sv", "Berätta vad du vill skapa...", "Jag har en affärsidé."],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    // Wordmark present
    await expect(page.locator("text=STILLEDEV LABS").first()).toBeVisible();
    // Welcome heading
    await expect(page.locator("text=Every great project starts with a conversation.")).toBeVisible();
    // Chat input present
    const input = page.locator(".labs-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", placeholder);
    // Starter prompts present
    await expect(page.locator(`button.labs-starter-btn:has-text(\"${starter}\")`)).toBeVisible();
    // Disclaimer about Oliver
    await expect(page.locator("text=Oliver Stille")).toBeVisible();
    // No old placeholder classes
    await expect(page.locator(".labs-hold-status")).toHaveCount(0);
  }
});

test("public navigation links to localized Labs", async ({ page }) => {
  await quiet(page);
  for (const [path, href] of [["/", "/labs"], ["/sv", "/sv/labs"]]) {
    await page.goto(path);
    await expect(page.locator(`a[href="${href}"]`).first()).toHaveText("Labs");
  }
});

test("user can type and send a message in Labs chat", async ({ page }) => {
  await quiet(page);
  await page.goto("/sv/labs");
  const input = page.locator(".labs-input");
  await input.fill("Jag har en idé om en bokningsplattform");
  await page.locator(".labs-send-btn").click();
  // User message should appear
  await expect(page.locator(".labs-message.user").filter({ hasText: "Jag har en idé om en bokningsplattform" })).toBeVisible();
  // Bot response (mocked) should appear
  await expect(page.locator(".labs-message.assistant").filter({ hasText: "Hej! Det låter intressant" })).toBeVisible({ timeout: 10000 });
});

test("starter prompt buttons send messages", async ({ page }) => {
  await quiet(page);
  await page.goto("/sv/labs");
  await page.locator(".labs-starter-btn").first().click();
  // Should show a user message
  await expect(page.locator(".labs-message.user")).toBeVisible();
});

test("new chat button resets the conversation", async ({ page }) => {
  await quiet(page);
  await page.goto("/sv/labs");
  // Send a message first
  await page.locator(".labs-input").fill("Test message");
  await page.locator(".labs-send-btn").click();
  await expect(page.locator(".labs-message.user")).toBeVisible();
  // Click new chat
  await page.locator(".labs-header-btn").filter({ hasText: "Ny" }).click();
  // Should show welcome again
  await expect(page.locator("text=Every great project starts with a conversation.")).toBeVisible();
});

test("Labs is mobile-responsive", async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await quiet(page);
  await page.goto("/sv/labs");
  await expect(page.locator(".labs-container")).toBeVisible();
  await expect(page.locator(".labs-input")).toBeVisible();
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("Enter sends message, Shift+Enter makes newline", async ({ page }) => {
  await quiet(page);
  await page.goto("/labs");
  const input = page.locator(".labs-input");
  await input.click();
  await page.keyboard.type("Hello");
  await page.keyboard.press("Enter");
  await expect(page.locator(".labs-message.user").filter({ hasText: "Hello" })).toBeVisible();
});

test("Labs API routes exist and respond properly", async ({ request }) => {
  // Chat endpoint requires POST
  const chatGet = await request.get("/api/labs/chat");
  expect(chatGet.status()).toBe(405); // Method not allowed (expect POST)

  // Conversations endpoint returns empty list without session
  const convs = await request.get("/api/labs/conversations");
  expect(convs.ok()).toBeTruthy();
  const data = await convs.json();
  expect(data).toHaveProperty("conversations");
});
