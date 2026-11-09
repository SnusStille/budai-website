import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { serviceClient } from "@/lib/supabase/service";
export const dynamic = "force-dynamic";
const RANGES: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error:"Service role not configured", configured:false }, { status:503 });
  const rangeKey = req.nextUrl.searchParams.get("range") || "30d";
  const fromParam = req.nextUrl.searchParams.get("from"), toParam = req.nextUrl.searchParams.get("to");
  let days = RANGES[rangeKey] ?? 30; let sinceMs = Date.now() - days*86400_000;
  if (rangeKey === "custom" && fromParam) { const f = new Date(fromParam).getTime(); if (Number.isFinite(f)) { sinceMs = f; const end = toParam ? new Date(toParam).getTime() : Date.now(); days = Math.max(1, Math.min(366, Math.ceil((end - f) / 86400_000) || 1)); } }
  const since = new Date(sinceMs).toISOString();
  const today = new Date(); today.setHours(0,0,0,0);
  const safe = async <T,>(p: Promise<{data:T|null; error:unknown; count?:number|null}>): Promise<{data:T|null;count:number|null}> => { try { const r = await p; return { data: r.error?null:r.data, count: r.count??null }; } catch { return { data:null, count:null }; } };
  const [waitlist, wlToday, feedback, contacts, unreadContacts, views, convs, profiles, audit] = await Promise.all([
    safe(sb.from("waitlist_users").select("id,created_at,access_status,source",{count:"exact"}).gte("created_at",since).order("created_at",{ascending:true}).limit(5000) as never),
    safe(sb.from("waitlist_users").select("id",{count:"exact",head:true}).gte("created_at",today.toISOString()) as never),
    safe(sb.from("feedback").select("id",{count:"exact",head:true}) as never),
    safe(sb.from("contact_submissions").select("id",{count:"exact",head:true}) as never),
    safe(sb.from("contact_submissions").select("id",{count:"exact",head:true}).eq("is_read",false) as never),
    safe(sb.from("page_views").select("path,referrer_host,country_code,device_type,browser_family,session_hash,created_at").gte("created_at",since).order("created_at",{ascending:true}).limit(10000) as never),
    safe(sb.from("conversations").select("id",{count:"exact",head:true}) as never),
    safe(sb.from("profiles").select("id",{count:"exact",head:true}) as never),
    safe(sb.from("admin_audit_logs").select("id,actor,action,target_type,created_at").order("created_at",{ascending:false}).limit(12) as never),
  ]);
  type V = { path:string; referrer_host:string|null; country_code:string|null; device_type:string; browser_family:string; session_hash:string; created_at:string };
  const vrows = (views.data as V[]|null) || [];
  const sessions = new Set(vrows.map(v=>v.session_hash));
  const bucket = new Map<string,{label:string;views:number;signups:number}>();
  const wl = (waitlist.data as {created_at:string;access_status:string;source:string|null}[]|null)||[];
  const stepHours = days<=1;
  for (let i=0;i<(stepHours?24:days);i++){ const d=new Date(Date.now()-(stepHours?(23-i)*3600_000:(days-1-i)*86400_000)); const k=stepHours?d.toISOString().slice(0,13):d.toISOString().slice(0,10); bucket.set(k,{label:stepHours?`${d.getHours()}:00`:k.slice(5),views:0,signups:0}); }
  for (const v of vrows){ const k=stepHours?v.created_at.slice(0,13):v.created_at.slice(0,10); const b=bucket.get(k); if(b) b.views++; }
  for (const w of wl){ const k=stepHours?w.created_at.slice(0,13):w.created_at.slice(0,10); const b=bucket.get(k); if(b) b.signups++; }
  const countBy = (key: keyof V) => { const m=new Map<string,number>(); for(const v of vrows){ const k=String(v[key]||"Direct / unknown"); m.set(k,(m.get(k)||0)+1);} return [...m.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,8); };
  const topPages = countBy("path");
  return NextResponse.json({
    configured:true, range: rangeKey,
    totals: { pageViews: vrows.length, uniqueVisitors: sessions.size, waitlistTotal: waitlist.count, waitlistInRange: wl.length, waitlistToday: wlToday.count, pending: wl.filter(w=>w.access_status==="pending").length, approved: wl.filter(w=>w.access_status==="approved").length, feedback: feedback.count, contacts: contacts.count, unreadContacts: unreadContacts.count, conversations: convs.count, profiles: profiles.count, conversionRate: vrows.length? Math.round((wl.length/vrows.length)*1000)/10 : null },
    series: [...bucket.values()], topPages, sources: countBy("referrer_host"), devices: countBy("device_type"), browsers: countBy("browser_family"), countries: countBy("country_code"),
    recentActivity: audit.data||[],
    note: vrows.length===0 ? "No page views recorded yet in this range. Views are only recorded after visitor analytics consent — this is real data, not sampled." : undefined,
  });
}
