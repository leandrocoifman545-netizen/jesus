"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredReference } from "@/lib/storage/local";
import GlowCard from "./glow-card";

import { HOOK_TYPE_LABELS } from "@/lib/constants/hook-types";

// --- Types ---

interface FolderInfo {
  id: string;
  label: string;
  count: number;
  createdAt: string;
}

// --- Helpers ---

function groupByFolders(refs: StoredReference[]): { individuales: StoredReference[]; bulkFolders: FolderInfo[]; bulkRefs: Record<string, StoredReference[]> } {
  const individuales: StoredReference[] = [];
  const bulkRefs: Record<string, StoredReference[]> = {};
  const folderLabels: Record<string, string> = {};
  const folderDates: Record<string, string> = {};

  for (const ref of refs) {
    const folder = ref.folder || "individuales";
    if (folder === "individuales") {
      individuales.push(ref);
    } else {
      if (!bulkRefs[folder]) bulkRefs[folder] = [];
      bulkRefs[folder].push(ref);
      if (ref.folderLabel) folderLabels[folder] = ref.folderLabel;
      if (!folderDates[folder] || ref.createdAt < folderDates[folder]) {
        folderDates[folder] = ref.createdAt;
      }
    }
  }

  const bulkFolders: FolderInfo[] = Object.keys(bulkRefs)
    .map((id) => ({
      id,
      label: folderLabels[id] || id,
      count: bulkRefs[id].length,
      createdAt: folderDates[id],
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { individuales, bulkFolders, bulkRefs };
}

// --- Add Reference Form (Individual) ---

function AddReferenceForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle("");
      setTranscript("");
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlowCard className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5 shimmer-sweep" glowColor="rgba(59, 130, 246, 0.08)">
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold">Agregar guion ganador</h3>
      <div>
        <label className="block text-xs text-zinc-400 font-medium mb-1">Nombre / Titulo</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Ej: "Ad de Headspace que convirtio 3x"'
          required
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 font-medium mb-1">Transcripcion del video</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Pega la transcripcion completa del anuncio que funciono bien..."
          rows={6}
          required
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
        />
      </div>
      {error && (
        <div className="bg-red-500/10 backdrop-blur border border-red-500/20 rounded-2xl px-3 py-2 text-xs text-red-400">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading || !title || !transcript}
        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/20 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            Analizando...
          </>
        ) : "Analizar y guardar"}
      </button>
    </form>
    </GlowCard>
  );
}

// --- Audio Upload Form ---

interface AudioFileEntry {
  file: File;
  title: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

function AudioUploadForm({ onAdded, targetFolder }: { onAdded: () => void; targetFolder?: string }) {
  const [files, setFiles] = useState<AudioFileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean; error?: string }[] | null>(null);

