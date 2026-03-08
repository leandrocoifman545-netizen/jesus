"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TONES = [
  "Casual y conversacional",
  "Profesional y autoritativo",
  "Urgente y directo",
  "Educativo y didactico",
  "Humoristico y relajado",
  "Inspiracional y emocional",
  "UGC / Testimonial",
];

export default function ProjectForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const ACCEPTED_TYPES = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
  ];
  const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md"];

  function isAcceptedFile(file: File): boolean {
    if (ACCEPTED_TYPES.includes(file.type)) return true;
    return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  }

  function addFiles(incoming: File[]) {
    const valid = incoming.filter(isAcceptedFile);
    if (valid.length > 0) setFiles((prev) => [...prev, ...valid]);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tone = brandTone === "custom" ? customTone : brandTone;

    try {
      const formData = new FormData();
      formData.append("clientName", clientName);
      formData.append("productDescription", productDescription);
      formData.append("targetAudience", targetAudience);
      formData.append("brandTone", tone);
      for (const file of files) {
        formData.append("brandDocuments", file);
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">Nombre del Cliente *</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder='Ej: "Nike", "Headspace", "Mi Marca"'
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Producto o Servicio *</label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Describe el producto o servicio, beneficios principales, precio, diferenciadores..."
          rows={4}
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Publico Objetivo *</label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="Edad, genero, intereses, pain points, nivel socioeconomico, ubicacion..."
          rows={3}
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tono de Marca *</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setBrandTone(t)}
              className={`border rounded-full px-3 py-1.5 text-xs transition-colors ${
                brandTone === t
                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBrandTone("custom")}
            className={`border rounded-full px-3 py-1.5 text-xs transition-colors ${
              brandTone === "custom"
                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            Personalizado...
          </button>
        </div>
        {brandTone === "custom" && (
          <input
            type="text"
            value={customTone}
            onChange={(e) => setCustomTone(e.target.value)}
            placeholder="Describe el tono que buscas..."
            className="mt-3 w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Documentos de Marca <span className="text-zinc-600">(opcional)</span>
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          PDFs o archivos de texto con brand guidelines, brief de marca, info adicional del producto, etc.
        </p>

        {files.length > 0 && (
          <div className="space-y-2 mb-3">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2"
              >
                <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-zinc-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          className={`flex items-center gap-3 cursor-pointer border border-dashed rounded-lg p-4 transition-colors ${
            dragging
              ? "border-purple-500 bg-purple-500/5"
              : "border-zinc-800 hover:border-zinc-600"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="shrink-0 w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-400">
              {dragging
                ? "Soltar archivos aqui"
                : files.length > 0
                  ? "Agregar mas archivos"
                  : "Click o arrastra archivos aqui"}
            </p>
            <p className="text-xs text-zinc-600">PDF, TXT, MD — podes subir varios</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,text/*,application/pdf"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !clientName || !productDescription || !targetAudience || (!brandTone || (brandTone === "custom" && !customTone))}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creando proyecto...
          </>
        ) : (
          "Crear Proyecto"
        )}
      </button>
    </form>
  );
}
