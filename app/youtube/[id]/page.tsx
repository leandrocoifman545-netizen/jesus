import { notFound } from "next/navigation";
import Link from "next/link";
import { getGeneration } from "@/lib/storage/local";
import YouTubeViewer from "@/components/youtube-viewer";
import ScriptViewer from "@/components/script-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function YouTubeVideoPage({ params }: Props) {
  const { id } = await params;
  const generation = await getGeneration(id);

  if (!generation) {
    notFound();
  }

  // Longform → YouTube viewer | Shortform → Script viewer (works with teleprompter, PDF, TXT)
  if (generation.longform) {
    return (
      <div className="animate-fade-in">
        <YouTubeViewer generation={generation} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <nav className="flex items-center gap-2 text-xs">
            <Link href="/youtube" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              YouTube
            </Link>
            <svg className="w-3 h-3 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-zinc-400 font-medium">{generation.title || "Guion sin titulo"}</span>
          </nav>
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
      />
    </div>
  );
}
