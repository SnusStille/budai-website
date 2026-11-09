"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Eye, EyeOff, RefreshCw, Download, Search, LayoutDashboard, Users, BarChart3,
  Inbox, MessageSquare, MessagesSquare, Globe, Shield, ScrollText, Cpu, FileDown,
  Bell, X, Menu, LogOut, Check, Megaphone, Wrench, ExternalLink, Trash2,
} from "lucide-react";
import StatsCards from "@/components/admin/StatsCards";
import UserTable from "@/components/admin/UserTable";
import ActivityChart, { type SeriesPoint } from "@/components/admin/ActivityChart";
import AdminInbox from "@/components/admin/AdminInbox";
import SystemTerminal from "@/components/admin/SystemTerminal";
import BudAILogo from "@/components/ui/BudAILogo";
import Link from "next/link";
import { getWaitlistUsers, getWaitlistStats } from "@/lib/data";
import type { WaitlistUser } from "@/types";

type Section = "overview"|"analytics"|"waitlist"|"contact"|"chats"|"content"|"users"|"audit"|"system"|"export";
const NAV: {id:Section;label:string;icon:typeof Users}[] = [
  {id:"overview",label:"Overview",icon:LayoutDashboard},{id:"analytics",label:"Analytics",icon:BarChart3},
  {id:"waitlist",label:"Waitlist",icon:Users},{id:"contact",label:"Contact / Leads",icon:Inbox},
  {id:"chats",label:"Conversations",icon:MessagesSquare},{id:"content",label:"Website & Content",icon:Globe},
  {id:"users",label:"Users & Access",icon:Shield},{id:"audit",label:"Audit Log",icon:ScrollText},
  {id:"system",label:"System",icon:Cpu},{id:"export",label:"Export",icon:FileDown},
];
type Overview = { totals: Record<string, number|null>; series: SeriesPoint[]; topPages:{name:string;count:number}[]; sources:{name:string;count:number}[]; devices:{name:string;count:number}[]; browsers:{name:string;count:number}[]; countries:{name:string;count:number}[]; recentActivity:{id:string;action:string;target_type:string|null;created_at:string}[]; note?:string };
type Contact = { id:string; name:string; email:string; company:string|null; subject:string; message:string; status:string; is_read:boolean; assigned_to:string|null; source:string; created_at:string };
type Chat = { id:string; title:string; email:string|null; display_name:string|null; message_count:number; updated_at:string };

const card = "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5";
const input = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent-cyan/40 focus:outline-none";
const btn = "inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-white/85 transition hover:bg-white/5 disabled:opacity-50";
const btnPrimary = "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";

function Bars({rows,title}:{rows:{name:string;count:number}[];title:string}) {
  const max=Math.max(...rows.map(r=>r.count),1);
  return <div className={card}><h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>{rows.length===0?<p className="text-xs text-muted">No recorded data in this period.</p> : <ul className="space-y-2.5">{rows.map(r=>(<li key={r.name} className="text-xs"><div className="mb-1 flex justify-between gap-2"><span className="truncate text-white/80">{r.name}</span><span className="font-mono text-muted">{r.count}</span></div><div className="h-1.5 rounded bg-white/5"><div className="h-full rounded bg-accent-cyan/70" style={{width:`${(r.count/max)*100}%`}}/></div></li>))}</ul>}</div>;
}

