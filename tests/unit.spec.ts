import { test, expect } from "@playwright/test";
import { INTRO_MS, INTRO_REVEAL_MS, INTRO_READY_MS } from "../lib/experience/intro";
import { cameraAt, CHAPTERS, journeyAt, worldChapterAt, worldOpacityAt } from "../lib/experience/timeline";
import { brainCameraAt, brainFovAt, brainJourneyProgress, brainVisualAt, playgroundProjectionAt, BRAIN_STORY_ORIGIN } from "../lib/experience/brain";
import { codeCharactersAt, CODE_LENGTH, EXAMPLE_SOURCE, tokenizeLine } from "../lib/experience/code";
import { readFileSync, mkdtempSync, rmSync, writeFileSync as fsWrite } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { LIMITS, limitFor } from "../lib/limits";
import { RULES, checkRateLimit, clientIp, rateLimitKey } from "../lib/rate-limit";
import { validateWaitlist } from "../lib/waitlist-validation";
import { signWaitlistEmail, verifyWaitlistToken } from "../lib/waitlist-status";
import { aiUsageEvent } from "../lib/ai-usage";
import { buildCsp } from "../lib/csp";
import { KEYBOARD_OVERLAP_THRESHOLD_PX, keyboardOverlap } from "../lib/playground/viewport";

test("one readiness deadline and camera/reveal timing stay bounded without a logo timeline",()=>{
  expect(INTRO_MS+INTRO_REVEAL_MS).toBeLessThanOrEqual(4000);
  expect(INTRO_READY_MS+INTRO_MS+INTRO_REVEAL_MS).toBeLessThanOrEqual(4500);
});

test("camera path is finite, continuous at all chapter boundaries, and exactly reversible", () => {
  for (const mobile of [false, true]) {
    for (let i = 0; i <= (CHAPTERS.length - 1) * 100; i++) {
      const p = i / 100;
      const a = cameraAt(p, .4, mobile);
      expect([...a.position, ...a.target].every(Number.isFinite)).toBe(true);
      expect(a).toEqual(cameraAt(p, .4, mobile));
      if (i > 0) {
        const b = cameraAt(p - .0001, .4, mobile);
        expect(Math.hypot(...a.position.map((n, j) => n - b.position[j]))).toBeLessThan(.02);
      }
    }
  }
});

test("native scroll reconstructs every chapter in both directions", () => {
  const bounds = CHAPTERS.map((s, i) => ({ id: s.id, top: i * 2000, height: 2000 }));
  const forward = Array.from({ length: 121 }, (_, i) => journeyAt(i * 100, 900, 12000, bounds));
  const reverse = Array.from({ length: 121 }, (_, i) => journeyAt((120 - i) * 100, 900, 12000, bounds)).reverse();
  expect(forward).toEqual(reverse);
  expect(forward.at(-1)?.chapter).toBe(CHAPTERS.length - 1);
  expect(forward[0].chapter).toBe(0);
});

test("code reveal is deterministic, monotonic, bounded, and preserves every source character", () => {
  let previous = 0;
  for (let i = 0; i <= 100; i++) {
    const n = codeCharactersAt(i / 100);
    expect(n).toBeGreaterThanOrEqual(previous);
    expect(n).toBeLessThanOrEqual(CODE_LENGTH);
    previous = n;
  }
  expect(codeCharactersAt(0)).toBe(0);
  expect(codeCharactersAt(1)).toBe(CODE_LENGTH);
  expect(EXAMPLE_SOURCE.split("\n").map((line) => tokenizeLine(line).map(t => t.text).join("")).join("\n")).toBe(EXAMPLE_SOURCE);
});

 test("brain travel is absolute, continuous, enters the anatomy and reverses exactly", () => {
  expect(brainCameraAt({kind:"intro",progress:1}).z).toBeLessThan(brainCameraAt({kind:"intro",progress:0}).z);
  for (let i=0;i<=100;i++) {
    const p=i/100;
    const pose=brainCameraAt({kind:"journey",progress:p});
    expect(Object.values(pose).every(Number.isFinite)).toBe(true);
    expect(pose).toEqual(brainCameraAt({kind:"journey",progress:p}));
    if(i>0) expect(pose.z).toBeLessThan(brainCameraAt({kind:"journey",progress:p-.01}).z);
  }
  expect(brainCameraAt({kind:"journey",progress:1}).z).toBeLessThan(-2);
  expect(brainJourneyProgress(2800,1000,2800,1000)).toBe(1);
  expect(brainJourneyProgress(500,1000,2800,1000)).toBe(0);
 });

