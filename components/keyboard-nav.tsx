"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardNav() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === "n") {
        e.preventDefault();
        router.push("/briefs/new");
      }

      // ⌘K is handled by CommandPalette
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}

export function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium text-zinc-500 bg-zinc-800/60 border border-zinc-700/40 rounded-md font-mono leading-none ${className}`}>
      {children}
    </kbd>
  );
}
