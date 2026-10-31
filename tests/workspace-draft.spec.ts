import { test, expect, type Page } from "@playwright/test";

async function replyWithDraft(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = fetch.bind(window);
    (window as any).__draftRequests = [];
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      (window as any).__draftRequests.push(JSON.parse(String(init?.body)));
      return new Response("# A plan\n\n" + "A practical next step. ".repeat(30) + '\u0000{"memory":null}', { headers: { "Content-Type": "text/plain" } });
    };
  });
  await page.getByRole("button", { name: "Create", exact: true }).first().click();
  await page.getByRole("textbox", { name: "Message BudAI" }).fill("Create a plan");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("log").getByText("A plan", { exact: true })).toBeVisible();
}

test("desktop draft is explicit, previewable, recoverable and deletable", async ({ page }) => {
  await replyWithDraft(page);
  const editor = page.getByRole("textbox", { name: "Edit workspace" });
  await expect(editor).toBeVisible();
  await editor.fill("# My own plan\n\n- A deliberate next step");
  expect(await page.evaluate(() => localStorage.getItem("budai-workspace-draft-v1:guest"))).toBeNull();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("heading", { name: "My own plan" })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true, pressed: true }).click();
  await expect(editor).toHaveValue(/A deliberate next step/);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("budai-workspace-draft-v1:guest"))).toContain("My own plan");
  await page.getByRole("button", { name: "Close workspace" }).click();
  await page.getByRole("button", { name: "Return to open draft" }).click();
  await expect(editor).toHaveValue(/My own plan/);
  await page.reload();
  await page.getByRole("button", { name: "Open saved draft" }).click();
  await expect(editor).toHaveValue(/A deliberate next step/);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Delete saved" }).click();
  expect(await page.evaluate(() => localStorage.getItem("budai-workspace-draft-v1:guest"))).toBeNull();
});

test("edited draft is protected before switching chats", async ({ page }) => {
  await replyWithDraft(page);
  await page.getByRole("textbox", { name: "Edit workspace" }).fill("An unsaved change");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Start new chat" }).click();
  await expect(page.getByRole("textbox", { name: "Edit workspace" })).toHaveValue("An unsaved change");
});

test("mobile action keeps the edited draft available and sends its content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await replyWithDraft(page);
  await page.getByRole("button", { name: "Workspace", exact: true }).last().click();
  const dialog = page.getByRole("dialog", { name: "Workspace" });
  const editor = dialog.getByRole("textbox", { name: "Edit workspace" });
  await expect(dialog.getByRole("button", { name: "Close mobile workspace" })).toBeFocused();
  await editor.fill("# Mobile draft\n\nA selected note.");
  await dialog.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Mobile draft" })).toBeVisible();
  const improve = dialog.getByRole("button", { name: "Improve", exact: true });
  await expect.poll(() => improve.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); })).toBe(true);
  await improve.click();
  await expect.poll(() => page.evaluate(() => (window as any).__draftRequests.length)).toBe(2);
  const requests = await page.evaluate(() => (window as any).__draftRequests);
  expect(requests[1].messages.at(-1).content).toContain("A selected note.");
  await page.getByRole("button", { name: "Return to open draft" }).click();
  await expect(dialog.getByRole("heading", { name: "Mobile draft" })).toBeVisible();
});
