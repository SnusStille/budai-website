import { test, expect, type Page } from "@playwright/test";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
async function quiet(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("budai-cookies", "declined");
    sessionStorage.setItem("budai:cinematic-intro:v1", "1");
    sessionStorage.setItem("budai-buddy-popup-dismissed", "true");
  });
  await page.route("**/va.vercel-scripts.com/**", route => route.fulfill({ contentType: "application/javascript", body: "" }));
}

test("companion is quiet, keyboard accessible, localized and dismissible for the session", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/");
  const buddy = page.locator("[data-builder-companion]");
  await expect(buddy).toHaveCount(0); // no competition with initial content
  await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot-fallback")).toBeVisible();
  await expect(buddy.locator("canvas")).toHaveCount(0); // reduced motion is a static, zero-WebGL fallback
  await expect(buddy.locator(".companion-note")).toHaveCount(0); // reduced motion never auto-opens
  const launcher = buddy.getByRole("button", { name: "Meet the BudAI companion" });
  await launcher.focus(); await page.keyboard.press("Enter");
  await expect(buddy.locator(".companion-message")).toHaveText("Well, look who found us.");
  await expect(buddy.getByRole("link", { name: "Enter Playground" })).toHaveAttribute("href", "#playground");
  await buddy.getByRole("button", { name: "Say hi", exact: true }).click();
  await expect(buddy.locator(".companion-message")).toHaveText("Hi! Ready when you are.");
  await expect(buddy.getByRole("status")).toHaveText("Hi! Ready when you are.");
  await expect(buddy.locator(".labs-bot")).not.toHaveAttribute("data-emote", /.+/); // no motion under reduced motion
  await buddy.getByRole("button", { name: "Another thought" }).click();
  await expect(buddy.locator(".companion-message")).toHaveText("Well, look who found us.");
  await buddy.getByRole("button", { name: "Another thought" }).click();
  await expect(buddy.locator(".companion-message")).toHaveText("Think it. Build it. BudAI.");
  await buddy.getByRole("button", { name: "Minimize BudAI", exact: true }).click();
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await buddy.getByRole("button", { name: "Hide for this visit" }).click();
  await expect(buddy).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("budai:companion:hidden:v1"))).toBe("1");
  await page.reload(); await page.waitForTimeout(7500); await expect(buddy).toHaveCount(0);
  const restore = page.locator("#continuation").getByRole("button", { name: "Bring back the BudAI companion" });
  await restore.click();
  await expect(page.locator("#hero-title")).toBeFocused();
  await expect(buddy).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("budai:companion:hidden:v1"))).toBeNull();
  await expect(restore).toHaveCount(0);
});

test("desktop companion uses the Labs model, gives way to dialogs and Playground, and supports Swedish", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/sv");
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot")).toBeAttached();
  await buddy.getByRole("button", { name: "Möt BudAI-kompanjonen" }).click();
  await expect(buddy.getByRole("link", { name: "Öppna Playground" })).toBeVisible();
  await expect(buddy.getByText("Think it. Build it. BudAI.")).toBeVisible();
  await buddy.getByRole("button", { name: "Säg hej" }).click();
  await expect(buddy.locator(".companion-message")).toHaveText("Hej! Jag är redo när du är det.");
  await expect(buddy.locator(".labs-bot")).toHaveAttribute("data-emote", "hello");
  await expect(buddy.locator(".companion-hello")).toContainText("HEJ!");
  await page.screenshot({ path: "test-results/companion-desktop.png" });
  await buddy.getByRole("link", { name: "Öppna Playground" }).click();
  await expect(page.locator("#playground")).toBeInViewport(); await expect(buddy).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Meddelande till BudAI", exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(buddy).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible(); await expect(buddy).toHaveCount(0);
  await page.keyboard.press("Escape"); await expect(buddy).toBeVisible();
});

