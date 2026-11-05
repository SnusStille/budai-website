# BudAI v0.93 — Go Live

App **3.2.0** · preview **v0.93 · 93%**.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Environment

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | `https://stilledev.se` |
| `NEXT_PUBLIC_SUPABASE_URL` | waitlist | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | waitlist | |
| `ANTHROPIC_API_KEY` | playground | server-only |
| `ANTHROPIC_MODEL` | optional | default Claude Sonnet |
| `ADMIN_PASSWORD` | optional | defaults to launch key — **client-visible**; Stille-only gate, not enterprise auth |

## Admin

Restricted to **Stille** only. Password never shown on the login UI.  
Default key: see `ADMIN.md` / env (not printed on the page).

## Waitlist

A signup list for future paid plans. No discount, price or launch date is promised anywhere on the site or in the AI system prompt. `discount_code` stays as an optional admin-managed field, with no database default.

## Playground

- **Single** default · Dual · Concise  
- **Inspirera / Surprise** beside Send  
- Answer language = site language (optional 🌐 override)  
- Starter chips · regenerate · copy · share · stop  

## Brand

- Logo: **circular Neural Orb** (2D motion only)  
- Font: Plus Jakarta Sans  
- OG: `/og.png`  
- Tab hide: `Stilledev.se · BudAI`

## Product wedge

> AI work assistant for Sweden — write, automate, think faster (SV & EN).

## Build

```bash
npm run lint && npm run build
```

## Supabase

Run `supabase/schema.sql` and/or `supabase/MIGRATION_v2.sql` if not already applied.


## Optional SQL v3

`supabase/MIGRATION_v3.sql` — playground_conversations / memory / events (for future accounts). Public demo uses localStorage today.

## Supabase security (required)

Run `supabase/MIGRATION_v10_security_hardening.sql` in the SQL Editor after `schema.sql` and `MIGRATION_v2 … v9`. It removes public read/write on guest quota rows, restricts `admin_events`, adds non-negative counter constraints and makes `waitlist_status()` service-role-only. Set `SUPABASE_SERVICE_ROLE_KEY` on the server; without it guest quotas and the waitlist status widget run in soft mode.