test("mobile brain uses one full-height target and a finite reversible perspective lens", () => {
  const hero = brainFovAt({ kind:"intro", progress:0 }, 844, true);
  expect(hero).toBeGreaterThan(.87);
  expect(brainFovAt({ kind:"journey", progress:0, entry:0 },844,true)).toBe(.87);
  expect(brainFovAt({ kind:"journey", progress:.5, entry:1 },844,true)).toBe(.87);
  expect(brainFovAt({ kind:"intro", progress:0 },1000,false)).toBe(.87);
  for (const height of [0, 370, 667, 844, 1200]) for (const entry of [0,.1,.5,.9,1]) {
    const fov = brainFovAt({ kind:"journey",progress:entry,entry },height,true);
    expect(Number.isFinite(fov)).toBe(true); expect(fov).toBeGreaterThan(0); expect(fov).toBeLessThan(Math.PI);
  }
  expect(new Set(CHAPTERS.map(c=>c.number)).size).toBe(CHAPTERS.length);
});

test("world departure is reversible and its invisible landing state is genuinely dormant", () => {
  expect(worldOpacityAt({chapter:0,sections:{signal:0}})).toBe(0);
  expect(worldOpacityAt({chapter:3,sections:{signal:1}})).toBeGreaterThan(0);
  expect(worldChapterAt({chapter:4,departure:1})).toBe(5);
  expect(worldChapterAt({chapter:6,departure:1})).toBe(6);
  const values = [0,.1,.5,.9,1].map(departure=>worldChapterAt({chapter:4,departure}));
  expect([...values].sort((a,b)=>a-b)).toEqual(values);
  expect([1,.9,.5,.1,0].map(departure=>worldChapterAt({chapter:4,departure})).reverse()).toEqual(values);
});

test("opening actually crosses the cortex and resolves into the continuous hero brain pose without branding morph",()=>{
  const poses=Array.from({length:101},(_,i)=>brainCameraAt({kind:"intro",progress:i/100}));
  expect(poses.some(p=>p.z<.8&&p.z>-.8)).toBe(true);
  expect(poses.at(-1)!.z).toBeLessThan(0);
  const end=poses.at(-1)!,hero=brainCameraAt({kind:"hero",progress:0}),journeyStart=brainCameraAt({kind:"journey",progress:0});
  for(const key of ["x","y","z","yaw","tilt"] as const){
    expect(end[key]).toBeCloseTo(hero[key],8);
    expect(hero[key]).toBeCloseTo(journeyStart[key],8);
  }
  expect(brainVisualAt({kind:"intro",progress:1})).not.toHaveProperty("identity");
  expect(brainVisualAt({kind:"intro",progress:1}).offset).toBeCloseTo(brainVisualAt({kind:"hero",progress:0}).offset,8);
  expect(brainCameraAt({kind:"journey",progress:.86}).z-BRAIN_STORY_ORIGIN).toBeLessThan(0);
  expect(playgroundProjectionAt(1)).toEqual({depth:0,tilt:0});
});

test("the recovered story retains all four original stages and the identity volume is real, finite geometry",async()=>{
  const {ORIGINAL_BRAIN_STAGES}=await import("../lib/experience/brain-story");
  const {identityVolume}=await import("../lib/experience/identity-volume");
  const {sampleBrandVolume,brandContours}=await import("../lib/brand");
  expect(ORIGINAL_BRAIN_STAGES.map(s=>s.en.title)).toEqual(["Write","Memory","Decide","Voice & vision"]);
  expect(brandContours()).toHaveLength(3);
  const vertices=identityVolume();expect(vertices.length).toBeGreaterThan(3000);expect(vertices.length%18).toBe(0);
  expect(Array.from(vertices).every(Number.isFinite)).toBe(true);
  for(let i=0;i<vertices.length;i+=6)expect(Math.hypot(vertices[i+3],vertices[i+4],vertices[i+5])).toBeCloseTo(1,5);
  expect(sampleBrandVolume(100)).toEqual(sampleBrandVolume(100));
});

