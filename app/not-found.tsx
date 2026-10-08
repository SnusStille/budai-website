import Link from "next/link";
import BudAILogo from "@/components/ui/BudAILogo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-cyan/[0.1] blur-[120px]"
      />
      <div className="relative flex flex-col items-center gap-5">
        <BudAILogo size="lg" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">
          404 · not found
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-md text-muted">
          The link may be old or mistyped. The Playground is one click away.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#playground"
            className="press rounded-full bg-accent-cyan px-6 py-3 text-sm font-semibold text-[#020205] transition-opacity hover:opacity-90"
          >
            Open the Playground
          </Link>
          <Link
            href="/"
            className="press rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-accent-cyan/40"
          >
            Back to start
          </Link>
        </div>
      </div>
    </main>
  );
}
