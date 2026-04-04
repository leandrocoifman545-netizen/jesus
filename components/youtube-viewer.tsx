"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";
import InlineEdit from "./inline-edit";
import type { LongformOutput } from "@/lib/ai/schemas/longform-output";

type GenerationStatus = "draft" | "confirmed" | "recorded" | "winner";

const STATUS_CONFIG: Record<GenerationStatus, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15" },
  recorded: { label: "Grabado", color: "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15" },
  winner: { label: "Winner", color: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15" },
};

const ALL_STATUSES: GenerationStatus[] = ["draft", "confirmed", "recorded", "winner"];

interface WinnerMetrics {
  ctr?: number;
  hookRate?: number;
  holdRate?: number;
  cpa?: number;
  roas?: number;
  notes?: string;
  recordedAt?: string;
}

interface CTABlock {
  channel: string;
  channel_label?: string;
  variant?: string;
  layers?: Record<string, string>;
  text?: string;
}

interface Generation {
  id: string;
  title?: string;
  status?: string;
  contentType?: string;
  metrics?: WinnerMetrics;
  sessionNotes?: string;
  longform?: LongformOutput;
  script: {
    platform_adaptation: { platform: string };
    total_duration_seconds: number;
    word_count: number;
    hooks: Array<{ script_text: string }>;
    development: {
      framework_used: string;
      emotional_arc: string;
      sections: Array<{ section_name: string; script_text: string; timing_seconds: number }>;
    };
    cta_blocks?: CTABlock[];
  };
}

const CTA_LAYER_LABELS: Record<string, string> = {
  oferta: "OFERTA", prueba: "PRUEBA", riesgo_cero: "RIESGO CERO",
  urgencia: "URGENCIA", orden_nlp: "ORDEN + NLP",
  orden_1: "ORDEN 1", orden_2: "CIERRE", cierre: "CIERRE",
};

interface Props {
  generation: Generation;
}

