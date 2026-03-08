import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Script Generator - Guiones para Video Vertical",
  description: "Genera guiones publicitarios para Reels, TikTok y YouTube Shorts en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="border-b border-zinc-800 px-6 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <a href="/" className="text-lg font-bold tracking-tight">
              Script<span className="text-purple-500">Gen</span>
            </a>
            <nav className="flex gap-4 text-sm text-zinc-400">
              <a href="/" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/projects" className="hover:text-white transition-colors">Proyectos</a>
              <a href="/briefs/new" className="hover:text-white transition-colors">Nuevo Guion</a>
              <a href="/references" className="hover:text-white transition-colors">Referencias</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
