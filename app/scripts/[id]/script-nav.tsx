"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Neighbor {
  id: string;
  title: string;
}

export default function ScriptNav({ prev, next, batchId, projectId }: { prev: Neighbor | null; next: Neighbor | null; batchId?: string; projectId?: string }) {
  const router = useRouter();
  const navQuery = batchId ? `?batch=${batchId}` : projectId ? `?project=${projectId}` : "";

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        router.push(`/scripts/${prev.id}${navQuery}`);
      }
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        router.push(`/scripts/${next.id}${navQuery}`);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next, router, navQuery]);

  return (
    <div className="flex items-center gap-1.5">
      {prev ? (
        <Link
          href={`/scripts/${prev.id}${navQuery}`}
          title={prev.title}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all group"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline max-w-[120px] truncate">{prev.title}</span>
          <span className="sm:hidden">Anterior</span>
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-xl text-xs text-zinc-700 cursor-default flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </span>
      )}

      {next ? (
        <Link
          href={`/scripts/${next.id}${navQuery}`}
          title={next.title}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all group"
        >
          <span className="hidden sm:inline max-w-[120px] truncate">{next.title}</span>
          <span className="sm:hidden">Siguiente</span>
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-xl text-xs text-zinc-700 cursor-default flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      )}
    </div>
  );
}
