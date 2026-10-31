import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("budai-cookies", "declined"));
});

test("late responses cannot leak into a new chat or interrupt its response", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    (window as any).requests = [];
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).requests.push({ signal: init?.signal, body: JSON.parse(String(init?.body)) });
      if ((window as any).requests.length === 1) {
        return new Promise<Response>(resolve => { (window as any).resolveOld = () => resolve(new Response('Private stale answer\u0000{}', { headers: { 'Content-Type': 'text/plain' } })); });
      }
      return new Response('Answer to new chat\u0000{}', { headers: { 'Content-Type': 'text/plain' } });
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Old private question");
  await input.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as any).requests.length)).toBe(1);
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  expect(await page.evaluate(() => (window as any).requests[0].signal.aborted)).toBe(true);
  await input.fill("A new topic");
  await input.press("Enter");
  await expect(page.getByRole("log").getByText("Answer to new chat")).toBeVisible();
  await page.evaluate(() => (window as any).resolveOld());
  await page.waitForTimeout(250);
  await expect(page.getByRole("log").getByText("Private stale answer")).toHaveCount(0);
  await expect(page.getByRole("log").getByText("Old private question")).toHaveCount(0);
  await expect(page.getByRole("log").getByText("A new topic")).toBeVisible();
});

test("single-flight guard prevents two synchronous submissions", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    (window as any).requestCount = 0;
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).requestCount++;
      return new Promise<Response>(resolve => { (window as any).resolveRequest = () => resolve(new Response('One answer\u0000{}', { headers: { 'Content-Type': 'text/plain' } })); });
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Only send once");
  await input.evaluate(el => { const form = (el as HTMLTextAreaElement).form!; form.requestSubmit(); form.requestSubmit(); });
  await expect.poll(() => page.evaluate(() => (window as any).requestCount)).toBe(1);
  await page.evaluate(() => (window as any).resolveRequest());
  await expect(page.getByRole("log").getByText("One answer")).toBeVisible();
  await expect(page.getByRole("log").getByText("Only send once")).toHaveCount(1);
});

test("stopping a stalled stream immediately preserves and labels only received text", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    (window as any).cancelled = false;
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      return new Response(new ReadableStream({
        start(controller) { controller.enqueue(new TextEncoder().encode("A useful partial answer")); },
        cancel() { (window as any).cancelled = true; },
      }), { headers: { "Content-Type": "text/plain" } });
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Start streaming");
  await input.press("Enter");
  await expect(page.getByText("A useful partial answer", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop response" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).cancelled)).toBe(true);
  await expect(page.getByRole("log").getByText("Response stopped")).toBeVisible();
  await expect(page.getByRole("log").getByText("A useful partial answer")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
});

test("partial provider failure is visible and retry does not duplicate the failed prompt", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    (window as any).requests = [];
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).requests.push(JSON.parse(String(init?.body)));
      const content = (window as any).requests.length === 1 ? 'Partial result\u0000{"error":"Generation failed"}' : 'Successful retry\u0000{}';
      return new Response(content, { headers: { "Content-Type": "text/plain" } });
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Retry my question");
  await input.press("Enter");
  await expect(page.getByRole("log").getByText("Partial result")).toBeVisible();
  await expect(page.getByText("The response could not be completed. Please try again.")).toBeVisible();
  await expect(page.locator("#playground").getByText("12/12 credits left")).toBeVisible();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("log").getByText("Successful retry")).toBeVisible();
  const calls = await page.evaluate(() => (window as any).requests);
  expect(calls[1].messages).toHaveLength(1);
  expect(calls[1].messages[0].content).toBe("Retry my question");
  await expect(page.getByRole("log").getByText("Retry my question")).toHaveCount(1);
});

test("switching immediately flushes the current guest thread before debounce", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      return new Promise<Response>(() => {});
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Keep my rapidly switched conversation");
  await input.press("Enter");
  await expect(page.getByRole("log").getByText("Keep my rapidly switched conversation")).toBeVisible();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  const oldChat = page.getByRole("button", { name: "Keep my rapidly switched conversation", exact: true });
  await expect(oldChat).toBeVisible();
  await oldChat.click();
  await expect(page.getByRole("log").getByText("Keep my rapidly switched conversation")).toBeVisible();
});

test("mobile Escape cancels a waiting request without adding a fake answer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    (window as any).signal = null;
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).signal = init?.signal;
      return new Promise<Response>(() => {});
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("Wait for a response");
  await input.press("Enter");
  await expect.poll(() => page.evaluate(() => !!(window as any).signal)).toBe(true);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => (window as any).signal.aborted)).toBe(true);
  await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
  await expect(page.getByRole("log").getByText("Response stopped")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("stream network failure keeps partial text once and clears the live indicator", async ({ page }) => {
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = window.fetch.bind(window);
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      return new Response(new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Received before disconnect"));
          setTimeout(() => controller.error(new Error("Connection lost")), 100);
        },
      }), { headers: { "Content-Type": "text/plain" } });
    };
  });
  const input = page.getByRole("textbox", { name: "Message BudAI" });
  await input.fill("A question");
  await input.press("Enter");
  await expect(page.getByText("Network error. Check your connection.")).toBeVisible();
  await expect(page.getByText("Received before disconnect", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
});
