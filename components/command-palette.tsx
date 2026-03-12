"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  id: string;
  title: string;
  status: string;
  hookTexts: string[];
  framework: string;
  createdAt: string;
}

interface Command {
  id: string;
  label: string;
  category: "page" | "guion" | "action";
  icon: React.ReactNode;
  onSelect: () => void;
  subtitle?: string;
  badge?: string;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  recorded: "Grabado",
  winner: "Winner",
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [generations, setGenerations] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch generations when palette opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/generations/search")
      .then((r) => r.json())
      .then(setGenerations)
      .catch(() => {});
  }, [open]);

  // Listen for ⌘K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  // Build commands list
  const pages: Command[] = [
    {
      id: "page-dashboard",
      label: "Dashboard",
      category: "page",
      icon: <GridIcon />,
      onSelect: () => navigate("/"),
    },
    {
      id: "page-new",
      label: "Nuevo Guion",
      category: "page",
      icon: <PlusIcon />,
      onSelect: () => navigate("/briefs/new"),
    },
    {
      id: "page-session",
      label: "Post-Sesión",
      category: "page",
      icon: <PlayIcon />,
      onSelect: () => navigate("/session"),
    },
    {
      id: "page-references",
      label: "Referencias",
      category: "page",
      icon: <BookIcon />,
      onSelect: () => navigate("/references"),
    },
  ];

  const guionCommands: Command[] = generations.map((g) => ({
    id: `guion-${g.id}`,
    label: g.title,
    category: "guion" as const,
    icon: <FileIcon />,
    onSelect: () => navigate(`/scripts/${g.id}`),
    subtitle: g.hookTexts[0] || g.framework,
    badge: statusLabels[g.status] || g.status,
  }));

  const allCommands = [...pages, ...guionCommands];

  // Filter
  const q = query.toLowerCase().trim();
  const filtered = q
    ? allCommands.filter((cmd) => {
        const text = `${cmd.label} ${cmd.subtitle || ""} ${cmd.badge || ""}`.toLowerCase();
        return q.split(/\s+/).every((word) => text.includes(word));
      })
    : allCommands;

  // Group
  const grouped: { label: string; items: Command[] }[] = [];
  const pageItems = filtered.filter((c) => c.category === "page");
  const guionItems = filtered.filter((c) => c.category === "guion");
  if (pageItems.length) grouped.push({ label: "Páginas", items: pageItems });
  if (guionItems.length) grouped.push({ label: "Guiones", items: guionItems.slice(0, 8) });

  const flatItems = grouped.flatMap((g) => g.items);

  // Keyboard nav
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatItems[activeIndex]) {
      e.preventDefault();
      flatItems[activeIndex].onSelect();
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let itemIndex = 0;

  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <div
          data-command-palette
          className="w-full max-w-[560px] mx-4 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-slide-up"
          style={{ animationDuration: "200ms" }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-zinc-800/60">
            <SearchIcon />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar guiones, páginas..."
              className="flex-1 bg-transparent py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 border-none [&:focus-visible]:outline-none"
            />
            <kbd className="text-[10px] text-zinc-600 bg-zinc-800/50 border border-zinc-700/40 px-1.5 py-0.5 rounded font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[340px] overflow-y-auto p-2">
            {grouped.length === 0 && (
              <div className="py-8 text-center text-sm text-zinc-600">
                Sin resultados para &ldquo;{query}&rdquo;
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.label}>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map((cmd) => {
                  const idx = itemIndex++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-index={idx}
                      onClick={cmd.onSelect}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-75 ${
                        isActive
                          ? "bg-white/[0.06] text-zinc-100"
                          : "text-zinc-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? "text-zinc-300" : "text-zinc-600"}`}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.subtitle && (
                          <div className="text-xs text-zinc-600 truncate mt-0.5">{cmd.subtitle}</div>
                        )}
                      </div>
                      {cmd.badge && (
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            cmd.badge === "Winner"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : cmd.badge === "Grabado"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500 border border-zinc-700/40"
                          }`}
                        >
                          {cmd.badge}
                        </span>
                      )}
                      {isActive && (
                        <kbd className="text-[10px] text-zinc-600 bg-zinc-800/50 border border-zinc-700/40 px-1.5 py-0.5 rounded font-mono ml-1">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-800/60 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800/50 border border-zinc-700/40 px-1 py-0.5 rounded font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800/50 border border-zinc-700/40 px-1 py-0.5 rounded font-mono">↵</kbd>
              abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800/50 border border-zinc-700/40 px-1 py-0.5 rounded font-mono">esc</kbd>
              cerrar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Icons ---

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
