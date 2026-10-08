import { renderAppIcon } from "../_icon/AppIconArt";

export const runtime = "edge";

/** PWA icon 192×192 (referenced from app/manifest.ts). */
export function GET() {
  return renderAppIcon(192);
}
