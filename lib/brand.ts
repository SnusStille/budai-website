/** Original BudAI “Fold” identity. One path for UI, icons and social artwork. */
export const BUDAI_MARK_PATH = "M6 4H18L26 12L21 16L26 20L18 28H6V4ZM11 9V13.5H16L19 11.25L16 9H11ZM11 18.5V23H16L19 20.75L16 18.5H11Z";
export const BUDAI_BRAND = { dark: "#071017", light: "#dcebf0", ink: "#12212b", signal: "#a1d9e3" } as const;

/** Safe-area padding on installed icons; favicon stays bold at 16px. */
export function budaiMarkSvg({ installed = false, background = false, light = false } = {}) {
  const box = installed ? "-5 -5 42 42" : "0 0 32 32";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}"><title>BudAI</title>${background ? `<rect x="${installed ? -5 : 0}" y="${installed ? -5 : 0}" width="${installed ? 42 : 32}" height="${installed ? 42 : 32}" rx="${installed ? 0 : 7}" fill="${BUDAI_BRAND.dark}"/>` : ""}<path d="${BUDAI_MARK_PATH}" fill="${light ? BUDAI_BRAND.ink : BUDAI_BRAND.light}" fill-rule="evenodd"/></svg>`;
}
