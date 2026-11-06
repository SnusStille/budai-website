-- ============================================================================
-- MIGRATION_v12_waitlist_insert_lockdown.sql  (E9 residual hardening)
-- Idempotent. Run after MIGRATION_v11_message_feedback.sql.
--
-- POST /api/waitlist is server-authoritative: it validates consent, honeypot,
-- per-IP throttling and priority, then writes with SUPABASE_SERVICE_ROLE_KEY.
-- The historical "waitlist_insert_public" RLS policy (schema.sql, v7, v8)
-- still lets an anonymous browser INSERT directly and bypass every one of
-- those checks. Close that path.
--
-- waitlist_count() stays publicly executable (SECURITY DEFINER, one integer).
-- waitlist_status() stays service-role-only (MIGRATION_v10).
-- The referral trigger is SECURITY DEFINER, so it keeps working.
-- ============================================================================

do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'waitlist_users'
  loop
    execute format('drop policy %I on public.waitlist_users', p.policyname);
  end loop;
end $$;

alter table public.waitlist_users enable row level security;

revoke all on table public.waitlist_users from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist_users to service_role;

-- No public policy is recreated: revoked privileges + enabled RLS deny
-- anonymous reads/writes, while the service role used by the API bypasses RLS.
