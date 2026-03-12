"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";
import type { LongformOutput } from "@/lib/ai/schemas/longform-output";

interface Generation {
  id: string;
  title?: string;
  status?: string;
  contentType?: string;
  longform?: LongformOutput;
  script: {
    platform_adaptation: { platform: string };
    total_duration_seconds: number;
    word_count: number;
    hooks: Array<{ script_text: string }>;
    development: {
      framework_used: string;
      emotional_arc: string;
      sections: Array<{ section_name: string; script_text: string; timing_seconds: number }>;
    };
  };
}

interface Props {
  generation: Generation;
}

export default function YouTubeViewer({ generation }: Props) {
  const router = useRouter();
  const toast = useToast();
  const lf = generation.longform;
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set([1]));
  const [copied, setCopied] = useState<string | null>(null);

  if (!lf) {
    return <p className="text-zinc-500">Este video no tiene datos de long-form.</p>;
  }

  function toggleChapter(num: number) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  function expandAll() {
    if (!lf) return;
    setOpenChapters(new Set(lf.chapters.map((ch) => ch.number)));
  }

  function collapseAll() {
    setOpenChapters(new Set());
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyFullScript() {
    if (!lf) return;
    let full = `# ${lf.title}\n\n`;
    full += `## Hook\n${lf.hook.script_text}\n\n`;
    for (const ch of lf.chapters) {
      full += `## ${ch.title}\n${ch.content}\n\n`;
      const transition = lf.transitions.find((t) => t.from_chapter === ch.number);
      if (transition) full += `> ${transition.transition_text}\n\n`;
    }
    full += `## Conclusión\n${lf.conclusion.content}\n\n`;
    full += `## CTA\n${lf.cta.primary_text}\n`;
    copyText(full, "full");
    toast("Guión completo copiado");
  }

  const totalMin = Math.round(lf.total_duration_seconds / 60);
  const mode = lf.output_mode === "structure" ? "Estructura" : "Guión completo";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/youtube")}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Volver a YouTube
        </button>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">{lf.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
            {mode}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-800/50 text-zinc-400 border border-zinc-700/30 capitalize">
            {lf.framework}
          </span>
          <span className="text-zinc-500">{totalMin} min</span>
          <span className="text-zinc-500">~{lf.word_count} palabras</span>
          <span className="text-zinc-500">{lf.chapters.length} capítulos</span>
        </div>

        <p className="text-sm text-zinc-500 mt-3 italic">{lf.emotional_arc}</p>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={expandAll} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Expandir todo
        </button>
        <span className="text-zinc-700">|</span>
        <button onClick={collapseAll} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Colapsar todo
        </button>
        <div className="flex-1" />
        <button
          onClick={copyFullScript}
          className="bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          {copied === "full" ? "Copiado" : "Copiar todo"}
        </button>
      </div>

      {/* Hook */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              Hook — {lf.hook.estimated_duration_seconds}s
            </h3>
            <button
              onClick={() => copyText(lf.hook.script_text, "hook")}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              {copied === "hook" ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-sm text-white leading-relaxed">{lf.hook.script_text}</p>
          {lf.hook.visual_notes && (
            <p className="text-xs text-zinc-500 mt-3 flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              {lf.hook.visual_notes}
            </p>
          )}
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3 mb-6">
        {lf.chapters.map((ch, i) => {
          const isOpen = openChapters.has(ch.number);
          const transition = lf.transitions.find((t) => t.from_chapter === ch.number);
          const durationMin = Math.round(ch.estimated_duration_seconds / 60);

          return (
            <div key={ch.number}>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
                {/* Chapter header */}
                <button
                  onClick={() => toggleChapter(ch.number)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {ch.number}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{ch.title}</h3>
                      <p className="text-xs text-zinc-500">{durationMin} min · {ch.key_points.length} puntos clave</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Chapter content */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-zinc-800/50">
                    <div className="flex justify-end mb-2 pt-3">
                      <button
                        onClick={() => copyText(ch.content, `ch-${ch.number}`)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        {copied === `ch-${ch.number}` ? "Copiado" : "Copiar capítulo"}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap mb-4">
                      {ch.content}
                    </div>

                    {/* Key points */}
                    {ch.key_points.length > 0 && (
                      <div className="bg-zinc-800/30 rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Puntos clave</p>
                        <ul className="space-y-1">
                          {ch.key_points.map((point, j) => (
                            <li key={j} className="text-xs text-zinc-400 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Visual notes */}
                    {ch.visual_notes && (
                      <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        {ch.visual_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Transition */}
              {transition && (
                <div className="flex items-center gap-3 py-2 px-5">
                  <div className="h-6 w-px bg-zinc-800" />
                  <p className="text-xs text-zinc-600 italic">{transition.transition_text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Conclusión — {Math.round(lf.conclusion.estimated_duration_seconds / 60)} min
          </h3>
          <button
            onClick={() => copyText(lf.conclusion.content, "conclusion")}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {copied === "conclusion" ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{lf.conclusion.content}</p>
      </div>

      {/* CTA */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">CTA</h3>
        <p className="text-sm text-white font-medium mb-2">{lf.cta.primary_text}</p>
        {lf.cta.midroll_text && (
          <p className="text-xs text-zinc-500">Mid-roll: {lf.cta.midroll_text}</p>
        )}
        {lf.cta.end_screen_notes && (
          <p className="text-xs text-zinc-500 mt-1">End screen: {lf.cta.end_screen_notes}</p>
        )}
      </div>

      {/* SEO Panel */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Título</p>
            <p className="text-sm text-white font-semibold">{lf.seo.title}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{lf.seo.title.length}/60 caracteres</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Descripción</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{lf.seo.description}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {lf.seo.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-400 border border-zinc-700/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Idea de thumbnail</p>
            <p className="text-sm text-zinc-400">{lf.seo.thumbnail_idea}</p>
          </div>
        </div>
      </div>

      {/* Production notes */}
      {lf.production_notes && (
        <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Notas de producción</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{lf.production_notes}</p>
        </div>
      )}
    </div>
  );
}
