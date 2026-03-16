"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "./toast";
import GlowCard from "./glow-card";
import Confetti from "./confetti";

type GenerationStatus = "draft" | "confirmed" | "recorded" | "winner";

interface Generation {
  id: string;
  createdAt: string;
  title?: string;
  status?: GenerationStatus;
  sessionNotes?: string;
  script: {
    platform_adaptation: { platform: string };
    total_duration_seconds: number;
    development: { framework_used: string };
    visual_format?: { format_name: string };
    hooks: Array<{
      variant_number: number;
      hook_type: string;
      script_text: string;
    }>;
  };
}

interface SessionReviewProps {
  generations: Generation[];
}

export default function SessionReview({ generations: initial }: SessionReviewProps) {
  const toast = useToast();
  const [generations, setGenerations] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const n: Record<string, string> = {};
    initial.forEach((g) => { n[g.id] = g.sessionNotes || ""; });
    return n;
  });

  const drafts = generations.filter((g) => !g.status || g.status === "draft");
  const confirmed = generations.filter((g) => g.status === "confirmed");
  const recorded = generations.filter((g) => g.status === "recorded");
  const winners = generations.filter((g) => g.status === "winner");

  const [confettiId, setConfettiId] = useState<string | null>(null);
  const [bounceId, setBounceId] = useState<string | null>(null);

  async function updateStatus(id: string, status: GenerationStatus, sessionNote?: string) {
    setSaving(id);
    try {
      const body: Record<string, unknown> = { generationId: id, status };
      if (sessionNote !== undefined) body.sessionNotes = sessionNote;
      const res = await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error");
      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status, sessionNotes: sessionNote ?? g.sessionNotes } : g))
      );
      // Trigger animations
      setBounceId(id);
      setTimeout(() => setBounceId(null), 600);
      if (status === "winner") {
        setConfettiId(id);
        setTimeout(() => setConfettiId(null), 1200);
      }
      toast(status === "winner" ? "Winner! 🏆" : status === "recorded" ? "Marcado como grabado" : status === "confirmed" ? "Confirmado — leads quemados" : "Vuelto a borrador");
    } catch {
      toast("Error actualizando", "error");
    } finally {
      setSaving(null);
    }
  }

  async function saveNote(id: string) {
    setSaving(id);
    try {
      await fetch("/api/generate/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: id, sessionNotes: notes[id] }),
      });
      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, sessionNotes: notes[id] } : g))
      );
    } catch {
      toast("Error guardando nota", "error");
    } finally {
      setSaving(null);
    }
  }

  function renderCard(gen: Generation) {
    const currentStatus = gen.status || "draft";
    return (
      <GlowCard key={gen.id} className={`rounded-2xl bg-zinc-900/30 border border-zinc-800/40 p-6 hover:border-zinc-700/40 transition-all duration-300 hover-lift ${bounceId === gen.id ? "animate-success-bounce animate-success-flash" : ""}`} glowColor="rgba(124, 58, 237, 0.06)"><div className="relative space-y-4">
        {confettiId === gen.id && <Confetti trigger={true} />}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/scripts/${gen.id}`} className="text-sm font-medium text-zinc-200 hover:text-purple-400 transition-colors">
              {gen.title || `${gen.script.development.framework_used} | ${gen.script.total_duration_seconds}s`}
            </Link>
            {gen.script.visual_format && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {gen.script.visual_format.format_name}
              </span>
            )}
            <span className="text-[10px] text-zinc-600">{gen.script.hooks.length} leads</span>
          </div>
          <div className="flex items-center gap-1">
            {currentStatus === "draft" && (
              <>
                <button
                  onClick={() => updateStatus(gen.id, "confirmed", notes[gen.id])}
                  disabled={saving === gen.id}
                  className="text-[10px] px-2.5 py-1 rounded-xl border border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/15 transition-colors"
                >
                  {saving === gen.id ? "..." : "Confirmar"}
                </button>
                <button
                  onClick={() => updateStatus(gen.id, "draft")}
                  disabled={saving === gen.id}
                  className="text-[10px] px-2.5 py-1 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 transition-colors"
                  title="Descartar (se queda en borrador)"
                >
                  Descartar
                </button>
              </>
            )}
            {currentStatus === "confirmed" && (
              <>
                <button
                  onClick={() => updateStatus(gen.id, "recorded", notes[gen.id])}
                  disabled={saving === gen.id}
                  className="text-[10px] px-2.5 py-1 rounded-xl border border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/15 transition-colors"
                >
                  {saving === gen.id ? "..." : "Grabado"}
                </button>
                <button
                  onClick={() => updateStatus(gen.id, "draft", notes[gen.id])}
                  disabled={saving === gen.id}
                  className="text-[10px] px-2.5 py-1 rounded-xl border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                >
                  Volver a borrador
                </button>
              </>
            )}
            {currentStatus === "recorded" && (
              <>
                <button
                  onClick={() => updateStatus(gen.id, "winner", notes[gen.id])}
                  disabled={saving === gen.id}
                  className="text-[10px] px-2.5 py-1 rounded-xl border border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 transition-colors"
                >
                  {saving === gen.id ? "..." : "Winner"}
                </button>
                <button
                  onClick={() => updateStatus(gen.id, "confirmed", notes[gen.id])}
                  disabled={saving === gen.id}
                  className="text-[10px] px-2.5 py-1 rounded-xl border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                >
                  Volver a confirmado
                </button>
              </>
            )}
            {currentStatus === "winner" && (
              <span className="text-[10px] px-2.5 py-1 rounded-xl border border-amber-500/30 text-amber-400 bg-amber-500/5">
                Winner
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-400 truncate">
          {(gen.script.hooks?.[0]?.script_text || (gen.script.hooks?.[0] as any)?.text || '').substring(0, 120)}...
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={notes[gen.id] || ""}
            onChange={(e) => setNotes((prev) => ({ ...prev, [gen.id]: e.target.value }))}
            onBlur={() => { if (notes[gen.id] !== (gen.sessionNotes || "")) saveNote(gen.id); }}
            className="flex-1 bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-3 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
            placeholder="Notas de sesion (ej: grabo en 1 toma, cambio el lead 3...)"
          />
        </div>
      </div></GlowCard>
    );
  }

  return (
    <div className="space-y-10">
      {/* Pending review (drafts) */}
      {drafts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-400 mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 animate-pulse" />
            Pendientes de review ({drafts.length})
          </h2>
          <div className="space-y-3 stagger-children">
            {drafts.map(renderCard)}
          </div>
        </div>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-blue-400 mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Confirmados ({confirmed.length})
          </h2>
          <div className="space-y-3 stagger-children">
            {confirmed.map(renderCard)}
          </div>
        </div>
      )}

      {/* Recorded */}
      {recorded.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-green-400 mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Grabados ({recorded.length})
          </h2>
          <div className="space-y-3 stagger-children">
            {recorded.map(renderCard)}
          </div>
        </div>
      )}

      {/* Winners */}
      {winners.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-amber-400 mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Winners ({winners.length})
          </h2>
          <div className="space-y-3 stagger-children">
            {winners.map(renderCard)}
          </div>
        </div>
      )}

      {generations.length === 0 && (
        <p className="text-zinc-500 text-center py-12">No hay guiones. Genera algunos primero.</p>
      )}

      {/* Summary */}
      <div className="bg-zinc-900/40 backdrop-blur border border-zinc-800/40 rounded-2xl p-5 animate-fade-in">
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-500" />{drafts.length} pendientes</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />{confirmed.length} confirmados</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />{recorded.length} grabados</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />{winners.length} winners</span>
          <span className="text-zinc-600 ml-auto">{generations.length} total</span>
        </div>
      </div>
    </div>
  );
}
