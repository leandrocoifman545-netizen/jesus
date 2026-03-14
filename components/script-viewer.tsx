"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ScriptOutput } from "@/lib/ai/schemas/script-output";
import { resolveFormatLabel } from "@/lib/ai/schemas/script-output";
import InlineEdit from "./inline-edit";
import { useToast } from "./toast";
import CopyButton from "./copy-button";

const HOOK_TYPE_LABELS: Record<string, string> = {
  situacion_especifica: "Situación",
  dato_concreto: "Dato Concreto",
  pregunta_incomoda: "Pregunta",
  confesion: "Confesión",
  contraintuitivo: "Contraintuitivo",
  provocacion: "Provocación",
  historia_mini: "Historia Mini",
  analogia: "Analogía",
  negacion_directa: "Negación",
  observacion_tendencia: "Tendencia",
  timeline_provocacion: "Timeline",
  contrato_compromiso: "Contrato",
  actuacion_dialogo: "Diálogo",
  anti_publico: "Anti-público",
  // Legacy English types (for old data)
  curiosity_gap: "Curiosity Gap",
  contrarian: "Contrarian",
  question: "Pregunta",
  statistical: "Estadística",
  pain_point: "Pain Point",
  pattern_interrupt: "Pattern Interrupt",
  reveal_teaser: "Reveal / Teaser",
  authority_social_proof: "Social Proof",
};

const HOOK_TYPE_COLORS: Record<string, string> = {
  situacion_especifica: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  dato_concreto: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pregunta_incomoda: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confesion: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  contraintuitivo: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  provocacion: "bg-red-500/10 text-red-400 border-red-500/20",
  historia_mini: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  analogia: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  negacion_directa: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  observacion_tendencia: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  timeline_provocacion: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  contrato_compromiso: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  actuacion_dialogo: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  anti_publico: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  curiosity_gap: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  contrarian: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  question: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  statistical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pain_point: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  pattern_interrupt: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reveal_teaser: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  authority_social_proof: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function formatFullScript(script: ScriptOutput, hookIndex: number): string {
  const hook = script.hooks[hookIndex];
  let text = `GUION - ${resolveFormatLabel(script.platform_adaptation.platform)} (${script.total_duration_seconds}s) | ~${script.word_count} palabras\n`;
  text += `Framework: ${script.development.framework_used} | Arco emocional: ${script.development.emotional_arc}\n`;
  text += `=`.repeat(70) + "\n\n";

  text += `HOOK (Variante ${hook.variant_number} - ${HOOK_TYPE_LABELS[hook.hook_type] || hook.hook_type})\n`;
  text += `-`.repeat(50) + "\n";
  text += `Tiempo: 0-${hook.timing_seconds}s\n`;
  text += `"${hook.script_text}"\n\n`;

  text += `DESARROLLO\n`;
  text += `-`.repeat(50) + "\n";
  let accTime = hook.timing_seconds;
  for (const section of script.development.sections) {
    const isRehook = section.is_rehook ? " [RE-HOOK]" : "";
    text += `[${section.section_name}${isRehook}] (${accTime}-${accTime + section.timing_seconds}s)\n`;
    text += `"${section.script_text}"\n\n`;
    accTime += section.timing_seconds;
  }

  if (script.offer_bridge) {
    text += `PUENTE A LA OFERTA (${script.offer_bridge.product_type === "webinar_gratis" ? "Webinar Gratis" : script.offer_bridge.product_type === "taller_5" ? "Taller $5" : "Custom"})\n`;
    text += `-`.repeat(50) + "\n";
    text += `[${accTime}-${accTime + script.offer_bridge.timing_seconds}s]\n`;
    text += `"${script.offer_bridge.script_text}"\n\n`;
    accTime += script.offer_bridge.timing_seconds;
  }

  text += `CTA\n`;
  text += `-`.repeat(50) + "\n";
  if (script.cta) {
    const ctaEnd = (script.cta.timing_seconds || 0);
    text += `Tiempo: ${accTime}-${accTime + ctaEnd}s\n`;
    text += `"${script.cta.verbal_cta || '[CTA genérico — se pega en edición]'}"\n`;
    text += `Razon: ${script.cta.reason_why || '-'}\n`;
    text += `Tipo: ${script.cta.cta_type || '-'}\n`;
  } else {
    text += `[CTA genérico — se pega en edición]\n`;
  }

  if (script.ingredients_used && script.ingredients_used.length > 0) {
    text += `\nINGREDIENTES USADOS\n`;
    text += `-`.repeat(50) + "\n";
    for (const ing of script.ingredients_used) {
      text += `${ing.category}#${ing.ingredient_number} ${ing.ingredient_name}\n`;
    }
  }

  if (script.model_sale_type) {
    text += `\nVENTA DEL MODELO: ${script.model_sale_type.replace(/_/g, ' ')}\n`;
  }

  if (script.angle_family || script.body_type) {
    text += `\nCLASIFICACION\n`;
    text += `-`.repeat(50) + "\n";
    if (script.angle_family) text += `Familia: ${script.angle_family.replace(/_/g, ' ')}\n`;
    if (script.angle_specific) text += `Angulo: ${script.angle_specific.replace(/_/g, ' ')}\n`;
    if (script.body_type) text += `Tipo de cuerpo: ${script.body_type.replace(/_/g, ' ')}\n`;
  }

  return text;
}

function RegenButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={loading}
      title={label || "Regenerar"}
      className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-purple-400 disabled:text-zinc-700 transition-colors"
    >
      {loading ? (
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
        </svg>
      )}
    </button>
  );
}

