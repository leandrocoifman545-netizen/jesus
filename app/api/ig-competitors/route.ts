import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const IG_DIR = join(process.cwd(), ".data", "ig-references");

// Profiles that are actual competitor accounts (skip meta files)
const SKIP_FILES = new Set([
  "metrics-summary.json",
  "pattern-coverage.json",
  "pattern-library.json",
]);

export async function GET() {
  try {
    const files = await readdir(IG_DIR).catch(() => []);
    const profiles: Array<{
      username: string;
      totalPosts: number;
      videos: number;
      avgViews: number;
      avgLikes: number;
      avgComments: number;
      engagementRate: number;
    }> = [];
    const allPosts: Array<{
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
    }> = [];

    for (const file of files) {
      if (!file.endsWith(".json") || file.includes("_") || SKIP_FILES.has(file)) continue;

      const raw = await readFile(join(IG_DIR, file), "utf8");
      const data = JSON.parse(raw);
      const username = data.username;
      if (!username) continue;

      const rawPosts = data._raw_posts || [];
      if (rawPosts.length === 0) continue;

      const stats = data.stats || {};
      const avgViews = stats.avg_views_videos || 0;
      const avgLikes = stats.avg_likes || 0;
      const avgComments = stats.avg_comments || 0;

      profiles.push({
        username,
        totalPosts: rawPosts.length,
        videos: stats.videos || 0,
        avgViews,
        avgLikes,
        avgComments,
        engagementRate: avgViews > 0 ? +((((avgLikes + avgComments) / avgViews) * 100).toFixed(2)) : 0,
      });

      for (const post of rawPosts) {
        const views = post.views || 0;
        const likes = post.likes || 0;
        const comments = post.comments || 0;
        const eng = views > 0 ? +((((likes + comments) / views) * 100).toFixed(2)) : 0;

        // Score = weighted engagement (comments worth 3x, shares worth 5x)
        // Normalize to make it comparable
        const score = +(((likes + comments * 3) / Math.max(views, 1) * 100).toFixed(1));

        allPosts.push({
          username,
          caption: (post.caption || "").slice(0, 300),
          likes,
          comments,
          views,
          type: post.type || "Video",
          duration: post.videoDuration || null,
          timestamp: post.timestamp || "",
          url: post.url || "",
          shortCode: post.shortCode || "",
          displayUrl: post.displayUrl || "",
          engagementRate: eng,
          score,
        });
      }
    }

    // Sort by views desc by default
    allPosts.sort((a, b) => b.views - a.views);

    // Aggregate stats
    const totalPosts = allPosts.length;
    const totalVideos = allPosts.filter(p => p.type === "Video").length;
    const avgEngagement = totalPosts > 0
      ? +(allPosts.reduce((s, p) => s + p.engagementRate, 0) / totalPosts).toFixed(2)
      : 0;
    const avgViews = totalVideos > 0
      ? Math.round(allPosts.filter(p => p.type === "Video").reduce((s, p) => s + p.views, 0) / totalVideos)
      : 0;

    return NextResponse.json({
      profiles,
      posts: allPosts,
      summary: {
        totalPosts,
        totalVideos,
        avgEngagement,
        avgViews,
        profileCount: profiles.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
