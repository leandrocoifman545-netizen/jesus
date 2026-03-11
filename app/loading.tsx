export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-zinc-800 rounded" />
          <div className="h-4 w-64 bg-zinc-800/50 rounded mt-2" />
        </div>
        <div className="h-9 w-32 bg-zinc-800 rounded-lg" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-24 bg-zinc-800/50 rounded-full" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border border-zinc-800 rounded-xl p-5 flex gap-4">
          <div className="w-5 h-5 rounded bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-3">
              <div className="h-5 w-16 bg-zinc-800 rounded-full" />
              <div className="h-5 w-10 bg-zinc-800/50 rounded" />
              <div className="h-5 w-16 bg-zinc-800/50 rounded" />
            </div>
            <div className="h-4 w-3/4 bg-zinc-800/30 rounded" />
            <div className="h-3 w-20 bg-zinc-800/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
