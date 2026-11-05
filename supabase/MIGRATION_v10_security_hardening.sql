-- ============================================================================
-- BudAI MIGRATION v10 — close public RLS holes (audit 2026-11, point B6)
-- Run in the Supabase SQL Editor AFTER schema.sql / MIGRATION_v2 … v9.
-- Safe to re-run. No app restart needed.
--
-- Before:
--   * anyone with the anon key could read/reset EVERY guest quota row
--   * anyone could read the whole admin event log and insert arbitrary rows
--   * anyone could call waitlist_status(any_email) (SECURITY DEFINER) to
--     enumerate signups and read someone else's referral code
-- After:
--   * only the service role can touch guest quota counters
--   * admin_events has no public SELECT and only a bounded INSERT
--   * waitlist_status is executable by service_role only; the browser uses
--     /api/waitlist/status with a signed proof-of-signup cookie
--
-- REQUIRED: set SUPABASE_SERVICE_ROLE_KEY in the server environment. Without
-- it, guest quota writes and the status lookup degrade to "soft" mode.
-- ============================================================================

-- 1. Guest quota counters — no public policies at all.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'usage_guest_daily'
  loop
    execute format('drop policy %I on public.usage_guest_daily', p.policyname);
  end loop;
end $$;

alter table public.usage_guest_daily enable row level security;
revoke all on table public.usage_guest_daily from anon, authenticated;

-- 2. Admin events — no public reads, bounded writes only.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'admin_events'
  loop
    execute format('drop policy %I on public.admin_events', p.policyname);
  end loop;
end $$;

alter table public.admin_events enable row level security;
revoke all on table public.admin_events from anon, authenticated;
grant insert on table public.admin_events to anon, authenticated;

create policy "admin_events_insert_bounded"
  on public.admin_events for insert to anon, authenticated
  with check (
    char_length(message) between 1 and 500
    and kind in ('signup', 'approve', 'reject', 'bulk_approve', 'note', 'system', 'feedback')
    and char_length(coalesce(meta::text, '{}')) <= 4000
  );

-- 3. Counters can never be negative (which would grant unbounded quota).
alter table public.usage_daily drop constraint if exists usage_daily_counters_valid;
alter table public.usage_daily add constraint usage_daily_counters_valid
  check (messages >= 0 and images >= 0 and generations >= 0
         and messages <= 10000 and images <= 10000 and generations <= 10000);

alter table public.usage_guest_daily drop constraint if exists usage_guest_daily_counters_valid;
alter table public.usage_guest_daily add constraint usage_guest_daily_counters_valid
  check (messages >= 0 and images >= 0 and generations >= 0
         and messages <= 10000 and images <= 10000 and generations <= 10000);

-- 4. The SECURITY DEFINER lookup is server-only.
revoke all on function public.waitlist_status(text) from public, anon, authenticated;
grant execute on function public.waitlist_status(text) to service_role;

-- waitlist_count() only returns an integer total and stays publicly readable.
-- The public waitlist_insert_public policy is unchanged: the server route now
-- does the validation, but the RLS check remains a second line of defence.
