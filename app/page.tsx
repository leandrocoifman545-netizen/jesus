import Link from "next/link";
import { listGenerations, getBurnedLeads } from "@/lib/storage/local";
import SessionPack from "@/components/session-pack";

export default async function DashboardPage() {
  const [generations, burnedLeads] = await Promise.all([
    listGenerations(),
    getBurnedLeads(),
  ]);

  const draftCount = generations.filter((g) => !g.status || g.status === "draft").length;
  const recordedCount = generations.filter((g) => g.status === "recorded").length;
  const winnerCount = generations.filter((g) => g.status === "winner").length;
  const totalLeads = generations.reduce((sum, g) => sum + g.script.hooks.length, 0);
  const winRate = generations.length > 0 ? Math.round((winnerCount / generations.length) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Centro de control de guiones publicitarios</p>
        </div>
        <Link
          href="/briefs/new"
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
        >
          + Nuevo Guion
        </Link>
      </div>

      {generations.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
            <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2 tracking-tight">Sin guiones todavia</h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">
            Crea tu primer guion publicitario para video vertical
          </p>
          <Link
            href="/briefs/new"
            className="inline-flex bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/20 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
          >
            Crear primer guion
          </Link>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="relative overflow-hidden bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Total guiones</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">{generations.length}</p>
              <p className="text-[11px] text-zinc-600 mt-1">{totalLeads} leads generados</p>
            </div>

            <div className="relative overflow-hidden bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Borradores</span>
                <div className="w-8 h-8 rounded-xl bg-zinc-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">{draftCount}</p>
              <p className="text-[11px] text-zinc-600 mt-1">pendientes de grabar</p>
            </div>

            <div className="relative overflow-hidden bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Grabados</span>
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight text-green-400">{recordedCount}</p>
              <p className="text-[11px] text-zinc-600 mt-1">en testing</p>
            </div>

            <div className="relative overflow-hidden bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Winners</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M14.028 11.07a7.44 7.44 0 0 0 1.745-1.97m0 0A5.97 5.97 0 0 0 18.75 4.5m-2.977 4.598L18.75 4.5" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight text-amber-400">{winnerCount}</p>
              <p className="text-[11px] text-zinc-600 mt-1">{winRate}% win rate</p>
            </div>
          </div>

          {/* Pipeline visualization */}
          <div className="mb-8">
            <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-zinc-900/50 border border-zinc-800/30">
              {draftCount > 0 && (
                <div
                  className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                  style={{ width: `${(draftCount / generations.length) * 100}%` }}
                  title={`${draftCount} borradores`}
                />
              )}
              {recordedCount > 0 && (
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(recordedCount / generations.length) * 100}%` }}
                  title={`${recordedCount} grabados`}
                />
              )}
              {winnerCount > 0 && (
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(winnerCount / generations.length) * 100}%` }}
                  title={`${winnerCount} winners`}
                />
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                {draftCount > 0 && <span className="flex items-center gap-1.5 text-[10px] text-zinc-500"><span className="w-2 h-2 rounded-full bg-zinc-600" />Borrador</span>}
                {recordedCount > 0 && <span className="flex items-center gap-1.5 text-[10px] text-zinc-500"><span className="w-2 h-2 rounded-full bg-green-500" />Grabado</span>}
                {winnerCount > 0 && <span className="flex items-center gap-1.5 text-[10px] text-zinc-500"><span className="w-2 h-2 rounded-full bg-amber-500" />Winner</span>}
              </div>
              <span className="text-[10px] text-zinc-600">{burnedLeads.length} leads quemados</span>
            </div>
          </div>

          <SessionPack generations={generations} />
        </>
      )}
    </div>
  );
}
