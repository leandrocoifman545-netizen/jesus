import { listReferences } from "@/lib/storage/local";
import ReferenceLibrary from "@/components/reference-library";

export default async function ReferencesPage() {
  const refs = await listReferences();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Referencias</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Guiones ganadores que el software analiza para replicar sus patrones en cada nuevo guion.
        </p>
      </div>
      <ReferenceLibrary initialRefs={refs} />
    </div>
  );
}
