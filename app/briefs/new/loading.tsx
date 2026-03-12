export default function BriefLoading() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <div className="h-10 w-48 bg-zinc-800/30 rounded-2xl shimmer" />
        <div className="h-4 w-80 bg-zinc-800/15 rounded-xl mt-3 shimmer" />
      </div>

      {/* Form skeleton */}
      <div className="max-w-2xl bg-zinc-900/30 border border-zinc-800/40 rounded-3xl p-8 space-y-7">
        {/* Project selector */}
        <div className="space-y-3">
          <div className="h-4 w-20 bg-zinc-800/25 rounded-lg shimmer" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-zinc-800/20 rounded-xl shimmer" />
            <div className="h-9 w-28 bg-zinc-800/20 rounded-xl shimmer" />
          </div>
        </div>

        {/* Textarea fields */}
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-32 bg-zinc-800/25 rounded-lg shimmer" />
            <div className="h-24 w-full bg-zinc-800/15 rounded-2xl shimmer" />
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-zinc-800/30 pt-2">
          <div className="h-3 w-16 bg-zinc-800/15 rounded shimmer" />
        </div>

        {/* Hook count */}
        <div className="space-y-3">
          <div className="h-4 w-36 bg-zinc-800/25 rounded-lg shimmer" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-zinc-800/20 rounded-lg shimmer" />
            <div className="h-8 w-10 bg-zinc-800/30 rounded-lg shimmer" />
            <div className="h-8 w-8 bg-zinc-800/20 rounded-lg shimmer" />
          </div>
        </div>

        {/* More textareas */}
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-40 bg-zinc-800/25 rounded-lg shimmer" />
            <div className="h-16 w-full bg-zinc-800/15 rounded-2xl shimmer" />
          </div>
        ))}

        {/* Submit button */}
        <div className="h-12 w-full bg-zinc-800/25 rounded-2xl shimmer" />
      </div>
    </div>
  );
}
