import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Server-only. Prefers ADMIN_PASSWORD; also accepts NEXT_PUBLIC_ADMIN_PASSWORD so an older .env.local keeps working. */
const secret = () => (process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "").trim();

export const adminConfigured = () => !!secret();

export function passwordOk(got: string): boolean {
  const expected = secret();
  const g = (got || "").trim();
  if (!expected || !g) return false;
  const a = Buffer.from(g);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdmin(req: NextRequest): boolean {
  return passwordOk(req.headers.get("x-admin-key") || "");
}

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key || url.includes("YOUR_PROJECT")) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
