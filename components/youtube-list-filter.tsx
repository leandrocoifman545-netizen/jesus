"use client";

import { useState } from "react";
import Link from "next/link";
import RelativeTime from "@/components/relative-time";

interface GenerationItem {
  id: string;
  title: string;
  status: string;
  hookText: string;
  duration: number;
  chapters: number;
  chapterTitles: { number: number; title: string }[];
  framework: string;
  mode: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-zinc-700 text-zinc-300" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/20 text-blue-300" },
  recorded: { label: "Grabado", color: "bg-green-500/20 text-green-300" },
  winner: { label: "Winner", color: "bg-amber-500/20 text-amber-300" },
};

const FRAMEWORK_LABELS: Record<string, string> = {
  educational: "Educativo",
  storytelling: "Storytelling",
  listicle: "Listicle",
  case_study: "Caso de estudio",
  debate: "Debate",
  tutorial: "Tutorial",
  reaction_analysis: "Reacción/Análisis",
};

export default function YouTubeListFilter({ generations }: { generations: GenerationItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = generations.filter((g) => {
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.hookText.toLowerCase().includes(q) ||
        g.chapterTitles.some((ch) => ch.title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, hook o capítulo..."
          className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all"
        />
        <div className="flex items-center gap-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1">
          {["all", "draft", "confirmed", "recorded", "winner"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-red-500/20 text-red-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_LABELS[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(search || statusFilter !== "all") && (
        <p className="text-xs text-zinc-500 mb-4">
          {filtered.length} de {generations.length} videos
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-zinc-500">No se encontraron videos con esos filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((gen) => {
            const st = STATUS_LABELS[gen.status] || STATUS_LABELS.draft;
            return (
              <Link
                key={gen.id}
                href={`/youtube/${gen.id}`}
                className="block bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 hover:bg-zinc-900/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-white truncate group-hover:text-red-300 transition-colors">
                        {gen.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    {gen.hookText && (
                      <p className="text-sm text-zinc-400 line-clamp-1 mb-2">
                        {gen.hookText}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{gen.duration} min</span>
                      <span>{gen.chapters} capítulos</span>
                      <span>{FRAMEWORK_LABELS[gen.framework] || gen.framework}</span>
                      <span>{gen.mode}</span>
                      <RelativeTime date={gen.createdAt} className="text-zinc-600" />
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
