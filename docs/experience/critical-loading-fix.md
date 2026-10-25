# Critical loading/landing correction — verified cause

Starting revision: `0d59981`, 2026-10-25. This supersedes the prior requirement to morph the opening brain into a large logo; the latest brief explicitly forbids that composition.

## Reproduced in the rendered starting implementation

The root had one LoadingScreen component, but it rendered **different visual implementations in succession**:

1. Server state `renderBrain=false`, `phase=pending` immediately rendered `BrainFallback`'s unrelated hand-drawn anatomical SVG.
2. Hydration removed the SVG and dynamically mounted the procedural WebGL brain. The camera clock had already started, so a late first frame entered at a different pose; the initial zero-gain frame could also look blank.
3. The 1,600ms readiness timeout could replace that live scene with the unrelated SVG again.
4. The same persistent scene then deliberately morphed to a 3D Confluence logo and remained active on the hero. A preferences change could reactivate this hero renderer. That was an implementation decision in the preceding iteration, not a mysterious imported cartoon asset.

A delayed-hydration browser trace on the starting source recorded the alternate SVG and identity morph. The old tests counted canvases and even required the SVG fallback/hero logo; they did not reject visual substitution.

## Correction at the source

- Deleted `BrainFallback.tsx`. Removed brand-sampling, identity shader/program/buffers and the logo-morph draw path from `BrainFlight`.
- Deterministic sampling of the recovered `43f44c9` model (seed 43044), stable initial pose and nonzero first-frame gain.
- Preparation uses a small raster captured **by that actual renderer**, at the same first pose/light time/seed, not another SVG/model/placeholder. The reproducible authoring script uses existing Webpack/TypeScript/Chromium; no runtime dependency. Posters total about 41kB.
- One opening surface contains the entire opening. No sibling backdrop, independent loading interface, large logo or animated wordmark.
- Explicit pending → preparing → playing → revealing → done lifecycle. The camera starts only after a valid frame. Preparation is bounded; late imports/ready callbacks cannot restart a completed opening. Completion is published after React removes the opening DOM.
- Completion unmounts/disposes the opening renderer. **There is no hero scene role.** The hero contains typography, existing actions and a quiet editorial signal, not a brain or large logo. Preferences/resize/rerenders cannot initialise a hero brain.
- The separate `#signal` tour can request the same canonical model only when its actual current DOM is visible. Its canvas is clipped to that section from insertion, not driven by a stale pre-route snapshot. It is disposed when leaving. Actual DOM unmount releases the GL context; StrictMode connected-canvas effect replay remains safe.

## First verification gate, before secondary visuals

TypeScript/lint pass. `loading-lifecycle.spec.ts`: **9/9 PASS in development/StrictMode**. These include fresh desktop/390/360, delayed hydration/first paint, late renderer import, normal and cache-disabled hard refresh, unavailable WebGL, reduced motion, preference changes, resize, separate story/reverse-to-hero and legal/history navigation. Mutation traces reject the old SVG, identity fallback, opening/hero logo and any resting-hero brain; they verify one canonical model/one surface, not just a screenshot. The same nine cases then passed in the optimized production build before secondary work. The final expanded suite and pristine-default check are recorded in [refinement-verification.md](./refinement-verification.md).
