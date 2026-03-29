"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MatrixView = dynamic(() => import("@/components/matrix-view"), { ssr: false });
const MinerView = dynamic(() => import("@/components/miner-view"), { ssr: false });
const CompetitorsView = dynamic(() => import("@/components/competitors-view"), { ssr: false });

interface AnalyticsData {
  total: number;
  byStatus: Record<string, number>;
  byAngleFamily: Record<string, number>;
  byBodyType: Record<string, number>;
  byModelSale: Record<string, number>;
  byHookType: Record<string, number>;
  byFramework: Record<string, number>;
  byVisualFormat: Record<string, number>;
  diversityScore: {
    angleFamilies: number;
    angleFamiliesMax: number;
    bodyTypes: number;
    bodyTypesMax: number;
    score: number;
  };
  saturationAlerts: string[];
  winners: number;
  recorded: number;
  withMetrics: Array<{
    id: string;
    title?: string;
    status?: string;
    metrics: Record<string, number | string | undefined>;
    angleFamily: string;
    bodyType: string;
    modelSale: string;
    hookType: string;
    framework: string;
  }>;
  unusedCombos: string[];
  timeline: Array<{
    id: string;
    title?: string;
    date: string;
    status: string;
    angleFamily: string;
    bodyType: string;
    modelSale: string | null;
  }>;
}

const FAMILY_COLORS: Record<string, string> = {
  identidad: "bg-blue-500",
  oportunidad: "bg-emerald-500",
  confrontacion: "bg-red-500",
  mecanismo: "bg-amber-500",
  historia: "bg-purple-500",
  sin_clasificar: "bg-zinc-600",
};

const FAMILY_LABELS: Record<string, string> = {
  identidad: "Identidad",
  oportunidad: "Oportunidad",
  confrontacion: "Confrontacion",
  mecanismo: "Mecanismo",
  historia: "Historia",
  sin_clasificar: "Sin clasificar",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-600",
  confirmed: "bg-blue-500",
  recorded: "bg-amber-500",
  winner: "bg-emerald-500",
};