test("DOM-to-world unprojection follows the actual projection matrix",async()=>{
  const {worldAtNdc}=await import("../lib/experience/projection");
  const f=2.2,aspect=1.44,m=[f/aspect,0,0,0,0,f,0,0,0,0,-1,-1,0,0,-.1,0];
  for(const x of [-.8,0,.7])for(const y of [-.6,0,.9]){
    const [a,b,z]=worldAtNdc(m,x,y,-8),w=-z;
    expect((m[0]*a)/w).toBeCloseTo(x,7);expect((m[5]*b)/w).toBeCloseTo(y,7);
  }
});

test("model choices are configuration-aware public IDs; arbitrary or unavailable provider models are rejected",async()=>{
  const {publicModelOptions,resolveModelTier}=await import("../lib/ai-models");
  expect(publicModelOptions({})).toEqual([{id:"quality",label:"Quality"}]);
  const env={ANTHROPIC_MODEL:"private-quality",ANTHROPIC_MODEL_FAST:"private-fast",ANTHROPIC_MODEL_DEEP:"private-deep"};
  expect(publicModelOptions(env).map(o=>o.id)).toEqual(["quality","fast","deep"]);
  expect(JSON.stringify(publicModelOptions(env))).not.toContain("private-");
  expect(resolveModelTier("fast",env)).toBe("private-fast");expect(resolveModelTier("deep",env)).toBe("private-deep");
  expect(resolveModelTier(undefined,env)).toBe("private-quality");
  expect(resolveModelTier("fast",{})).toBeNull();expect(resolveModelTier("attacker-model",env)).toBeNull();expect(resolveModelTier({model:"private-fast"},env)).toBeNull();
});

test("closing is continuous/reversible and reaches a stable end even on a short desktop footer",async()=>{
  const {closingProgressAt}=await import("../lib/experience/timeline");
  expect(closingProgressAt(9000,10000,1000,9950)).toBe(0);expect(closingProgressAt(9950,10000,1000,9950)).toBe(1);
  const forward=Array.from({length:101},(_,i)=>cameraAt(6,.4,false,i/100));
  expect(forward).toEqual(Array.from({length:101},(_,i)=>cameraAt(6,.4,false,(100-i)/100)).reverse());
  for(let i=1;i<forward.length;i++)expect(Math.hypot(...forward[i].position.map((v,k)=>v-forward[i-1].position[k]))).toBeLessThan(.04);
});

test("information records are finite, sparse and grouped by the six actual capability labels",async()=>{
  const {capabilityRecords}=await import("../lib/experience/information-patterns");const rows=capabilityRecords();
  expect(rows.length).toBeLessThan(150);for(let lane=0;lane<6;lane++)expect(rows.some(r=>r.lane===lane)).toBe(true);
  expect(rows.every(r=>[r.x,r.y,r.z,r.lane].every(Number.isFinite))).toBe(true);expect(rows).toEqual(capabilityRecords());
});

test("handoff dolly remains forward and angularly restrained, without a tiny distant product",()=>{
  const poses=Array.from({length:101},(_,i)=>brainCameraAt({kind:"journey",progress:i/100}));
  expect(poses.every(p=>Math.abs(p.yaw)<=.15&&Math.abs(p.tilt)<=.14)).toBe(true);
  expect(playgroundProjectionAt(.68).depth).toBeLessThan(500);expect(playgroundProjectionAt(.68).tilt).toBeLessThan(2);
  for(let i=1;i<poses.length;i++)expect(poses[i].z).toBeLessThan(poses[i-1].z);
});

