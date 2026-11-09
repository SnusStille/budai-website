import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";
export const dynamic = "force-dynamic";
/** Public, secret-free site config: active announcement + maintenance + SEO overrides. */
export async function GET() {
  const fallback = { announcement: null as null|Record<string,unknown>, maintenance: false, seo: {} as Record<string,string> };
  const sb = serviceClient(); if (!sb) return NextResponse.json(fallback, { headers:{ "Cache-Control":"public, s-maxage=30" } });
  try {
    const now = new Date().toISOString();
    const [{ data: ann }, { data: settings }] = await Promise.all([
      sb.from("site_announcements").select("id,title,body,href,label,tone").eq("published",true).or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gte.${now}`).order("created_at",{ascending:false}).limit(1),
      sb.from("site_settings").select("key,value").in("key",["maintenance_mode","seo_title","seo_description","og_image"]),
    ]);
    const map = Object.fromEntries((settings||[]).map(s=>[s.key, s.value]));
    const maint = map["maintenance_mode"] as { enabled?:boolean }|undefined;
    const safeAnn = ann?.[0] ? { ...ann[0], href: typeof ann[0].href==="string" && (/^\//.test(ann[0].href) || /^https:\/\//.test(ann[0].href)) ? ann[0].href : null } : null;
    return NextResponse.json({ announcement: safeAnn, maintenance: !!maint?.enabled, seo: { title: String((map["seo_title"] as {value?:string})?.value||""), description: String((map["seo_description"] as {value?:string})?.value||"") } }, { headers:{ "Cache-Control":"public, s-maxage=30, stale-while-revalidate=120" } });
  } catch { return NextResponse.json(fallback); }
}
