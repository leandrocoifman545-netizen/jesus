import { cachedListGenerations as listGenerations } from "@/lib/storage/local";
import SessionReview from "@/components/session-review";

export default async function SessionPage() {
  const generations = await listGenerations();
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">Post-Sesion</h1>
        </div>
      </div>
      <p className="text-zinc-500 text-sm mb-10">
        Marca que se grabo, que se descarto, y agrega notas de la sesion.
      </p>
      <SessionReview generations={generations} />
    </div>
  );
}
