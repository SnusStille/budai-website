import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
import { logAudit } from "@/lib/admin/audit";
export const dynamic="force-dynamic";
function guard(req:NextRequest){ if(!isAdmin(req)) return {err:NextResponse.json({error:"Unauthorized"},{status:401})}; const sb=serviceClient(); if(!sb) return {err:NextResponse.json({error:"Service role not configured"},{status:503})}; return {sb}; }
export async function GET(req:NextRequest){
  const g=guard(req); if(g.err) return g.err;
  const [settings,announcements,content]=await Promise.all([
    g.sb!.from("site_settings").select("*").order("key"),
    g.sb!.from("site_announcements").select("*").order("created_at",{ascending:false}),
    g.sb!.from("site_content").select("*").order("key"),
  ]);
  return NextResponse.json({ settings:settings.data||[], announcements:announcements.data||[], content:content.data||[], errors:{settings:settings.error?.message||null,announcements:announcements.error?.message||null,content:content.error?.message||null} });
}
export async function POST(req:NextRequest){ // {type:'setting'|'announcement'|'content', payload}
  const g=guard(req); if(g.err) return g.err;
  const {type,payload}=(await req.json().catch(()=>({}))) as {type?:string;payload?:Record<string,unknown>};
  if(!payload) return NextResponse.json({error:"Bad request"},{status:400});
  let error: { message: string } | null = null;
  if(type==="setting"){ const key=String(payload.key||""); if(!/^[a-z0-9_.-]{1,80}$/.test(key)) return NextResponse.json({error:"Invalid key"},{status:400}); ({ error } = await g.sb!.from("site_settings").upsert({key,value:payload.value??{},updated_by:"admin",updated_at:new Date().toISOString()})); }
  else if(type==="announcement"){ const row={title:String(payload.title||"").slice(0,160),body:String(payload.body||"").slice(0,1000)||null,href:String(payload.href||"").slice(0,300)||null,label:String(payload.label||"").slice(0,60)||null,tone:["info","success","warning"].includes(String(payload.tone))?payload.tone:"info",published:!!payload.published,starts_at:payload.starts_at||null,ends_at:payload.ends_at||null}; if(payload.id) ({ error } = await g.sb!.from("site_announcements").update(row).eq("id",String(payload.id))); else ({ error } = await g.sb!.from("site_announcements").insert(row)); }
  else if(type==="content"){ const key=String(payload.key||""); if(!/^[a-z0-9_.-]{1,80}$/.test(key)) return NextResponse.json({error:"Invalid key"},{status:400}); ({ error } = await g.sb!.from("site_content").upsert({key,locale:payload.locale==="sv"?"sv":"en",title:String(payload.title||"").slice(0,200)||null,body:String(payload.body||"").slice(0,5000)||null,updated_by:"admin",updated_at:new Date().toISOString()})); }
  else return NextResponse.json({error:"Unknown type"},{status:400});
  if(error) return NextResponse.json({error:error.message},{status:500});
  await logAudit(req,`content.${type}`,"site",String(payload.key||payload.title||"")); return NextResponse.json({ok:true});
}
export async function DELETE(req:NextRequest){
  const g=guard(req); if(g.err) return g.err;
  const type=req.nextUrl.searchParams.get("type"), id=req.nextUrl.searchParams.get("id");
  if(type!=="announcement"||!id) return NextResponse.json({error:"Bad request"},{status:400});
  const {error}=await g.sb!.from("site_announcements").delete().eq("id",id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  await logAudit(req,"content.announcement.delete","site_announcements",id); return NextResponse.json({ok:true});
}
