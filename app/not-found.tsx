import Link from "next/link";
import BudAILogo from "@/components/ui/BudAILogo";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-white">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#060d17]/90 p-8 shadow-2xl">
        <div className="flex justify-center mb-5">
          <BudAILogo size="lg" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan mb-2">{"404 · SIGNAL NOT FOUND"}</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">This page doesn&apos;t exist</h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          The link may be outdated or mistyped. Return to the main experience or open the live AI Playground directly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/#playground" className="rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-semibold text-[#020205] hover:opacity-90 transition-opacity">
            Open the Playground
          </Link>
          <Link href="/" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:border-accent-cyan/40 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
