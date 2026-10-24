# BudAI — cinematic layer and reference audit

This document records what was inspected before changing the site, what was reused, and
what was deliberately rejected. It exists so the next person does not have to re-audit
the same repositories.

## 1. What the site was

Next.js 14 (App Router), React 18, Tailwind 3, framer-motion, Supabase (auth, waitlist,
history, memory), Anthropic (chat + vision). One long landing page with anchors:
`#playground`, `#capabilities`, `#about`, `#waitlist`, `#roadmap`, plus `/admin`,
`/s/<id>` shares, `/legal/[slug]`, auth callback.

Before this change the page mounted **two fullscreen 2D canvases**, a second WebGL canvas
(a 731-line brain renderer) inside the hero, a particle-sphere canvas, a 5.6 s intro that
also ran the brain renderer, and a set of novelty layers (surprise toasts, a floating
buddy card, a Konami signature card, a logo easter egg, focus mode, a "what's new"
popover). Everything was additive and mostly decorative; several layers competed for the
same job.

## 2. Reference audit (code read, not READMEs)

| Repository | Licence | Verdict |
| --- | --- | --- |
| `laibamaqbool001/Neuralis-Cinematic-SaaS-Landing-Page` | MIT | Real React + R3F project. `Hero3D.jsx` is a wireframe icosahedron + random particles — generic and stylistically off-brand. Ideas worth keeping: additive point clouds, pointer-driven group rotation. No code reused. |
| `jasc66/scroll-flyover` | MIT | Not a React library: a Claude Code skill plus a 1,328-line vanilla Three.js scrub engine (`references/scrub-engine.js`). The *technique* is excellent and was adopted: scroll position → eased position on a camera path, no cuts, still frame under reduced motion, DOM copy that never depends on the canvas. The engine itself was not vendored (it needs `three`, which this project does not use). |
| `AradhyaStuti/ScrollSpire-…` | **No licence** | All rights reserved. Code and assets cannot be reused. Only the general scrollytelling pattern (progress → camera keyframes) informed the design; nothing was copied. |
| `alexgarbi10/threejs` | MIT | Plain Three.js brain anatomy: a procedural two-lobed silhouette (ellipsoid lobes, frontal bulge, cerebellum, brainstem), CSS2D labels, fog and studio lighting. Adopted the *anatomical vocabulary* (lobes, fissure, cerebellum, brainstem) when sampling the neural shell; no code reused. |
| `edenbergel/kyu-chatbot` | MIT | Next 16 / React 19 / R3F 9 / OpenAI. A single sphere with moving lights and `useChat` without streaming. Not compatible (peers), not an improvement over the existing Playground. Rejected. |
| `moazamdotdev/4chat` | Unlicense (public domain) | Next 16 / React 19 / AI SDK 7 / shadcn + a vendored copy of Vercel AI Elements (~50 components). Not droppable into Tailwind 3 / Next 14 / React 18 without a large migration. Interaction patterns were studied: prompt composer with attachments, model picker, message action toolbar, stick-to-bottom conversation. Implemented natively where they added value. |

Vercel AI Elements itself is MIT but is distributed for the AI SDK / Tailwind 4 stack.
Adopting it would have meant adding `ai`, `streamdown`, `shiki`, `radix-ui` and a React 19
upgrade to a working product — rejected on the “no unnecessary dependencies” rule.

## 3. What was built instead

**One renderer, no new dependencies.** `components/effects/NeuralCinema.tsx` is a
WebGL1 renderer written for this codebase (the project already shipped hand-written WebGL,
so this matches the house style and adds 0 KB of npm weight). Geometry and camera maths are
pure and testable in `components/effects/neural/engine.ts`:

- a folded, two-lobed neuron shell + brainstem + cerebellum (the brain idea),
- an outer web, ambient dust, a long deep-field chamber and a distant core cluster,
- a six-keyframe camera path (`sampleCamera`) scrubbed by scroll with ease-in-out per leg,
- additive sprite glow, synapse lines, thought-wave brightness tied to AI activity,
- pointer parallax, near-plane fade, slow orbital drift.

**Frame graph.** Scene into an RGBA8 framebuffer → bright pass (½ res, threshold 0.08,
knee 0.12) → separable gaussian ping-pong (3 passes desktop with a widening spread,
2 on mobile) → composite: exponential filmic shoulder `1 - exp(-c * 1.05)`, a
pre-tonemap saturation lift that keeps the cyan/violet identity once the core saturates,
vignette 0.38 and a dither to kill banding in the dark gradients. The 9-tap separable
kernel is the linear-sampling trick from `Jam3/glsl-fast-gaussian-blur` (MIT), adopted
verbatim with attribution; everything else is written for this codebase. If the
framebuffer cannot be allocated the renderer falls back to drawing straight to the canvas.

**Three bugs worth recording**, because each one looked like art direction and was not:

1. The vertex shader rotated the *world* while the camera path is authored in a fixed
   world, so by the end of the flight the destination had been spun out of frame (a black
   arrival). The spin now decays to zero by ~48 % progress.
2. The scroll chapter's readability scrim was a radial gradient centred on the frame —
   i.e. a dark hole painted exactly over the core. It is now anchored bottom-left, where
   the copy actually is.
3. The offscreen scene pass ran with blending *disabled*. Every sprite quad overwrote the
   ones behind it, punching crescent-shaped bites out of overlapping neurons. The scene
   pass now keeps `SRC_ALPHA, ONE`, matching the direct-to-canvas path.

Three.js / React Three Fiber were evaluated and rejected: they are not in the project, a
single scene does not justify ~150–300 KB gzipped, and mixing a second renderer stack with
the existing framer-motion/Tailwind surface would have cost more than it bought.

