/**
 * Instant feedback while a shared conversation is fetched.
 * Mirrors the real /s/[id] layout so the page never "pops" in.
 */
export default function SharedLoading() {
  return (
    <main className="min-h-screen bg-background text-white pt-20 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="h-5 w-28 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-white/[0.06]" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
            <div className="mb-3 h-3 w-24 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-6 w-3/4 animate-pulse rounded-lg bg-white/[0.07]" />
          </div>

          <div className="space-y-4 px-5 py-6 sm:px-7">
            <div className="ml-auto h-4 w-2/3 animate-pulse rounded-full bg-accent-cyan/[0.12]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/[0.05]" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">
          Loading shared conversation…
        </p>
      </div>
    </main>
  );
}
