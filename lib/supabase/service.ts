import { createClient } from "@supabase/supabase-js";

/**
 * The single server-side Supabase client (step 19).
 *
 * It uses the service-role key ONLY. It must never fall back to the public
 * anon key: after MIGRATION_v10 the quota tables and the waitlist status RPC
 * have no public grants, so an anon-key write silently fails and the daily
 * limit would stop being enforced. A missing service-role key is therefore an
 * explicit "not configured" state, not a degraded client.
 *
 * The anon key is still used deliberately in `resolveUser()` helpers to verify
 * a visitor's own JWT, and in the browser for RLS-scoped reads. Those are not
 * server-owned writes and must stay separate from this client.
 */
export function hasServiceRole(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return !!url && !!key && !/your[-_]project/i.test(url);
}

export function serviceClient() {
  if (!hasServiceRole()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
