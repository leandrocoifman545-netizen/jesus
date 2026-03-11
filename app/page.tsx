import Link from "next/link";
import { listGenerations, getBurnedLeads } from "@/lib/storage/local";
import SessionPack from "@/components/session-pack";

export default async function DashboardPage() {
  const [generations, burnedLeads] = await Promise.all([
    listGenerations(),
    getBurnedLeads(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Tus guiones publicitarios generados</p>
        </div>
        <Link
          href="/briefs/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Guion
        </Link>
      </div>

      {generations.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h2 className="text-lg font-semibold mb-2">Sin guiones todavia</h2>
          <p className="text-zinc-400 mb-6">Crea tu primer guion publicitario para video vertical</p>
          <Link
            href="/briefs/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Crear primer guion
          </Link>
        </div>
      ) : (
        <SessionPack generations={generations} burnedLeadsCount={burnedLeads.length} />
      )}
    </div>
  );
}
