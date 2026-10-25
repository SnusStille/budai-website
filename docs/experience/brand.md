# BudAI / Fold

2026-10-25. Original geometric identity drawn for this repository, not a downloaded icon or a third-party logo. No trademark-registration or clearance claim is made.

The solid B has two cut directional ports and a shared vertical spine. It is deliberately legible without gradients, orbiting particles, thin outlines or glow. The wordmark is **BudAI**, set in the existing self-hosted Plus Jakarta Sans variable family, with consistent weight, tight tracking and exact casing. The opening's intentionally uppercase, progressively typed **BUDAI** is retained.

## One source

- `lib/brand.ts`: the authoritative mark path, colors and SVG generator.
- `components/ui/BudAILogo.tsx`: the shared SVG, retaining the existing size/variant/interactive/thinking API and named lockup compatibility export. Idle is completely still; the optional thinking state is one restrained CSS opacity signal and respects reduced motion.
- `components/ui/BudAIWordmark.tsx`: the shared typographic wordmark.
- The **StilledevMark and StilledevLink implementations are unchanged**. Stilledev's S mark, colors, creator name, links and attribution are not replaced with the BudAI B.

The UI uses this identity in navigation, opening HUD, landing badge, Playground toolbar/empty state/messages, Builder's illustrative editor, Next Signal, Roadmap, footer and existing administration surfaces. The existing logo easter-egg interaction still targets the same nav wrapper; it does not load a second identity.

## Files

| Asset | Use |
| --- | --- |
| `public/budai-mark-on-dark.svg` | Pale monochrome mark on a dark background; transparent SVG |
| `public/budai-mark-on-light.svg` | Dark ink on a light background; transparent SVG |
| `public/favicon.svg`, `public/favicon-32.png` | Bold 32px favicon with dark rounded tile |
| `public/apple-touch-icon.png` | 180px Apple touch icon |
| `public/icon-192.png`, `public/icon-512.png` | Installed-app PNGs; 512 is also declared maskable |
| `public/og.png` | 1200×630 card using the exact UI font and new mark, with unchanged Stilledev attribution |
| `app/opengraph-image.tsx` | Statically generated response serving the same artwork as the explicit OG/Twitter image; no remote font/image fetch at request time |

Installed icons include safe-area padding: the artwork fits inside the central 80% circle. Use the light-background SVG or `<BudAILogo variant="light" />` on white; default is pale ink for this dark site. Do not stretch, add orbiting rings, split-color the wordmark, or substitute `</>`.

## Regenerate

Run the local app, then `npm run brand:generate` (Node 22+). It uses the already-installed test browser and self-hosted fonts; it does not call an image-generation service or require an external CDN. `TEST_BASE_URL` can select another local preview. Build the application afterward to regenerate the static metadata response. Application builds do **not** require this authoring script or Node 22's type-stripping feature.

`tests/brand.spec.ts` checks every rendered primary mark against the shared path, exact wordmark casing, unchanged Stilledev S path, SVG simplicity, PNG dimensions, Apple metadata, manifest sizes/maskable declaration, and byte-identical explicit/automatic social images.
