import { cachedListReferences as listReferences } from "@/lib/storage/local";
import ReferenceLibrary from "@/components/reference-library";

export default async function ReferencesPage() {
  const refs = await listReferences();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">Biblioteca de Referencias</h1>
          </div>
        </div>
        <p className="text-sm text-zinc-500 mt-2">
          Guiones ganadores que el software analiza para replicar sus patrones en cada nuevo guion.
        </p>
      </div>
      <ReferenceLibrary initialRefs={refs} />
    </div>
  );
}
