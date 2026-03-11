export default function ScriptLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Breadcrumb + title */}
      <div>
        <div className="h-3 w-32 bg-zinc-800/30 rounded-2xl" />
        <div className="h-7 w-48 bg-zinc-800/50 rounded-2xl mt-2" />
        <div className="h-3 w-40 bg-zinc-800/20 rounded-2xl mt-2" />
      </div>

      {/* Status pill */}
      <div className="h-8 w-20 bg-zinc-800/30 rounded-full" />

      {/* Platform card */}
      <div className="rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-5 space-y-3">
        <div className="h-4 w-48 bg-zinc-800/40 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-zinc-800/20 rounded-xl" />
          <div className="h-10 bg-zinc-800/20 rounded-xl" />
        </div>
      </div>

      {/* Hook selector - 3 small cards */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-40 h-24 shrink-0 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-3">
            <div className="h-3 w-16 bg-zinc-800/40 rounded mb-2" />
            <div className="h-3 w-full bg-zinc-800/20 rounded" />
            <div className="h-3 w-2/3 bg-zinc-800/20 rounded mt-1" />
          </div>
        ))}
      </div>

      {/* Script flow - 3 sections */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-5 space-y-2">
            <div className="h-4 w-32 bg-zinc-800/40 rounded-lg" />
            <div className="h-16 bg-zinc-800/15 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
