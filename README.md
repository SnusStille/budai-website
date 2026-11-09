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
npm run check:env            # verifies your values without printing them
npm run dev                  # http://localhost:3000
npm run build                # production build
```

Run the SQL files in `supabase/` in order: `schema.sql`, then `MIGRATION_v2` … `MIGRATION_v12_waitlist_insert_lockdown.sql`, then `MIGRATION_v13_admin_panel.sql` and `MIGRATION_v14_feedback_triage.sql` (Admin Panel 2.0/2.1: analytics, contact CRM, content, audit — see docs/admin/ADMIN_PANEL_2.md). Set `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` (both server-only) for the admin surface and durable quotas. The full variable list and what each one unlocks is in [docs/setup/ENVIRONMENT.md](docs/setup/ENVIRONMENT.md). See [SECURITY.md](SECURITY.md).

Never commit `.env.local`. If it was ever pushed, run `git rm --cached .env.local` and rotate the keys.

© 2026 BudAI by Stilledev. All rights reserved.

## Memory behavior (signed-in accounts)

Memory is **on by default**. `app/api/playground/route.ts` may persist durable facts the assistant notices in a chat (`[[MEMORY:]]`) into `public.memories` under the user's RLS scope. Guests have no memory. Users can see, switch off, edit and delete memories in Playground → Memory (`profiles.memory_enabled`). This is documented on `/legal/privacy` and `/legal/gdpr` in both languages. Switching the default to opt-in is a product decision, not a code limitation.

## Setup guides

Step-by-step deployment, auth and admin instructions live in [docs/setup/](docs/setup/): `GO_LIVE.md`, `ENVIRONMENT.md`, `AUTH_SETUP.md`, `GOOGLE_LOGIN_SETUP.md` and `ADMIN.md`. The FAS 1 inventory is in [docs/audit/audit-2026-11.md](docs/audit/audit-2026-11.md).

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the verification chain and code conventions, and [SECURITY.md](SECURITY.md) for private vulnerability reporting and secret handling.

## Cinematic experience

The current Confluence implementation, source recovery, ownership audit and reproducible browser checks are documented in [the implementation audit](docs/experience/current-overhaul.md) and [verification/release notes](docs/experience/confluence-verification.md).

The latest critical loading/landing correction and information-field/outro refinement is documented in [refinement verification](docs/experience/refinement-verification.md). Use `npm run test:loading` for the focused opening/hero cases.
