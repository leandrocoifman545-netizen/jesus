"use client";

import { useEffect, useState } from "react";

const FAMILY_LABELS: Record<string, string> = {
  identidad: "Identidad",
  oportunidad: "Oportunidad",
  confrontacion: "Confrontación",
  mecanismo: "Mecanismo",
  historia: "Historia",
};

const FAMILY_COLORS: Record<string, string> = {
  identidad: "bg-blue-500",
  oportunidad: "bg-emerald-500",
  confrontacion: "bg-red-500",
  mecanismo: "bg-amber-500",
  historia: "bg-purple-500",
};

const ARC_LABELS: Record<string, string> = {
  revelacion_oportunidad: "Revelación",
  dolor_esperanza: "Dolor→Esperanza",
  confrontacion_directa: "Confrontación",
  historia_personal: "Historia",
  pregunta_tras_pregunta: "Pregunta×Pregunta",
  analogia: "Analogía",
  futuro_sensorial: "Futuro Sensorial",
  provocacion_evidencia: "Provocación+Evidencia",
};

const SEG_COLORS: Record<string, string> = {
  A: "bg-sky-400",
  B: "bg-amber-400",
  C: "bg-pink-400",
  D: "bg-emerald-400",
};

const SEG_LABELS: Record<string, string> = {
  A: "Jóvenes",
  B: "Freelancers",
  C: "Mamás",
  D: "Todos/+50",
};

interface MatrixData {
  flatMatrix: Record<string, Record<string, { total: number; bySegment: Record<string, number> }>>;
  matrix: Record<string, Record<string, Record<string, string[]>>>;
  genSummaries: Record<string, { title?: string; status?: string }>;
  stats: {
    totalGenerations: number;
    totalCells: number;
    filledCells: number;
    emptyCells: number;
    saturatedCells: number;
    coveragePercent: number;
  };
  gaps: Array<{ family: string; arc: string; segment: string }>;
  hotspots: Array<{ family: string; arc: string; segment: string; count: number }>;
}

type ViewMode = "flat" | "gaps";

