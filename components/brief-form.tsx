"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlowCard from "./glow-card";

interface Project {
  id: string;
  clientName: string;
  productDescription: string;
  targetAudience: string;
  brandTone: string;
  brandDocuments?: Array<{ name: string; content: string }>;
  brandDocument?: string;
}

export default function BriefForm({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("projectId") || "");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [hookCount, setHookCount] = useState(5);
  const [segment, setSegment] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [referenceText, setReferenceText] = useState("");

  // Structured selectors
  const [targetDuration, setTargetDuration] = useState("60s");
  const [angleFamily, setAngleFamily] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [funnelStage, setFunnelStage] = useState("");

  // Research insights state
  const [researchOpen, setResearchOpen] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchData, setResearchData] = useState<{
    top_keywords: Array<{ keyword: string; total_score: number; angles: string[]; niche: string | null }>;
    by_angle: Record<string, Array<{ keyword: string; total_score: number }>>;
    generated_at: string;
  } | null>(null);
  const [researchError, setResearchError] = useState(false);

  async function fetchResearch() {
    if (researchData) return; // already loaded
    setResearchLoading(true);
    setResearchError(false);
    try {
      const res = await fetch("/api/research?limit=15");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResearchData(data);
    } catch {
      setResearchError(true);
    } finally {
      setResearchLoading(false);
    }
  }

  function handleToggleResearch() {
    const next = !researchOpen;
    setResearchOpen(next);
    if (next) fetchResearch();
  }

  function handleKeywordClick(keyword: string) {
    setAdditionalNotes((prev) =>
      prev ? `${prev}\n${keyword}` : keyword
    );
  }

  // Load project data when selected
  useEffect(() => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    setProductDescription(project.productDescription);
    setTargetAudience(project.targetAudience);
  }, [selectedProjectId, projects]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const [streamingText, setStreamingText] = useState("");
  const [streamingStatus, setStreamingStatus] = useState<"idle" | "connecting" | "streaming" | "saving">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStreamingText("");
    setStreamingStatus("connecting");

    const references = referenceText.trim()
      ? referenceText.split("---").map((r) => r.trim()).filter(Boolean)
      : undefined;

    // Build structured prefix from selectors
    const selectorParts: string[] = [];
    if (targetDuration) selectorParts.push(`[DURACIÓN: ${targetDuration}]`);
    if (angleFamily) selectorParts.push(`[ANGULO: ${angleFamily}]`);
    if (bodyType) selectorParts.push(`[BODY TYPE: ${bodyType}]`);
    if (funnelStage) selectorParts.push(`[FUNNEL: ${funnelStage}]`);
    const selectorPrefix = selectorParts.length > 0 ? selectorParts.join(" ") : "";
    const finalNotes = [selectorPrefix, additionalNotes].filter(Boolean).join("\n") || undefined;

    try {
      const res = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId || undefined,
          productDescription,
          targetAudience,
          hookCount,
          segment: segment || undefined,
          additionalNotes: finalNotes,
          references,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error de conexion" }));
        throw new Error(data.error || "Error generando el guion");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sin streaming disponible");

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
          const json = line.slice(6);
          try {
            const event = JSON.parse(json);
            if (event.type === "start") {
              setStreamingStatus("streaming");
            } else if (event.type === "chunk") {
              setStreamingText((prev) => prev + event.text);
            } else if (event.type === "done") {
              setStreamingStatus("saving");
              router.push(`/scripts/${event.generationId}`);
              return;
            } else if (event.type === "error") {
              throw new Error(event.error);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStreamingStatus("idle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlowCard className="max-w-2xl bg-zinc-900/30 backdrop-blur border border-zinc-800/40 rounded-3xl p-8 animate-spring-up" glowColor="rgba(124, 58, 237, 0.08)">
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Project Selector */}
      {projects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Proyecto</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedProjectId("");
                setProductDescription("");
                setTargetAudience("");
              }}
              className={`border rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
                !selectedProjectId
                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                  : "border-zinc-800/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-700/50 hover:bg-zinc-700/30"
              }`}
            >
              Sin proyecto
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={`border rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
                  selectedProjectId === p.id
                    ? "border-purple-500 bg-purple-500/10 text-purple-400"
                    : "border-zinc-800/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-700/50 hover:bg-zinc-700/30"
                }`}
              >
                {p.clientName}
              </button>
            ))}
          </div>
          {selectedProject && (
            <p className="text-xs text-zinc-500 mt-2">
              Datos del proyecto cargados. Podes editarlos para este guion sin afectar el proyecto original.
              {(selectedProject.brandDocuments?.length || selectedProject.brandDocument) && (
                <span className="text-purple-400 ml-1">
                  (incluye {selectedProject.brandDocuments?.length
                    ? `${selectedProject.brandDocuments.length} doc${selectedProject.brandDocuments.length > 1 ? "s" : ""} de marca`
                    : "documento de marca"})
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Producto/Servicio */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Producto o Servicio *
        </label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Describe tu producto o servicio, sus beneficios principales, precio, diferenciadores..."
          rows={4}
          required
          className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
        />
      </div>

      {/* Publico Objetivo */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Publico Objetivo *
        </label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="Edad, genero, intereses, pain points, nivel socioeconomico, ubicacion..."
          rows={3}
          required
          className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800/50 pt-2">
        <span className="text-[10px] uppercase tracking-widest text-zinc-600">Opciones</span>
      </div>

      {/* Hook Count */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Cantidad de Hooks
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHookCount(Math.max(1, hookCount - 1))}
            className="rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200"
          >
            -
          </button>
          <span className="text-2xl font-bold text-purple-400 w-10 text-center">{hookCount}</span>
          <button
            type="button"
            onClick={() => setHookCount(Math.min(20, hookCount + 1))}
            className="rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200"
          >
            +
          </button>
          <span className="text-xs text-zinc-600 ml-1">max 20</span>
        </div>
        <p className="text-xs text-zinc-600 mt-1.5">
          Podes generar mas despues sin tocar el cuerpo del guion
        </p>
      </div>

      {/* Segmento */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Segmento <span className="text-zinc-600">(opcional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSegment("")}
            className={`border rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
              !segment
                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                : "border-zinc-800/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-700/50 hover:bg-zinc-700/30"
            }`}
          >
            Sin segmento
          </button>
          {[
            { value: "A", label: "A: Emprendedor frustrado" },
            { value: "B", label: "B: Principiante tech 40-60" },
            { value: "C", label: "C: Mamá/papá sobrecargado" },
            { value: "D", label: "D: Escéptico / estafa previa" },
          ].map((seg) => (
            <button
              key={seg.value}
              type="button"
              onClick={() => setSegment(seg.value)}
              className={`border rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
                segment === seg.value
                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                  : "border-zinc-800/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-700/50 hover:bg-zinc-700/30"
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Target Duration */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Duracion</label>
          <select
            value={targetDuration}
            onChange={(e) => setTargetDuration(e.target.value)}
            className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="30s">30s</option>
            <option value="45s">45s</option>
            <option value="60s">60s</option>
            <option value="75s">75s</option>
            <option value="90s">90s</option>
          </select>
        </div>

        {/* Angle Family */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Angulo</label>
          <select
            value={angleFamily}
            onChange={(e) => setAngleFamily(e.target.value)}
            className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">Sin especificar</option>
            <option value="IDENTIDAD">IDENTIDAD — Quien sos</option>
            <option value="OPORTUNIDAD">OPORTUNIDAD — Que esta pasando</option>
            <option value="CONFRONTACION">CONFRONTACION — Que haces mal</option>
            <option value="MECANISMO">MECANISMO — Como funciona</option>
            <option value="HISTORIA">HISTORIA — Storytelling</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tipo de cuerpo</label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">Sin especificar</option>
            <option value="Demolicion de mito">Demolicion de mito</option>
            <option value="Historia con giro">Historia con giro</option>
            <option value="Demo/Proceso">Demo/Proceso</option>
            <option value="Comparacion de caminos">Comparacion de caminos</option>
            <option value="Un dia en la vida">Un dia en la vida</option>
            <option value="Pregunta y respuesta">Pregunta y respuesta</option>
            <option value="Analogia extendida">Analogia extendida</option>
            <option value="Contraste emocional">Contraste emocional</option>
          </select>
        </div>

        {/* Funnel Stage */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Funnel</label>
          <select
            value={funnelStage}
            onChange={(e) => setFunnelStage(e.target.value)}
            className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">Sin especificar</option>
            <option value="TOFU">TOFU</option>
            <option value="MOFU">MOFU</option>
            <option value="BOFU">BOFU</option>
          </select>
        </div>
      </div>

      {/* Research Insights */}
      <div>
        <button
          type="button"
          onClick={handleToggleResearch}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-purple-400 transition-colors duration-200"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${researchOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          Ver tendencias
        </button>

        {researchOpen && (
          <div className="mt-3 bg-zinc-800/20 border border-zinc-800/40 rounded-2xl p-4 space-y-4 animate-spring-up">
            {researchLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cargando research...
              </div>
            )}

            {researchError && (
              <p className="text-xs text-zinc-600">Sin datos de research</p>
            )}

            {researchData && (
              <>
                {/* Top keywords */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Keywords trending</p>
                  <div className="flex flex-wrap gap-1.5">
                    {researchData.top_keywords.map((kw) => (
                      <button
                        key={kw.keyword}
                        type="button"
                        onClick={() => handleKeywordClick(kw.keyword)}
                        title={`Score: ${kw.total_score}${kw.niche ? ` | Nicho: ${kw.niche}` : ""}`}
                        className="border border-zinc-700/50 bg-zinc-800/40 hover:border-purple-500/40 hover:bg-purple-500/10 text-zinc-400 hover:text-purple-300 rounded-lg px-2 py-1 text-[11px] transition-all duration-150"
                      >
                        {kw.keyword}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Angles summary */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Keywords por angulo</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(researchData.by_angle).map(([angle, keywords]) => (
                      <div key={angle} className="flex items-center justify-between bg-zinc-800/30 rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] text-zinc-400 truncate mr-2">{angle}</span>
                        <span className="text-[10px] text-zinc-600 shrink-0">{keywords.length}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-600">
                  Click en un keyword para agregarlo a notas
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Notas adicionales */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Notas Adicionales <span className="text-zinc-600">(opcional)</span>
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Tono preferido, plataforma específica, ofertas especiales, restricciones, palabras clave a incluir..."
          rows={2}
          className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
        />
      </div>

      {/* Referencias */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Referencias de Ads Ganadores{" "}
          <span className="text-zinc-600">(opcional)</span>
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Pega transcripciones o guiones de anuncios que te gusten. Separa
          multiples referencias con &quot;---&quot;
        </p>
        <textarea
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          placeholder={`Ejemplo de referencia 1: "Hey, sabias que el 80% de las personas..." (pegar guion completo)\n---\nEjemplo de referencia 2: "Deja de hacer esto si quieres..." (pegar otro guion)`}
          rows={4}
          className="w-full bg-zinc-800/30 border border-zinc-800/40 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
        />
      </div>

      {/* Streaming Preview */}
      {streamingStatus !== "idle" && streamingText && (
        <div className="bg-zinc-900/30 backdrop-blur border border-purple-500/20 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/5">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800/40">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-sm shadow-purple-500/50" />
            <span className="text-xs text-zinc-400">
              {streamingStatus === "streaming" ? "Generando guion en tiempo real..." : "Guardando..."}
            </span>
          </div>
          <div className="px-4 py-3 max-h-80 overflow-y-auto">
            <pre className={`text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed ${streamingStatus === "streaming" ? "typewriter-cursor" : ""}`}>
              {streamingText}
            </pre>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400 animate-error-shake flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !productDescription || !targetAudience}
        className="relative w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 hover:shadow-lg hover:shadow-purple-500/25 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] pulse-ring"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {streamingStatus === "connecting" && "Conectando..."}
            {streamingStatus === "streaming" && "Generando guion..."}
            {streamingStatus === "saving" && "Guardando resultado..."}
          </>
        ) : (
          `Generar ${hookCount} Hook${hookCount !== 1 ? "s" : ""} + Guion`
        )}
      </button>
    </form>
    </GlowCard>
  );
}
