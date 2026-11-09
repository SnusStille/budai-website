"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Megaphone, X, Wrench } from "lucide-react";
type Cfg={announcement:{title:string;body?:string|null;href?:string|null;label?:string|null;tone:string}|null;maintenance:boolean};
export default function SiteConfigBanner(){
  const [cfg,setCfg]=useState<Cfg|null>(null); const [hidden,setHidden]=useState(false); const path=usePathname();
  useEffect(()=>{ fetch("/api/site/config",{cache:"no-store"}).then(r=>r.json()).then(setCfg).catch(()=>{}); },[]);
  if(!cfg||path?.startsWith("/admin")) return null;
  if(cfg.maintenance) return (<div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020205] p-6 text-center" role="alert"><div className="max-w-md"><Wrench className="mx-auto mb-4 h-10 w-10 text-accent-cyan"/><h1 className="text-2xl font-bold text-white">Maintenance in progress</h1><p className="mt-2 text-sm text-muted">Stilledev is briefly offline for upgrades. Please check back soon. For urgent matters: Stilleinc@hotmail.com</p></div></div>);
  const a=cfg.announcement; if(!a||hidden) return null;
  return (<div className="relative z-[60] flex items-center justify-center gap-3 border-b border-accent-cyan/20 bg-accent-cyan/10 px-4 py-2 text-center text-sm text-white"><Megaphone className="h-4 w-4 shrink-0 text-accent-cyan"/><p className="min-w-0"><strong>{a.title}</strong>{a.body?` — ${a.body}`:""} {a.href&&<a className="ml-2 font-semibold text-accent-cyan underline" href={a.href}>{a.label||"Learn more"}</a>}</p><button type="button" onClick={()=>setHidden(true)} aria-label="Dismiss announcement" className="shrink-0 rounded p-1 hover:bg-white/10"><X className="h-4 w-4"/></button></div>);
}
