#!/usr/bin/env node
/**
 * Análisis automatizado de un perfil de Instagram scrapeado.
 * Genera métricas procesadas en JSON + tablas resumen en markdown.
 *
 * Reemplaza el cálculo manual en contexto — los números ya vienen hechos.
 *
 * Uso:
 *   node scripts/ig-analyze.mjs @username              → analiza 1 perfil
 *   node scripts/ig-analyze.mjs --all                  → analiza todos los perfiles
 *   node scripts/ig-analyze.mjs --compare              → genera metrics-summary.json comparativo
 *   node scripts/ig-analyze.mjs @username --months 6   → solo últimos 6 meses (default: 12)
 *
 * Output:
 *   .data/ig-references/{username}_metrics.json   — métricas machine-readable
 *   .data/ig-references/{username}_tables.md      — tablas pre-calculadas para el análisis
 *   .data/ig-references/metrics-summary.json      — comparativa cross-profile (con --compare o --all)
 */

import fs from "fs";
import path from "path";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let months = 12;
let compareMode = false;
let allMode = false;
const usernames = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--months" && args[i + 1]) {
    months = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--compare") {
    compareMode = true;
  } else if (args[i] === "--all") {
    allMode = true;
    compareMode = true;
  } else {
    usernames.push(args[i].replace(/^@/, ""));
  }
}

if (!allMode && usernames.length === 0) {
  console.error("Uso: node scripts/ig-analyze.mjs @username [--months 6] [--compare]");
  console.error("      node scripts/ig-analyze.mjs --all");
  process.exit(1);
}

