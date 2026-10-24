import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BudAILogo from "@/components/ui/BudAILogo";
import { serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shared conversation · BudAI", robots: { index: false, follow: false } };

export default async function Shared({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  const sb = serviceClient();
  if (!sb || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await sb!.from("shared_conversations").select("title, messages, created_at").eq("id", id).maybeSingle();
  if (!data) notFound();
  const msgs = data.messages as { role: string; content: string }[];

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <a href="/" className="mb-8 inline-flex items-center gap-3">
          <BudAILogo size="sm" />
          <span className="text-lg font-bold tracking-tight">BudAI</span>
        </a>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted/60">Shared conversation · read-only</p>
        <h1 className="mb-8 mt-1 text-2xl font-semibold">{data.title}</h1>
        <div className="space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${m.role === "user" ? "bg-accent-cyan/10 text-white" : "border border-white/[0.08] bg-white/[0.03] text-white/90"}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 p-6 text-center">
          <p className="text-lg font-semibold">Your new ChatGPT, in Swedish and English</p>
          <a href="/#playground" className="mt-4 inline-block rounded-full bg-accent-cyan px-6 py-2.5 text-sm font-semibold text-[#020205]">Try BudAI free</a>
        </div>
      </div>
    </main>
  );
}
