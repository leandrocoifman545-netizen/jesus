"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";

type GenerationStatus = "draft" | "recorded" | "winner";

interface GenerationSummary {
  id: string;
  createdAt: string;
  title?: string;
  status?: GenerationStatus;
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
        is_rehook: boolean;
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
  };
}

interface SessionPackProps {
  generations: GenerationSummary[];
}

const CTAS = [
  {
    name: "CTA 1 — Directo",
    text: 'Toca el boton de aca abajo y registrate a la clase gratuita. Te muestro en vivo como crear tu primer producto digital con IA. Te veo adentro. Abrazo.',
  },
  {
    name: "CTA 2 — Taller $5",
    text: 'Toca el boton de aca abajo y registrate. La clase es gratis. No te pido plata, no te pido experiencia. Solo una hora para que veas como funciona. Y si despues queres crear tu producto conmigo, hay un taller de 3 dias que vale menos que una pizza. Vos decidis. Te mando un abrazo y te veo adentro.',
  },
  {
    name: "CTA 3 — Instagram",
    text: 'Comenta "CLASE" y anda al link de mi perfil porque ahi te podes registrar a la clase gratuita donde te enseno paso a paso crear tu primer producto digital con IA y como conseguir tus primeras ventas.',
  },
];

const STATUS_CONFIG: Record<GenerationStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Borrador", color: "text-zinc-500 border-zinc-700", icon: "" },
  recorded: { label: "Grabado", color: "text-green-400 border-green-500/30 bg-green-500/5", icon: "" },
  winner: { label: "Winner", color: "text-amber-400 border-amber-500/30 bg-amber-500/5", icon: "" },
};

function generatePackText(selected: GenerationSummary[]): string {
  const date = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  let text = "";

  text += "=".repeat(60) + "\n";
  text += "  PACK DE GRABACION\n";
  text += `  ${date}\n`;
  text += `  ${selected.length} guiones seleccionados\n`;
  text += "=".repeat(60) + "\n\n";

  text += "-".repeat(60) + "\n";
  text += "  3 CTAs (grabar una vez, se pegan a cualquier cuerpo)\n";
  text += "-".repeat(60) + "\n\n";

  for (const cta of CTAS) {
    text += `> ${cta.name}\n`;
    text += `  "${cta.text}"\n\n`;
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
    text += "=".repeat(60) + "\n\n";

    text += "> CUERPO\n";
    text += "-".repeat(40) + "\n\n";

    for (const section of gen.script.development.sections) {
      const rehook = section.is_rehook ? " [RE-HOOK]" : "";
      text += `[${section.section_name}${rehook}]\n`;
      text += `${section.script_text}\n\n`;
    }

    text += `> ${gen.script.hooks.length} LEADS (cada uno conecta con el cuerpo de arriba)\n`;
    text += "-".repeat(40) + "\n\n";

    for (const hook of gen.script.hooks) {
      text += `  Lead ${hook.variant_number} (${hook.hook_type}):\n`;
      text += `  "${hook.script_text}"\n\n`;
    }

    text += "\n";
  });

  text += "=".repeat(60) + "\n";
  text += "  FIN DEL PACK\n";
  text += "=".repeat(60) + "\n";

  return text;
}

function generateTeleprompterText(selected: GenerationSummary[]): string {
  let text = "";

  selected.forEach((gen, i) => {
    // For each script, generate one block per lead
    for (const hook of gen.script.hooks) {
      text += `\n\n\n`;
      text += `--- GUION ${i + 1} | Lead ${hook.variant_number} ---\n\n\n`;

      // Lead first (big, clear)
      text += hook.script_text + "\n\n";

      // Then body sections
      for (const section of gen.script.development.sections) {
        text += section.script_text + "\n\n";
      }

      // Separator between takes
      text += `\n\n--- CORTE ---\n`;
    }
  });

  return text.trim();
}

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

