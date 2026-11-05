import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminConfigured,
  adminCookieOptions,
  adminSessionMaxAge,
  adminSessionToken,
  clearLoginFailures,
  clientIp,
  loginLocked,
  noteLoginFailure,
  passwordOk,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });

  const ip = clientIp(req);
  if (loginLocked(ip)) {
    return NextResponse.json({ ok: false, reason: "too_many_attempts" }, { status: 429, headers: { "Retry-After": "900" } });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!passwordOk(password || "")) {
    noteLoginFailure(ip);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  clearLoginFailures(ip);
  const res = NextResponse.json({ ok: true });
  // The password is never returned to or stored in the browser.
  res.cookies.set(ADMIN_SESSION_COOKIE, adminSessionToken(), {
    ...adminCookieOptions,
    maxAge: adminSessionMaxAge,
  });
  return res;
}
