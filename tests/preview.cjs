/* Run against a running preview: node tests/preview.cjs.
   QA-only dependency: npm install --no-save --package-lock=false @playwright/test
   Optional CHROMIUM_PATH for a system browser. No production dependency. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem("budai-cookies", "declined"),
  );
  await page.goto(process.env.PREVIEW_URL || "http://localhost:3000", {
    waitUntil: "domcontentloaded",
  });
  await page.locator(".pg-empty").waitFor();
  assert.equal(await page.locator("#terminal, #status, #roadmap").count(), 0);
  await page.getByRole("button", { name: "Draft an email" }).click();
  assert.match(
    await page.getByRole("textbox", { name: "Message BudAI" }).inputValue(),
    /email/,
  );
  assert.equal(
    await page.locator(".pg-msg-enter").count(),
    0,
    "Suggestions should be editable, not sent",
  );
  let requests = [];
  await page.route("**/api/playground", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "application/x-ndjson",
      body:
        JSON.stringify({
          text: "## A clear next step\n\n```js\nconst result = 42;\n```",
        }) +
        "\n" +
        JSON.stringify({
          done: true,
          text: "## A clear next step\n\n```js\nconst result = 42;\n```",
        }) +
        "\n",
    });
  });
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByRole("button", { name: "Copy code", exact: true }).waitFor();
  assert.equal(await page.locator(".pg-msg-enter").count(), 2);
  await page.getByRole("button", { name: "Regenerate", exact: true }).click();
  await page.getByRole("button", { name: "Copy code", exact: true }).waitFor();
  assert.equal(
    requests[1].messages.length,
    1,
    "Regenerate must not duplicate the user message",
  );
  await page
    .getByRole("button", { name: "Open fullscreen", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".pg-expanded").count(), 0);
  await page.getByTitle("New chat").click();
  await page.locator(".pg-empty").waitFor();
  await page.getByRole("button", { name: "Sidebar", exact: true }).click();
  assert.ok(await page.locator("aside").count());
  await page.getByRole("button", { name: "Sidebar", exact: true }).click();
  await page.route("**/api/playground", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Temporarily unavailable" }),
    });
  });
  await page
    .getByRole("textbox", { name: "Message BudAI" })
    .fill("Test failure");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByRole("button", { name: "Retry", exact: true }).waitFor();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.getByRole("button", { name: "Retry", exact: true }).waitFor();
  assert.equal(
    await page.locator(".pg-msg-enter").count(),
    2,
    "Retry must not duplicate the question",
  );
  await page.getByRole("button", { name: "Switch to Swedish" }).click();
  await page
    .getByRole("heading", { name: "Stora idéer. Mindre vardagsjobb." })
    .waitFor();
  await page.locator("#waitlist-name").fill("Preview test");
  await page.locator("#waitlist-email").fill("preview-test@example.com");
  await page
    .getByRole("button", { name: "Gå med · få 10% rabatt", exact: true })
    .click();
  await page.locator(".form-error").waitFor();
  assert.equal(
    await page.locator(".signup-success").count(),
    0,
    "Unconfigured waitlist must not claim success",
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.locator("#mobile-navigation").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#mobile-navigation").count(), 0);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: navigation, suggestions, streamed rendering, code blocks, regenerate, fullscreen, history, errors/retry, Swedish, honest waitlist, 4 viewport widths, mobile menu; no browser errors.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
