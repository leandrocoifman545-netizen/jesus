"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ScriptOutput, CTABlock } from "@/lib/ai/schemas/script-output";
import { resolveFormatLabel } from "@/lib/ai/schemas/script-output";
import InlineEdit from "./inline-edit";
import { useToast } from "./toast";
import CopyButton from "./copy-button";

import { HOOK_TYPE_LABELS, HOOK_TYPE_COLORS } from "@/lib/constants/hook-types";

function formatFullScript(script: ScriptOutput, hookIndex: number): string {
  const hook = script.hooks[hookIndex];
  const platform = script.platform_adaptation?.platform ? resolveFormatLabel(script.platform_adaptation.platform) : 'N/A';
  let text = `GUION - ${platform} (${script.total_duration_seconds || '?'}s) | ~${script.word_count || '?'} palabras\n`;
  text += `Framework: ${script.development?.framework_used || 'N/A'} | Arco emocional: ${script.development?.emotional_arc || 'N/A'}\n`;
  text += `=`.repeat(70) + "\n\n";

  text += `HOOK (Variante ${hook?.variant_number || 1} - ${HOOK_TYPE_LABELS[hook?.hook_type] || (hook as any)?.hookType || 'lead'})\n`;
  text += `-`.repeat(50) + "\n";
  text += `Tiempo: 0-${hook?.timing_seconds || '?'}s\n`;
  text += `"${hook?.script_text || (hook as any)?.text || ''}"\n\n`;

  text += `DESARROLLO\n`;
  text += `-`.repeat(50) + "\n";
  let accTime = hook?.timing_seconds || 0;
  for (const section of script.development?.sections || []) {
    const isRehook = section.is_rehook ? " [RE-HOOK]" : "";
    const secName = section.section_name || (section as any).title || 'Sección';
    const secTime = section.timing_seconds || 0;
    text += `[${secName}${isRehook}] (${accTime}-${accTime + secTime}s)\n`;
    text += `"${section.script_text}"\n\n`;
    accTime += secTime;
  }

  if (script.offer_bridge && !script.cta_blocks?.length) {
    text += `PUENTE A LA OFERTA (${script.offer_bridge.product_type === "webinar_gratis" ? "Webinar Gratis" : script.offer_bridge.product_type === "taller_5" ? "Taller $5" : "Custom"})\n`;
    text += `-`.repeat(50) + "\n";
    text += `[${accTime}-${accTime + script.offer_bridge.timing_seconds}s]\n`;
    text += `"${script.offer_bridge.script_text}"\n\n`;
    accTime += script.offer_bridge.timing_seconds;
  }

  if (script.transition_text) {
    text += `TRANSICION (Capa 1)\n`;
    text += `-`.repeat(50) + "\n";
    text += `"${script.transition_text}"\n\n`;
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

  if (script.cta_blocks && script.cta_blocks.length > 0) {
    text += `\n3 BLOQUES CTA (Capas 2-6)\n`;
    text += `=`.repeat(70) + "\n\n";
    for (const block of script.cta_blocks) {
      const label = block.channel_label || block.channel || "CTA";
      text += `--- ${label} (${block.variant || ""}) ---\n`;
      if (block.layers) {
        text += `[OFERTA] "${block.layers.oferta}"\n`;
        text += `[PRUEBA] "${block.layers.prueba}"\n`;
        text += `[RIESGO CERO] "${block.layers.riesgo_cero}"\n`;
        text += `[URGENCIA] "${block.layers.urgencia}"\n`;
        text += `[ORDEN+NLP] "${block.layers.orden_nlp}"\n\n`;
      } else if (block.text) {
        text += `${block.text}\n\n`;
      }
    }
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
  initialHookApprovals = {},
  initialCopiesMatrix = null,
}: {
  script: ScriptOutput;
  generationId: string;
  initialTitle?: string;
  initialStatus?: GenerationStatus;
  initialMetrics?: WinnerMetrics;
  initialSessionNotes?: string;
  initialHookApprovals?: Record<number, "approved" | "rejected">;
  initialCopiesMatrix?: { generation_id: string; total_versions: number; diversity_warnings?: string[]; versions: { hook_index: number; hook_type: string; cta_channel: string; cta_label: string; version_name: string; headline: string; description: string; primary_text: string; word_count: number; structure_used: string }[] } | null;
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
  const [hookApprovals, setHookApprovals] = useState<Record<number, "approved" | "rejected">>(initialHookApprovals);
  const [showMetrics, setShowMetrics] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [adCopyLoading, setAdCopyLoading] = useState(false);
  const [adCopyResult, setAdCopyResult] = useState<{ title: string; copy_text: string; word_count: number } | null>(null);
  const [retargetingLoading, setRetargetingLoading] = useState(false);
  const [retargetingResult, setRetargetingResult] = useState<{ quadrants: { quadrant_label: string; hook: string; script_text: string; timing_seconds: number }[] } | null>(null);
  const [explodeLoading, setExplodeLoading] = useState(false);
  const [explodeResult, setExplodeResult] = useState<{ scripts_by_awareness: { awareness_level: number; awareness_label: string; hook: string; body_summary: string }[]; ad_copy_embudo: { copy_text: string }; retargeting_hooks: { quadrant: string; hook: string }[] } | null>(null);
  const [copiesMatrixLoading, setCopiesMatrixLoading] = useState(false);
  const [copiesMatrix, setCopiesMatrix] = useState<{ generation_id: string; total_versions: number; diversity_warnings?: string[]; versions: { hook_index: number; hook_type: string; cta_channel: string; cta_label: string; version_name: string; headline: string; description: string; primary_text: string; word_count: number; structure_used: string }[] } | null>(initialCopiesMatrix);
  const [copiesExpandedIdx, setCopiesExpandedIdx] = useState<number | null>(null);

  async function toggleHookApproval(index: number, value: "approved" | "rejected") {
    const next = { ...hookApprovals };
    if (next[index] === value) {
      delete next[index];
    } else {
      next[index] = value;
    }
    setHookApprovals(next);
    try {
      await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, hookApprovals: next }),
      });
    } catch { /* silent */ }
  }

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

      setScript((prev) => {
        const updated = { ...prev, hooks: [...prev.hooks, ...data.newHooks] };
        setSelectedHook(updated.hooks.length - 1);
        return updated;
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error generando hooks", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAdCopyEmbudo() {
    setAdCopyLoading(true);
    try {
      const res = await fetch("/api/generate/ad-copy-embudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdCopyResult(data.adCopy);
      toast("Ad Copy Embudo generado");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error generando ad copy", "error");
    } finally {
      setAdCopyLoading(false);
    }
  }

  async function handleCopiesMatrix() {
    setCopiesMatrixLoading(true);
    try {
      const res = await fetch("/api/generate/ad-copies-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCopiesMatrix(data);
      toast(`${data.total_versions} copies generados`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error generando copies", "error");
    } finally {
      setCopiesMatrixLoading(false);
    }
  }

  async function handleRetargeting() {
    setRetargetingLoading(true);
    try {
      const res = await fetch("/api/generate/retargeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRetargetingResult(data.pack);
      toast("Retargeting generado (4 cuadrantes)");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error generando retargeting", "error");
    } finally {
      setRetargetingLoading(false);
    }
  }

  async function handleExplodeAngle() {
    setExplodeLoading(true);
    try {
      const res = await fetch("/api/generate/explode-angle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angleFamily: script.angle_family || "oportunidad",
          angleSpecific: script.angle_specific || "",
          niche: script.niche || "",
          avatar: script.avatar || "martin",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExplodeResult(data.result);
      toast("Ángulo explotado (10 piezas)");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error explotando ángulo", "error");
    } finally {
      setExplodeLoading(false);
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

        {/* CSV Download — visible cuando hay copies */}
        {copiesMatrix && copiesMatrix.total_versions > 0 && (
          <a
            href={`/api/export/copies?generationId=${generationId}`}
            className="ml-auto px-4 py-1.5 text-xs rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV {copiesMatrix.total_versions} copies
          </a>
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
            {script.total_duration_seconds ? `${script.total_duration_seconds}s` : ''} {script.word_count ? `| ~${script.word_count} palabras` : ''} {script.development?.framework_used ? `| ${script.development.framework_used}` : ''}
          </span>
        </div>
        {script.platform_adaptation && (
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
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {script.platform_adaptation?.key_considerations && (
          <div>
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Consideraciones</span>
            <p className="text-zinc-200">{script.platform_adaptation.key_considerations}</p>
          </div>
          )}
          {script.development?.emotional_arc && (
          <div>
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Arco Emocional</span>
            <p className="text-purple-300 font-medium">{script.development.emotional_arc}</p>
          </div>
          )}
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
              {script.avatar && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Avatar: {script.avatar}
                </span>
              )}
              {script.awareness_level && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Schwartz: {script.awareness_level} — {
                    script.awareness_level === 1 ? "Unaware" :
                    script.awareness_level === 2 ? "Problem Aware" :
                    script.awareness_level === 3 ? "Solution Aware" :
                    script.awareness_level === 4 ? "Product Aware" :
                    "Most Aware"
                  }
                </span>
              )}
            </div>
          </div>
        )}
        {script.belief_change && (
          <div className="mt-4 border-l-2 border-orange-500/30 pl-4 ml-1 pt-2">
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Cambio de creencia</span>
            <div className="mt-2 space-y-1 text-[12px]">
              <div className="text-red-400/80"><span className="text-zinc-600">Antes:</span> {script.belief_change.old_belief || (script.belief_change as any).old}</div>
              <div className="text-zinc-500"><span className="text-zinc-600">Mecanismo:</span> {script.belief_change.mechanism}</div>
              <div className="text-green-400/80"><span className="text-zinc-600">Después:</span> {script.belief_change.new_belief || (script.belief_change as any).new}</div>
            </div>
          </div>
        )}
        {script.micro_beliefs && script.micro_beliefs.length > 0 && (
          <div className="mt-4 border-l-2 border-violet-500/30 pl-4 ml-1 pt-2">
            <span className="text-zinc-600 text-[11px] uppercase tracking-wider font-medium">Micro-creencias</span>
            <div className="mt-2 space-y-2">
              {script.micro_beliefs.map((mb: any, i: number) => {
                const isString = typeof mb === 'string';
                const beliefText = isString ? mb : mb.belief;
                const section = !isString && mb.installed_via ? mb.installed_via : null;
                const sectionName = !isString && mb.section_name ? mb.section_name : null;
                const pf = !isString && mb.persuasion_function ? mb.persuasion_function : null;
                // Try to find matching body section with this micro_belief
                const matchedSection = script.development?.sections
                  ? script.development.sections.find((s: any) => {
                      if (isString) return s.micro_belief && s.micro_belief === beliefText?.replace(/^MC\d+:\s*/, '');
                      return s.micro_belief && s.micro_belief === mb.belief;
                    })
                  : null;
                const resolvedPf = pf || (matchedSection as any)?.persuasion_function;
                const beatClass = resolvedPf ? `beat-${resolvedPf}` : '';
                return (
                  <div key={i} className={`text-[12px] rounded-lg p-2 ${beatClass || ''}`}>
                    <div className={resolvedPf ? 'beat-indicator inline-block rounded px-1.5 py-0.5 text-[11px] font-medium mb-1' : 'text-violet-300/90'}>
                      {resolvedPf && <span className="opacity-60 mr-1">{resolvedPf}</span>}
                      {beliefText}
                    </div>
                    {section && <div className="text-zinc-600 text-[11px]">Instalada via: {section} {sectionName ? `(${sectionName})` : ''}</div>}
                    {matchedSection && !sectionName && <div className="text-zinc-600 text-[11px]">→ Sección: {(matchedSection as any).section_name}</div>}
                  </div>
                );
              })}
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
            <div
              key={i}
              onClick={() => setSelectedHook(i)}
              className={`border rounded-2xl p-4 text-left transition-all duration-300 shrink-0 w-44 hover-glow cursor-pointer relative ${
                hookApprovals[i] === "approved"
                  ? `bg-emerald-500/5 border-emerald-500/30 ${selectedHook === i ? "ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5" : ""}`
                  : hookApprovals[i] === "rejected"
                  ? `bg-red-500/5 border-red-500/30 ${selectedHook === i ? "ring-1 ring-red-500/30 shadow-lg shadow-red-500/5" : ""}`
                  : selectedHook === i
                  ? "border-purple-500/30 bg-purple-500/5 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/5"
                  : "bg-zinc-900/30 border-zinc-800/40 hover:border-zinc-700/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${selectedHook === i ? "text-purple-400" : "text-zinc-400"}`}>#{hook.variant_number}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleHookApproval(i, "approved"); }}
                    title="Aprobar hook"
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      hookApprovals[i] === "approved"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-zinc-700 hover:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleHookApproval(i, "rejected"); }}
                    title="Rechazar hook"
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      hookApprovals[i] === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "text-zinc-700 hover:text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <span
                className={`badge ${
                  HOOK_TYPE_COLORS[hook.hook_type] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {HOOK_TYPE_LABELS[hook.hook_type || (hook as any).hookType] || hook.hook_type || (hook as any).hookType || 'lead'}
              </span>
              <p className="text-[11px] text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                &ldquo;{hook.script_text || (hook as any).text}&rdquo;
              </p>
            </div>
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
            const hookText = hook.script_text || (hook as any).text || '';
            const hookType = hook.hook_type || (hook as any).hookType || 'lead';
            return (
              <div key={selectedHook} className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-6 animate-content-swap">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-purple-400">HOOK #{hook.variant_number || selectedHook + 1}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${HOOK_TYPE_COLORS[hookType] || ""}`}>{HOOK_TYPE_LABELS[hookType] || hookType}</span>
                  {hook.timing_seconds && <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">0-{hook.timing_seconds}s</span>}
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 text-[10px] text-zinc-600">{hookText.trim().split(/\s+/).length} palabras</span>
                  <RegenButton
                    onClick={() => handleRegenerate("hook", selectedHook)}
                    loading={regenTarget === `hook-${selectedHook}`}
                  />
                </div>
                <InlineEdit
                  value={hookText}
                  onSave={(v) => handleEdit(`hooks.${selectedHook}.${hook.script_text !== undefined ? 'script_text' : 'text'}`, v)}
                  className="text-zinc-200 text-sm"
                />
              </div>
            );
          })()}

          {/* Development sections OR body text */}
          {script.development?.sections?.length ? (() => {
            let accTime = script.hooks[selectedHook]?.timing_seconds || 0;
            const pfn = (s: any) => s.persuasion_function || '';
            return script.development.sections.map((section, i) => {
              const startTime = accTime;
              accTime += section.timing_seconds || 0;
              const isRehook = section.is_rehook;
              const beatClass = pfn(section) ? `beat-${pfn(section)}` : '';
              const hasBeat = !!pfn(section);
              const ipadDirs = (section as any).ipad_directions as string[] | undefined;
              const pizarronDirs = (section as any).pizarron_directions as string[] | undefined;
              return (
                <div
                  key={i}
                  className={`border rounded-2xl p-6 relative ${
                    isRehook
                      ? "bg-amber-500/5 border-amber-500/15"
                      : hasBeat
                        ? `${beatClass}`
                        : "bg-zinc-900/30 border-zinc-800/40"
                  }`}
                >
                  {hasBeat && <div className="beat-line absolute left-0 top-4 bottom-4 w-[3px] rounded-full" />}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`uppercase tracking-wider text-[11px] font-semibold ${isRehook ? "text-amber-400" : "text-zinc-400"}`}>
                      {section.section_name || (section as any).title || `Sección ${i + 1}`}
                    </span>
                    {hasBeat && (
                      <span className="beat-indicator rounded-lg px-2 py-0.5 text-[10px] font-medium">
                        {pfn(section)}
                      </span>
                    )}
                    <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">{startTime}-{accTime}s</span>
                    <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 text-[10px] text-zinc-600">{(section.script_text || '').trim().split(/\s+/).length} palabras</span>
                    <RegenButton
                      onClick={() => handleRegenerate("section", i)}
                      loading={regenTarget === `section-${i}`}
                    />
                  </div>
                  {(section as any).micro_belief && (
                    <div className="beat-indicator rounded-lg px-2 py-1 text-[11px] mb-3 inline-block">
                      MC: {(section as any).micro_belief}
                    </div>
                  )}
                  <div>
                    <InlineEdit
                      value={section.script_text || ''}
                      onSave={(v) => handleEdit(`development.sections.${i}.script_text`, v)}
                      className="text-zinc-200 text-sm"
                    />
                    {ipadDirs?.length ? (() => {
                      const ipadStatus = (section as any).ipad_status as string | undefined;
                      const borderColor = ipadStatus === "ready" ? "border-green-500/40" : ipadStatus === "rejected" ? "border-red-500/40" : "border-zinc-700/30";
                      const bgColor = ipadStatus === "ready" ? "bg-green-900/20" : ipadStatus === "rejected" ? "bg-red-900/20" : "bg-zinc-800/40";
                      return (
                      <div className={`mt-3 ${bgColor} border ${borderColor} rounded-lg p-2.5 transition-colors duration-200`}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">iPad</span>
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={async () => {
                                const newStatus = ipadStatus === "ready" ? undefined : "ready";
                                const res = await fetch("/api/generate/edit", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ generationId, path: `development.sections.${i}.ipad_status`, value: newStatus ?? "" }),
                                });
                                const data = await res.json();
                                if (res.ok) setScript(data.script);
                              }}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                ipadStatus === "ready"
                                  ? "bg-green-500/30 text-green-400"
                                  : "bg-zinc-700/40 text-zinc-600 hover:text-green-400 hover:bg-green-500/10"
                              }`}
                              title="Material listo"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                const newStatus = ipadStatus === "rejected" ? undefined : "rejected";
                                const res = await fetch("/api/generate/edit", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ generationId, path: `development.sections.${i}.ipad_status`, value: newStatus ?? "" }),
                                });
                                const data = await res.json();
                                if (res.ok) setScript(data.script);
                              }}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                ipadStatus === "rejected"
                                  ? "bg-red-500/30 text-red-400"
                                  : "bg-zinc-700/40 text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                              }`}
                              title="Falta material"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <InlineEdit
                          value={ipadDirs.join("\n")}
                          onSave={async (v) => {
                            const newDirs = v.split("\n").map(l => l.trim()).filter(Boolean);
                            const res = await fetch("/api/generate/edit", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ generationId, path: `development.sections.${i}.ipad_directions`, value: newDirs }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);
                            setScript(data.script);
                          }}
                          className="text-[11px] text-zinc-400 leading-tight"
                          compact
                        />
                      </div>
                      );
                    })() : null}
                    {pizarronDirs?.length ? (
                      <div className="mt-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-base">🎨</span>
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Pizarrón / Lámina</span>
                        </div>
                        <InlineEdit
                          value={pizarronDirs.join("\n")}
                          onSave={async (v) => {
                            const newDirs = v.split("\n").map(l => l.trim()).filter(Boolean);
                            const res = await fetch("/api/generate/edit", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ generationId, path: `development.sections.${i}.pizarron_directions`, value: newDirs }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);
                            setScript(data.script);
                          }}
                          className="text-[11px] text-emerald-300/70 leading-tight"
                          compact
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            });
          })() : script.body ? (
            <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="uppercase tracking-wider text-[11px] font-semibold text-zinc-400">CUERPO</span>
                <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 text-[10px] text-zinc-600">{script.body.trim().split(/\s+/).length} palabras</span>
              </div>
              <InlineEdit
                value={script.body}
                onSave={(v) => handleEdit("body", v)}
                className="text-zinc-200 text-sm whitespace-pre-line"
              />
            </div>
          ) : null}

          {/* Offer Bridge: solo mostrar si NO hay cta_blocks (legacy) */}
          {script.offer_bridge && !script.cta_blocks?.length && (() => {
            const bridgeStart = (script.development?.sections || []).reduce(
              (sum, s) => sum + (s.timing_seconds || 0),
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

          {/* Transition Text */}
          {script.transition_text && (() => {
            const transStart = (script.development?.sections || []).reduce(
              (sum, s) => sum + (s.timing_seconds || 0),
              script.hooks[selectedHook]?.timing_seconds || 0
            ) + (script.offer_bridge?.timing_seconds || 0);
            return (
              <div className="bg-sky-500/5 border border-sky-500/15 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-sky-400">TRANSICION (Capa 1)</span>
                  <span className="bg-zinc-800/50 rounded-lg px-2 py-0.5 font-mono text-[10px] text-zinc-600">{transStart}-{transStart + 4}s</span>
                </div>
                <InlineEdit
                  value={script.transition_text}
                  onSave={(v) => handleEdit("transition_text", v)}
                  className="text-zinc-200 text-sm"
                />
              </div>
            );
          })()}

          {/* CTA suelto: solo mostrar si NO hay cta_blocks */}
          {!script.cta_blocks?.length && (() => {
            const devTotal = (script.development?.sections || []).reduce(
              (sum, s) => sum + (s.timing_seconds || 0),
              script.hooks[selectedHook]?.timing_seconds || 0
            ) + (script.offer_bridge?.timing_seconds || 0) + (script.transition_text ? 4 : 0);
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

      {/* 3 CTA Blocks (6 capas × 3 canales) */}
      {script.cta_blocks && script.cta_blocks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-5 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">3 Bloques CTA (capas 2-6)</h2>
          <p className="text-zinc-500 text-xs mb-4">Se graban UNA vez por sesión y se combinan con cualquier body en edición. La transición (capa 1) va con el body.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {script.cta_blocks.map((block: CTABlock, i: number) => {
              const channelColors: Record<string, string> = {
                clase_gratuita: "border-emerald-500/20 bg-emerald-500/5",
                taller_5: "border-amber-500/20 bg-amber-500/5",
                instagram: "border-pink-500/20 bg-pink-500/5",
              };
              const labelColors: Record<string, string> = {
                clase_gratuita: "text-emerald-400",
                taller_5: "text-amber-400",
                instagram: "text-pink-400",
              };
              return (
                <div key={i} className={`border rounded-2xl p-5 space-y-3 ${channelColors[block.channel] || "border-zinc-800/40 bg-zinc-900/30"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`uppercase tracking-wider text-[11px] font-semibold ${labelColors[block.channel] || "text-zinc-400"}`}>
                      {block.channel_label || block.channel || "CTA"}
                    </span>
                    {block.timing_seconds && <span className="text-[10px] text-zinc-600">~{block.timing_seconds}s</span>}
                  </div>
                  <div className="space-y-2.5">
                    {block.layers ? ([
                      ["OFERTA", block.layers.oferta],
                      ["PRUEBA", block.layers.prueba],
                      ["RIESGO CERO", block.layers.riesgo_cero],
                      ["URGENCIA", block.layers.urgencia],
                      ["ORDEN + NLP", block.layers.orden_nlp],
                    ] as const).map(([label, text]) => (
                      <div key={label}>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">{label}</span>
                        <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">&ldquo;{text}&rdquo;</p>
                      </div>
                    )) : block.text ? (
                      <p className="text-zinc-300 text-xs leading-relaxed">&ldquo;{block.text}&rdquo;</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Máquina de Ángulos — 3 herramientas */}
      <div className="border border-zinc-800/40 rounded-2xl p-6 bg-zinc-900/20">
        <h2 className="text-lg font-bold tracking-tight mb-4 text-zinc-300">Máquina de Ángulos</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleAdCopyEmbudo}
            disabled={adCopyLoading}
            className="px-4 py-2 text-xs rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50 transition-all"
          >
            {adCopyLoading ? "Generando..." : "Ad Copy Embudo"}
          </button>
          <button
            onClick={handleRetargeting}
            disabled={retargetingLoading}
            className="px-4 py-2 text-xs rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
          >
            {retargetingLoading ? "Generando..." : "Retargeting (4Q)"}
          </button>
          <button
            onClick={handleExplodeAngle}
            disabled={explodeLoading}
            className="px-4 py-2 text-xs rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 transition-all"
          >
            {explodeLoading ? "Generando..." : "Explotar Ángulo"}
          </button>
          <button
            onClick={handleCopiesMatrix}
            disabled={copiesMatrixLoading}
            className="px-4 py-2 text-xs rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-all"
          >
            {copiesMatrixLoading ? "Generando 15 copies..." : "15 Copies (5H × 3CTA)"}
          </button>
          {copiesMatrix && copiesMatrix.total_versions > 0 && (
            <a
              href={`/api/export/copies?generationId=${generationId}`}
              className="px-4 py-2 text-xs rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar CSV ({copiesMatrix.total_versions} copies)
            </a>
          )}
        </div>

        {/* Ad Copy Embudo Result */}
        {adCopyResult && (
          <div className="mb-6 border border-yellow-500/20 rounded-xl p-5 bg-yellow-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Ad Copy Embudo — {adCopyResult.word_count} palabras</span>
              <CopyButton text={adCopyResult.copy_text} label="Copiar" className="text-[10px] px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" />
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{adCopyResult.copy_text}</p>
          </div>
        )}

        {/* Retargeting Result */}
        {retargetingResult && (
          <div className="mb-6 space-y-3">
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Retargeting — Hammer Them (4 cuadrantes)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {retargetingResult.quadrants.map((q, i) => (
                <div key={i} className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 text-[11px] font-semibold uppercase">{q.quadrant_label}</span>
                    <span className="text-zinc-600 text-[10px]">{q.timing_seconds}s</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mb-1 italic">&ldquo;{q.hook}&rdquo;</p>
                  <p className="text-zinc-300 text-xs leading-relaxed">{q.script_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explode Angle Result */}
        {explodeResult && (
          <div className="space-y-4">
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Ángulo Explotado — 5 niveles + Ad Copy + Retargeting</span>
            <div className="space-y-3 mt-2">
              {explodeResult.scripts_by_awareness.map((s, i) => (
                <div key={i} className="border border-purple-500/20 rounded-xl p-4 bg-purple-500/5">
                  <span className="text-purple-400 text-[11px] font-semibold">Nivel {s.awareness_level}: {s.awareness_label}</span>
                  <p className="text-zinc-400 text-[11px] mt-1 italic">&ldquo;{s.hook}&rdquo;</p>
                  <p className="text-zinc-500 text-[11px] mt-1">{s.body_summary}</p>
                </div>
              ))}
            </div>
            {explodeResult.ad_copy_embudo && (
              <div className="border border-yellow-500/20 rounded-xl p-4 bg-yellow-500/5">
                <span className="text-yellow-400 text-[11px] font-semibold uppercase">Ad Copy Embudo (incluido)</span>
                <p className="text-zinc-300 text-xs leading-relaxed mt-2 whitespace-pre-wrap">{explodeResult.ad_copy_embudo.copy_text}</p>
              </div>
            )}
            {explodeResult.retargeting_hooks && (
              <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
                <span className="text-red-400 text-[11px] font-semibold uppercase">Retargeting Hooks</span>
                <div className="mt-2 space-y-1">
                  {explodeResult.retargeting_hooks.map((rh, i) => (
                    <p key={i} className="text-zinc-400 text-[11px]"><span className="text-zinc-600">{rh.quadrant}:</span> &ldquo;{rh.hook}&rdquo;</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 15 Copies Matrix Result */}
        {copiesMatrix && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                {copiesMatrix.total_versions} Copies — 5 Hooks × 3 CTAs
              </span>
              <a
                href={`/api/export/copies?generationId=${generationId}`}
                className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                CSV
              </a>
            </div>

            {/* Diversity warnings */}
            {copiesMatrix.diversity_warnings && copiesMatrix.diversity_warnings.length > 0 && (
              <div className="mb-4 border border-amber-500/30 rounded-xl p-3 bg-amber-500/5">
                <span className="text-amber-400 text-[10px] font-semibold uppercase">Copies demasiado parecidos:</span>
                <ul className="mt-1 space-y-0.5">
                  {copiesMatrix.diversity_warnings.map((w, i) => (
                    <li key={i} className="text-amber-300/80 text-[11px]">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Group by CTA channel */}
            {["clase_gratuita", "taller_5", "instagram"].map((channel) => {
              const channelCopies = copiesMatrix.versions.filter((v) => v.cta_channel === channel);
              if (channelCopies.length === 0) return null;
              const label = channelCopies[0].cta_label;
              return (
                <div key={channel} className="mb-4">
                  <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${channel === "clase_gratuita" ? "bg-blue-500" : channel === "taller_5" ? "bg-amber-500" : "bg-pink-500"}`} />
                    {label} ({channelCopies.length})
                  </h4>
                  <div className="space-y-1.5">
                    {channelCopies.map((copy, ci) => {
                      const globalIdx = copiesMatrix.versions.indexOf(copy);
                      const isExpanded = copiesExpandedIdx === globalIdx;
                      return (
                        <div key={ci} className={`border rounded-xl transition-all ${isExpanded ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-800/30 bg-zinc-900/20 hover:border-zinc-700/40"}`}>
                          <button
                            onClick={() => setCopiesExpandedIdx(isExpanded ? null : globalIdx)}
                            className="w-full px-3.5 py-2.5 flex items-center gap-3 text-left"
                          >
                            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded shrink-0">H{copy.hook_index + 1}</span>
                            <span className="text-xs text-zinc-400 truncate flex-1">{copy.headline}</span>
                            <span className="text-[10px] text-zinc-600 shrink-0">{copy.word_count}w</span>
                            <span className="text-[10px] text-zinc-700 shrink-0">{copy.structure_used}</span>
                            <svg className={`w-3 h-3 text-zinc-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                          {isExpanded && (
                            <div className="px-3.5 pb-3.5 space-y-2">
                              <div className="flex gap-4 text-[10px]">
                                <div>
                                  <span className="text-zinc-600 uppercase">Headline</span>
                                  <p className="text-emerald-400 font-medium">{copy.headline}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-600 uppercase">Descripción</span>
                                  <p className="text-zinc-400">{copy.description}</p>
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-600 uppercase">Texto Principal</span>
                                <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap mt-1">{copy.primary_text}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
