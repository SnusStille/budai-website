"use client";

import { useEffect } from "react";
import BudAILogo from "@/components/ui/BudAILogo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the failure diagnosable without dumping internals on screen.
    console.error("BudAI page error:", error, error.digest);
  }, [error]);

  const detail = error?.message?.slice(0, 160);
  const reference = error?.digest ? error.digest.slice(0, 8) : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-purple/[0.12] blur-[120px]"
      />
      <div className="relative flex flex-col items-center gap-5">
        <BudAILogo size="lg" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-pink">
          500 · something broke
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted">
          An unexpected error occurred. Try again — if it keeps happening, reload the page or
          <span className="text-white"> email Stilleinc@hotmail.com</span>.
        </p>
        {reference && (
          <p className="font-mono text-[11px] text-muted/60">ref: {reference}</p>
        )}
        {detail && (
          <details className="max-w-md text-left">
            <summary className="cursor-pointer text-xs text-muted/60 hover:text-white">
              Technical detail
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] text-pink-200/90">
              {detail}
            </pre>
          </details>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="press rounded-full bg-accent-cyan px-6 py-3 text-sm font-semibold text-[#020205] transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/#playground"
            className="press rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-accent-cyan/40"
          >
            Back to the Playground
          </a>
        </div>
      </div>
    </main>
  );
}
