import { renderAppIcon } from "../_icon/AppIconArt";

export const runtime = "edge";

/** PWA icon 512×512 (referenced from app/manifest.ts). */
export function GET() {
  return renderAppIcon(512);
}
