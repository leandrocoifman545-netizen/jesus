"use client";

import { useEffect, useState } from "react";

interface Cluster {
  id: string;
  tension_name: string;
  perspective: string;
  verbatims: string[];
  mapped_family: string;
  mapped_angle: string | null;
  proposed_angle: string | null;
  proposed_big_idea: string;
  segment_affinity: string[];
  confidence: "high" | "medium" | "low";
  score: number;
  is_new: boolean;
}

interface MiningData {
  generated_at: string;
  total_verbatims_analyzed: number;
  clusters: Cluster[];
  stale?: boolean;
  empty?: boolean;
  message?: string;
}

const FAMILY_COLORS: Record<string, string> = {
  identidad: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  oportunidad: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  confrontacion: "bg-red-500/10 text-red-400 border-red-500/20",
  mecanismo: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  historia: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const CONF_COLORS: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-red-500/10 text-red-400 border-red-500/20",
};

const SEG_COLORS: Record<string, string> = {
  A: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  B: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  C: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  D: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function MinerPage() {
  const [data, setData] = useState<MiningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [filter, setFilter] = useState<"all" | "new">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/miner")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function runMining() {
    setMining(true);
    try {
      const res = await fetch("/api/miner", { method: "POST" });
      const result = await res.json();
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        setData(result);
      }
    } catch (e) {
      alert(`Error: ${e}`);
    } finally {
      setMining(false);
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Cargando miner...</div>
      </div>
    );
  }

  const clusters = data?.clusters || [];
  const filtered = filter === "new" ? clusters.filter((c) => c.is_new) : clusters;
  const newCount = clusters.filter((c) => c.is_new).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">WhatsApp Angle Miner</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Descubre perspectivas nuevas desde las conversaciones reales de tu audiencia
            </p>
          </div>
          <button
            onClick={runMining}
            disabled={mining}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all flex items-center gap-2"
          >
            {mining ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Minando...
              </>
            ) : (
              "Minar ahora"
            )}
          </button>
        </div>

        {/* Stats */}
        {data && !data.empty && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Verbatims analizados" value={data.total_verbatims_analyzed} />
            <StatCard label="Clusters encontrados" value={clusters.length} />
            <StatCard label="Ángulos nuevos" value={newCount} color="text-emerald-400" />
            <StatCard
              label="Última ejecución"
              value={data.generated_at ? new Date(data.generated_at).toLocaleDateString("es-AR") : "—"}
              color={data.stale ? "text-amber-400" : "text-zinc-300"}
            />
          </div>
        )}

        {data?.empty ? (
          <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.04] p-12 text-center">
            <div className="text-zinc-500 mb-4">No hay resultados todavía</div>
            <button
              onClick={runMining}
              disabled={mining}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-medium transition-all"
            >
              Ejecutar primer mining
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex rounded-xl bg-zinc-900/50 border border-white/[0.04] p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${filter === "all" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Todos ({clusters.length})
                </button>
                <button
                  onClick={() => setFilter("new")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${filter === "new" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Solo nuevos ({newCount})
                </button>
              </div>
              {data?.stale && (
                <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Datos de hace +7 días — recomendado minar de nuevo
                </span>
              )}
            </div>

            {/* Clusters */}
            <div className="space-y-3">
              {filtered.map((cluster) => (
                <div
                  key={cluster.id}
                  className="rounded-2xl bg-zinc-900/50 border border-white/[0.04] overflow-hidden transition-all"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(cluster.id)}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/[0.02] transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-zinc-200">{cluster.tension_name}</span>
                        {cluster.is_new && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium uppercase tracking-wider">
                            Nuevo
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CONF_COLORS[cluster.confidence]}`}>
                          {cluster.confidence}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${FAMILY_COLORS[cluster.mapped_family] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                          {cluster.mapped_family}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1 truncate">{cluster.perspective}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {cluster.segment_affinity.map((seg) => (
                          <span key={seg} className={`text-[10px] px-1.5 py-0.5 rounded border ${SEG_COLORS[seg] || ""}`}>
                            {seg}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{cluster.score}pt</span>
                      <svg
                        className={`w-4 h-4 text-zinc-500 transition-transform ${expanded.has(cluster.id) ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {expanded.has(cluster.id) && (
                    <div className="px-5 pb-5 border-t border-white/[0.04] pt-4 space-y-4">
                      <div>
                        <div className="text-xs text-zinc-500 mb-2">Perspectiva</div>
                        <p className="text-sm text-zinc-300">{cluster.perspective}</p>
                      </div>

                      {cluster.proposed_big_idea && (
                        <div>
                          <div className="text-xs text-zinc-500 mb-2">Big Idea propuesta</div>
                          <p className="text-sm text-purple-300 italic">&ldquo;{cluster.proposed_big_idea}&rdquo;</p>
                        </div>
                      )}

                      {cluster.proposed_angle && (
                        <div>
                          <div className="text-xs text-zinc-500 mb-2">Ángulo propuesto</div>
                          <p className="text-sm text-emerald-300">{cluster.proposed_angle}</p>
                        </div>
                      )}

                      {cluster.mapped_angle && (
                        <div>
                          <div className="text-xs text-zinc-500 mb-2">Mapea a ángulo existente</div>
                          <p className="text-sm text-zinc-400">{cluster.mapped_angle}</p>
                        </div>
                      )}

                      <div>
                        <div className="text-xs text-zinc-500 mb-2">Verbatims representativos</div>
                        <div className="space-y-1.5">
                          {cluster.verbatims.map((v, i) => (
                            <div key={i} className="text-sm text-zinc-400 bg-zinc-800/50 rounded-lg px-3 py-2 border-l-2 border-purple-500/30">
                              &ldquo;{v}&rdquo;
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.04] p-4">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${color || "text-white"}`}>{value}</div>
    </div>
  );
}
