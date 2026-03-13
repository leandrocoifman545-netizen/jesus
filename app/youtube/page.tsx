import Link from "next/link";
import { listGenerations } from "@/lib/storage/local";
import YouTubeListFilter from "@/components/youtube-list-filter";

export default async function YouTubePage() {
  const allGenerations = await listGenerations();
  const longformGenerations = allGenerations.filter((g) => g.contentType === "longform");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  // Serialize for client component
  const serialized = longformGenerations.map((gen) => ({
    id: gen.id,
    title: gen.title || "Sin título",
    status: gen.status || "draft",
    hookText: gen.longform?.hook?.script_text || gen.script.hooks[0]?.script_text || "",
    duration: gen.longform ? Math.round(gen.longform.total_duration_seconds / 60) : Math.round(gen.script.total_duration_seconds / 60),
    chapters: gen.longform?.chapters?.length || gen.script.development.sections.length,
    chapterTitles: gen.longform?.chapters?.map((ch) => ({ number: ch.number, title: ch.title })) || [],
    framework: gen.longform?.framework || gen.script.development.framework_used,
    mode: gen.longform?.output_mode === "both" ? "Ambos" : gen.longform?.output_mode === "structure" ? "Estructura" : "Guión completo",
    createdAt: gen.createdAt,
  }));

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
        <div className="grid grid-cols-4 gap-4 mb-10">
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
              {longformGenerations.filter((g) => g.status === "recorded").length}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Winners</p>
            <p className="text-2xl font-bold text-amber-400">
              {longformGenerations.filter((g) => g.status === "winner").length}
            </p>
          </div>
        </div>
      )}

      {/* Video list with filters */}
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
        <YouTubeListFilter generations={serialized} />
      )}
    </div>
  );
}
