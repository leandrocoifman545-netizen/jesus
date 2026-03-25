#!/usr/bin/env node
/**
 * Scrapea perfiles de Instagram usando Apify REST API.
 * Extrae TODA la data útil: captions, vistas, engagement, URLs de video.
 *
 * Uso:
 *   node scripts/scrape-ig.mjs @username1 @username2 --limit 50
 *
 * Requiere APIFY_TOKEN en .env.local
 * Guarda en .data/ig-references/{username}.json
 */

import fs from "fs";
import path from "path";

// Load env
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error("Falta APIFY_TOKEN en .env.local");
  console.error("Creá tu cuenta gratis en https://apify.com y copiá tu API token.");
  process.exit(1);
}

const ACTOR_ID = "apify~instagram-post-scraper";
const BASE_URL = "https://api.apify.com/v2";
const OUT_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let limit = 0; // 0 = todos los posts
const usernames = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) {
    limit = parseInt(args[i + 1], 10);
    i++;
  } else {
    usernames.push(args[i].replace(/^@/, ""));
  }
}

if (usernames.length === 0) {
  console.error("Uso: node scripts/scrape-ig.mjs @username1 @username2 [--limit 50]  (sin --limit = TODOS)");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

async function scrapeProfile(username) {
  console.log(`\nScrapeando @${username} (${limit} posts)...`);

  // Start the actor run
  const startRes = await fetch(`${BASE_URL}/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: [username],
      ...(limit > 0 ? { resultsLimit: limit } : {}),
    }),
  });

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Error iniciando actor: ${startRes.status} ${err}`);
  }

  const runData = await startRes.json();
  const runId = runData.data.id;
  console.log(`  Run iniciado: ${runId}`);

  // Poll until finished
  let status = "RUNNING";
  let attempts = 0;
  while ((status === "RUNNING" || status === "READY") && attempts < 120) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await fetch(`${BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const statusData = await statusRes.json();
    status = statusData.data.status;
    process.stdout.write(`  Status: ${status} (${attempts * 3}s)\r`);
    attempts++;
  }
  console.log(`  Status: ${status}`);

  if (status !== "SUCCEEDED") {
    throw new Error(`Run falló con status: ${status}`);
  }

  // Get dataset items
  const datasetId = runData.data.defaultDatasetId;
  const itemsRes = await fetch(`${BASE_URL}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`);
  const items = await itemsRes.json();

  // Extract ALL useful data
  const posts = items.map((item) => {
    const isVideo = (item.type || "").toLowerCase() === "video";
    const isSidecar = (item.type || "").toLowerCase() === "sidecar";

    return {
      // Contenido
      caption: item.caption || item.text || "",
      type: item.type || "Image",

      // Engagement
      likes: item.likesCount || item.likes || 0,
      comments: item.commentsCount || item.comments || 0,
      views: item.videoViewCount || item.videoPlayCount || 0,

      // Timing
      timestamp: item.timestamp || item.takenAt || item.date || "",

      // Media
      url: item.url || (item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : ""),
      shortCode: item.shortCode || "",
      videoUrl: item.videoUrl || item.displayUrl || "",
      videoDuration: item.videoDuration || 0,
      displayUrl: item.displayUrl || "",
      mediaUrls: item.displayResourceUrls || item.images || [],

      // Extras
      location: item.locationName || "",
      hashtags: (item.caption || "").match(/#\w+/g) || [],
      mentions: (item.caption || "").match(/@\w+/g) || [],
      firstComment: item.firstComment || "",
    };
  });

  // Separate videos and text posts
  const videos = posts
    .filter((p) => p.type.toLowerCase() === "video" && p.views > 0)
    .sort((a, b) => b.views - a.views);

  const withCaption = posts
    .filter((p) => p.caption.length > 20)
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));

  // Stats
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);
  const totalViews = videos.reduce((s, p) => s + p.views, 0);
  const videoCount = videos.length;
  const avgLikes = posts.length ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length ? Math.round(totalComments / posts.length) : 0;
  const avgViews = videoCount ? Math.round(totalViews / videoCount) : 0;

  // Content type breakdown
  const typeBreakdown = {};
  for (const p of posts) {
    const t = p.type || "Unknown";
    typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
  }

  // Posting frequency
  const dates = posts
    .map((p) => p.timestamp)
    .filter(Boolean)
    .map((t) => new Date(t))
    .sort((a, b) => b - a);

  let avgDaysBetween = 0;
  if (dates.length > 1) {
    const daySpan = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    avgDaysBetween = Math.round(daySpan / (dates.length - 1));
  }

  // Top hashtags
  const hashtagCount = {};
  for (const p of posts) {
    for (const h of p.hashtags) {
      hashtagCount[h.toLowerCase()] = (hashtagCount[h.toLowerCase()] || 0) + 1;
    }
  }
  const topHashtags = Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));

  const output = {
    username,
    scraped_at: new Date().toISOString(),

    // Resumen
    stats: {
      total_posts: posts.length,
      posts_with_caption: withCaption.length,
      videos: videoCount,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      avg_views_videos: avgViews,
      avg_days_between_posts: avgDaysBetween,
      type_breakdown: typeBreakdown,
      top_hashtags: topHashtags,
    },

    // TODOS los videos por vistas (para transcribir)
    top_videos: videos.map((v) => ({
      url: v.url,
      shortCode: v.shortCode,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      duration: v.videoDuration,
      caption: v.caption.slice(0, 200),
      videoUrl: v.videoUrl,
    })),

    // Top 20 posts por engagement (para estudiar captions)
    top_posts: withCaption.slice(0, 20).map((p) => ({
      url: p.url,
      type: p.type,
      likes: p.likes,
      comments: p.comments,
      views: p.views,
      caption: p.caption,
    })),

    // Todas las captions (para análisis de tono)
    captions: withCaption.map((p) => ({
      caption: p.caption,
      likes: p.likes,
      comments: p.comments,
      views: p.views,
      timestamp: p.timestamp,
      type: p.type,
      url: p.url,
    })),

    // Raw data completa (para pipeline de descarga)
    _raw_posts: posts,
  };

  const outFile = path.join(OUT_DIR, `${username}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  // Print summary
  console.log(`\n  === @${username} ===`);
  console.log(`  Posts: ${posts.length} | Con caption: ${withCaption.length} | Videos: ${videoCount}`);
  console.log(`  Promedio: ${avgLikes} likes, ${avgComments} comments, ${avgViews} views (videos)`);
  console.log(`  Frecuencia: 1 post cada ${avgDaysBetween} días`);
  console.log(`  Tipos: ${Object.entries(typeBreakdown).map(([k, v]) => `${k}: ${v}`).join(", ")}`);

  if (videos.length > 0) {
    console.log(`\n  Top 3 videos por vistas:`);
    for (const v of videos.slice(0, 3)) {
      console.log(`    ${v.views.toLocaleString()} vistas | ${v.likes.toLocaleString()} likes | ${v.url}`);
      console.log(`    "${v.caption.slice(0, 80)}..."`);
    }
  }

  if (withCaption.length > 0) {
    console.log(`\n  Top 3 posts por engagement:`);
    for (const p of withCaption.slice(0, 3)) {
      console.log(`    ${p.likes.toLocaleString()} likes + ${p.comments.toLocaleString()} comments | ${p.url}`);
      console.log(`    "${p.caption.slice(0, 80)}..."`);
    }
  }

  console.log(`\n  Guardado: ${outFile}`);
  return output;
}

// Run all
console.log(`Scrapeando ${usernames.length} perfil(es) con límite de ${limit} posts cada uno...`);

for (const username of usernames) {
  try {
    await scrapeProfile(username);
  } catch (err) {
    console.error(`  Error con @${username}: ${err.message}`);
  }
}

// Summary
console.log("\n\n=== RESUMEN GENERAL ===");
const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"));
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  const s = data.stats;
  if (s) {
    console.log(`@${data.username}: ${s.total_posts} posts, ${s.videos} videos, promedio ${s.avg_likes} likes`);
  } else {
    console.log(`@${data.username}: ${data.captions_with_text || "?"} captions (formato viejo)`);
  }
}
console.log(`\nArchivos en .data/ig-references/`);
console.log(`Siguiente paso: node scripts/ig-download-videos.mjs @username (descarga los top videos)`);
