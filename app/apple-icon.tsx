import { renderAppIcon } from "./_icon/AppIconArt";

/**
 * iOS home-screen icon. Apple ignores SVG touch icons, so this is generated as a
 * real PNG (180×180) at request time — no binary asset in the repo.
 */
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "BudAI";

export default function AppleIcon() {
  return renderAppIcon(180);
}
