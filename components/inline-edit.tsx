"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
  tag?: "p" | "span";
  compact?: boolean;
}

export default function InlineEdit({ value, onSave, className = "", tag: Tag = "p", compact = false }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => { setText(value); }, [value]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [editing]);

  const handleSave = useCallback(async (newText?: string) => {
    const finalText = newText ?? text;
    if (finalText === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(finalText);
      setEditing(false);
    } catch {
      alert("Error guardando");
    } finally {
      setSaving(false);
    }
  }, [text, value, onSave]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setText(value);
      setEditing(false);
      stopListening();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
      stopListening();
    }
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usá Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = text;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
          setText(finalTranscript);
        } else {
          interim += transcript;
        }
      }
      // Show interim in textarea
      if (interim && textareaRef.current) {
        textareaRef.current.value = finalTranscript + (finalTranscript ? " " : "") + interim;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);

    if (!editing) {
      setEditing(true);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }

  function toggleVoice() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  if (editing) {
    return (
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={handleKeyDown}
          className={`w-full bg-zinc-800/30 border border-zinc-800/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all duration-200 ${
            compact ? "rounded-lg px-2 py-1.5 text-[11px] text-zinc-300" : "rounded-xl px-3 py-2 text-sm text-zinc-200"
          } ${className}`}
          disabled={saving}
        />
        <div className={`flex items-center gap-1.5 ${compact ? "mt-1.5" : "mt-2"}`}>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className={`bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 disabled:bg-zinc-700 disabled:from-zinc-700 disabled:to-zinc-700 ${
              compact ? "text-[10px] rounded-lg px-2.5 py-1" : "text-xs rounded-xl px-4 py-1.5"
            }`}
          >
            {saving ? "..." : "Guardar"}
          </button>
          <button
            onClick={() => { setText(value); setEditing(false); stopListening(); }}
            className={`bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 border border-zinc-700/50 transition-all duration-200 ${
              compact ? "text-[10px] rounded-lg px-2 py-1" : "text-xs rounded-xl px-3 py-1.5"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-1 transition-all duration-200 ${
              compact ? "text-[10px] rounded-lg px-2 py-1" : "text-xs rounded-xl px-3 py-1.5"
            } ${
              listening
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 border border-zinc-700/50"
            }`}
            title={listening ? "Parar dictado" : "Dictar con voz"}
          >
            {listening ? (
              <>
                <MicOnIcon />
                {!compact && <span className="animate-pulse">Escuchando...</span>}
              </>
            ) : (
              <>
                <MicOffIcon />
                {!compact && "Voz"}
              </>
            )}
          </button>
          {!compact && <span className="text-[10px] text-zinc-700 ml-auto">Cmd+Enter para guardar · Esc para cancelar</span>}
        </div>
      </div>
    );
  }

  return (
    <span className="group relative inline">
      <Tag
        className={`cursor-pointer hover:bg-white/[0.02] rounded-xl p-2 -m-2 transition-all duration-200 ${className}`}
        onClick={() => setEditing(true)}
        title="Click para editar"
      >
        <span className="text-zinc-700">&ldquo;</span>{value}<span className="text-zinc-700">&rdquo;</span>
      </Tag>
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="ml-1 text-zinc-700 hover:text-zinc-400 transition-colors inline-flex items-center"
        title="Editar"
      >
        <EditIcon />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); startListening(); }}
        className="ml-1 text-zinc-700 hover:text-zinc-400 transition-colors inline-flex items-center"
        title="Dictar con voz"
      >
        <MicOffIcon />
      </button>
    </span>
  );
}

function EditIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function MicOnIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15.75a3 3 0 0 0 3-3V4.5a3 3 0 1 0-6 0v8.25a3 3 0 0 0 3 3Z" />
      <path d="M6 12.75a.75.75 0 0 1 .75.75 5.25 5.25 0 1 0 10.5 0 .75.75 0 0 1 1.5 0 6.75 6.75 0 0 1-6 6.709v2.541h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.541a6.75 6.75 0 0 1-6-6.709.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}
