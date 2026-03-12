"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";

interface ProjectOption {
  id: string;
  clientName: string;
  productDescription: string;
  targetAudience: string;
  brandTone: string;
}

interface Props {
  projects: ProjectOption[];
}

export default function YouTubeBriefForm({ projects }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const streamRef = useRef<HTMLPreElement>(null);

  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [outputMode, setOutputMode] = useState<"full_script" | "structure">("full_script");
  const [targetDuration, setTargetDuration] = useState(10);
  const [youtubeRef, setYoutubeRef] = useState("");

  // Auto-fill from project
  const selectedProject = projects.find((p) => p.id === projectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStreamText("");

    const body = {
      projectId: projectId || undefined,
      productDescription: productDescription || selectedProject?.productDescription || "",
      targetAudience: targetAudience || selectedProject?.targetAudience || "",
      additionalNotes: additionalNotes || undefined,
      outputMode,
      targetDurationMinutes: targetDuration,
      youtubeReferences: youtubeRef.trim() ? [youtubeRef.trim()] : undefined,
    };

    try {
      const res = await fetch("/api/generate/longform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        toast("Error al generar");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "chunk") {
              setStreamText((prev) => prev + data.text);
              if (streamRef.current) {
                streamRef.current.scrollTop = streamRef.current.scrollHeight;
              }
            } else if (data.type === "done") {
              toast("Video generado");
              router.push(`/youtube/${data.generationId}`);
              return;
            } else if (data.type === "error") {
              toast(`Error: ${data.error}`);
              setLoading(false);
              return;
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      toast("Error de conexión");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project selector */}
        {projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Proyecto</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all"
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.clientName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Product & audience (show if no project or want to override) */}
        {!selectedProject && (
          <>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Producto / Servicio</label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Ej: ADP - Academia de Productos Digitales"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all"
                required={!selectedProject}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Público objetivo</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ej: Personas de 25-45 que quieren generar ingresos extra"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all"
                required={!selectedProject}
              />
            </div>
          </>
        )}

        {/* Output mode */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Modo de output</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOutputMode("full_script")}
              className={`p-4 rounded-xl border text-left transition-all ${
                outputMode === "full_script"
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className={`w-4 h-4 ${outputMode === "full_script" ? "text-red-400" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className={`text-sm font-semibold ${outputMode === "full_script" ? "text-white" : "text-zinc-400"}`}>
                  Guión completo
                </span>
              </div>
              <p className="text-xs text-zinc-500">Texto palabra por palabra. Para leer o usar como teleprompter.</p>
            </button>
            <button
              type="button"
              onClick={() => setOutputMode("structure")}
              className={`p-4 rounded-xl border text-left transition-all ${
                outputMode === "structure"
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className={`w-4 h-4 ${outputMode === "structure" ? "text-red-400" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className={`text-sm font-semibold ${outputMode === "structure" ? "text-white" : "text-zinc-400"}`}>
                  Estructura
                </span>
              </div>
              <p className="text-xs text-zinc-500">Bullet points por capítulo. Para improvisar con más libertad.</p>
            </button>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Duración objetivo: <span className="text-red-400 font-bold">{targetDuration} minutos</span>
          </label>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={targetDuration}
            onChange={(e) => setTargetDuration(Number(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>5 min</span>
            <span>15 min</span>
            <span>25 min</span>
          </div>
        </div>

        {/* Topic / notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tema / Notas</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Ej: Video sobre cómo encontrar tu nicho para productos digitales. Enfocado en gente que no sabe por dónde empezar."
            rows={3}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all resize-none"
          />
        </div>

        {/* YouTube reference */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Referencia de YouTube <span className="text-zinc-600">(opcional — pegar transcripción)</span>
          </label>
          <textarea
            value={youtubeRef}
            onChange={(e) => setYoutubeRef(e.target.value)}
            placeholder="Pegá acá la transcripción de un video de YouTube que te guste como referencia de estilo/estructura..."
            rows={4}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 text-white px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Generar video
            </>
          )}
        </button>
      </form>

      {/* Stream output */}
      {streamText && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Generando...</h3>
          <pre
            ref={streamRef}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono"
          >
            {streamText}
          </pre>
        </div>
      )}
    </div>
  );
}
