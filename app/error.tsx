"use client";

import BudAILogo from "@/components/ui/BudAILogo";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-background text-white">
      <BudAILogo size="lg" />
      <p className="font-mono text-sm text-accent-pink">{"{ error }"}</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-muted">An unexpected error occurred. Try again, and if it keeps happening, reload the page.</p>
      <button type="button" onClick={reset} className="rounded-full bg-accent-cyan px-6 py-3 text-sm font-semibold text-[#020205] hover:opacity-90">
        Try again
      </button>
    </main>
  );
}
