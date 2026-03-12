import { Suspense } from "react";
import { listProjects } from "@/lib/storage/local";
import BriefForm from "@/components/brief-form";

export default async function NewBriefPage() {
  const projects = await listProjects();
  const projectsForForm = projects.map((p) => ({
    id: p.id,
    clientName: p.clientName,
    productDescription: p.productDescription,
    targetAudience: p.targetAudience,
    brandTone: p.brandTone,
    brandDocuments: p.brandDocuments,
    brandDocument: p.brandDocument,
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">Nuevo Guion</h1>
          </div>
        </div>
        <p className="text-zinc-500 text-sm mt-2">
          {projects.length > 0
            ? "Selecciona un proyecto o completa el brief manualmente"
            : "Completa el brief para generar guiones listos para produccion"}
        </p>
      </div>
      <Suspense>
        <BriefForm projects={projectsForForm} />
      </Suspense>
    </div>
  );
}
