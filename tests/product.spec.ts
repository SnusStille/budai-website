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
  await expect(page.locator("#playground").getByRole("button", { name: "Action plan", exact: true })).toBeVisible();
  await page.locator("#playground").getByRole("button", { name: /Memory\s+Account/i }).click();
  const memHeading = page.locator("#playground").getByRole("heading", { name: "Memory you control" });
  await expect(memHeading).toBeVisible();
  await page.locator("#playground").getByRole("button", { name: "Close memory", exact: true }).click();
  await expect(memHeading).toHaveCount(0);
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

test("Playground error/retry state remains functional without a configured model provider and preserves daily quota on failure", async ({ page }) => {
  await page.route("**/api/playground", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporarily unavailable. Please retry." }) }));
  await page.goto("/#playground");
  await expect(page.locator("#playground").getByText("12/12 credits left")).toBeVisible();
  const input = page.getByRole("textbox", { name: "Message BudAI", exact: true });
  await input.fill("Help me plan tomorrow.");
  await input.press("Enter");
  await expect(page.getByText("Temporarily unavailable. Please retry.", { exact: true })).toBeVisible();
  await expect(page.locator("#playground").getByText("12/12 credits left")).toBeVisible();
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
  await form.getByRole("checkbox", { name: "Consent to storage" }).check();
  await form.getByRole("button", { name: "Join the waitlist", exact: true }).click();
  await expect(form.getByRole("alert")).toHaveText(/not accepting signups|Could not save right now/);
  await expect(page.getByText("You're in!", { exact: true })).toHaveCount(0);
  await expect(form.getByRole("button", { name: "Join the waitlist", exact: true })).toBeEnabled();
  await form.getByRole("button", { name: "Individual", exact: true }).click();
  await expect(form.getByRole("button", { name: "Company", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.locator(".plan-business a[href='#waitlist']").click();
  await expect(form.getByRole("button", { name: "Company", exact: true })).toHaveAttribute("aria-pressed", "true");
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

test("configured model picker sends only the selected public tier through the real composer",async({page})=>{
  await page.route("**/api/features",r=>r.fulfill({contentType:"application/json",body:JSON.stringify({imageGeneration:false,vision:true,voice:true,models:[{id:"quality",label:"Quality"},{id:"fast",label:"Fast"},{id:"deep",label:"Deep"}]})}));
  await page.goto("/#playground");
  const picker=page.getByRole("combobox",{name:"AI model",exact:true});await picker.selectOption("fast");
  await page.evaluate(()=>{
    const original=fetch.bind(window);window.__chatRequest=null;
    window.fetch=async(resource,init)=>{
      if(!String(resource).endsWith("/api/playground"))return original(resource,init);
      window.__chatRequest=JSON.parse(String(init?.body));
      return new Response('Selected model response.\u0000{"memory":null}',{headers:{"Content-Type":"text/plain"}});
    };
  });
  await page.getByRole("textbox",{name:"Message BudAI",exact:true}).fill("Use the configured fast tier.");
  await page.getByRole("button",{name:"Send message",exact:true}).click();
  await expect(page.locator("#playground").getByText("Selected model response.",{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.__chatRequest?.modelTier)).toBe("fast");
  expect(await page.evaluate(()=>localStorage.getItem("budai_model_tier"))).toBe("fast");
  await page.reload();await expect(picker).toHaveValue("fast");
});

test("voice dictation keeps SV/EN, permission errors and thrown recognition failures usable",async({page})=>{
  await page.addInitScript(()=>{
    const w=window as unknown as {SpeechRecognition:unknown;__voiceMode:string;__voiceLangs:string[]};w.__voiceMode="ok";w.__voiceLangs=[];
    w.SpeechRecognition=class{
      lang="";interimResults=false;continuous=false;
      onresult:((e:{results:Array<Array<{transcript:string}>>})=>void)|null=null;
      onerror:((e:{error:string})=>void)|null=null;onend:(()=>void)|null=null;
      start(){
        w.__voiceLangs.push(this.lang);if(w.__voiceMode==="throw")throw new Error("Recognition start failed");
        setTimeout(()=>{if(w.__voiceMode==="denied")this.onerror?.({error:"not-allowed"});else this.onresult?.({results:[[{transcript:this.lang==="sv-SE"?"Hjälp mig planera dagen.":"Help me plan the day."}]]});this.onend?.();},180);
      }
      stop(){this.onend?.();}abort(){this.onend?.();}
    };
  });
  const calls:string[]=[];page.on("request",r=>{if(r.url().endsWith("/api/playground"))calls.push(r.url());});
  await page.goto("/#playground");const input=page.locator("#playground textarea");
  await page.getByRole("button",{name:/^Speak Voice to text/}).click();await expect(input).toHaveValue("Help me plan the day.");
  await page.locator(".site-navigation").getByRole("button",{name:"SV",exact:true}).first().click();
  await input.fill("");
  await page.getByRole("button",{name:/^Prata in Röst till text/}).click();await expect(input).toHaveValue("Hjälp mig planera dagen.");
  expect(await page.evaluate(()=>(window as unknown as {__voiceLangs:string[]}).__voiceLangs)).toEqual(["en-US","sv-SE"]);
  await page.evaluate(()=>{(window as unknown as {__voiceMode:string}).__voiceMode="denied";});
  await page.getByRole("button",{name:/^Prata in Röst till text/}).click();await expect(page.getByText("Mikrofon nekad i webbläsaren.",{exact:true})).toBeVisible();
  await page.evaluate(()=>{(window as unknown as {__voiceMode:string}).__voiceMode="throw";});
  await page.getByRole("button",{name:/^Prata in Röst till text/}).click();await expect(page.getByText("Kunde inte starta mikrofon.",{exact:true})).toBeVisible();
  await expect(page.getByText("Lyssnar — prata nu",{exact:true})).toHaveCount(0);await expect(input).toBeEnabled();expect(calls).toEqual([]);
});

test("voice-mode permission failure stays closable above navigation and never starts an auto-retry loop",async({page})=>{
  await page.addInitScript(()=>{
    const w=window as unknown as {SpeechRecognition:unknown;__recognitionStarts:number};w.__recognitionStarts=0;
    w.SpeechRecognition=class {
      lang="";interimResults=false;continuous=false;onresult=null;onend:(()=>void)|null=null;onerror:((e:{error:string})=>void)|null=null;
      start(){w.__recognitionStarts++;setTimeout(()=>{this.onerror?.({error:"not-allowed"});this.onend?.();},80);}stop(){}abort(){}
    };
    if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{throw new Error("No microphone in browser QA");};
  });
  await page.goto("/#playground");await page.getByRole("button",{name:"Voice mode",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Voice mode",exact:true});await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveText("Microphone permission denied.");
  await page.waitForTimeout(650);expect(await page.evaluate(()=>(window as unknown as {__recognitionStarts:number}).__recognitionStarts)).toBe(1);
  const close=dialog.getByRole("button",{name:"Close",exact:true});
  expect(await close.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
  await close.click();await expect(dialog).toHaveCount(0);await expect(page.getByRole("textbox",{name:"Message BudAI",exact:true})).toBeEnabled();
});

test("cookie choice is the single consent source and can be changed later", async ({ page }) => {
  // beforeEach pre-seeds a declined choice; this case starts from a fresh visitor.
  await page.addInitScript(() => localStorage.removeItem("budai-cookies"));
  await page.goto("/");
  const banner = page.getByRole("dialog", { name: /cookies/i });
  await expect(banner).toBeVisible({ timeout: 10_000 });
  await banner.getByRole("button", { name: "Decline", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("budai-cookies"))).toBe("declined");
  await expect(banner).toHaveCount(0);

  const settings = page.getByRole("button", { name: "Cookie settings", exact: true });
  await expect(settings).toBeVisible();
  // Fixed UI (back-to-top etc.) can cover the footer row; trigger the real button.
  await settings.evaluate((el) => (el as HTMLButtonElement).click());
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Accept", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("budai-cookies"))).toBe("accepted");
});


test("plans and waitlist make no discount, price or launch-date promise", async ({ page }) => {
  await page.goto("/#waitlist");
  const waitlist = page.locator("#waitlist");
  await expect(waitlist).toBeVisible();
  const text = (await waitlist.innerText()).replace(/\s+/g, " ");
  expect(text).not.toMatch(/10\s?%|BUDAI-EARLY-10|founding|discount|rabatt|grundare/i);
  expect(text).toMatch(/pricing has not been set|paid plans are ready|Free during the developer preview/i);

  await page.locator("#capabilities").scrollIntoViewIfNeeded();
  const plans = (await page.locator("#capabilities").innerText()).replace(/\s+/g, " ");
  expect(plans).not.toMatch(/10\s?%|founding members|lock 10|BUDAI-EARLY-10/i);
  expect(plans).toMatch(/pricing has not been set yet/i);
});


test("legal pages disclose automatic memory and its controls in both languages", async ({ page }) => {
  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByText(/memory is on by default/i)).toBeVisible();
  await expect(page.getByText(/Playground → Memory/)).toBeVisible();
  await page.goto("/legal/gdpr");
  await expect(page.getByText(/Automatic long-term memory is part of the account service/i)).toBeVisible();

  await page.addInitScript(() => localStorage.setItem("budai-lang", "sv"));
  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { name: "Integritetspolicy" })).toBeVisible();
  await expect(page.getByText(/minnet är på som standard/i)).toBeVisible();
  await expect(page.getByText(/Playground → Minne/)).toBeVisible();
  await page.goto("/legal/gdpr");
  await expect(page.getByText(/Automatiskt långtidsminne ingår i kontotjänsten/i)).toBeVisible();
});


test("admin auth uses a server-set session cookie and /admin stays out of indexes", async ({ request }) => {
  const admin = await request.get("/admin");
  expect(admin.status()).toBe(200);
  expect((admin.headers()["x-robots-tag"] || "").toLowerCase()).toContain("noindex");
  expect(await admin.text()).toMatch(/name="robots"[^>]*content="[^"]*noindex/i);

  const login = await request.post("/api/admin/login", { data: { password: "not-the-admin-password" } });
  expect([401, 503]).toContain(login.status());
  // A failed login never issues a session cookie, and no password is echoed back.
  expect(login.headers()["set-cookie"]).toBeUndefined();
  expect(await login.text()).not.toContain("not-the-admin-password");

  // The old plaintext header is no longer an auth path.
  const legacy = await request.get("/api/admin/status", { headers: { "x-admin-key": "anything" } });
  expect([401, 503]).toContain(legacy.status());
});


test("waitlist API validates server-side, requires consent and quietly drops bots", async ({ request }) => {
  const base = { email: "qa-signup@example.invalid", name: "QA", consent: true, account_type: "individual" };
  const noConsent = await request.post("/api/waitlist", { data: { ...base, consent: false } });
  expect(noConsent.status()).toBe(400);
  expect((await noConsent.json()).error).toBe("consent_required");

  const badEmail = await request.post("/api/waitlist", { data: { ...base, email: "not-an-email" } });
  expect(badEmail.status()).toBe(400);
  expect((await badEmail.json()).error).toBe("invalid_email");

  // A filled honeypot gets a 200 but must never reach the database.
  const bot = await request.post("/api/waitlist", { data: { ...base, website: "https://spam.example" } });
  expect(bot.status()).toBe(200);

  const real = await request.post("/api/waitlist", { data: base });
  // No database is configured in the browser QA environment.
  expect([200, 503]).toContain(real.status());
});


test("quota writes are server-owned and the waitlist status RPC is not public", async ({ request }) => {
  const usage = await request.post("/api/usage", { data: { kind: "messages", n: 1 } });
  expect(usage.status()).toBe(405);
  expect(usage.headers()["allow"]).toContain("GET");

  // No proof-of-signup cookie: no enumeration, no referral code disclosure.
  const status = await request.get("/api/waitlist/status");
  expect(status.status()).toBe(200);
  expect((await status.json()).status).toBeNull();
});


test("one keyboard owner: ⌘K opens the site palette and ⌘/ opens Playground shortcuts", async ({ page }) => {
  await page.goto("/#playground");
  const palette = page.getByRole("dialog", { name: "Command palette", exact: true });
  const playgroundKeys = page.getByRole("dialog", { name: "Playground shortcuts", exact: true });
  await expect(palette).toHaveCount(0);
  await expect(playgroundKeys).toHaveCount(0);

  await page.keyboard.press("Control+k");
  await expect(palette).toBeVisible();
  await expect(playgroundKeys).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(palette).toHaveCount(0);

  await page.keyboard.press("Control+/");
  await expect(playgroundKeys).toBeVisible();
  await expect(palette).toHaveCount(0);
});


test("footer labels are honest and the What's new link resolves to a real element", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("#continuation");
  await expect(footer.getByRole("link", { name: "Plans", exact: true })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Pricing", exact: true })).toHaveCount(0);

  await footer.getByRole("link", { name: "What's new", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "What's new", exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.locator("#whats-new")).toBeVisible();
  // The modal intentionally cleans the hash after opening.
  expect(new URL(page.url()).hash).toBe("");
});

test("security headers and a per-request CSP nonce let the app boot (B5)", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as Window & { __cspViolations?: string[] };
    w.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      const e = event as Event & { violatedDirective?: string };
      w.__cspViolations!.push(e.violatedDirective ?? "unknown");
    });
  });

  const response = await page.goto("/");
  const headers = response?.headers() ?? {};
  expect(headers["strict-transport-security"]).toMatch(/max-age=\d+/);
  expect(headers["x-content-type-options"]).toBe("nosniff");
  // No X-Frame-Options: the Arena/E2B preview embeds the site in an iframe.
  expect(headers["x-frame-options"]).toBeUndefined();

  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
  const nonce = /nonce-([a-z0-9]+)/.exec(csp)?.[1];
  expect(nonce?.length).toBeGreaterThan(8);

  // Browsers deliberately hide nonce *attributes* from getAttribute(); the
  // HTMLScriptElement.nonce property is the readable value.
  const scriptsWithoutNonce = await page
    .locator("script")
    .evaluateAll(
      (els, n) =>
        els
          .filter((el) => (el as HTMLScriptElement).nonce !== n)
          .map((el) => el.outerHTML.slice(0, 120)),
      nonce
    );
  expect(scriptsWithoutNonce).toEqual([]);

  // The pre-hydration inline script really ran, so the policy did not block it.
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro", /preparing|done/);
  await page.waitForLoadState("domcontentloaded");
  const violations = await page.evaluate(
    () => (window as Window & { __cspViolations?: string[] }).__cspViolations ?? []
  );
  expect(violations).toEqual([]);
});

test("feedback API rejects malformed ratings before touching storage (D3)", async ({ request }) => {
  expect((await request.post("/api/feedback", { data: { kind: "rating", message: "hi" } })).status()).toBe(400);
  expect((await request.post("/api/feedback", { data: { kind: "rating", message: "Valid message", rating: "sideways" } })).status()).toBe(400);
  expect([200, 500, 503]).toContain(
    (await request.post("/api/feedback", { data: { kind: "rating", message: "Valid message", rating: "up" } })).status()
  );
});

test("message ratings are consent-gated, sent with metadata and described honestly (D3)", async ({ page }) => {
  const ratings: Record<string, unknown>[] = [];
  await page.route("**/api/feedback", async (route) => {
    ratings.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto("/#playground");
  await page.evaluate(() => {
    const original = fetch.bind(window);
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      return new Response('A helpful answer.\u0000{"memory":null}', { headers: { "Content-Type": "text/plain" } });
    };
  });
  await page.getByRole("textbox", { name: "Message BudAI", exact: true }).fill("Give me a rating target.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#playground").getByText("A helpful answer.", { exact: true })).toBeVisible();

  // Cookies are declined by default in this suite: the rating stays local and says so.
  await page.getByRole("button", { name: "Helpful reply", exact: true }).click();
  await expect(page.getByText("Thanks — saved locally, nothing sent", { exact: true })).toBeVisible();
  expect(ratings).toHaveLength(0);
  expect(await page.evaluate(() => localStorage.getItem("budai_msg_feedback"))).toContain("up");

  // With consent the same control submits structured, bounded metadata.
  await page.evaluate(() => localStorage.setItem("budai-cookies", "accepted"));
  await page.getByRole("button", { name: "Unhelpful reply", exact: true }).click();
  await expect(page.getByText("Thanks — feedback sent", { exact: true })).toBeVisible();
  expect(ratings).toHaveLength(1);
  expect(ratings[0]).toMatchObject({
    kind: "rating", rating: "down", model: "quality", lang: "en", page: "/playground",
  });
  expect(typeof ratings[0].messageId).toBe("string");
  expect(String(ratings[0].messageId).length).toBeGreaterThan(0);
});

test("mobile playground tracks the visible viewport and gives message tools 44px targets (D12)", async ({ page }) => {
  await page.goto("/#playground");
  // React sets the visualViewport state after hydration.
  await expect(page.locator("html")).toHaveAttribute("data-pg-keyboard", /open|closed/);
  const state = await page.evaluate(() => ({
    keyboard: document.documentElement.dataset.pgKeyboard,
    visualHeight: getComputedStyle(document.documentElement).getPropertyValue("--pg-visual-height").trim(),
    overlap: getComputedStyle(document.documentElement).getPropertyValue("--pg-keyboard-overlap").trim(),
  }));
  expect(state.keyboard).toBe("closed");
  expect(state.visualHeight).toMatch(/^\d+px$/);
  expect(state.overlap).toMatch(/^\d+px$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const original = fetch.bind(window);
    window.fetch = async (resource, init) => {
      if (!String(resource).endsWith("/api/playground")) return original(resource, init);
      return new Response('Mobile test answer.\u0000{"memory":null}', { headers: { "Content-Type": "text/plain" } });
    };
  });
  await page.getByRole("textbox", { name: "Message BudAI", exact: true }).fill("Touch target check.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#playground").getByText("Mobile test answer.", { exact: true })).toBeVisible();

  const sizes = await page.locator(".pg-msg-tool").evaluateAll((els) =>
    els.map((el) => ({ w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }))
  );
  expect(sizes.length).toBeGreaterThan(3);
  for (const size of sizes) {
    expect(size.w).toBeGreaterThanOrEqual(44);
    expect(size.h).toBeGreaterThanOrEqual(44);
  }
});

test("social metadata uses one image URL and publishes Organization JSON-LD (A7/F2)", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const head = await page.evaluate(() => {
    const meta = (selector: string) => document.querySelector(selector)?.getAttribute("content") ?? null;
    const raw = document.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}";
    return {
      og: meta('meta[property="og:image"]'),
      twitter: meta('meta[name="twitter:image"]'),
      ld: JSON.parse(raw) as { "@graph"?: Array<{ "@type"?: string }> },
    };
  });
  expect(head.og).toBeTruthy();
  expect(head.og).toBe(head.twitter);
  expect(head.og).toContain("/og.png");
  const types = (head.ld["@graph"] ?? []).map((node) => node["@type"]);
  expect(types).toContain("SoftwareApplication");
  expect(types).toContain("Organization");
});
