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

## Round 3 — the neural core (2026-11-06)

Round 2 graded `.universe-world > canvas[data-world-canvas]`, but the **hero
brain renders into a separate `[data-brain-canvas]` inside
`.intelligence-stage` (z-index 3)** — outside `.universe-world` and above the
aurora plate. So the most prominent 3D object on the page received none of the
colour work. Round 3 fixes that.

- **Shared grade**: one `filter: saturate(1.24) contrast(1.07) brightness(1.045)`
  rule targets **both** `canvas[data-brain-canvas]` and `.brain-poster img`. The
  intro still and the live renderer must be graded identically, otherwise the
  hand-off from poster to WebGL visibly jumps in colour. No shader, geometry or
  poster asset changed — the checked-in `public/brain/entry-*.webp` stays intact.
- **Instrument halo**: `.hero-light::before` paints a masked, concentric
  graduation ring (repeating conic ticks + one cyan and one lavender hairline),
  centred on the brain at 73%/55%, with `--journey-phase` fading it out as the
  visitor leaves the hero. Only the tick layer rotates (`ds-core-orbit`, 96s),
  and only under `prefers-reduced-motion: no-preference`; the radial hairlines
  are rotationally symmetric so they stay still. `.hero-light::after` adds a warm
  two-colour core glow behind it. On mobile the instrument follows the centred,
  lifted brain (50%/32%).
- **CSS pitfall caught in QA**: `radial-gradient(circle 26% 36% at …)` is
  invalid — a `circle` accepts one radius only. The browser silently discarded
  the whole glow. Two radii require `ellipse`. A unit guard now rejects that
  pattern.
- **Overflow pitfall caught in e2e**: a rotating *square* element has a larger
  bounding box than the circle painted inside it. The 96s orbit grew up to 20px
  of horizontal overflow on 360/390px viewports and failed five mobile specs.
  `.hero-light { overflow: clip; }` removes the invisible corners without
  touching the masked ring. A unit guard keeps the clip in place.

### Performance: a real, measured draw-call reduction

Six articulated tethers were six `THREE.Line` objects with six independent
`BufferGeometry` instances and six `needsUpdate` uploads per frame. They are now
two `THREE.LineSegments` (one per accent colour), each holding three two-vertex
segments in one `DynamicDrawUsage` buffer. `frustumCulled = false` is required
because the vertices move every frame and a stale bounding sphere would cull
them. The update loop writes into a per-pod slice (`tetherOffset`) and uploads
once per buffer.

Chromium 153 / SwiftShader, DPR 1, `quality: lite`, 1440×1000 — same scroll
positions as the earlier baseline:

| Chapter | Before | Round 3 |
| --- | --- | --- |
| Capabilities | 140 | **136** |
| Builder | 82 | 82 |
| Roadmap | 34 | 34 |

This is a small, honest win (4 draw calls and four buffer uploads per frame),
not a fix for the `data-draw-budget="65"` target. Profiling showed the remaining
~136 calls are the six articulated sculptures themselves — most have unique
materials and independent per-frame transforms, so merging them needs
`InstancedMesh` with per-instance matrices or geometry merging, which is a
larger, riskier change. The pre-warm window experiment (1.15 → 0.92) was
reverted: it saved only 1–5 calls and risked visible pop-in at chapter edges.

### Tooling

`scripts/generate-brain-poster.mjs` called `wp.init()` unconditionally. Next
16.4.5's bundled webpack no longer exposes `init`, so `npm run brain:poster`
failed with `TypeError: wp.init is not a function`. The call is now optional
(`typeof wp.init === 'function'`), which keeps Next 14/15 working. The generator
was re-run successfully; its output is still darker than the checked-in posters,
so the assets were deliberately **not** overwritten.

QA stills: `test-results/fas2-r3-{hero,capabilities,builder,roadmap}.png`
(gitignored). Three unit guards cover the grade, the tether batching and the
generator fix; unit suite is 41/41.

> Note: these changes live on the FAS2 branch / PR. Production
> `https://stilledev.se` still serves `main` until the PR is merged.
