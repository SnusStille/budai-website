import { createHmac, timingSafeEqual } from "crypto";

/**
 * Proof-of-signup cookie for the waitlist position widget.
 *
 * `waitlist_status(email)` is SECURITY DEFINER and must not be callable by
 * anyone from the browser (email enumeration + referral-code disclosure).
 * Instead, /api/waitlist sets a signed, httpOnly cookie containing only the
 * email that just signed up; /api/waitlist/status verifies it and performs the
 * lookup server-side with the service role.
 */
export const WAITLIST_STATUS_COOKIE = "budai_waitlist_status";

/**
 * Only the service-role key may sign these tokens. ADMIN_PASSWORD is a
 * human-chosen admin credential that can be rotated independently and must
 * never become a second, weaker signing key. Besides: the status lookup itself
 * already requires the service role, so a fallback key could only produce
 * cookies that can never be resolved. Fail closed when it is missing.
 */
function signingKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function signWaitlistEmail(email: string): string | null {
  const key = signingKey();
  if (!key) return null;
  const mac = createHmac("sha256", key).update(email).digest("hex").slice(0, 32);
  return `${Buffer.from(email, "utf8").toString("base64url")}.${mac}`;
}

export function verifyWaitlistToken(token: string | undefined): string | null {
  const key = signingKey();
  if (!key || !token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  let email: string;
  try {
    email = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return null;
  const expected = createHmac("sha256", key).update(email).digest("hex").slice(0, 32);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return email;
}
