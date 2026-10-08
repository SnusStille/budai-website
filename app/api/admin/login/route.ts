import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, passwordOk } from "@/lib/adminAuth";
import { clientIp, createRateLimiter, readJsonObject } from "@/lib/requestGuard";

// Brute-force guard: at most 10 attempts per address per 15 minutes.
const isLimited = createRateLimiter(10, 15 * 60 * 1000);
const noStore = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503, headers: noStore });
  }
  if (isLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429, headers: noStore });
  }
  const { password } = await readJsonObject<{ password: string }>(req);
  if (passwordOk(typeof password === "string" ? password : "")) {
    return NextResponse.json({ ok: true }, { headers: noStore });
  }
  // Constant-ish delay on failure, on top of the limiter.
  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ ok: false }, { status: 401, headers: noStore });
}