export default function MatrixPage() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("flat");
  const [segFilter, setSegFilter] = useState<string>("all");
  const [tooltip, setTooltip] = useState<{ family: string; arc: string; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch("/api/matrix")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Cargando matriz...</div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-zinc-950 p-8 text-red-400">Error cargando datos</div>;

  const families = Object.keys(data.flatMatrix);
  const arcs = Object.keys(data.flatMatrix[families[0]] || {});

  function getCellValue(family: string, arc: string): number {
    if (segFilter === "all") return data!.flatMatrix[family]?.[arc]?.total || 0;
    return data!.flatMatrix[family]?.[arc]?.bySegment[segFilter] || 0;
  }

  function getCellColor(count: number): string {
    if (count === 0) return "bg-zinc-800/30 border-dashed border-zinc-700/50";
    if (count === 1) return "bg-purple-500/15 border-purple-500/30";
    if (count === 2) return "bg-purple-500/30 border-purple-500/40";
    return "bg-purple-500/50 border-purple-500/60";
  }

  function getSegmentDots(family: string, arc: string) {
    const cell = data!.flatMatrix[family]?.[arc];
    if (!cell) return null;
    return (
      <div className="flex gap-0.5 mt-1">
        {["A", "B", "C", "D"].map((seg) => (
          <div
            key={seg}
            className={`w-2 h-2 rounded-sm ${cell.bySegment[seg] > 0 ? SEG_COLORS[seg] : "bg-zinc-700/50"}`}
            title={`Seg ${seg}: ${cell.bySegment[seg] || 0}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Matriz 3D de Ángulos</h1>
            <p className="text-sm text-zinc-500 mt-1">Perspectiva × Emoción × Segmento — encontrá los huecos</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Guiones" value={data.stats.totalGenerations} />
          <StatCard label="Cobertura" value={`${data.stats.coveragePercent}%`} color={data.stats.coveragePercent > 30 ? "text-emerald-400" : "text-amber-400"} />
          <StatCard label="Celdas cubiertas" value={data.stats.filledCells} sub={`de ${data.stats.totalCells}`} />
          <StatCard label="Gaps" value={data.stats.emptyCells} color="text-amber-400" />
          <StatCard label="Saturadas (3+)" value={data.stats.saturatedCells} color="text-red-400" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex rounded-xl bg-zinc-900/50 border border-white/[0.04] p-1">
            <button
              onClick={() => setView("flat")}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all ${view === "flat" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Matriz
            </button>
            <button
              onClick={() => setView("gaps")}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all ${view === "gaps" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Gaps
            </button>
          </div>

          <select
            value={segFilter}
            onChange={(e) => setSegFilter(e.target.value)}
            className="bg-zinc-900/50 border border-white/[0.04] rounded-xl px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">Todos los segmentos</option>
            <option value="A">Seg A — {SEG_LABELS.A}</option>
            <option value="B">Seg B — {SEG_LABELS.B}</option>
            <option value="C">Seg C — {SEG_LABELS.C}</option>
            <option value="D">Seg D — {SEG_LABELS.D}</option>
          </select>

          {/* Segment legend */}
          <div className="hidden md:flex items-center gap-3 ml-auto text-xs text-zinc-500">
            {["A", "B", "C", "D"].map((seg) => (
              <div key={seg} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${SEG_COLORS[seg]}`} />
                <span>{seg} {SEG_LABELS[seg]}</span>
              </div>
            ))}
          </div>
        </div>

        {view === "flat" ? (
          /* ---- MATRIX VIEW ---- */
          <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.04] p-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs text-zinc-500 font-normal pb-4 pr-4 w-32">Perspectiva ↓ / Emoción →</th>
                  {arcs.map((arc) => (
                    <th key={arc} className="text-center text-[11px] text-zinc-400 font-normal pb-4 px-1">
                      <div className="writing-mode-normal">{ARC_LABELS[arc] || arc}</div>
                    </th>
                  ))}
                  <th className="text-center text-xs text-zinc-500 font-normal pb-4 pl-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {families.map((fam) => {
                  const rowTotal = arcs.reduce((sum, arc) => sum + getCellValue(fam, arc), 0);
                  return (
                    <tr key={fam}>
                      <td className="pr-4 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${FAMILY_COLORS[fam] || "bg-zinc-600"}`} />
                          <span className="text-sm text-zinc-300">{FAMILY_LABELS[fam] || fam}</span>
                        </div>
                      </td>
                      {arcs.map((arc) => {
                        const count = getCellValue(fam, arc);
                        return (
                          <td key={arc} className="px-1 py-1.5">
                            <div
                              className={`relative border rounded-lg p-2 min-h-[52px] flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getCellColor(count)}`}
                              onMouseEnter={(e) => setTooltip({ family: fam, arc, x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                            >
                              {count === 0 ? (
                                <span className="text-zinc-600 text-lg">+</span>
                              ) : (
                                <span className="text-sm font-mono text-zinc-200">{count}</span>
                              )}
                              {segFilter === "all" && getSegmentDots(fam, arc)}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center text-sm font-mono text-zinc-400 pl-3">{rowTotal}</td>
                    </tr>
                  );
                })}
                {/* Column totals */}
                <tr>
                  <td className="pt-3 pr-4 text-xs text-zinc-500">Total</td>
                  {arcs.map((arc) => {
                    const colTotal = families.reduce((sum, fam) => sum + getCellValue(fam, arc), 0);
                    return (
                      <td key={arc} className="text-center text-sm font-mono text-zinc-500 pt-3">{colTotal}</td>
                    );
                  })}
                  <td className="text-center text-sm font-mono text-zinc-300 pt-3 pl-3">
                    {families.reduce((sum, fam) => sum + arcs.reduce((s, arc) => s + getCellValue(fam, arc), 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* ---- GAPS VIEW ---- */
          <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.04] p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">
              {data.gaps.length} combinaciones sin cubrir — priorizá estas para máxima diversidad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-700/50 bg-zinc-800/20 px-4 py-3 hover:border-purple-500/30 transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${FAMILY_COLORS[gap.family] || "bg-zinc-600"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-300">
                      {FAMILY_LABELS[gap.family]} × {ARC_LABELS[gap.arc]}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Seg {gap.segment} — {SEG_LABELS[gap.segment]}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {data.hotspots.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-zinc-300 mt-8 mb-4">
                  Combinaciones saturadas (3+ guiones) — evitar repetir
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.hotspots.map((hot, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
                    >
                      <div className={`w-2 h-2 rounded-full ${FAMILY_COLORS[hot.family] || "bg-zinc-600"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-300">
                          {FAMILY_LABELS[hot.family]} × {ARC_LABELS[hot.arc]}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Seg {hot.segment} — {hot.count} guiones
                        </div>
                      </div>
                      <span className="text-xs text-red-400 font-mono">{hot.count}×</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl pointer-events-none text-sm"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <div className="font-medium text-zinc-200">
              {FAMILY_LABELS[tooltip.family]} × {ARC_LABELS[tooltip.arc]}
            </div>
            <div className="mt-1.5 space-y-0.5">
              {["A", "B", "C", "D"].map((seg) => {
                const ids = data.matrix[tooltip.family]?.[tooltip.arc]?.[seg] || [];
                return (
                  <div key={seg} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-sm ${ids.length > 0 ? SEG_COLORS[seg] : "bg-zinc-700"}`} />
                    <span className="text-zinc-400">Seg {seg}:</span>
                    <span className={ids.length > 0 ? "text-zinc-200" : "text-zinc-600"}>{ids.length}</span>
                    {ids.length > 0 && (
                      <span className="text-zinc-500 truncate max-w-[200px]">
                        {ids.map((id) => data.genSummaries[id]?.title?.slice(0, 30)).join(", ")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.04] p-4">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${color || "text-white"}`}>
        {value}
        {sub && <span className="text-sm text-zinc-500 font-normal ml-1">{sub}</span>}
      </div>
    </div>
  );
}
