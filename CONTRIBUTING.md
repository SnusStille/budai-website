# Contributing to BudAI

BudAI is in **developer preview**. Stability beats rewrites: change only what is needed, keep one thing per commit, and keep the fallbacks intact.

## Setup

```bash
npm ci
cp .env.example .env.local   # fill in Supabase + Anthropic keys if you need them
# Deployment / auth / admin guides: docs/setup/
npm run dev
```

The site works without keys: the Playground then returns an honest "not configured" state and the waitlist uses the development-only stub. Never commit `.env.local`.

## Secrets

Never commit `.env`, provider keys or service-role credentials. `npm run scan:secrets` runs in CI over the working tree and full git history; a new finding fails the build. If CI reports a real secret, remove it from the tree **and rotate it at the provider** — rewriting history is not enough.

## Local environment

Copy `.env.example` to `.env.local`, fill in the required values, then run `npm run check:env` (it never prints secrets). The complete variable reference, SQL order and fail-closed behaviour are documented in [docs/setup/ENVIRONMENT.md](docs/setup/ENVIRONMENT.md). Never commit `.env.local`.

## Verification chain

Run this **after every change**, and fix errors before starting the next step:

```bash
npm run scan:secrets && npm run lint && npm run typecheck && npm run test:unit && npm run test:e2e && npm run build
```

Important: `npm run test:e2e` starts `next start` against an existing `.next` build. After a source change you must build **before** the e2e run, or the suite will test stale code. The practical order is:

```bash
npm run scan:secrets && npm run lint && npm run typecheck && npm run test:unit && npm run build && npm run test:e2e && npm run build
```

`.github/workflows/ci.yml` runs exactly that on every push and pull request, with `fetch-depth: 0` so the secret scan sees the full history. Chromium comes from the `@sparticuz/chromium` npm package via `scripts/test-browser.mjs`.

- `npm test` runs all 15 spec files (`waitlist-dev.spec.ts` is skipped unless `TEST_WAITLIST_DEV=1`).
- `npm run test:e2e` runs all 13 stable browser specs — everything except the unit spec and the opt-in waitlist-dev spec. CI uses this script, so a new spec file must be added to the list; `tests/unit.spec.ts` guards that.
- `TEST_WAITLIST_DEV=1` enables the local mock-only waitlist test.

## Code conventions

- `lib/limits.ts` is the single source for 12 / 80 daily limits. Never hardcode them in copy.
- `lib/consent.ts` is the single source for the analytics cookie choice.
- `lib/rate-limit.ts` owns API throttling; `lib/playground/*`, `lib/experience/*` own their domains.
- `lib/experience/scroll.ts` is the only scroll source. The 3D world uses **one shared camera** (Vanilla Three.js + CSS3DRenderer). No GSAP, Theatre.js, virtual scroll or full-screen postprocessing.
- Keep reduced-motion, Save-Data, WebGL context-loss and `BrainPoster` fallbacks working.
- Break neither Playground, login, memory nor the API routes.
- Writes to `/api/usage` are intentionally disabled; quota is committed server-side after a successful upstream call.
- SQL changes go in a new, idempotent `supabase/MIGRATION_v*.sql` **and** in `supabase/schema.sql` for fresh installs.

## Content rules

- All site copy is English with a working SV / EN switch.
- No invented customers, testimonials, metrics, prices, discounts or launch dates.
- Do not overclaim; this is a preview, not a production SLA.
- `/changelog` is the single source of truth for What's new. Edit `lib/changelog.ts`: dated entries only for work actually in the repo, `date: ""` for a snapshot of current features. No invented release dates and no cadence promises. The quick-peek modal renders the same data and links to the page.

## Security

See [SECURITY.md](SECURITY.md). Server-only secrets: `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`. Never use a `NEXT_PUBLIC_*` name for a secret.

## Audit

The November 2026 inventory of all FAS 1 points lives in [docs/audit/audit-2026-11.md](docs/audit/audit-2026-11.md). It is a snapshot of the state *before* the fixes; use the git log for current status.
