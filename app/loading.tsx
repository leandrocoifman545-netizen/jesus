export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-44 bg-zinc-800/60 rounded-2xl" />
          <div className="h-4 w-64 bg-zinc-800/30 rounded-2xl mt-3" />
        </div>
        <div className="h-10 w-36 bg-zinc-800/40 rounded-xl" />
      </div>

      {/* Skeleton search bar */}
      <div className="h-10 w-full rounded-2xl bg-zinc-900/30 border border-zinc-800/50" />

      {/* Skeleton stats bar */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-16 rounded-2xl bg-zinc-900/30 border border-zinc-800/50" />
        ))}
      </div>

      {/* Skeleton cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-5 flex gap-4"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <div className="w-5 h-5 rounded bg-zinc-800/40" />
          <div className="flex-1 space-y-3">
            <div className="flex gap-3">
              <div className="h-5 w-16 bg-zinc-800/40 rounded-full" />
              <div className="h-5 w-10 bg-zinc-800/20 rounded-lg" />
              <div className="h-5 w-16 bg-zinc-800/20 rounded-lg" />
            </div>
            <div className="h-4 w-3/4 bg-zinc-800/20 rounded-lg" />
            <div className="h-3 w-20 bg-zinc-800/10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
