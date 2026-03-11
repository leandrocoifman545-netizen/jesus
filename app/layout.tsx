import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast";
import NavLinks from "@/components/nav-links";
import "./globals.css";

export const metadata: Metadata = {
  title: "Script Generator - Guiones para Video Vertical",
  description: "Genera guiones publicitarios para Reels, TikTok y YouTube Shorts en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Top gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-white/[0.06]">
          <div className="relative mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-bold tracking-tight">
              Script<span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Gen</span>
            </a>
            <NavLinks />
          </div>
        </header>
        <ToastProvider>
          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
