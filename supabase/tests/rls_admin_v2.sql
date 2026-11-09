-- RLS checks for Admin Panel 2.0 — run in Supabase SQL Editor (safe, read-only + rolled-back writes).
-- 1) RLS must be ON for every v13 table:
select relname, relrowsecurity from pg_class where relname in
 ('page_views','contact_submissions','contact_notes','site_settings','site_announcements','site_content','app_admins','admin_audit_logs','admin_notifications')
 order by relname; -- expect relrowsecurity = true for all 9
-- 2) anon/authenticated must have NO grants on v13 tables (service_role only):
select table_name, grantee, privilege_type from information_schema.role_table_grants
 where table_schema='public' and table_name in
 ('page_views','contact_submissions','contact_notes','site_settings','site_announcements','site_content','app_admins','admin_audit_logs','admin_notifications')
 and grantee in ('anon','authenticated'); -- expect 0 rows
-- 3) Denied-write probe (must ERROR / affect 0 rows when run as anon via PostgREST):
--    curl -X POST "$SUPABASE_URL/rest/v1/contact_submissions" -H "apikey: $ANON_KEY" -d '{"name":"x","email":"a@b.se","message":"hello"}'  -> expect 401/403
-- 4) is_app_admin must not trust user_metadata: create a normal auth user, then
--    select public.is_app_admin(); -- expect false until a row exists in app_admins
