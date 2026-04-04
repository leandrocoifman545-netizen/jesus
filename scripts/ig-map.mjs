#!/usr/bin/env node
/**
 * MAPA ESTRATÉGICO DE PERFIL — ig-map.mjs
 *
 * Genera un mapa automático de un perfil scrapeado ANTES de bajar videos.
 * Decide CUÁNTO analizar basándose en la distribución de calidad del perfil.
 *
 * Qué hace:
 *   1. Lee métricas del scrape (no necesita transcripciones)
 *   2. Calcula distribución de calidad (CLR) y detecta si es bimodal
 *   3. Separa orgánico vs venta (por CTA en caption)
 *   4. Agrupa contenido en clusters temáticos (keywords en captions)
 *   5. Detecta A/B tests probables (captions similares)
 *   6. Calcula umbral dinámico de calidad adaptativo al perfil
 *   7. Recomienda qué videos bajar con POR QUÉ
 *
 * Uso:
 *   node scripts/ig-map.mjs @username
 *   node scripts/ig-map.mjs @username --months 6
 *
 * Requiere:
 *   - Perfil scrapeado: .data/ig-references/{username}.json
 *   - Métricas generadas: .data/ig-references/{username}_metrics.json (opcional, regenera si falta)
 *
 * Output:
 *   .data/ig-references/{username}_map.json   — datos machine-readable
 *   .data/ig-references/{username}_map.md     — mapa legible para decisión humana
 */

import fs from "fs";
import path from "path";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let username = "";
let months = 12;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--months" && args[i + 1]) {
    months = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i].startsWith("@") || (!args[i].startsWith("--") && !username)) {
    username = args[i].replace(/^@/, "");
  }
}

