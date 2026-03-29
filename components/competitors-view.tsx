"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

interface Post {
  username: string;
  caption: string;
  likes: number;
  comments: number;
  views: number;
  type: string;
  duration: number | null;
  timestamp: string;
  url: string;
  shortCode: string;
  displayUrl: string;
  engagementRate: number;
  score: number;
}

interface Profile {
  username: string;
  totalPosts: number;
  videos: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}

interface Summary {
  totalPosts: number;
  totalVideos: number;
  avgEngagement: number;
  avgViews: number;
  profileCount: number;
}

type SortKey = "views" | "likes" | "comments" | "engagementRate" | "score" | "duration" | "timestamp";
type SortDir = "asc" | "desc";
type PostType = "all" | "Video" | "Sidecar" | "Image";

const TYPE_LABELS: Record<string, string> = {
  all: "Todos",
  Video: "Reels",
  Sidecar: "Carruseles",
  Image: "Imagenes",
};

const TYPE_COLORS: Record<string, string> = {
  Video: "bg-purple-500",
  Sidecar: "bg-blue-500",
  Image: "bg-emerald-500",
};

const PROFILE_COLORS = [
  "text-purple-400",
  "text-blue-400",
  "text-emerald-400",
  "text-amber-400",
  "text-rose-400",
  "text-cyan-400",
  "text-pink-400",
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(ts: string): string {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function timeAgo(ts: string): string {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}sem`;
  if (days < 365) return `${Math.floor(days / 30)}m`;
  return `${Math.floor(days / 365)}a`;
}

const PAGE_SIZE = 50;

export default function CompetitorsView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<PostType>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [page, setPage] = useState(1);

  // Modal
  const [selected, setSelected] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/ig-competitors")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setProfiles(data.profiles || []);
        setSummary(data.summary || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        return prev;
      }
      setSortDir("desc");
      return key;
    });
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    let result = posts;
    if (typeFilter !== "all") result = result.filter((p) => p.type === typeFilter);
    if (accountFilter !== "all") result = result.filter((p) => p.username === accountFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.caption.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "timestamp") {
        va = new Date(a.timestamp).getTime() || 0;
        vb = new Date(b.timestamp).getTime() || 0;
      } else {
        va = (a[sortKey] as number) || 0;
        vb = (b[sortKey] as number) || 0;
      }
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [posts, typeFilter, accountFilter, search, sortKey, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, accountFilter, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profileColorMap: Record<string, string> = {};
  profiles.forEach((p, i) => {
    profileColorMap[p.username] = PROFILE_COLORS[i % PROFILE_COLORS.length];
  });

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Perfiles</span>
            <p className="text-2xl font-bold mt-1">{summary.profileCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Posts</span>
            <p className="text-2xl font-bold mt-1">{formatNumber(summary.totalPosts)}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Reels</span>
            <p className="text-2xl font-bold mt-1">{formatNumber(summary.totalVideos)}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Eng. promedio</span>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{summary.avgEngagement}%</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Views promedio</span>
            <p className="text-2xl font-bold mt-1">{formatNumber(summary.avgViews)}</p>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type filter */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl">
          {(["all", "Video", "Sidecar", "Image"] as PostType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === t ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Account filter */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl overflow-x-auto">
          <button
            onClick={() => setAccountFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              accountFilter === "all" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Todos
          </button>
          {profiles.map((p) => (
            <button
              key={p.username}
              onClick={() => setAccountFilter(p.username)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                accountFilter === p.username ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              @{p.username}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en captions..."
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Results count */}
        <span className="text-xs text-zinc-500">
          {filtered.length} resultados
          {filtered.length !== posts.length && ` — pag ${page}/${totalPages}`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-zinc-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-500 font-medium w-8">#</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-500 font-medium min-w-[300px]">Post</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Cuenta</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Tipo</th>
                <SortHeader label="Views" sortKey="views" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Likes" sortKey="likes" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Comments" sortKey="comments" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Eng. Rate" sortKey="engagementRate" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Score" sortKey="score" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Dur." sortKey="duration" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortHeader label="Fecha" sortKey="timestamp" current={sortKey} dir={sortDir} onClick={handleSort} />
              </tr>
            </thead>
            <tbody>
              {paginated.map((post, i) => (
                <tr
                  key={`${post.shortCode}-${i}`}
                  onClick={() => setSelected(post)}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-zinc-600 text-xs font-mono">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">
                      {post.caption || <span className="text-zinc-600 italic">Sin caption</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${profileColorMap[post.username] || "text-zinc-400"}`}>
                      @{post.username}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${TYPE_COLORS[post.type] || "bg-zinc-500"}`} />
                    <span className="text-xs text-zinc-400">
                      {post.type === "Video" ? "Reel" : post.type === "Sidecar" ? "Carrusel" : "Img"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-300">{formatNumber(post.views)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-300">{formatNumber(post.likes)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-300">{formatNumber(post.comments)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono ${
                      post.engagementRate >= 10 ? "text-emerald-400" :
                      post.engagementRate >= 5 ? "text-amber-400" : "text-zinc-400"
                    }`}>
                      {post.engagementRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold ${
                      post.score >= 20 ? "text-emerald-400" :
                      post.score >= 10 ? "text-amber-400" : "text-zinc-400"
                    }`}>
                      {post.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-500">{formatDuration(post.duration)}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500" title={post.timestamp}>
                    {timeAgo(post.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs text-zinc-500">
              Pagina {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Post detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-zinc-900 border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <span className={`text-sm font-medium ${profileColorMap[selected.username] || "text-zinc-300"}`}>
                  @{selected.username}
                </span>
                <span className="text-zinc-600 text-xs ml-2">
                  {selected.type === "Video" ? "Reel" : selected.type === "Sidecar" ? "Carrusel" : "Imagen"}
                  {selected.duration ? ` · ${formatDuration(selected.duration)}` : ""}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Thumbnail */}
            {selected.displayUrl && (
              <div className="flex justify-center bg-black/30 p-4">
                <img
                  src={selected.displayUrl}
                  alt=""
                  className="max-h-[300px] rounded-lg object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Views</span>
                <p className="text-lg font-bold">{formatNumber(selected.views)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Likes</span>
                <p className="text-lg font-bold">{formatNumber(selected.likes)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Comments</span>
                <p className="text-lg font-bold">{formatNumber(selected.comments)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Eng. Rate</span>
                <p className={`text-lg font-bold ${
                  selected.engagementRate >= 10 ? "text-emerald-400" :
                  selected.engagementRate >= 5 ? "text-amber-400" : "text-zinc-300"
                }`}>
                  {selected.engagementRate}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Score</span>
                <p className={`text-lg font-bold ${
                  selected.score >= 20 ? "text-emerald-400" : selected.score >= 10 ? "text-amber-400" : "text-zinc-300"
                }`}>{selected.score}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Fecha</span>
                <p className="text-sm text-zinc-300">{formatDate(selected.timestamp)} ({timeAgo(selected.timestamp)})</p>
              </div>
            </div>

            {/* Caption */}
            <div className="px-6 py-4">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Caption</span>
              <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap leading-relaxed">
                {selected.caption || "Sin caption"}
              </p>
            </div>

            {/* Link to IG */}
            {selected.url && (
              <div className="px-6 pb-6">
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Ver en Instagram
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Sortable table header */
function SortHeader({
  label,
  sortKey: key,
  current,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
}) {
  const active = current === key;
  return (
    <th
      onClick={() => onClick(key)}
      className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-medium cursor-pointer select-none transition-colors hover:text-zinc-200 whitespace-nowrap"
    >
      <span className={active ? "text-purple-400" : "text-zinc-500"}>{label}</span>
      {active && (
        <span className="ml-1 text-purple-400">
          {dir === "desc" ? "↓" : "↑"}
        </span>
      )}
    </th>
  );
}
