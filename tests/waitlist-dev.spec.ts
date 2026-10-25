import { test, expect } from "@playwright/test";

// Explicitly opt-in against next dev's existing IN-MEMORY local mock only.
// This file is excluded from the default production suite. Never seed a live DB.
test.skip(process.env.TEST_WAITLIST_DEV !== "1", "Requires the explicit local-development mock check");
test("local development mock exercises real waitlist loading, success and copy UI without an external write", async ({ page, context, baseURL }) => {
  await page.emulateMedia({ reducedMotion:"reduce" });
  await page.addInitScript(() => { localStorage.setItem("budai-cookies","declined"); sessionStorage.setItem("budai-buddy-popup-dismissed","true"); });
  const externalWrites:string[] = [];
  await page.route("**/*",route=>{
    const r = route.request();
    if (new URL(r.url()).origin !== new URL(baseURL!).origin) {
      if (r.method() !== "GET") externalWrites.push(r.url());
      return route.abort();
    }
    return route.continue();
  });
  await context.grantPermissions(["clipboard-read","clipboard-write"]);
  await page.goto("/#waitlist");
  // The development-only un-hashed entry script is a pre-submit safety guard.
  await expect(page.locator('script[src*="/_next/static/chunks/main-app.js"]')).toHaveCount(1);
  const section = page.locator("#waitlist");
  const form = section.locator("form");
  await form.getByRole("textbox",{name:"Email",exact:true}).fill("cinematic-local-qa@example.invalid");
  await form.getByRole("button",{name:"Join the waitlist",exact:true}).click();
  await expect(form).toHaveAttribute("aria-busy","true");
  await expect(section.getByRole("heading",{name:"You're in!",exact:true})).toBeVisible();
  await expect(section.getByRole("status").filter({hasText:"You're in!"})).toBeVisible();
  await expect(form).toHaveCount(0);
  await expect(section.getByText("We'll be in touch when it's your turn.",{exact:true})).toBeVisible();
  await section.getByRole("button",{name:"BUDAI-EARLY-10",exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe("BUDAI-EARLY-10");
  expect(externalWrites).toEqual([]);
  await page.screenshot({path:"test-results/waitlist-local-success.png"});
});
