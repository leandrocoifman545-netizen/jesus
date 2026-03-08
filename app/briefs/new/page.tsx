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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Nuevo Guion</h1>
        <p className="text-zinc-400 mt-1">
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
