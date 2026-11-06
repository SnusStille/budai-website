# Stilledev — company and BudAI product website

[![CI](https://github.com/SnusStille/budai-website/actions/workflows/ci.yml/badge.svg)](https://github.com/SnusStille/budai-website/actions/workflows/ci.yml)

Company website for **Stilledev**, an independent Swedish software and AI development brand, and the live product website for **BudAI**, its intelligent bilingual AI workspace. The site includes real product captures and the working BudAI Playground—not a simulated chat demo.

## Stack

Next.js 16.4 (App Router) · React 18 · Tailwind · Supabase (auth, waitlist, history) · Anthropic API (chat, vision) · optional deployment-dependent OpenAI image generation.

## Website structure

The homepage render order in `app/page.tsx` is `Hero` → `ProductShowcase` → `AIPlayground` → `Capabilities` (including the real waitlist) → `About` → `Journey` → `Footer`, all inside the shared `SiteShell`.

Supporting routes: `/budai`, `/roadmap`, `/knowledge`, `/labs`, `/about`, `/feedback`, `/changelog`, `/sv` and `/legal/*`. `/whats-new` redirects to `/changelog`. The public roadmap uses truthful Live / In Development / Planned states from `lib/roadmap.ts`; no release dates or shipped features are inferred from future plans.

The shared responsive navigation, mobile focus management, bilingual switching and command palette live in `components/sections/Navbar.tsx` and `components/ui/CommandPalette.tsx`. `components/site/NeuralCore.tsx` is the bounded, lazy hero accent with reduced-motion/save-data/WebGL fallbacks. The existing product, auth and admin functionality remains intact; the admin dashboard is at `/admin` (gated).

## Run locally

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic keys
npm ci
npm run check:env            # verifies your values without printing them
npm run dev                  # http://localhost:3000
npm run build                # production build
```

Run the SQL files in `supabase/` in order: `schema.sql`, then `MIGRATION_v2` … `MIGRATION_v12_waitlist_insert_lockdown.sql`. Set `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` (both server-only) for the admin surface and durable quotas. The full variable list and what each one unlocks is in [docs/setup/ENVIRONMENT.md](docs/setup/ENVIRONMENT.md). See [SECURITY.md](SECURITY.md).

Never commit `.env.local`. If it was ever pushed, run `git rm --cached .env.local` and rotate the keys.

© 2026 BudAI by Stilledev. All rights reserved.

## Memory behavior (signed-in accounts)

Memory is **on by default**. `app/api/playground/route.ts` may persist durable facts the assistant notices in a chat (`[[MEMORY:]]`) into `public.memories` under the user's RLS scope. Guests have no memory. Users can see, switch off, edit and delete memories in Playground → Memory (`profiles.memory_enabled`). This is documented on `/legal/privacy` and `/legal/gdpr` in both languages. Switching the default to opt-in is a product decision, not a code limitation.

## Setup guides

Step-by-step deployment, auth and admin instructions live in [docs/setup/](docs/setup/): `GO_LIVE.md`, `ENVIRONMENT.md`, `AUTH_SETUP.md`, `GOOGLE_LOGIN_SETUP.md` and `ADMIN.md`. The FAS 1 inventory is in [docs/audit/audit-2026-11.md](docs/audit/audit-2026-11.md).

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the verification chain and code conventions, and [SECURITY.md](SECURITY.md) for private vulnerability reporting and secret handling.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run test:unit
npm run test:e2e
npm run audit:visual  # with the production server running on port 3000
```

`test:e2e` covers the public website plus Playground streaming, cancellation, request lifecycle, composer safety, Workspace drafts, cloud sync and prepared workflows without writing to external services. `audit:visual` captures the public routes at desktop, tablet and mobile sizes into ignored `test-results/audit-v2/` artifacts and reports overflow, metadata and browser errors.

Browser helpers apply the bundled Chromium runtime environment before launch. The website is designed for responsive desktop, tablet and mobile layouts, keyboard navigation, reduced motion and bilingual EN/SV content. Real provider calls require the corresponding environment configuration; tests and local UI review do not imply that unavailable production providers are healthy.

Earlier cinematic implementation documents remain under `docs/experience/` as historical engineering records. The current public homepage no longer uses the long multi-chapter scroll sequence or blocking loading gate.
