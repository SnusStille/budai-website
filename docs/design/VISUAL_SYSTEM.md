# BudAI Visual System (FAS2 design pass)

Presentation-only layer: `app/design-system.css`, imported **last** in
`app/layout.tsx` after `globals.css` and `experience.css`. It adds no DOM, no
copy and no layout containers, so the 3D scroll journey, the camera timeline
(`lib/experience/timeline.ts`) and all browser regression tests are untouched.

## Why

The old styling had four different glass recipes, six competing glow colours,
`backdrop-filter: blur(40px)` on mobile, and body text at 40–60% white opacity
(i.e. roughly 2–3:1 contrast on `#020205`). It looked busy and was expensive to
paint. This pass replaces that with one semantic system.

## Tokens

| Token | Value | Contrast on `#020205` | Use |
| --- | --- | --- | --- |
| `--ds-text-1` | `#f2f7fb` | ~17.6:1 | headings, primary copy |
| `--ds-text-2` | `#c6d3df` | ~12.7:1 | body copy |
| `--ds-text-3` | `#9fb0c1` | ~8.4:1 | secondary copy, labels |
| `--ds-text-4` | `#8394a8` | ~5.9:1 | micro labels |

All four clear WCAG AA (4.5:1). `tests/unit.spec.ts` recomputes the ratio and
fails CI if a token is darkened below that. Low-opacity Tailwind text classes
were replaced with `.text-ds-muted` so `hover:text-white` still wins.

Also centralised: two accents (`--ds-accent`, `--ds-accent-2`) plus a tertiary
teal, one border colour, three radii, two elevation shadows, one easing curve
(`--ds-ease`) and three durations. Reading measure is capped at `68ch` (`46ch`
on mobile).

## Atmosphere

`.universe-atmosphere` now paints one colour wash, one vignette and a light SVG
grain via `::after`. It sits **behind** `.universe-world` (`z-index: 1`), so it
frames the WebGL canvas without dimming it or intercepting pointer events.
The vertical grid is toned down to `opacity: .55`.

## 3D performance (`lib/experience/world.ts`)

| Change | Effect |
| --- | --- |
| Corridor's six pulses → one `InstancedMesh` | 6 draw calls → 1 |
| Roadmap's four pulses → one `InstancedMesh` | 4 draw calls → 1 |
| `freezeStatic()` on rails, gates, pedestals, glows | no per-frame matrix recompute for static scenery |
| `lite` mode: 1 gimbal / 1 satellite / 1 halo ring, no pillar | fewer decorative draw calls on software & mobile GPUs |
| Skip `CSS3DRenderer.render()` when both screens are hidden | no DOM transform writes on most of the journey |
| Reused `Matrix4` / `Vector3` scratch objects | zero per-frame allocations in the pulse loops |
| Fog `#04070e` @ `0.026`, exposure `1.18` | distant geometry dissolves into the page, less blown highlights |

`renderer.domElement` now exposes `data-draw-calls` **and** `data-draw-budget="65"`
(the target from `docs/audit/audit-2026-11.md`). The FAS2 baseline measured
140–146 calls in Capabilities on SwiftShader; absolute FPS numbers there are
software-rendering only, so re-measure on a real GPU before claiming a win.

## Measuring

```
npm run build
npm run test:e2e          # cinematic/experience specs capture QA screenshots
npm run brain:poster      # regenerates the entry posters from the real renderer
```

In DevTools: `document.querySelector("canvas[data-world-canvas]").dataset.drawCalls`.
Next steps (not in this pass): three-tier quality (`lite / balanced / ultra`)
selected by `deviceMemory` + measured frame time, a CI draw-call budget,
`useReportWebVitals`/Lighthouse CI, and splitting `AIPlayground.tsx` to bring
First Load JS down from ~377 kB.

## Round 2 — a visibly stronger identity

The first pass was deliberately subtle. Round 2 makes the difference obvious
while staying paint-only:

- **Ambient plate**: `public/ambient/aurora.webp` (12 kB, 1600×900, WebP). A
  hand-authored dark aurora ribbon is painted on `.universe-atmosphere::before`
  behind the WebGL canvas. It uses the existing `--journey-phase` variable that
  `WorldStage` already writes on `<html>` for parallax (`background-position`)
  and a slow `hue-rotate` drift, so the backdrop changes colour as the visitor
  moves through the chapters. No new JS, no new scroll listener.
- **Scrim**: `::after` adds a left-side dark gradient so the hero/workshop copy
  stays readable over the bright part of the plate. The plate, the scrim and the
  vignette all sit below `.universe-world` (`z-index: 1`) — the 3D is never
  dimmed and the DOM content is never covered.
- **Chapter identity**: `.brain-journey` (cyan), `.capabilities-universe`
  (violet), `.builder-section` (teal), `.roadmap-section` (blue) and the
  early-access card each get their own radial wash instead of one endless blue
  gradient.
- **Hero**: `h1` scales up to `clamp(54px, 6.6vw, 96px)`, the eyebrow becomes a
  glass pill, and a two-colour halo sits behind the neural brain.
- **Navigation, dividers, composer, footer**: one consistent accent seam,
  a glass nav with a real border, a lifted composer surface and a warmer ending
  gradient.
- **3D palette**: `CYAN`/`LAVENDER` in `world.ts` saturated
  (`#5fe3f7` / `#a78bfa`), and the WebGL canvas grade raised to
  `saturate(1.24) contrast(1.075)`.

`tests/unit.spec.ts` guards the WebP magic bytes, the 60 kB size cap, the CSS
reference and the chapter-reactive variable so the asset cannot silently bloat
or disappear. QA stills: `test-results/fas2-v3-*.png` (gitignored).

> Note: these changes live on the FAS2 branch / PR. Production
> `https://stilledev.se` still serves `main` until the PR is merged.