export default function AdminPage(){
  const [authenticated,setAuthenticated]=useState(false);
  const [password,setPassword]=useState(""); const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState(false); const [hint,setHint]=useState("");
  const [section,setSection]=useState<Section>("overview");
  const [mobileOpen,setMobileOpen]=useState(false);
  const [users,setUsers]=useState<WaitlistUser[]>([]); const [loading,setLoading]=useState(true);
  const [range,setRange]=useState("30d"); const [customFrom,setCustomFrom]=useState(""); const [customTo,setCustomTo]=useState("");
  const [overview,setOverview]=useState<Overview|null>(null); const [overviewErr,setOverviewErr]=useState("");
  const [contacts,setContacts]=useState<Contact[]>([]); const [contactQ,setContactQ]=useState(""); const [contactStatus,setContactStatus]=useState("all");
  const [selectedContact,setSelectedContact]=useState<Contact|null>(null); const [noteText,setNoteText]=useState(""); const [notes,setNotes]=useState<{id:string;body:string;created_at:string}[]>([]);
  const [chats,setChats]=useState<Chat[]>([]); const [chatQ,setChatQ]=useState(""); const [chatErr,setChatErr]=useState(""); const [selectedChat,setSelectedChat]=useState<{conversation:Record<string,unknown>;messages:{id:string;role:string;content:string;created_at:string}[]}|null>(null);
  const [content,setContent]=useState<{settings:Record<string,unknown>[];announcements:Record<string,unknown>[];content:Record<string,unknown>[]}|null>(null);
  const [ann,setAnn]=useState({title:"",body:"",href:"",label:"Learn more",tone:"info",published:false,starts_at:"",ends_at:""});
  const [seo,setSeo]=useState({title:"",description:""}); const [maintenance,setMaintenance]=useState(false);
  const [sysUsers,setSysUsers]=useState<{id:string;email:string|null;display_name:string|null;created_at:string;last_sign_in_at:string|null;role:string|null;is_admin:boolean}[]>([]);
  const [system,setSystem]=useState<Record<string,unknown>|null>(null);
  const [audit,setAudit]=useState<{id:string;actor:string;action:string;target_type:string|null;target_id:string|null;created_at:string}[]>([]);
  const [notifs,setNotifs]=useState<{id:string;kind:string;title:string;body:string|null;is_read:boolean;created_at:string}[]>([]);
  const [showNotifs,setShowNotifs]=useState(false); const [palette,setPalette]=useState(false); const [paletteQ,setPaletteQ]=useState("");
  const paletteRef=useRef<HTMLInputElement>(null);

  const stats=useMemo(()=>getWaitlistStats(users),[users]);
  const unread=notifs.filter(n=>!n.is_read).length;

  const loadOverview=useCallback(async()=>{ try{ const r=await fetch(`/api/admin/overview?range=${range}`,{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Failed"); setOverview(j); setOverviewErr(""); }catch(e){ setOverviewErr(e instanceof Error?e.message:"Failed"); } },[range]);
  const loadContacts=useCallback(async()=>{ try{ const r=await fetch(`/api/admin/contact?status=${contactStatus}${contactQ?`&q=${encodeURIComponent(contactQ)}`:""}`,{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(r.ok) setContacts(j.items||[]); }catch{} },[contactQ,contactStatus]);
  const loadNotifs=useCallback(async()=>{ try{ const r=await fetch("/api/admin/notifications",{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(r.ok) setNotifs(j.items||[]); }catch{} },[]);
  const refreshAll=useCallback(async()=>{ setLoading(true); try{ const [u]=await Promise.all([getWaitlistUsers(),loadOverview(),loadContacts(),loadNotifs()]); setUsers(u); } finally{ setLoading(false); } },[loadOverview,loadContacts,loadNotifs]);

  useEffect(()=>{ if(sessionStorage.getItem("budai_admin_auth")==="true") setAuthenticated(true); },[]);
  useEffect(()=>{ if(authenticated) void refreshAll(); },[authenticated,refreshAll]);
  useEffect(()=>{ if(!authenticated) return; if(section==="chats") void loadChats(); if(section==="content") void loadContent(); if(section==="users") void loadUsers(); if(section==="system") void loadSystem(); if(section==="audit"){ void loadAudit(); } },[section,authenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){ e.preventDefault(); setPalette(v=>!v); } if(e.key==="Escape") setPalette(false); }; window.addEventListener("keydown",onKey); return ()=>window.removeEventListener("keydown",onKey); },[]);
  useEffect(()=>{ if(palette) setTimeout(()=>paletteRef.current?.focus(),30); },[palette]);

  async function loadChats(q=chatQ){ setChatErr(""); try{ const r=await fetch(`/api/admin/conversations?limit=50${q?`&q=${encodeURIComponent(q)}`:""}`,{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(!r.ok){setChatErr(j.error||j.hint||"Failed");setChats([]);} else setChats(j.conversations||[]); }catch{ setChatErr("Network error"); } }
  async function openChat(id:string){ try{ const r=await fetch(`/api/admin/conversations?id=${encodeURIComponent(id)}`,{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(r.ok) setSelectedChat(j); else setChatErr(j.error||"Could not open"); }catch{ setChatErr("Network error"); } }
  async function loadContent(){ try{ const r=await fetch("/api/admin/content",{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(r.ok){ setContent(j); const m=(j.settings||[]).find((s:Record<string,unknown>)=>s.key==="maintenance_mode"); setMaintenance(!!(m?.value as {enabled?:boolean})?.enabled); const t=(j.settings||[]).find((s:Record<string,unknown>)=>s.key==="seo_title"); const d=(j.settings||[]).find((s:Record<string,unknown>)=>s.key==="seo_description"); setSeo({title:String((t?.value as {value?:string})?.value||""),description:String((d?.value as {value?:string})?.value||"")}); } }catch{} }
  async function loadUsers(){ try{ const r=await fetch("/api/admin/users",{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(r.ok) setSysUsers(j.users||[]); }catch{} }
  async function loadSystem(){ try{ const r=await fetch("/api/admin/system",{cache:"no-store",credentials:"same-origin"}); if(r.ok) setSystem(await r.json()); }catch{} }
  async function loadAudit(){ try{ const r=await fetch("/api/admin/audit?limit=150",{cache:"no-store",credentials:"same-origin"}); const j=await r.json(); if(r.ok) setAudit(j.items||[]); }catch{} }

  const handleLogin=async(e:React.FormEvent)=>{ e.preventDefault(); try{ const res=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
    if(res.status===503){setHint("Admin password isn't set on the server. Add ADMIN_PASSWORD to env and restart/redeploy.");setError(true);return;}
    if(res.status===429){setHint("Too many attempts. Try again in 15 minutes.");setError(true);return;}
    if(!res.ok){setHint("Wrong password.");setError(true);return;}
    sessionStorage.setItem("budai_admin_auth","true"); setError(false); setHint(""); setAuthenticated(true);
  }catch{ setHint("Network error. Is the server running?"); setError(true); } };

  const logout=async()=>{ try{ await fetch("/api/admin/logout",{method:"POST",credentials:"same-origin"}); }catch{} sessionStorage.removeItem("budai_admin_auth"); setAuthenticated(false); };
  const patchContact=async(c:Contact,fields:Record<string,unknown>)=>{ await fetch("/api/admin/contact",{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({id:c.id,fields})}); void loadContacts(); if(selectedContact?.id===c.id) setSelectedContact({...c,...fields} as Contact); };
  const saveSetting=async(key:string,value:unknown)=>{ await fetch("/api/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({type:"setting",payload:{key,value}})}); void loadContent(); };

  const paletteItems=[
    ...NAV.map(n=>({label:`Go to ${n.label}`,run:()=>setSection(n.id)})),
    {label:"Refresh all data",run:()=>void refreshAll()},
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- file download
    {label:"Export waitlist CSV",run:()=>{window.location.href="/api/admin/export?type=waitlist";}},
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- file download
    {label:"Export contacts CSV",run:()=>{window.location.href="/api/admin/export?type=contact";}},
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- file download
    {label:"Export analytics CSV",run:()=>{window.location.href="/api/admin/export?type=analytics";}},
    ...users.slice(0,20).map(u=>({label:`Waitlist: ${u.name} (${u.email})`,run:()=>setSection("waitlist")})),
    ...contacts.slice(0,20).map(c=>({label:`Contact: ${c.subject} — ${c.name}`,run:()=>{setSection("contact");setSelectedContact(c);}})),
  ].filter(i=>i.label.toLowerCase().includes(paletteQ.toLowerCase()));

  if(!authenticated) return (
    <main id="main" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7" aria-label="Admin login">
        <div className="mb-5 flex items-center gap-3"><BudAILogo size="sm" animated/><div><h1 className="font-bold">Stilledev Control Center</h1><p className="text-xs text-muted">Admin Panel 2.0 · Owner access only</p></div></div>
        <label className="mb-1.5 block text-sm text-white/80" htmlFor="admin-password">Admin password</label>
        <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"/><input id="admin-password" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your key" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-11 text-white placeholder:text-muted focus:border-accent-cyan/40 focus:outline-none" autoComplete="current-password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-white">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div>
        {hint&&<p className={`mt-3 rounded-lg px-3 py-2 text-xs ${error?"border border-red-400/25 bg-red-400/10 text-red-200":"text-muted"}`} role={error?"alert":"status"}>{hint}</p>}
        <button type="submit" className={`${btnPrimary} mt-5 w-full justify-center py-3`}>Sign in</button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">Protected by a server-set httpOnly session cookie, rate-limited logins and an audit trail. Never share the admin password.</p>
      </form>
    </main>
  );

  const totals=overview?.totals||{};
  const sys = (system||{}) as {env?:Record<string,unknown>;database?:{connected?:boolean;latencyMs?:number|null;tables?:Record<string,number|null>};api?:{healthEndpoint?:boolean};email?:{note?:string};checkedAt?:string};
  const kpis:[string,unknown,string][]=[
    ["Page views",totals.pageViews,"recorded, consent-gated"],["Unique visitors",totals.uniqueVisitors,"distinct daily sessions"],
    ["Waitlist total",totals.waitlistTotal,"all time"],["Waitlist today",totals.waitlistToday,"since midnight"],
    ["Pending",totals.pending,"in selected range"],["Contacts",totals.contacts,`${totals.unreadContacts??0} unread`],
    ["Accounts",totals.profiles,"registered profiles"],["Conversations",totals.conversations,"Playground threads"],
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Command palette */}
      <AnimatePresence>{palette&&(<div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 p-4 pt-[12vh]" role="dialog" aria-label="Command palette" onClick={()=>setPalette(false)}><motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#07070e] shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-4"><Search className="h-4 w-4 text-muted"/><input ref={paletteRef} value={paletteQ} onChange={e=>setPaletteQ(e.target.value)} placeholder="Search sections, people, actions…  (Esc to close)" className="w-full bg-transparent py-3.5 text-sm text-white placeholder:text-muted focus:outline-none" aria-label="Global search"/></div>
        <ul className="max-h-80 overflow-y-auto p-2">{paletteItems.length===0?<li className="px-3 py-4 text-sm text-muted">No matches.</li>:paletteItems.slice(0,25).map((item,i)=>(<li key={i}><button type="button" className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/5" onClick={()=>{item.run();setPalette(false);setPaletteQ("");}}>{item.label}</button></li>))}</ul>
      </motion.div></div>)}</AnimatePresence>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-white/[0.08] bg-[#07070e] lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] p-5"><BudAILogo size="sm" animated/><div><p className="text-sm font-bold leading-tight">Stilledev</p><p className="font-mono text-[10px] text-muted">Control Center 2.0</p></div></div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin sections">{NAV.map(item=>(<button key={item.id} type="button" onClick={()=>setSection(item.id)} aria-current={section===item.id?"page":undefined} className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${section===item.id?"border-accent-cyan/20 bg-accent-cyan/10 text-accent-cyan":"border-transparent text-muted hover:bg-white/5 hover:text-white"}`}><item.icon className="h-4 w-4"/>{item.label}{item.id==="contact"&&typeof totals.unreadContacts==="number"&&totals.unreadContacts>0&&<span className="ml-auto rounded-full bg-accent-cyan px-2 py-0.5 text-[10px] font-bold text-black">{totals.unreadContacts}</span>}</button>))}
          <button type="button" onClick={()=>setPalette(true)} className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-white"><Search className="h-4 w-4"/>Search <kbd className="ml-auto rounded border border-white/15 px-1.5 font-mono text-[10px]">⌘K</kbd></button>
        </nav>
        <div className="space-y-1 border-t border-white/[0.08] p-3"><Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4"/>View website</Link><button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4"/>Sign out</button></div>
      </aside>

      {/* Mobile bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#07070e]/95 px-4 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2 text-sm font-bold"><BudAILogo size="xs" animated/> Stilledev Admin</span>
        <div className="flex items-center gap-1"><button type="button" onClick={()=>setPalette(true)} className="rounded-lg p-2 hover:bg-white/5" aria-label="Search"><Search className="h-5 w-5"/></button><button type="button" onClick={()=>setMobileOpen(v=>!v)} className="rounded-lg p-2 hover:bg-white/5" aria-label="Toggle menu" aria-expanded={mobileOpen}>{mobileOpen?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}</button></div>
      </div>
      {mobileOpen&&(<nav className="fixed inset-x-0 top-14 z-30 space-y-1 border-b border-white/[0.08] bg-[#07070e] p-3 lg:hidden" aria-label="Admin sections mobile">{NAV.map(item=>(<button key={item.id} type="button" onClick={()=>{setSection(item.id);setMobileOpen(false);}} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-white/85 hover:bg-white/5"><item.icon className="h-4 w-4"/>{item.label}</button>))}<button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted"><LogOut className="h-4 w-4"/>Sign out</button></nav>)}

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1400px] p-4 pt-[4.5rem] sm:p-6 lg:ml-64 lg:p-8 lg:pt-8">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1"><h1 className="truncate text-2xl font-bold tracking-tight">{NAV.find(n=>n.id===section)?.label}</h1><p className="text-xs text-muted">Real data only · {new Date().toLocaleString("sv-SE")}</p></div>
          <div className="relative"><button type="button" onClick={()=>setShowNotifs(v=>!v)} className={btn} aria-label={`Notifications, ${unread} unread`}><Bell className="h-4 w-4"/>{unread>0&&<span className="rounded-full bg-accent-cyan px-1.5 text-[10px] font-bold text-black">{unread}</span>}</button>
            {showNotifs&&(<div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-[#07070e] p-3 shadow-2xl"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Notifications</h3><button type="button" className="text-xs text-accent-cyan" onClick={async()=>{await fetch("/api/admin/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({all:true})});void loadNotifs();}}>Mark all read</button></div>{notifs.length===0?<p className="text-xs text-muted">No notifications yet. New contacts and waitlist signups appear here.</p> : <ul className="max-h-72 space-y-2 overflow-y-auto">{notifs.map(n=>(<li key={n.id} className={`rounded-lg border px-3 py-2 ${n.is_read?"border-white/[0.05] opacity-60":"border-accent-cyan/20 bg-accent-cyan/5"}`}><p className="text-xs font-semibold text-white">{n.title}</p><p className="text-[11px] text-muted">{n.body} · {new Date(n.created_at).toLocaleString("sv-SE")}</p></li>))}</ul>}</div>)}
          </div>
          <button type="button" onClick={()=>void refreshAll()} className={btn} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/>Refresh</button>
        </header>

        {section==="overview"&&(<div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time range">{["24h","7d","30d","90d"].map(r=>(<button key={r} type="button" onClick={()=>setRange(r)} aria-pressed={range===r} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${range===r?"bg-accent-cyan text-black":"border border-white/10 text-muted hover:text-white"}`}>{r}</button>))}
            <label className="ml-1 flex items-center gap-1.5 text-xs text-muted">Custom <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"/> → <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"/></label>
            {customFrom&&customTo&&<span className="text-[11px] text-muted">(custom label — chart uses nearest range until applied via Analytics export)</span>}
          </div>
          {overviewErr&&<p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200" role="alert">{overviewErr}. If tables are missing, apply <code className="font-mono">MIGRATION_v13_admin_panel.sql</code> in Supabase.</p>}
          {overview?.note&&<p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-muted">{overview.note}</p>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{kpis.map(([label,value,sub])=>(<div key={label} className={card}><p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-3xl font-bold tabular-nums">{value==null?"—":Number(value).toLocaleString("sv-SE")}</p><p className="mt-0.5 text-[11px] text-muted">{sub}{label==="Page views"&&totals.conversionRate!=null?` · ${totals.conversionRate}% signup conversion`:""}</p></div>))}</div>
          <StatsCards users={users}/>
          <div className="grid gap-5 xl:grid-cols-5"><div className="xl:col-span-3"><ActivityChart data={overview?.series||[]}/></div>
            <div className={card}><h3 className="mb-3 text-sm font-semibold">Recent activity</h3>{(overview?.recentActivity||[]).length===0?<p className="text-xs text-muted">No audit events yet.</p> : <ul className="space-y-2.5">{overview!.recentActivity.map(a=>(<li key={a.id} className="flex gap-2 text-xs"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan"/><span className="min-w-0"><span className="block truncate text-white/85">{a.action}{a.target_type?` · ${a.target_type}`:""}</span><span className="text-muted">{new Date(a.created_at).toLocaleString("sv-SE")}</span></span></li>))}</ul>}
              <div className="mt-4 flex flex-wrap gap-2"><button type="button" className={btn} onClick={()=>setSection("contact")}><Inbox className="h-4 w-4"/>Review contacts</button><button type="button" className={btn} onClick={()=>setSection("content")}><Megaphone className="h-4 w-4"/>Announcement</button><a className={btn} href="/api/admin/export?type=waitlist"><Download className="h-4 w-4"/>Export waitlist</a></div>
            </div></div>
          <AdminInbox/>
        </div>)}

        {section==="analytics"&&(<div className="space-y-5">
          <div className="flex flex-wrap gap-2">{["24h","7d","30d","90d"].map(r=>(<button key={r} type="button" onClick={()=>setRange(r)} aria-pressed={range===r} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${range===r?"bg-accent-cyan text-black":"border border-white/10 text-muted hover:text-white"}`}>{r}</button>))}<a className={btn} href="/api/admin/export?type=analytics"><Download className="h-4 w-4"/>Export CSV</a></div>
          <p className="text-xs leading-relaxed text-muted">Privacy: page views are recorded only after analytics consent. No IP address, full user-agent or fingerprint is stored; sessions are daily-rotating hashes, countries come from the CDN edge header. This satisfies GDPR data-minimisation — delete old rows anytime via the export + Supabase.</p>
          <ActivityChart data={overview?.series||[]}/>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Bars title="Top pages" rows={overview?.topPages||[]}/><Bars title="Traffic sources (referrer host)" rows={overview?.sources||[]}/><Bars title="Devices" rows={overview?.devices||[]}/><Bars title="Browsers" rows={overview?.browsers||[]}/><Bars title="Countries (edge, coarse)" rows={overview?.countries||[]}/>
            <div className={card}><h3 className="mb-3 text-sm font-semibold">Live overview</h3><p className="text-xs leading-relaxed text-muted">True real-time presence needs websockets and would add tracking weight. Instead this shows the recorded last hour on refresh:</p><p className="mt-3 text-3xl font-bold">{overview?.series?.[overview.series.length-1]?.views??"—"}</p><p className="text-[11px] text-muted">views in the latest bucket ({range}) · unique visitors in range: {String(totals.uniqueVisitors??"—")}</p><button type="button" className={`${btn} mt-4`} onClick={()=>void loadOverview()}><RefreshCw className="h-4 w-4"/>Refresh now</button></div>
          </div>
        </div>)}

        {section==="waitlist"&&(<div className="space-y-5"><StatsCards users={users}/><UserTable users={users} loading={loading} onUpdate={()=>void refreshAll()}/>
          <div className="flex flex-wrap gap-2"><a className={btn} href="/api/admin/export?type=waitlist"><Download className="h-4 w-4"/>Export CSV</a><span className="self-center text-xs text-muted">{stats.total} total · {stats.pending} pending · {stats.approved} approved · duplicates prevented by the unique email index</span></div></div>)}

        {section==="contact"&&(<div className="grid gap-5 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-3">
            <div className="flex flex-wrap gap-2"><div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"/><input value={contactQ} onChange={e=>setContactQ(e.target.value)} placeholder="Search name, email, subject, message…" className={`${input} pl-9`} aria-label="Search contacts"/></div>
            <select value={contactStatus} onChange={e=>setContactStatus(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [&>option]:bg-[#07070e]" aria-label="Filter by status"><option value="all">All statuses</option><option value="new">New</option><option value="in_progress">In progress</option><option value="contacted">Contacted</option><option value="completed">Completed</option><option value="archived">Archived</option></select>
            <button type="button" onClick={()=>void loadContacts()} className={btn}>Apply</button><a className={btn} href="/api/admin/export?type=contact"><Download className="h-4 w-4"/>Export</a></div>
            {contacts.length===0?<div className={card}><p className="text-sm text-muted">No contact messages match. New submissions from <a className="text-accent-cyan underline" href="/contact">/contact</a> appear here and trigger an admin notification.</p></div>:
            <ul className="space-y-2">{contacts.map(c=>(<li key={c.id}><button type="button" onClick={async()=>{setSelectedContact(c); if(!c.is_read) void patchContact(c,{is_read:true}); try{ const r=await fetch(`/api/admin/contact`,{cache:"no-store",credentials:"same-origin"}); void r; }catch{} setNotes([]); }} className={`w-full rounded-2xl border p-4 text-left transition ${selectedContact?.id===c.id?"border-accent-cyan/30 bg-accent-cyan/5":"border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <span className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${c.status==="new"?"border-accent-cyan/30 text-accent-cyan":c.status==="archived"?"border-white/10 text-muted":"border-accent-purple/30 text-accent-purple"}`}>{c.status.replace("_"," ")}</span>{!c.is_read&&<span className="rounded-full bg-accent-cyan px-2 py-0.5 text-[10px] font-bold text-black">UNREAD</span>}<span className="ml-auto text-[11px] text-muted">{new Date(c.created_at).toLocaleString("sv-SE")}</span></span>
              <span className="mt-1.5 block font-semibold text-white">{c.subject}</span><span className="block truncate text-sm text-muted">{c.name} · {c.email}{c.company?` · ${c.company}`:""}</span><span className="mt-1 line-clamp-2 block text-sm text-white/70">{c.message}</span></button></li>))}</ul>}
          </div>
          <div className="xl:col-span-2">{selectedContact?(<div className={card}><h3 className="font-semibold text-white">{selectedContact.subject}</h3><p className="mt-1 text-xs text-muted">{selectedContact.name} · <a className="text-accent-cyan" href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>{selectedContact.company?` · ${selectedContact.company}`:""} · {new Date(selectedContact.created_at).toLocaleString("sv-SE")} · via {selectedContact.source}</p>
            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-black/30 p-3.5 text-sm leading-relaxed text-white/85">{selectedContact.message}</p>
            <label className="mt-4 block text-xs text-muted">Status<select value={selectedContact.status} onChange={e=>void patchContact(selectedContact,{status:e.target.value})} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [&>option]:bg-[#07070e]"><option value="new">New</option><option value="in_progress">In progress</option><option value="contacted">Contacted</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
            <label className="mt-3 block text-xs text-muted">Assigned to<input defaultValue={selectedContact.assigned_to||""} onBlur={e=>void patchContact(selectedContact,{assigned_to:e.target.value})} placeholder="e.g. Oliver" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"/></label>
            <div className="mt-3 flex gap-2"><button type="button" className={btn} onClick={()=>void patchContact(selectedContact,{is_read:!selectedContact.is_read})}>{selectedContact.is_read?"Mark unread":"Mark read"}</button><button type="button" className={btn} onClick={async()=>{ if(!confirm("Delete this message permanently?"))return; await fetch(`/api/admin/contact?id=${selectedContact.id}`,{method:"DELETE",credentials:"same-origin"}); setSelectedContact(null); void loadContacts(); }}><Trash2 className="h-4 w-4"/>Delete</button></div>
            <div className="mt-5 border-t border-white/[0.07] pt-4"><h4 className="text-sm font-semibold">Internal notes</h4>{notes.map(n=>(<p key={n.id} className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-white/80">{n.body}<span className="block text-muted">{new Date(n.created_at).toLocaleString("sv-SE")}</span></p>))}
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} maxLength={2000} placeholder="Add an internal note (never sent to the sender)…" className={`${input} mt-3`} aria-label="Internal note"/>
            <button type="button" className={`${btnPrimary} mt-2`} disabled={!noteText.trim()} onClick={async()=>{ const r=await fetch("/api/admin/contact",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({submissionId:selectedContact.id,body:noteText})}); const j=await r.json(); if(r.ok){setNotes(n=>[...n,j.note]);setNoteText("");} }}>Save note</button></div>
          </div>):(<div className={card}><p className="text-sm text-muted">Select a message to read it, change status, assign it and add internal notes.</p></div>)}</div>
        </div>)}

        {section==="chats"&&(<div className="grid gap-5 xl:grid-cols-5"><div className="space-y-3 xl:col-span-2">
          <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"/><input value={chatQ} onChange={e=>setChatQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void loadChats();}} placeholder="Search titles…" className={`${input} pl-9`} aria-label="Search conversations"/></div><button type="button" className={btn} onClick={()=>void loadChats()}>Search</button></div>
          {chatErr&&<p className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">{chatErr}</p>}
          {chats.length===0?<p className="text-sm text-muted">No conversations found.</p> : <ul className="space-y-2">{chats.map(c=>(<li key={c.id}><button type="button" onClick={()=>void openChat(c.id)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-left hover:bg-white/[0.04]"><span className="block truncate text-sm font-medium text-white">{c.title||"Untitled"}</span><span className="text-[11px] text-muted">{c.display_name||c.email||"Unknown"} · {c.message_count} msgs · {new Date(c.updated_at).toLocaleString("sv-SE")}</span></button></li>))}</ul>}
        </div><div className="xl:col-span-3">{selectedChat?(<div className={card}><h3 className="font-semibold">{String(selectedChat.conversation.title||"Conversation")}</h3><p className="text-xs text-muted">{String(selectedChat.conversation.email||"")} · {selectedChat.messages.length} messages</p><div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto">{selectedChat.messages.map(m=>(<div key={m.id} className={`rounded-xl p-3 text-sm ${m.role==="user"?"bg-accent-cyan/10":"bg-white/[0.03]"}`}><p className="mb-1 font-mono text-[10px] uppercase text-muted">{m.role} · {new Date(m.created_at).toLocaleString("sv-SE")}</p><p className="whitespace-pre-wrap text-white/85">{m.content}</p></div>))}</div></div>):(<div className={card}><p className="text-sm text-muted">Select a conversation to inspect it. Admin-only, service-role read — handle personal data with care.</p></div>)}</div></div>)}

        {section==="content"&&(<div className="grid gap-5 xl:grid-cols-2">
          <div className={card}><h3 className="flex items-center gap-2 font-semibold"><Megaphone className="h-4 w-4 text-accent-cyan"/>Announcement banner</h3><p className="mt-1 text-xs text-muted">Published announcements show site-wide (except /admin). Schedule with start/end times.</p>
            <div className="mt-4 space-y-3"><input value={ann.title} onChange={e=>setAnn({...ann,title:e.target.value})} placeholder="Title *" className={input} aria-label="Announcement title"/><textarea value={ann.body} onChange={e=>setAnn({...ann,body:e.target.value})} placeholder="Body" rows={2} className={input} aria-label="Announcement body"/>
            <div className="grid grid-cols-2 gap-2"><input value={ann.href} onChange={e=>setAnn({...ann,href:e.target.value})} placeholder="Link URL (/path or https://…)" className={input} aria-label="Announcement link"/><input value={ann.label} onChange={e=>setAnn({...ann,label:e.target.value})} placeholder="Link label" className={input} aria-label="Link label"/></div>
            <div className="grid grid-cols-2 gap-2"><label className="text-xs text-muted">Starts<input type="datetime-local" value={ann.starts_at} onChange={e=>setAnn({...ann,starts_at:e.target.value})} className={`${input} mt-1`}/></label><label className="text-xs text-muted">Ends<input type="datetime-local" value={ann.ends_at} onChange={e=>setAnn({...ann,ends_at:e.target.value})} className={`${input} mt-1`}/></label></div>
            <label className="flex items-center gap-2 text-sm text-white/85"><input type="checkbox" checked={ann.published} onChange={e=>setAnn({...ann,published:e.target.checked})} className="accent-[#00e5ff]"/>Published</label>
            <button type="button" className={btnPrimary} disabled={!ann.title.trim()} onClick={async()=>{ await fetch("/api/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({type:"announcement",payload:{...ann,starts_at:ann.starts_at?new Date(ann.starts_at).toISOString():null,ends_at:ann.ends_at?new Date(ann.ends_at).toISOString():null}})}); setAnn({title:"",body:"",href:"",label:"Learn more",tone:"info",published:false,starts_at:"",ends_at:""}); void loadContent(); }}>Save announcement</button></div>
            <ul className="mt-5 space-y-2">{(content?.announcements||[]).map(a=>(<li key={String(a.id)} className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-sm"><span className={`h-2 w-2 shrink-0 rounded-full ${a.published?"bg-accent-green":"bg-white/25"}`}/><span className="min-w-0 flex-1 truncate text-white/85">{String(a.title)}</span><button type="button" className="text-xs text-accent-cyan" onClick={async()=>{await fetch("/api/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({type:"announcement",payload:{id:a.id,title:a.title,body:a.body,href:a.href,label:a.label,tone:a.tone,published:!a.published,starts_at:a.starts_at,ends_at:a.ends_at}})});void loadContent();}}>{a.published?"Unpublish":"Publish"}</button><button type="button" aria-label="Delete announcement" className="text-muted hover:text-red-300" onClick={async()=>{if(confirm("Delete this announcement?")){await fetch(`/api/admin/content?type=announcement&id=${a.id}`,{method:"DELETE",credentials:"same-origin"});void loadContent();}}}><Trash2 className="h-4 w-4"/></button></li>))}</ul>
          </div>
          <div className="space-y-5">
            <div className={card}><h3 className="flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-amber-300"/>Maintenance mode</h3><p className="mt-1 text-xs text-muted">When on, public pages show a maintenance notice. /admin and APIs stay reachable so you can switch it off.</p>
              <button type="button" role="switch" aria-checked={maintenance} onClick={async()=>{ const next=!maintenance; setMaintenance(next); await saveSetting("maintenance_mode",{enabled:next}); }} className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${maintenance?"bg-amber-400 text-black":"border border-white/15 text-white/80"}`}>{maintenance?"ON — site in maintenance":"OFF — site live"}</button></div>
            <div className={card}><h3 className="font-semibold">SEO overrides</h3><p className="mt-1 text-xs text-muted">Stored safely in site_settings for the next render cycle; code defaults remain the fallback so the site never depends on the DB to render.</p>
              <label className="mt-4 block text-xs text-muted">SEO title<input value={seo.title} onChange={e=>setSeo({...seo,title:e.target.value})} className={`${input} mt-1`} placeholder="Stilledev.se · BudAI"/></label>
              <label className="mt-3 block text-xs text-muted">SEO description<textarea value={seo.description} onChange={e=>setSeo({...seo,description:e.target.value})} rows={3} className={`${input} mt-1`} placeholder="Meta description…"/></label>
              <button type="button" className={`${btnPrimary} mt-3`} onClick={async()=>{ await saveSetting("seo_title",{value:seo.title}); await saveSetting("seo_description",{value:seo.description}); }}>Save SEO settings</button>
              <p className="mt-3 text-[11px] text-muted">Current stored content blocks: {(content?.content||[]).length} · settings keys: {(content?.settings||[]).map(s=>String(s.key)).join(", ")||"none"}</p></div>
            <div className={card}><h3 className="mb-2 font-semibold">Preview</h3><p className="text-xs text-muted">Preview uses the same public config endpoint the site reads:</p><a className={btn} href="/api/site/config" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4"/>Open /api/site/config</a><span className="mx-1"/><a className={btn} href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4"/>Open homepage</a></div>
          </div>
        </div>)}

        {section==="users"&&(<div className="space-y-5"><div className={card}><h3 className="font-semibold">Registered accounts &amp; admin access</h3><p className="mt-1 text-xs leading-relaxed text-muted">Admin access today = the server-side ADMIN_PASSWORD session (httpOnly cookie) plus optional Supabase-Auth admins in <code className="font-mono">app_admins</code>. Roles are never read from user-editable metadata. To grant/revoke a Supabase admin, insert/delete the user&apos;s row in app_admins via Supabase (service role) — it takes effect immediately and is audit-friendly. Password-admin sessions end on Sign out; rotate ADMIN_PASSWORD to revoke all of them at once.</p></div>
          {sysUsers.length===0?<div className={card}><p className="text-sm text-muted">No profile rows returned (check service role / MIGRATION_v4+).</p></div>:
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-white/[0.07] text-[11px] uppercase text-muted"><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{sysUsers.map(u=>(<tr key={u.id} className="border-b border-white/[0.04]"><td className="px-4 py-3"><span className="block text-white/90">{u.display_name||"—"}</span><span className="text-xs text-muted">{u.email||u.id}</span></td><td className="px-4 py-3">{u.role?<span className="rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2 py-0.5 text-[11px] font-semibold text-accent-cyan">{u.role}</span>:<span className="text-muted">user</span>}</td><td className="px-4 py-3 text-muted">{new Date(u.created_at).toLocaleDateString("sv-SE")}</td><td className="px-4 py-3 text-muted">{u.last_sign_in_at?new Date(u.last_sign_in_at).toLocaleString("sv-SE"):"—"}</td><td className="px-4 py-3"><span className="text-accent-green">active</span></td></tr>))}</tbody></table></div>}
        </div>)}

        {section==="audit"&&(<div className="space-y-5"><SystemTerminal/><div className={card}><h3 className="mb-3 font-semibold">Audit trail</h3><p className="mb-4 text-xs text-muted">Logins, failed logins, content changes, deletions, exports and permission-relevant events. No passwords, tokens or message bodies are logged — only actor, action, target and time.</p>
          {audit.length===0?<p className="text-sm text-muted">No audit rows yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-white/[0.07] text-[11px] uppercase text-muted"><th className="px-3 py-2">Time</th><th className="px-3 py-2">Actor</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Target</th></tr></thead><tbody>{audit.map(a=>(<tr key={a.id} className="border-b border-white/[0.04]"><td className="px-3 py-2 text-muted">{new Date(a.created_at).toLocaleString("sv-SE")}</td><td className="px-3 py-2">{a.actor}</td><td className="px-3 py-2 font-mono text-xs text-accent-cyan">{a.action}</td><td className="px-3 py-2 text-muted">{a.target_type||""}{a.target_id?` · ${a.target_id.slice(0,8)}…`:""}</td></tr>))}</tbody></table></div>}</div></div>)}

        {section==="system"&&(<div className="space-y-5"><AdminInbox/>
          <div className="grid gap-5 md:grid-cols-2"><div className={card}><h3 className="mb-3 font-semibold">System health</h3>{!system ? <p className="text-sm text-muted">Loading…</p> : <ul className="space-y-2 text-sm">{Object.entries(sys.env||{}).map(([k,v])=>(<li key={k} className="flex items-center gap-2.5"><span className={`h-2 w-2 rounded-full ${v?"bg-accent-green":"bg-red-400"}`}/><span className="text-white/85">{k}</span><span className="ml-auto font-mono text-xs text-muted">{String(v)}</span></li>))}<li className="flex gap-2.5 text-sm"><span className={`h-2 w-2 rounded-full ${sys.database?.connected?"bg-accent-green":"bg-red-400"}`}/>Database<span className="ml-auto font-mono text-xs text-muted">{String(sys.database?.connected)} · {String(((system.database as Record<string,unknown>)?.latencyMs??"—"))}ms</span></li><li className="flex gap-2.5 text-sm"><span className={`h-2 w-2 rounded-full ${sys.api?.healthEndpoint?"bg-accent-green":"bg-red-400"}`}/>API /api/health<span className="ml-auto font-mono text-xs text-muted">{String(sys.api?.healthEndpoint)}</span></li></ul>}</div>
          <div className={card}><h3 className="mb-3 font-semibold">Database tables (row counts)</h3>{!system ? <p className="text-sm text-muted">Loading…</p> : <ul className="space-y-2 text-sm">{Object.entries(sys.database?.tables||{}).map(([k,v])=>(<li key={k} className="flex justify-between"><span className="font-mono text-xs text-white/80">{k}</span><span className="font-mono text-xs text-muted">{v==null?"missing / no access":v}</span></li>))}</ul>}<p className="mt-4 text-[11px] leading-relaxed text-muted">{String(sys.email?.note||"")} Checked {sys.checkedAt?new Date(sys.checkedAt).toLocaleString("sv-SE"):""}.</p></div></div>
          <div className={card}><h3 className="mb-2 font-semibold">Diagnostics</h3><ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted"><li>Build/typecheck: run <code className="font-mono text-white/70">npm run typecheck &amp;&amp; npm run build</code> before deploy.</li><li>Migrations: schema.sql → v2…v12 → <code className="font-mono text-white/70">MIGRATION_v13_admin_panel.sql</code> (idempotent, non-destructive).</li><li>Secrets are never shown here — only whether each env var is set.</li><li>Fake/sample data was removed: empty charts mean no real events yet, by design.</li></ul><button type="button" className={`${btn} mt-3`} onClick={()=>void loadSystem()}><RefreshCw className="h-4 w-4"/>Re-run checks</button></div>
        </div>)}

        {section==="export"&&(<div className="grid gap-5 md:grid-cols-2">
          {([["waitlist","Waitlist CSV","All waitlist registrations with status, source and priority."],["contact","Contact leads CSV","Contact submissions (message bodies excluded from export by default)."],["analytics","Analytics CSV","Recorded page views: path, source, device, browser, country, time."],["feedback","Feedback CSV","Product feedback inbox entries."]] as const).map(([type,title,desc])=>(<div key={type} className={card}><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted">{desc}</p><a className={`${btnPrimary} mt-4`} href={`/api/admin/export?type=${type}`}><Download className="h-4 w-4"/>Download</a></div>))}
          <div className={card}><h3 className="font-semibold">Reporting notes</h3><p className="mt-1 text-sm leading-relaxed text-muted">Every export is audit-logged. Exports are capped at 5,000 rows. Handle CSVs as personal data under GDPR — store them securely and delete when no longer needed.</p><p className="mt-2 flex items-center gap-2 text-xs text-accent-green"><Check className="h-4 w-4"/>No fake statistics anywhere in this panel.</p></div>
        </div>)}
      </main>
    </div>
  );
}
