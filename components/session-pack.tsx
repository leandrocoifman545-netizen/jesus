"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";
import RelativeTime from "./relative-time";
import Confetti from "./confetti";
import CopyButton from "./copy-button";
import { resolveFormatLabel } from "@/lib/ai/schemas/script-output";

type GenerationStatus = "draft" | "confirmed" | "recorded" | "winner";

interface GenerationBatch {
  id: string;
  name: string;
}

interface GenerationSummary {
  id: string;
  createdAt: string;
  title?: string;
  status?: GenerationStatus;
  batch?: GenerationBatch;
  script: {
    platform_adaptation: { platform: string };
    total_duration_seconds: number;
    word_count: number;
    hooks: Array<{
      variant_number: number;
      hook_type: string;
      script_text: string;
      timing_seconds: number;
    }>;
    development: {
      framework_used: string;
      emotional_arc: string;
      sections: Array<{
        section_name: string;
        is_rehook?: boolean;
        script_text: string;
        timing_seconds: number;
      }>;
    };
    cta?: {
      verbal_cta?: string;
      reason_why?: string;
      cta_type?: string;
      timing_seconds?: number;
    };
    visual_format?: {
      format_name: string;
      difficulty_level: number;
      setup_instructions: string;
      recording_notes: string;
    };
    offer_bridge?: {
      product_type: string;
      script_text: string;
      timing_seconds: number;
    };
    angle_family?: string;
    angle_specific?: string;
    body_type?: string;
    segment?: string;
    niche?: string;
    transition_text?: string;
    belief_change?: {
      old_belief: string;
      mechanism: string;
      new_belief: string;
    };
  };
}

interface CTALayers {
  oferta: string;
  prueba: string;
  riesgo_cero: string;
  urgencia: string;
  orden_nlp: string;
}

interface ActiveCTA {
  id: string;
  channel: string;
  variant: string;
  ingredients: string[];
  layers?: CTALayers;
  text: string;
}

interface SessionPackProps {
  generations: GenerationSummary[];
  activeCTAs?: ActiveCTA[];
}

const STATUS_CONFIG: Record<GenerationStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Borrador", color: "text-zinc-500 border-zinc-700", icon: "" },
  confirmed: { label: "Confirmado", color: "text-blue-400 border-blue-500/30 bg-blue-500/5", icon: "" },
  recorded: { label: "Grabado", color: "text-green-400 border-green-500/30 bg-green-500/5", icon: "" },
  winner: { label: "Winner", color: "text-amber-400 border-amber-500/30 bg-amber-500/5", icon: "" },
};

