# Stilledev Labs — Supabase Database Guide

This guide explains the Stilledev Labs v2.0 database schema for BudAI's intelligent project-qualification chat.

## Quick Start

1. Open your Supabase project → **SQL Editor**
2. Run [`STILLEDEV_LABS_SUPABASE_SETUP.sql`](./STILLEDEV_LABS_SUPABASE_SETUP.sql) in its entirety
3. Verify all tables appear under **Table Editor → labs_** prefix
4. Set the environment variables in Vercel (see below)

The SQL is **idempotent**: you can re-run it safely. It uses `CREATE TABLE IF NOT EXISTS`, `CREATE TYPE IF NOT EXISTS`, and conditional `ALTER TABLE ... ADD COLUMN` blocks — nothing is dropped or overwritten.

## Environment Variables

The Labs chat needs these variables (set in Vercel → Project Settings → Environment Variables):

| Variable | Purpose | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key for BudAI responses | Yes |
| `ADMIN_PASSWORD` | Shared admin password for CRM login (reused from existing BudAI admin) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for server-side DB access | Yes |
| `LABS_NOTIFICATION_EMAIL` | Email that receives project notifications (default: `info@stilledev.se`) | No |
| `RESEND_API_KEY` | For sending email notifications via Resend | For email |

**Important**: `SUPABASE_SERVICE_ROLE_KEY` must be the service-role key (bypasses RLS), never the anon key. Never expose it client-side.

## Tables Overview