test("CHAPTERS renumbers Roadmap to 05 and omits the removed standalone 05 Next Signal chapter",()=>{
  expect(CHAPTERS.map(c=>({id:c.id,number:c.number}))).toEqual([
    {id:"intelligence",number:"00"},
    {id:"signal",number:"01"},
    {id:"playground",number:"02"},
    {id:"capabilities",number:"03"},
    {id:"about",number:"04"},
    {id:"roadmap",number:"05"},
  ]);
  expect(CHAPTERS.some(c=>String(c.id)==="waitlist")).toBe(false);
});


test("daily-limit copy reads the single LIMITS source instead of hardcoded numbers", () => {
  expect(limitFor("guest", "messages")).toBe(LIMITS.guest.messagesPerDay);
  expect(limitFor("member", "messages")).toBe(LIMITS.member.messagesPerDay);
  const copyFiles = [
    "components/sections/AIPlayground.tsx",
    "components/sections/Capabilities.tsx",
    "components/sections/Hero.tsx",
    "components/sections/Journey.tsx",
    "components/experience/CapabilityStudioScreen.tsx",
    "lib/changelog.ts",
    "lib/experience/developer-room.ts",
  ];
  const stale = /12\s*\/\s*(?:dag|day)|80\s*\/\s*(?:dag|day)|12 meddelanden|80 meddelanden|12 messages\/day|80 messages\/day|10\s*\/\s*day|35\s*\/\s*day/;
  for (const file of copyFiles) {
    const source = readFileSync(file, "utf8");
    expect(source, `${file} still hardcodes a daily limit`).not.toMatch(stale);
    expect(source, `${file} does not use LIMITS`).toContain("LIMITS.");
  }
});


test("shared rate limiter enforces per-rule windows and reports Retry-After", () => {
  const rule = { name: "unit-b1-a", limit: 3, windowMs: 60_000 };
  const t = 1_700_000_000_000;
  expect(checkRateLimit("b1-a", rule, t)).toMatchObject({ limited: false, remaining: 2 });
  expect(checkRateLimit("b1-a", rule, t + 10)).toMatchObject({ limited: false, remaining: 1 });
  expect(checkRateLimit("b1-a", rule, t + 20)).toMatchObject({ limited: false, remaining: 0 });
  const blocked = checkRateLimit("b1-a", rule, t + 30);
  expect(blocked.limited).toBe(true);
  expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  // A new key and a new rule are independent buckets.
  expect(checkRateLimit("b1-b", rule, t + 30).limited).toBe(false);
  expect(checkRateLimit("b1-a-rule-c", { ...rule, name: "unit-b1-c" }, t + 30).limited).toBe(false);
  // The window really expires.
  expect(checkRateLimit("b1-a", rule, t + rule.windowMs).limited).toBe(false);
  expect(RULES.playground.limit).toBeGreaterThan(RULES.feedback.limit);
});

