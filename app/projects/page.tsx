import Link from "next/link";
import { listProjects } from "@/lib/storage/local";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-zinc-400 mt-1">Cada proyecto guarda los datos del cliente para generar guiones rapido</p>
        </div>
        <Link
          href="/projects/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-12 text-center">
          <h2 className="text-lg font-semibold mb-2">Sin proyectos todavia</h2>
          <p className="text-zinc-400 mb-6">Crea un proyecto para guardar los datos de un cliente y generar guiones sin reescribir todo cada vez</p>
          <Link
            href="/projects/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Crear primer proyecto
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{p.clientName}</h3>
                  <p className="text-xs text-zinc-400 mt-1 truncate">{p.productDescription}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700">
                      {p.brandTone}
                    </span>
                    {(p.brandDocuments?.length || p.brandDocument) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/20">
                        {p.brandDocuments?.length
                          ? `${p.brandDocuments.length} doc${p.brandDocuments.length > 1 ? "s" : ""}`
                          : "Doc adjunto"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-zinc-600 ml-4 shrink-0">
                  {new Date(p.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