| Table | Purpose | Read (server) | Write (server) |
|---|---|---|---|
| `labs_conversations` | Chat sessions, stores the current dynamic project profile | ✅ | ✅ |
| `labs_messages` | Individual chat messages (user + assistant) with profile deltas | ✅ | ✅ |
| `labs_projects` | Qualified leads — full project record created when contact info is collected | ✅ | ✅ |
| `labs_notes` | Internal admin notes (Oliver's private comments on projects) | ✅ | ✅ |
| `labs_notifications` | Event log for email notifications | ✅ | ✅ |
| `labs_profile_snapshots` | Periodic snapshots of project profile (every 4 turns) for history | ✅ | ✅ |

All tables use `labs_` prefix to avoid any conflict with existing BudAI tables.

### `labs_conversations`

One row per anonymous chat session. Tied to a session cookie (`labs_session_id`), not to a user account.

Key columns:
- `id` (uuid, PK)
- `session_id` (text) — anonymous session identifier from cookie
- `language` ("sv" | "en")
- `title` — auto-generated from first user message
- `project_profile` (jsonb) — **the live dynamic profile** (see schema below)
- `project_category` — enum (website, web_application, mobile_app, etc.)
- `priority_score` (int, 0–100) — BudAI's lead-score (admin-only visibility)
- `message_count` — denormalized count
- `consent_given` (bool) — true once contact form is submitted

### `labs_messages`

Every message in every conversation. Stores role, content, and a `profile_delta` (jsonb) containing only the fields BudAI changed on that turn.

### `labs_projects`

Created only when BudAI detects the conversation is qualified AND contact info is submitted (or a `[[SUMMARY:]]` block is received). This is the CRM record.

Key fields:
- **Contact**: `contact_name`, `contact_email`, `contact_phone`, `company`, `preferred_contact`
- **Project**: `project_title`, `project_category`, `customer_goal`, `target_audience`, `problem`, `proposed_solution`
- **Scope**: `scope_mvp`, `scope_future`, `key_features[]`, `technical_requirements[]`
- **Assessment**: `technical_complexity`, `budget`, `budget_assessment`, `timeline`, `timeline_assessment`
- **Risks/Opportunities**: `business_risks[]`, `technical_risks[]`, `opportunities[]`, `competition`
- **Qualification**: `priority_score`, `priority_strengths[]`, `priority_concerns[]`, `priority_recommendation`
- **Admin**: `status` (enum), `starred` (bool), `is_read` (bool), `admin_assignee`, `admin_notes_count`

### `labs_notes`

Oliver's private notes per project. Never shown to customers.

### `labs_notifications`

Log of system events:
- `new_conversation` — a visitor started chatting
- `contact_received` — contact info submitted
- `project_qualified` — high-priority lead detected
- `summary_ready` — AI summary generated
- `high_priority_lead` — score ≥70 with 3+ turns

### `labs_profile_snapshots`

Periodic captures (every 4 turns) of the project profile JSON, enabling Oliver to see how BudAI's understanding evolved during the conversation.

## Enums

- **`labs_project_status`**: `new_inquiry`, `conversation_active`, `needs_review`, `qualified`, `meeting_requested`, `quote_sent`, `accepted`, `declined`, `completed`
- **`labs_project_category`**: `website`, `web_application`, `mobile_app`, `ai_service`, `automation`, `ecommerce`, `booking_system`, `saas_platform`, `integration`, `consulting`, `other`, `unknown`
- **`labs_notification_kind`**: `new_conversation`, `contact_received`, `project_qualified`, `summary_ready`, `high_priority_lead`

## Row-Level Security (RLS)

**All Labs tables use service-role-only access.** Public, anon, and authenticated roles have zero permissions. This is the most secure posture:

- No customer can read or write any `labs_*` table directly.
- All access goes through Next.js API routes (`/api/labs/*`) running server-side with the service-role key.
- Customer-facing routes validate the anonymous `labs_session_id` cookie and scope all queries to that session — they cannot see other sessions' data.
- Admin routes (`/api/admin/labs/*`) require the `ADMIN_PASSWORD` cookie (set via existing BudAI admin login).

The SQL includes:
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON <table> FROM PUBLIC, anon, authenticated;
```

## Helper Functions

The migration creates two PostgreSQL helper functions (not exposed via RPC):

- **`labs_record_message(conversation_id, role, content, profile_delta)`** — inserts a message, increments `message_count`, and updates `last_message_at`. Called via direct insert in the API route.
- **`labs_get_context(conversation_id, max_messages)`** — returns recent messages + current project profile for context window assembly. Used internally by the chat API for long conversations.

## Triggers

`set_updated_at()` — automatically maintains the `updated_at` timestamp on all tables.

## Indexes

- `labs_conversations_session_id_idx` — look up a user's conversations
- `labs_conversations_priority_score_idx` — admin dashboard sorting
- `labs_conversations_status_idx` — filter by status
- `labs_projects_status_idx`, `labs_projects_starred_idx`, `labs_projects_is_read_idx`, `labs_projects_contact_email_idx`
- `labs_messages_conversation_id_created_at_idx` — conversation history pagination
- `labs_notes_project_id_created_at_idx`
- `labs_notifications_created_at_idx`
- `labs_profile_snapshots_conversation_id_turn_number_idx`

## Migration Safety

The SQL script is designed to be safe on existing installations:
1. Types and tables are created with `IF NOT EXISTS`
2. `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` adds new columns without dropping data
3. Indexes use `IF NOT EXISTS`
4. No `DROP`, `TRUNCATE`, or destructive `ALTER COLUMN` statements
5. RLS policies are dropped before being recreated to avoid duplicates on re-run

If you have an older v1 schema (from `MIGRATION_v15_labs.sql`), this script will add the missing columns and tables non-destructively.

## Verification Steps

After running the migration:

1. **Tables exist**: Go to Table Editor and confirm 6 `labs_*` tables
2. **RLS enabled**: For each table, check "RLS enabled" badge
3. **No public access**: Run this in SQL Editor to confirm no public permissions:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'labs_%';
   -- All six tables should appear
   ```
4. **Test chat**: Visit `/labs` in a new incognito window, send a message, then check `labs_conversations` and `labs_messages` in Supabase
5. **Test contact flow**: Chat for 4+ messages, submit contact form, verify a row appears in `labs_projects`
6. **Test admin**: Log in to `/admin`, click "Stilledev Labs", verify projects list loads

## Data Retention

- Conversations are tied to anonymous session cookies (90-day expiry)
- No personal data is collected until the visitor voluntarily submits the contact form
- Completed projects can be deleted from the admin panel (future feature)
- There is no automatic purge — add a cron job or manual cleanup if GDPR data minimization requires it

## Cost Control

- The `labs_messages` table stores every AI response and user message. Monitor table size for high-traffic periods.
- `labs_profile_snapshots` stores a JSON blob every 4 turns. These are small (typically < 2 KB each) but do accumulate.
- Consider adding a retention policy (e.g., delete snapshots older than 12 months for non-converted leads) if storage becomes a concern.
