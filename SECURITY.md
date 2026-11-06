# Security Policy

BudAI is a **developer preview**. Please report vulnerabilities privately rather than opening a public issue.

## Reporting

Use GitHub's **private vulnerability reporting** on this repository ("Security" → "Report a vulnerability"). Include reproduction steps, affected URL or route, and impact. Do not paste secrets, API keys or full `.env` files into a report.

## In scope

- `https://stilledev.se` and the BudAI preview deployment
- `app/api/*` routes, authentication and session handling
- Supabase schema, RLS policies and `SECURITY DEFINER` functions in `supabase/`
- The waitlist, admin surface and Playground input handling

## Server-only secrets

These must never be exposed to the browser or given a `NEXT_PUBLIC_*` name:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | `/admin` login and signed admin session cookie |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side quota/admin/waitlist writes |
| `ANTHROPIC_API_KEY` | Playground chat |
| `OPENAI_API_KEY` | optional image generation |

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public by design and are protected by RLS. All server-owned reads/writes go through the single `serviceClient()` in `lib/supabase/service.ts`; it never falls back to the anon key, so a missing `SUPABASE_SERVICE_ROLE_KEY` is an explicit disabled state instead of silently unenforced quotas.

Server logs are single-line JSON with a short `requestId` correlation id and bounded scalars only (`lib/log.ts`); they never contain prompts, message bodies, emails, IP addresses or keys. An external error tracker (Sentry etc.) is still an open infra decision. `BUDAI_AI_DISABLED=1` pauses all Playground generation without a redeploy (emergency cost/abuse switch). Upstream AI calls have a 60 s server timeout with at most 2 retries; `/api/generate-image` has a 45 s timeout. Structured `[budai:usage]` logs contain **only** reported token counts, model, tier, duration and outcome — no prompts, user ids, prices or estimated cost.

## Duplicate domains

Requests whose host ends in `.vercel.app` receive `X-Robots-Tag: noindex, nofollow` from the middleware (`lib/host.ts`), so Vercel's default domain is not indexed as a duplicate of `https://stilledev.se`. Preview deployments still work because no redirect is forced. A production 301 strategy remains an open decision (audit point A5).

## Secret scanning

`npm run scan:secrets` checks all tracked files **and every commit reachable from any ref** for provider keys, JWTs, private keys and hardcoded credential literals. CI runs the same command with `fetch-depth: 0`. New findings fail the build; reviewed historical findings are recorded as hashes in `scripts/secret-scan-baseline.json` (never the value itself). To investigate use `--working-tree` or regenerate the baseline with `--update-baseline` after review. Fetch all remote heads first (`git fetch origin '+refs/heads/*:refs/remotes/origin/*'`): CI checks out every branch, so a baseline built from only one branch's history is incomplete.

A hardcoded admin password existed in three historical commits. It is gone from the tracked tree and the fallback was removed entirely by B3, so the old value no longer grants access. If it was reused anywhere else, rotate it. For stronger coverage, also enable GitHub secret scanning + push protection and run `gitleaks detect --source . --log-opts="--all"` against a full clone (`.gitleaks.toml` is included); those require repository admin access.

## Deployment notes

- Run `supabase/schema.sql` then `MIGRATION_v2 … v12` in order. `MIGRATION_v11_message_feedback.sql` adds bounded columns for Playground message ratings; without it ratings are stored locally only. `MIGRATION_v10_security_hardening.sql` removes public read/write on guest quota rows, restricts `admin_events` and makes `waitlist_status()` service-role-only. `MIGRATION_v12_waitlist_insert_lockdown.sql` drops the public INSERT policy on `waitlist_users`: the browser must never write signups directly, because the server route owns consent, honeypot, throttling and priority.
- Set `SUPABASE_SERVICE_ROLE_KEY` on the server. Without it, guest quotas and the waitlist status lookup run in soft mode.
- `/admin` is `noindex`. Rotate `ADMIN_PASSWORD` if it was ever committed.
- Rate limits are in-memory per instance; a durable shared counter is still needed for a hard global cap. See [docs/audit/audit-2026-11.md](docs/audit/audit-2026-11.md), point B1.