export default function YouTubeViewer({ generation }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [lf, setLf] = useState<LongformOutput | undefined>(generation.longform);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set([1]));
  const [copied, setCopied] = useState<string | null>(null);

  // Status management
  const [status, setStatus] = useState<GenerationStatus>((generation.status as GenerationStatus) || "draft");
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Metrics & notes
  const [metrics, setMetrics] = useState<WinnerMetrics>(generation.metrics || {});
  const [sessionNotes, setSessionNotes] = useState(generation.sessionNotes || "");
  const [showMetrics, setShowMetrics] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  // Title editing
  const [title, setTitle] = useState(generation.title || lf?.title || "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [savingTitle, setSavingTitle] = useState(false);

  // Chapter regeneration
  const [regenChapter, setRegenChapter] = useState<number | null>(null);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Teleprompter
  const [teleprompter, setTeleprompter] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  const generationId = generation.id;

  if (!lf) {
    return <p className="text-zinc-500">Este video no tiene datos de long-form.</p>;
  }

  function toggleChapter(num: number) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  function expandAll() {
    if (!lf) return;
    setOpenChapters(new Set(lf.chapters.map((ch) => ch.number)));
  }

  function collapseAll() {
    setOpenChapters(new Set());
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyFullScript() {
    if (!lf) return;
    let full = `# ${lf.title}\n\n`;
    full += `## Hook\n${lf.hook.script_text}\n\n`;
    for (const ch of lf.chapters) {
      full += `## ${ch.title}\n${ch.content}\n\n`;
      const transition = lf.transitions.find((t) => t.from_chapter === ch.number);
      if (transition) full += `> ${transition.transition_text}\n\n`;
    }
    full += `## Conclusión\n${lf.conclusion.content}\n\n`;
    full += `## CTA\n${lf.cta.primary_text}\n`;
    copyText(full, "full");
    toast("Guión completo copiado");
  }

  // --- Status ---
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
      router.refresh();
    } catch {
      toast("Error actualizando estado", "error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // --- Metrics & Notes ---
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
      toast("Guardado");
    } catch {
      toast("Error guardando", "error");
    } finally {
      setSavingMeta(false);
    }
  }

  // --- Inline edit (longform fields) ---
  const handleEdit = useCallback(async (path: string, value: string) => {
    const res = await fetch("/api/generate/edit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId, path: `longform.${path}`, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (data.longform) setLf(data.longform);
  }, [generationId]);

  const handleSaveTransition = useCallback(async (fromChapter: number, value: string) => {
    if (!lf) return;
    const idx = lf.transitions.findIndex((t) => t.from_chapter === fromChapter);
    if (idx === -1) return;
    await handleEdit(`transitions.${idx}.transition_text`, value);
  }, [lf, handleEdit]);

  // --- Title ---
  async function saveTitle() {
    if (titleDraft === title) { setEditingTitle(false); return; }
    setSavingTitle(true);
    try {
      const res = await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, title: titleDraft }),
      });
      if (!res.ok) throw new Error("Error");
      setTitle(titleDraft);
      setEditingTitle(false);
      toast("Título guardado");
    } catch {
      toast("Error guardando título", "error");
    } finally {
      setSavingTitle(false);
    }
  }

  // --- Delete ---
  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/generate/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId }),
      });
      if (!res.ok) throw new Error("Error");
      toast("Video eliminado");
      router.push("/youtube");
      router.refresh();
    } catch {
      toast("Error eliminando", "error");
      setDeleting(false);
    }
  }

  // --- Duplicate ---
  async function handleDuplicate() {
    try {
      const res = await fetch("/api/generate/longform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceGenerationId: generationId }),
      });
      if (!res.ok) throw new Error("Error");
      const data = await res.json();
      toast("Video duplicado");
      router.push(`/youtube/${data.generationId}`);
      router.refresh();
    } catch {
      toast("Error duplicando", "error");
    }
  }

  // --- Chapter regeneration ---
  async function handleRegenChapter(index: number) {
    setRegenChapter(index);
    try {
      const res = await fetch("/api/generate/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, target: "chapter", index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.longform) setLf(data.longform);
      toast("Capítulo regenerado");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error regenerando", "error");
    } finally {
      setRegenChapter(null);
    }
  }

  // --- Teleprompter ---
  function openTeleprompter() {
    setTeleprompter(true);
    setTimeout(() => {
      teleprompterRef.current?.focus();
    }, 100);
  }

  // --- Download TXT ---
  function downloadTXT() {
    let text = "";
    if (lf) {
      text += `${lf.title}\n${"=".repeat(60)}\n\n`;
      text += `Hook (${lf.hook.estimated_duration_seconds}s)\n${"-".repeat(40)}\n${lf.hook.script_text}\n\n`;
      for (const ch of lf.chapters) {
        text += `Cap ${ch.number}: ${ch.title} (${Math.round(ch.estimated_duration_seconds / 60)} min)\n${"-".repeat(40)}\n${ch.content}\n`;
        if (ch.key_points.length > 0) {
          text += `\nPuntos clave:\n${ch.key_points.map((p) => `  • ${p}`).join("\n")}\n`;
        }
        if (ch.visual_notes) text += `\n[Visual] ${ch.visual_notes}\n`;
        const transition = lf.transitions.find((t) => t.from_chapter === ch.number);
        if (transition) text += `\n→ ${transition.transition_text}\n`;
        text += "\n";
      }
      text += `Conclusión (${Math.round(lf.conclusion.estimated_duration_seconds / 60)} min)\n${"-".repeat(40)}\n${lf.conclusion.content}\n\n`;
      text += `CTA\n${"-".repeat(40)}\n${lf.cta.primary_text}\n`;
      if (lf.cta.midroll_text) text += `Mid-roll: ${lf.cta.midroll_text}\n`;
      if (lf.cta.end_screen_notes) text += `End screen: ${lf.cta.end_screen_notes}\n`;
    } else {
      // Shortform fallback
      const s = generation.script;
      text += `${generation.title || "Guión"}\n${"=".repeat(60)}\n\n`;
      text += `LEADS\n${"-".repeat(40)}\n\n`;
      for (const hook of s.hooks) {
        text += `${hook.script_text}\n\n--- CORTE ---\n\n`;
      }
      text += `CUERPO\n${"-".repeat(40)}\n\n`;
      for (const section of s.development.sections) {
        text += `[${section.section_name}]\n${section.script_text}\n\n`;
      }
    }
    // CTA Blocks (if present)
    const blocks = generation.script.cta_blocks;
    if (blocks && blocks.length > 0) {
      text += `\n${"=".repeat(40)}\nBLOQUES CTA\n${"=".repeat(40)}\n\n`;
      for (const block of blocks) {
        const label = block.channel_label || block.channel || "CTA";
        text += `--- ${label.toUpperCase()} (Variante ${block.variant || "?"}) ---\n\n`;
        if (block.layers) {
          for (const [key, val] of Object.entries(block.layers)) {
            if (!val) continue;
            text += `[${CTA_LAYER_LABELS[key] || key.toUpperCase()}]\n${val}\n\n`;
          }
        } else if (block.text) {
          text += `${block.text}\n\n`;
        }
        text += `--- CORTE ---\n\n`;
      }
    }
    if (lf) {
      text += `\nSEO\n${"-".repeat(40)}\nTítulo: ${lf.seo.title}\nDescripción: ${lf.seo.description}\nTags: ${lf.seo.tags.join(", ")}\nThumbnail: ${lf.seo.thumbnail_idea}\n`;
      if (lf.production_notes) text += `\nNotas de producción\n${"-".repeat(40)}\n${lf.production_notes}\n`;
    }

    const fileName = (lf?.title || generation.title || "guion").replace(/[^a-zA-Z0-9áéíóúñ ]/g, "").slice(0, 50);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Download PDF (HTML-based) ---
  function downloadPDF() {
    if (!lf) {
      // Shortform: generate simple HTML PDF
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
      const s = generation.script;
      const titleText = generation.title || "Guión";
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(titleText)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.7}
h1{font-size:24pt;margin-bottom:8px}h2{font-size:14pt;color:#7c3aed;text-transform:uppercase;letter-spacing:0.1em;margin-top:32px}
.section{background:#f9fafb;border-radius:12px;padding:20px;margin:12px 0;border:1px solid #e5e7eb}
.section-name{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#71717a;margin-bottom:8px}
.lead{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:12px 0}
.cta-block{border-left:3px solid #a855f7;padding:12px 16px;margin:12px 0;background:#faf5ff;border-radius:8px}
.cta-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#a855f7;margin-bottom:6px}
.layer-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:2px;margin-top:10px}
</style></head><body>
<h1>${esc(titleText)}</h1>
<p style="color:#71717a;font-size:10pt">${s.total_duration_seconds}s | ~${s.word_count} palabras | ${s.development.framework_used}</p>
<h2>Leads</h2>`;
      for (let i = 0; i < s.hooks.length; i++) {
        html += `<div class="lead"><strong>Lead ${i + 1}</strong><br>${esc(s.hooks[i].script_text)}</div>`;
      }
      html += `<h2>Cuerpo</h2>`;
      for (const sec of s.development.sections) {
        html += `<div class="section"><div class="section-name">${esc(sec.section_name)}</div>${esc(sec.script_text)}</div>`;
      }
      const blocks = s.cta_blocks;
      if (blocks && blocks.length > 0) {
        html += `<h2>Bloques CTA</h2>`;
        for (const b of blocks) {
          const label = (b.channel_label || b.channel || "CTA").toUpperCase();
          html += `<div class="cta-block"><div class="cta-label">${esc(label)} — Variante ${b.variant || "?"}</div>`;
          if (b.layers) {
            for (const [key, val] of Object.entries(b.layers)) {
              if (!val) continue;
              html += `<div class="layer-label">${CTA_LAYER_LABELS[key] || key.toUpperCase()}</div><div>${esc(val)}</div>`;
            }
          } else if (b.text) {
            html += `<div>${esc(b.text)}</div>`;
          }
          html += `</div>`;
        }
      }
      html += `<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast("PDF listo — guardalo como PDF");
      return;
    }
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    const totalMin = Math.round(lf.total_duration_seconds / 60);
    const date = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    // --- Metadata badges ---
    const metaItems: string[] = [];
    if (lf.avatar) metaItems.push(`<span class="meta-item"><span class="meta-label">Avatar:</span> ${esc(lf.avatar)}</span>`);
    if (lf.awareness_level) metaItems.push(`<span class="meta-item"><span class="meta-label">Schwartz:</span> Nivel ${lf.awareness_level}</span>`);
    if (lf.angle_family) metaItems.push(`<span class="meta-item"><span class="meta-label">Ángulo:</span> ${esc(lf.angle_family)}</span>`);
    if (lf.niche) metaItems.push(`<span class="meta-item"><span class="meta-label">Nicho:</span> ${esc(lf.niche)}</span>`);
    if (lf.tension) metaItems.push(`<span class="meta-item"><span class="meta-label">Tensión:</span> ${esc(lf.tension)}</span>`);

    // --- TOC ---
    const tocHTML = lf.chapters.map((ch, i) => `
      <div class="toc-item">
        <span class="toc-num">${ch.number}</span>
        <span class="toc-title">${esc(ch.title)}</span>
        <span class="toc-duration">${Math.round(ch.estimated_duration_seconds / 60)} min</span>
      </div>`).join("");

    // --- Chapters ---
    const chaptersHTML = lf.chapters.map((ch) => {
      const transition = lf.transitions.find((t) => t.from_chapter === ch.number);
      return `
      <div class="chapter-page page-break">
        <div class="chapter-header">
          <div class="chapter-num">Capítulo ${ch.number} de ${lf.chapters.length}</div>
          <div class="chapter-title">${esc(ch.title)}</div>
          <div class="chapter-duration">${Math.round(ch.estimated_duration_seconds / 60)} min · ~${Math.round(ch.estimated_duration_seconds * 2.5)} palabras</div>
        </div>
        <div class="chapter-body">
          <div class="chapter-text">${esc(ch.content)}</div>
          ${ch.key_points.length > 0 ? `
          <div class="key-points no-break">
            <div class="key-points-label">Puntos clave</div>
            <ul>${ch.key_points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          </div>` : ""}
          ${ch.visual_notes ? `<div class="visual-note no-break"><span class="visual-icon">🎬</span> ${esc(ch.visual_notes)}</div>` : ""}
        </div>
        ${transition ? `
        <div class="transition no-break">
          <div class="transition-label">Transición → Cap ${transition.to_chapter}</div>
          <div class="transition-text">&ldquo;${esc(transition.transition_text)}&rdquo;</div>
        </div>` : ""}
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(lf.title)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  :root {
    --red: #dc2626; --red-light: #fef2f2; --red-dark: #991b1b;
    --blue: #2563eb; --blue-light: #eff6ff;
    --purple: #7c3aed; --purple-light: #ede9fe;
    --green: #059669; --green-light: #ecfdf5;
    --amber: #d97706; --amber-light: #fffbeb;
    --gray-50: #f9fafb; --gray-100: #f3f4f6; --gray-200: #e5e7eb;
    --gray-500: #6b7280; --gray-700: #374151; --gray-900: #111827;
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
    .chapter-page { background: white; margin: 20px auto; padding: 40px 50px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .cover { min-height: 100vh; }
  }
  .print-hint {
    position: fixed; top: 16px; right: 16px; background: var(--red); color: white;
    padding: 12px 20px; border-radius: 12px; font-size: 10pt; font-weight: 600;
    cursor: pointer; z-index: 100; box-shadow: 0 4px 12px rgba(220,38,38,0.4);
  }
  .print-hint:hover { background: var(--red-dark); }

  /* Cover */
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 60px 40px; }
  .cover-icon { width: 80px; height: 80px; background: var(--red); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; font-size: 36px; color: white; }
  .cover h1 { font-size: 28pt; font-weight: 800; color: var(--gray-900); letter-spacing: -0.02em; margin-bottom: 8px; max-width: 500px; }
  .cover .subtitle { font-size: 14pt; color: var(--gray-500); font-weight: 400; margin-bottom: 48px; }
  .cover-divider { width: 60px; height: 4px; background: var(--red); border-radius: 2px; margin: 40px 0; }
  .cover-meta { display: flex; gap: 32px; color: var(--gray-500); font-size: 10pt; }
  .cover-badge { display: inline-block; background: var(--red-light); color: var(--red); padding: 4px 16px; border-radius: 20px; font-size: 11pt; font-weight: 600; margin-bottom: 16px; }

  /* TOC */
  .toc h2 { font-size: 18pt; font-weight: 700; margin-bottom: 24px; }
  .toc-item { display: flex; align-items: baseline; padding: 10px 0; border-bottom: 1px solid var(--gray-100); }
  .toc-num { font-weight: 700; color: var(--red); min-width: 28px; font-size: 12pt; }
  .toc-title { font-weight: 500; flex: 1; }
  .toc-duration { color: var(--gray-500); font-size: 9pt; }

  /* Metadata */
  .meta-section { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
  .meta-section h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-500); margin-bottom: 12px; }
  .meta-grid { display: flex; flex-wrap: wrap; gap: 16px; }
  .meta-item { display: flex; align-items: center; gap: 4px; font-size: 9.5pt; }
  .meta-label { font-weight: 600; color: var(--gray-700); }
  .emotional-arc { font-style: italic; color: var(--gray-500); font-size: 10pt; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--gray-200); }

  /* Hook */
  .hook-section { background: var(--red-light); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid var(--red); }
  .hook-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--red); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .hook-duration { font-weight: 400; color: var(--red-dark); opacity: 0.7; }
  .hook-text { font-size: 11pt; line-height: 1.7; color: var(--gray-900); }
  .hook-visual { font-size: 9pt; color: var(--gray-500); font-style: italic; margin-top: 12px; }

  /* Chapters */
  .chapter-header { background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%); color: white; padding: 28px 32px; border-radius: 12px 12px 0 0; }
  .chapter-num { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 6px; }
  .chapter-title { font-size: 18pt; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 8px; }
  .chapter-duration { font-size: 9pt; opacity: 0.85; }
  .chapter-body { background: white; border: 1px solid var(--gray-200); border-top: none; padding: 24px 32px; border-radius: 0 0 12px 12px; margin-bottom: 16px; }
  .chapter-text { font-size: 11pt; line-height: 1.8; color: var(--gray-900); }
  .key-points { background: var(--gray-50); border-radius: 8px; padding: 16px 20px; margin-top: 20px; }
  .key-points-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-500); margin-bottom: 8px; }
  .key-points ul { margin: 0; padding-left: 20px; font-size: 9.5pt; color: var(--gray-700); }
  .key-points li { margin-bottom: 4px; }
  .visual-note { font-size: 9pt; color: var(--gray-500); font-style: italic; margin-top: 16px; padding: 10px 14px; background: var(--amber-light); border-radius: 6px; }
  .visual-icon { font-style: normal; }

  /* Transitions */
  .transition { margin: 0 0 24px; padding: 14px 18px; background: var(--amber-light); border: 1px solid #fde68a; border-left: 3px solid var(--amber); border-radius: 8px; }
  .transition-label { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--amber); margin-bottom: 4px; }
  .transition-text { font-size: 10pt; line-height: 1.6; color: var(--gray-700); }

  /* Conclusion */
  .conclusion-section { border-left: 4px solid var(--gray-700); padding: 24px; margin: 24px 0; background: var(--gray-50); border-radius: 0 12px 12px 0; }
  .conclusion-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-700); margin-bottom: 12px; }
  .conclusion-text { font-size: 11pt; line-height: 1.7; }

  /* CTA */
  .cta-section { background: var(--red-light); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #fecaca; }
  .cta-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--red); margin-bottom: 12px; }
  .cta-text { font-size: 11pt; line-height: 1.7; font-weight: 500; }
  .cta-sub { font-size: 9.5pt; color: var(--gray-500); margin-top: 8px; }

  /* SEO */
  .seo-section { background: var(--blue-light); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #bfdbfe; }
  .seo-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--blue); margin-bottom: 16px; }
  .seo-field { margin-bottom: 14px; }
  .seo-field:last-child { margin-bottom: 0; }
  .seo-field-label { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--blue); opacity: 0.7; margin-bottom: 4px; }
  .seo-field-value { font-size: 10pt; color: var(--gray-700); }
  .seo-field-value strong { color: var(--gray-900); font-size: 11pt; }
  .tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 6px; font-size: 9pt; margin: 2px; font-weight: 500; }

  /* Production notes */
  .notes-section { background: var(--purple-light); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #c4b5fd; }
  .notes-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--purple); margin-bottom: 12px; }
  .notes-text { font-size: 9.5pt; line-height: 1.6; color: var(--gray-700); }

  /* Footer */
  .footer { text-align: center; padding: 40px; color: var(--gray-500); font-size: 9pt; }
</style>
</head>
<body>

<button class="print-hint" onclick="window.print()">Guardar como PDF</button>

<!-- COVER -->
<div class="page cover">
  <div class="cover-icon">▶</div>
  <div class="cover-badge">${esc(lf.framework)}</div>
  <h1>${esc(lf.title)}</h1>
  <p class="subtitle">${esc(date)}</p>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <span><strong>${totalMin}</strong>&nbsp;min</span>
    <span><strong>~${lf.word_count}</strong>&nbsp;palabras</span>
    <span><strong>${lf.chapters.length}</strong>&nbsp;capítulos</span>
  </div>
</div>

<!-- TOC + META -->
<div class="page toc page-break">
  <h2>Estructura del video</h2>
  <div class="toc-item" style="border-bottom:2px solid var(--red-light);">
    <span class="toc-num" style="color:var(--red);">▶</span>
    <span class="toc-title" style="font-weight:600;">Hook</span>
    <span class="toc-duration">${lf.hook.estimated_duration_seconds}s</span>
  </div>
  ${tocHTML}
  <div class="toc-item" style="border-bottom:none;">
    <span class="toc-num" style="color:var(--gray-500);">✦</span>
    <span class="toc-title">Conclusión + CTA</span>
    <span class="toc-duration">${lf.conclusion.estimated_duration_seconds}s</span>
  </div>

  ${metaItems.length > 0 ? `
  <div class="meta-section">
    <h3>Metadata de generación</h3>
    <div class="meta-grid">${metaItems.join("")}</div>
    <div class="emotional-arc"><strong>Arco emocional:</strong> ${esc(lf.emotional_arc)}</div>
  </div>` : `
  <div class="meta-section">
    <div class="emotional-arc" style="border:none;padding:0;margin:0;"><strong>Arco emocional:</strong> ${esc(lf.emotional_arc)}</div>
  </div>`}
</div>

<!-- HOOK -->
<div class="page page-break">
  <div class="hook-section">
    <div class="hook-label">Hook <span class="hook-duration">— ${lf.hook.estimated_duration_seconds}s</span></div>
    <div class="hook-text">${esc(lf.hook.script_text)}</div>
    ${lf.hook.visual_notes ? `<div class="hook-visual">🎬 ${esc(lf.hook.visual_notes)}</div>` : ""}
  </div>
</div>

<!-- CHAPTERS -->
${chaptersHTML}

<!-- CONCLUSION -->
<div class="page page-break">
  <div class="conclusion-section">
    <div class="conclusion-label">Conclusión — ${lf.conclusion.estimated_duration_seconds}s</div>
    <div class="conclusion-text">${esc(lf.conclusion.content)}</div>
  </div>

  <!-- CTA -->
  ${lf.cta?.primary_text || lf.cta?.midroll_text || lf.cta?.end_screen_notes ? `
  <div class="cta-section">
    <div class="cta-label">Call to Action</div>
    ${lf.cta.primary_text ? `<div class="cta-text">${esc(lf.cta.primary_text)}</div>` : ""}
    ${lf.cta.midroll_text ? `<div class="cta-sub"><strong>Mid-roll:</strong> ${esc(lf.cta.midroll_text)}</div>` : ""}
    ${lf.cta.end_screen_notes ? `<div class="cta-sub"><strong>End screen:</strong> ${esc(lf.cta.end_screen_notes)}</div>` : ""}
  </div>` : ""}

  ${(() => {
    const ctaBlocks = generation.script?.cta_blocks;
    if (!ctaBlocks || ctaBlocks.length === 0) return "";
    const channelColors: Record<string, string> = {
      clase_gratuita: "#10b981", taller_5: "#f59e0b", instagram: "#ec4899",
    };
    return `
    <div style="margin-top:24px;">
      <div style="font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--gray-500);margin-bottom:16px;">Bloques CTA (grabar una vez)</div>
      ${ctaBlocks.map(b => {
        const label = (b.channel_label || b.channel || "CTA").toUpperCase();
        const color = channelColors[b.channel] || "#71717a";
        const layersHtml = b.layers
          ? Object.entries(b.layers).filter(([,v]) => v).map(([key, val]) => `
            <div style="margin-bottom:8px;">
              <span style="font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${color};">${CTA_LAYER_LABELS[key] || key.toUpperCase()}</span>
              <div style="font-size:10pt;line-height:1.6;margin-top:2px;">&ldquo;${esc(val)}&rdquo;</div>
            </div>`).join("")
          : b.text ? `<div style="font-size:10pt;line-height:1.6;">&ldquo;${esc(b.text)}&rdquo;</div>` : "";
        return `
        <div style="border-left:3px solid ${color};padding:12px 16px;margin-bottom:16px;background:#fafafa;border-radius:8px;">
          <div style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${color};margin-bottom:10px;">${label} — Variante ${b.variant || "?"}</div>
          ${layersHtml}
        </div>`;
      }).join("")}
    </div>`;
  })()}

  <!-- SEO -->
  <div class="seo-section">
    <div class="seo-label">SEO & Metadata</div>
    <div class="seo-field">
      <div class="seo-field-label">Título (${lf.seo.title.length}/60)</div>
      <div class="seo-field-value"><strong>${esc(lf.seo.title)}</strong></div>
    </div>
    <div class="seo-field">
      <div class="seo-field-label">Descripción</div>
      <div class="seo-field-value">${esc(lf.seo.description)}</div>
    </div>
    <div class="seo-field">
      <div class="seo-field-label">Tags</div>
      <div>${lf.seo.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ")}</div>
    </div>
    <div class="seo-field">
      <div class="seo-field-label">Idea de thumbnail</div>
      <div class="seo-field-value">${esc(lf.seo.thumbnail_idea)}</div>
    </div>
  </div>

  ${lf.production_notes ? `
  <div class="notes-section">
    <div class="notes-label">Notas de producción</div>
    <div class="notes-text">${esc(lf.production_notes)}</div>
  </div>` : ""}
</div>

<div class="footer">ADP — YouTube Longform</div>

</body>
</html>`;

    const htmlWithPrint = html.replace("</body>", "<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body>");
    const blob = new Blob([htmlWithPrint], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      toast("PDF listo — guardalo como PDF");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = `youtube-${(lf?.title || generation.title || "guion").replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.html`;
      link.click();
      URL.revokeObjectURL(url);
      toast("Pack descargado — abrilo y usá Cmd+P para guardar como PDF");
    }
  }

  const totalMin = lf ? Math.round(lf.total_duration_seconds / 60) : Math.round((generation.script.total_duration_seconds || 0) / 60);
  const mode = lf ? (lf.output_mode === "both" ? "Guión + Estructura" : lf.output_mode === "structure" ? "Estructura" : "Guión completo") : "Shortform";
  const statusCfg = STATUS_CONFIG[status];

  // --- Teleprompter overlay ---
  if (teleprompter) {
    return (
      <div
        ref={teleprompterRef}
        tabIndex={0}
        className="fixed inset-0 z-50 bg-black overflow-y-auto"
        onKeyDown={(e) => { if (e.key === "Escape") setTeleprompter(false); }}
      >
        <div className="max-w-3xl mx-auto py-16 px-8">
          <button
            onClick={() => setTeleprompter(false)}
            className="fixed top-6 right-6 text-zinc-500 hover:text-white text-sm bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800"
          >
            Esc — Salir
          </button>
          <h1 className="text-4xl font-bold text-white mb-12 leading-tight">{lf?.title || generation.title || "Guión"}</h1>
          {lf ? (
            <>
              <div className="mb-12">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-3 font-bold">Hook</p>
                <p className="text-2xl text-white leading-relaxed">{lf.hook.script_text}</p>
              </div>
              {lf.chapters.map((ch) => {
                const transition = lf.transitions.find((t) => t.from_chapter === ch.number);
                return (
                  <div key={ch.number} className="mb-12">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-bold">
                      Cap {ch.number}: {ch.title}
                    </p>
                    <p className="text-2xl text-white leading-relaxed whitespace-pre-wrap">{ch.content}</p>
                    {transition && (
                      <p className="text-lg text-zinc-500 italic mt-6">→ {transition.transition_text}</p>
                    )}
                  </div>
                );
              })}
              <div className="mb-12">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-bold">Conclusión</p>
                <p className="text-2xl text-white leading-relaxed whitespace-pre-wrap">{lf.conclusion.content}</p>
              </div>
              <div className="mb-12">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-3 font-bold">CTA</p>
                <p className="text-2xl text-white leading-relaxed font-medium">{lf.cta.primary_text}</p>
              </div>
            </>
          ) : (
            <>
              {generation.script.hooks.map((hook, hi) => (
                <div key={hi} className="mb-12">
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-3 font-bold">Lead {hi + 1}</p>
                  <p className="text-2xl text-white leading-relaxed whitespace-pre-wrap">{hook.script_text}</p>
                </div>
              ))}
              {generation.script.development.sections.map((section, si) => (
                <div key={si} className="mb-12">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-bold">{section.section_name}</p>
                  <p className="text-2xl text-white leading-relaxed whitespace-pre-wrap">{section.script_text}</p>
                </div>
              ))}
            </>
          )}
          {generation.script.cta_blocks && generation.script.cta_blocks.length > 0 && (
            <div className="mb-12">
              <p className="text-xs text-purple-400 uppercase tracking-wider mb-6 font-bold">Bloques CTA — Grabar una vez</p>
              {generation.script.cta_blocks.map((block, bi) => {
                const label = (block.channel_label || block.channel || "CTA").toUpperCase();
                return (
                  <div key={bi} className="mb-10 border-l-2 border-purple-500/30 pl-6">
                    <p className="text-xs text-purple-400 uppercase tracking-wider mb-4 font-bold">{label} — Variante {block.variant || "?"}</p>
                    {block.layers ? Object.entries(block.layers).filter(([,v]) => v).map(([key, val]) => (
                      <div key={key} className="mb-4">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{CTA_LAYER_LABELS[key] || key.toUpperCase()}</p>
                        <p className="text-2xl text-white leading-relaxed">{val}</p>
                      </div>
                    )) : block.text ? (
                      <p className="text-2xl text-white leading-relaxed">{block.text}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Shortform fallback (no longform data) ---
  if (!lf) {
    const s = generation.script;
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.push("/youtube")} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Volver a YouTube
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">{generation.title || "Guión"}</h1>
          <p className="text-zinc-500 text-sm mt-2">{s.total_duration_seconds}s | ~{s.word_count} palabras | {s.development.framework_used}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-8">
          <button onClick={openTeleprompter} className="px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 transition-all">Teleprompter</button>
          <button onClick={downloadTXT} className="px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 transition-all">Descargar TXT</button>
          <button onClick={downloadPDF} className="px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 transition-all">Descargar PDF</button>
        </div>

        {/* Leads */}
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">Leads</h2>
        <div className="space-y-3 mb-8">
          {s.hooks.map((hook, i) => (
            <div key={i} className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Lead {i + 1}</span>
              <p className="text-zinc-200 text-sm leading-relaxed mt-2 whitespace-pre-wrap">{hook.script_text}</p>
            </div>
          ))}
        </div>

        {/* Body sections */}
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Cuerpo</h2>
        <div className="space-y-3 mb-8">
          {s.development.sections.map((sec, i) => (
            <div key={i} className="border border-zinc-800/40 bg-zinc-900/30 rounded-2xl p-5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{sec.section_name}</span>
              <p className="text-zinc-200 text-sm leading-relaxed mt-2 whitespace-pre-wrap">{sec.script_text}</p>
            </div>
          ))}
        </div>

        {/* CTA Blocks */}
        {s.cta_blocks && s.cta_blocks.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">Bloques CTA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {s.cta_blocks.map((block, i) => {
                const channelColors: Record<string, string> = { clase_gratuita: "border-emerald-500/20 bg-emerald-500/5", taller_5: "border-amber-500/20 bg-amber-500/5", instagram: "border-pink-500/20 bg-pink-500/5" };
                const labelColors: Record<string, string> = { clase_gratuita: "text-emerald-400", taller_5: "text-amber-400", instagram: "text-pink-400" };
                return (
                  <div key={i} className={`border rounded-2xl p-5 space-y-3 ${channelColors[block.channel] || "border-zinc-800/40 bg-zinc-900/30"}`}>
                    <span className={`uppercase tracking-wider text-[11px] font-semibold ${labelColors[block.channel] || "text-zinc-400"}`}>
                      {block.channel_label || block.channel}
                    </span>
                    {block.layers ? Object.entries(block.layers).filter(([,v]) => v).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">{CTA_LAYER_LABELS[key] || key.toUpperCase()}</span>
                        <p className="text-zinc-300 text-xs leading-relaxed mt-0.5 whitespace-pre-wrap">{val}</p>
                      </div>
                    )) : block.text ? <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">{block.text}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/youtube")}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Volver a YouTube
        </button>

        <div className="flex items-start justify-between gap-4 mb-3">
          {/* Editable title */}
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitleDraft(title); setEditingTitle(false); } }}
                  className="text-2xl font-extrabold tracking-tight text-white bg-transparent border-b border-red-500/50 outline-none w-full"
                  autoFocus
                  disabled={savingTitle}
                />
                <button onClick={saveTitle} disabled={savingTitle} className="text-xs text-red-400 hover:text-red-300 shrink-0">
                  {savingTitle ? "..." : "Guardar"}
                </button>
                <button onClick={() => { setTitleDraft(title); setEditingTitle(false); }} className="text-xs text-zinc-500 hover:text-zinc-300 shrink-0">
                  Cancelar
                </button>
              </div>
            ) : (
              <h1
                className="text-3xl font-extrabold tracking-tight text-white cursor-pointer hover:text-zinc-200 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click para editar"
              >
                {title || lf.title}
              </h1>
            )}
          </div>
          {/* Status dropdown + actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Duplicate */}
            <button
              onClick={handleDuplicate}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
              title="Duplicar video"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
            </button>
            {/* Delete */}
            <div className="relative">
              <button
                onClick={() => setConfirmDelete(!confirmDelete)}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Eliminar video"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
              {confirmDelete && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-red-500/30 rounded-xl p-3 shadow-xl z-10 w-48">
                  <p className="text-xs text-zinc-400 mb-2">¿Eliminar este video?</p>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={deleting} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg disabled:opacity-50">
                      {deleting ? "..." : "Eliminar"}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
            {/* Status */}
            <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              disabled={updatingStatus}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${statusCfg.color}`}
            >
              {updatingStatus ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : null}
              {statusCfg.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl z-10">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-zinc-800 transition-colors ${s === status ? "text-white font-semibold" : "text-zinc-400"}`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
            {mode}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-800/50 text-zinc-400 border border-zinc-700/30 capitalize">
            {lf.framework}
          </span>
          <span className="text-zinc-500">{totalMin} min</span>
          <span className="text-zinc-500">~{lf.word_count} palabras</span>
          <span className="text-zinc-500">{lf.chapters.length} capítulos</span>
        </div>

        <p className="text-sm text-zinc-500 mt-3 italic">{lf.emotional_arc}</p>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button onClick={expandAll} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Expandir todo
        </button>
        <span className="text-zinc-700">|</span>
        <button onClick={collapseAll} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Colapsar todo
        </button>
        <div className="flex-1" />
        <button
          onClick={openTeleprompter}
          className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
          </svg>
          Teleprompter
        </button>
        <button
          onClick={downloadTXT}
          className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          TXT
        </button>
        <button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/10"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          PDF
        </button>
        <button
          onClick={copyFullScript}
          className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          {copied === "full" ? "Copiado" : "Copiar todo"}
        </button>
      </div>

      {/* Hook */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              Hook — {lf.hook.estimated_duration_seconds}s
            </h3>
            <button
              onClick={() => copyText(lf!.hook.script_text, "hook")}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              {copied === "hook" ? "Copiado" : "Copiar"}
            </button>
          </div>
          <InlineEdit
            value={lf.hook.script_text}
            onSave={(v) => handleEdit("hook.script_text", v)}
            className="text-sm text-white leading-relaxed"
          />
          {lf.hook.visual_notes && (
            <p className="text-xs text-zinc-500 mt-3 flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              {lf.hook.visual_notes}
            </p>
          )}
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3 mb-6">
        {lf.chapters.map((ch, i) => {
          const isOpen = openChapters.has(ch.number);
          const transition = lf!.transitions.find((t) => t.from_chapter === ch.number);
          const durationMin = Math.round(ch.estimated_duration_seconds / 60);
          const isRegenerating = regenChapter === i;

          return (
            <div key={ch.number}>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
                {/* Chapter header */}
                <button
                  onClick={() => toggleChapter(ch.number)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {ch.number}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{ch.title}</h3>
                      <p className="text-xs text-zinc-500">{durationMin} min · {ch.key_points.length} puntos clave</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Chapter content */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-zinc-800/50">
                    <div className="flex items-center justify-end gap-2 mb-2 pt-3">
                      {/* Regenerate button */}
                      <button
                        onClick={() => handleRegenChapter(i)}
                        disabled={isRegenerating}
                        className="text-xs text-zinc-600 hover:text-red-400 disabled:text-zinc-700 transition-colors flex items-center gap-1"
                        title="Regenerar capítulo"
                      >
                        {isRegenerating ? (
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>
                        )}
                        {isRegenerating ? "Regenerando..." : "Regenerar"}
                      </button>
                      <span className="text-zinc-800">|</span>
                      <button
                        onClick={() => copyText(ch.content, `ch-${ch.number}`)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        {copied === `ch-${ch.number}` ? "Copiado" : "Copiar capítulo"}
                      </button>
                    </div>

                    {/* Editable content */}
                    <InlineEdit
                      value={ch.content}
                      onSave={(v) => handleEdit(`chapters.${i}.content`, v)}
                      className="text-sm text-zinc-300 leading-relaxed"
                    />

                    {/* Key points */}
                    {ch.key_points.length > 0 && (
                      <div className="bg-zinc-800/30 rounded-xl p-3 mb-3 mt-4">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Puntos clave</p>
                        <ul className="space-y-1">
                          {ch.key_points.map((point, j) => (
                            <li key={j} className="text-xs text-zinc-400 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Visual notes */}
                    {ch.visual_notes && (
                      <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        {ch.visual_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Transition card */}
              {transition && (
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden mt-3">
                  <div className="flex items-center gap-3 p-5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-500 text-sm">→</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <InlineEdit
                        value={transition.transition_text}
                        onSave={(val) => handleSaveTransition(ch.number, val)}
                        className="text-sm text-zinc-400 italic"
                      />
                      <p className="text-xs text-zinc-600 mt-0.5">Transición → Cap {transition.to_chapter}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Conclusión — {Math.round(lf.conclusion.estimated_duration_seconds / 60)} min
          </h3>
          <button
            onClick={() => copyText(lf!.conclusion.content, "conclusion")}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {copied === "conclusion" ? "Copiado" : "Copiar"}
          </button>
        </div>
        <InlineEdit
          value={lf.conclusion.content}
          onSave={(v) => handleEdit("conclusion.content", v)}
          className="text-sm text-zinc-300 leading-relaxed"
        />
      </div>

      {/* CTA */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">CTA</h3>
        <InlineEdit
          value={lf.cta.primary_text}
          onSave={(v) => handleEdit("cta.primary_text", v)}
          className="text-sm text-white font-medium"
        />
        {lf.cta.midroll_text && (
          <p className="text-xs text-zinc-500 mt-2">Mid-roll: {lf.cta.midroll_text}</p>
        )}
        {lf.cta.end_screen_notes && (
          <p className="text-xs text-zinc-500 mt-1">End screen: {lf.cta.end_screen_notes}</p>
        )}
      </div>

      {/* SEO Panel */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-500">Título</p>
              <button onClick={() => copyText(lf!.seo.title, "seo-title")} className="text-[10px] text-zinc-600 hover:text-zinc-300">
                {copied === "seo-title" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="text-sm text-white font-semibold">{lf.seo.title}</p>
            <p className={`text-xs mt-0.5 ${lf.seo.title.length > 60 ? "text-red-400" : "text-zinc-600"}`}>{lf.seo.title.length}/60 caracteres</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-500">Descripción</p>
              <button onClick={() => copyText(lf!.seo.description, "seo-desc")} className="text-[10px] text-zinc-600 hover:text-zinc-300">
                {copied === "seo-desc" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{lf.seo.description}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-500">Tags</p>
              <button onClick={() => copyText(lf!.seo.tags.join(", "), "seo-tags")} className="text-[10px] text-zinc-600 hover:text-zinc-300">
                {copied === "seo-tags" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lf.seo.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-400 border border-zinc-700/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Idea de thumbnail</p>
            <p className="text-sm text-zinc-400">{lf.seo.thumbnail_idea}</p>
          </div>
        </div>
      </div>

      {/* Production notes */}
      {lf.production_notes && (
        <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-5 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Notas de producción</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{lf.production_notes}</p>
        </div>
      )}

      {/* Session Notes + Metrics */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Notas de sesión + Métricas</h3>
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showMetrics ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {showMetrics && (
          <div className="space-y-4">
            {/* Session notes */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Notas de sesión</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Qué pasó en la grabación, qué funcionó, qué cambiar..."
                rows={3}
                className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-zinc-300 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/20 focus:border-red-500/30 transition-all placeholder:text-zinc-700"
              />
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {([
                { key: "ctr", label: "CTR %", step: 0.1 },
                { key: "hookRate", label: "Hook Rate %", step: 0.1 },
                { key: "holdRate", label: "Hold Rate %", step: 0.1 },
                { key: "cpa", label: "CPA $", step: 0.01 },
                { key: "roas", label: "ROAS", step: 0.1 },
              ] as const).map(({ key, label, step }) => (
                <div key={key}>
                  <label className="text-[10px] text-zinc-600 block mb-1">{label}</label>
                  <input
                    type="number"
                    step={step}
                    value={metrics[key] ?? ""}
                    onChange={(e) => setMetrics({ ...metrics, [key]: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Metrics notes */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Notas de métricas</label>
              <input
                type="text"
                value={metrics.notes ?? ""}
                onChange={(e) => setMetrics({ ...metrics, notes: e.target.value || undefined })}
                placeholder="Por qué funcionó o no..."
                className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-zinc-700"
              />
            </div>

            {/* Save button */}
            <button
              onClick={() => saveMetrics(metrics, sessionNotes)}
              disabled={savingMeta}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              {savingMeta ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : null}
              {savingMeta ? "Guardando..." : "Guardar notas y métricas"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
