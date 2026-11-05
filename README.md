# BudAI — developer preview site

[![CI](https://github.com/SnusStille/budai-website/actions/workflows/ci.yml/badge.svg)](https://github.com/SnusStille/budai-website/actions/workflows/ci.yml)

Landing site and live Playground for **BudAI**, an AI work assistant for Swedish and English work, built in Sweden by Stilledev.

## Stack

Next.js 14 (App Router) · Tailwind · Supabase (auth, waitlist, history) · Anthropic API (chat, vision).

## Sections

Render order in `app/page.tsx`: `Hero` (Spark) → `BrainScrollStory` (Context) → `AIPlayground` → `Capabilities` (which renders `Waitlist`) → `About` (Builder) → `Journey` (Roadmap) → `Footer`. The 3D world, intro and fallbacks live in `components/experience/*` / `lib/experience/*`. Admin dashboard at `/admin` (gated).

## Run locally

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm ci
npm run dev                  # http://localhost:3000
npm run build                # production build
```

Run the SQL files in `supabase/` in order: `schema.sql`, then `MIGRATION_v2` … `MIGRATION_v10_security_hardening.sql`. Set `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` (both server-only) for the admin surface and durable quotas. See [SECURITY.md](SECURITY.md).

Never commit `.env.local`. If it was ever pushed, run `git rm --cached .env.local` and rotate the keys.

© 2026 BudAI by Stilledev. All rights reserved.

## Memory behavior (signed-in accounts)

Memory is **on by default**. `app/api/playground/route.ts` may persist durable facts the assistant notices in a chat (`[[MEMORY:]]`) into `public.memories` under the user's RLS scope. Guests have no memory. Users can see, switch off, edit and delete memories in Playground → Memory (`profiles.memory_enabled`). This is documented on `/legal/privacy` and `/legal/gdpr` in both languages. Switching the default to opt-in is a product decision, not a code limitation.

## Setup guides

Step-by-step deployment, auth and admin instructions live in [docs/setup/](docs/setup/): `GO_LIVE.md`, `AUTH_SETUP.md`, `GOOGLE_LOGIN_SETUP.md` and `ADMIN.md`. The FAS 1 inventory is in [docs/audit/audit-2026-11.md](docs/audit/audit-2026-11.md).

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the verification chain and code conventions, and [SECURITY.md](SECURITY.md) for private vulnerability reporting and secret handling.

## Cinematic experience

The current Confluence implementation, source recovery, ownership audit and reproducible browser checks are documented in [the implementation audit](docs/experience/current-overhaul.md) and [verification/release notes](docs/experience/confluence-verification.md).

The latest critical loading/landing correction and information-field/outro refinement is documented in [refinement verification](docs/experience/refinement-verification.md). Use `npm run test:loading` for the focused opening/hero cases.