test("client IP and limiter keys are bounded and never keep a raw address", () => {
  const req = (headers: Record<string, string>) =>
    ({ headers: new Headers(headers) } as unknown as import("next/server").NextRequest);
  expect(clientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  expect(clientIp(req({ "x-vercel-forwarded-for": "198.51.100.4", "x-forwarded-for": "spoofed" }))).toBe("198.51.100.4");
  expect(clientIp(req({}))).toBe("unknown");
  expect(clientIp(req({ "x-forwarded-for": "x".repeat(500) })).length).toBeLessThanOrEqual(64);
  const key = rateLimitKey(req({ "x-forwarded-for": "203.0.113.7" }), RULES.share);
  expect(key).toMatch(/^[a-f0-9]{64}$/);
  expect(key).not.toContain("203");
  expect(rateLimitKey(req({ "x-forwarded-for": "203.0.113.7" }), RULES.playground)).not.toBe(key);
});


test("waitlist validation sanitises input and never trusts client-side priority", () => {
  const base = { email: "  Person@Example.COM ", consent: true, account_type: "individual", name: "  Person  " };
  const ok = validateWaitlist({ ...base, priority: 9999, discount_code: "FREE", tags: ["admin"] });
  expect(ok.ok).toBe(true);
  if (!ok.ok) return;
  expect(ok.value.email).toBe("person@example.com");
  expect(ok.value.name).toBe("Person");
  expect(ok.value.priority).toBe(45);
  expect(ok.value.discount_code).toBeNull();
  expect(ok.value.tags).toEqual(["individual"]);
  expect(ok.value.access_status).toBe("pending");

  expect(validateWaitlist({ ...base, consent: false })).toMatchObject({ ok: false, error: "consent_required" });
  expect(validateWaitlist({ ...base, email: "nope" })).toMatchObject({ ok: false, error: "invalid_email" });
  expect(validateWaitlist({ ...base, website: "spam" })).toMatchObject({ ok: false, error: "honeypot" });
  expect(validateWaitlist(null)).toMatchObject({ ok: false, error: "invalid_email" });

  const company = validateWaitlist({ ...base, account_type: "company", company: "Acme", employees: "1-10", referral: "abc" });
  expect(company.ok).toBe(true);
  if (!company.ok) return;
  expect(company.value).toMatchObject({ account_type: "company", company: "Acme", employees: "1-10", priority: 60, source: "referral", notes: "referral:abc" });
});


test("waitlist status proof is signed, tamper-proof and needs a server secret", () => {
  const previous = process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  expect(signWaitlistEmail("person@example.com")).toBeNull();

  process.env.ADMIN_PASSWORD = "unit-test-secret";
  const token = signWaitlistEmail("person@example.com");
  expect(token).toBeTruthy();
  expect(verifyWaitlistToken(token!)).toBe("person@example.com");
  expect(verifyWaitlistToken(undefined)).toBeNull();
  expect(verifyWaitlistToken(token!.replace(/.$/, "x"))).toBeNull();
  expect(verifyWaitlistToken("garbage")).toBeNull();

  if (previous === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = previous;
});


test("AI usage events clamp token counts and never carry prompts or invented cost", () => {
  const entry = aiUsageEvent({
    provider: "anthropic", operation: "chat", model: "x".repeat(200), tier: "member",
    stream: true, ok: true, inputTokens: -5, outputTokens: 123.7, durationMs: 3000,
  });
  expect(entry.event).toBe("ai.usage");
  expect(entry.model.length).toBeLessThanOrEqual(80);
  expect(entry.inputTokens).toBe(0);
  expect(entry.outputTokens).toBe(124);
  expect(entry.durationMs).toBe(3000);
  expect(entry.tier).toBe("member");
  expect(JSON.stringify(entry)).not.toMatch(/cost|price|prompt|email|apiKey/i);

  expect(aiUsageEvent({ provider: "openai", operation: "image", status: 429 }).status).toBe(429);
  expect(aiUsageEvent({ provider: "openai", operation: "image", tier: "admin" as never }).tier).toBe("unknown");
  expect(aiUsageEvent({ provider: "anthropic", operation: "chat", inputTokens: Number.NaN }).inputTokens).toBe(0);
});


test("CSP uses a per-request nonce and blocks the risky default sources", () => {
  const a = buildCsp("nonceA");
  const b = buildCsp("nonceB");
  expect(a).toContain("nonce-nonceA");
  expect(b).toContain("nonce-nonceB");
  expect(a).not.toBe(b);
  expect(a).toContain("default-src 'self'");
  expect(a).toContain("object-src 'none'");
  expect(a).toContain("base-uri 'self'");
  expect(a).toContain("form-action 'self'");
  expect(a).toContain("'strict-dynamic'");
  expect(a).not.toContain("upgrade-insecure-requests");
  expect(a).not.toContain("frame-ancestors"); // cross-origin preview iframe
  expect(a).not.toContain("script-src 'self' 'unsafe-inline'");
  expect(a).toContain("https://va.vercel-scripts.com");
});


test("secret scanner fails on a new key, accepts placeholders and never prints the value (B4)", () => {
  const scanner = resolve(process.cwd(), "scripts/scan-secrets.mjs");
  const dir = mkdtempSync(join(tmpdir(), "budai-secret-scan-"));
  const run = () => spawnSync(process.execPath, [scanner, "--working-tree"], { cwd: dir, encoding: "utf8" });
  try {
    execFileSync("git", ["init", "-q"], { cwd: dir });
    fsWrite(join(dir, "config.example"), "ANTHROPIC_API_KEY=your-anthropic-key\n");
    execFileSync("git", ["add", "-A"], { cwd: dir });
    const clean = run();
    expect(clean.status).toBe(0);
    expect(clean.stdout).toContain("clean");

    // Build the fake key at runtime so the scanner does not flag this test itself.
    const secret = ["sk-ant-", "api03-", "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"].join("");
    fsWrite(join(dir, "leak.txt"), `${secret}\n`);
    execFileSync("git", ["add", "-A"], { cwd: dir });
    const leaked = run();
    expect(leaked.status).toBe(1);
    expect(leaked.stderr).toContain("anthropic-api-key");
    expect(`${leaked.stdout}${leaked.stderr}`).not.toContain(secret);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});


test("D12 keyboard overlap is bounded and ignores browser chrome", () => {
  expect(keyboardOverlap(844, 844, 0)).toBe(0);
  expect(keyboardOverlap(844, 544, 0)).toBe(300);
  expect(keyboardOverlap(844, 544, 60)).toBe(240);
  expect(keyboardOverlap(844, 900, 0)).toBe(0);
  expect(keyboardOverlap(844, Number.NaN, 0)).toBe(0);
  expect(keyboardOverlap(844, 100, 0)).toBeLessThanOrEqual(844);
  expect(KEYBOARD_OVERLAP_THRESHOLD_PX).toBeGreaterThan(0);
  expect(keyboardOverlap(844, 844 - KEYBOARD_OVERLAP_THRESHOLD_PX, 0))
    .toBe(KEYBOARD_OVERLAP_THRESHOLD_PX);
});


test("env checker is redacted, strict only when asked, and catches anon/service-role confusion (step 18)", () => {
  const checker = resolve(process.cwd(), "scripts/check-env.mjs");
  const dir = mkdtempSync(join(tmpdir(), "budai-env-check-"));
  const emptyEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "",
    NODE_ENV: "test",
  };
  // Build key-like literals at runtime so the secret scanner does not flag this file.
  const secret = ["sk-ant-", "example-ONLY-FOR-TESTS-0123456789"].join("");
  const longModelKey = ["sk-ant-", "example-long-enough-value-000000"].join("");
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [checker, ...args], { cwd: dir, env: emptyEnv, encoding: "utf8" });

  try {
    const missing = run("--strict");
    expect(missing.status).toBe(1);
    expect(missing.stdout).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(run().status).toBe(0); // informational mode never fails

    fsWrite(join(dir, ".env.local"), `ANTHROPIC_API_KEY=${secret}\n` + [
      "NEXT_PUBLIC_SUPABASE_URL=https://abc123def.supabase.co",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiJ9.long-enough-anon-value-000000",
      "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiJ9.long-enough-service-value-0000",
      "ADMIN_PASSWORD=a-long-unique-local-password",
      "NEXT_PUBLIC_SITE_URL=https://stilledev.se",
    ].join("\n") + "\n");

    const ok = run("--strict");
    expect(ok.status).toBe(0);
    expect(ok.stdout).toContain("5/5 required OK");
    expect(`${ok.stdout}${ok.stderr}`).not.toContain(secret);
    expect(`${ok.stdout}${ok.stderr}`).not.toContain("long-enough-service-value");

    // A service-role key that is really the public anon key must be flagged.
    fsWrite(join(dir, ".env.local"), [
      "NEXT_PUBLIC_SUPABASE_URL=https://abc123def.supabase.co",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiJ9.same-key-value-0000000000",
      "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiJ9.same-key-value-0000000000",
      `ANTHROPIC_API_KEY=${longModelKey}`,
      "ADMIN_PASSWORD=a-long-unique-local-password",
      "NEXT_PUBLIC_SITE_URL=https://stilledev.se",
      "BUDAI_AI_DISABLED=1",
    ].join("\n") + "\n");
    const confused = run();
    expect(confused.status).toBe(0);
    expect(confused.stdout).toContain("identical to the anon key");
    expect(confused.stdout).toContain("currently paused");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
