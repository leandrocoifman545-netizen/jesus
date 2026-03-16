import { cachedListProjects as listProjects } from "@/lib/storage/local";
import YouTubeBriefForm from "@/components/youtube-brief-form";

export default async function NewYouTubeVideoPage() {
  const projects = await listProjects();
  const projectsForForm = projects.map((p) => ({
    id: p.id,
    clientName: p.clientName,
    productDescription: p.productDescription,
    targetAudience: p.targetAudience,
    brandTone: p.brandTone,
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Nuevo Video YouTube
            </h1>
          </div>
        </div>
        <p className="text-zinc-500 text-sm mt-2 ml-[52px]">
          Creá un guión largo o una estructura flexible para YouTube
        </p>
      </div>
      <YouTubeBriefForm projects={projectsForForm} />
    </div>
  );
}
