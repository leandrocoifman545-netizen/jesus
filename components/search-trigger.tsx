"use client";

export default function SearchTrigger() {
  return (
    <button
      onClick={() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30 text-zinc-500 text-xs hover:border-zinc-600/50 hover:text-zinc-400 transition-all duration-200 cursor-pointer"
      aria-label="Buscar"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <span className="hidden lg:inline">Buscar...</span>
      <kbd className="ml-1 text-[10px] font-mono text-zinc-600 bg-zinc-800/60 border border-zinc-700/40 px-1.5 py-0.5 rounded">⌘K</kbd>
    </button>
  );
}
