export default function ActivityChart() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">Activity overview</h3>
        <p className="mt-0.5 text-xs text-muted">
          Live traffic analytics are not connected yet. No sample counts are shown.
        </p>
      </div>
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-black/10 px-5 text-center text-xs leading-relaxed text-muted">
        No analytics data available.
      </div>
    </div>
  );
}
