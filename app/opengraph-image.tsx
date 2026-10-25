import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "BudAI — AI work in Swedish and English. Developed by Stilledev.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The exact same first-party, correctly typeset artwork as the explicit OG/Twitter image. */
export default async function Image() {
  const png = await readFile(path.join(process.cwd(), "public", "og.png"));
  return new Response(new Uint8Array(png), { headers: { "Content-Type": contentType } });
}
