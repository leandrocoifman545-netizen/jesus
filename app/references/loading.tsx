export default function ReferencesLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="h-10 w-72 bg-zinc-800/30 rounded-2xl shimmer" />
        <div className="h-4 w-96 bg-zinc-800/15 rounded-xl mt-3 shimmer" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800/25 rounded-xl shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-36 bg-zinc-800/25 rounded-lg shimmer" />
                <div className="h-3 w-56 bg-zinc-800/15 rounded-lg shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reference list */}
      <div className="space-y-3 stagger-children">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-zinc-800/25 rounded-lg shimmer" />
              <div className="h-5 w-20 bg-zinc-800/15 rounded-full shimmer" />
            </div>
            <div className="h-4 w-full bg-zinc-800/10 rounded-lg shimmer" />
            <div className="h-4 w-2/3 bg-zinc-800/10 rounded-lg shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
