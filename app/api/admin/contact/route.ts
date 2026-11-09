import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
import { logAudit } from "@/lib/admin/audit";
export const dynamic="force-dynamic";
function guard(req:NextRequest){ if(!isAdmin(req)) return {err:NextResponse.json({error:"Unauthorized"},{status:401})}; const sb=serviceClient(); if(!sb) return {err:NextResponse.json({error:"Service role not configured"},{status:503})}; return {sb}; }
export async function GET(req:NextRequest){
  const g=guard(req); if(g.err) return g.err;
  const q=(req.nextUrl.searchParams.get("q")||"").trim(), status=req.nextUrl.searchParams.get("status")||"all";
  let query=g.sb!.from("contact_submissions").select("*").order("created_at",{ascending:false}).limit(200);
  if(status!=="all") query=query.eq("status",status);
  if(q) query=query.or(`name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%,message.ilike.%${q}%`);
  const {data,error}=await query; if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ items:data||[] });
}
export async function PATCH(req:NextRequest){
  const g=guard(req); if(g.err) return g.err;
  const {id,fields}=(await req.json().catch(()=>({}))) as {id?:string;fields?:Record<string,unknown>};
  if(!id||!fields) return NextResponse.json({error:"Bad request"},{status:400});
  const allowed=["status","is_read","assigned_to"]; const clean=Object.fromEntries(Object.entries(fields).filter(([k])=>allowed.includes(k)));
  if(typeof clean.assigned_to==="string") clean.assigned_to=clean.assigned_to.slice(0,120)||null;
  const {error}=await g.sb!.from("contact_submissions").update(clean).eq("id",id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  await logAudit(req,"contact.update","contact_submissions",id,{status:String(clean.status||"")});
  return NextResponse.json({ok:true});
}
export async function DELETE(req:NextRequest){
  const g=guard(req); if(g.err) return g.err;
  const id=req.nextUrl.searchParams.get("id"); if(!id) return NextResponse.json({error:"Bad request"},{status:400});
  const {error}=await g.sb!.from("contact_submissions").delete().eq("id",id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  await logAudit(req,"contact.delete","contact_submissions",id); return NextResponse.json({ok:true});
}
export async function POST(req:NextRequest){ // add internal note: {submissionId, body}
  const g=guard(req); if(g.err) return g.err;
  const {submissionId,body}=(await req.json().catch(()=>({}))) as {submissionId?:string;body?:string};
  const text=String(body||"").trim().slice(0,2000); if(!submissionId||text.length<1) return NextResponse.json({error:"Bad request"},{status:400});
  const {data,error}=await g.sb!.from("contact_notes").insert({submission_id:submissionId,body:text}).select("*").single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  await logAudit(req,"contact.note","contact_submissions",submissionId); return NextResponse.json({note:data});
}
