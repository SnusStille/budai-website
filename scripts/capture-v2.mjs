import fs from "node:fs/promises";
import { chromium } from "@playwright/test";
import { browserRuntime } from "./browser-runtime.mjs";

const runtime = await browserRuntime();
Object.assign(process.env, runtime.env);
const browser = await chromium.launch({ executablePath: runtime.executablePath, args: runtime.args, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
await page.route("**/*.supabase.co/**", route => route.abort());
await fs.mkdir("test-results/audit-v2", { recursive: true });
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const results = [];
async function capture(path, name, width, height, fullPage = false) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, title: document.title, lang: document.documentElement.lang, h1: document.querySelector("h1")?.textContent }));
  results.push({ path, name, ...dimensions });
  await page.screenshot({ path: `test-results/audit-v2/${name}.png`, fullPage });
}
await capture("/", "home-desktop-top", 1440, 1000);
await capture("/", "home-desktop-full", 1440, 1000, true);
await capture("/", "home-tablet-top", 900, 1000);
await capture("/", "home-mobile-top", 390, 844);
await capture("/", "home-mobile-full", 390, 844, true);
for (const route of ["budai", "roadmap", "knowledge", "labs", "about", "feedback", "changelog", "legal/privacy"]) {
  await capture(`/${route}`, `${route.replaceAll("/", "-")}-desktop-full`, 1280, 900, true);
  await capture(`/${route}`, `${route.replaceAll("/", "-")}-mobile-top`, 390, 844);
}
await capture("/sv", "swedish-mobile-top", 390, 844);
await fs.writeFile("test-results/audit-v2/results.json", JSON.stringify({ results, errors }, null, 2));
console.log(JSON.stringify({ results, errors }, null, 2));
await browser.close();
