import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
import { toCsv } from "@/lib/admin/audit";
import { logAudit } from "@/lib/admin/audit";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  if(!isAdmin(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sb=serviceClient(); if(!sb) return NextResponse.json({error:"Service role not configured"},{status:503});
  const type=req.nextUrl.searchParams.get("type")||"waitlist";
  const config: Record<string,{table:string;cols:string[]}> = {
    waitlist:{table:"waitlist_users",cols:["id","name","email","account_type","company","industry","employees","interest","access_status","source","priority","created_at"]},
    contact:{table:"contact_submissions",cols:["id","name","email","company","subject","status","is_read","source","created_at"]},
    analytics:{table:"page_views",cols:["id","path","referrer_host","country_code","device_type","browser_family","created_at"]},
    feedback:{table:"feedback",cols:["id","kind","message","page","created_at"]},
  };
  const c=config[type]; if(!c) return NextResponse.json({error:"Unknown export"},{status:400});
  const {data,error}=await sb.from(c.table).select(c.cols.join(",")).order("created_at",{ascending:false}).limit(5000);
  if(error) return NextResponse.json({error:error.message},{status:500});
  await logAudit(req,"export",c.table,undefined,{type,rows:(data||[]).length});
  return new NextResponse(toCsv(c.cols,(data||[]) as unknown as Record<string,unknown>[]),{ headers:{ "Content-Type":"text/csv;charset=utf-8", "Content-Disposition":`attachment; filename="stilledev-${type}-${new Date().toISOString().slice(0,10)}.csv"` } });
}
