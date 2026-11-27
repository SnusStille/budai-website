import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient, adminConfigured } from "@/lib/adminAuth";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  if(!isAdmin(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sb=serviceClient(); const started=Date.now();
  let dbOk=false, dbMs:number|null=null; const tables:Record<string,number|null>={};
  if(sb){ const names=["waitlist_users","contact_submissions","page_views","feedback","profiles","conversations","admin_audit_logs","admin_notifications"]; for(const t of names){ const {count,error}=await sb.from(t).select("id",{count:"exact",head:true}); tables[t]=error?null:(count??null); if(t==="waitlist_users"){dbOk=!error; dbMs=Date.now()-started;} } }
  const health=await fetch(new URL("/api/health",req.nextUrl.origin)).then(r=>r.ok).catch(()=>false);
  return NextResponse.json({
    checkedAt:new Date().toISOString(),
    env:{ adminPassword:adminConfigured(), supabaseUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseAnon:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, serviceRole:!!process.env.SUPABASE_SERVICE_ROLE_KEY, anthropic:!!process.env.ANTHROPIC_API_KEY, openai:!!process.env.OPENAI_API_KEY, siteUrl:!!process.env.NEXT_PUBLIC_SITE_URL, nodeEnv:process.env.NODE_ENV||"unknown" },
    database:{ connected:dbOk, latencyMs:dbMs, tables },
    api:{ healthEndpoint:health },
    email:{ provider: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? "configured" : "not_configured", note: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? "Lead notifications are sent to info@stilledev.se; submissions are saved in the CRM before email delivery." : "Transactional email is not configured. Contact and waitlist submissions are still saved in the admin CRM; email notifications and confirmations are not sent." },
  });
}
