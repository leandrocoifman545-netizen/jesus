import Link from "next/link";
import ProjectForm from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <Link href="/projects" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
        &larr; Volver a proyectos
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Nuevo Proyecto</h1>
      <ProjectForm />
    </div>
  );
}
