"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [referenceText, setReferenceText] = useState("");

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

    try {
      const res = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId || undefined,
          productDescription,
          targetAudience,
          hookCount,
          additionalNotes: additionalNotes || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-6">
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
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
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
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
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
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
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
          className="w-full bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 resize-none transition-all duration-200"
        />
      </div>

      {/* Streaming Preview */}
      {streamingStatus !== "idle" && streamingText && (
        <div className="bg-zinc-900/30 backdrop-blur border border-purple-500/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs text-zinc-400">
              {streamingStatus === "streaming" ? "Generando guion en tiempo real..." : "Guardando..."}
            </span>
          </div>
          <div className="px-4 py-3 max-h-80 overflow-y-auto">
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
              {streamingText}
            </pre>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !productDescription || !targetAudience}
        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/20 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
  );
}
