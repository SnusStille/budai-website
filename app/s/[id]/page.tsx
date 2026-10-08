import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BudAILogo from "@/components/ui/BudAILogo";
import { serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type Msg = { role: string; content: string };

async function loadShared(id: string) {
  const sb = serviceClient();
  if (!sb || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await sb
    .from("shared_conversations")
    .select("title, messages, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return { title: String(data.title || "Shared conversation"), msgs: (data.messages as Msg[]) || [] };
}

export async function generateMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const shared = await loadShared(id);
  const title = shared ? `${shared.title} · BudAI` : "Shared conversation · BudAI";
  return {
    title,
    description: "A BudAI conversation, shared read-only.",
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: "A BudAI conversation, shared read-only.",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "BudAI" }],
    },
  };
}

export default async function Shared({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(params);
  const shared = await loadShared(id);
  if (!shared) notFound();
  const { title, msgs } = shared;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent-cyan/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-2xl px-5 py-10 sm:py-14">
        <header className="mb-8 flex items-center justify-between gap-4">
          <a href="/" className="group inline-flex items-center gap-3">
            <BudAILogo size="sm" animated />
            <span className="text-lg font-bold tracking-tight">
              Bud<span className="text-accent-cyan">AI</span>
            </span>
          </a>
          <a
            href="/#playground"
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/85 transition-colors hover:border-accent-cyan/40 hover:text-white"
          >
            Open BudAI
          </a>
        </header>

        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60">
          Shared conversation · read-only
        </p>
        <h1 className="mb-8 mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>

        <div className="space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-2.5"}>
              {m.role !== "user" && (
                <span className="mt-1 h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-accent-cyan/90 to-accent-purple/90 p-[1.5px]">
                  <span className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#07070e]">
                    <BudAILogo size="xs" animated={false} className="!h-[16px] !w-[16px]" />
                  </span>
                </span>
              )}
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent-cyan/10 text-white"
                    : "border border-white/[0.08] bg-white/[0.03] text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 p-6 text-center">
          <p className="text-lg font-semibold">Your new ChatGPT, in Swedish and English</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            Free during the developer preview. No signup needed to try.
          </p>
          <a
            href="/#playground"
            className="mt-4 inline-block rounded-full bg-accent-cyan px-6 py-2.5 text-sm font-semibold text-[#020205] transition-opacity hover:opacity-90"
          >
            Try BudAI free
          </a>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted/60">
          Shared read-only · © 2026 BudAI by Stilledev
        </p>
      </div>
    </main>
  );
}
