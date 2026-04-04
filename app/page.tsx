import Link from "next/link";
import { cachedListGenerations as listGenerations, getBurnedLeads, cachedGetActiveCTAs as getActiveCTAs } from "@/lib/storage/local";
import SessionPack from "@/components/session-pack";
import { Kbd } from "@/components/keyboard-nav";
import Sparkline from "@/components/sparkline";
import AnimatedNumber from "@/components/animated-number";
import PipelineBar from "@/components/pipeline-bar";
import GlowCard from "@/components/glow-card";

export default async function DashboardPage() {
  const [allGenerations, burnedLeads, activeCTAs] = await Promise.all([
    listGenerations(),
    getBurnedLeads(),
    getActiveCTAs(),
  ]);
  // Filter out longform (YouTube) generations — they have their own page at /youtube
  const generations = allGenerations.filter((g) => g.contentType !== "longform");

  const draftCount = generations.filter((g) => !g.status || g.status === "draft").length;
  const confirmedCount = generations.filter((g) => g.status === "confirmed").length;
  const recordedCount = generations.filter((g) => g.status === "recorded").length;
  const winnerCount = generations.filter((g) => g.status === "winner").length;
  const totalLeads = generations.reduce((sum, g) => sum + (g.script?.hooks?.length ?? 0), 0);
  const winRate = generations.length > 0 ? Math.round((winnerCount / generations.length) * 100) : 0;

  // Build weekly sparkline data (last 8 weeks)
  function getWeeklyData(filter?: (g: typeof generations[0]) => boolean) {
    const now = new Date();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return generations.filter((g) => {
        const d = new Date(g.createdAt);
        const inRange = d >= weekStart && d < weekEnd;
        return filter ? inRange && filter(g) : inRange;
      }).length;
    });
    return weeks;
  }

  const sparkTotal = getWeeklyData();
  const sparkDraft = getWeeklyData((g) => !g.status || g.status === "draft");
  const sparkConfirmed = getWeeklyData((g) => g.status === "confirmed");
  const sparkRecorded = getWeeklyData((g) => g.status === "recorded");
  const sparkWinner = getWeeklyData((g) => g.status === "winner");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-sm text-zinc-500 mb-1">{greeting}</p>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <Link
          href="/briefs/new"
          className="group relative bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] pulse-ring"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Guion
            <span className="hidden md:inline-flex items-center gap-0.5 ml-1 opacity-60">
              <Kbd>&#8984;</Kbd><Kbd>N</Kbd>
            </span>
          </span>
        </Link>
      </div>

      {generations.length === 0 ? (
        <div className="relative glass rounded-3xl p-20 text-center animate-slide-up overflow-hidden">
          {/* Ambient glow behind empty state */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/15 to-violet-500/15 border border-purple-500/20 shadow-lg shadow-purple-500/10 animate-float">
              <svg className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Sin guiones todavia</h2>
            <p className="text-zinc-500 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              Crea tu primer guion publicitario para video vertical. El sistema genera hooks, cuerpo y CTA listos para grabar.
            </p>
            <Link
              href="/briefs/new"
              className="inline-flex bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Crear primer guion
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 stagger-children">
            <GlowCard className="bg-zinc-900/40 backdrop-blur border border-zinc-800/50 rounded-2xl p-6 hover:border-purple-500/20 transition-all duration-300 group hover-lift shimmer-sweep" glowColor="rgba(124, 58, 237, 0.12)">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">Total guiones</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <AnimatedNumber value={generations.length} className="text-4xl font-extrabold tracking-tight block" />
                  <p className="text-[11px] text-zinc-500 mt-1.5">{totalLeads} leads generados</p>
                </div>
                <Sparkline data={sparkTotal} color="#a78bfa" />
              </div>
            </GlowCard>

            <GlowCard className="bg-zinc-900/40 backdrop-blur border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-600/30 transition-all duration-300 group hover-lift shimmer-sweep" glowColor="rgba(161, 161, 170, 0.08)">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">Borradores</span>
                <div className="w-9 h-9 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <AnimatedNumber value={draftCount} className="text-4xl font-extrabold tracking-tight block" />
                  <p className="text-[11px] text-zinc-500 mt-1.5">pendientes de grabar</p>
                </div>
                <Sparkline data={sparkDraft} color="#71717a" />
              </div>
            </GlowCard>

            <GlowCard className="bg-zinc-900/40 backdrop-blur border border-zinc-800/50 rounded-2xl p-6 hover:border-blue-500/20 transition-all duration-300 group hover-lift shimmer-sweep" glowColor="rgba(59, 130, 246, 0.08)">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">Confirmados</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <AnimatedNumber value={confirmedCount} className="text-4xl font-extrabold tracking-tight text-blue-400 block" />
                  <p className="text-[11px] text-zinc-500 mt-1.5">listos para grabar</p>
                </div>
                <Sparkline data={sparkConfirmed} color="#3b82f6" />
              </div>
            </GlowCard>

            <GlowCard className="bg-zinc-900/40 backdrop-blur border border-zinc-800/50 rounded-2xl p-6 hover:border-green-500/20 transition-all duration-300 group hover-lift shimmer-sweep" glowColor="rgba(74, 222, 128, 0.08)">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">Grabados</span>
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <AnimatedNumber value={recordedCount} className="text-4xl font-extrabold tracking-tight text-green-400 block" />
                  <p className="text-[11px] text-zinc-500 mt-1.5">en testing</p>
                </div>
                <Sparkline data={sparkRecorded} color="#4ade80" />
              </div>
            </GlowCard>

            <GlowCard className="bg-zinc-900/40 backdrop-blur border border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-300 group hover-lift shimmer-sweep" glowColor="rgba(251, 191, 36, 0.08)">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">Winners</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M14.028 11.07a7.44 7.44 0 0 0 1.745-1.97m0 0A5.97 5.97 0 0 0 18.75 4.5m-2.977 4.598L18.75 4.5" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <AnimatedNumber value={winnerCount} className="text-4xl font-extrabold tracking-tight text-amber-400 block" />
                  <p className="text-[11px] text-zinc-500 mt-1.5"><AnimatedNumber value={winRate} className="" suffix="%" /> win rate</p>
                </div>
                <Sparkline data={sparkWinner} color="#fbbf24" />
              </div>
            </GlowCard>
          </div>

          {/* Pipeline visualization */}
          <PipelineBar
            total={generations.length}
            segments={[
              { count: draftCount, label: "Borrador", gradient: "bg-gradient-to-r from-zinc-500 to-zinc-600", dotColor: "bg-zinc-600" },
              { count: confirmedCount, label: "Confirmado", gradient: "bg-gradient-to-r from-blue-500 to-blue-400", shadow: "shadow-sm shadow-blue-500/30", dotColor: "bg-blue-500" },
              { count: recordedCount, label: "Grabado", gradient: "bg-gradient-to-r from-green-500 to-emerald-400", shadow: "shadow-sm shadow-green-500/30", dotColor: "bg-green-500" },
              { count: winnerCount, label: "Winner", gradient: "bg-gradient-to-r from-amber-500 to-yellow-400", shadow: "shadow-sm shadow-amber-500/30", dotColor: "bg-amber-500" },
            ]}
            burnedLeads={burnedLeads.length}
          />

          {/* Section divider before list */}
          <div className="section-divider mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium shrink-0">Guiones</span>
          </div>

          <SessionPack generations={generations} activeCTAs={activeCTAs} />
        </>
      )}
    </div>
  );
}
