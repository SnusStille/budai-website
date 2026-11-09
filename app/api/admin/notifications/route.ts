import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  if(!isAdmin(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sb=serviceClient(); if(!sb) return NextResponse.json({items:[],unread:0});
  const {data}=await sb.from("admin_notifications").select("*").order("created_at",{ascending:false}).limit(50);
  return NextResponse.json({ items:data||[], unread:(data||[]).filter(n=>!n.is_read).length });
}
export async function PATCH(req:NextRequest){
  if(!isAdmin(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sb=serviceClient(); if(!sb) return NextResponse.json({error:"Not configured"},{status:503});
  const {id,all}=await req.json().catch(()=>({})) as {id?:string;all?:boolean};
  const q=sb.from("admin_notifications").update({is_read:true});
  const {error}=await (all?q.eq("is_read",false):q.eq("id",String(id||"")));
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
