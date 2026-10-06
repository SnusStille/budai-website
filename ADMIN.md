# BudAI Admin

## Access

Restricted to **Stille (Stilledev)** only.

- Password is **never shown** on the login page.
- Set the server-only `ADMIN_PASSWORD` in `.env.local` for local development or in the deployment environment for production.
- There is no default password: if `ADMIN_PASSWORD` is unset, admin login is locked.
- Never use a `NEXT_PUBLIC_*` variable for the password; those values can be included in the browser bundle.

## Features

- Overview / Waitlist / Platform / Ops / Export tabs
- Priority 0–100 · Mark contacted · Notes · Discount codes
- Activity feed (`admin_events`)
- Bulk approve · CSV · copy emails
- Invite draft template (Export tab)

## SQL

Run `supabase/schema.sql` (full) or `supabase/MIGRATION_v2.sql` (delta only).


Optional: `supabase/MIGRATION_v3.sql` for server playground analytics.
