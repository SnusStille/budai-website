/**
 * Stilledev Labs — anonymous session management.
 *
 * Visitors get a secure, random session_id stored in an httpOnly cookie set by
 * the server. This lets them resume conversations without creating an account,
 * while properly isolating different visitors from each other.
 *
 * NOTE: This module is used in both Edge middleware and Node.js route handlers,
 * so it must use Web Crypto API (available in both runtimes).
 */
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const LABS_SESSION_COOKIE = "labs_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/**
 * Generate a cryptographically random 64-char hex session ID.
 * Uses Web Crypto API which works in both Edge and Node.js runtimes.
 */
export function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Build the Set-Cookie header value for a session. */
export function sessionCookieValue(sessionId: string): string {
  const parts = [
    `${LABS_SESSION_COOKIE}=${sessionId}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${SESSION_COOKIE_MAX_AGE}`,
    "SameSite=Strict",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/**
 * Read the session from server-side cookies (for Server Components).
 * Returns null if no session exists — does NOT create one.
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(LABS_SESSION_COOKIE)?.value;
  if (existing && existing.length === 64 && /^[0-9a-f]{64}$/.test(existing)) {
    return existing;
  }
  return null;
}

/** Read the session ID from an incoming request without creating a new one. */
export function getSessionFromRequest(req: NextRequest): string | null {
  const existing = req.cookies.get(LABS_SESSION_COOKIE)?.value;
  if (existing && existing.length === 64 && /^[0-9a-f]{64}$/.test(existing)) {
    return existing;
  }
  return null;
}

/** Ensure the session cookie is set on a NextResponse (used in route handlers). */
export function ensureSessionCookie(res: NextResponse, sessionId: string): void {
  res.cookies.set(LABS_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
}

/** Set a session cookie in middleware (Edge runtime compatible). */
export function setSessionCookieMiddleware(res: NextResponse, sessionId: string): void {
  res.headers.append("Set-Cookie", sessionCookieValue(sessionId));
}

/** Validate that a conversation ID is a valid UUID-ish string. */
export function isValidConversationId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
