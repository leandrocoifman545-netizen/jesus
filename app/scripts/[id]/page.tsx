import { notFound } from "next/navigation";
import Link from "next/link";
import { getGeneration } from "@/lib/storage/local";
import ScriptViewer from "@/components/script-viewer";

export default async function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const generation = await getGeneration(id);

  if (!generation) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
            &larr; Volver al dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2">Guion Generado</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Creado {new Date(generation.createdAt).toLocaleString("es-AR")}
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Guion
        </Link>
      </div>
      <ScriptViewer script={generation.script} generationId={generation.id} />
    </div>
  );
}
