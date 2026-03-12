import Link from "next/link";
import { listGenerations } from "@/lib/storage/local";
import RelativeTime from "@/components/relative-time";

export default async function YouTubePage() {
  const allGenerations = await listGenerations();
  const longformGenerations = allGenerations.filter((g) => g.contentType === "longform");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{greeting}</p>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                YouTube
              </h1>
            </div>
          </div>
          <p className="text-zinc-500 text-sm mt-1 ml-[52px]">
            Videos largos horizontales — guiones y estructuras
          </p>
        </div>
        <Link
          href="/youtube/new"
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/20 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo video
        </Link>
      </div>

      {/* Stats */}
      {longformGenerations.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Videos</p>
            <p className="text-2xl font-bold text-white">{longformGenerations.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Borradores</p>
            <p className="text-2xl font-bold text-white">
              {longformGenerations.filter((g) => !g.status || g.status === "draft").length}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Grabados</p>
            <p className="text-2xl font-bold text-white">
              {longformGenerations.filter((g) => g.status === "recorded" || g.status === "winner").length}
            </p>
          </div>
        </div>
      )}

      {/* Video list */}
      {longformGenerations.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-400/50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No hay videos todavía</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Creá tu primer guión de YouTube largo. Podés partir de una referencia o desde cero.
          </p>
          <Link
            href="/youtube/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Crear primer video
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {longformGenerations.map((gen) => {
            const lf = gen.longform;
            const duration = lf ? Math.round(lf.total_duration_seconds / 60) : Math.round(gen.script.total_duration_seconds / 60);
            const chapters = lf?.chapters?.length || gen.script.development.sections.length;
            const framework = lf?.framework || gen.script.development.framework_used;
            const mode = lf?.output_mode === "structure" ? "Estructura" : "Guión completo";

            return (
              <Link
                key={gen.id}
                href={`/youtube/${gen.id}`}
                className="block group"
              >
                <div className="bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-red-500/20 rounded-2xl p-5 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {gen.status === "recorded" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                            Grabado
                          </span>
                        )}
                        {gen.status === "winner" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Winner
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-white group-hover:text-red-300 transition-colors truncate">
                        {gen.title || "Sin título"}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                        {lf?.hook?.script_text || gen.script.hooks[0]?.script_text || ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 shrink-0">
                      <span className="px-2 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/30">
                        {mode}
                      </span>
                      <span>{duration} min</span>
                      <span>{chapters} caps</span>
                      <span className="capitalize">{framework}</span>
                      <RelativeTime date={gen.createdAt} />
                    </div>
                  </div>

                  {/* Chapter preview */}
                  {lf && lf.chapters.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-hidden">
                      {lf.chapters.map((ch) => (
                        <span
                          key={ch.number}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/30 text-[11px] text-zinc-400 truncate max-w-[200px]"
                        >
                          {ch.number}. {ch.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
