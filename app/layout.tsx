import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast";
import NavLinks from "@/components/nav-links";
import KeyboardNav from "@/components/keyboard-nav";
import CommandPalette from "@/components/command-palette";
import SearchTrigger from "@/components/search-trigger";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tinta — Guiones para Video Vertical",
  description: "Genera guiones publicitarios para Reels, TikTok y YouTube Shorts en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased dot-grid">
        <KeyboardNav />
        <CommandPalette />
        {/* Top gradient line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500/80 to-transparent" />

        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-zinc-950/70 border-b border-white/[0.04]">
          <div className="relative mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight">
                Tin<span className="gradient-text-animated">ta</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <NavLinks />
              <div className="hidden md:block">
                <SearchTrigger />
              </div>
            </div>
          </div>
        </header>
        <ToastProvider>
          <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
        </ToastProvider>

        {/* Footer */}
        <footer className="border-t border-zinc-800/30 mt-20">
          <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500/50 to-violet-600/50 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white/80" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </div>
              Tinta
            </div>
            <p className="text-[11px] text-zinc-700">
              Guiones que convierten, powered by AI
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
