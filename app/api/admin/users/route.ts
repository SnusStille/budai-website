import { NextRequest, NextResponse } from "next/server";
import { isAdmin, serviceClient } from "@/lib/adminAuth";
export const dynamic="force-dynamic";
/** Account overview via service role. Password hashes are never returned by Supabase Auth admin API to us, and we expose only operational fields. */
export async function GET(req:NextRequest){
  if(!isAdmin(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sb=serviceClient(); if(!sb) return NextResponse.json({error:"Service role not configured"},{status:503});
  const [{data:profiles},{data:admins}] = await Promise.all([ sb.from("profiles").select("id,email,display_name,created_at").order("created_at",{ascending:false}).limit(200), sb.from("app_admins").select("*") ]);
  let authUsers: {id:string; last_sign_in_at:string|null; created_at:string}[] = [];
  try { const r = await sb.auth.admin.listUsers({ page:1, perPage:200 }); authUsers = (r.data?.users||[]).map(u=>({ id:u.id, last_sign_in_at:u.last_sign_in_at||null, created_at:u.created_at })); } catch {}
  const authMap=new Map(authUsers.map(u=>[u.id,u])); const adminMap=new Map((admins||[]).map(a=>[a.user_id,a]));
  return NextResponse.json({ users:(profiles||[]).map(p=>({ ...p, last_sign_in_at: authMap.get(p.id)?.last_sign_in_at||null, role: adminMap.get(p.id)?.role||null, is_admin: !!adminMap.get(p.id) })), admins: admins||[] });
}
