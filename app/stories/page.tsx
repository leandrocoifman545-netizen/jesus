import Link from "next/link";
import { cachedListStories as listStories } from "@/lib/storage/local";

const TYPE_LABELS: Record<string, string> = {
  personalidad: "Personalidad",
  cta_lead_magnet: "CTA Lead Magnet",
  cta_volumen: "CTA Volumen",
  cta_directo: "CTA Directo",
  objecion: "Objecion",
  nicho: "Nicho",
  expertise: "Expertise",
  actuada_triangulo: "Actuada / Triangulo",
  explicativa_servicio: "Explicativa de Servicio",
  behind_the_scenes: "Behind the Scenes",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-700/50 text-zinc-300",
  recorded: "bg-amber-500/20 text-amber-400",
  published: "bg-emerald-500/20 text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  recorded: "Grabada",
  published: "Publicada",
};

export default async function StoriesPage() {
  const stories = await listStories();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Stories
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {stories.length} secuencia{stories.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-lg">No hay secuencias todavia</p>
          <p className="text-sm mt-2">Genera una con /stories</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group block bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 hover:bg-zinc-900/80 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-medium">
                      {TYPE_LABELS[story.sequence_type] || story.sequence_type}
                    </span>
                    <span>{story.slides.length} slides</span>
                    <span>{story.total_seconds}s</span>
                    {story.highlight_name && (
                      <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">
                        Highlight: {story.highlight_name}
                      </span>
                    )}
                  </div>
                  {story.notes && (
                    <p className="text-xs text-zinc-600 mt-2 line-clamp-1">{story.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[story.status] || STATUS_STYLES.draft}`}>
                    {STATUS_LABELS[story.status] || story.status}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    {new Date(story.createdAt).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
