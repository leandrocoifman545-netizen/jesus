export default function Loading() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-10 w-52 bg-zinc-800/40 rounded-2xl shimmer" />
          <div className="h-4 w-72 bg-zinc-800/20 rounded-xl mt-3 shimmer" />
        </div>
        <div className="h-12 w-40 bg-zinc-800/30 rounded-2xl shimmer" />
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-zinc-900/30 border border-zinc-800/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-zinc-800/30 rounded-lg shimmer" />
              <div className="w-9 h-9 rounded-xl bg-zinc-800/20 shimmer" />
            </div>
            <div className="h-10 w-16 bg-zinc-800/30 rounded-xl shimmer" />
            <div className="h-3 w-28 bg-zinc-800/15 rounded-lg shimmer" />
          </div>
        ))}
      </div>

      {/* Pipeline bar skeleton */}
      <div className="space-y-3">
        <div className="h-2.5 w-full rounded-full bg-zinc-900/40 border border-zinc-800/30 overflow-hidden">
          <div className="h-full w-3/5 bg-zinc-800/30 rounded-full shimmer" />
        </div>
        <div className="flex items-center gap-5">
          <div className="h-3 w-24 bg-zinc-800/15 rounded-lg shimmer" />
          <div className="h-3 w-24 bg-zinc-800/15 rounded-lg shimmer" />
        </div>
      </div>

      {/* Section divider skeleton */}
      <div className="section-divider">
        <div className="h-3 w-16 bg-zinc-800/20 rounded shimmer" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-12 w-full rounded-2xl bg-zinc-900/30 border border-zinc-800/40 shimmer" />

      {/* Cards skeleton */}
      <div className="space-y-4 stagger-children">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-zinc-900/30 border border-zinc-800/40 p-6 flex gap-4"
          >
            <div className="w-5 h-5 rounded border-2 border-zinc-800/40 shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-56 bg-zinc-800/25 rounded-lg shimmer" />
              <div className="flex gap-2.5">
                <div className="h-5 w-20 bg-zinc-800/30 rounded-full shimmer" />
                <div className="h-5 w-10 bg-zinc-800/15 rounded-lg shimmer" />
                <div className="h-5 w-20 bg-zinc-800/15 rounded-lg shimmer" />
                <div className="h-5 w-14 bg-zinc-800/15 rounded-lg shimmer" />
              </div>
              <div className="h-4 w-4/5 bg-zinc-800/15 rounded-lg shimmer" />
              <div className="h-3 w-24 bg-zinc-800/10 rounded-lg shimmer" />
            </div>
            <div className="h-6 w-20 bg-zinc-800/20 rounded-full shimmer shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
