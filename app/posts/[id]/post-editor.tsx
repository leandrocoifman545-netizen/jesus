"use client";

import { useState, useCallback } from "react";
import type { StoredPost } from "@/lib/storage/local";

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
];

export default function PostEditor({ post: initial }: { post: StoredPost }) {
  const [post, setPost] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (updated: StoredPost) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved = await res.json();
        setPost(saved);
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const updateField = <K extends keyof StoredPost>(key: K, value: StoredPost[K]) => {
    const updated = { ...post, [key]: value };
    setPost(updated);
    save(updated);
  };

  const updateMetric = (key: string, value: string) => {
    const num = value === "" ? undefined : parseInt(value, 10);
    const updated = {
      ...post,
      metrics: { ...post.metrics, [key]: isNaN(num as number) ? undefined : num },
    };
    setPost(updated);
    save(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500">
            <span className="bg-blue-500/15 text-blue-400 px-2.5 py-0.5 rounded-full font-medium text-xs">
              {post.post_type === "carousel" ? "Carrusel" : "Imagen"}
            </span>
            <span className="bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full text-xs">
              Keyword: {post.keyword}
            </span>
            {post.avatar_target && <span>{post.avatar_target}</span>}
            <span>{new Date(post.createdAt).toLocaleString("es-AR")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-zinc-600">Guardando...</span>}
          <select
            value={post.status}
            onChange={(e) => updateField("status", e.target.value as StoredPost["status"])}
            className="bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Topic</p>
          <p className="text-sm text-zinc-300">{post.topic || "—"}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Lead Magnet</p>
          <p className="text-sm text-zinc-300">{post.lead_magnet || "—"}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Dia de publicacion</p>
          <p className="text-sm text-zinc-300">{post.publish_day || "—"}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Tipo</p>
          <p className="text-sm text-zinc-300">{post.post_type === "carousel" ? `Carrusel (${post.slides.length} slides)` : "Imagen"}</p>
        </div>
      </div>

      {/* Caption */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Caption</h2>
        <p className="text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {post.caption}
        </p>
      </div>

      {/* Slides */}
      {post.slides.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-4">
            Slides ({post.slides.length})
          </h2>
          <div className="grid gap-3">
            {post.slides.map((slide) => (
              <div
                key={slide.number}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex gap-4"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/15 text-purple-400 text-sm font-bold shrink-0">
                  {slide.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200">{slide.text}</p>
                  {slide.visual_concept && (
                    <p className="text-xs text-zinc-600 mt-1.5 italic">{slide.visual_concept}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Design notes */}
      {post.design_notes && (
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">Notas de diseno</h2>
          <p className="text-sm text-zinc-400 whitespace-pre-wrap">{post.design_notes}</p>
        </div>
      )}

      {/* Metrics */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 mb-4">Metricas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["likes", "comments", "saves", "reach"] as const).map((key) => (
            <div key={key}>
              <label className="text-xs text-zinc-600 block mb-1 capitalize">{key}</label>
              <input
                type="number"
                value={post.metrics?.[key] ?? ""}
                onChange={(e) => updateMetric(key, e.target.value)}
                placeholder="—"
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Notas</h2>
        <textarea
          value={post.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={3}
          placeholder="Notas sobre este post..."
          className="w-full bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>
    </div>
  );
}
