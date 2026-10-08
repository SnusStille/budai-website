/** Skeletons for the control center: sidebar shell + stat cards + table rows. */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#020205] text-white">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] p-5 lg:block">
          <div className="mb-8 h-9 w-40 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="mb-8 h-8 w-64 animate-pulse rounded-lg bg-white/[0.07]" />
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              />
            ))}
          </div>
          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
