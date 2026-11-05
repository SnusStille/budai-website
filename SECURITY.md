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

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public by design and are protected by RLS.

`BUDAI_AI_DISABLED=1` pauses all Playground generation without a redeploy (emergency cost/abuse switch). Upstream AI calls have a 60 s server timeout with at most 2 retries; `/api/generate-image` has a 45 s timeout. Structured `[budai:usage]` logs contain **only** reported token counts, model, tier, duration and outcome — no prompts, user ids, prices or estimated cost.

## Deployment notes

- Run `supabase/schema.sql` then `MIGRATION_v2 … v10` in order. `MIGRATION_v10_security_hardening.sql` removes public read/write on guest quota rows, restricts `admin_events` and makes `waitlist_status()` service-role-only.
- Set `SUPABASE_SERVICE_ROLE_KEY` on the server. Without it, guest quotas and the waitlist status lookup run in soft mode.
- `/admin` is `noindex`. Rotate `ADMIN_PASSWORD` if it was ever committed.
- Rate limits are in-memory per instance; a durable shared counter is still needed for a hard global cap. See [docs/audit/audit-2026-11.md](docs/audit/audit-2026-11.md), point B1.
