import { test, expect } from "@playwright/test";

declare global {
  interface Window { __chatRequest: Record<string, unknown> | null; __streamCancelled: boolean; }
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
    sessionStorage.setItem("budai-end-toast", "1");
  });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.route("**/_vercel/insights/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
  // Never write to a real external database during the browser regression suite.
  await page.route("**/*.supabase.co/**", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Database unavailable in browser QA" }) }));
});

test("real Playground UI sends persona/language/history and consumes progressive streaming + trailer", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#playground");
  const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await expect(input).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai_persona"))).not.toBeNull();
  await page.locator("#playground select[aria-label=Persona]").selectOption("coder");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai_persona"))).toBe("coder");
  await page.getByRole("group", { name: "Answer language", exact: true }).getByRole("button", { name: "SV", exact: true }).click();
  // A controlled browser transport double, not application/mock-product code.
  // The actual response reader, typing UI, state, and local persistence run unchanged.
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    window.__chatRequest = null;
    window.fetch = async (resource, init) => {
      if (String(resource).endsWith("/api/playground")) {
        window.__chatRequest = JSON.parse(String(init?.body));
        const encoder = new TextEncoder();
        return new Response(new ReadableStream({ start(controller) {
          controller.enqueue(encoder.encode("A calmer"));
          setTimeout(() => controller.enqueue(encoder.encode(" Swedish workday.")), 800);
          setTimeout(() => { controller.enqueue(encoder.encode('\u0000{"memory":null}')); controller.close(); }, 1400);
        } }), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      return original(resource, init);
    };
  });
  await input.fill("Write a small TypeScript helper.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#playground").getByText("A calmer", { exact: true })).toBeVisible();
  await expect(page.locator("#playground").getByText("A calmer Swedish workday.", { exact: true })).toBeVisible();
  const request = await page.evaluate(() => window.__chatRequest);
  expect(request).toMatchObject({ persona: "coder", lang: "sv", stream: true, dual: false });
  expect(request?.messages).toEqual(expect.arrayContaining([expect.objectContaining({ role: "user", content: expect.stringContaining("TypeScript helper") })]));
  await expect(input).toBeEnabled();
  await expect(page.getByRole("button", { name: "Stop response", exact: true })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai-pg-history-v2"))).toContain("A calmer Swedish workday.");
  const thread = page.locator("#playground").getByRole("button", { name: "Write a small TypeScript helper.", exact: true });
  await expect(thread).toBeVisible(); // Debounced persistence has committed the final reply.
  await page.reload();
  await thread.click(); // Existing behavior: reload opens a new chat; history reopens by selection.
  await expect(page.locator("#playground").getByText("A calmer Swedish workday.", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Stop response cancels the existing stream reader and releases the composer", async ({ page }) => {
  await page.goto("/#playground");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai_persona"))).not.toBeNull();
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    window.__streamCancelled = false;
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      const encoder = new TextEncoder();
      let timer = 0;
      return new Response(new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("A small "));
          timer = window.setInterval(() => controller.enqueue(encoder.encode("next ")), 450);
        },
        cancel() { clearInterval(timer); window.__streamCancelled = true; },
      }), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await input.fill("Start a response I can stop.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#playground").getByText("A small", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop response", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__streamCancelled)).toBe(true);
  await expect(page.getByRole("button", { name: "Stop response", exact: true })).toHaveCount(0);
  await input.fill("The composer remains usable.");
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
});

test("Playground error/retry state remains functional without a configured model provider", async ({ page }) => {
  await page.route("**/api/playground", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporarily unavailable. Please retry." }) }));
  await page.goto("/#playground");
  const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await input.fill("Help me plan tomorrow.");
  await input.press("Enter");
  await expect(page.getByText("Temporarily unavailable. Please retry.", { exact: true })).toBeVisible();
  await expect(input).toBeEnabled();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});

test("image upload retains the existing account gate and auth UI", async ({ page }) => {
  await page.goto("/#playground");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai_persona"))).not.toBeNull();
  await page.locator("#playground input[type=file]").setInputFiles({ name: "vision-qa.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==", "base64") });
  await expect(page.getByText("Attach images with an account", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send magic link", exact: true })).toBeVisible();
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});

test("capability actions prefill the REAL Playground instead of a second Hero Ask interface", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#signal").getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Ask BudAI", exact: true })).toHaveCount(0);
  await page.locator(".capability-module").first().click();
  await expect(page.getByRole("textbox", { name: "Message BudAI", exact: true })).toHaveValue("Help me write a clear, friendly email.");
});

test("waitlist keeps native validation, company details, referral controls, and honest failure", async ({ page }) => {
  await page.goto("/#waitlist");
  const form = page.locator("#waitlist form");
  const email = form.getByRole("textbox", { name: "Email", exact: true });
  await form.getByRole("button", { name: "Join the waitlist", exact: true }).click();
  expect(await email.evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true);
  await email.fill("not-an-email");
  expect(await email.evaluate((el) => (el as HTMLInputElement).validity.typeMismatch)).toBe(true);
  await form.getByRole("button", { name: /Add details/ }).click();
  await form.getByRole("button", { name: "Company", exact: true }).click();
  await form.getByRole("textbox", { name: "Name", exact: true }).fill("Browser QA");
  await form.getByRole("textbox", { name: "Company", exact: true }).fill("QA only");
  await form.getByRole("combobox", { name: "Team size", exact: true }).selectOption("1-10");
  await form.getByRole("combobox", { name: "Use case", exact: true }).selectOption("Automation");
  await form.getByRole("button", { name: "Have an invite code?", exact: true }).click();
  await form.getByRole("textbox", { name: "Invite code", exact: true }).fill("qa-referral");
  await email.fill("browser-qa@example.invalid");
  await form.getByRole("button", { name: "Join the waitlist", exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText(/not accepting signups|Could not save right now/);
  await expect(page.getByText("You're in!", { exact: true })).toHaveCount(0);
  await expect(form.getByRole("button", { name: "Join the waitlist", exact: true })).toBeEnabled();
});

test("SV / EN changes existing product content without mounting another intro", async ({ page }) => {
  await page.goto("/");
  await page.locator(".site-navigation").getByRole("button", { name: "SV", exact: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "sv");
  await expect(page.getByRole("textbox", { name: "Meddelande till BudAI", exact: true })).toBeVisible();
  await expect(page.locator("#waitlist input[type=email]")).toHaveAttribute("aria-label", "E-post");
  await page.locator(".site-navigation").getByRole("button", { name: "EN", exact: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});

test("existing routes and safe API contracts remain available", async ({ page, request }) => {
  for (const route of ["/", "/admin", "/legal/privacy", "/legal/terms", "/legal/cookies", "/legal/gdpr"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    if (route !== "/") await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  }
  expect((await request.get("/api/health")).status()).toBe(200);
  expect(await (await request.get("/api/health")).json()).toMatchObject({ ok: true });
  expect((await request.get("/api/features")).status()).toBe(200);
  expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
  expect([400, 503]).toContain((await request.post("/api/playground", { data: { messages: [] } })).status());
  expect([401, 501]).toContain((await request.post("/api/generate-image", { data: { prompt: "" } })).status());
  expect((await request.get("/s/not-a-real-id")).status()).toBe(404);
  expect([401, 503]).toContain((await request.get("/api/admin/status")).status());
});
