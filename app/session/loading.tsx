export default function SessionLoading() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <div className="h-10 w-44 bg-zinc-800/30 rounded-2xl shimmer" />
        <div className="h-4 w-80 bg-zinc-800/15 rounded-xl mt-3 shimmer" />
      </div>

      {/* Section headings + cards */}
      {[1, 2].map((section) => (
        <div key={section} className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800/30 shimmer" />
            <div className="h-4 w-40 bg-zinc-800/25 rounded-lg shimmer" />
          </div>
          <div className="space-y-3 stagger-children">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-zinc-900/30 border border-zinc-800/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-48 bg-zinc-800/25 rounded-lg shimmer" />
                    <div className="h-5 w-16 bg-zinc-800/15 rounded-full shimmer" />
                  </div>
                  <div className="flex gap-1">
                    <div className="h-6 w-16 bg-zinc-800/20 rounded-xl shimmer" />
                    <div className="h-6 w-16 bg-zinc-800/20 rounded-xl shimmer" />
                  </div>
                </div>
                <div className="h-4 w-4/5 bg-zinc-800/10 rounded-lg shimmer" />
                <div className="h-8 w-full bg-zinc-800/10 rounded-xl shimmer" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="h-12 w-full bg-zinc-900/30 border border-zinc-800/40 rounded-2xl shimmer" />
    </div>
  );
}
