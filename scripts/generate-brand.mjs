/** Reproducible first-party brand assets. Start the local app before running. Node >=22. */
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { browserRuntime } from "./browser-runtime.mjs";
import { BUDAI_BRAND, budaiMarkSvg } from "../lib/brand.ts";

await writeFile("public/favicon.svg", budaiMarkSvg({ background: true }));
await writeFile("public/budai-mark-on-dark.svg", budaiMarkSvg());
await writeFile("public/budai-mark-on-light.svg", budaiMarkSvg({ light: true }));
const browser = await chromium.launch({ ...(await browserRuntime()), headless: true });
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto(process.env.TEST_BASE_URL || "http://127.0.0.1:3000");
  await page.evaluate(async () => {
    await document.fonts.load('650 110px "Plus Jakarta Sans Variable"');
    await document.fonts.load('400 24px "Plus Jakarta Sans Variable"');
    await document.fonts.load('400 12px "JetBrains Mono Variable"');
    await document.fonts.ready;
  });
  for (const [file, size] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
    const data = await page.evaluate(async ({ svg, size }) => {
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
      const img = new Image(); img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      await img.decode(); canvas.getContext("2d").drawImage(img, 0, 0, size, size);
      return canvas.toDataURL("image/png").split(",")[1];
    }, { svg: budaiMarkSvg({ installed: size > 32, background: true }), size });
    await writeFile(`public/${file}`, Buffer.from(data, "base64"));
  }
  const social = await page.evaluate(async ({ colors, svg }) => {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = colors.dark; ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = "#263c47"; ctx.lineWidth = 1;
    for (const y of [106, 508]) { ctx.beginPath(); ctx.moveTo(96, y); ctx.lineTo(1104, y); ctx.stroke(); }
    ctx.font = '400 12px "JetBrains Mono Variable"'; ctx.letterSpacing = "2px"; ctx.fillStyle = "#88a6b3";
    ctx.fillText("BUDAI / DEVELOPER PREVIEW", 96, 76);
    ctx.textAlign = "right"; ctx.fillText("SV + EN", 1104, 76); ctx.textAlign = "left";
    const img = new Image(); img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`; await img.decode();
    ctx.drawImage(img, 110, 176, 288, 288);
    ctx.fillStyle = colors.light; ctx.letterSpacing = "-6px"; ctx.font = '650 110px "Plus Jakarta Sans Variable"';
    ctx.fillText("BudAI", 440, 318);
    ctx.font = '400 24px "Plus Jakarta Sans Variable"'; ctx.letterSpacing = "-.5px"; ctx.fillStyle = "#a0b9c5";
    ctx.fillText("AI work. In Swedish and English.", 445, 373);
    ctx.font = '400 12px "JetBrains Mono Variable"'; ctx.letterSpacing = "2px"; ctx.fillStyle = "#88a6b3";
    ctx.fillText("DEVELOPED BY STILLEDEV", 96, 554);
    ctx.textAlign = "right"; ctx.fillText("BUILT IN SWEDEN", 1104, 554);
    return canvas.toDataURL("image/png").split(",")[1];
  }, { colors: BUDAI_BRAND, svg: budaiMarkSvg() });
  await writeFile("public/og.png", Buffer.from(social, "base64"));
  console.log("Generated Fold SVGs, 32/180/192/512px PNG icons and 1200×630 social image from the shared brand path.");
} finally { await browser.close(); }
