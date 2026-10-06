import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Server-only. ADMIN_PASSWORD has no fallback: if unset, admin is locked. */
export function passwordOk(got: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !got) return false;
  const a = Buffer.from(got);
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