**One visual language, two placements.** `Hero` renders the core in `mode="hero"`
(ambient, pointer-aware, in its own column on desktop, its own block *above* the copy on
phones — never a faint backdrop behind the text).
`NeuralJourney` pins a viewport and scrubs `mode="scroll"` through four real product beats,
ending on a live CTA into the Playground.

**Removed, because they duplicated or distracted:** `AIEnvironment`, `AIBackdropFX`,
`ParticleCore`, `HeroBrainPanel`, `AICore`, `CodeBackground`, `CursorGlow`,
`SurpriseToasts`, `BuddyCard`, `Signature`, `FocusMode`, `WhatsNew`, `Shortcuts`,
`LazyEgg`, `LogoEasterEgg`. The old timed 5.6 s startup overlay was removed as a blocker;
`BrainFlight` was later restored only for a short, skippable, genuine slow-load intro.

## 4. Playground

The Playground was audited and mostly kept — it already streams, keeps history, memory,
attachments (vision), voice, export, dual drafts, personas, slash commands, keyboard
shortcuts and usage limits. Two real gaps were closed:

1. **Model tiers were documented but not implemented.** `.env.example` promised a tier
   picker driven by `ANTHROPIC_MODEL_FAST` / `ANTHROPIC_MODEL_DEEP`; neither the API route
   nor `/api/features` referenced them. Now: the server maps a requested tier to the
   configured model and falls back to `ANTHROPIC_MODEL`, `/api/features` advertises only
   tiers that are actually configured (booleans only, no names or keys), and the composer
   shows a picker only when there is a choice, remembering the selection locally.
2. **`/api/features` was statically generated at build time**, so env-driven flags were
   frozen into the build. It is now `force-dynamic` (still CDN-cacheable for 60 s).

## 5. Known limits

- The Google Fonts fetch is blocked in the sandbox used for verification; builds were run
  with `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` pointing at a mock CSS module. On Vercel the
  normal `next/font` download path is used and unchanged.
- Headless verification runs on SwiftShader (software WebGL), which is representative of
  correctness, not of frame-rate. Real GPU timings on low-end Android are still unverified.
- Live chat, streaming, vision uploads and waitlist inserts need a real `ANTHROPIC_API_KEY`
  and Supabase credentials. The request shape, tier selection, streaming flag, error and
  disabled states were verified; a real model response was not.
- Screenshot comparison is against this author's judgement, not a designer's sign-off.

## 6. Tests actually run

Production build (`next build`) is green. `npm run qa:visual` drives a real headless
Chromium at 1440×900 and 390×844 and fails the run on a console error, a broken route, a
story chapter that stops sticking, or a no-WebGL page that loses its content. Latest run:
all checks passed.

- Routes: `/`, `/api/health`, `/api/features`, `/legal/privacy`, `/legal/terms`,
  `/sitemap.xml`, `/robots.txt` → 200.
- Desktop: hero, story at 20/55/100 % scroll, Playground, waitlist. Story stage sticks
  (canvas pinned at 72 px under the nav); console clean.
- Mobile 390×844: hero core above the copy, story stage pinned at 56 px, Playground usable;
  console clean.
- `prefers-reduced-motion: reduce`: no sticky stage, the four chapters render as a readable
  static card grid; console clean.
- WebGL disabled: headline, story copy and Playground anchor all present; console clean.
- Playground with `ANTHROPIC_MODEL_FAST` / `_DEEP` set: `/api/features` reports
  `{"fast":true,"quality":true,"deep":true}`, the tier picker renders only because there is
  a real choice, selecting "Deep" and sending a message produced a request body carrying
  `modelTier: "deep"` and `stream: true`.

## 7. Route continuity, startup, and brand follow-up

The root layout now owns the persistent dark atmospheric backdrop, global providers,
Lenis scroll controller, and a short opacity-only `app/template.tsx` route entrance. The
root layout itself persists during App Router navigation, so browser back/forward and
client links remain native; direct requests still receive the route from Next. The private
`/admin` console stays on native scroll. Playground message/workspace scroll panes opt out
of Lenis so they continue to scroll normally.

`LoadingScreen` is mounted once from `Providers`. It is absent on a ready document, repeat
visits in the same tab, reduced-motion mode, save-data connections, and low-memory devices.
It appears only if the initial document remains loading after a short grace period, exits
on the real `load` event, and has a skip action plus a short timeout. The brain flight is
art direction only (no fake model/API boot log or percentage); the page remains scrollable.

The intended mark is the inline signal SVG in `components/ui/BudAILogo.tsx` (there was no
standalone logo file). `public/budai-mark.svg`, `favicon.svg`, Apple touch icon, PWA icons,
`public/og.png`, and `/opengraph-image` now use that same mark. Footer legal links navigate
to the real legal routes rather than opening a second, stale modal copy. The nonfunctional
"What's new" bell and dead footer anchor were removed.

Follow-up checks: production build, TypeScript, and ESLint passed. HTTP checks returned
200 for home, admin, legal routes, manifest, favicon, PWA/Apple icons, both social images,
health/features APIs, sitemap, and robots; an invalid shared-conversation ID returned 404.
The server-rendered home contains the route wrapper and current brand but no startup overlay
or retired competitor copy. **This follow-up could not run browser-driven desktop/mobile,
back/forward, console, chat, upload, auth, or waitlist submission tests:** this sandbox's
Chromium binary cannot launch because `libnspr4.so` / `libnss3.so` are absent. No
Anthropic/Supabase credentials were present, so real AI/auth/data writes were not exercised.
The earlier visual QA run above predates these route/brand changes and is not presented as
verification of the current visuals.
