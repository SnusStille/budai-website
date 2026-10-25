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
