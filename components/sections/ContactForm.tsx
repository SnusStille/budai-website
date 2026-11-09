"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
const field="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30";
export default function ContactForm(){
  const { lang } = useLang(); const sv = lang === "sv";
  const [form,setForm]=useState({name:"",email:"",company:"",subject:"General enquiry",message:"",consent:false,website:""});
  const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle"); const [error,setError]=useState("");
  const set=(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>setForm(f=>({...f,[k]:e.target.type==="checkbox"?(e.target as HTMLInputElement).checked:e.target.value}));
  const submit=async(e:React.FormEvent)=>{ e.preventDefault(); setState("sending"); setError("");
    try{ const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); const j=await r.json().catch(()=>({}));
      if(r.status===429){setError("Too many submissions — please try again later.");setState("error");return;}
      if(!r.ok){setError(j.error==="not_configured"?"The contact system is not configured yet — please email Stilleinc@hotmail.com instead.":"Please check the form and try again.");setState("error");return;}
      setState("sent"); }catch{ setError("Network error — please email Stilleinc@hotmail.com."); setState("error"); } };
  if(state==="sent") return (<div className="rounded-2xl border border-accent-green/25 bg-accent-green/10 p-6 text-center" role="status"><CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-accent-green"/><h2 className="font-semibold">{sv?"Meddelande mottaget":"Message received"}</h2><p className="mt-1 text-sm text-muted">{sv?"Tack — ditt meddelande är sparat i vårt system och vi svarar till din e-post.":"Thanks — your message is saved in our system and we will reply to your email."}</p></div>);
  return (<form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6" noValidate={false}>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv?"Namn":"Name"} *</span><input required className={field} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Your name"/></label>
      <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv?"E-post":"Email"} *</span><input required type="email" className={field} value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@company.se"/></label>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv?"Företag":"Company"}</span><input className={field} value={form.company} onChange={set("company")} autoComplete="organization" placeholder="Optional"/></label>
      <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv?"Ämne":"Subject"}</span><select className={field} value={form.subject} onChange={set("subject")}><option>General enquiry</option><option>BudAI access</option><option>AI development project</option><option>Automation</option><option>Partnership</option><option>Support</option><option>Other</option></select></label>
    </div>
    <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv?"Meddelande":"Message"} *</span><textarea required rows={6} maxLength={5000} className={field} value={form.message} onChange={set("message")} placeholder="How can we help?"/></label>
    <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" value={form.website} onChange={set("website")}/>
    <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted"><input required type="checkbox" checked={form.consent} onChange={set("consent")} className="mt-0.5 accent-[#00e5ff]"/>I agree that Stilledev may store my contact details and message to respond to this enquiry, as described in the privacy policy. *</label>
    {error&&<p className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>}
    <button type="submit" disabled={state==="sending"} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4"/>{state==="sending"?"Sending…":"Send message"}</button>
  </form>);
}
