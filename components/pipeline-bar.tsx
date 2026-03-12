"use client";

import { useState } from "react";

interface Segment {
  count: number;
  label: string;
  gradient: string;
  shadow?: string;
  dotColor: string;
}

interface PipelineBarProps {
  total: number;
  segments: Segment[];
  burnedLeads: number;
}

export default function PipelineBar({ total, segments, burnedLeads }: PipelineBarProps) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="mb-12">
      <div className="relative flex items-center gap-1.5 h-2.5 rounded-full overflow-hidden bg-zinc-900/60 border border-zinc-800/30">
        {segments.map((seg, i) =>
          seg.count > 0 ? (
            <div
              key={i}
              className={`relative h-full ${seg.gradient} rounded-full transition-all duration-700 ease-out ${seg.shadow || ""} ${hover === i ? "brightness-125" : ""} bar-fill`}
              style={{ width: `${(seg.count / total) * 100}%`, animationDelay: `${i * 200 + 400}ms` }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/50 text-[11px] text-zinc-200 font-medium whitespace-nowrap shadow-xl z-10 pointer-events-none animate-fade-in" style={{ animationDuration: "150ms" }}>
                  {seg.count} {seg.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700/50 rotate-45 -mt-1" />
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-5">
          {segments.map((seg, i) =>
            seg.count > 0 ? (
              <span key={i} className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className={`w-2 h-2 rounded-full ${seg.dotColor}`} />
                {seg.label} ({seg.count})
              </span>
            ) : null
          )}
        </div>
        <span className="text-[11px] text-zinc-600">{burnedLeads} leads quemados</span>
      </div>
    </div>
  );
}
