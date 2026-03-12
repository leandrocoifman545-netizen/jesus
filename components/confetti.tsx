"use client";

import { useEffect, useState } from "react";

const COLORS = ["#fbbf24", "#f59e0b", "#eab308", "#a78bfa", "#c084fc", "#f472b6"];

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  tr: number;
  color: string;
  size: number;
  delay: number;
}

export default function Confetti({ trigger, originRef }: { trigger: boolean; originRef?: HTMLElement | null }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: 0,
      y: 0,
      tx: (Math.random() - 0.5) * 160,
      ty: -(Math.random() * 80 + 30),
      tr: (Math.random() - 0.5) * 720,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 3,
      delay: Math.random() * 200,
    }));

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      <div className="relative w-full h-full">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute left-1/2 top-1/2"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animation: `particle-fly 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}ms forwards`,
              ["--tx" as string]: `${p.tx}px`,
              ["--ty" as string]: `${p.ty}px`,
              ["--tr" as string]: `${p.tr}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
