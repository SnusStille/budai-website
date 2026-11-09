"use client";
import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
type Ev={id:string;kind:string;message:string;created_at:string};
/** Real admin/audit events — replaces the former simulated log ticker. */
export default function SystemTerminal(){
  const [events,setEvents]=useState<Ev[]>([]); const [err,setErr]=useState("");
  useEffect(()=>{ fetch("/api/admin/audit?limit=30",{cache:"no-store",credentials:"same-origin"}).then(async r=>{const j=await r.json(); if(!r.ok) throw new Error(j.error||"Failed"); setEvents((j.items||[]).map((x:Record<string,string>)=>({id:x.id,kind:x.action,message:`${x.action}${x.target_type?` · ${x.target_type}`:""}`,created_at:x.created_at})));}).catch((e:Error)=>setErr(e.message)); },[]);
  return (<div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3"><Terminal className="h-4 w-4 text-accent-green"/><span className="font-mono text-sm text-muted">audit.log — real events</span></div><div className="h-[300px] space-y-1 overflow-y-auto p-4 font-mono text-xs">{err?<p className="text-amber-300">{err}. Apply MIGRATION_v13 if the table is missing.</p>:events.length===0?<p className="text-muted">No audit events yet. Admin logins and changes will appear here.</p>:events.map(e=>(<div key={e.id} className="flex gap-2"><span className="shrink-0 text-muted">{new Date(e.created_at).toLocaleString("sv-SE")}</span><span className="text-accent-cyan">{e.kind}</span><span className="text-white/75">{e.message}</span></div>))}</div></div>);
}
