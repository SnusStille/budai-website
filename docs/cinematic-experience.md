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

Three.js / React Three Fiber were evaluated and rejected: they are not in the project, a
single scene does not justify ~150–300 KB gzipped, and mixing a second renderer stack with
the existing framer-motion/Tailwind surface would have cost more than it bought.

**One visual language, two placements.** `Hero` renders the core in `mode="hero"`
(ambient, pointer-aware, in its own column on desktop, a masked backdrop on phones).
`NeuralJourney` pins a viewport and scrubs `mode="scroll"` through four real product beats,
ending on a live CTA into the Playground.

**Deleted, because they duplicated or distracted:** `AIEnvironment`, `AIBackdropFX`,
`ParticleCore`, `BrainFlight`, `HeroBrainPanel`, `AICore`, `CodeBackground`, `CursorGlow`,
`LoadingScreen`'s WebGL brain, `SurpriseToasts`, `BuddyCard`, `Signature`, `FocusMode`,
`WhatsNew`, `Shortcuts`, `LazyEgg`, `LogoEasterEgg`.

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
- No browser is available in that sandbox, so rendering was verified by (a) shader parsing,
  (b) a jsdom + mocked-WebGL mount that asserts draw calls and full resource release,
  (c) production HTTP checks. Visual confirmation still needs a human on a real device.
- Live chat, streaming, vision uploads and waitlist inserts need real `ANTHROPIC_API_KEY`
  and Supabase credentials; only their error paths could be exercised here.
