import { notFound } from "next/navigation";
import Link from "next/link";
import { getGeneration, getGenerationNeighbors } from "@/lib/storage/local";
import ScriptViewer from "@/components/script-viewer";
import { Kbd } from "@/components/keyboard-nav";
import ScriptNav from "./script-nav";

export default async function ScriptPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ batch?: string; project?: string }> }) {
  const { id } = await params;
  const { batch: batchParam, project: projectParam } = await searchParams;
  const generation = await getGeneration(id);

  if (!generation) {
    notFound();
  }

  // Use batch from URL param, or from the generation itself
  const batchId = batchParam || generation.batch?.id;
  const projectId = projectParam || generation.projectId;
  const neighbors = await getGenerationNeighbors(id, batchId, projectId);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <nav className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
              Dashboard
            </Link>
            <svg className="w-3 h-3 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-zinc-400 font-medium">{generation.title || "Guion sin titulo"}</span>
          </nav>
          <p className="text-zinc-600 text-[11px] mt-3 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {new Date(generation.createdAt).toLocaleString("es-AR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScriptNav prev={neighbors.prev} next={neighbors.next} batchId={batchId} projectId={!batchId ? projectId : undefined} />
          <Link
            href="/briefs/new"
            className="group bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 hover:shadow-lg hover:shadow-purple-500/25 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Guion
            <span className="hidden md:inline-flex items-center gap-0.5 ml-1 opacity-60">
              <Kbd>&#8984;</Kbd><Kbd>N</Kbd>
            </span>
          </Link>
        </div>
      </div>
      <ScriptViewer
        script={generation.script}
        generationId={generation.id}
        initialTitle={generation.title || ""}
        initialStatus={generation.status || "draft"}
        initialMetrics={generation.metrics}
        initialSessionNotes={generation.sessionNotes || ""}
        initialHookApprovals={generation.hookApprovals || {}}
        initialCopiesMatrix={(generation as unknown as Record<string, unknown>).ad_copies_matrix as any}
      />

      {/* Bottom navigation */}
      {(neighbors.prev || neighbors.next) && (
        <div className="mt-10 pt-6 border-t border-zinc-800/50 flex items-center justify-end">
          <ScriptNav prev={neighbors.prev} next={neighbors.next} batchId={batchId} projectId={!batchId ? projectId : undefined} />
        </div>
      )}
    </div>
  );
}
