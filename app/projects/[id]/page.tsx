import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, listGenerationsByProject } from "@/lib/storage/local";
import ProjectDetail from "@/components/project-detail";

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reels: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  shorts: "bg-red-500/10 text-red-400 border-red-500/20",
};

function platformKey(name: string): string {
  return name.toLowerCase().replace("instagram ", "").replace("youtube ", "");
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const generations = await listGenerationsByProject(id);

  return (
    <div>
      <Link href="/projects" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
        &larr; Volver a proyectos
      </Link>

      <div className="mt-2 mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <ProjectDetail project={project} />
        </div>
        <Link
          href={`/briefs/new?projectId=${id}`}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 mt-1"
        >
          + Nuevo Guion
        </Link>
      </div>

      {/* Generations */}
      <h2 className="text-lg font-bold mb-4">
        Guiones Generados ({generations.length})
      </h2>

      {generations.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-500 text-sm mb-4">
            Todavia no hay guiones para este proyecto.
          </p>
          <Link
            href={`/briefs/new?projectId=${id}`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Generar primer guion
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {generations.map((gen) => (
            <Link
              key={gen.id}
              href={`/scripts/${gen.id}`}
              className="block border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        PLATFORM_COLORS[platformKey(gen.script.platform_adaptation.platform)] || "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {gen.script.platform_adaptation.platform}
                    </span>
                    <span className="text-xs text-zinc-500">{gen.script.total_duration_seconds}s</span>
                    <span className="text-xs text-zinc-500">{gen.script.hooks.length} hooks</span>
                    <span className="text-xs text-zinc-500">{gen.script.development.framework_used}</span>
                  </div>
                  <p className="text-sm text-zinc-300 truncate">
                    Hook 1: {gen.script.hooks[0]?.script_text.substring(0, 100)}...
                  </p>
                </div>
                <span className="text-xs text-zinc-600 ml-4 shrink-0">
                  {new Date(gen.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