test("phone companion waits for the desktop notice, avoids the working chat and can be hidden", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page); await page.goto("/");
  const notice = page.locator(".desktop-notice"); await expect(notice).toBeVisible();
  await page.waitForTimeout(7200); await expect(page.locator("[data-builder-companion]")).toHaveCount(0);
  await notice.getByRole("button", { name: "I understand, continue" }).click();
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await page.screenshot({ path: "test-results/companion-phone.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await buddy.getByRole("link", { name: "Enter Playground" }).click();
  await expect(page.locator("#playground")).toBeInViewport(); await expect(buddy).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Message BudAI", exact: true })).toBeVisible();
  await context.close();
});

test("save-data keeps the shared fallback without creating a robot WebGL canvas", async ({ page }) => {
  await quiet(page);
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.goto("/"); const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  await expect(buddy.locator(".labs-bot-fallback")).toBeVisible(); await expect(buddy.locator("canvas")).toHaveCount(0);
});

test("automatic thoughts are rare, temporary and stop when a visitor takes control", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" });
  // Keep this timing test independent of GPU availability while exercising the normal-motion policy.
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.clock.install(); await page.goto("/");
  await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await page.clock.fastForward(8100);
  await expect(buddy.locator(".companion-note")).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("budai:companion:appearances:v1"))).toBe("1");
  await page.clock.fastForward(11200);
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await buddy.getByRole("button", { name: "Minimize BudAI", exact: true }).click();
  await expect(buddy.getByRole("button", { name: "Meet the BudAI companion" })).toBeFocused();
  await page.clock.fastForward(240000);
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
});


test("a visible companion waves and winks every 30 seconds without opening a new bubble", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    sessionStorage.setItem("budai:companion:interacted:v1", "1");
  });
  await page.clock.install(); await page.goto("/"); await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  const bot = buddy.locator(".labs-bot"); await expect(bot).toBeVisible();
  await page.clock.fastForward(30010);
  await expect(bot).toHaveAttribute("data-emote", "hello");
  await expect(buddy.locator(".companion-hello")).toHaveCount(0); // automatic gestures never produce a speech bubble
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  expect(await bot.locator(".labs-bot-arm.right").evaluate(el => getComputedStyle(el).animationName)).toBe("bot-wave");
  await page.clock.fastForward(2800); await expect(bot).not.toHaveAttribute("data-emote", /.+/);
  await page.clock.fastForward(27210); await expect(bot).toHaveAttribute("data-emote", "wink");
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
  await page.keyboard.press("Control+k"); await expect(page.getByRole("dialog")).toBeVisible();
  await expect(buddy).toHaveCount(0); await page.clock.fastForward(90000);
  await page.keyboard.press("Escape"); await expect(buddy).toBeVisible();
  await expect(buddy.locator(".labs-bot")).not.toHaveAttribute("data-emote", /.+/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.fastForward(65000);
  await expect(buddy.locator(".labs-bot")).not.toHaveAttribute("data-emote", /.+/);
  await expect(buddy.locator(".companion-hello")).toHaveCount(0);
});


test("companion idea starters protect drafts and never send a message", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.clock.install();
  let requests = 0; page.on("request", req => { if (req.url().endsWith("/api/playground")) requests++; });
  await page.goto("/#playground");
  const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai_persona"))).not.toBeNull();
  await input.fill("Keep this draft");
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  const toggle = buddy.getByRole("button", { name: "Give me a starting point" });
  await toggle.click(); await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(buddy).toContainText("Nothing is sent automatically.");
  await page.screenshot({ path: "test-results/companion-ideas-desktop.png" });
  page.once("dialog", dialog => dialog.dismiss());
  await buddy.getByRole("button", { name: "Plan my week" }).click();
  await expect(buddy.locator(".companion-note")).toBeVisible();
  await expect(input).toHaveValue("Keep this draft"); expect(requests).toBe(0);
  page.once("dialog", dialog => dialog.accept());
  await buddy.getByRole("button", { name: "Plan my week" }).click();
  await expect(page.locator("#playground")).toBeInViewport();
  await expect(input).toHaveValue("Help me plan my week. Ask me about my priorities first.");
  expect(requests).toBe(0);
});

