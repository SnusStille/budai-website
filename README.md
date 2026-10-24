# BudAI — developer preview site

Landing site and live Playground for **BudAI**, an AI work assistant for Sweden and the Nordics (individuals and companies). Built by Stilledev.

## Stack

Next.js 14 (App Router) · Tailwind · Supabase (auth, waitlist, history) · Anthropic API (chat, vision).

## Sections

Hero → What is BudAI → Neural Journey (cinematic scroll chapter) → Playground → Capabilities → Builder → Waitlist → Roadmap → Footer. Admin dashboard at `/admin` (gated).

## The cinematic layer

One dependency-free WebGL renderer (`components/effects/NeuralCinema.tsx`) draws the
neural core on a single canvas. Geometry and camera math live in
`components/effects/neural/engine.ts` (pure, testable, no DOM).

- `mode="hero"` — the living core next to the headline; reacts to pointer movement and
  to `budai:activity` (it gets busier while the Playground is generating).
- `mode="scroll"` — `NeuralJourney` scrubs one camera flight through the core and into
  the deep chamber as you scroll. Text stays real DOM; the 3D never carries meaning alone.

Performance and safety: DPR clamped, point counts scaled by device, paused when off the
viewport or the tab is hidden, still frames under `prefers-reduced-motion`, CSS fallback
when WebGL is missing or lost, every buffer/program released on unmount.

## Playground model tiers (optional)

Set any of these to make the tier picker appear in the composer. The server validates the
requested tier and maps it to the env value; the browser never receives a model name or key.

```
ANTHROPIC_MODEL=claude-sonnet-4-20250514        # "standard" (default)
ANTHROPIC_MODEL_FAST=claude-3-5-haiku-latest    # "fast"
ANTHROPIC_MODEL_DEEP=claude-sonnet-4-20250514   # "deep"
```

## Run locally

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build
```

Run the SQL files in `supabase/` in order (schema, then MIGRATION_v2 … v7). Set `ADMIN_PASSWORD` (server-only) to unlock `/admin`.

Never commit `.env.local`. If it was ever pushed, run `git rm --cached .env.local` and rotate the keys.

© 2026 BudAI by Stilledev. All rights reserved.
