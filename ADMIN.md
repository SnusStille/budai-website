# BudAI Admin

## Access

Restricted to **Stille (Stilledev)** only.

- Password is **never shown** on the login page.
- Default / env: `NEXT_PUBLIC_ADMIN_PASSWORD` (falls back to project launch key).
- **Note:** `NEXT_PUBLIC_*` values ship in the browser bundle — this is a private gate, not enterprise auth. Do not treat it as production security.

## Features

- Overview / Waitlist / Platform / Ops / Export tabs
- Priority 0–100 · Mark contacted · Notes · Discount codes
- Activity feed (`admin_events`)
- Bulk approve · CSV · copy emails
- Invite draft template (Export tab)

## SQL

Run `supabase/schema.sql` (full) or `supabase/MIGRATION_v2.sql` (delta only).


Optional: `supabase/MIGRATION_v3.sql` for server playground analytics.
