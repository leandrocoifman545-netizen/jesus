export default function ScriptLoading() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Breadcrumb + button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 bg-zinc-800/25 rounded-lg shimmer" />
            <div className="h-3 w-3 bg-zinc-800/15 rounded" />
            <div className="h-3 w-32 bg-zinc-800/25 rounded-lg shimmer" />
          </div>
          <div className="h-3 w-40 bg-zinc-800/15 rounded-lg mt-3 shimmer" />
        </div>
        <div className="h-10 w-36 bg-zinc-800/25 rounded-2xl shimmer" />
      </div>

      {/* Title skeleton */}
      <div className="h-10 w-80 bg-zinc-800/30 rounded-2xl shimmer" />

      {/* Status pill */}
      <div className="h-8 w-24 bg-zinc-800/25 rounded-xl shimmer" />

      {/* Platform card skeleton */}
      <div className="rounded-3xl bg-zinc-900/30 border border-zinc-800/40 p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-zinc-800/30 rounded-lg shimmer" />
          <div className="h-4 w-56 bg-zinc-800/15 rounded-lg shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-800/20 rounded shimmer" />
            <div className="h-5 w-full bg-zinc-800/15 rounded-lg shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-800/20 rounded shimmer" />
            <div className="h-5 w-full bg-zinc-800/15 rounded-lg shimmer" />
          </div>
        </div>
      </div>

      {/* Hooks heading */}
      <div className="h-7 w-24 bg-zinc-800/30 rounded-xl shimmer" />

      {/* Hook selector skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`w-44 shrink-0 rounded-2xl border p-4 space-y-2.5 ${i === 1 ? "bg-purple-500/5 border-purple-500/20" : "bg-zinc-900/30 border-zinc-800/40"}`}>
            <div className="flex items-center justify-between">
              <div className="h-4 w-8 bg-zinc-800/30 rounded shimmer" />
              <div className="h-3 w-8 bg-zinc-800/15 rounded shimmer" />
            </div>
            <div className="h-4 w-20 bg-zinc-800/25 rounded-full shimmer" />
            <div className="h-3 w-full bg-zinc-800/15 rounded shimmer" />
            <div className="h-3 w-2/3 bg-zinc-800/10 rounded shimmer" />
          </div>
        ))}
      </div>

      {/* Script flow heading */}
      <div className="h-7 w-16 bg-zinc-800/30 rounded-xl shimmer" />

      {/* Script flow sections skeleton */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-purple-500/5 border border-purple-500/15 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-purple-500/15 rounded-lg shimmer" />
            <div className="h-4 w-24 bg-zinc-800/20 rounded-full shimmer" />
            <div className="h-4 w-12 bg-zinc-800/15 rounded-lg shimmer" />
          </div>
          <div className="h-5 w-full bg-zinc-800/10 rounded-lg shimmer" />
          <div className="h-5 w-4/5 bg-zinc-800/10 rounded-lg shimmer" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-zinc-900/30 border border-zinc-800/40 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-zinc-800/25 rounded-lg shimmer" />
              <div className="h-4 w-16 bg-zinc-800/15 rounded-lg shimmer" />
            </div>
            <div className="h-5 w-full bg-zinc-800/10 rounded-lg shimmer" />
            <div className="h-5 w-3/4 bg-zinc-800/10 rounded-lg shimmer" />
            <div className="h-5 w-1/2 bg-zinc-800/10 rounded-lg shimmer" />
          </div>
        ))}
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-emerald-500/15 rounded-lg shimmer" />
            <div className="h-4 w-16 bg-zinc-800/15 rounded-lg shimmer" />
          </div>
          <div className="h-5 w-full bg-zinc-800/10 rounded-lg shimmer" />
          <div className="h-5 w-2/3 bg-zinc-800/10 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}
