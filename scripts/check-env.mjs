/**
 * Local environment check (no dependencies, no secrets printed).
 *
 *   npm run check:env                 # informational, always exits 0
 *   npm run check:env -- --strict    # exit 1 on missing/invalid REQUIRED vars
 *   npm run check:env -- --json      # machine-readable summary
 *
 * Reads .env then .env.local (local wins), then real process.env (Vercel/CI
 * wins). Only presence, shape and length are reported — never values.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const strict = process.argv.includes("--strict");
const asJson = process.argv.includes("--json");

const FILES = [".env", ".env.local"];
const PLACEHOLDER = /your[-_]|changeme|change-me|placeholder|example\.com|xxx|<[^>]+>|^\.\.\.$/i;

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const loaded = [];
let fileValues = {};
for (const file of FILES) {
  const full = path.join(cwd, file);
  if (!existsSync(full)) continue;
  const parsed = parseEnv(readFileSync(full, "utf8"));
  fileValues = { ...fileValues, ...parsed };
  loaded.push(`${file} (${Object.keys(parsed).length} vars)`);
}

// Only keys the app actually reads are pulled from the process environment.
const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD", "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "OPENAI_IMAGE_MODEL",
  "NEXT_PUBLIC_SITE_URL", "ANTHROPIC_MODEL", "ANTHROPIC_MODEL_FAST", "ANTHROPIC_MODEL_DEEP",
  "BUDAI_AI_DISABLED", "ANTHROPIC_WORKSPACE_ID",
];
const values = { ...fileValues };
for (const key of ENV_KEYS) {
  if (typeof process.env[key] === "string" && process.env[key] !== "") values[key] = process.env[key];
}

const isHttps = (v) => /^https:\/\/[^\s/]+\.[^\s/]+/i.test(v) && !PLACEHOLDER.test(v);
const real = (v) => !!v && !PLACEHOLDER.test(v) && v.length >= 16;

const VARS = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", tier: "required", label: "Supabase project URL",
    ok: isHttps, hint: "Set to https://<project>.supabase.co. Public by design." },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", tier: "required", label: "Supabase anon key",
    ok: real, hint: "Public key, protected by RLS." },
  { key: "SUPABASE_SERVICE_ROLE_KEY", tier: "required", label: "Supabase service-role key",
    ok: real, hint: "SERVER ONLY. Without it quotas, waitlist status, admin and feedback are disabled." },
  { key: "ANTHROPIC_API_KEY", tier: "required", label: "Anthropic API key",
    ok: real, hint: "SERVER ONLY. Without it /api/playground returns 503." },
  { key: "ADMIN_PASSWORD", tier: "required", label: "Admin password",
    ok: (v) => !!v && !PLACEHOLDER.test(v) && v.length >= 12,
    hint: "SERVER ONLY, at least 12 chars. Without it /admin returns 503." },
  { key: "NEXT_PUBLIC_SITE_URL", tier: "recommended", label: "Canonical site URL",
    ok: isHttps, hint: "Used for canonical/OG/JSON-LD. Defaults to https://stilledev.se." },
  { key: "ANTHROPIC_MODEL", tier: "optional", label: "Default chat model",
    ok: real, hint: "Optional model id for the Quality tier." },
  { key: "ANTHROPIC_MODEL_FAST", tier: "optional", label: "Fast tier model",
    ok: real, hint: "Set any tier to show the model picker; unset = 'BudAI Core'." },
  { key: "ANTHROPIC_MODEL_DEEP", tier: "optional", label: "Deep tier model",
    ok: real, hint: "Set any tier to show the model picker." },
  { key: "OPENAI_API_KEY", tier: "optional", label: "OpenAI image key",
    ok: real, hint: "Only for optional image generation; otherwise /api/generate-image returns 501." },
  { key: "OPENAI_IMAGE_MODEL", tier: "optional", label: "OpenAI image model",
    ok: real, hint: "Defaults to gpt-image-1." },
  { key: "BUDAI_AI_DISABLED", tier: "optional", label: "Emergency AI switch",
    ok: (v) => !v || v === "0" || v === "1", hint: "Set to 1 only to pause all Playground generation." },
];

const warnings = [];
if (values.SUPABASE_SERVICE_ROLE_KEY && values.SUPABASE_SERVICE_ROLE_KEY === values.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  warnings.push("SUPABASE_SERVICE_ROLE_KEY is identical to the anon key — use the real service-role key.");
}
if (values.BUDAI_AI_DISABLED === "1") {
  warnings.push("BUDAI_AI_DISABLED=1 — all Playground generation is currently paused.");
}
if (values.ANTHROPIC_WORKSPACE_ID) {
  warnings.push("ANTHROPIC_WORKSPACE_ID is no longer read by the code; it is safe to remove.");
}
if (!loaded.length && !Object.keys(values).length) {
  warnings.push("No .env.local found. Copy .env.example → .env.local and fill in the values.");
}

const results = VARS.map((v) => {
  const raw = values[v.key] ?? "";
  const present = raw.length > 0;
  const valid = present ? !!v.ok(raw) : false;
  return { key: v.key, tier: v.tier, label: v.label, present, valid, hint: v.hint, length: raw.length };
});
const missing = results.filter((r) => r.tier === "required" && !r.valid);
const recommendedMissing = results.filter((r) => r.tier === "recommended" && !r.valid);

if (asJson) {
  console.log(JSON.stringify({ loaded, results, warnings, missingRequired: missing.map((r) => r.key), strict }, null, 2));
} else {
  console.log(`BudAI environment check — ${cwd}`);
  console.log(`Loaded: ${loaded.length ? loaded.join(", ") : "no env file (process.env only)"}\n`);
  for (const tier of ["required", "recommended", "optional"]) {
    console.log(`${tier.toUpperCase()}`);
    for (const r of results.filter((x) => x.tier === tier)) {
      const mark = !r.present && tier === "optional" ? "-" : r.valid ? "✓" : r.present ? "!" : "✗";
      console.log(`  ${mark} ${r.key.padEnd(34)} ${r.present ? `set (${r.length} chars)` : "not set"}`);
      if (mark === "!" || (mark === "✗" && tier !== "optional")) console.log(`      ${r.hint}`);
    }
    console.log("");
  }
  if (warnings.length) {
    console.log("WARNINGS");
    for (const w of warnings) console.log(`  ! ${w}`);
    console.log("");
  }
  console.log(
    `Summary: ${results.filter((r) => r.tier === "required" && r.valid).length}/${results.filter((r) => r.tier === "required").length} required OK, ` +
      `${recommendedMissing.length} recommended missing, ${warnings.length} warning(s).`
  );
  console.log("Values are never printed. Next: run supabase/schema.sql + MIGRATION_v2…v11, then npm run dev.");
  console.log("Use --strict to fail on missing required values (e.g. in a deployment check).");
}

if (strict && missing.length) {
  if (!asJson) console.error(`\nStrict mode: ${missing.length} required value(s) missing or invalid: ${missing.map((m) => m.key).join(", ")}`);
  process.exit(1);
}