// Discover all profiles if --all
if (allMode) {
  const files = fs.readdirSync(REF_DIR).filter(f => f.endsWith(".json") && !f.includes("_transcripts") && !f.includes("_metrics") && !f.includes("metrics-summary") && !f.includes("ctas-activos"));
  for (const f of files) {
    const u = f.replace(".json", "");
    if (!usernames.includes(u)) usernames.push(u);
  }
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function clr(comments, likes) {
  if (!likes || likes === 0) return 0;
  return (comments / likes) * 100;
}

function lvr(likes, views) {
  if (!views || views === 0) return 0;
  return (likes / views) * 100;
}

function cvr(comments, views) {
  if (!views || views === 0) return 0;
  return (comments / views) * 100;
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function pct(n, total) {
  if (!total) return "0%";
  return (n / total * 100).toFixed(1) + "%";
}

function round2(n) { return Math.round(n * 100) / 100; }

function durationBucket(dur) {
  if (dur <= 20) return "0-20s";
  if (dur <= 45) return "20-45s";
  if (dur <= 60) return "45-60s";
  if (dur <= 75) return "60-75s";
  if (dur <= 100) return "75-100s";
  return "100s+";
}

function captionWordCount(caption) {
  // Strip hashtags and count words
  const clean = (caption || "").replace(/#\w+/g, "").replace(/\s+/g, " ").trim();
  return clean.split(" ").filter(Boolean).length;
}

function extractKeywords(caption) {
  // Find quoted words or ALL-CAPS words that look like CTA keywords
  const quoted = (caption || "").match(/[""](\w+)[""]/g) || [];
  const caps = (caption || "").match(/\b[A-ZÁÉÍÓÚÑ]{3,}\b/g) || [];

  const keywords = new Set();
  for (const q of quoted) keywords.add(q.replace(/[""\u201C\u201D]/g, "").toUpperCase());
  for (const c of caps) {
    // Filter out common non-keyword caps
    if (!["THE", "AND", "FOR", "QUE", "CON", "POR", "DEL", "LOS", "LAS", "UNA", "MIS", "TUS", "SUS", "PERO", "QUÉ", "SIN", "MÁS", "TODO", "COMO", "ESTA", "ESTE", "SOLO", "CADA", "CÓMO"].includes(c)) {
      keywords.add(c);
    }
  }
  return [...keywords];
}

function hasCommentCTA(caption) {
  const lower = (caption || "").toLowerCase();
  return lower.includes("comenta") || lower.includes("comentá") || lower.includes("comment") ||
    lower.includes("escribí") || lower.includes("escribe") || lower.includes("dejame") ||
    lower.includes("dejá") || lower.includes("deja un");
}

// ──────────────────────────────────────────
// Main analysis
// ──────────────────────────────────────────

function analyzeProfile(username) {
  console.log(`\nAnalizando @${username}...`);

  const profilePath = path.join(REF_DIR, `${username}.json`);
  if (!fs.existsSync(profilePath)) {
    console.error(`  No encontré ${profilePath}`);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(profilePath, "utf8"));
  const rawPosts = data._raw_posts || data.posts || [];

  // Temporal filter
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const posts = rawPosts.filter(p => {
    if (!p.timestamp) return true; // include if no date
    return new Date(p.timestamp) >= cutoff;
  });

  console.log(`  ${rawPosts.length} posts totales, ${posts.length} en últimos ${months} meses`);

  // Separate by type
  const videos = posts.filter(p => (p.type || "").toLowerCase() === "video");
  const sidecars = posts.filter(p => (p.type || "").toLowerCase() === "sidecar");
  const images = posts.filter(p => !["video", "sidecar"].includes((p.type || "").toLowerCase()));

  // ── 1. Global metrics ──
  const globalMetrics = {
    total_posts: posts.length,
    videos: videos.length,
    sidecars: sidecars.length,
    images: images.length,
    filtered_out: rawPosts.length - posts.length,
    months_analyzed: months,

    avg_likes: Math.round(avg(posts.map(p => p.likes || 0))),
    avg_comments: Math.round(avg(posts.map(p => p.comments || 0))),
    avg_views: Math.round(avg(videos.filter(p => p.views > 0).map(p => p.views))),
    median_likes: Math.round(median(posts.map(p => p.likes || 0))),
    median_comments: Math.round(median(posts.map(p => p.comments || 0))),
    median_views: Math.round(median(videos.filter(p => p.views > 0).map(p => p.views))),

    clr_global: round2(clr(
      posts.reduce((s, p) => s + (p.comments || 0), 0),
      posts.reduce((s, p) => s + (p.likes || 0), 0)
    )),
    lvr_global: round2(lvr(
      videos.reduce((s, p) => s + (p.likes || 0), 0),
      videos.reduce((s, p) => s + (p.views || 0), 0)
    )),

    posting_frequency_days: 0,
  };

  // Posting frequency
  const dates = posts.map(p => p.timestamp).filter(Boolean).map(t => new Date(t)).sort((a, b) => b - a);
  if (dates.length > 1) {
    const daySpan = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    globalMetrics.posting_frequency_days = round2(daySpan / (dates.length - 1));
  }

  // ── 2. Duration × Engagement ──
  const buckets = {};
  for (const v of videos) {
    const dur = v.videoDuration || v.duration || 0;
    const bucket = durationBucket(dur);
    if (!buckets[bucket]) buckets[bucket] = { count: 0, views: [], likes: [], comments: [], clrs: [], durations: [] };
    buckets[bucket].count++;
    buckets[bucket].views.push(v.views || 0);
    buckets[bucket].likes.push(v.likes || 0);
    buckets[bucket].comments.push(v.comments || 0);
    if ((v.likes || 0) > 0) buckets[bucket].clrs.push(clr(v.comments || 0, v.likes || 0));
    buckets[bucket].durations.push(dur);
  }

  const durationEngagement = {};
  for (const [bucket, data] of Object.entries(buckets)) {
    durationEngagement[bucket] = {
      count: data.count,
      avg_views: Math.round(avg(data.views)),
      avg_likes: Math.round(avg(data.likes)),
      avg_comments: Math.round(avg(data.comments)),
      avg_clr: round2(avg(data.clrs)),
      median_clr: round2(median(data.clrs)),
      avg_duration: round2(avg(data.durations)),
    };
  }

  // ── 3. CLR per post (sorted) ──
  const postsWithCLR = posts.map(p => ({
    shortCode: p.shortCode,
    url: p.url || `https://www.instagram.com/p/${p.shortCode}/`,
    type: p.type || "Unknown",
    likes: p.likes || 0,
    comments: p.comments || 0,
    views: p.views || 0,
    duration: p.videoDuration || p.duration || 0,
    clr: round2(clr(p.comments || 0, p.likes || 0)),
    cvr: round2(cvr(p.comments || 0, p.views || 0)),
    lvr: round2(lvr(p.likes || 0, p.views || 0)),
    caption_preview: (p.caption || "").slice(0, 60).replace(/\n/g, " "),
    caption_full: p.caption || "",
    has_comment_cta: hasCommentCTA(p.caption),
    keywords: extractKeywords(p.caption),
    caption_words: captionWordCount(p.caption),
    timestamp: p.timestamp || "",
  })).sort((a, b) => b.clr - a.clr);

  // ── 4. CTA analysis ──
  const withCTA = postsWithCLR.filter(p => p.has_comment_cta);
  const withoutCTA = postsWithCLR.filter(p => !p.has_comment_cta);

  const ctaAnalysis = {
    with_cta: {
      count: withCTA.length,
      pct: pct(withCTA.length, postsWithCLR.length),
      avg_clr: round2(avg(withCTA.map(p => p.clr))),
      median_clr: round2(median(withCTA.map(p => p.clr))),
      avg_views: Math.round(avg(withCTA.filter(p => p.views > 0).map(p => p.views))),
      avg_comments: Math.round(avg(withCTA.map(p => p.comments))),
    },
    without_cta: {
      count: withoutCTA.length,
      pct: pct(withoutCTA.length, postsWithCLR.length),
      avg_clr: round2(avg(withoutCTA.map(p => p.clr))),
      median_clr: round2(median(withoutCTA.map(p => p.clr))),
      avg_views: Math.round(avg(withoutCTA.filter(p => p.views > 0).map(p => p.views))),
      avg_comments: Math.round(avg(withoutCTA.map(p => p.comments))),
    },
    cta_multiplier: withoutCTA.length > 0 && avg(withoutCTA.map(p => p.clr)) > 0
      ? round2(avg(withCTA.map(p => p.clr)) / avg(withoutCTA.map(p => p.clr)))
      : "N/A",
  };

  // Keyword breakdown
  const keywordStats = {};
  for (const p of withCTA) {
    for (const kw of p.keywords) {
      if (!keywordStats[kw]) keywordStats[kw] = { count: 0, clrs: [], views: [], comments: [] };
      keywordStats[kw].count++;
      keywordStats[kw].clrs.push(p.clr);
      if (p.views > 0) keywordStats[kw].views.push(p.views);
      keywordStats[kw].comments.push(p.comments);
    }
  }
  ctaAnalysis.keywords = Object.entries(keywordStats)
    .map(([kw, d]) => ({
      keyword: kw,
      uses: d.count,
      avg_clr: round2(avg(d.clrs)),
      avg_views: Math.round(avg(d.views)),
      avg_comments: Math.round(avg(d.comments)),
    }))
    .sort((a, b) => b.avg_clr - a.avg_clr);

  // ── 5. Caption analysis ──
  const captionBuckets = { "1-10": [], "11-20": [], "21-35": [], "36-60": [], "60+": [] };
  for (const p of postsWithCLR) {
    const wc = p.caption_words;
    const bucket = wc <= 10 ? "1-10" : wc <= 20 ? "11-20" : wc <= 35 ? "21-35" : wc <= 60 ? "36-60" : "60+";
    captionBuckets[bucket].push(p);
  }

  const captionAnalysis = {};
  for (const [bucket, posts] of Object.entries(captionBuckets)) {
    captionAnalysis[bucket] = {
      count: posts.length,
      avg_clr: round2(avg(posts.map(p => p.clr))),
      avg_views: Math.round(avg(posts.filter(p => p.views > 0).map(p => p.views))),
      avg_comments: Math.round(avg(posts.map(p => p.comments))),
    };
  }

  // ── 6. Hooks (first lines of transcripts) ──
  const transcriptsPath = path.join(REF_DIR, `${username}_transcripts.json`);
  let hooks = [];
  let transcriptCount = 0;

  if (fs.existsSync(transcriptsPath)) {
    const tData = JSON.parse(fs.readFileSync(transcriptsPath, "utf8"));
    const transcripts = tData.transcripts || [];
    transcriptCount = transcripts.length;

    for (const t of transcripts) {
      if (!t.transcript || t.no_audio) continue;

      // Extract first sentence (up to first period, question mark, or 100 chars)
      const text = t.transcript.trim();
      const firstSentenceMatch = text.match(/^[^.?!]{5,120}[.?!]?/);
      const hook = firstSentenceMatch ? firstSentenceMatch[0].trim() : text.slice(0, 100);

      // Extract closing (last sentence)
      const sentences = text.split(/[.?!]\s+/).filter(Boolean);
      const closing = sentences.length > 1 ? sentences[sentences.length - 1].trim().slice(0, 120) : "";

      hooks.push({
        shortCode: t.shortCode,
        hook,
        closing,
        views: t.views || 0,
        likes: t.likes || 0,
        comments: t.comments || 0,
        clr: round2(clr(t.comments || 0, t.likes || 0)),
        duration: t.duration || 0,
      });
    }
    hooks.sort((a, b) => b.clr - a.clr);
  }

  // ── 7. Top posts ──
  const top30CLR = postsWithCLR.slice(0, 30);
  const top30Views = [...postsWithCLR].sort((a, b) => b.views - a.views).slice(0, 30);

  // ── Compile metrics ──
  const metrics = {
    username,
    analyzed_at: new Date().toISOString(),
    months_analyzed: months,
    global: globalMetrics,
    duration_engagement: durationEngagement,
    cta_analysis: ctaAnalysis,
    caption_analysis: captionAnalysis,
    hooks_count: hooks.length,
    transcripts_count: transcriptCount,
    top_hooks: hooks.slice(0, 20),
    top_closings: hooks.sort((a, b) => b.views - a.views).slice(0, 10).map(h => ({
      shortCode: h.shortCode,
      closing: h.closing,
      views: h.views,
    })),
    top30_clr: top30CLR,
    top30_views: top30Views,
    all_posts_clr: postsWithCLR, // Full table
  };

  // Save JSON
  const metricsPath = path.join(REF_DIR, `${username}_metrics.json`);
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(`  Métricas: ${metricsPath}`);

  // ── Generate markdown tables ──
  let md = `# Tablas pre-calculadas: @${username}\n\n`;
  md += `> Generado: ${new Date().toISOString().slice(0, 10)} | Últimos ${months} meses | ${posts.length} posts\n\n`;

  // Global
  md += `## 1. Métricas globales\n\n`;
  md += `| Métrica | Valor |\n|---------|-------|\n`;
  md += `| Posts totales | ${globalMetrics.total_posts} |\n`;
  md += `| Videos | ${globalMetrics.videos} |\n`;
  md += `| Sidecars | ${globalMetrics.sidecars} |\n`;
  md += `| Avg likes | ${globalMetrics.avg_likes.toLocaleString()} |\n`;
  md += `| Avg comments | ${globalMetrics.avg_comments.toLocaleString()} |\n`;
  md += `| Avg views (videos) | ${globalMetrics.avg_views.toLocaleString()} |\n`;
  md += `| CLR global | ${globalMetrics.clr_global}% |\n`;
  md += `| LVR global | ${globalMetrics.lvr_global}% |\n`;
  md += `| Frecuencia | 1 post cada ${globalMetrics.posting_frequency_days} días |\n`;
  md += `| Filtrados (>${months}m) | ${globalMetrics.filtered_out} |\n\n`;

  // Duration × engagement
  md += `## 2. Duración × Engagement\n\n`;
  md += `| Bucket | Videos | Avg Views | Avg Likes | Avg Comments | Avg CLR | Median CLR |\n`;
  md += `|--------|-------:|----------:|----------:|-------------:|--------:|-----------:|\n`;
  const bucketOrder = ["0-20s", "20-45s", "45-60s", "60-75s", "75-100s", "100s+"];
  for (const b of bucketOrder) {
    const d = durationEngagement[b];
    if (!d) continue;
    md += `| ${b} | ${d.count} | ${d.avg_views.toLocaleString()} | ${d.avg_likes.toLocaleString()} | ${d.avg_comments.toLocaleString()} | ${d.avg_clr}% | ${d.median_clr}% |\n`;
  }
  md += `\n`;

  // CTA analysis
  md += `## 3. CTA Analysis\n\n`;
  md += `| | Con CTA | Sin CTA | Multiplicador |\n`;
  md += `|---|---------|---------|---------------|\n`;
  md += `| Posts | ${ctaAnalysis.with_cta.count} (${ctaAnalysis.with_cta.pct}) | ${ctaAnalysis.without_cta.count} (${ctaAnalysis.without_cta.pct}) | |\n`;
  md += `| Avg CLR | ${ctaAnalysis.with_cta.avg_clr}% | ${ctaAnalysis.without_cta.avg_clr}% | ${ctaAnalysis.cta_multiplier}x |\n`;
  md += `| Median CLR | ${ctaAnalysis.with_cta.median_clr}% | ${ctaAnalysis.without_cta.median_clr}% | |\n`;
  md += `| Avg Views | ${ctaAnalysis.with_cta.avg_views.toLocaleString()} | ${ctaAnalysis.without_cta.avg_views.toLocaleString()} | |\n`;
  md += `| Avg Comments | ${ctaAnalysis.with_cta.avg_comments.toLocaleString()} | ${ctaAnalysis.without_cta.avg_comments.toLocaleString()} | |\n\n`;

  if (ctaAnalysis.keywords.length > 0) {
    md += `### Keywords CTA\n\n`;
    md += `| Keyword | Usos | Avg CLR | Avg Views | Avg Comments |\n`;
    md += `|---------|-----:|--------:|----------:|-------------:|\n`;
    for (const kw of ctaAnalysis.keywords.slice(0, 15)) {
      md += `| ${kw.keyword} | ${kw.uses} | ${kw.avg_clr}% | ${kw.avg_views.toLocaleString()} | ${kw.avg_comments.toLocaleString()} |\n`;
    }
    md += `\n`;
  }

  // Caption analysis
  md += `## 4. Caption Length × Engagement\n\n`;
  md += `| Palabras | Posts | Avg CLR | Avg Views | Avg Comments |\n`;
  md += `|----------|------:|--------:|----------:|-------------:|\n`;
  for (const [bucket, d] of Object.entries(captionAnalysis)) {
    if (d.count === 0) continue;
    md += `| ${bucket} | ${d.count} | ${d.avg_clr}% | ${d.avg_views.toLocaleString()} | ${d.avg_comments.toLocaleString()} |\n`;
  }
  md += `\n`;

  // Top hooks
  if (hooks.length > 0) {
    md += `## 5. Top 20 Hooks (por CLR)\n\n`;
    md += `| # | CLR | Views | Hook | shortCode |\n`;
    md += `|---|----:|------:|------|----------|\n`;
    const sortedHooks = [...hooks].sort((a, b) => b.clr - a.clr);
    for (let i = 0; i < Math.min(20, sortedHooks.length); i++) {
      const h = sortedHooks[i];
      md += `| ${i + 1} | ${h.clr}% | ${h.views.toLocaleString()} | ${h.hook.slice(0, 80)} | ${h.shortCode} |\n`;
    }
    md += `\n`;
  }

  // Top 30 CLR table
  md += `## 6. Top 30 posts por CLR\n\n`;
  md += `| # | CLR | Comments | Likes | Views | Dur | CTA | Caption (60ch) |\n`;
  md += `|---|----:|---------:|------:|------:|----:|:---:|---------------|\n`;
  for (let i = 0; i < Math.min(30, top30CLR.length); i++) {
    const p = top30CLR[i];
    md += `| ${i + 1} | ${p.clr}% | ${p.comments.toLocaleString()} | ${p.likes.toLocaleString()} | ${p.views.toLocaleString()} | ${Math.round(p.duration)}s | ${p.has_comment_cta ? "Si" : "No"} | ${p.caption_preview} |\n`;
  }
  md += `\n`;

  // Top 30 views table
  md += `## 7. Top 30 posts por Views\n\n`;
  md += `| # | Views | CLR | Comments | Likes | Dur | CTA | Caption (60ch) |\n`;
  md += `|---|------:|----:|---------:|------:|----:|:---:|---------------|\n`;
  for (let i = 0; i < Math.min(30, top30Views.length); i++) {
    const p = top30Views[i];
    md += `| ${i + 1} | ${p.views.toLocaleString()} | ${p.clr}% | ${p.comments.toLocaleString()} | ${p.likes.toLocaleString()} | ${Math.round(p.duration)}s | ${p.has_comment_cta ? "Si" : "No"} | ${p.caption_preview} |\n`;
  }
  md += `\n`;

  // Full CLR table (separate section, abbreviated)
  md += `## 8. Tabla completa CLR (${postsWithCLR.length} posts)\n\n`;
  md += `> Tabla completa en ${username}_metrics.json (campo all_posts_clr)\n\n`;
  md += `| # | shortCode | CLR | Comments | Likes | Views | CTA |\n`;
  md += `|---|-----------|----:|---------:|------:|------:|:---:|\n`;
  for (let i = 0; i < postsWithCLR.length; i++) {
    const p = postsWithCLR[i];
    md += `| ${i + 1} | ${p.shortCode} | ${p.clr}% | ${p.comments} | ${p.likes} | ${p.views} | ${p.has_comment_cta ? "Si" : "No"} |\n`;
  }

  const tablesPath = path.join(REF_DIR, `${username}_tables.md`);
  fs.writeFileSync(tablesPath, md);
  console.log(`  Tablas: ${tablesPath}`);

  // Print summary
  console.log(`\n  === @${username} — Resumen ===`);
  console.log(`  Posts: ${globalMetrics.total_posts} (${globalMetrics.videos} videos, ${globalMetrics.sidecars} sidecars)`);
  console.log(`  CLR global: ${globalMetrics.clr_global}% | LVR: ${globalMetrics.lvr_global}%`);
  console.log(`  CTA multiplier: ${ctaAnalysis.cta_multiplier}x`);
  console.log(`  Hooks extraídos: ${hooks.length} de ${transcriptCount} transcripciones`);

  if (ctaAnalysis.keywords.length > 0) {
    console.log(`  Top keyword: ${ctaAnalysis.keywords[0].keyword} (${ctaAnalysis.keywords[0].avg_clr}% CLR, ${ctaAnalysis.keywords[0].uses} usos)`);
  }

  return metrics;
}

// ──────────────────────────────────────────
// Cross-profile comparison
// ──────────────────────────────────────────

function generateComparison(allMetrics) {
  console.log("\n\n=== Generando comparativa cross-profile ===\n");

  const summary = {
    generated_at: new Date().toISOString(),
    profiles: allMetrics.map(m => ({
      username: m.username,
      posts: m.global.total_posts,
      videos: m.global.videos,
      avg_views: m.global.avg_views,
      avg_likes: m.global.avg_likes,
      avg_comments: m.global.avg_comments,
      clr_global: m.global.clr_global,
      lvr_global: m.global.lvr_global,
      posting_frequency: m.global.posting_frequency_days,
      cta_multiplier: m.cta_analysis.cta_multiplier,
      transcripts: m.transcripts_count,
      hooks_extracted: m.hooks_count,
      top_keyword: m.cta_analysis.keywords.length > 0
        ? { keyword: m.cta_analysis.keywords[0].keyword, clr: m.cta_analysis.keywords[0].avg_clr }
        : null,
    })),

    // Aggregated insights
    total_posts_analyzed: allMetrics.reduce((s, m) => s + m.global.total_posts, 0),
    total_transcripts: allMetrics.reduce((s, m) => s + m.transcripts_count, 0),
    total_hooks: allMetrics.reduce((s, m) => s + m.hooks_count, 0),

    // Best CLR by profile
    best_clr: [...allMetrics].sort((a, b) => b.global.clr_global - a.global.clr_global)[0]?.username,
    best_views: [...allMetrics].sort((a, b) => b.global.avg_views - a.global.avg_views)[0]?.username,

    // All keywords across profiles
    all_keywords: [],
  };

  // Merge keywords from all profiles
  const kwMap = {};
  for (const m of allMetrics) {
    for (const kw of m.cta_analysis.keywords) {
      if (!kwMap[kw.keyword]) kwMap[kw.keyword] = { keyword: kw.keyword, total_uses: 0, profiles: [], clrs: [] };
      kwMap[kw.keyword].total_uses += kw.uses;
      kwMap[kw.keyword].profiles.push(m.username);
      kwMap[kw.keyword].clrs.push(kw.avg_clr);
    }
  }
  summary.all_keywords = Object.values(kwMap)
    .map(kw => ({ ...kw, avg_clr: round2(avg(kw.clrs)) }))
    .sort((a, b) => b.avg_clr - a.avg_clr);

  const summaryPath = path.join(REF_DIR, "metrics-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`Comparativa: ${summaryPath}`);

  // Print comparison table
  console.log("\n  Perfil         | Posts | Videos | CLR    | Avg Views  | CTA Mult | Top KW");
  console.log("  " + "-".repeat(90));
  for (const p of summary.profiles) {
    const kw = p.top_keyword ? `${p.top_keyword.keyword} (${p.top_keyword.clr}%)` : "N/A";
    console.log(`  @${p.username.padEnd(13)} | ${String(p.posts).padStart(5)} | ${String(p.videos).padStart(6)} | ${String(p.clr_global + "%").padStart(6)} | ${String(p.avg_views.toLocaleString()).padStart(10)} | ${String(p.cta_multiplier + "x").padStart(8)} | ${kw}`);
  }

  console.log(`\n  Total: ${summary.total_posts_analyzed} posts, ${summary.total_transcripts} transcripciones, ${summary.total_hooks} hooks extraídos`);

  return summary;
}

// ──────────────────────────────────────────
// Run
// ──────────────────────────────────────────

const allMetrics = [];

for (const username of usernames) {
  try {
    const metrics = analyzeProfile(username);
    if (metrics) allMetrics.push(metrics);
  } catch (err) {
    console.error(`Error con @${username}: ${err.message}`);
  }
}

if (compareMode && allMetrics.length > 1) {
  generateComparison(allMetrics);
}

console.log("\nListo.");
