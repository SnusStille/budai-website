# Environment variables

Quick version: `cp .env.example .env.local`, fill in the five required values, run `npm run check:env`, then run the Supabase SQL files. **Env vars alone are not enough** — the tables, RLS policies and RPCs come from the SQL migrations.

## Check without exposing secrets

```bash
npm run check:env                 # informational, always exits 0
npm run check:env -- --strict    # exits 1 if a required value is missing/invalid
npm run check:env -- --json      # machine-readable
```

The checker reads `.env`, then `.env.local` (local wins), then the real process environment (Vercel/CI wins). It prints only whether a value is present and how long it is — **never the value**. It also warns if the service-role key is identical to the anon key, if `BUDAI_AI_DISABLED=1`, and about variables the code no longer reads.

## Required for full functionality

| Variable | Where to get it | What breaks without it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project settings → API → Project URL | Auth, waitlist, quota, history, memory |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project settings → API → anon/public key | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project settings → API → `service_role` (**secret**) | Guest/member quotas, waitlist status, admin inbox, feedback, share links, message ratings |
| `ANTHROPIC_API_KEY` | Anthropic Console | `/api/playground` returns `503 not_configured` |
| `ADMIN_PASSWORD` | Choose ≥12 unique chars | `/admin` returns `503`; no admin session cookie |

`NEXT_PUBLIC_*` is compiled into the browser bundle. **Never** put a service-role key, an API key or a password behind that prefix. The three server-only values must be set in the hosting provider's environment as well as locally.

## Optional

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/JSON-LD URL; defaults to `https://stilledev.se` |
| `ANTHROPIC_MODEL`, `ANTHROPIC_MODEL_FAST`, `ANTHROPIC_MODEL_DEEP` | Model tiers; setting FAST or DEEP shows the picker. Only configured tiers are offered |
| `OPENAI_API_KEY`, `OPENAI_IMAGE_MODEL` | Optional image generation; without it the endpoint returns `501 not_configured` |
| `BUDAI_AI_DISABLED=1` | Emergency switch that pauses all Playground generation without a redeploy |

`ANTHROPIC_WORKSPACE_ID` is **not** read by the code and can be removed.

## Required SQL (run once per database)

In Supabase SQL Editor, in order: `supabase/schema.sql`, then `MIGRATION_v2` … `MIGRATION_v9`, `MIGRATION_v10_security_hardening.sql`, `MIGRATION_v11_message_feedback.sql`. `v10` removes public read/write on guest quota rows and makes `waitlist_status()` service-role-only; `v11` adds bounded columns for Playground message ratings. Without `v10` the security hardening is incomplete, and without `v11` ratings stay local only (the UI says so honestly).

## Partial configuration is deliberately fail-closed

- No database configured: the Playground still works locally for the UI, but waitlist signup returns `not_configured` in production and quota tracking is disabled.
- Only the anon key configured (no service role): the server-side routes do **not** fall back to the public key for writes or quota reads. Set the service-role key; the checker flags this case explicitly.
- No `ADMIN_PASSWORD`: `/admin` is disabled rather than falling back to a default.

## Vercel / production

Set the same variables in Project Settings → Environment Variables (server-only ones as plain values, not `NEXT_PUBLIC_*`). Redeploy after changing them. Do not enable a Vercel preview deployment until the full verification chain is green; CI runs `npm run scan:secrets` over the full git history, so no credential should ever be committed.

See also [SECURITY.md](../../SECURITY.md) and [GO_LIVE.md](GO_LIVE.md).