function StatusDropdown({ currentStatus, onSelect, onClose, triggerRef }: {
  currentStatus: GenerationStatus;
  onSelect: (s: GenerationStatus) => void;
  onClose: () => void;
  triggerRef: string;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const btn = document.querySelector(`[data-status-trigger="${triggerRef}"]`);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }

    function handleScroll() { onClose(); }
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [triggerRef, onClose]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9990]" onClick={onClose} />
      <div
        ref={dropdownRef}
        className="fixed z-[9991] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-xl min-w-[120px] animate-fade-in"
        style={{ top: pos.top, right: pos.right, animationDuration: "100ms" }}
      >
        {(["draft", "confirmed", "recorded", "winner"] as GenerationStatus[]).map((s) => (
          <button
            key={s}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(s); }}
            className={`w-full text-left text-[10px] px-3 py-2 transition-colors flex items-center gap-2 ${
              s === currentStatus ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s === "draft" ? "bg-zinc-500" : s === "confirmed" ? "bg-blue-400" : s === "recorded" ? "bg-green-400" : "bg-amber-400"}`} />
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

// --- Batch modal ---

function BatchModal({ onClose, onSubmit, existingBatches, selectedCount }: {
  onClose: () => void;
  onSubmit: (batchId: string | null, batchName: string) => void;
  existingBatches: { id: string; name: string; count: number }[];
  selectedCount: number;
}) {
  const [mode, setMode] = useState<"new" | "existing">(existingBatches.length > 0 ? "existing" : "new");
  const [name, setName] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(existingBatches[0]?.id || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "new") inputRef.current?.focus();
  }, [mode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "new") {
      if (!name.trim()) return;
      onSubmit(null, name.trim());
    } else {
      if (!selectedBatchId) return;
      const batch = existingBatches.find((b) => b.id === selectedBatchId);
      onSubmit(selectedBatchId, batch?.name || "");
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-spring-up">
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">Agrupar {selectedCount} guion{selectedCount !== 1 ? "es" : ""}</h3>
        <p className="text-xs text-zinc-500 mb-5">Asigna los guiones seleccionados a una carpeta</p>

        {existingBatches.length > 0 && (
          <div className="flex gap-1 mb-4 bg-zinc-800/30 rounded-xl p-1 border border-zinc-800/30">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`flex-1 text-xs px-3 py-2 rounded-lg transition-all ${mode === "existing" ? "bg-white/10 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Carpeta existente
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex-1 text-xs px-3 py-2 rounded-lg transition-all ${mode === "new" ? "bg-white/10 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Nueva carpeta
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "new" ? (
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Semana 10 Mar, Batch prueba..."
              className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/10 transition-all"
            />
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {existingBatches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedBatchId === b.id
                      ? "border-purple-500/30 bg-purple-500/10 text-white"
                      : "border-zinc-800/40 bg-zinc-800/20 text-zinc-400 hover:border-zinc-700/40"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                    <span className="text-sm">{b.name}</span>
                  </span>
                  <span className="text-[10px] text-zinc-600">{b.count} guiones</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mode === "new" ? !name.trim() : !selectedBatchId}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:from-zinc-700 disabled:to-zinc-700 transition-all"
            >
              Agrupar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// --- Rename batch modal ---

function RenameBatchModal({ batchName, onClose, onSubmit }: {
  batchName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(batchName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-spring-up">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Renombrar carpeta</h3>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/10 transition-all"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800/50 hover:border-zinc-700/50 transition-all">Cancelar</button>
            <button type="submit" disabled={!name.trim()} className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 transition-all">Guardar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// --- Pack/teleprompter generators ---

function generatePackText(selected: GenerationSummary[], ctas: ActiveCTA[]): string {
  const date = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  let text = "";

  text += "=".repeat(60) + "\n";
  text += "  PACK DE GRABACION\n";
  text += `  ${date}\n`;
  text += `  ${selected.length} guiones seleccionados\n`;
  text += "=".repeat(60) + "\n\n";

  text += "-".repeat(60) + "\n";
  text += `  ${ctas.length} CTAs (grabar una vez, se pegan a cualquier cuerpo)\n`;
  text += "-".repeat(60) + "\n\n";

  for (const cta of ctas) {
    text += `> ${cta.channel} (Variante ${cta.variant})\n`;
    if (cta.layers) {
      text += `  [OFERTA]      "${cta.layers.oferta}"\n`;
      text += `  [PRUEBA]      "${cta.layers.prueba}"\n`;
      text += `  [RIESGO CERO] "${cta.layers.riesgo_cero}"\n`;
      text += `  [URGENCIA]    "${cta.layers.urgencia}"\n`;
      text += `  [ORDEN + NLP] "${cta.layers.orden_nlp}"\n\n`;
    } else {
      text += `  "${cta.text}"\n\n`;
    }
  }

  text += "\n";
  text += "-".repeat(60) + "\n";
  text += "  ORDEN DE GRABACION\n";
  text += "-".repeat(60) + "\n\n";

  selected.forEach((gen, i) => {
    const firstHook = gen.script.hooks[0]?.script_text.substring(0, 60) || "";
    const label = gen.title || `${gen.script.development.framework_used} | ${gen.script.total_duration_seconds}s`;
    text += `  ${i + 1}. ${label} | ${gen.script.hooks.length} leads\n`;
    text += `     "${firstHook}..."\n\n`;
  });

  text += "\n";

  selected.forEach((gen, i) => {
    text += "=".repeat(60) + "\n";
    text += `  GUION ${i + 1} de ${selected.length}`;
    if (gen.title) text += ` — ${gen.title}`;
    text += "\n";
    text += `  Framework: ${gen.script.development.framework_used}\n`;
    text += `  Duracion: ${gen.script.total_duration_seconds}s | ~${gen.script.word_count} palabras\n`;
    text += `  Arco: ${gen.script.development.emotional_arc}\n`;
    if (gen.script.visual_format) {
      text += `  Formato: ${gen.script.visual_format.format_name} (Nivel ${gen.script.visual_format.difficulty_level}/5)\n`;
      text += `  Setup: ${gen.script.visual_format.setup_instructions}\n`;
      if (gen.script.visual_format.recording_notes) {
        text += `  Notas: ${gen.script.visual_format.recording_notes}\n`;
      }
    }
    if (gen.script.angle_family) text += `  Angulo: ${gen.script.angle_family}${gen.script.angle_specific ? ` — ${gen.script.angle_specific}` : ""}\n`;
    if (gen.script.body_type) text += `  Cuerpo: ${gen.script.body_type.replace(/_/g, " ")}\n`;
    if (gen.script.segment) text += `  Segmento: ${gen.script.segment}\n`;
    if (gen.script.niche) text += `  Nicho: ${gen.script.niche}\n`;
    text += "=".repeat(60) + "\n\n";

    text += `> ${gen.script.hooks.length} LEADS\n`;
    text += "-".repeat(40) + "\n\n";

    for (const hook of gen.script.hooks) {
      text += `  Lead ${hook.variant_number} (${hook.hook_type}):\n`;
      text += `  "${hook.script_text}"\n\n`;
    }

    text += "> CUERPO\n";
    text += "-".repeat(40) + "\n\n";

    for (const section of gen.script.development.sections) {
      const rehook = section.is_rehook ? " [RE-HOOK]" : "";
      text += `[${section.section_name}${rehook}]\n`;
      text += `${section.script_text}\n\n`;
    }

    if (gen.script.transition_text) {
      text += "> TRANSICION (grabar con el body)\n";
      text += "-".repeat(40) + "\n\n";
      text += `"${gen.script.transition_text}"\n\n`;
    }

    if (gen.script.offer_bridge) {
      text += "> PUENTE A LA OFERTA\n";
      text += "-".repeat(40) + "\n\n";
      text += `"${gen.script.offer_bridge.script_text}"\n\n`;
    }

    if (gen.script.cta?.verbal_cta) {
      text += "> CTA\n";
      text += "-".repeat(40) + "\n\n";
      text += `"${gen.script.cta.verbal_cta}"`;
      if (gen.script.cta.reason_why) text += ` ${gen.script.cta.reason_why}`;
      text += "\n\n";
    }

    text += "\n";
  });

  text += "=".repeat(60) + "\n";
  text += "  FIN DEL PACK\n";
  text += "=".repeat(60) + "\n";

  return text;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generatePackHTML(selected: GenerationSummary[], ctas: ActiveCTA[]): string {
  const date = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalDuration = selected.reduce((a, g) => a + (g.script.total_duration_seconds || 0), 0);

  const LAYER_LABELS: Record<string, string> = {
    oferta: "OFERTA", prueba: "PRUEBA", riesgo_cero: "RIESGO CERO",
    urgencia: "URGENCIA", orden_nlp: "ORDEN + NLP",
  };
  const ctasHTML = ctas.map(c => {
    const layersHTML = c.layers
      ? Object.entries(c.layers).map(([key, val]) => `
        <div class="cta-layer">
          <span class="cta-layer-label">${esc(LAYER_LABELS[key] || key)}</span>
          <span class="cta-layer-text">&ldquo;${esc(val)}&rdquo;</span>
        </div>`).join("")
      : `<div class="cta-text">&ldquo;${esc(c.text)}&rdquo;</div>`;
    return `
    <div class="cta-item">
      <div class="cta-name">${esc(c.channel)} — Variante ${esc(c.variant)}</div>
      ${layersHTML}
      <div style="margin-top:6px;font-size:8pt;color:var(--gray-500);">Ingredientes: ${esc(c.ingredients.join(" + "))}</div>
    </div>`;
  }).join("");

  const tocHTML = selected.map((g, i) => `
    <div class="toc-item">
      <span class="toc-num">${i + 1}</span>
      <span class="toc-title">${esc(g.title || g.script.development.framework_used)}</span>
      <span class="toc-duration">${g.script.total_duration_seconds}s</span>
    </div>`).join("");

  const scriptsHTML = selected.map((g, i) => {
    const bodySections = g.script.development.sections.map(sec => `
      <div class="body-section ${sec.is_rehook ? "rehook" : ""} no-break">
        <div class="body-section-name">${esc(sec.section_name)}${sec.is_rehook ? " — RE-HOOK" : ""}</div>
        <div class="body-section-text">${esc(sec.script_text)}</div>
      </div>`).join("");

    const leadsHTML = g.script.hooks.map(h => `
      <div class="lead-card no-break">
        <div class="lead-num">${h.variant_number}</div>
        <div class="lead-content">
          <div class="lead-type">${esc(h.hook_type.replace(/_/g, " "))}</div>
          <div class="lead-text">&ldquo;${esc(h.script_text)}&rdquo;</div>
        </div>
      </div>`).join("");

    const vf = g.script.visual_format;

    return `
    <div class="page page-break">
      <div class="script-header">
        <div class="script-num">Guión ${i + 1} de ${selected.length}</div>
        <div class="script-title">${esc(g.title || "Sin título")}</div>
        <div class="script-meta">
          <span class="script-meta-item"><span class="script-meta-label">Framework:</span> ${esc(g.script.development.framework_used)}</span>
          <span class="script-meta-item"><span class="script-meta-label">Duración:</span> ${g.script.total_duration_seconds}s | ~${g.script.word_count} palabras</span>
          ${vf ? `<span class="script-meta-item"><span class="script-meta-label">Formato:</span> ${esc(vf.format_name)} (Nivel ${vf.difficulty_level}/5)</span>` : ""}
          ${g.script.angle_family ? `<span class="script-meta-item"><span class="script-meta-label">Ángulo:</span> ${esc(g.script.angle_family)}${g.script.angle_specific ? ` — ${esc(g.script.angle_specific)}` : ""}</span>` : ""}
          ${g.script.body_type ? `<span class="script-meta-item"><span class="script-meta-label">Cuerpo:</span> ${esc(g.script.body_type.replace(/_/g, " "))}</span>` : ""}
          ${g.script.segment ? `<span class="script-meta-item"><span class="script-meta-label">Segmento:</span> ${esc(g.script.segment)}</span>` : ""}
          ${g.script.niche ? `<span class="script-meta-item"><span class="script-meta-label">Nicho:</span> ${esc(g.script.niche)}</span>` : ""}
        </div>
      </div>
      <div class="script-details">
        <p><strong>Arco:</strong> ${esc(g.script.development.emotional_arc)}</p>
        ${vf ? `<p><strong>Setup:</strong> ${esc(vf.setup_instructions)}</p>` : ""}
        ${vf?.recording_notes ? `<p><strong>Notas:</strong> ${esc(vf.recording_notes)}</p>` : ""}
      </div>

      <div class="leads-label">${g.script.hooks.length} Leads</div>
      ${leadsHTML}

      <div class="body-label">Cuerpo</div>
      ${bodySections}

      ${g.script.transition_text ? `
      <div class="body-section no-break" style="border-left:3px solid #f59e0b;background:#fffbeb;">
        <div class="body-section-name" style="color:#f59e0b;">TRANSICIÓN (grabar con el body)</div>
        <div class="body-section-text">&ldquo;${esc(g.script.transition_text)}&rdquo;</div>
      </div>` : ""}

      ${g.script.offer_bridge ? `
      <div class="offer-bridge no-break">
        <div class="body-section-name">PUENTE A LA OFERTA — ${esc(g.script.offer_bridge.product_type === "webinar_gratis" ? "Webinar Gratis" : g.script.offer_bridge.product_type === "taller_5" ? "Taller $5" : "Custom")}</div>
        <div class="body-section-text">&ldquo;${esc(g.script.offer_bridge.script_text)}&rdquo;</div>
      </div>` : ""}

      ${g.script.cta?.verbal_cta ? `
      <div class="cta-inline no-break">
        <div class="body-section-name">CTA</div>
        <div class="body-section-text">&ldquo;${esc(g.script.cta.verbal_cta)}&rdquo;${g.script.cta.reason_why ? ` <em>${esc(g.script.cta.reason_why)}</em>` : ""}</div>
      </div>` : ""}
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Pack de Grabación — ${esc(date)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  :root {
    --purple: #7c3aed; --purple-light: #ede9fe; --purple-dark: #5b21b6;
    --gray-50: #f9fafb; --gray-100: #f3f4f6; --gray-200: #e5e7eb; --gray-300: #d1d5db;
    --gray-500: #6b7280; --gray-700: #374151; --gray-900: #111827;
    --green: #059669; --green-light: #ecfdf5;
    --amber: #d97706; --amber-light: #fffbeb;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: var(--gray-900); background: white; line-height: 1.6; font-size: 11pt; }
  @media print {
    body { font-size: 10pt; }
    .page-break { page-break-before: always; }
    .no-break { page-break-inside: avoid; }
    @page { margin: 1.5cm 2cm; size: A4; }
    .cover { height: 100vh; }
    .print-hint { display: none; }
  }
  @media screen {
    body { max-width: 210mm; margin: 0 auto; background: #f3f4f6; }
    .page { background: white; margin: 20px auto; padding: 40px 50px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .cover { min-height: 100vh; }
  }
  .print-hint {
    position: fixed; top: 16px; right: 16px; background: var(--purple); color: white;
    padding: 12px 20px; border-radius: 12px; font-size: 10pt; font-weight: 600;
    cursor: pointer; z-index: 100; box-shadow: 0 4px 12px rgba(124,58,237,0.4);
  }
  .print-hint:hover { background: var(--purple-dark); }
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 60px 40px; }
  .cover-logo { width: 80px; height: 80px; background: var(--purple); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }
  .cover-logo svg { width: 44px; height: 44px; }
  .cover h1 { font-size: 32pt; font-weight: 800; color: var(--gray-900); letter-spacing: -0.02em; margin-bottom: 8px; }
  .cover .subtitle { font-size: 14pt; color: var(--gray-500); font-weight: 400; margin-bottom: 48px; }
  .cover-meta { display: flex; gap: 32px; color: var(--gray-500); font-size: 10pt; }
  .cover-divider { width: 60px; height: 4px; background: var(--purple); border-radius: 2px; margin: 40px 0; }
  .toc h2 { font-size: 18pt; font-weight: 700; margin-bottom: 24px; }
  .toc-item { display: flex; align-items: baseline; padding: 10px 0; border-bottom: 1px solid var(--gray-100); }
  .toc-num { font-weight: 700; color: var(--purple); min-width: 28px; font-size: 12pt; }
  .toc-title { font-weight: 500; flex: 1; }
  .toc-duration { color: var(--gray-500); font-size: 9pt; }
  .cta-section { background: var(--purple-light); border-radius: 12px; padding: 24px; margin: 24px 0; }
  .cta-section h3 { font-size: 11pt; font-weight: 700; color: var(--purple-dark); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
  .cta-item { background: white; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; border-left: 3px solid var(--purple); }
  .cta-item:last-child { margin-bottom: 0; }
  .cta-name { font-weight: 600; font-size: 9pt; color: var(--purple); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .cta-text { color: var(--gray-700); font-size: 10pt; line-height: 1.5; }
  .cta-layer { display: flex; gap: 8px; margin-bottom: 6px; align-items: baseline; }
  .cta-layer-label { font-weight: 600; font-size: 7pt; color: var(--purple); text-transform: uppercase; letter-spacing: 0.04em; min-width: 80px; flex-shrink: 0; padding-top: 2px; }
  .cta-layer-text { color: var(--gray-700); font-size: 9.5pt; line-height: 1.45; }
  .script-header { background: linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%); color: white; padding: 28px 32px; border-radius: 12px 12px 0 0; }
  .script-num { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 6px; }
  .script-title { font-size: 18pt; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 16px; }
  .script-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 9pt; opacity: 0.85; }
  .script-meta-item { display: flex; align-items: center; gap: 4px; }
  .script-meta-label { font-weight: 600; }
  .script-details { background: var(--gray-50); border: 1px solid var(--gray-200); border-top: none; padding: 16px 24px; font-size: 9pt; color: var(--gray-700); border-radius: 0 0 12px 12px; margin-bottom: 24px; }
  .script-details p { margin-bottom: 4px; }
  .script-details strong { color: var(--gray-900); }
  .body-label, .leads-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .body-label { color: var(--purple); }
  .body-label::after, .leads-label::after { content: ''; flex: 1; height: 1px; background: var(--gray-200); }
  .leads-label { color: var(--green); margin-top: 28px; }
  .body-section { margin-bottom: 16px; padding: 14px 18px; background: white; border: 1px solid var(--gray-200); border-radius: 8px; }
  .body-section-name { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500); margin-bottom: 6px; }
  .body-section-text { font-size: 11pt; line-height: 1.7; }
  .body-section.rehook { background: var(--amber-light); border-color: var(--amber); border-left: 3px solid var(--amber); }
  .body-section.rehook .body-section-name { color: var(--amber); }
  .offer-bridge { margin-top: 16px; padding: 14px 18px; background: #f0fdfa; border: 1px solid #99f6e4; border-left: 3px solid #14b8a6; border-radius: 8px; }
  .offer-bridge .body-section-name { color: #14b8a6; }
  .cta-inline { margin-top: 16px; padding: 14px 18px; background: var(--purple-light); border: 1px solid #c4b5fd; border-left: 3px solid var(--purple); border-radius: 8px; }
  .cta-inline .body-section-name { color: var(--purple); }
  .lead-card { display: flex; gap: 12px; margin-bottom: 12px; padding: 14px 16px; background: var(--green-light); border-radius: 8px; border: 1px solid #d1fae5; }
  .lead-num { font-size: 16pt; font-weight: 800; color: var(--green); min-width: 28px; line-height: 1; padding-top: 2px; }
  .lead-content { flex: 1; }
  .lead-type { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--green); margin-bottom: 4px; }
  .lead-text { font-size: 11pt; line-height: 1.6; }
  .footer { text-align: center; padding: 40px; color: var(--gray-500); font-size: 9pt; }
</style>
</head>
<body>

<button class="print-hint" onclick="window.print()">Guardar como PDF</button>

<div class="page cover">
  <div class="cover-logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>
  <h1>Pack de Grabación</h1>
  <p class="subtitle">${esc(date)}</p>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <span><strong>${selected.length}</strong>&nbsp;guiones</span>
    <span><strong>${totalDuration}s</strong>&nbsp;total</span>
    <span><strong>${ctas.length}</strong>&nbsp;CTAs</span>
  </div>
</div>

<div class="page toc page-break">
  <h2>Orden de grabación</h2>
  ${tocHTML}
  <div class="cta-section" style="margin-top: 32px;">
    <h3>CTAs — grabar una vez, se pegan a cualquier cuerpo</h3>
    ${ctasHTML}
  </div>
</div>

${scriptsHTML}

<div class="footer">ADP — Academia de Productos Digitales</div>

</body>
</html>`;
}

function generateTeleprompterText(selected: GenerationSummary[]): string {
  let text = "";

  // --- CTAs first (record once, reuse for all scripts) ---
  text += `========================================\n`;
  text += `  CTAs — GRABAR PRIMERO\n`;
  text += `  (se usan para todos los guiones)\n`;
  text += `========================================\n\n`;
  for (let i = 0; i < selected.length; i++) {
    const gen = selected[i];
    const cta = gen.script.cta?.verbal_cta;
    if (cta) {
      text += `CTA Guion ${i + 1}:\n${cta}\n\n`;
      text += `--- CORTE ---\n\n`;
    }
  }

  // --- Each script: hooks + body (read straight through) ---
  text += `\n========================================\n`;
  text += `  GUIONES — LEER DE CORRIDO\n`;
  text += `  (leads + cuerpo por guion)\n`;
  text += `========================================\n`;

  selected.forEach((gen, i) => {
    text += `\n\n`;
    text += `----------------------------------------\n`;
    text += `  GUION ${i + 1}: ${gen.title || gen.script.development.framework_used}\n`;
    if (gen.script.visual_format) text += `  Formato: ${gen.script.visual_format.format_name}\n`;
    text += `----------------------------------------\n\n`;

    // All hooks/leads for this script
    for (const hook of gen.script.hooks) {
      text += `[Lead ${hook.variant_number}]\n`;
      text += `${hook.script_text}\n\n`;
      text += `--- CORTE ---\n\n`;
    }

    // Body for this script
    text += `[CUERPO]\n`;
    for (const section of gen.script.development.sections) {
      text += `${section.script_text}\n\n`;
    }

    if (gen.script.offer_bridge) {
      text += `[PUENTE A LA OFERTA]\n`;
      text += `${gen.script.offer_bridge.script_text}\n\n`;
    }

    text += `--- CORTE ---\n`;
  });

  return text.trim();
}

// --- Grouping helpers ---

interface BatchGroup {
  type: "batch";
  batchId: string;
  batchName: string;
  items: GenerationSummary[];
}

interface DateGroup {
  type: "date";
  label: string;
  items: GenerationSummary[];
}

type Group = BatchGroup | DateGroup;

function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

function groupGenerations(gens: GenerationSummary[]): Group[] {
  const batched = new Map<string, BatchGroup>();
  const unbatched: GenerationSummary[] = [];

  for (const gen of gens) {
    if (gen.batch) {
      const existing = batched.get(gen.batch.id);
      if (existing) {
        existing.items.push(gen);
      } else {
        batched.set(gen.batch.id, {
          type: "batch",
          batchId: gen.batch.id,
          batchName: gen.batch.name,
          items: [gen],
        });
      }
    } else {
      unbatched.push(gen);
    }
  }

  const groups: Group[] = [];

  // Batch groups first, sorted by most recent item
  const batchGroups = Array.from(batched.values()).sort((a, b) => {
    const aDate = Math.max(...a.items.map((g) => new Date(g.createdAt).getTime()));
    const bDate = Math.max(...b.items.map((g) => new Date(g.createdAt).getTime()));
    return bDate - aDate;
  });
  groups.push(...batchGroups);

  // Then ungrouped by date
  if (unbatched.length > 0) {
    let currentLabel = "";
    for (const gen of unbatched) {
      const label = getDateGroupLabel(gen.createdAt);
      if (label !== currentLabel) {
        groups.push({ type: "date", label, items: [gen] });
        currentLabel = label;
      } else {
        (groups[groups.length - 1] as DateGroup).items.push(gen);
      }
    }
  }

  return groups;
}

function getBatchStatusSummary(items: GenerationSummary[]): { drafts: number; confirmed: number; recorded: number; winners: number } {
  return {
    drafts: items.filter((g) => !g.status || g.status === "draft").length,
    confirmed: items.filter((g) => g.status === "confirmed").length,
    recorded: items.filter((g) => g.status === "recorded").length,
    winners: items.filter((g) => g.status === "winner").length,
  };
}

// --- Main component ---

const FALLBACK_CTAS: ActiveCTA[] = [
  {
    id: "clase-gratis-A", channel: "Clase Gratuita", variant: "A",
    ingredients: ["#98 Tres Deliverables", "#89 Prueba por Volumen", "#106 Garantía Implícita", "#117 Escasez Real", "#109 Directo", "#126 Presuposición"],
    layers: {
      oferta: "En la clase gratuita de esta semana te muestro las 3 cosas que necesitás para arrancar: cómo encontrar productos que la gente ya está comprando, cómo crearlos con inteligencia artificial y cómo venderlos por WhatsApp. Son 2 horas. En vivo. Conmigo.",
      prueba: "Ya pasaron más de 17 mil personas por este programa. Desde amas de casa hasta ingenieros.",
      riesgo_cero: "Es gratis. No te pido plata, no te pido experiencia. Solo 2 horas de tu tiempo.",
      urgencia: "Los cupos son limitados porque es en vivo y no puedo atender a todo el mundo.",
      orden_nlp: "Tocá el botón de acá abajo y registrate. Te espero adentro.",
    },
    text: "En la clase gratuita de esta semana te muestro las 3 cosas que necesitás para arrancar: cómo encontrar productos que la gente ya está comprando, cómo crearlos con inteligencia artificial y cómo venderlos por WhatsApp. Son 2 horas. En vivo. Conmigo. Ya pasaron más de 17 mil personas por este programa. Desde amas de casa hasta ingenieros. Es gratis. No te pido plata, no te pido experiencia. Solo 2 horas de tu tiempo. Los cupos son limitados porque es en vivo y no puedo atender a todo el mundo. Tocá el botón de acá abajo y registrate. Te espero adentro.",
  },
  {
    id: "taller-5-A", channel: "Taller $5", variant: "A",
    ingredients: ["#71 Proceso de N Pasos", "#98 Tres Deliverables", "#89 Prueba por Volumen", "#103 Reducción al Absurdo", "#118 Deadline", "#117 Escasez", "#125 Reframe", "#126 Presuposición"],
    layers: {
      oferta: "Son 3 días conmigo. En vivo. Día 1: encontrás tu producto ganador con IA. Día 2: lo armás completo. Día 3: lo vendés por WhatsApp. Salís con tu producto creado, tu anuncio listo y tu primer sistema de ventas funcionando.",
      prueba: "Ya lo hicieron más de 17 mil personas en Argentina, Colombia, México y España.",
      riesgo_cero: "¿Cuánto vale? 5 dólares. Menos que un café. ¿Por qué tan barato? Porque yo no gano con el taller. Gano cuando a vos te va bien.",
      urgencia: "El taller arranca esta semana y los cupos son limitados porque es en vivo.",
      orden_nlp: "La pregunta no es si funciona. La pregunta es si vos vas a hacer algo. Tocá el botón de acá abajo. Nos vemos adentro.",
    },
    text: "Son 3 días conmigo. En vivo. Día 1: encontrás tu producto ganador con IA. Día 2: lo armás completo. Día 3: lo vendés por WhatsApp. Salís con tu producto creado, tu anuncio listo y tu primer sistema de ventas funcionando. Ya lo hicieron más de 17 mil personas en Argentina, Colombia, México y España. ¿Cuánto vale? 5 dólares. Menos que un café. ¿Por qué tan barato? Porque yo no gano con el taller. Gano cuando a vos te va bien. El taller arranca esta semana y los cupos son limitados porque es en vivo. La pregunta no es si funciona. La pregunta es si vos vas a hacer algo. Tocá el botón de acá abajo. Nos vemos adentro.",
  },
  {
    id: "instagram-A", channel: "Instagram Orgánico", variant: "A",
    ingredients: ["#89 Prueba por Volumen", "#110 Conversacional", "#127 Embedded Command"],
    layers: {
      oferta: "En la clase gratuita te muestro cómo encontrar productos que se venden, crearlos con IA y venderlos por WhatsApp. Paso a paso. Sin experiencia.",
      prueba: "Miles de personas ya lo hicieron.",
      riesgo_cero: "Es gratis. Son 2 horas. Sin compromiso.",
      urgencia: "Los cupos se están llenando.",
      orden_nlp: "Comentá 'CLASE' y andá al link de mi perfil para registrarte. Cuando entres, vas a ver exactamente cómo funciona. Te espero.",
    },
    text: "En la clase gratuita te muestro cómo encontrar productos que se venden, crearlos con IA y venderlos por WhatsApp. Paso a paso. Sin experiencia. Miles de personas ya lo hicieron. Es gratis. Son 2 horas. Sin compromiso. Los cupos se están llenando. Comentá 'CLASE' y andá al link de mi perfil para registrarte. Cuando entres, vas a ver exactamente cómo funciona. Te espero.",
  },
];

export default function SessionPack({ generations: initialGenerations, activeCTAs }: SessionPackProps) {
  const CTAS = activeCTAs && activeCTAs.length > 0 ? activeCTAs : FALLBACK_CTAS;
  const router = useRouter();
  const toast = useToast();
  const [generations, setGenerations] = useState(initialGenerations);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [filter, setFilter] = useState<GenerationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "duration" | "framework" | "status">("recent");
  const [collapsedBatches, setCollapsedBatches] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [renamingBatch, setRenamingBatch] = useState<{ id: string; name: string } | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverBatchId, setDragOverBatchId] = useState<string | null>(null);
  const [dragOverUngrouped, setDragOverUngrouped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBatchCollapse(batchId: string) {
    setCollapsedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  }

  const filteredGenerations = generations
    .filter((g) => {
      if (filter !== "all" && (g.status || "draft") !== filter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const titleMatch = g.title?.toLowerCase().includes(q);
        const hookMatch = g.script.hooks.some((h) => h.script_text.toLowerCase().includes(q) || h.hook_type.toLowerCase().includes(q));
        const frameworkMatch = g.script.development.framework_used.toLowerCase().includes(q);
        const bodyMatch = g.script.development.sections.some((s) => s.script_text.toLowerCase().includes(q));
        const platformMatch = resolveFormatLabel(g.script.platform_adaptation.platform).toLowerCase().includes(q);
        const formatMatch = g.script.visual_format?.format_name.toLowerCase().includes(q);
        const batchMatch = g.batch?.name.toLowerCase().includes(q);
        if (!titleMatch && !hookMatch && !frameworkMatch && !bodyMatch && !platformMatch && !formatMatch && !batchMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "duration":
          return b.script.total_duration_seconds - a.script.total_duration_seconds;
        case "framework":
          return a.script.development.framework_used.localeCompare(b.script.development.framework_used);
        case "status": {
          const order: Record<string, number> = { winner: 0, recorded: 1, confirmed: 2, draft: 3 };
          return (order[a.status || "draft"] ?? 2) - (order[b.status || "draft"] ?? 2);
        }
        default:
          return 0;
      }
    });

  function selectAll() {
    if (selected.size === filteredGenerations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredGenerations.map((g) => g.id)));
    }
  }

  const updateStatus = useCallback(async (id: string, status: GenerationStatus) => {
    setUpdatingStatus(id);
    try {
      const res = await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: id, status }),
      });
      if (!res.ok) throw new Error("Error updating status");

      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g))
      );
    } catch {
      toast("Error actualizando estado", "error");
    } finally {
      setUpdatingStatus(null);
    }
  }, []);

  const [confettiId, setConfettiId] = useState<string | null>(null);
  const [bounceId, setBounceId] = useState<string | null>(null);

  function selectStatus(genId: string, newStatus: GenerationStatus) {
    setStatusDropdown(null);
    updateStatus(genId, newStatus);
    setBounceId(genId);
    setTimeout(() => setBounceId(null), 600);
    if (newStatus === "winner") {
      setConfettiId(genId);
      setTimeout(() => setConfettiId(null), 1200);
    }
  }

  // --- Batch operations ---

  const existingBatches = (() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const g of generations) {
      if (g.batch) {
        const existing = map.get(g.batch.id);
        if (existing) existing.count++;
        else map.set(g.batch.id, { id: g.batch.id, name: g.batch.name, count: 1 });
      }
    }
    return Array.from(map.values());
  })();

  async function assignBatch(batchId: string | null, batchName: string) {
    setBatchLoading(true);
    setShowBatchModal(false);
    try {
      const body: Record<string, unknown> = {
        generationIds: Array.from(selected),
        batchName,
      };
      if (batchId) body.batchId = batchId;

      const res = await fetch("/api/generate/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error");
      const { batch } = await res.json();

      setGenerations((prev) =>
        prev.map((g) => selected.has(g.id) ? { ...g, batch } : g)
      );
      setSelected(new Set());
      toast(`${selected.size} guion${selected.size !== 1 ? "es" : ""} agrupado${selected.size !== 1 ? "s" : ""} en "${batch.name}"`);
    } catch {
      toast("Error agrupando guiones", "error");
    } finally {
      setBatchLoading(false);
    }
  }

  async function renameBatch(batchId: string, newName: string) {
    setRenamingBatch(null);
    try {
      const genIds = generations.filter((g) => g.batch?.id === batchId).map((g) => g.id);
      const res = await fetch("/api/generate/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationIds: genIds, batchId, batchName: newName }),
      });
      if (!res.ok) throw new Error("Error");

      setGenerations((prev) =>
        prev.map((g) => g.batch?.id === batchId ? { ...g, batch: { id: batchId, name: newName } } : g)
      );
      toast(`Carpeta renombrada a "${newName}"`);
    } catch {
      toast("Error renombrando", "error");
    }
  }

  async function removeBatch(generationIds: string[]) {
    try {
      const res = await fetch("/api/generate/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationIds }),
      });
      if (!res.ok) throw new Error("Error");

      setGenerations((prev) =>
        prev.map((g) => generationIds.includes(g.id) ? { ...g, batch: undefined } : g)
      );
      toast("Guiones desagrupados");
    } catch {
      toast("Error desagrupando", "error");
    }
  }

  // --- Drag & drop ---

  function handleDragStart(e: React.DragEvent, genId: string) {
    setDraggingId(genId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", genId);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggingId(null);
    setDragOverBatchId(null);
    setDragOverUngrouped(false);
  }

  async function handleDropOnBatch(e: React.DragEvent, batchId: string, batchName: string) {
    e.preventDefault();
    setDragOverBatchId(null);
    const genId = e.dataTransfer.getData("text/plain");
    if (!genId) return;

    // Don't drop on the same batch
    const gen = generations.find((g) => g.id === genId);
    if (gen?.batch?.id === batchId) return;

    try {
      const res = await fetch("/api/generate/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationIds: [genId], batchId, batchName }),
      });
      if (!res.ok) throw new Error("Error");
      const { batch } = await res.json();

      setGenerations((prev) =>
        prev.map((g) => g.id === genId ? { ...g, batch } : g)
      );
      toast(`Movido a "${batchName}"`);
    } catch {
      toast("Error moviendo guion", "error");
    }
  }

  async function handleDropOnUngrouped(e: React.DragEvent) {
    e.preventDefault();
    setDragOverUngrouped(false);
    const genId = e.dataTransfer.getData("text/plain");
    if (!genId) return;

    const gen = generations.find((g) => g.id === genId);
    if (!gen?.batch) return; // already ungrouped

    try {
      const res = await fetch("/api/generate/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationIds: [genId] }),
      });
      if (!res.ok) throw new Error("Error");

      setGenerations((prev) =>
        prev.map((g) => g.id === genId ? { ...g, batch: undefined } : g)
      );
      toast("Guion desagrupado");
    } catch {
      toast("Error desagrupando", "error");
    }
  }

  // --- Download/copy ---

  function downloadPack() {
    const selectedGens = filteredGenerations.filter((g) => selected.has(g.id));
    const text = generatePackText(selectedGens, CTAS);
    downloadFile(text, `pack-grabacion-${new Date().toISOString().slice(0, 10)}-${selectedGens.length}guiones.txt`);
    toast(`Pack descargado (${selectedGens.length} guiones)`);
  }

  function downloadPackPDF() {
    const selectedGens = filteredGenerations.filter((g) => selected.has(g.id));
    const html = generatePackHTML(selectedGens, CTAS);
    const w = window.open("", "_blank");
    if (!w) { toast("Permití popups para descargar el PDF"); return; }
    w.document.write(html);
    w.document.close();
    toast(`PDF listo — usá Cmd+P para guardar (${selectedGens.length} guiones)`);
  }

  function downloadTeleprompter() {
    const selectedGens = filteredGenerations.filter((g) => selected.has(g.id));
    const text = generateTeleprompterText(selectedGens);
    downloadFile(text, `teleprompter-${new Date().toISOString().slice(0, 10)}-${selectedGens.length}guiones.txt`);
    toast(`Teleprompter descargado (${selectedGens.length} guiones)`);
  }

  function downloadFile(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyPack() {
    const selectedGens = filteredGenerations.filter((g) => selected.has(g.id));
    const text = generatePackText(selectedGens, CTAS);
    navigator.clipboard.writeText(text);
    toast("Pack copiado al portapapeles");
  }

  async function deleteSelected() {
    const count = selected.size;
    if (count === 0) return;
    if (!confirm(`Borrar ${count} guion${count !== 1 ? "es" : ""}? Esta accion no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/generate/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Error");
      setGenerations((prev) => prev.filter((g) => !selected.has(g.id)));
      setSelected(new Set());
      toast(`${count} guion${count !== 1 ? "es" : ""} borrado${count !== 1 ? "s" : ""}`);
    } catch {
      toast("Error borrando guiones", "error");
    } finally {
      setDeleting(false);
    }
  }

  // --- Render generation card ---

  function renderGenCard(gen: GenerationSummary) {
    const status = gen.status || "draft";
    const config = STATUS_CONFIG[status];
    return (
      <div
        key={gen.id}
        draggable
        onDragStart={(e) => handleDragStart(e, gen.id)}
        onDragEnd={handleDragEnd}
        className={`relative border rounded-2xl p-6 transition-all duration-300 flex gap-4 hover-glow hover-lift cursor-grab active:cursor-grabbing ${
          selected.has(gen.id)
            ? "border-purple-500/30 bg-purple-500/5 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/5"
            : "border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/40"
        } ${draggingId === gen.id ? "opacity-50 scale-[0.98]" : ""} ${bounceId === gen.id ? "animate-success-bounce" : ""} ${bounceId === gen.id && status !== "winner" ? "animate-success-flash" : ""}`}
      >
        {confettiId === gen.id && <Confetti trigger={true} />}
        <button
          onClick={(e) => { e.preventDefault(); toggleSelect(gen.id); }}
          className="shrink-0 mt-1"
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              selected.has(gen.id)
                ? "bg-gradient-to-r from-purple-600 to-violet-600 border-purple-600"
                : "border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {selected.has(gen.id) && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
          </div>
        </button>
        <a href={`/scripts/${gen.id}`} className="flex-1 min-w-0">
          {gen.title && (
            <p className="text-sm font-medium text-zinc-100 mb-1 truncate">{gen.title}</p>
          )}
          <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
            <span className="badge bg-zinc-800/80 text-zinc-400 border-zinc-700/50">
              {resolveFormatLabel(gen.script.platform_adaptation.platform)}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">{gen.script.total_duration_seconds}s</span>
            <span className="text-[11px] text-zinc-500">{gen.script.development.framework_used}</span>
            <span className="text-[11px] text-zinc-500">{gen.script.hooks.length} leads</span>
            {gen.script.visual_format && (
              <span className="badge bg-blue-500/10 text-blue-400 border-blue-500/20">
                {gen.script.visual_format.format_name}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-300 truncate">
            {gen.script.hooks[0]?.script_text.substring(0, 100)}...
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            <RelativeTime date={gen.createdAt} />
          </p>
        </a>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="relative">
            <button
              data-status-trigger={gen.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusDropdown(statusDropdown === gen.id ? null : gen.id); }}
              disabled={updatingStatus === gen.id}
              className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur transition-all flex items-center gap-1 ${config.color} ${
                updatingStatus === gen.id ? "opacity-50" : "hover:opacity-80"
              } ${status === "winner" ? "badge-winner" : ""}`}
            >
              {updatingStatus === gen.id ? "..." : config.label}
              <svg className={`w-2.5 h-2.5 transition-transform ${statusDropdown === gen.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {statusDropdown === gen.id && (
              <StatusDropdown
                currentStatus={status}
                onSelect={(s) => { selectStatus(gen.id, s); }}
                onClose={() => setStatusDropdown(null)}
                triggerRef={gen.id}
              />
            )}
          </div>
          {status === "confirmed" && (
            <span className="text-[9px] text-blue-400/50">{gen.script.hooks.length} leads quemados</span>
          )}
          {status === "recorded" && (
            <span className="text-[9px] text-red-400/50">{gen.script.hooks.length} leads quemados</span>
          )}
          {status === "winner" && (
            <span className="text-[9px] text-amber-400/50">{gen.script.hooks.length} leads quemados</span>
          )}
        </div>
      </div>
    );
  }

  if (generations.length === 0) return null;

  const groups = groupGenerations(filteredGenerations);

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-5">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900/40 backdrop-blur border border-zinc-800/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
          placeholder="Buscar por titulo, hook, framework, nicho, formato, carpeta..."
        />
        {search ? (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5">
            <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium text-zinc-600 bg-zinc-800/40 border border-zinc-700/30 rounded-md font-mono">&#8984;</kbd>
            <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium text-zinc-600 bg-zinc-800/40 border border-zinc-700/30 rounded-md font-mono">K</kbd>
          </div>
        )}
      </div>
      {search.trim() && (
        <p className="text-xs text-zinc-500 -mt-2 mb-4">
          {filteredGenerations.length === 0 ? "Sin resultados" : `${filteredGenerations.length} resultado${filteredGenerations.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Filter tabs + sort */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 bg-zinc-900/30 rounded-xl p-1 border border-zinc-800/30">
          {(["all", "draft", "recorded", "winner"] as const).map((f) => {
            const count = f === "all" ? generations.length : generations.filter((g) => (g.status || "draft") === f).length;
            if (count === 0 && f !== "all") return null;
            const labels: Record<string, string> = { all: "Todos", draft: "Borradores", recorded: "Grabados", winner: "Winners" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3.5 py-2 rounded-lg transition-all duration-200 ${
                  filter === f
                    ? "bg-white/10 text-white font-medium shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {labels[f]} <span className="text-zinc-600 ml-0.5">{count}</span>
              </button>
            );
          })}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-zinc-900/40 backdrop-blur border border-zinc-800/50 text-zinc-400 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/10 transition-all"
        >
          <option value="recent">Mas recientes</option>
          <option value="oldest">Mas antiguos</option>
          <option value="duration">Duracion</option>
          <option value="framework">Framework A-Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Selection bar */}
      {selected.size > 0 ? (
        <div className="sticky top-[65px] z-40 -mx-6 px-6 py-3 mb-5 bg-zinc-950/90 backdrop-blur-2xl border-b border-purple-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {selected.size === filteredGenerations.length ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
            <span className="text-xs text-purple-400 font-medium">
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              {deleting ? "Borrando..." : `Borrar (${selected.size})`}
            </button>
            {/* Group button */}
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={batchLoading}
              className="border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              {batchLoading ? "..." : "Agrupar"}
            </button>
            <button
              onClick={copyPack}
              className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            >
              Copiar pack
            </button>
            <button
              onClick={downloadTeleprompter}
              className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
              </svg>
              Teleprompter
            </button>
            <button
              onClick={downloadPack}
              className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              TXT
            </button>
            <button
              onClick={downloadPackPDF}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Descargar PDF ({selected.size})
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={selectAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Seleccionar todo
          </button>
        </div>
      )}

      {/* Generation list grouped by batch/date */}
      <div className="grid gap-4 stagger-children">
        {filteredGenerations.length > 0 ? (
          groups.map((group) => {
            if (group.type === "batch") {
              const isCollapsed = collapsedBatches.has(group.batchId);
              const summary = getBatchStatusSummary(group.items);
              const allSelected = group.items.every((g) => selected.has(g.id));
              const someSelected = group.items.some((g) => selected.has(g.id));

              return (
                <div key={`batch-${group.batchId}`} className="mb-2">
                  {/* Batch folder header */}
                  <div
                    className={`group/folder flex items-center gap-3 py-3 px-4 -mx-4 rounded-xl hover:bg-zinc-900/40 transition-all cursor-pointer ${
                      dragOverBatchId === group.batchId ? "bg-purple-500/10 border border-purple-500/30 ring-2 ring-purple-500/20" : ""
                    }`}
                    onClick={() => toggleBatchCollapse(group.batchId)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverBatchId(group.batchId);
                    }}
                    onDragLeave={() => setDragOverBatchId(null)}
                    onDrop={(e) => handleDropOnBatch(e, group.batchId, group.batchName)}
                  >
                    {/* Select all in batch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const ids = group.items.map((g) => g.id);
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (allSelected) {
                            ids.forEach((id) => next.delete(id));
                          } else {
                            ids.forEach((id) => next.add(id));
                          }
                          return next;
                        });
                      }}
                      className="shrink-0"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          allSelected
                            ? "bg-gradient-to-r from-purple-600 to-violet-600 border-purple-600"
                            : someSelected
                            ? "border-purple-500/50 bg-purple-500/20"
                            : "border-zinc-700 group-hover/folder:border-zinc-500"
                        }`}
                      >
                        {allSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                        {someSelected && !allSelected && (
                          <div className="w-1.5 h-0.5 bg-purple-400 rounded-full" />
                        )}
                      </div>
                    </button>

                    {/* Folder icon */}
                    <svg className={`w-4.5 h-4.5 transition-colors ${isCollapsed ? "text-zinc-600" : "text-purple-400"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>

                    {/* Batch name + stats */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-200 truncate">{group.batchName}</span>
                      <span className="text-[10px] text-zinc-600">{group.items.length} guiones</span>
                      <div className="flex items-center gap-2">
                        {summary.drafts > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />{summary.drafts}
                          </span>
                        )}
                        {summary.recorded > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-green-400/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{summary.recorded}
                          </span>
                        )}
                        {summary.winners > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{summary.winners}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingBatch({ id: group.batchId, name: group.batchName }); }}
                        className="p-1.5 rounded-lg hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-all"
                        title="Renombrar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Desagrupar "${group.batchName}"? Los ${group.items.length} guiones van a quedar sueltos.`)) {
                            removeBatch(group.items.map((g) => g.id));
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                        title="Desagrupar carpeta"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Chevron */}
                    <svg className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Batch items */}
                  {!isCollapsed && (
                    <div className="grid gap-3 pl-4 border-l-2 border-purple-500/10 ml-2 mt-1 mb-4">
                      {group.items.map(renderGenCard)}
                    </div>
                  )}
                </div>
              );
            }

            // Date group (ungrouped)
            return (
              <div
                key={`date-${group.label}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverUngrouped(true);
                }}
                onDragLeave={() => setDragOverUngrouped(false)}
                onDrop={handleDropOnUngrouped}
                className={dragOverUngrouped ? "rounded-xl ring-2 ring-zinc-500/30 bg-zinc-800/20 transition-all" : "transition-all"}
              >
                <div className="section-divider mb-3 mt-4">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500 shrink-0">{group.label}</span>
                  {draggingId && <span className="text-[10px] text-zinc-600 ml-2">soltar para desagrupar</span>}
                </div>
                <div className="grid gap-4">
                  {group.items.map(renderGenCard)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-zinc-600 text-sm">
            {debouncedSearch ? "Sin resultados para esta busqueda" : "No hay guiones con este filtro"}
          </div>
        )}
      </div>

      {/* Drop zone to ungrouped — only visible when dragging and all items are batched */}
      {draggingId && !groups.some((g) => g.type === "date") && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDragOverUngrouped(true);
          }}
          onDragLeave={() => setDragOverUngrouped(false)}
          onDrop={handleDropOnUngrouped}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragOverUngrouped
              ? "border-zinc-500/50 bg-zinc-800/30 text-zinc-400"
              : "border-zinc-800/30 text-zinc-600"
          }`}
        >
          <p className="text-xs">Soltar acá para desagrupar</p>
        </div>
      )}

      {/* Batch modal */}
      {showBatchModal && (
        <BatchModal
          onClose={() => setShowBatchModal(false)}
          onSubmit={assignBatch}
          existingBatches={existingBatches}
          selectedCount={selected.size}
        />
      )}

      {/* Rename batch modal */}
      {renamingBatch && (
        <RenameBatchModal
          batchName={renamingBatch.name}
          onClose={() => setRenamingBatch(null)}
          onSubmit={(name) => renameBatch(renamingBatch.id, name)}
        />
      )}
    </>
  );
}
