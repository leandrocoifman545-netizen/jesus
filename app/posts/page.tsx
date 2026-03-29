import Link from "next/link";
import { cachedListPosts as listPosts } from "@/lib/storage/local";

const TYPE_LABELS: Record<string, string> = {
  carousel: "Carrusel",
  image: "Imagen",
};

const TYPE_STYLES: Record<string, string> = {
  carousel: "bg-blue-500/15 text-blue-400",
  image: "bg-violet-500/15 text-violet-400",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-700/50 text-zinc-300",
  scheduled: "bg-amber-500/20 text-amber-400",
  published: "bg-emerald-500/20 text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  scheduled: "Programado",
  published: "Publicado",
};

export default async function PostsPage() {
  const posts = await listPosts();

  // Group by batch_id
  const batches = new Map<string, typeof posts>();
  const noBatch: typeof posts = [];
  for (const post of posts) {
    if (post.batch_id) {
      const existing = batches.get(post.batch_id) || [];
      existing.push(post);
      batches.set(post.batch_id, existing);
    } else {
      noBatch.push(post);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Posts IG
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} — carruseles y publicaciones del feed
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-lg">No hay posts todavia</p>
          <p className="text-sm mt-2">Genera un batch con /posts-ig</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group block bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 hover:bg-zinc-900/80 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[post.post_type] || TYPE_STYLES.carousel}`}>
                      {TYPE_LABELS[post.post_type] || post.post_type}
                    </span>
                    {post.post_type === "carousel" && (
                      <span>{post.slides.length} slides</span>
                    )}
                    <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      {post.keyword}
                    </span>
                    {post.avatar_target && (
                      <span className="text-zinc-600">{post.avatar_target}</span>
                    )}
                    {post.publish_day && (
                      <span className="text-zinc-600">{post.publish_day}</span>
                    )}
                  </div>
                  {post.topic && (
                    <p className="text-xs text-zinc-600 mt-2 line-clamp-1">{post.topic}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {post.metrics && post.metrics.comments != null && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">{post.metrics.comments} comm</p>
                      {post.metrics.likes != null && (
                        <p className="text-[10px] text-zinc-600">{post.metrics.likes} likes</p>
                      )}
                    </div>
                  )}
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[post.status] || STATUS_STYLES.draft}`}>
                    {STATUS_LABELS[post.status] || post.status}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    {new Date(post.createdAt).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
