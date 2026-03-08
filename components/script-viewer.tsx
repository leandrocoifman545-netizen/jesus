"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ScriptOutput } from "@/lib/ai/schemas/script-output";

const HOOK_TYPE_LABELS: Record<string, string> = {
  curiosity_gap: "Curiosity Gap",
  contrarian: "Contrarian",
  question: "Pregunta",
  statistical: "Estadistica",
  pain_point: "Pain Point",
  pattern_interrupt: "Pattern Interrupt",
  reveal_teaser: "Reveal / Teaser",
  authority_social_proof: "Social Proof",
};

const HOOK_TYPE_COLORS: Record<string, string> = {
  curiosity_gap: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  contrarian: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  question: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  statistical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pain_point: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  pattern_interrupt: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reveal_teaser: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  authority_social_proof: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {copied ? "Copiado!" : label || "Copiar"}
    </button>
  );
}

function formatFullScript(script: ScriptOutput, hookIndex: number): string {
  const hook = script.hooks[hookIndex];
  let text = `GUION - ${script.platform_adaptation.platform} (${script.total_duration_seconds}s) | ~${script.word_count} palabras\n`;
  text += `Framework: ${script.development.framework_used} | Arco emocional: ${script.development.emotional_arc}\n`;
  text += `=`.repeat(70) + "\n\n";

  text += `HOOK (Variante ${hook.variant_number} - ${HOOK_TYPE_LABELS[hook.hook_type] || hook.hook_type})\n`;
  text += `-`.repeat(50) + "\n";
  text += `Tiempo: 0-${hook.timing_seconds}s\n`;
  text += `"${hook.script_text}"\n\n`;

  text += `DESARROLLO\n`;
  text += `-`.repeat(50) + "\n";
  let accTime = hook.timing_seconds;
  for (const section of script.development.sections) {
    const isRehook = section.is_rehook ? " [RE-HOOK]" : "";
    text += `[${section.section_name}${isRehook}] (${accTime}-${accTime + section.timing_seconds}s)\n`;
    text += `"${section.script_text}"\n\n`;
    accTime += section.timing_seconds;
  }

  text += `CTA\n`;
  text += `-`.repeat(50) + "\n";
  text += `Tiempo: ${accTime}-${accTime + script.cta.timing_seconds}s\n`;
  text += `"${script.cta.verbal_cta}"\n`;
  text += `Razon: ${script.cta.reason_why}\n`;
  text += `Tipo: ${script.cta.cta_type}\n`;

  return text;
}

function RegenButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={loading}
      title={label || "Regenerar"}
      className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-purple-400 disabled:text-zinc-700 transition-colors"
    >
      {loading ? (
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
        </svg>
      )}
    </button>
  );
}

