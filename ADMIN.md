# BudAI Admin

## Password

**Launch password:** `Daylightshere76`  
(env override: `NEXT_PUBLIC_ADMIN_PASSWORD`)

**Never display the password on the login screen.** Login copy is owner-only (Stille / Stilledev).

Client-side gate only. Add Vercel password protection for real lock-down.

## Features

- Tabs: Overview · Waitlist · Ops · Export
- Stats, recent signups, quick actions
- Bulk approve pending
- Copy emails (all / pending / approved)
- CSV export
- Waitlist table: search, status, notes, discount codes
- System terminal + sample activity chart

## SQL

`supabase/schema.sql` (idempotent).
