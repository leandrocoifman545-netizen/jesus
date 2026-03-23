"use client";

import { useState, useCallback } from "react";
import type { StoredStory, StorySlide, StoryStatus } from "@/lib/storage/local";

const STATUS_OPTIONS: { value: StoryStatus; label: string; style: string }[] = [
  { value: "draft", label: "Borrador", style: "bg-zinc-700/50 text-zinc-300" },
  { value: "recorded", label: "Grabada", style: "bg-amber-500/20 text-amber-400" },
  { value: "published", label: "Publicada", style: "bg-emerald-500/20 text-emerald-400" },
];

export default function StoryEditor({ story: initial }: { story: StoredStory }) {
  const [story, setStory] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const save = useCallback(async (updated: StoredStory) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/stories/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updated.title,
          status: updated.status,
          notes: updated.notes,
          slides: updated.slides,
          highlight_name: updated.highlight_name,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setStory(saved);
        setLastSaved(new Date().toLocaleTimeString("es-AR"));
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const updateSlide = (index: number, field: keyof StorySlide, value: string | number | null) => {
    const newSlides = [...story.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setStory({
      ...story,
      slides: newSlides,
      total_seconds: newSlides.reduce((sum, s) => sum + s.seconds, 0),
    });
  };

  const addSlide = () => {
    const newSlide: StorySlide = {
      number: story.slides.length + 1,
      narration: "",
      visual: "",
      format: "F1",
      seconds: 5,
      interaction: null,
    };
    setStory({
      ...story,
      slides: [...story.slides, newSlide],
      total_seconds: story.total_seconds + 5,
    });
  };

  const removeSlide = (index: number) => {
    const newSlides = story.slides
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, number: i + 1 }));
    setStory({
      ...story,
      slides: newSlides,
      total_seconds: newSlides.reduce((sum, s) => sum + s.seconds, 0),
    });
  };

  const changeStatus = (status: StoryStatus) => {
    const updated = { ...story, status };
    setStory(updated);
    save(updated);
  };

  const downloadPDF = () => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const date = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const slidesHTML = story.slides.map((s) => `
      <div class="slide-card no-break">
        <div class="slide-header">
          <span class="slide-num">${s.number}</span>
          <span class="slide-format">${esc(s.format)}</span>
          <span class="slide-seconds">${s.seconds}s</span>
          ${s.interaction ? `<span class="slide-interaction">${esc(s.interaction)}</span>` : ""}
        </div>
        <div class="slide-body">
          <div class="slide-col">
            <div class="slide-col-label">NARRACIÓN</div>
            <div class="slide-col-text">${esc(s.narration || "(sin narración)").replace(/\n/g, "<br>")}</div>
          </div>
          <div class="slide-col slide-col-visual">
            <div class="slide-col-label">VIDEO / INDICACIONES</div>
            <div class="slide-col-text">${esc(s.visual || "").replace(/\n/g, "<br>")}</div>
          </div>
        </div>
        ${(s as any).text_on_screen ? `
        <div class="slide-text-screen">
          <span class="slide-col-label">TEXTO EN PANTALLA:</span> ${esc((s as any).text_on_screen)}
        </div>` : ""}
        ${(s as any).persuasion ? `
        <div class="slide-persuasion">
          ${esc((s as any).persuasion)}
        </div>` : ""}
      </div>`).join("");

    const recNotesHTML = story.recording_notes?.length
      ? `<div class="rec-notes">
          <div class="rec-notes-title">NOTAS DE GRABACIÓN</div>
          <ul>${story.recording_notes.map((n: string) => `<li>${esc(n)}</li>`).join("")}</ul>
        </div>`
      : "";

    const contentBankHTML = story.content_bank?.length
      ? `<div class="content-bank">
          <div class="rec-notes-title">BANCO DE CONTENIDO NECESARIO</div>
          <ul>${story.content_bank.map((c: string) => `<li>${esc(c)}</li>`).join("")}</ul>
        </div>`
      : "";

    const objeccionesHTML = story.objeciones_disueltas?.length
      ? `<div class="objections">
          <div class="rec-notes-title">OBJECIONES DISUELTAS EN LA NARRATIVA</div>
          <table class="obj-table">
            <thead><tr><th>Objeción</th><th>Dónde</th><th>Cómo</th></tr></thead>
            <tbody>${story.objeciones_disueltas.map((o: any) => `<tr><td>${esc(o.objecion)}</td><td>${esc(o.donde)}</td><td>${esc(o.como)}</td></tr>`).join("")}</tbody>
          </table>
        </div>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(story.title)}</title>
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
    .no-break { page-break-inside: avoid; }
    @page { margin: 1.5cm 2cm; size: A4; }
    .print-hint { display: none; }
  }
  @media screen {
    body { max-width: 210mm; margin: 0 auto; background: #f3f4f6; }
    .page { background: white; margin: 20px auto; padding: 40px 50px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  }
  .print-hint {
    position: fixed; top: 16px; right: 16px; background: var(--purple); color: white;
    padding: 12px 20px; border-radius: 12px; font-size: 10pt; font-weight: 600;
    cursor: pointer; z-index: 100; box-shadow: 0 4px 12px rgba(124,58,237,0.4);
  }
  .print-hint:hover { background: var(--purple-dark); }
  .page { padding: 40px 50px; }

  /* Header */
  .story-header { background: linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%); color: white; padding: 28px 32px; border-radius: 12px; margin-bottom: 24px; }
  .story-title { font-size: 18pt; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 12px; }
  .story-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 9pt; opacity: 0.85; }
  .story-meta-item { display: flex; align-items: center; gap: 4px; }
  .story-meta-label { font-weight: 600; }
  .story-notes { background: var(--gray-50); border: 1px solid var(--gray-200); padding: 14px 20px; border-radius: 8px; font-size: 9pt; color: var(--gray-700); margin-bottom: 24px; line-height: 1.5; }

  /* Slides */
  .slides-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--purple); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .slides-label::after { content: ''; flex: 1; height: 1px; background: var(--gray-200); }
  .slide-card { margin-bottom: 16px; border: 1px solid var(--gray-200); border-radius: 8px; overflow: hidden; }
  .slide-header { display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
  .slide-num { font-size: 14pt; font-weight: 800; color: var(--purple); min-width: 28px; }
  .slide-format { font-size: 8pt; font-weight: 600; color: var(--gray-500); background: var(--gray-200); padding: 2px 8px; border-radius: 4px; }
  .slide-seconds { font-size: 9pt; font-weight: 600; color: var(--gray-500); }
  .slide-interaction { font-size: 8pt; font-weight: 500; color: var(--amber); background: var(--amber-light); padding: 2px 8px; border-radius: 4px; }
  .slide-body { display: flex; gap: 0; }
  .slide-col { flex: 1; padding: 12px 16px; }
  .slide-col-visual { background: var(--green-light); border-left: 1px solid var(--gray-200); }
  .slide-col-label { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-500); margin-bottom: 6px; }
  .slide-col-visual .slide-col-label { color: var(--green); }
  .slide-col-text { font-size: 10.5pt; line-height: 1.6; }
  .slide-text-screen { padding: 8px 16px; background: var(--amber-light); border-top: 1px solid #fde68a; font-size: 9pt; color: var(--gray-700); }
  .slide-text-screen .slide-col-label { display: inline; font-size: 7pt; color: var(--amber); margin-right: 4px; }
  .slide-persuasion { padding: 6px 16px; background: var(--purple-light); border-top: 1px solid #ddd6fe; font-size: 8pt; color: var(--purple-dark); font-style: italic; }

  /* Info sections */
  .rec-notes, .content-bank, .objections { margin-top: 20px; padding: 16px 20px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px; }
  .rec-notes-title { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-500); margin-bottom: 10px; }
  .rec-notes ul, .content-bank ul { list-style: none; padding: 0; }
  .rec-notes li, .content-bank li { font-size: 9pt; color: var(--gray-700); padding: 3px 0; padding-left: 12px; position: relative; }
  .rec-notes li::before, .content-bank li::before { content: '—'; position: absolute; left: 0; color: var(--gray-300); }
  .content-bank { background: var(--green-light); border-color: #d1fae5; }
  .content-bank .rec-notes-title { color: var(--green); }
  .objections { background: var(--purple-light); border-color: #ddd6fe; }
  .objections .rec-notes-title { color: var(--purple-dark); }
  .obj-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 4px; }
  .obj-table th { text-align: left; font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--purple-dark); padding: 6px 8px; border-bottom: 1px solid #c4b5fd; }
  .obj-table td { padding: 6px 8px; border-bottom: 1px solid #ede9fe; color: var(--gray-700); vertical-align: top; }
</style>
</head>
<body>

<button class="print-hint" onclick="window.print()">Guardar como PDF</button>

<div class="page">
  <div class="story-header">
    <div class="story-title">${esc(story.title)}</div>
    <div class="story-meta">
      <span class="story-meta-item"><span class="story-meta-label">Cortes:</span> ${story.slides.length}</span>
      <span class="story-meta-item"><span class="story-meta-label">Duración:</span> ${story.total_seconds}s</span>
      <span class="story-meta-item"><span class="story-meta-label">Tipo:</span> ${esc(story.sequence_type || "actuada")}</span>
      ${story.avatar_target ? `<span class="story-meta-item"><span class="story-meta-label">Avatar:</span> ${esc(story.avatar_target)}</span>` : ""}
      ${story.tension ? `<span class="story-meta-item"><span class="story-meta-label">Tensión:</span> ${esc(story.tension)}</span>` : ""}
      <span class="story-meta-item"><span class="story-meta-label">Fecha:</span> ${esc(date)}</span>
    </div>
  </div>

  ${story.notes ? `<div class="story-notes">${esc(story.notes).replace(/\n/g, "<br>")}</div>` : ""}

  <div class="slides-label">${story.slides.length} Cortes</div>
  ${slidesHTML}

  ${objeccionesHTML}
  ${recNotesHTML}
  ${contentBankHTML}
</div>

<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) {
      // OK
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${story.id}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              className="text-lg font-bold bg-transparent border-b border-zinc-700 text-white w-full outline-none pb-1"
              value={story.title}
              onChange={(e) => setStory({ ...story, title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
            />
          ) : (
            <h1
              className="text-lg font-bold text-white cursor-pointer hover:text-purple-300 transition-colors"
              onClick={() => setEditingTitle(true)}
            >
              {story.title}
            </h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => changeStatus(opt.value)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-all ${
                  story.status === opt.value
                    ? opt.style + " ring-1 ring-white/20"
                    : "bg-zinc-800/50 text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="text-[10px] text-zinc-600 ml-2">
              {story.slides.length} slides · {story.total_seconds}s
            </span>
            {story.highlight_name && (
              <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full ml-1">
                {story.highlight_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastSaved && <span className="text-[10px] text-zinc-600">{lastSaved}</span>}
          <button
            onClick={downloadPDF}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => save(story)}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Notes (collapsible) */}
      <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl px-3.5 py-2.5">
        <button
          onClick={() => setEditingNotes(!editingNotes)}
          className="flex items-center justify-between w-full text-[10px] font-medium text-zinc-500 uppercase tracking-wider"
        >
          Notas
          <span className="text-zinc-700 normal-case">{editingNotes ? "cerrar" : "editar"}</span>
        </button>
        {editingNotes ? (
          <textarea
            autoFocus
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2 text-xs text-zinc-300 outline-none resize-y mt-2"
            value={story.notes}
            onChange={(e) => setStory({ ...story, notes: e.target.value })}
            rows={2}
          />
        ) : (
          story.notes && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{story.notes}</p>
        )}
      </div>

      {/* Slides — compact cards */}
      <div className="space-y-2">
        {story.slides.map((slide, i) => (
          <div
            key={i}
            className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl px-3.5 py-3 group"
          >
            {/* Slide header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                {slide.number}
              </span>
              <input
                className="text-[11px] font-mono text-zinc-500 bg-transparent outline-none w-12 text-center border border-zinc-800/40 rounded px-1 py-0.5"
                value={slide.format}
                onChange={(e) => updateSlide(i, "format", e.target.value)}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="text-[11px] font-mono text-zinc-500 bg-transparent outline-none w-8 text-center border border-zinc-800/40 rounded px-1 py-0.5"
                  value={slide.seconds}
                  onChange={(e) => updateSlide(i, "seconds", parseInt(e.target.value) || 0)}
                  min={1}
                  max={30}
                />
                <span className="text-[10px] text-zinc-700">s</span>
              </div>
              {slide.interaction && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400/80 px-1.5 py-0.5 rounded">
                  {slide.interaction}
                </span>
              )}
              <div className="flex-1" />
              <input
                className="text-[10px] text-zinc-600 bg-transparent outline-none w-24 text-right placeholder-zinc-800"
                placeholder="interaccion"
                value={slide.interaction || ""}
                onChange={(e) => updateSlide(i, "interaction", e.target.value || null)}
              />
              <button
                onClick={() => removeSlide(i)}
                className="text-zinc-800 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Two columns: narration + visual */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5 block">Narracion</span>
                <textarea
                  className="w-full bg-zinc-800/30 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 outline-none resize-none placeholder-zinc-700 leading-relaxed"
                  placeholder="(sin narracion)"
                  value={slide.narration}
                  onChange={(e) => updateSlide(i, "narration", e.target.value)}
                  rows={slide.narration ? Math.min(Math.ceil(slide.narration.length / 50), 3) : 1}
                />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-700 mb-0.5 block">Visual</span>
                <textarea
                  className="w-full bg-zinc-800/30 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 outline-none resize-none placeholder-zinc-700 leading-relaxed"
                  placeholder="Descripcion visual..."
                  value={slide.visual}
                  onChange={(e) => updateSlide(i, "visual", e.target.value)}
                  rows={slide.visual ? Math.min(Math.ceil(slide.visual.length / 50), 3) : 1}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add slide */}
        <button
          onClick={addSlide}
          className="w-full border border-dashed border-zinc-800/50 rounded-xl py-2.5 text-xs text-zinc-700 hover:text-purple-400 hover:border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar slide
        </button>
      </div>

      {/* Triggers + Rules (compact footer) */}
      <div className="flex items-center gap-3 flex-wrap text-[10px]">
        {story.triggers.map((t) => (
          <span key={t} className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full">{t}</span>
        ))}
        <span className="text-zinc-700 ml-auto">
          Reglas: {story.rules_applied.join(", ")}
        </span>
      </div>
    </div>
  );
}