test("phone companion can be restored and offers localized editable starters", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page);
  await page.addInitScript(() => sessionStorage.setItem("stilledev:desktop-notice:v1", "seen"));
  await page.clock.install(); await page.goto("/sv"); await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await buddy.getByRole("button", { name: "Möt BudAI-kompanjonen" }).click();
  await buddy.getByRole("button", { name: "Dölj för besöket" }).click(); await expect(buddy).toHaveCount(0);
  await page.locator(".phone-footer").getByRole("button", { name: "Visa BudAI-kompanjonen igen" }).click();
  await expect(page.locator("#phone-heading")).toBeFocused(); await expect(buddy).toBeVisible();
  await buddy.getByRole("button", { name: "Möt BudAI-kompanjonen" }).click();
  await buddy.getByRole("button", { name: "Ge mig en start" }).click();
  await expect(buddy).toContainText("Inget skickas automatiskt.");
  await page.screenshot({ path: "test-results/companion-ideas-phone.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  let requests = 0; page.on("request", req => { if (req.url().endsWith("/api/playground")) requests++; });
  await buddy.getByRole("button", { name: "Red ut en idé" }).click();
  await expect(page.getByRole("textbox", { name: "Meddelande till BudAI" })).toHaveValue("Hjälp mig göra en lös idé till tydliga nästa steg. Be mig beskriva den först.");
  expect(requests).toBe(0);
  await context.close();
});

test("an open companion card stays closed after another dialog takes priority", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "reduce" }); await page.clock.install();
  await page.goto("/"); await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await buddy.getByRole("button", { name: "Give me a starting point" }).click();
  await page.keyboard.press("Control+k"); await expect(page.getByRole("dialog")).toBeVisible(); await expect(buddy).toHaveCount(0);
  await page.keyboard.press("Escape"); await expect(buddy).toBeVisible();
  await expect(buddy.locator(".companion-note")).toHaveCount(0);
});

test("rapid repeated hellos restart the fallback animation without disturbing the card", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.clock.install(); await page.goto("/"); await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  const hi = buddy.getByRole("button", { name: "Say hi", exact: true });
  const bot = buddy.locator(".labs-bot"); const arm = bot.locator(".labs-bot-arm.right");
  await hi.click(); await expect(bot).toHaveAttribute("data-emote-phase", "1");
  expect(await arm.evaluate(el => getComputedStyle(el).animationName)).toBe("bot-wave");
  await hi.click(); await expect(bot).toHaveAttribute("data-emote-phase", "0");
  expect(await arm.evaluate(el => getComputedStyle(el).animationName)).toBe("bot-wave-again");
  await expect(buddy.locator(".companion-message")).toHaveText("Hi! Ready when you are.");
});

test("the shared companion winks on request, including repeated fallback gestures", async ({ page }) => {
  await quiet(page); await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.clock.install(); await page.goto("/"); await page.clock.fastForward(7200);
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible();
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  const bot = buddy.locator(".labs-bot");
  const wink = buddy.getByRole("button", { name: "Wink" });
  await wink.click();
  await expect(buddy.locator(".companion-message")).toHaveText("One eye on the details.");
  await expect(buddy.getByRole("status")).toHaveText("One eye on the details.");
  await expect(bot).toHaveAttribute("data-emote", "wink");
  await expect(bot).toHaveAttribute("data-emote-phase", "1");
  await wink.click(); await expect(bot).toHaveAttribute("data-emote-phase", "0");
  expect(await bot.locator(".labs-bot-face > i:nth-child(2)").evaluate(el => getComputedStyle(el).animationName)).toBe("bot-wink-again");
});

