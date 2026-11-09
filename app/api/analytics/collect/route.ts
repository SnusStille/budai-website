import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { serviceClient } from "@/lib/supabase/service";
import { RULES, checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const PATH = /^\/[a-zA-Z0-9/_-]*$/;
function browser(ua: string) { if (/bot|crawl|spider/i.test(ua)) return "bot"; if (/edg\//i.test(ua)) return "Edge"; if (/chrome/i.test(ua)) return "Chrome"; if (/firefox/i.test(ua)) return "Firefox"; if (/safari/i.test(ua)) return "Safari"; return "Other"; }
function device(ua: string) { if (/bot|crawl|spider/i.test(ua)) return "bot"; if (/ipad|tablet/i.test(ua)) return "tablet"; if (/mobi|iphone|android/i.test(ua)) return "mobile"; return "desktop"; }
/** GDPR-minimal beacon: consent flag required, no IP/full UA stored, daily-rotating session hash. */
export async function POST(req: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(req, RULES.feedback, "analytics"), { name:"analytics", limit:120, windowMs:3600_000 });
  if (limit.limited) return NextResponse.json({ ok:false }, { status:429 });
  const b = await req.json().catch(()=>({})) as { path?:string; referrer?:string; session?:string; consent?:boolean };
  if (b.consent !== true) return NextResponse.json({ ok:false, error:"consent_required" }, { status:400 });
  const path = String(b.path||"/").slice(0,300); if (!PATH.test(path) || path.startsWith("/admin") || path.startsWith("/api")) return NextResponse.json({ ok:false }, { status:400 });
  const session = String(b.session||""); if (session.length < 16 || session.length > 80) return NextResponse.json({ ok:false }, { status:400 });
  let referrerHost: string|null = null;
  try { if (b.referrer) { const u = new URL(String(b.referrer)); if (u.hostname !== req.nextUrl.hostname) referrerHost = u.hostname.slice(0,200); } } catch {}
  const day = new Date().toISOString().slice(0,10);
  const sessionHash = createHash("sha256").update(`${session}|${day}|stilledev-analytics-v1`).digest("hex");
  const sb = serviceClient(); if (!sb) return NextResponse.json({ ok:true, stored:false });
  const ua = req.headers.get("user-agent")||"";
  const country = (req.headers.get("x-vercel-ip-country")||"").slice(0,2).toUpperCase() || null;
  const { error } = await sb.from("page_views").insert({ path, referrer_host: referrerHost, country_code: country, device_type: device(ua), browser_family: browser(ua), session_hash: sessionHash });
  return NextResponse.json({ ok:true, stored: !error });
}
