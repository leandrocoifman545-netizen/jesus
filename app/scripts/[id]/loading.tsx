export default function ScriptLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="h-3 w-32 bg-zinc-800/50 rounded" />
        <div className="h-7 w-48 bg-zinc-800 rounded mt-2" />
        <div className="h-4 w-40 bg-zinc-800/30 rounded mt-2" />
      </div>
      <div className="h-8 w-20 bg-zinc-800/50 rounded-full" />
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <div className="h-4 w-48 bg-zinc-800 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-zinc-800/30 rounded" />
          <div className="h-10 bg-zinc-800/30 rounded" />
        </div>
      </div>
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-40 h-24 shrink-0 border border-zinc-800 rounded-lg p-3" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-12 bg-zinc-800/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
