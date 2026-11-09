import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  if(!isAdmin(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sb=serviceClient(); if(!sb) return NextResponse.json({error:"Service role not configured"},{status:503});
  const limit=Math.min(200,Math.max(1,Number(req.nextUrl.searchParams.get("limit"))||100));
  const {data,error}=await sb.from("admin_audit_logs").select("*").order("created_at",{ascending:false}).limit(limit);
  if(error) return NextResponse.json({error:error.message,items:[]},{status:500});
  return NextResponse.json({items:data||[]});
}