if (!username) {
  console.error("Uso: node scripts/ig-map.mjs @username [--months 12]");
  process.exit(1);
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function clr(comments, likes) {
  if (!likes || likes === 0) return 0;
  return Math.round((comments / likes) * 10000) / 100;
}

function round2(n) { return Math.round(n * 100) / 100; }

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const mean = avg(arr);
  const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function zScore(value, mean, sd) {
  if (sd === 0) return 0;
  return (value - mean) / sd;
}

// ──────────────────────────────────────────
// CTA detection (from ig-analyze.mjs)
// ──────────────────────────────────────────

function hasCommentCTA(caption) {
  const lower = (caption || "").toLowerCase();
  return lower.includes("comenta") || lower.includes("comentá") || lower.includes("comment") ||
    lower.includes("escribí") || lower.includes("escribe") || lower.includes("dejame") ||
    lower.includes("dejá") || lower.includes("deja un") || lower.includes("mándame") ||
    lower.includes("mandame") || lower.includes("envíame") || lower.includes("dm");
}

// ──────────────────────────────────────────
// Caption similarity (Levenshtein-based)
// ──────────────────────────────────────────

function normalizeCaption(caption) {
  return (caption || "")
    .toLowerCase()
    .replace(/#\w+/g, "")           // remove hashtags
    .replace(/https?:\/\/\S+/g, "") // remove URLs
    .replace(/[^\w\sáéíóúñü]/g, "") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstNWords(text, n) {
  return text.split(/\s+/).slice(0, n).join(" ");
}

// Simple word-overlap similarity (faster than Levenshtein for our use case)
function wordOverlapSimilarity(a, b) {
  if (!a || !b) return 0;
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? overlap / union : 0; // Jaccard similarity
}

// ──────────────────────────────────────────
// Topic clustering (keyword-based)
// ──────────────────────────────────────────

// Extract meaningful keywords from caption (not stopwords, not hashtags)
const STOPWORDS = new Set([
  // Spanish
  "de", "la", "el", "en", "que", "y", "a", "los", "del", "se", "las", "por",
  "un", "para", "con", "no", "una", "su", "al", "lo", "como", "más", "pero",
  "sus", "le", "ya", "o", "este", "sí", "porque", "esta", "entre", "cuando",
  "muy", "sin", "sobre", "también", "me", "hasta", "hay", "donde", "quien",
  "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra",
  "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes", "algunos",
  "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos",
  "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas",
  "algunas", "algo", "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus",
  "vos", "ellas", "nosotras", "vosotros", "vosotras", "os", "mío", "mía",
  "es", "son", "ser", "fue", "sido", "era", "han", "has", "he", "va", "vas",
  "ir", "hacer", "tiene", "puede", "tengo", "hoy", "así", "si", "cada", "vez",
  "solo", "bien", "mejor", "aquí", "ahora", "tan", "cual", "tal", "dos", "tres",
  "forma", "manera", "tipo", "parte", "cosas", "cosa",
  // English
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for",
  "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his",
  "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my",
  "one", "all", "would", "there", "their", "what", "so", "up", "out", "if",
  "about", "who", "get", "which", "go", "me", "when", "make", "can", "like",
  "time", "no", "just", "him", "know", "take", "people", "into", "year", "your",
  "good", "some", "them", "than", "then", "now", "its", "way", "how",
]);

function extractTopicKeywords(caption) {
  const clean = normalizeCaption(caption);
  const words = clean.split(/\s+/).filter(w =>
    w.length > 3 &&
    !STOPWORDS.has(w) &&
    !/^\d+$/.test(w)
  );
  return [...new Set(words)];
}

function clusterByTopics(posts) {
  // Count keyword frequency across all posts
  const kwFreq = {};
  for (const p of posts) {
    const kws = extractTopicKeywords(p.caption || "");
    for (const kw of kws) {
      kwFreq[kw] = (kwFreq[kw] || 0) + 1;
    }
  }

  // Keep keywords that appear in 2+ posts but not in >40% (too generic)
  // Lower thresholds to catch clusters in profiles with short/generic captions
  const minFreq = Math.max(2, Math.ceil(posts.length * 0.01));
  const maxFreq = Math.ceil(posts.length * 0.4);
  const relevantKws = Object.entries(kwFreq)
    .filter(([, count]) => count >= minFreq && count <= maxFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50) // top 50 keywords
    .map(([kw]) => kw);

  if (relevantKws.length === 0) {
    return [{ name: "general", keywords: [], posts: posts.map(p => p.shortCode) }];
  }

  // Assign each post to its best-matching keyword cluster
  // First, find keyword co-occurrence to merge related keywords
  const kwPosts = {};
  for (const kw of relevantKws) {
    kwPosts[kw] = new Set();
  }

  for (const p of posts) {
    const pKws = extractTopicKeywords(p.caption || "");
    for (const kw of relevantKws) {
      if (pKws.includes(kw)) {
        kwPosts[kw].add(p.shortCode);
      }
    }
  }

  // Merge keywords with >50% overlap into clusters
  const used = new Set();
  const clusters = [];

  for (const kw of relevantKws) {
    if (used.has(kw)) continue;

    const cluster = { name: kw, keywords: [kw], postCodes: new Set(kwPosts[kw]) };
    used.add(kw);

    for (const other of relevantKws) {
      if (used.has(other)) continue;
      const overlap = [...kwPosts[kw]].filter(sc => kwPosts[other].has(sc)).length;
      const smaller = Math.min(kwPosts[kw].size, kwPosts[other].size);
      if (smaller > 0 && overlap / smaller > 0.5) {
        cluster.keywords.push(other);
        for (const sc of kwPosts[other]) cluster.postCodes.add(sc);
        used.add(other);
      }
    }

    if (cluster.postCodes.size >= 2) {
      clusters.push(cluster);
    }
  }

  // Assign unassigned posts to "otros"
  const assigned = new Set();
  for (const c of clusters) {
    for (const sc of c.postCodes) assigned.add(sc);
  }
  const unassigned = posts.filter(p => !assigned.has(p.shortCode));
  if (unassigned.length > 0) {
    clusters.push({
      name: "otros",
      keywords: [],
      postCodes: new Set(unassigned.map(p => p.shortCode)),
    });
  }

  return clusters;
}

// ──────────────────────────────────────────
// Bimodal detection
// ──────────────────────────────────────────

function detectBimodal(clrs) {
  if (clrs.length < 10) return { bimodal: false, reason: "muestra chica" };

  // Split into CTA vs non-CTA groups is done externally.
  // Here we check if the CLR distribution itself has two peaks.
  // Simple heuristic: if the gap between median and mean is large relative to stddev,
  // or if there's a clear split between two groups.

  const sorted = [...clrs].sort((a, b) => a - b);
  const mean = avg(sorted);
  const med = median(sorted);
  const sd = stdDev(sorted);

  // Check: is there a cluster of high CLR posts (>10x median)?
  const highThreshold = Math.max(med * 5, mean + 2 * sd);
  const highCluster = sorted.filter(v => v > highThreshold);
  const lowCluster = sorted.filter(v => v <= highThreshold);

  if (highCluster.length >= 3 && lowCluster.length >= 5) {
    return {
      bimodal: true,
      reason: `${highCluster.length} posts con CLR >${round2(highThreshold)}% vs ${lowCluster.length} posts debajo`,
      high_cluster: { count: highCluster.length, avg: round2(avg(highCluster)), min: round2(Math.min(...highCluster)) },
      low_cluster: { count: lowCluster.length, avg: round2(avg(lowCluster)), max: round2(Math.max(...lowCluster)) },
      threshold: round2(highThreshold),
    };
  }

  return { bimodal: false, reason: "distribución unimodal" };
}

// ──────────────────────────────────────────
// A/B test detection
// ──────────────────────────────────────────

function detectABTests(posts) {
  const abGroups = [];
  const used = new Set();

  for (let i = 0; i < posts.length; i++) {
    if (used.has(i)) continue;
    const captionA = normalizeCaption(posts[i].caption);
    const first15A = getFirstNWords(captionA, 15);
    if (first15A.split(/\s+/).length < 5) continue; // too short to compare

    const group = [i];

    for (let j = i + 1; j < posts.length; j++) {
      if (used.has(j)) continue;
      const captionB = normalizeCaption(posts[j].caption);
      const first15B = getFirstNWords(captionB, 15);
      if (first15B.split(/\s+/).length < 5) continue;

      const sim = wordOverlapSimilarity(first15A, first15B);
      if (sim >= 0.55) {
        group.push(j);
      }
    }

    if (group.length >= 2) {
      for (const idx of group) used.add(idx);
      abGroups.push({
        posts: group.map(idx => ({
          shortCode: posts[idx].shortCode,
          caption_preview: (posts[idx].caption || "").slice(0, 80).replace(/\n/g, " "),
          views: posts[idx].views || 0,
          likes: posts[idx].likes || 0,
          comments: posts[idx].comments || 0,
          clr: clr(posts[idx].comments || 0, posts[idx].likes || 0),
          duration: posts[idx].duration || 0,
          has_cta: hasCommentCTA(posts[idx].caption),
        })),
        similarity: round2(wordOverlapSimilarity(
          normalizeCaption(posts[group[0]].caption),
          normalizeCaption(posts[group[1]].caption)
        )),
        variable_detected: "caption (confirmación con transcripción pendiente)",
        views_delta: null,
      });

      // Calculate views delta
      const lastGroup = abGroups[abGroups.length - 1];
      const views = lastGroup.posts.map(p => p.views).filter(v => v > 0);
      if (views.length >= 2) {
        const maxV = Math.max(...views);
        const minV = Math.min(...views);
        lastGroup.views_delta = minV > 0 ? `${round2(maxV / minV)}x` : "N/A";
      }
    }
  }

  return abGroups;
}

// ──────────────────────────────────────────
// Dynamic threshold calculation
// ──────────────────────────────────────────

function calculateThreshold(posts, organicPosts, salePosts, bimodalResult) {
  const totalPosts = posts.length;

  // Perfil chico: bajar todos
  if (totalPosts < 30) {
    return {
      strategy: "bajar_todos",
      reason: `Solo ${totalPosts} posts. Muestra demasiado chica para filtrar.`,
      recommended_ids: posts.map(p => p.shortCode),
      recommended_count: totalPosts,
      pct_of_total: "100%",
    };
  }

  const allCLRs = posts.map(p => clr(p.comments || 0, p.likes || 0));
  const sd = stdDev(allCLRs);
  const meanCLR = avg(allCLRs);

  let recommended = new Set();
  let reasons = [];

  if (bimodalResult.bimodal) {
    // Bimodal: threshold separado para cada grupo
    const orgCLRs = organicPosts.map(p => clr(p.comments || 0, p.likes || 0));
    const saleCLRs = salePosts.map(p => clr(p.comments || 0, p.likes || 0));

    // Orgánico: top por views (CLR bajo no significa malo en orgánico)
    const orgByViews = [...organicPosts].sort((a, b) => (b.views || 0) - (a.views || 0));
    const orgTopCount = Math.min(15, Math.ceil(organicPosts.length * 0.2));
    for (const p of orgByViews.slice(0, orgTopCount)) recommended.add(p.shortCode);
    reasons.push(`Top ${orgTopCount} orgánicos por views`);

    // Venta: todos si son pocos, top por CLR if many
    if (salePosts.length <= 20) {
      for (const p of salePosts) recommended.add(p.shortCode);
      reasons.push(`Todos los ${salePosts.length} posts de venta (pocos)`);
    } else {
      // Dynamic percentile: more posts = more aggressive filter
      const salePct = salePosts.length <= 50 ? 75 : salePosts.length <= 200 ? 85 : 90;
      const saleThreshold = percentile(saleCLRs, salePct);
      const topSale = salePosts.filter(p => clr(p.comments || 0, p.likes || 0) >= saleThreshold);
      // Cap at 30 max sale posts to keep download manageable
      const cappedSale = [...topSale].sort((a, b) =>
        clr(b.comments || 0, b.likes || 0) - clr(a.comments || 0, a.likes || 0)
      ).slice(0, 30);
      for (const p of cappedSale) recommended.add(p.shortCode);
      reasons.push(`Top ${cappedSale.length} de venta (CLR ≥${round2(saleThreshold)}%, p${salePct}${topSale.length > 30 ? `, cap 30 de ${topSale.length}` : ""})`);
    }
  } else {
    // Unimodal: umbral por percentil según dispersión
    const isLowVariance = sd < meanCLR * 0.5; // calidad pareja
    const thresholdPct = isLowVariance ? 50 : 75;
    const threshold = percentile(allCLRs, thresholdPct);

    const aboveThreshold = posts.filter(p => clr(p.comments || 0, p.likes || 0) >= threshold);

    if (aboveThreshold.length <= 60) {
      for (const p of aboveThreshold) recommended.add(p.shortCode);
      reasons.push(`${aboveThreshold.length} posts con CLR ≥${round2(threshold)}% (p${thresholdPct})`);
    } else {
      // Demasiados: top tercio de los filtrados
      const sorted = [...aboveThreshold].sort((a, b) =>
        clr(b.comments || 0, b.likes || 0) - clr(a.comments || 0, a.likes || 0)
      );
      const take = Math.ceil(sorted.length / 3);
      for (const p of sorted.slice(0, take)) recommended.add(p.shortCode);
      reasons.push(`Top ${take} de ${aboveThreshold.length} posts sobre umbral (CLR ≥${round2(threshold)}%)`);
    }

    if (isLowVariance) {
      reasons.push("Calidad pareja (baja varianza) → umbral más bajo para tener más muestra");
    }
  }

  // Siempre agregar: top 10 por views (pueden no estar en el filtro CLR)
  const byViews = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
  let viewsAdded = 0;
  for (const p of byViews.slice(0, 10)) {
    if (!recommended.has(p.shortCode)) {
      recommended.add(p.shortCode);
      viewsAdded++;
    }
  }
  if (viewsAdded > 0) reasons.push(`+${viewsAdded} top views no incluidos en filtro CLR`);

  // Agregar fracasos para Lente A (~20% de los recomendados, mín 3, máx 10)
  const failCount = Math.min(10, Math.max(3, Math.ceil(recommended.size * 0.2)));
  const byCLRAsc = [...posts].sort((a, b) =>
    clr(a.comments || 0, a.likes || 0) - clr(b.comments || 0, b.likes || 0)
  );
  let failsAdded = 0;
  for (const p of byCLRAsc) {
    if (failsAdded >= failCount) break;
    if (!recommended.has(p.shortCode) && (p.views || 0) > 0) {
      recommended.add(p.shortCode);
      failsAdded++;
    }
  }
  reasons.push(`+${failsAdded} fracasos para Lente A (comparar éxitos vs fracasos)`);

  return {
    strategy: bimodalResult.bimodal ? "bimodal_separado" : "umbral_dinamico",
    reason: reasons.join(". "),
    recommended_ids: [...recommended],
    recommended_count: recommended.size,
    pct_of_total: round2((recommended.size / totalPosts) * 100) + "%",
  };
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────

console.log(`\n🗺️  Generando mapa estratégico para @${username}...\n`);

// Load scrape data
const scrapePath = path.join(REF_DIR, `${username}.json`);
if (!fs.existsSync(scrapePath)) {
  console.error(`❌ No existe ${scrapePath}. Corré primero: node scripts/scrape-ig.mjs @${username}`);
  process.exit(1);
}

const scrapeData = JSON.parse(fs.readFileSync(scrapePath, "utf8"));
const rawPosts = scrapeData._raw_posts || scrapeData.posts || [];

// Temporal filter
const cutoff = new Date();
cutoff.setMonth(cutoff.getMonth() - months);
const posts = rawPosts.filter(p => {
  if (!p.timestamp) return true;
  return new Date(p.timestamp) >= cutoff;
}).map(p => ({
  shortCode: p.shortCode,
  type: p.type || "Unknown",
  likes: p.likes || 0,
  comments: p.comments || 0,
  views: p.views || 0,
  duration: p.videoDuration || p.duration || 0,
  caption: p.caption || "",
  timestamp: p.timestamp || "",
  url: p.url || `https://www.instagram.com/p/${p.shortCode}/`,
}));

console.log(`  ${rawPosts.length} posts totales, ${posts.length} en últimos ${months} meses`);

const videos = posts.filter(p => (p.type || "").toLowerCase() === "video");
const sidecars = posts.filter(p => (p.type || "").toLowerCase() === "sidecar");

// ── 1. Separar orgánico vs venta ──
const salePosts = posts.filter(p => hasCommentCTA(p.caption));
const organicPosts = posts.filter(p => !hasCommentCTA(p.caption));

console.log(`  Orgánico: ${organicPosts.length} | Venta (con CTA): ${salePosts.length} | Ratio: ${round2(organicPosts.length / Math.max(1, salePosts.length))}:1`);

// ── 2. Distribución de calidad ──
const allCLRs = posts.map(p => clr(p.comments, p.likes));
const distribution = {
  mean: round2(avg(allCLRs)),
  median: round2(median(allCLRs)),
  stddev: round2(stdDev(allCLRs)),
  p25: round2(percentile(allCLRs, 25)),
  p50: round2(percentile(allCLRs, 50)),
  p75: round2(percentile(allCLRs, 75)),
  p90: round2(percentile(allCLRs, 90)),
  min: round2(Math.min(...allCLRs)),
  max: round2(Math.max(...allCLRs)),
};

// ── 3. Bimodal detection ──
const bimodal = detectBimodal(allCLRs);
console.log(`  Distribución: ${bimodal.bimodal ? "BIMODAL" : "unimodal"} — ${bimodal.reason}`);

// ── 4. Topic clusters ──
// NOTE: Clustering works best with profiles that have long/descriptive captions.
// Profiles with very short captions (like Jaime's 1-10 word organic captions)
// may only produce 1 generic cluster. In these cases, clusters improve after
// transcriptions are available — re-run with --with-transcripts then.
const rawClusters = clusterByTopics(posts);
const clusters = rawClusters.map(c => {
  const clusterPosts = posts.filter(p => c.postCodes.has(p.shortCode));
  const clusterCLRs = clusterPosts.map(p => clr(p.comments, p.likes));
  const clusterViews = clusterPosts.filter(p => p.views > 0).map(p => p.views);
  const ctaCount = clusterPosts.filter(p => hasCommentCTA(p.caption)).length;

  return {
    name: c.name,
    keywords: c.keywords,
    post_count: clusterPosts.length,
    avg_clr: round2(avg(clusterCLRs)),
    avg_views: Math.round(avg(clusterViews)),
    cta_pct: round2((ctaCount / Math.max(1, clusterPosts.length)) * 100),
    top_post: clusterPosts.sort((a, b) =>
      clr(b.comments, b.likes) - clr(a.comments, a.likes)
    )[0]?.shortCode || "",
  };
}).sort((a, b) => b.post_count - a.post_count);

console.log(`  Clusters temáticos: ${clusters.filter(c => c.name !== "otros").length} + "otros"`);

// ── 5. A/B test detection ──
const abTests = detectABTests(posts);
console.log(`  A/B tests probables: ${abTests.length} grupos`);

// Add A/B test posts to recommended
const abTestIds = new Set();
for (const group of abTests) {
  for (const p of group.posts) abTestIds.add(p.shortCode);
}

// ── 6. Dynamic threshold ──
const threshold = calculateThreshold(posts, organicPosts, salePosts, bimodal);

// Ensure A/B test videos are included (but cap if too many)
let finalRecommended = new Set(threshold.recommended_ids);
let abAdded = 0;

// If A/B tests would push us over 40% of total, only include the most valuable ones
// Cap total at 25% of profile, with A/B budget being what's left after threshold picks
const maxTotal = Math.max(30, Math.ceil(posts.length * 0.25));
const abBudget = Math.max(10, Math.min(40, maxTotal - finalRecommended.size));

// Rank A/B tests by views delta (most informative first)
const rankedAbIds = [];
for (const group of abTests.sort((a, b) => {
  const deltaA = a.views_delta ? parseFloat(a.views_delta) : 0;
  const deltaB = b.views_delta ? parseFloat(b.views_delta) : 0;
  return deltaB - deltaA;
})) {
  for (const p of group.posts) {
    if (!finalRecommended.has(p.shortCode)) {
      rankedAbIds.push(p.shortCode);
    }
  }
}

for (const id of rankedAbIds) {
  if (abAdded >= abBudget) break;
  finalRecommended.add(id);
  abAdded++;
}

// Ensure 1 representative per cluster that isn't "otros"
let clusterRepsAdded = 0;
for (const c of clusters) {
  if (c.name === "otros") continue;
  if (c.top_post && !finalRecommended.has(c.top_post)) {
    finalRecommended.add(c.top_post);
    clusterRepsAdded++;
  }
}

const finalIds = [...finalRecommended];

console.log(`\n  📋 Recomendación: bajar ${finalIds.length} videos (${round2((finalIds.length / posts.length) * 100)}% del total)`);
if (abAdded > 0) console.log(`     +${abAdded} por A/B tests detectados`);
if (clusterRepsAdded > 0) console.log(`     +${clusterRepsAdded} representantes de cluster`);

// ── 7. Outliers estadísticos ──
const meanCLR = avg(allCLRs);
const sdCLR = stdDev(allCLRs);
const outliers = posts
  .map(p => ({
    shortCode: p.shortCode,
    clr: clr(p.comments, p.likes),
    views: p.views,
    z_score: round2(zScore(clr(p.comments, p.likes), meanCLR, sdCLR)),
    caption_preview: (p.caption || "").slice(0, 60).replace(/\n/g, " "),
    has_cta: hasCommentCTA(p.caption),
  }))
  .filter(p => Math.abs(p.z_score) >= 2)
  .sort((a, b) => b.z_score - a.z_score);

// ──────────────────────────────────────────
// Build output
// ──────────────────────────────────────────

const mapData = {
  username,
  generated_at: new Date().toISOString(),
  months_analyzed: months,
  total_posts: posts.length,
  videos: videos.length,
  sidecars: sidecars.length,

  content_split: {
    organic: { count: organicPosts.length, pct: round2((organicPosts.length / posts.length) * 100) },
    sale: { count: salePosts.length, pct: round2((salePosts.length / posts.length) * 100) },
    ratio: `${round2(organicPosts.length / Math.max(1, salePosts.length))}:1`,
  },

  distribution,
  bimodal,
  clusters,
  ab_tests: abTests,
  outliers,

  recommendation: {
    ...threshold,
    ab_tests_added: abAdded,
    cluster_reps_added: clusterRepsAdded,
    final_count: finalIds.length,
    final_pct: round2((finalIds.length / posts.length) * 100) + "%",
    final_ids: finalIds,
  },
};

// Save JSON
const jsonPath = path.join(REF_DIR, `${username}_map.json`);
fs.writeFileSync(jsonPath, JSON.stringify(mapData, null, 2));

// ── Generate Markdown ──
let md = `# Mapa Estratégico: @${username}\n\n`;
md += `> Generado: ${new Date().toISOString().slice(0, 10)} | Últimos ${months} meses | ${posts.length} posts\n\n`;
md += `---\n\n`;

// Overview
md += `## 1. Vista general\n\n`;
md += `| Métrica | Valor |\n|---------|-------|\n`;
md += `| Posts totales | ${posts.length} |\n`;
md += `| Videos | ${videos.length} |\n`;
md += `| Sidecars/Carruseles | ${sidecars.length} |\n`;
md += `| Orgánico (sin CTA) | ${organicPosts.length} (${mapData.content_split.organic.pct}%) |\n`;
md += `| Venta (con CTA) | ${salePosts.length} (${mapData.content_split.sale.pct}%) |\n`;
md += `| Ratio orgánico:venta | ${mapData.content_split.ratio} |\n`;
md += `| Distribución | ${bimodal.bimodal ? "**BIMODAL** — " + bimodal.reason : "Unimodal — " + bimodal.reason} |\n\n`;

// Distribution
md += `## 2. Distribución de calidad (CLR)\n\n`;
md += `| Stat | CLR |\n|------|-----|\n`;
md += `| Media | ${distribution.mean}% |\n`;
md += `| Mediana | ${distribution.median}% |\n`;
md += `| Desv. estándar | ${distribution.stddev}% |\n`;
md += `| P25 | ${distribution.p25}% |\n`;
md += `| P75 | ${distribution.p75}% |\n`;
md += `| P90 | ${distribution.p90}% |\n`;
md += `| Mín | ${distribution.min}% |\n`;
md += `| Máx | ${distribution.max}% |\n\n`;

if (bimodal.bimodal) {
  md += `### Clusters de calidad\n`;
  md += `- **Alto CLR:** ${bimodal.high_cluster.count} posts, avg ${bimodal.high_cluster.avg}%, min ${bimodal.high_cluster.min}%\n`;
  md += `- **Bajo CLR:** ${bimodal.low_cluster.count} posts, avg ${bimodal.low_cluster.avg}%, max ${bimodal.low_cluster.max}%\n`;
  md += `- **Umbral de separación:** ${bimodal.threshold}%\n\n`;
}

// Clusters
md += `## 3. Clusters temáticos\n\n`;
md += `| Cluster | Keywords | Posts | Avg CLR | Avg Views | % con CTA | Top post |\n`;
md += `|---------|----------|------:|--------:|----------:|----------:|---------|\n`;
for (const c of clusters) {
  md += `| ${c.name} | ${c.keywords.slice(0, 3).join(", ")} | ${c.post_count} | ${c.avg_clr}% | ${c.avg_views.toLocaleString()} | ${c.cta_pct}% | ${c.top_post} |\n`;
}
md += `\n`;

// A/B tests
md += `## 4. A/B tests probables (${abTests.length} detectados)\n\n`;
if (abTests.length === 0) {
  md += `Ninguno detectado por caption. Confirmar con transcripciones después de descargar.\n\n`;
} else {
  for (let i = 0; i < abTests.length; i++) {
    const g = abTests[i];
    md += `### Test ${i + 1} (similitud: ${g.similarity}, delta views: ${g.views_delta || "N/A"})\n\n`;
    md += `| shortCode | Views | CLR | CTA | Caption |\n`;
    md += `|-----------|------:|----:|:---:|--------|\n`;
    for (const p of g.posts.sort((a, b) => b.views - a.views)) {
      md += `| ${p.shortCode} | ${p.views.toLocaleString()} | ${p.clr}% | ${p.has_cta ? "Sí" : "No"} | ${p.caption_preview} |\n`;
    }
    md += `\n`;
  }
}

// Outliers
md += `## 5. Outliers estadísticos (z-score ≥ |2|)\n\n`;
if (outliers.length === 0) {
  md += `Ningún outlier extremo detectado.\n\n`;
} else {
  md += `| shortCode | CLR | Views | Z-score | CTA | Caption |\n`;
  md += `|-----------|----:|------:|--------:|:---:|--------|\n`;
  for (const o of outliers.slice(0, 15)) {
    md += `| ${o.shortCode} | ${o.clr}% | ${o.views.toLocaleString()} | ${o.z_score > 0 ? "+" : ""}${o.z_score} | ${o.has_cta ? "Sí" : "No"} | ${o.caption_preview} |\n`;
  }
  md += `\n`;
}

// Recommendation
md += `## 6. Recomendación de descarga\n\n`;
md += `**Estrategia:** ${threshold.strategy === "bajar_todos" ? "Bajar todos (perfil chico)" : threshold.strategy === "bimodal_separado" ? "Umbral separado orgánico/venta (distribución bimodal)" : "Umbral dinámico (distribución unimodal)"}\n\n`;
md += `**Videos recomendados:** ${finalIds.length} de ${posts.length} (${mapData.recommendation.final_pct})\n\n`;
md += `**Razón:** ${threshold.reason}\n\n`;
if (abAdded > 0) md += `- +${abAdded} videos por A/B tests detectados\n`;
if (clusterRepsAdded > 0) md += `- +${clusterRepsAdded} representantes de clusters sin cobertura\n`;
md += `\n`;

md += `### Comando para descargar\n\n`;
md += `\`\`\`bash\nnode scripts/ig-download-videos.mjs @${username} --only-ids "${finalIds.slice(0, 10).join(",")},..." \n\`\`\`\n\n`;
md += `> IDs completos en ${username}_map.json → recommendation.final_ids\n\n`;

// Next steps
md += `## 7. Siguientes pasos\n\n`;
md += `1. Revisar este mapa y ajustar la selección si es necesario\n`;
md += `2. Descargar + transcribir los videos seleccionados\n`;
md += `3. Confirmar A/B tests con transcripciones (mismo audio = confirmado)\n`;
md += `4. Lectura atenta de los transcritos (5-7 min c/u)\n`;
md += `5. Seleccionar 5-9 para análisis Tier 1 completo\n`;
md += `6. Análisis profundo en tandas de 3\n`;
md += `7. Cross-profile validation (ig-search.mjs)\n`;
md += `8. Actualizar mapa de competencia\n`;

// Save markdown
const mdPath = path.join(REF_DIR, `${username}_map.md`);
fs.writeFileSync(mdPath, md);

console.log(`\n  ✅ Mapa generado:`);
console.log(`     ${jsonPath}`);
console.log(`     ${mdPath}`);
console.log(`\n  Siguiente paso: revisar el mapa y decidir qué bajar.`);
console.log(`  Los IDs recomendados están en ${username}_map.json → recommendation.final_ids\n`);