function groupByDate(gens: GenerationSummary[]): { label: string; items: GenerationSummary[] }[] {
  const groups: { label: string; items: GenerationSummary[] }[] = [];
  let currentLabel = "";
  for (const gen of gens) {
    const label = getDateGroupLabel(gen.createdAt);
    if (label !== currentLabel) {
      groups.push({ label, items: [gen] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].items.push(gen);
    }
  }
  return groups;
}

export default function SessionPack({ generations: initialGenerations }: SessionPackProps) {
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

  const filteredGenerations = generations
    .filter((g) => {
      if (filter !== "all" && (g.status || "draft") !== filter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const titleMatch = g.title?.toLowerCase().includes(q);
        const hookMatch = g.script.hooks.some((h) => h.script_text.toLowerCase().includes(q) || h.hook_type.toLowerCase().includes(q));
        const frameworkMatch = g.script.development.framework_used.toLowerCase().includes(q);
        const bodyMatch = g.script.development.sections.some((s) => s.script_text.toLowerCase().includes(q));
        const platformMatch = g.script.platform_adaptation.platform.toLowerCase().includes(q);
        const formatMatch = g.script.visual_format?.format_name.toLowerCase().includes(q);
        if (!titleMatch && !hookMatch && !frameworkMatch && !bodyMatch && !platformMatch && !formatMatch) return false;
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
          const order: Record<string, number> = { winner: 0, recorded: 1, draft: 2 };
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

  function selectStatus(genId: string, newStatus: GenerationStatus) {
    setStatusDropdown(null);
    updateStatus(genId, newStatus);
  }

  function downloadPack() {
    const selectedGens = filteredGenerations.filter((g) => selected.has(g.id));
    const text = generatePackText(selectedGens);
    downloadFile(text, `pack-grabacion-${new Date().toISOString().slice(0, 10)}-${selectedGens.length}guiones.txt`);
  }

  function downloadTeleprompter() {
    const selectedGens = filteredGenerations.filter((g) => selected.has(g.id));
    const text = generateTeleprompterText(selectedGens);
    downloadFile(text, `teleprompter-${new Date().toISOString().slice(0, 10)}-${selectedGens.length}guiones.txt`);
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
    const text = generatePackText(selectedGens);
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

  if (generations.length === 0) return null;

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/10 transition-all"
          placeholder="Buscar por titulo, hook, framework, nicho, formato..."
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {search.trim() && (
        <p className="text-xs text-zinc-500 -mt-2 mb-4">
          {filteredGenerations.length === 0 ? "Sin resultados" : `${filteredGenerations.length} resultado${filteredGenerations.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Filter tabs + sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {(["all", "draft", "recorded", "winner"] as const).map((f) => {
            const count = f === "all" ? generations.length : generations.filter((g) => (g.status || "draft") === f).length;
            if (count === 0 && f !== "all") return null;
            const labels: Record<string, string> = { all: "Todos", draft: "Borradores", recorded: "Grabados", winner: "Winners" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  filter === f
                    ? "bg-white/10 text-white font-medium"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {labels[f]} ({count})
              </button>
            );
          })}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 text-zinc-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/10 transition-all"
        >
          <option value="recent">Mas recientes</option>
          <option value="oldest">Mas antiguos</option>
          <option value="duration">Duracion</option>
          <option value="framework">Framework A-Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Selection bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {selected.size === filteredGenerations.length ? "Deseleccionar todo" : "Seleccionar todo"}
          </button>
          {selected.size > 0 && (
            <span className="text-xs text-purple-400">
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {selected.size > 0 && (
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
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-500/20 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar pack ({selected.size})
            </button>
          </div>
        )}
      </div>

      {/* Generation list with checkboxes + status */}
      <div className="grid gap-4">
        {filteredGenerations.length > 0 ? (
          groupByDate(filteredGenerations).map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-2 mt-2"><span className="text-xs font-medium text-zinc-500 shrink-0">{group.label}</span><div className="flex-1 h-px bg-zinc-800/50"></div></div>
              <div className="grid gap-4">
                {group.items.map((gen) => {
                  const status = gen.status || "draft";
                  const config = STATUS_CONFIG[status];
                  return (
                    <div
                      key={gen.id}
                      className={`border rounded-2xl p-5 transition-all duration-200 flex gap-4 ${
                        selected.has(gen.id)
                          ? "border-purple-500/30 bg-purple-500/5 ring-1 ring-purple-500/20"
                          : "border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/50"
                      }`}
                    >
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
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400">
                            {gen.script.platform_adaptation.platform}
                          </span>
                          <span className="text-xs text-zinc-500">{gen.script.total_duration_seconds}s</span>
                          <span className="text-xs text-zinc-500">{gen.script.development.framework_used}</span>
                          <span className="text-xs text-zinc-500">{gen.script.hooks.length} leads</span>
                          {gen.script.visual_format && (
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 backdrop-blur">
                              {gen.script.visual_format.format_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300 truncate">
                          {gen.script.hooks[0]?.script_text.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {new Date(gen.createdAt).toLocaleDateString("es-AR")} &middot; {new Date(gen.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </a>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="relative">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatusDropdown(statusDropdown === gen.id ? null : gen.id); }}
                            disabled={updatingStatus === gen.id}
                            className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur transition-all flex items-center gap-1 ${config.color} ${
                              updatingStatus === gen.id ? "opacity-50" : "hover:opacity-80"
                            }`}
                          >
                            {updatingStatus === gen.id ? "..." : config.label}
                            <svg className={`w-2.5 h-2.5 transition-transform ${statusDropdown === gen.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {statusDropdown === gen.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setStatusDropdown(null)} />
                              <div className="absolute top-full right-0 mt-1 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-xl min-w-[120px]">
                                {(["draft", "recorded", "winner"] as GenerationStatus[]).map((s) => (
                                  <button
                                    key={s}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectStatus(gen.id, s); }}
                                    className={`w-full text-left text-[10px] px-3 py-2 transition-colors flex items-center gap-2 ${
                                      s === status ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${s === "draft" ? "bg-zinc-500" : s === "recorded" ? "bg-green-400" : "bg-amber-400"}`} />
                                    {STATUS_CONFIG[s].label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        {status === "recorded" && (
                          <span className="text-[9px] text-red-400/50">{gen.script.hooks.length} leads quemados</span>
                        )}
                        {status === "winner" && (
                          <span className="text-[9px] text-amber-400/50">{gen.script.hooks.length} leads quemados</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-600 text-sm">
            {debouncedSearch ? "Sin resultados para esta busqueda" : "No hay guiones con este filtro"}
          </div>
        )}
      </div>
    </>
  );
}