type GenerationStatus = "draft" | "confirmed" | "recorded" | "winner";

const STATUS_CONFIG: Record<GenerationStatus, { label: string; next: GenerationStatus; color: string }> = {
  draft: { label: "Borrador", next: "confirmed", color: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800" },
  confirmed: { label: "Confirmado", next: "recorded", color: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15" },
  recorded: { label: "Grabado", next: "winner", color: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15" },
  winner: { label: "Winner", next: "draft", color: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15" },
};

interface WinnerMetrics {
  ctr?: number;
  hookRate?: number;
  holdRate?: number;
  cpa?: number;
  roas?: number;
  notes?: string;
  bestLeadIndex?: number;
  recordedAt?: string;
}

export default function ScriptViewer({
  script: initialScript,
  generationId,
  initialTitle = "",
  initialStatus = "draft",
  initialMetrics,
  initialSessionNotes = "",
}: {
  script: ScriptOutput;
  generationId: string;
  initialTitle?: string;
  initialStatus?: GenerationStatus;
  initialMetrics?: WinnerMetrics;
  initialSessionNotes?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [script, setScript] = useState(initialScript);
  const [selectedHook, setSelectedHook] = useState(0);
  const [moreCount, setMoreCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [regenTarget, setRegenTarget] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialTitle);
  const [savingTitle, setSavingTitle] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>(initialStatus);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [metrics, setMetrics] = useState<WinnerMetrics>(initialMetrics || {});
  const [sessionNotes, setSessionNotes] = useState(initialSessionNotes);
  const [showMetrics, setShowMetrics] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  async function saveTitle(newTitle: string) {
    setSavingTitle(true);
    try {
      const res = await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, title: newTitle }),
      });
      if (!res.ok) throw new Error("Error");
      setTitle(newTitle);
      toast("Titulo guardado");
    } catch {
      toast("Error guardando titulo", "error");
    } finally {
      setSavingTitle(false);
      setEditingTitle(false);
    }
  }

  async function saveMetrics(newMetrics?: WinnerMetrics, newNotes?: string) {
    setSavingMeta(true);
    try {
      const body: Record<string, unknown> = { generationId };
      if (newMetrics) body.metrics = newMetrics;
      if (newNotes !== undefined) body.sessionNotes = newNotes;
      const res = await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error");
      toast("Metricas guardadas");
    } catch {
      toast("Error guardando", "error");
    } finally {
      setSavingMeta(false);
    }
  }

  async function changeStatus(newStatus: GenerationStatus) {
    if (newStatus === status) { setStatusOpen(false); return; }
    setStatusOpen(false);
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Error");
      setStatus(newStatus);
      toast(`Estado: ${STATUS_CONFIG[newStatus].label}`);
    } catch {
      toast("Error actualizando estado", "error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  const handleEdit = useCallback(async (path: string, value: string) => {
    const res = await fetch("/api/generate/edit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId, path, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setScript(data.script);
  }, [generationId]);

  async function handleRegenerate(target: "section" | "cta" | "hook", index?: number) {
    const key = `${target}-${index ?? ""}`;
    setRegenTarget(key);
    try {
      const res = await fetch("/api/generate/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, target, index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data.script);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error regenerando", "error");
    } finally {
      setRegenTarget(null);
    }
  }

  async function handleGenerateMore() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, count: moreCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScript((prev) => ({
        ...prev,
        hooks: [...prev.hooks, ...data.newHooks],
      }));
      setSelectedHook(script.hooks.length);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error generando hooks", "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Title */}
      <div>
        {editingTitle ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle(titleDraft);
                if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(title); }
              }}
              className="flex-1 bg-transparent border-b-2 border-purple-500/50 text-3xl font-bold tracking-tight text-white focus:outline-none py-1"
              placeholder="Ej: Crianza — Mamá/tiempo — Seg C"
            />
            <button
              onClick={() => saveTitle(titleDraft)}
              disabled={savingTitle}
              className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1"
            >
              {savingTitle ? "..." : "Guardar"}
            </button>
            <button
              onClick={() => { setEditingTitle(false); setTitleDraft(title); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <h1
            onClick={() => { setEditingTitle(true); setTitleDraft(title); }}
            className="text-4xl font-extrabold tracking-tight cursor-pointer hover:text-purple-300 transition-colors group"
            title="Click para editar titulo"
          >
            <span className={title ? "bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent" : "text-zinc-600"}>{title || "Guion sin titulo"}</span>
            <span className="text-zinc-700 text-xs italic ml-3 opacity-0 group-hover:opacity-100 transition-opacity">editar</span>
          </h1>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            disabled={updatingStatus}
            className={`text-xs rounded-xl px-4 py-1.5 border transition-colors flex items-center gap-1.5 ${STATUS_CONFIG[status].color} ${updatingStatus ? "opacity-50" : ""}`}
          >
            {updatingStatus ? "..." : STATUS_CONFIG[status].label}
            <svg className={`w-3 h-3 transition-transform ${statusOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-xl min-w-[140px]">
                {(["draft", "confirmed", "recorded", "winner"] as GenerationStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className={`w-full text-left text-xs px-4 py-2.5 transition-colors flex items-center gap-2 ${
                      s === status
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      s === "draft" ? "bg-zinc-500" : s === "confirmed" ? "bg-blue-400" : s === "recorded" ? "bg-green-400" : "bg-amber-400"
                    }`} />
                    {STATUS_CONFIG[s].label}
                    {s === "confirmed" && status === "draft" ? <span className="text-zinc-600 ml-auto">quema leads</span> : null}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {(status === "confirmed" || status === "recorded" || status === "winner") && (
          <>
            <span className="text-[10px] text-red-400/50">{script.hooks.length} leads quemados</span>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showMetrics ? "Ocultar metricas" : "Metricas + notas"}
            </button>
          </>
        )}
      </div>

      {/* Metrics panel (for recorded/winner) */}
      {showMetrics && (status === "confirmed" || status === "recorded" || status === "winner") && (
        <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800/40 rounded-3xl p-7 space-y-5">
          <h3 className="text-xs font-semibold text-zinc-400">Metricas de rendimiento</h3>
          <div className="grid grid-cols-5 gap-2">
            {([
              ["CTR %", "ctr"],
              ["Hook Rate %", "hookRate"],
              ["Hold Rate %", "holdRate"],
              ["CPA $", "cpa"],
              ["ROAS x", "roas"],
            ] as const).map(([label, key]) => (
              <div key={key}>
                <label className="text-[10px] text-zinc-500 block mb-1">{label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={metrics[key] ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                    setMetrics((prev) => ({ ...prev, [key]: val }));
                  }}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10"
                  placeholder="-"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Mejor lead (cual funco mejor?)</label>
            <div className="flex gap-1 flex-wrap">
              {script.hooks.map((hook, i) => (
                <button
                  key={i}
                  onClick={() => setMetrics((prev) => ({ ...prev, bestLeadIndex: i }))}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    metrics.bestLeadIndex === i
                      ? "bg-gradient-to-r from-purple-600 to-violet-600 border-purple-500 text-white"
                      : "border-zinc-700/50 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  #{hook.variant_number}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Notas de la sesion</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 resize-none focus:outline-none focus:border-purple-500"
              rows={2}
              placeholder="Ej: El lead 2 de POV genero mucho engagement. Jesus lo grabo en 1 toma."
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Notas de metricas</label>
            <textarea
              value={metrics.notes || ""}
              onChange={(e) => setMetrics((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 resize-none focus:outline-none focus:border-purple-500"
              rows={2}
              placeholder="Ej: CTR alto pero CPA caro, iterar con otro formato"
            />
          </div>
          <button
            onClick={() => saveMetrics(metrics, sessionNotes)}
            disabled={savingMeta}
            className="text-xs bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white px-4 py-1.5 rounded-xl transition-all"
          >
            {savingMeta ? "Guardando..." : "Guardar metricas y notas"}
          </button>
        </div>
      )}

      {/* Platform Info + Emotional Arc */}
      <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-3xl p-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-300">Formato</h2>
          <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">
            {script.total_duration_seconds}s | ~{script.word_count} palabras | {script.development.framework_used}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Formato</span>
            <p className="text-zinc-200">{resolveFormatLabel(script.platform_adaptation.platform)}</p>
          </div>
          <div>
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Estilo</span>
            <p className="text-zinc-200">{script.platform_adaptation.content_style}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Consideraciones</span>
            <p className="text-zinc-200">{script.platform_adaptation.key_considerations}</p>
          </div>
          <div>
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Arco Emocional</span>
            <p className="text-purple-300 font-medium">{script.development.emotional_arc}</p>
          </div>
        </div>
        {script.visual_format && (
          <div className="mt-4 border-l-2 border-purple-500/30 pl-4 ml-1 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Formato Visual</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Nivel {script.visual_format.difficulty_level}/5
              </span>
            </div>
            <p className="text-white text-sm font-medium">{script.visual_format.format_name}</p>
            <p className="text-zinc-400 text-xs mt-1">{script.visual_format.setup_instructions}</p>
            {script.visual_format.recording_notes && (
              <p className="text-zinc-500 text-xs mt-1 italic">{script.visual_format.recording_notes}</p>
            )}
          </div>
        )}
        {script.ingredients_used && script.ingredients_used.length > 0 && (
          <div className="mt-4 border-l-2 border-amber-500/30 pl-4 ml-1 pt-2">
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Ingredientes usados</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {script.ingredients_used.map((ing, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {ing.category}#{ing.ingredient_number} {ing.ingredient_name}
                </span>
              ))}
            </div>
          </div>
        )}
        {script.model_sale_type && (
          <div className="mt-4 border-l-2 border-emerald-500/30 pl-4 ml-1 pt-2">
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Venta del modelo</span>
            <div className="mt-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {script.model_sale_type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}
        {(script.angle_family || script.body_type) && (
          <div className="mt-4 border-l-2 border-blue-500/30 pl-4 ml-1 pt-2">
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Clasificacion</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {script.angle_family && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Fam: {script.angle_family.replace(/_/g, ' ')}
                </span>
              )}
              {script.angle_specific && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400/70 border border-blue-500/20">
                  {script.angle_specific.replace(/_/g, ' ')}
                </span>
              )}
              {script.body_type && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Cuerpo: {script.body_type.replace(/_/g, ' ')}
                </span>
              )}
              {script.segment && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Seg: {script.segment}
                </span>
              )}
              {script.niche && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {script.niche}
                </span>
              )}
              {script.funnel_stage && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  {script.funnel_stage}
                </span>
              )}
            </div>
          </div>
        )}
        {script.belief_change && (
          <div className="mt-4 border-l-2 border-orange-500/30 pl-4 ml-1 pt-2">
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Cambio de creencia</span>
            <div className="mt-2 space-y-1 text-[12px]">
              <div className="text-red-400/80"><span className="text-zinc-600">Antes:</span> {script.belief_change.old_belief}</div>
              <div className="text-zinc-500"><span className="text-zinc-600">Mecanismo:</span> {script.belief_change.mechanism}</div>
              <div className="text-green-400/80"><span className="text-zinc-600">Después:</span> {script.belief_change.new_belief}</div>
            </div>
          </div>
        )}
      </div>

      {/* Hooks Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {script.hooks.length} Hook{script.hooks.length !== 1 ? "s" : ""}
          </h2>
          <CopyButton text={formatFullScript(script, selectedHook)} label="Copiar guion completo" />
        </div>

        {/* Scrollable hook selector */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {script.hooks.map((hook, i) => (
            <button
              key={i}
              onClick={() => setSelectedHook(i)}
              className={`border rounded-2xl p-4 text-left transition-all duration-300 shrink-0 w-44 hover-glow ${
                selectedHook === i
                  ? "border-purple-500/30 bg-purple-500/5 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/5"
                  : "bg-zinc-900/30 border-zinc-800/40 hover:border-zinc-700/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${selectedHook === i ? "text-purple-400" : "text-zinc-400"}`}>#{hook.variant_number}</span>
                <span className="text-[10px] text-zinc-600 font-medium">{hook.timing_seconds}s</span>
              </div>
              <span
                className={`badge ${
                  HOOK_TYPE_COLORS[hook.hook_type] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {HOOK_TYPE_LABELS[hook.hook_type] || hook.hook_type}
              </span>
              <p className="text-[11px] text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                &ldquo;{hook.script_text}&rdquo;
              </p>
            </button>
          ))}

          {/* Generate More button inline */}
          <div className="border border-dashed border-zinc-700/20 rounded-2xl p-4 shrink-0 w-44 flex flex-col items-center justify-center gap-2.5 hover:border-purple-500/20 hover:bg-purple-500/[0.02] transition-all duration-300">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMoreCount(Math.max(1, moreCount - 1))}
                className="text-zinc-600 hover:text-zinc-400 text-xs w-5 h-5 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-sm font-bold text-zinc-400 w-5 text-center">{moreCount}</span>
              <button
                type="button"
                onClick={() => setMoreCount(Math.min(10, moreCount + 1))}
                className="text-zinc-600 hover:text-zinc-400 text-xs w-5 h-5 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              onClick={handleGenerateMore}
              disabled={generating}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:text-zinc-600 transition-colors"
            >
              {generating ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </span>
              ) : (
                `+ ${moreCount} hooks`
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Script Flow */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-5 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Guion</h2>
        <div className="space-y-4">
          {/* Hook row */}
          {(() => {
            const hook = script.hooks[selectedHook];
            if (!hook) return null;
            return (
              <div key={selectedHook} className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-6 animate-content-swap">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-purple-400">HOOK #{hook.variant_number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${HOOK_TYPE_COLORS[hook.hook_type] || ""}`}>{HOOK_TYPE_LABELS[hook.hook_type]}</span>
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">0-{hook.timing_seconds}s</span>
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 text-[10px] text-zinc-600">{hook.script_text.trim().split(/\s+/).length} palabras</span>
                  <RegenButton
                    onClick={() => handleRegenerate("hook", selectedHook)}
                    loading={regenTarget === `hook-${selectedHook}`}
                  />
                </div>
                <InlineEdit
                  value={hook.script_text}
                  onSave={(v) => handleEdit(`hooks.${selectedHook}.script_text`, v)}
                  className="text-zinc-200 text-sm"
                />
              </div>
            );
          })()}

          {/* Development sections */}
          {(() => {
            let accTime = script.hooks[selectedHook]?.timing_seconds || 0;
            return script.development.sections.map((section, i) => {
              const startTime = accTime;
              accTime += section.timing_seconds;
              const isRehook = section.is_rehook;
              return (
                <div
                  key={i}
                  className={`border rounded-2xl p-6 ${
                    isRehook
                      ? "bg-amber-500/5 border-amber-500/15"
                      : "bg-zinc-900/30 border-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`uppercase tracking-wider text-[11px] font-semibold ${isRehook ? "text-amber-400" : "text-zinc-400"}`}>
                      {section.section_name}
                    </span>
                    <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">{startTime}-{accTime}s</span>
                    <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 text-[10px] text-zinc-600">{section.script_text.trim().split(/\s+/).length} palabras</span>
                    <RegenButton
                      onClick={() => handleRegenerate("section", i)}
                      loading={regenTarget === `section-${i}`}
                    />
                  </div>
                  <InlineEdit
                    value={section.script_text}
                    onSave={(v) => handleEdit(`development.sections.${i}.script_text`, v)}
                    className="text-zinc-200 text-sm"
                  />
                </div>
              );
            });
          })()}

          {/* Offer Bridge */}
          {script.offer_bridge && (() => {
            const bridgeStart = script.development.sections.reduce(
              (sum, s) => sum + s.timing_seconds,
              script.hooks[selectedHook]?.timing_seconds || 0
            );
            return (
              <div className="bg-teal-500/5 border border-teal-500/15 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-teal-400">PUENTE A LA OFERTA</span>
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">{bridgeStart}-{bridgeStart + script.offer_bridge.timing_seconds}s</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {script.offer_bridge.product_type === "webinar_gratis" ? "Webinar Gratis" : script.offer_bridge.product_type === "taller_5" ? "Taller $5" : "Custom"}
                  </span>
                </div>
                <InlineEdit
                  value={script.offer_bridge.script_text}
                  onSave={(v) => handleEdit("offer_bridge.script_text", v)}
                  className="text-zinc-200 text-sm"
                />
              </div>
            );
          })()}

          {/* CTA */}
          {(() => {
            const devTotal = script.development.sections.reduce(
              (sum, s) => sum + s.timing_seconds,
              script.hooks[selectedHook]?.timing_seconds || 0
            ) + (script.offer_bridge?.timing_seconds || 0);
            const cta = script.cta;
            const ctaTiming = cta?.timing_seconds || 0;
            const ctaVerbal = cta?.verbal_cta || '[CTA genérico — se pega en edición]';
            const ctaType = cta?.cta_type || '-';
            const ctaReason = cta?.reason_why || '';
            return (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-emerald-400">CTA</span>
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">{devTotal}-{devTotal + ctaTiming}s</span>
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 text-[10px] text-zinc-600">{ctaVerbal.trim().split(/\s+/).length} palabras</span>
                  <span className="text-[10px] text-zinc-600">({ctaType})</span>
                  <RegenButton
                    onClick={() => handleRegenerate("cta")}
                    loading={regenTarget === "cta-"}
                  />
                </div>
                <InlineEdit
                  value={ctaVerbal}
                  onSave={(v) => handleEdit("cta.verbal_cta", v)}
                  className="text-zinc-200 text-sm"
                />
                {ctaReason && <p className="text-zinc-500 text-xs mt-1 italic">{ctaReason}</p>}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Copy Buttons */}
      <div className="flex flex-wrap gap-2">
        {script.hooks.map((hook, i) => (
          <CopyButton
            key={i}
            text={formatFullScript(script, i)}
            label={`Copiar con Hook #${hook.variant_number}`}
            className="bg-zinc-900/30 border border-zinc-800/40 hover:bg-zinc-800/50 hover:border-zinc-700/50 rounded-xl px-4 py-2 text-xs text-zinc-400 hover:text-white transition-all duration-200"
          />
        ))}
      </div>
    </div>
  );
}
