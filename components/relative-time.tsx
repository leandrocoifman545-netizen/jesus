"use client";

import { useEffect, useState } from "react";

function getRelative(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (weeks === 1) return "Hace 1 semana";
  if (weeks < 5) return `Hace ${weeks} semanas`;
  return new Date(date).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function RelativeTime({ date, className = "" }: { date: string; className?: string }) {
  const [text, setText] = useState(() => getRelative(date));

  useEffect(() => {
    setText(getRelative(date));
  }, [date]);

  return (
    <time dateTime={date} className={className} title={new Date(date).toLocaleString("es-AR")} suppressHydrationWarning>
      {text}
    </time>
  );
}
