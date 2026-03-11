import { listGenerations } from "@/lib/storage/local";
import SessionReview from "@/components/session-review";

export default async function SessionPage() {
  const generations = await listGenerations();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Post-Sesion</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Marca que se grabo, que se descarto, y agrega notas de la sesion.
      </p>
      <SessionReview generations={generations} />
    </div>
  );
}