test("small phones show the real bot without covering the heading, and keep chat controls usable", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: iphone, viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await quiet(page); await page.goto("/");
  const notice = page.locator(".desktop-notice");
  await expect(notice.locator(".desktop-notice-mascot .labs-bot-fallback")).toBeVisible();
  await expect(notice.locator(".desktop-notice-mascot canvas")).toHaveCount(0);
  const confirmBox = await notice.getByRole("button", { name: "I understand, continue" }).boundingBox();
  const dialogBox = await notice.boundingBox();
  expect(confirmBox && dialogBox && confirmBox.y + confirmBox.height <= dialogBox.y + dialogBox.height).toBeTruthy();
  await page.screenshot({ path: "test-results/phone-notice-small.png" });
  await notice.getByRole("button", { name: "I understand, continue" }).click();
  const buddy = page.locator("[data-builder-companion]"); await expect(buddy).toBeVisible({ timeout: 12000 });
  const launcher = await buddy.locator(".companion-launcher").boundingBox();
  const heading = await page.locator("#phone-heading").boundingBox();
  expect(launcher && heading && launcher.y + launcher.height <= heading.y).toBeTruthy();
  await expect(buddy.locator(".labs-bot-fallback")).toBeVisible();
  await page.screenshot({ path: "test-results/phone-hero-small.png" });
  await buddy.getByRole("button", { name: "Meet the BudAI companion" }).click();
  await buddy.getByRole("button", { name: "Wink" }).click();
  await expect(buddy.locator(".companion-message")).toHaveText("One eye on the details.");
  await expect(buddy.locator(".labs-bot")).not.toHaveAttribute("data-emote", /.+/);
  await page.screenshot({ path: "test-results/phone-bot-small.png" });
  await buddy.getByRole("link", { name: "Enter Playground" }).click();
  await expect(buddy).toHaveCount(0);
  const modes = page.getByRole("group", { name: "Choose mode" });
  const modeHeight = await modes.getByRole("button", { name: "2 angles" }).evaluate(el => el.getBoundingClientRect().height);
  expect(modeHeight).toBeGreaterThanOrEqual(44);
  await modes.getByRole("button", { name: "2 angles" }).click();
  await expect(modes.getByRole("button", { name: "2 angles" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("group", { name: "Answer language" }).getByRole("button", { name: "SV" }).click();
  await expect(page.getByRole("group", { name: "Answer language" }).getByRole("button", { name: "SV" })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "test-results/phone-chat-small.png" });
  const composer = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await composer.click(); await composer.fill("A real draft on a small screen");
  await expect(composer).toHaveValue("A real draft on a small screen");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await context.close();
});

test("phone entry lands on the working composer without summoning the keyboard", async ({ browser }) => {
  for (const [width, height] of [[320, 568], [390, 844]]) {
    const context = await browser.newContext({ userAgent: iphone, viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage(); await quiet(page);
    await page.addInitScript(() => sessionStorage.setItem("stilledev:desktop-notice:v1", "seen"));
    await page.goto("/");
    await page.getByRole("link", { name: "Open Playground" }).click();
    await expect(page).toHaveURL(/#phone-chat$/);
    const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
    await expect(input).toBeInViewport({ ratio: 1 });
    await expect(input).not.toBeFocused();
    await expect(page.locator("html")).not.toHaveAttribute("data-pg-keyboard", "open");
    await expect(page.locator(".phone-empty-welcome")).toBeInViewport();
    await page.screenshot({ path: `test-results/phone-chat-entry-${width}.png` });
    let requests = 0; page.on("request", req => { if (req.url().endsWith("/api/playground")) requests++; });
    await page.getByRole("button", { name: "Start with: Plan my day" }).click();
    await expect(input).toHaveValue(/6 hours/);
    expect(requests).toBe(0);
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Start with: Create" }).click();
    await expect(input).toHaveValue(/6 hours/);
    await context.close();
  }
});