export default function ScriptViewer({
  script: initialScript,
  generationId,
}: {
  script: ScriptOutput;
  generationId: string;
}) {
  const router = useRouter();
  const [script, setScript] = useState(initialScript);
  const [selectedHook, setSelectedHook] = useState(0);
  const [moreCount, setMoreCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [regenTarget, setRegenTarget] = useState<string | null>(null);

  async function handleRegenerate(target: "section" | "cta" | "hook", index?: number) {
    const key = `${target}-${index ?? ""}`;
    setRegenTarget(key);
    try {
      const res = await fetch("/api/generate/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, target, index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data.script);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error regenerando");
    } finally {
      setRegenTarget(null);
    }
  }

  async function handleGenerateMore() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, count: moreCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScript((prev) => ({
        ...prev,
        hooks: [...prev.hooks, ...data.newHooks],
      }));
      setSelectedHook(script.hooks.length);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generando hooks");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Platform Info + Emotional Arc */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300">Adaptacion de Plataforma</h2>
          <span className="text-xs text-zinc-500">
            {script.total_duration_seconds}s | ~{script.word_count} palabras | {script.development.framework_used}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-zinc-500 text-xs">Plataforma</span>
            <p className="text-white">{script.platform_adaptation.platform}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs">Estilo</span>
            <p className="text-white">{script.platform_adaptation.content_style}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500 text-xs">Consideraciones</span>
            <p className="text-zinc-300">{script.platform_adaptation.key_considerations}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs">Arco Emocional</span>
            <p className="text-purple-300 font-medium">{script.development.emotional_arc}</p>
          </div>
        </div>
      </div>

      {/* Hooks Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {script.hooks.length} Hook{script.hooks.length !== 1 ? "s" : ""}
          </h2>
          <CopyButton text={formatFullScript(script, selectedHook)} label="Copiar guion completo" />
        </div>

        {/* Scrollable hook selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
          {script.hooks.map((hook, i) => (
            <button
              key={i}
              onClick={() => setSelectedHook(i)}
              className={`border rounded-lg p-3 text-left transition-all shrink-0 w-40 ${
                selectedHook === i
                  ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/30"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-zinc-400">#{hook.variant_number}</span>
                <span className="text-[10px] text-zinc-600">{hook.timing_seconds}s</span>
              </div>
              <span
                className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${
                  HOOK_TYPE_COLORS[hook.hook_type] || "bg-zinc-800 text-zinc-400"
                }`}
              >
                {HOOK_TYPE_LABELS[hook.hook_type] || hook.hook_type}
              </span>
              <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-tight">
                &ldquo;{hook.script_text}&rdquo;
              </p>
            </button>
          ))}

          {/* Generate More button inline */}
          <div className="border border-dashed border-zinc-700 rounded-lg p-3 shrink-0 w-40 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMoreCount(Math.max(1, moreCount - 1))}
                className="text-zinc-600 hover:text-zinc-400 text-xs w-5 h-5 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-sm font-bold text-zinc-400 w-5 text-center">{moreCount}</span>
              <button
                type="button"
                onClick={() => setMoreCount(Math.min(10, moreCount + 1))}
                className="text-zinc-600 hover:text-zinc-400 text-xs w-5 h-5 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              onClick={handleGenerateMore}
              disabled={generating}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:text-zinc-600 transition-colors"
            >
              {generating ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </span>
              ) : (
                `+ ${moreCount} hooks`
              )}
            </button>
          </div>
        </div>

        {/* Selected Hook Detail */}
        {script.hooks[selectedHook] && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold">
                Hook #{script.hooks[selectedHook].variant_number}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  HOOK_TYPE_COLORS[script.hooks[selectedHook].hook_type] || ""
                }`}
              >
                {HOOK_TYPE_LABELS[script.hooks[selectedHook].hook_type]}
              </span>
              <span className="text-xs text-zinc-600">{script.hooks[selectedHook].timing_seconds}s</span>
              <RegenButton
                onClick={() => handleRegenerate("hook", selectedHook)}
                loading={regenTarget === `hook-${selectedHook}`}
                label="Regenerar este hook"
              />
            </div>
            <p className="text-white text-lg leading-relaxed">
              &ldquo;{script.hooks[selectedHook].script_text}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Script Flow */}
      <div>
        <h2 className="text-lg font-bold mb-4">Guion</h2>
        <div className="space-y-3">
          {/* Hook row */}
          {(() => {
            const hook = script.hooks[selectedHook];
            return (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-purple-400">HOOK #{hook.variant_number}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">0-{hook.timing_seconds}s</span>
                  <RegenButton
                    onClick={() => handleRegenerate("hook", selectedHook)}
                    loading={regenTarget === `hook-${selectedHook}`}
                  />
                </div>
                <p className="text-zinc-200 text-sm">&ldquo;{hook.script_text}&rdquo;</p>
              </div>
            );
          })()}

          {/* Development sections */}
          {(() => {
            let accTime = script.hooks[selectedHook].timing_seconds;
            return script.development.sections.map((section, i) => {
              const startTime = accTime;
              accTime += section.timing_seconds;
              const isRehook = section.is_rehook;
              return (
                <div
                  key={i}
                  className={`border rounded-xl p-4 ${
                    isRehook
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${isRehook ? "text-amber-400" : "text-zinc-400"}`}>
                      {section.section_name}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono">{startTime}-{accTime}s</span>
                    <RegenButton
                      onClick={() => handleRegenerate("section", i)}
                      loading={regenTarget === `section-${i}`}
                    />
                  </div>
                  <p className="text-zinc-200 text-sm">&ldquo;{section.script_text}&rdquo;</p>
                </div>
              );
            });
          })()}

          {/* CTA */}
          {(() => {
            const devTotal = script.development.sections.reduce(
              (sum, s) => sum + s.timing_seconds,
              script.hooks[selectedHook].timing_seconds
            );
            return (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-400">CTA</span>
                  <span className="text-[10px] text-zinc-600 font-mono">{devTotal}-{devTotal + script.cta.timing_seconds}s</span>
                  <span className="text-[10px] text-zinc-600">({script.cta.cta_type})</span>
                  <RegenButton
                    onClick={() => handleRegenerate("cta")}
                    loading={regenTarget === "cta-"}
                  />
                </div>
                <p className="text-zinc-200 text-sm">&ldquo;{script.cta.verbal_cta}&rdquo;</p>
                <p className="text-zinc-500 text-xs mt-1 italic">{script.cta.reason_why}</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Copy Buttons */}
      <div className="flex flex-wrap gap-2">
        {script.hooks.map((hook, i) => (
          <button
            key={i}
            onClick={() => {
              navigator.clipboard.writeText(formatFullScript(script, i));
            }}
            className="border border-zinc-800 hover:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Copiar con Hook #{hook.variant_number}
          </button>
        ))}
      </div>
    </div>
  );
}
