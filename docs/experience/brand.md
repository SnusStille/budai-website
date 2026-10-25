# BudAI / Confluence

2026-10-25. This identity supersedes the earlier Fold/B silhouette. It is original vector geometry drawn for this repository, not a downloaded icon. No trademark-clearance or registration claim is made.

**Two continuous neural ribbons converge around one computational cell.** The solid form is not a letter B, stock brain, robot, sparkle or B in a circle. It remains recognisable at small sizes without glow, gradients, thin orbital rings or filters. The exact wordmark is **BudAI**, in the existing self-hosted Plus Jakarta Sans variable family, consistent 650 weight/tight tracking. The opening's intentionally typed uppercase **BUDAI** is retained.

## One geometric source

- `lib/brand.ts`: canonical filled SVG path, internal signal routes, colors, SVG serialization and deterministic volume sampling.
- `lib/experience/identity-volume.ts`: original ear-clip extrusion of those same contours. This older pure authoring helper is no longer imported by the opening, hero or capability renderer.
- `BudAILogo.tsx`: existing size/variant/interactive/thinking API plus restrained signal transmission through the two ribbons and receipt at the cell. This is actual stroke geometry, not whole-logo glow/opacity pulsing.
- `BudAIWordmark.tsx`: shared exact casing/typography; the original named lockup export remains compatible.
- `mark-motion.ts`: **one shared** intersection/preferences/visibility observer, no logo canvas or JS animation RAF. Offscreen, hidden-document and reduced-motion marks sleep. Thinking accelerates the same signal language; static remains a complete silhouette.

Current placement rule (critical refinement): **no logo or logo-morph scene in the opening or landing hero**. The former neural-to-logo shader/mesh and large hero sculpture are removed. Confluence stays in navigation, real application interfaces, footer, favicon/Apple/PWA and social metadata. Small UI SVGs may use restrained internal signal motion and sleep when offscreen/reduced-motion. No logo canvas is needed.

The UI applies this identity selectively to navigation, Playground, Builder, Next Signal, Roadmap, footer, administration and existing auth/error/share/legal consumers. Capabilities now uses a sparse information register, not a brand sculpture. **StilledevMark, StilledevLink, creator attribution and unrelated logos are unchanged.**

## Assets

| File | Purpose |
| --- | --- |
| `budai-mark-on-dark.svg` | Pale monochrome mark, transparent |
| `budai-mark-on-light.svg` | Dark ink on light, transparent |
| `favicon.svg`, `favicon-32.png` | Compact dark tile, no animation/filter |
| `apple-touch-icon.png` | 180px |
| `icon-192.png`, `icon-512.png` | Installed-app PNGs; 512 also maskable, safe-area padding |
| `og.png` | 1200×630, actual self-hosted UI typography, preserved Stilledev attribution |
| `app/opengraph-image.tsx` | Static response of the exact same social artwork |

Files are under `public/`. Use `<BudAILogo variant="light" />` or the light-context SVG on white. Do not stretch the mark, add orbital rings, substitute the old B/`</>`, or animate installed icons. No SVG animation/filter/gradient is needed to recognise it.

## Reproduce and verify

With the local app running: `npm run brand:generate` (Node 22+, existing test browser and self-hosted fonts; no external image/font service). Build afterward to regenerate the static metadata response. Production application builds do not require this authoring script/type-stripping flag.

`brand.spec.ts` checks the actual UI path/wordmark, preserved Stilledev path, static SVG simplicity, all PNG sizes, manifest/Apple declarations and byte-identical social routes. `arrival.spec.ts` verifies real internal signal motion and reduced-motion sleep, actual cortex crossing, renderer disposal before landing and absence of opening/hero logos. Pure tests still verify the original vector geometry; the critical lifecycle tests verify its absence from opening/hero compositions.
