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
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [outputMode, setOutputMode] = useState<"full_script" | "structure" | "both">("full_script");
  const [videoType, setVideoType] = useState<"auto" | "educational" | "storytelling" | "listicle" | "case_study" | "tutorial" | "debate" | "reaction_analysis" | "vsl_camuflado">("auto");
  const [targetDuration, setTargetDuration] = useState(10);
  const [youtubeRef, setYoutubeRef] = useState("");

  // Auto-fill from project
  const selectedProject = projects.find((p) => p.id === projectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setProgress(0);
    progressRef.current = 0;

    const body = {
      projectId: projectId || undefined,
      productDescription: productDescription || selectedProject?.productDescription || "",
      targetAudience: targetAudience || selectedProject?.targetAudience || "",
      additionalNotes: videoType !== "auto"
        ? `[FRAMEWORK: ${videoType}]${additionalNotes ? "\n\n" + additionalNotes : ""}`
        : (additionalNotes || undefined),
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
      // Estimate total chars based on duration for progress
      const estimatedChars = targetDuration * 150 * 5; // rough char estimate

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
              progressRef.current += data.text.length;
              setProgress(Math.min(95, Math.round((progressRef.current / estimatedChars) * 100)));
            } else if (data.type === "done") {
              setProgress(100);
              if (data.validation?.issues?.length > 0) {
                toast(`Video generado con ${data.validation.issues.length} advertencia(s)`);
              } else {
                toast("Video generado");
              }
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
    } catch {
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
              disabled={loading}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all disabled:opacity-50"
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
                disabled={loading}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all disabled:opacity-50"
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
                disabled={loading}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all disabled:opacity-50"
                required={!selectedProject}
              />
            </div>
          </>
        )}

        {/* Output mode */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Modo de output</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: "full_script" as const, label: "Guión completo", desc: "Texto palabra por palabra para teleprompter.", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
              { value: "structure" as const, label: "Estructura", desc: "Bullet points para improvisar.", icon: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" },
              { value: "both" as const, label: "Ambos", desc: "Guión completo + estructura juntos.", icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" },
            ]).map((opt) => {
              const selected = outputMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutputMode(opt.value)}
                  disabled={loading}
                  className={`relative p-4 rounded-xl border text-left transition-all disabled:opacity-50 cursor-pointer ${
                    selected
                      ? "border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 pointer-events-none">
                    <svg className={`w-4 h-4 ${selected ? "text-red-400" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                    </svg>
                    <span className={`text-sm font-semibold ${selected ? "text-white" : "text-zinc-400"}`}>
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 pointer-events-none">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Framework selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Framework</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "auto" as const, label: "Auto", desc: "El sistema elige", pct: "" },
              { value: "educational" as const, label: "Educativo", desc: "Enseñar algo valioso", pct: "30%" },
              { value: "storytelling" as const, label: "Storytelling", desc: "Historia con arco", pct: "20%" },
              { value: "listicle" as const, label: "Listicle", desc: "\"5 errores\", \"3 formas\"", pct: "15%" },
              { value: "case_study" as const, label: "Caso de estudio", desc: "Análisis de UN resultado", pct: "10%" },
              { value: "tutorial" as const, label: "Tutorial", desc: "Paso a paso en vivo", pct: "10%" },
              { value: "debate" as const, label: "Debate", desc: "Dos lados, dar opinión", pct: "5%" },
              { value: "reaction_analysis" as const, label: "Reacción", desc: "Analizar tendencia", pct: "5%" },
              { value: "vsl_camuflado" as const, label: "VSL Camuflado", desc: "Contenido que vende", pct: "5%" },
            ] as const).map((opt) => {
              const selected = videoType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVideoType(opt.value)}
                  disabled={loading}
                  className={`relative p-3 rounded-xl border text-left transition-all disabled:opacity-50 cursor-pointer ${
                    selected
                      ? "border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5 pointer-events-none">
                    <span className={`text-sm font-semibold ${selected ? "text-white" : "text-zinc-400"}`}>
                      {opt.label}
                    </span>
                    {opt.pct && (
                      <span className={`text-[10px] font-mono ${selected ? "text-red-400" : "text-zinc-600"}`}>{opt.pct}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 pointer-events-none leading-tight">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Duración objetivo: <span className="text-red-400 font-bold">{targetDuration} min</span>
          </label>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={targetDuration}
            onChange={(e) => setTargetDuration(Number(e.target.value))}
            disabled={loading}
            className="w-full accent-red-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
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
            disabled={loading}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all resize-none disabled:opacity-50"
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
            disabled={loading}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all resize-none disabled:opacity-50"
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

      {/* Progress indicator */}
      {loading && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 animate-spin text-red-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-zinc-300">Generando guión de YouTube...</p>
                <span className="text-xs text-zinc-500">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 ml-8">
            {progress < 20 ? "Analizando brief y contexto..." :
             progress < 50 ? "Escribiendo capítulos..." :
             progress < 80 ? "Generando SEO y producción..." :
             "Finalizando..."}
          </p>
        </div>
      )}
    </div>
  );
}
