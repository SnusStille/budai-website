# Admin Panel 2.0 — Stilledev Control Center

## What it is
`/admin` (password session, httpOnly cookie, rate-limited, audit-logged) now has:
Overview (real KPIs + 24h/7d/30d/90d ranges), Analytics (consent-gated page views:
top pages, referrers, devices, browsers, coarse country, CSV export), Waitlist
(existing CRM table + export), Contact/Leads CRM (`/contact` → `contact_submissions`
with statuses New/In progress/Contacted/Completed/Archived, read/unread, assignment,
internal notes, delete, notifications), Conversations, Website & Content
(announcements with scheduling, maintenance mode, SEO settings — code defaults remain
the fallback), Users & Access (profiles + last login + `app_admins` roles),
Audit Log (logins, failed logins, changes, deletions, exports), System (env booleans
only, DB connectivity/latency, table counts, email-provider status), Export, global
⌘K command palette and a notification center. No fake statistics anywhere: empty
states say so. The old simulated ActivityChart/SystemTerminal data was removed.

## Apply the database upgrade (REQUIRED before contact/analytics work in prod)
1. Back up: Supabase → Settings → Database → Backups (confirm a recent backup exists).
2. Supabase → SQL Editor → paste `supabase/MIGRATION_v13_admin_panel.sql` → Run.
   It is idempotent and non-destructive (no drops of user data; safe to re-run).
   Canonical copy: `supabase/migrations/20261109120000_admin_panel_v2.sql`.
3. Run the read-only checks in `supabase/tests/rls_admin_v2.sql` (expect 9 tables
   RLS-on, 0 anon grants).
4. Rollback (only if needed): the migration only ADDS tables/views/functions.
   Rollback = leave the tables (harmless, service-role-only) or, after exporting,
   `drop table public.page_views, public.contact_submissions, public.contact_notes,
   public.site_settings, public.site_announcements, public.site_content,
   public.app_admins, public.admin_audit_logs, public.admin_notifications cascade;`
   plus `drop view public.analytics_daily, public.analytics_top_pages;` — this
   DELETES collected analytics/leads, so export first. Never run v13 rollback on
   a database whose data you still need without a backup.

## Emails
No transactional provider key (Resend/SendGrid) is configured, so confirmation
emails are NOT sent. Admins are notified in-app (notification center) instead.
Add `RESEND_API_KEY` later to enable confirmation emails.

## Still needs owner confirmation
- Org.nr / VAT number for web publication (deliberately not invented).
- Email provider choice. - Whether Labs stays noindex (currently intentional).

## 2.1 upgrade (same day)
- Feedback triage section (requires `MIGRATION_v14_feedback_triage.sql`: adds feedback.status/is_read).
- Optional Resend emails: contact + waitlist confirmations and admin lead alerts when
  RESEND_API_KEY + EMAIL_FROM are set; in-app notifications remain the fallback.
- Custom date range is now fully wired (admin overview API accepts from/to).
- GDPR retention: Analytics -> "Purge >180d" deletes old page_views (audit-logged).
- Dashboard widget preferences (persisted per browser) + optional 60s auto-refresh.
- Announcement live preview; contact notes now actually load when a lead is opened.
- Swedish contact page at /sv/contact (same DB-backed form), added to sitemap.
