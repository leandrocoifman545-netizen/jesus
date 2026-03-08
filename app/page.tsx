import Link from "next/link";
import { listGenerations } from "@/lib/storage/local";

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  reels: "Instagram Reels",
  shorts: "YouTube Shorts",
};

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reels: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  shorts: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function DashboardPage() {
  const generations = await listGenerations();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Tus guiones publicitarios generados</p>
        </div>
        <Link
          href="/briefs/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Guion
        </Link>
      </div>

      {generations.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h2 className="text-lg font-semibold mb-2">Sin guiones todavia</h2>
          <p className="text-zinc-400 mb-6">Crea tu primer guion publicitario para video vertical</p>
          <Link
            href="/briefs/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Crear primer guion
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {generations.map((gen) => (
            <Link
              key={gen.id}
              href={`/scripts/${gen.id}`}
              className="block border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        PLATFORM_COLORS[gen.script.platform_adaptation.platform.toLowerCase().replace("instagram ", "").replace("youtube ", "")] ||
                        "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {gen.script.platform_adaptation.platform}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {gen.script.total_duration_seconds}s
                    </span>
                    <span className="text-xs text-zinc-500">
                      {gen.script.development.framework_used}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 truncate">
                    Hook 1: {gen.script.hooks[0]?.script_text.substring(0, 100)}...
                  </p>
                </div>
                <span className="text-xs text-zinc-600 ml-4 shrink-0">
                  {new Date(gen.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
