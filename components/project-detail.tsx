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

interface BrandDoc {
  name: string;
  content: string;
}

interface Project {
  id: string;
  clientName: string;
  productDescription: string;
  targetAudience: string;
  brandTone: string;
  brandDocument?: string;
  brandDocuments?: BrandDoc[];
  createdAt: string;
}

function getExistingDocs(project: Project): BrandDoc[] {
  if (project.brandDocuments && project.brandDocuments.length > 0) {
    return project.brandDocuments;
  }
  if (project.brandDocument) {
    return [{ name: "Documento de marca", content: project.brandDocument }];
  }
  return [];
}

export default function ProjectDetail({ project: initial }: { project: Project }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState(initial.clientName);
  const [productDescription, setProductDescription] = useState(initial.productDescription);
  const [targetAudience, setTargetAudience] = useState(initial.targetAudience);
  const [brandTone, setBrandTone] = useState(
    TONES.includes(initial.brandTone) ? initial.brandTone : "custom"
  );
  const [customTone, setCustomTone] = useState(
    TONES.includes(initial.brandTone) ? "" : initial.brandTone
  );

  // Existing docs from server (can be marked for removal)
  const [existingDocs, setExistingDocs] = useState<BrandDoc[]>(getExistingDocs(initial));
  const [docsToRemove, setDocsToRemove] = useState<string[]>([]);
  // New files to upload
  const [newFiles, setNewFiles] = useState<File[]>([]);
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
    if (valid.length > 0) setNewFiles((prev) => [...prev, ...valid]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleCancel() {
    setClientName(initial.clientName);
    setProductDescription(initial.productDescription);
    setTargetAudience(initial.targetAudience);
    setBrandTone(TONES.includes(initial.brandTone) ? initial.brandTone : "custom");
    setCustomTone(TONES.includes(initial.brandTone) ? "" : initial.brandTone);
    setExistingDocs(getExistingDocs(initial));
    setDocsToRemove([]);
    setNewFiles([]);
    setDragging(false);
    setError(null);
    setEditing(false);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function markExistingDocForRemoval(name: string) {
    setDocsToRemove((prev) => [...prev, name]);
  }

  function unmarkExistingDoc(name: string) {
    setDocsToRemove((prev) => prev.filter((n) => n !== name));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const tone = brandTone === "custom" ? customTone : brandTone;

    try {
      const formData = new FormData();
      formData.append("clientName", clientName);
      formData.append("productDescription", productDescription);
      formData.append("targetAudience", targetAudience);
      formData.append("brandTone", tone);

      if (docsToRemove.length > 0) {
        formData.append("removeDocs", JSON.stringify(docsToRemove));
      }

      for (const file of newFiles) {
        formData.append("brandDocuments", file);
      }

      const res = await fetch(`/api/projects/${initial.id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  const allDocs = getExistingDocs(initial);

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{initial.clientName}</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {initial.productDescription.substring(0, 120)}
              {initial.productDescription.length > 120 ? "..." : ""}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700">
                {initial.brandTone}
              </span>
              {allDocs.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/20">
                  {allDocs.length} doc{allDocs.length > 1 ? "s" : ""} de marca
                </span>
              )}
              <span className="text-xs text-zinc-600">
                Creado {new Date(initial.createdAt).toLocaleDateString("es-AR")}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
          >
            Editar proyecto
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Publico Objetivo</span>
            <p className="text-sm text-zinc-300 mt-1">{initial.targetAudience}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Tono de Marca</span>
            <p className="text-sm text-zinc-300 mt-1">{initial.brandTone}</p>
          </div>
          {allDocs.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                Documentos de Marca ({allDocs.length})
              </span>
              <div className="space-y-2 mt-2">
                {allDocs.map((doc, i) => (
                  <div key={i}>
                    <p className="text-xs text-purple-400 font-medium">{doc.name}</p>
                    <p className="text-xs text-zinc-500 whitespace-pre-line bg-zinc-950 rounded-lg p-3 max-h-32 overflow-y-auto mt-1">
                      {doc.content.substring(0, 500)}{doc.content.length > 500 ? "..." : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const visibleExistingDocs = existingDocs.filter((d) => !docsToRemove.includes(d.name));
  const removedDocs = existingDocs.filter((d) => docsToRemove.includes(d.name));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Editar Proyecto</h2>
        <button onClick={handleCancel} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Cancelar
        </button>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Nombre del Cliente</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Producto o Servicio</label>
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Publico Objetivo</label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Tono de Marca</label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setBrandTone(t)}
              className={`border rounded-full px-2.5 py-1 text-[11px] transition-colors ${
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
            className={`border rounded-full px-2.5 py-1 text-[11px] transition-colors ${
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
            placeholder="Describe el tono..."
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        )}
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Documentos de Marca</label>

        {/* Existing docs */}
        {visibleExistingDocs.length > 0 && (
          <div className="space-y-2 mb-3">
            {visibleExistingDocs.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2"
              >
                <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{doc.name}</p>
                  <p className="text-[10px] text-zinc-500">{doc.content.length} caracteres</p>
                </div>
                <button
                  type="button"
                  onClick={() => markExistingDocForRemoval(doc.name)}
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

        {/* Docs marked for removal */}
        {removedDocs.length > 0 && (
          <div className="space-y-1 mb-3">
            {removedDocs.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <span className="text-xs text-zinc-500 line-through">{doc.name}</span>
                <span className="text-[10px] text-red-400/60">sera eliminado</span>
                <button
                  type="button"
                  onClick={() => unmarkExistingDoc(doc.name)}
                  className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Deshacer
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New files to upload */}
        {newFiles.length > 0 && (
          <div className="space-y-2 mb-3">
            {newFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-2"
              >
                <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{file.name} <span className="text-purple-400">(nuevo)</span></p>
                  <p className="text-[10px] text-zinc-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
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

        {/* Add more files */}
        <label
          className={`flex items-center gap-3 cursor-pointer border border-dashed rounded-lg p-3 transition-colors ${
            dragging
              ? "border-purple-500 bg-purple-500/5"
              : "border-zinc-800 hover:border-zinc-600"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-400">
              {dragging
                ? "Soltar archivos aqui"
                : visibleExistingDocs.length + newFiles.length > 0
                  ? "Agregar mas documentos (click o arrastra)"
                  : "Subir documentos — click o arrastra (PDF, TXT, MD)"}
            </p>
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !clientName || !productDescription || !targetAudience || (!brandTone || (brandTone === "custom" && !customTone))}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="border border-zinc-700 text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