function BarChart({ data, colors, labels }: { data: Record<string, number>; colors?: Record<string, string>; labels?: Record<string, string> }) {
  const max = Math.max(...Object.values(data), 1);
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-2">
      {sorted.map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-32 truncate text-right" title={key}>
            {(labels?.[key] || key).replace(/_/g, " ")}
          </span>
          <div className="flex-1 h-6 bg-zinc-800/50 rounded-md overflow-hidden relative">
            <div
              className={`h-full rounded-md transition-all duration-500 ${colors?.[key] || "bg-purple-500"}`}
              style={{ width: `${Math.max((value / max) * 100, 2)}%`, opacity: 0.8 }}
            />
            <span className="absolute inset-y-0 right-2 flex items-center text-[11px] text-zinc-300 font-mono">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const ring = score >= 80 ? "border-emerald-500/30" : score >= 50 ? "border-amber-500/30" : "border-red-500/30";

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${ring} bg-zinc-900/50`}>
      <span className={`text-4xl font-bold ${color}`}>{score}%</span>
      <span className="text-xs text-zinc-500 mt-1">{label}</span>
    </div>
  );
}

interface TrendsData {
  query: string;
  trend: string;
  currentInterest: number;
  peakInterest: number;
  data: Array<{ date: string; value: number }>;
}

interface RelatedData {
  top: Array<{ query: string; value: number }>;
  rising: Array<{ query: string; value: number }>;
}

function TrendsSection() {
  const [trendsQuery, setTrendsQuery] = useState("productos digitales");
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [related, setRelated] = useState<RelatedData | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);

  const fetchTrends = async () => {
    setTrendsLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        fetch(`/api/trends?q=${encodeURIComponent(trendsQuery)}`),
        fetch(`/api/trends?related=${encodeURIComponent(trendsQuery)}`),
      ]);
      const tData = await tRes.json();
      const rData = await rRes.json();
      if (tData.type === "interest_over_time") setTrends(tData);
      if (rData.type === "related_queries") setRelated(rData.data);
    } catch { /* ignore */ }
    setTrendsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={trendsQuery}
          onChange={e => setTrendsQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchTrends()}
          placeholder="Buscar en Google Trends..."
          className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
        <button
          onClick={fetchTrends}
          disabled={trendsLoading}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
        >
          {trendsLoading ? "..." : "Buscar"}
        </button>
      </div>

      {trends && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-xs text-zinc-500">Tendencia</span>
            <p className={`text-xl font-bold mt-1 ${
              trends.trend === "subiendo" ? "text-emerald-400" : trends.trend === "estable" ? "text-amber-400" : "text-red-400"
            }`}>
              {trends.trend === "subiendo" ? "Subiendo" : trends.trend === "estable" ? "Estable" : "Bajando"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-xs text-zinc-500">Interes actual</span>
            <p className="text-xl font-bold mt-1">{trends.currentInterest} <span className="text-zinc-600 text-sm">/ 100</span></p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-xs text-zinc-500">Pico</span>
            <p className="text-xl font-bold mt-1">{trends.peakInterest}</p>
          </div>
        </div>
      )}

      {trends && trends.data.length > 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Interes en el tiempo — &ldquo;{trends.query}&rdquo;</h3>
          <div className="flex items-end gap-[2px] h-32">
            {trends.data.slice(-60).map((point, i) => {
              const height = trends.peakInterest > 0 ? (point.value / trends.peakInterest) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-purple-500/60 rounded-t-sm hover:bg-purple-400/80 transition-colors"
                  style={{ height: `${Math.max(height, 1)}%` }}
                  title={`${point.date}: ${point.value}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
            <span>{trends.data.slice(-60)[0]?.date}</span>
            <span>{trends.data[trends.data.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {related && (related.top.length > 0 || related.rising.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {related.top.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Queries top</h3>
              <div className="space-y-1.5">
                {related.top.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 truncate mr-2">{q.query}</span>
                    <span className="text-zinc-600 font-mono">{q.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {related.rising.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Queries en crecimiento</h3>
              <div className="space-y-1.5">
                {related.rising.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 truncate mr-2">{q.query}</span>
                    <span className="text-emerald-500/70 font-mono">+{q.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!trends && !trendsLoading && (
        <p className="text-xs text-zinc-600 text-center py-4">Busca un keyword para ver su tendencia en Google Trends (Argentina)</p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "diversity" | "performance" | "gaps" | "trends" | "matriz" | "miner" | "competencia">("overview");

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-red-400">Error cargando analytics</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">{data.total} guiones generados</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-zinc-900/50 rounded-xl w-fit overflow-x-auto">
        {(["overview", "diversity", "performance", "gaps", "trends", "matriz", "miner", "competencia"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "overview" ? "General" : t === "diversity" ? "Diversidad" : t === "performance" ? "Performance" : t === "gaps" ? "Gaps" : t === "trends" ? "Trends" : t === "matriz" ? "Matriz 3D" : t === "miner" ? "Miner" : "Competencia"}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {data.saturationAlerts.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <h3 className="text-sm font-medium text-red-400 mb-2">Alertas de saturacion</h3>
          {data.saturationAlerts.map((alert, i) => (
            <p key={i} className="text-xs text-red-400/70">{alert}</p>
          ))}
        </div>
      )}

      {tab === "overview" && (
        <div className="space-y-8">
          {/* Status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status} className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || "bg-zinc-500"}`} />
                  <span className="text-xs text-zinc-500 capitalize">{status}</span>
                </div>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            ))}
          </div>

          {/* Angle families */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
            <h2 className="text-lg font-semibold mb-4">Familias de angulo</h2>
            <BarChart data={data.byAngleFamily} colors={FAMILY_COLORS} labels={FAMILY_LABELS} />
          </div>

          {/* Body types */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
            <h2 className="text-lg font-semibold mb-4">Tipos de cuerpo</h2>
            <BarChart data={data.byBodyType} />
          </div>

          {/* Frameworks */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
              <h2 className="text-lg font-semibold mb-4">Frameworks</h2>
              <BarChart data={data.byFramework} />
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
              <h2 className="text-lg font-semibold mb-4">Tipos de hook</h2>
              <BarChart data={data.byHookType} />
            </div>
          </div>
        </div>
      )}

      {tab === "diversity" && (
        <div className="space-y-8">
          {/* Diversity score */}
          <div className="grid md:grid-cols-3 gap-6">
            <ScoreGauge score={data.diversityScore.score} label="Score de diversidad" />
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04] flex flex-col justify-center">
              <p className="text-sm text-zinc-400">Familias de angulo (ultimos 10)</p>
              <p className="text-2xl font-bold mt-1">
                {data.diversityScore.angleFamilies} <span className="text-zinc-600 text-lg">/ {data.diversityScore.angleFamiliesMax}</span>
              </p>
              <p className="text-xs text-zinc-600 mt-1">Objetivo: 5 de 5</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04] flex flex-col justify-center">
              <p className="text-sm text-zinc-400">Tipos de cuerpo (ultimos 10)</p>
              <p className="text-2xl font-bold mt-1">
                {data.diversityScore.bodyTypes} <span className="text-zinc-600 text-lg">/ {data.diversityScore.bodyTypesMax}</span>
              </p>
              <p className="text-xs text-zinc-600 mt-1">Objetivo: 5+ de 10</p>
            </div>
          </div>

          {/* Timeline - last 10 scripts as colored dots */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
            <h2 className="text-lg font-semibold mb-4">Ultimos 10 guiones — familia de angulo</h2>
            <div className="flex gap-2 items-end">
              {data.timeline.slice(-10).map((item, i) => (
                <div key={item.id} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-full aspect-square rounded-lg ${FAMILY_COLORS[item.angleFamily] || "bg-zinc-600"}`}
                    style={{ opacity: 0.8 }}
                    title={`${item.title || "Sin titulo"}\n${item.angleFamily}`}
                  />
                  <span className="text-[9px] text-zinc-600 text-center leading-tight">
                    {(FAMILY_LABELS[item.angleFamily] || item.angleFamily).slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-zinc-800/50">
              {Object.entries(FAMILY_COLORS).filter(([k]) => k !== "sin_clasificar").map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${color}`} style={{ opacity: 0.8 }} />
                  <span className="text-[10px] text-zinc-500">{FAMILY_LABELS[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Venta del modelo distribution */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
            <h2 className="text-lg font-semibold mb-4">Venta del modelo</h2>
            <BarChart data={data.byModelSale} />
          </div>
        </div>
      )}

      {tab === "performance" && (
        <div className="space-y-8">
          {data.withMetrics.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/[0.04] text-center">
              <p className="text-zinc-500 mb-2">Sin datos de performance todavia</p>
              <p className="text-xs text-zinc-600">
                Marca guiones como &ldquo;Winner&rdquo; y carga metricas (CTR, Hook Rate, CPA) en Post-Sesion para ver patrones aca.
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
                <h2 className="text-lg font-semibold mb-4">Guiones con metricas</h2>
                <div className="space-y-3">
                  {data.withMetrics.map(item => (
                    <a
                      key={item.id}
                      href={`/scripts/${item.id}`}
                      className="block p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.title || item.id.slice(0, 8)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.status === "winner" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-400"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-zinc-500">
                        {item.metrics.ctr != null && <span>CTR: <strong className="text-zinc-300">{item.metrics.ctr}%</strong></span>}
                        {item.metrics.hookRate != null && <span>Hook: <strong className="text-zinc-300">{item.metrics.hookRate}%</strong></span>}
                        {item.metrics.cpa != null && <span>CPA: <strong className="text-zinc-300">${item.metrics.cpa}</strong></span>}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${FAMILY_COLORS[item.angleFamily] || "bg-zinc-600"} bg-opacity-20 text-zinc-400`}>
                          {item.angleFamily}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                          {item.bodyType.replace(/_/g, " ")}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Winners summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
              <span className="text-xs text-zinc-500">Winners</span>
              <p className="text-2xl font-bold text-emerald-400">{data.winners}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
              <span className="text-xs text-zinc-500">Grabados</span>
              <p className="text-2xl font-bold text-amber-400">{data.recorded}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
              <span className="text-xs text-zinc-500">Tasa de grabacion</span>
              <p className="text-2xl font-bold">{data.total > 0 ? Math.round((data.recorded / data.total) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      )}

      {tab === "gaps" && (
        <div className="space-y-8">
          {/* Unused combos */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
            <h2 className="text-lg font-semibold mb-2">Combinaciones sin probar</h2>
            <p className="text-xs text-zinc-500 mb-4">
              Familia de angulo x Tipo de cuerpo que nunca se usaron juntos. Priorizar estas para testear.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.unusedCombos.map((combo, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {combo.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-4">
              {data.unusedCombos.length} de 40 combinaciones sin probar
            </p>
          </div>

          {/* Visual format distribution */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04]">
            <h2 className="text-lg font-semibold mb-4">Formatos visuales</h2>
            <BarChart data={data.byVisualFormat} />
          </div>
        </div>
      )}

      {tab === "trends" && (
        <TrendsSection />
      )}

      {tab === "matriz" && (
        <MatrixView />
      )}

      {tab === "miner" && (
        <MinerView />
      )}

      {tab === "competencia" && (
        <CompetitorsView />
      )}
    </div>
  );
}