  function handleFilesSelected(selected: FileList | null) {
    if (!selected) return;
    const newEntries: AudioFileEntry[] = Array.from(selected).map((f) => ({
      file: f,
      title: f.name.replace(/\.[^.]+$/, ""),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newEntries]);
    setResults(null);
  }

  function updateTitle(index: number, title: string) {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, title } : f)));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setResults(null);

    const finalResults: { name: string; ok: boolean; error?: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const entry = files[i];
      setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: "processing" } : f)));
      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("title", entry.title);
        if (targetFolder) {
          formData.append("folder", targetFolder);
        }
        const res = await fetch("/api/references/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: "done" } : f)));
        finalResults.push({ name: entry.title, ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: "error", error: msg } : f)));
        finalResults.push({ name: entry.title, ok: false, error: msg });
      }
    }

    setResults(finalResults);
    const succeeded = finalResults.filter((r) => r.ok).length;
    if (succeeded > 0) onAdded();
    if (succeeded === finalResults.length) setFiles([]);
    setLoading(false);
  }

  const currentIndex = files.findIndex((f) => f.status === "processing");

  return (
    <GlowCard className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5 shimmer-sweep" glowColor="rgba(59, 130, 246, 0.08)">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Subir audios de anuncios</h3>
        <p className="text-xs text-zinc-600 mt-1">MP3, M4A, WAV, WebM u OGG (max 200MB c/u). Se transcriben y analizan automaticamente.</p>
      </div>
      <div>
        <label className="flex items-center gap-3 cursor-pointer border border-zinc-800/50 border-dashed rounded-xl p-4 bg-zinc-800/20 hover:border-zinc-600/50 hover:bg-zinc-800/30 transition-all duration-200">
          <div className="shrink-0 w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-400">Click para seleccionar archivos</p>
            <p className="text-xs text-zinc-600">Podes seleccionar varios a la vez</p>
          </div>
          <input
            type="file"
            accept=".mp3,.m4a,.wav,.webm,.ogg,audio/*"
            multiple
            onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
            className="hidden"
            disabled={loading}
          />
        </label>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((entry, i) => (
            <div key={`${entry.file.name}-${i}`} className={`flex items-center gap-3 rounded-lg border p-3 ${
              entry.status === "done" ? "border-emerald-500/30 bg-emerald-500/5" :
              entry.status === "error" ? "border-red-500/30 bg-red-500/5" :
              entry.status === "processing" ? "border-purple-500/30 bg-purple-500/5" :
              "border-zinc-800 bg-zinc-950"
            }`}>
              <div className="shrink-0 w-6 flex justify-center">
                {entry.status === "processing" && <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                {entry.status === "done" && <span className="text-emerald-400 text-sm">✓</span>}
                {entry.status === "error" && <span className="text-red-400 text-sm">✗</span>}
                {entry.status === "pending" && <span className="text-zinc-600 text-sm">●</span>}
              </div>
              <div className="flex-1 min-w-0">
                {entry.status === "pending" && !loading ? (
                  <input type="text" value={entry.title} onChange={(e) => updateTitle(i, e.target.value)} className="w-full bg-transparent text-sm text-white focus:outline-none" placeholder="Titulo de la referencia" />
                ) : (
                  <p className="text-sm text-white truncate">{entry.title}</p>
                )}
                <p className="text-xs text-zinc-500">
                  {entry.file.name} — {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                  {entry.error && <span className="text-red-400 ml-1">— {entry.error}</span>}
                </p>
              </div>
              {entry.status === "pending" && !loading && (
                <button type="button" onClick={() => removeFile(i)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
      {loading && currentIndex >= 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-purple-400">
          Procesando {currentIndex + 1} de {files.length}...
        </div>
      )}
      {results && (
        <div className="text-xs px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300">
          {results.filter((r) => r.ok).length}/{results.length} archivos procesados correctamente
        </div>
      )}
      <button
        type="submit"
        disabled={loading || files.length === 0 || files.every((f) => f.status === "done")}
        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/20 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            Procesando audios...
          </>
        ) : `Transcribir y analizar ${files.length} archivo${files.length !== 1 ? "s" : ""}`}
      </button>
    </form>
    </GlowCard>
  );
}

// --- Bulk Add Form ---

function BulkAddForm({ onAdded }: { onAdded: () => void }) {
  const [bulkText, setBulkText] = useState("");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<{ title: string; ok: boolean; error?: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function parseEntries(text: string): { title: string; transcript: string }[] {
    return text
      .split(/^[ \t]*-{3,}[ \t]*$/m)
      .map((block) => block.trim())
      .filter((block) => block.length > 0)
      .map((block) => {
        const firstNewline = block.indexOf("\n");
        if (firstNewline === -1) return { title: block, transcript: block };
        return {
          title: block.slice(0, firstNewline).trim(),
          transcript: block.slice(firstNewline + 1).trim(),
        };
      })
      .filter((entry) => entry.title && entry.transcript);
  }

  const entries = parseEntries(bulkText);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (entries.length === 0) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setProgress({ current: 0, total: entries.length });

    try {
      const res = await fetch("/api/references/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: entries,
          folderLabel: folderName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
      if (data.succeeded > 0) onAdded();
      if (data.succeeded === entries.length) {
        setBulkText("");
        setFolderName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <GlowCard className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-5 shimmer-sweep" glowColor="rgba(59, 130, 246, 0.08)">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Carga masiva de guiones</h3>
        <p className="text-xs text-zinc-600 mt-1">
          Pega multiples transcripciones separadas por <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">---</code>. La primera linea de cada bloque es el titulo.
        </p>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 font-medium mb-1">Nombre de la carpeta (opcional)</label>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder={`Ej: "Ads de Nike Q1 2026"`}
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200"
        />
      </div>

      <div>
        <textarea
          value={bulkText}
          onChange={(e) => { setBulkText(e.target.value); setResults(null); }}
          placeholder={`Ad de Headspace 3x conversion\nSabias que el 87% de la gente no puede dormir bien?...\n---\nAd de Nike running\nDeja de buscar excusas. Este es el unico par de zapatillas...\n---\nAd de Duolingo viral\nTu ex ya habla 3 idiomas y vos seguis sin poder pedir la cuenta...`}
          rows={12}
          required
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none font-mono transition-all duration-200"
        />
      </div>

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entries.map((entry, i) => (
            <span key={i} className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-2.5 py-0.5">{entry.title}</span>
          ))}
          <span className="text-xs text-zinc-500 self-center ml-1">
            {entries.length} referencia{entries.length !== 1 ? "s" : ""} detectada{entries.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {error && <div className="bg-red-500/10 backdrop-blur border border-red-500/20 rounded-2xl px-3 py-2 text-xs text-red-400">{error}</div>}

      {results && (
        <div className="space-y-1">
          {results.map((r, i) => (
            <div key={i} className={`text-xs px-3 py-1.5 rounded-lg ${r.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {r.ok ? "✓" : "✗"} {r.title}{r.error ? ` — ${r.error}` : ""}
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || entries.length === 0}
        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/20 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            {progress ? `Analizando ${progress.current}/${progress.total}...` : "Analizando..."}
          </>
        ) : `Analizar ${entries.length} referencia${entries.length !== 1 ? "s" : ""}`}
      </button>
    </form>
    </GlowCard>
  );
}

// --- Reference Card ---

function ReferenceCard({ reference, onDelete, selected, onToggleSelect }: {
  reference: StoredReference;
  onDelete: () => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const r = reference;
  const a = r.analysis;
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/references/${r.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 hover-lift ${selected ? "border-purple-500/50 bg-purple-500/5" : "border-zinc-800/50 bg-zinc-900/30 backdrop-blur hover:border-zinc-700/50"}`}>
      <div className="flex items-start">
        {onToggleSelect && (
          <label
            className="shrink-0 flex items-center justify-center w-10 pt-4 pl-3 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selected || false}
              onChange={() => onToggleSelect(r.id)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-purple-600 focus:ring-purple-600 focus:ring-offset-0 cursor-pointer accent-purple-600"
            />
          </label>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left p-4 hover:bg-zinc-900/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium text-white">{r.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border bg-zinc-800 text-zinc-400 border-zinc-700">{a.structure.framework}</span>
                {a.hook?.type && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">{HOOK_TYPE_LABELS[a.hook.type] || a.hook.type}</span>}
              </div>
              {a.hook?.text && <p className="text-xs text-zinc-500 truncate">Hook: &ldquo;{a.hook.text}&rdquo;</p>}
            </div>
            <div className="flex items-center gap-3 ml-3 shrink-0">
              <span className="text-xs text-zinc-600">{a.estimated_total_duration_seconds}s</span>
              <span className="text-xs text-zinc-600">{expanded ? "▲" : "▼"}</span>
            </div>
          </div>
        </button>
      </div>
      {expanded && (
        <div className="border-t border-zinc-800 p-4 bg-zinc-900/30 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Tono</span>
              <p className="text-sm text-zinc-300 mt-0.5">{a.tone.primary_tone}{a.tone.ugc_style && <span className="text-purple-400 ml-1">(UGC)</span>}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Arco Emocional</span>
              <p className="text-sm text-zinc-300 mt-0.5">{a.emotional_arc}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">CTA</span>
              <p className="text-sm text-zinc-300 mt-0.5">
                &ldquo;{a.cta.text}&rdquo;
                {a.cta.has_urgency && <span className="text-amber-400 ml-1">(urgencia)</span>}
                {a.cta.is_dual && <span className="text-emerald-400 ml-1">(dual)</span>}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Estructura</span>
              <div className="text-sm text-zinc-300 mt-0.5">
                {a.structure.sections.map((s, i) => (
                  <span key={i} className="inline-block text-xs bg-zinc-800 rounded px-1.5 py-0.5 mr-1 mb-1">{s.name} ({s.estimated_seconds}s)</span>
                ))}
              </div>
            </div>
          </div>
          {a.advertiser && (
            <div className="bg-zinc-950/50 rounded-xl p-3 space-y-1">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Anunciante</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {a.advertiser.name && <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">{a.advertiser.name}</span>}
                {a.advertiser.platform && <span className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-2 py-0.5">{a.advertiser.platform}</span>}
                {a.advertiser.ranking_position && a.advertiser.ranking_position !== "unknown" && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">{a.advertiser.ranking_position.replace("_", " ")}</span>
                )}
                {a.advertiser.language && <span className="text-xs bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">{a.advertiser.language}</span>}
                {a.advertiser.country && <span className="text-xs bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">{a.advertiser.country}</span>}
              </div>
            </div>
          )}
          {a.generation_mapping && (
            <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 space-y-2">
              <span className="text-xs text-purple-400 uppercase tracking-wider font-medium">Mapeo ADP</span>
              <div className="flex flex-wrap gap-1.5">
                {a.generation_mapping.angle_family && (
                  <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-2 py-0.5">F: {a.generation_mapping.angle_family}</span>
                )}
                {a.generation_mapping.body_type && (
                  <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5">{a.generation_mapping.body_type.replace(/_/g, " ")}</span>
                )}
                {a.generation_mapping.awareness_level && (
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-2 py-0.5">Schwartz {a.generation_mapping.awareness_level}</span>
                )}
                {a.generation_mapping.segment_equivalent && (
                  <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">Seg {a.generation_mapping.segment_equivalent}</span>
                )}
                {a.generation_mapping.model_sale_type && a.generation_mapping.model_sale_type !== "none" && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">{a.generation_mapping.model_sale_type.replace(/_/g, " ")}</span>
                )}
              </div>
              {a.generation_mapping.big_idea && (
                <p className="text-xs text-zinc-300 italic">&ldquo;{a.generation_mapping.big_idea}&rdquo;</p>
              )}
              {a.generation_mapping.belief_change && (
                <p className="text-xs text-zinc-400">
                  <span className="text-red-400">{a.generation_mapping.belief_change.old_belief}</span>
                  <span className="text-zinc-600"> → </span>
                  <span className="text-zinc-300">{a.generation_mapping.belief_change.mechanism}</span>
                  <span className="text-zinc-600"> → </span>
                  <span className="text-emerald-400">{a.generation_mapping.belief_change.new_belief}</span>
                </p>
              )}
              {a.generation_mapping.persuasion_functions && a.generation_mapping.persuasion_functions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {a.generation_mapping.persuasion_functions.map((pf, i) => (
                    <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5">{pf.section_name}: {pf.function}</span>
                  ))}
                </div>
              )}
              {a.generation_mapping.ingredients_detected && a.generation_mapping.ingredients_detected.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {a.generation_mapping.ingredients_detected.map((ing, i) => (
                    <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 rounded px-1.5 py-0.5">{ing.category}#{ing.ingredient_number}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {a.actionable && (
            <div className="space-y-2">
              {a.actionable.what_to_steal && a.actionable.what_to_steal.length > 0 && (
                <div>
                  <span className="text-xs text-emerald-400 uppercase tracking-wider">Que robar</span>
                  <ul className="mt-1 space-y-0.5">
                    {a.actionable.what_to_steal.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-300/80">+ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {a.actionable.what_not_to_copy && a.actionable.what_not_to_copy.length > 0 && (
                <div>
                  <span className="text-xs text-red-400 uppercase tracking-wider">No copiar</span>
                  <ul className="mt-1 space-y-0.5">
                    {a.actionable.what_not_to_copy.map((s, i) => (
                      <li key={i} className="text-xs text-red-300/80">- {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {a.actionable.craft_notes && a.actionable.craft_notes.length > 0 && (
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Notas de craft</span>
                  <ul className="mt-1 space-y-0.5">
                    {a.actionable.craft_notes.map((s, i) => (
                      <li key={i} className="text-xs text-zinc-400 italic">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Fortalezas</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {a.strengths.map((s, i) => (
                <span key={i} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Patrones a replicar</span>
            <ul className="mt-1 space-y-0.5">
              {a.patterns_to_replicate.map((p, i) => (
                <li key={i} className="text-xs text-zinc-400">• {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Transcripcion</span>
            <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line bg-zinc-950 rounded-lg p-3 max-h-32 overflow-y-auto">{r.transcript}</p>
          </div>
          <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-xl transition-all duration-200">
            {deleting ? "Eliminando..." : "Eliminar referencia"}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Selection Bar ---

function SelectionBar({ selectedIds, allIds, onSelectAll, onDeselectAll, onDelete }: {
  selectedIds: Set<string>;
  allIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const count = selectedIds.size;

  if (count === 0) return null;

  async function handleDelete() {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    setConfirming(false);
  }

  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  return (
    <div className="sticky top-0 z-10 bg-zinc-900/30 backdrop-blur border border-purple-500/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-white font-medium">
          {count} seleccionada{count !== 1 ? "s" : ""}
        </span>
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <span className="text-xs text-red-400">Eliminar {count}?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/30 transition-all duration-200"
            >
              {deleting ? "Eliminando..." : "Si, eliminar"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-zinc-500 px-3 py-1.5 rounded-xl hover:text-zinc-300 transition-all duration-200"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onDeselectAll}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5"
            >
              Cancelar
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/30 transition-all duration-200 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Eliminar seleccionadas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// --- Reference List with selection ---

function ReferenceList({ refs, onRefresh }: { refs: StoredReference[]; onRefresh: () => void }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(refs.map((r) => r.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    await fetch("/api/references/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setSelectedIds(new Set());
    onRefresh();
  }

  return (
    <div className="space-y-3 stagger-children">
      <SelectionBar
        selectedIds={selectedIds}
        allIds={refs.map((r) => r.id)}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDelete={handleBulkDelete}
      />
      {refs.map((r) => (
        <ReferenceCard
          key={r.id}
          reference={r}
          onDelete={onRefresh}
          selected={selectedIds.has(r.id)}
          onToggleSelect={toggleSelect}
        />
      ))}
    </div>
  );
}

// --- Folder Card ---

function FolderCard({ folder, onOpen, onDelete }: { folder: FolderInfo; onOpen: () => void; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/references/folder/${encodeURIComponent(folder.id)}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="border border-zinc-800/40 bg-zinc-900/30 backdrop-blur rounded-2xl p-5 hover:border-zinc-700/40 transition-all duration-300 hover-glow">
      <div className="flex items-center justify-between">
        <button onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="shrink-0 w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{folder.label}</p>
            <p className="text-xs text-zinc-500">
              {folder.count} referencia{folder.count !== 1 ? "s" : ""} — {new Date(folder.createdAt).toLocaleDateString("es-AR")}
            </p>
          </div>
        </button>
        <div className="shrink-0 ml-3">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-400">Eliminar carpeta?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-xl hover:bg-red-500/30 transition-all duration-200"
              >
                {deleting ? "..." : "Si"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-[10px] text-zinc-500 px-2 py-1 rounded-xl hover:text-zinc-300 transition-all duration-200"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 p-1"
              title="Eliminar carpeta"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

type View =
  | { type: "root" }
  | { type: "individuales" }
  | { type: "bulk-list" }
  | { type: "bulk-folder"; folderId: string; folderLabel: string };

export default function ReferenceLibrary({ initialRefs }: { initialRefs: StoredReference[] }) {
  const router = useRouter();
  const [refs, setRefs] = useState(initialRefs);
  const [view, setView] = useState<View>({ type: "root" });
  const [inputMode, setInputMode] = useState<"text" | "audio">("text");

  function refresh() {
    router.refresh();
    fetch("/api/references").then((r) => r.json()).then(setRefs);
  }

  const { individuales, bulkFolders, bulkRefs } = groupByFolders(refs);
  const totalCount = refs.length;

  // --- Root view: two main folders ---
  if (view.type === "root") {
    return (
      <div className="space-y-4">
        <p className="text-xs text-zinc-500">
          {totalCount} referencia{totalCount !== 1 ? "s" : ""} en total — los patrones se aplican automaticamente a cada nuevo guion
        </p>

        <button
          onClick={() => setView({ type: "individuales" })}
          className="w-full border border-zinc-800/40 bg-zinc-900/30 backdrop-blur rounded-2xl p-5 hover:border-zinc-700/40 transition-all duration-300 hover-glow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Individuales</p>
              <p className="text-xs text-zinc-500">
                {individuales.length} referencia{individuales.length !== 1 ? "s" : ""} agregadas una por una
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView({ type: "bulk-list" })}
          className="w-full border border-zinc-800/40 bg-zinc-900/30 backdrop-blur rounded-2xl p-5 hover:border-zinc-700/40 transition-all duration-300 hover-glow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Cargas Masivas</p>
              <p className="text-xs text-zinc-500">
                {bulkFolders.length} carpeta{bulkFolders.length !== 1 ? "s" : ""} — {Object.values(bulkRefs).flat().length} referencia{Object.values(bulkRefs).flat().length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // --- Breadcrumb ---
  function Breadcrumb() {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
        <button onClick={() => setView({ type: "root" })} className="hover:text-zinc-300 transition-colors">
          Biblioteca
        </button>
        {view.type === "individuales" && (
          <>
            <span>/</span>
            <span className="text-zinc-300">Individuales</span>
          </>
        )}
        {view.type === "bulk-list" && (
          <>
            <span>/</span>
            <span className="text-zinc-300">Cargas Masivas</span>
          </>
        )}
        {view.type === "bulk-folder" && (
          <>
            <span>/</span>
            <button onClick={() => setView({ type: "bulk-list" })} className="hover:text-zinc-300 transition-colors">
              Cargas Masivas
            </button>
            <span>/</span>
            <span className="text-zinc-300">{view.folderLabel}</span>
          </>
        )}
      </div>
    );
  }

  // --- Individuales view ---
  if (view.type === "individuales") {
    return (
      <div className="space-y-4">
        <Breadcrumb />

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setInputMode("text")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${inputMode === "text" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20" : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"}`}
          >
            Texto
          </button>
          <button
            onClick={() => setInputMode("audio")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${inputMode === "audio" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20" : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"}`}
          >
            Audio
          </button>
        </div>

        {inputMode === "text" ? (
          <AddReferenceForm onAdded={refresh} />
        ) : (
          <AudioUploadForm onAdded={refresh} targetFolder="individuales" />
        )}

        {individuales.length === 0 ? (
          <div className="border border-zinc-800/40 bg-zinc-900/30 backdrop-blur rounded-3xl p-8 text-center">
            <p className="text-zinc-500 text-sm">Sin referencias individuales todavia.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-500">{individuales.length} referencia{individuales.length !== 1 ? "s" : ""}</p>
            <ReferenceList refs={individuales} onRefresh={refresh} />
          </>
        )}
      </div>
    );
  }

  // --- Bulk list view (list of folders) ---
  if (view.type === "bulk-list") {
    return (
      <div className="space-y-4">
        <Breadcrumb />

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setInputMode("text")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${inputMode === "text" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20" : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"}`}
          >
            Texto
          </button>
          <button
            onClick={() => setInputMode("audio")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${inputMode === "audio" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20" : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"}`}
          >
            Audio
          </button>
        </div>

        {inputMode === "text" ? (
          <BulkAddForm onAdded={refresh} />
        ) : (
          <AudioUploadForm onAdded={refresh} />
        )}

        {bulkFolders.length === 0 ? (
          <div className="border border-zinc-800/40 bg-zinc-900/30 backdrop-blur rounded-3xl p-8 text-center">
            <p className="text-zinc-500 text-sm">Sin cargas masivas todavia. Usa el formulario de arriba para crear la primera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">{bulkFolders.length} carpeta{bulkFolders.length !== 1 ? "s" : ""}</p>
            {bulkFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={() => setView({ type: "bulk-folder", folderId: folder.id, folderLabel: folder.label })}
                onDelete={refresh}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Bulk folder detail view ---
  if (view.type === "bulk-folder") {
    const folderRefs = bulkRefs[view.folderId] || [];

    return (
      <div className="space-y-4">
        <Breadcrumb />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{view.folderLabel}</h2>
            <p className="text-xs text-zinc-500">{folderRefs.length} referencia{folderRefs.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {folderRefs.length === 0 ? (
          <div className="border border-zinc-800/40 bg-zinc-900/30 backdrop-blur rounded-3xl p-8 text-center">
            <p className="text-zinc-500 text-sm">Esta carpeta esta vacia.</p>
            <button
              onClick={() => { setView({ type: "bulk-list" }); refresh(); }}
              className="text-purple-400 text-sm mt-2 hover:text-purple-300 transition-colors"
            >
              Volver a carpetas
            </button>
          </div>
        ) : (
          <ReferenceList refs={folderRefs} onRefresh={refresh} />
        )}
      </div>
    );
  }

  return null;
}
