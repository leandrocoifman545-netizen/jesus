#!/usr/bin/env node
/**
 * Pre-flight check for Instagram profile analysis.
 * Runs BEFORE starting any analysis — verifies data exists, establishes scope,
 * lists files that MUST be read, and sets minimum coverage requirements.
 *
 * Usage: node scripts/preflight-analisis-ig.mjs @username
 *
 * Returns: JSON + human-readable summary with:
 *   - Available data files and their sizes
 *   - Previous analysis files that MUST be read before writing anything
 *   - Minimum scope requirements (how many videos to cover)
 *   - Missing data that needs to be generated first
 */
import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join } from "path";

const REF_DIR = join(import.meta.dirname, "..", ".data", "ig-references");

// Parse args
const username = (process.argv[2] || "").replace(/^@/, "");
if (!username) {
  console.error("Uso: node scripts/preflight-analisis-ig.mjs @username");
  process.exit(1);
}

// ──────────────────────────────────────────
// 1. Check data files
// ──────────────────────────────────────────

const files = {
  scrape: { path: `${username}.json`, label: "Scrape (posts crudos)", required: true },
  metrics: { path: `${username}_metrics.json`, label: "Métricas calculadas", required: true },
  tables: { path: `${username}_tables.md`, label: "Tablas pre-calculadas", required: true },
  transcripts: { path: `${username}_transcripts.json`, label: "Transcripciones", required: false },
  patterns: { path: `${username}_patterns.json`, label: "Patrones apertura×cuerpo×cierre", required: false },
  autoPatterns: { path: `${username}_auto-patterns.md`, label: "Micro-patrones automáticos", required: false },
  autoPatternsJson: { path: `${username}_auto-patterns.json`, label: "Micro-patrones (JSON)", required: false },
  map: { path: `${username}_map.json`, label: "Mapa estratégico", required: false },
  mapMd: { path: `${username}_map.md`, label: "Mapa estratégico (MD)", required: false },
  analisis: { path: `${username}_analisis.md`, label: "Análisis existente", required: false },
  cruzado: { path: `${username}_analisis-cruzado.md`, label: "Análisis cruzado × ADP", required: false },
  oportunidades: { path: `${username}_oportunidades.md`, label: "Oportunidades detectadas", required: false },
  filtro: { path: `${username}_filtro-aplicabilidad.md`, label: "Filtro de aplicabilidad", required: false },
  visual: { path: `${username}_visual-analysis.md`, label: "Análisis visual", required: false },
  microPatrones: { path: `${username}_micro-patrones.md`, label: "Micro-patrones cualitativos", required: false },
  captionsCarruseles: { path: `${username}_captions-carruseles.md`, label: "Análisis de captions/carruseles", required: false },
};

const available = {};
const missing = [];
const mustRead = []; // Files that MUST be read before writing analysis

for (const [key, info] of Object.entries(files)) {
  const fullPath = join(REF_DIR, info.path);
  if (existsSync(fullPath)) {
    const stat = statSync(fullPath);
    const sizeKB = Math.round(stat.size / 1024);
    available[key] = { path: info.path, label: info.label, sizeKB };

    // Mark files that MUST be read before analysis
    if (["autoPatterns", "cruzado", "oportunidades", "analisis", "mapMd", "filtro", "microPatrones"].includes(key)) {
      mustRead.push({ key, path: info.path, label: info.label, sizeKB });
    }
  } else if (info.required) {
    missing.push({ path: info.path, label: info.label });
  }
}

// ──────────────────────────────────────────
// 2. Count transcriptions and posts
// ──────────────────────────────────────────

let totalPosts = 0;
let totalVideos = 0;
let totalTranscripts = 0;

const scrapePath = join(REF_DIR, `${username}.json`);
if (existsSync(scrapePath)) {
  try {
    const data = JSON.parse(readFileSync(scrapePath, "utf8"));
    const posts = data._raw_posts || [];
    totalPosts = posts.length;
    totalVideos = posts.filter(p => (p.type || "").toLowerCase() === "video").length;
  } catch { /* ignore */ }
}

const transcriptsPath = join(REF_DIR, `${username}_transcripts.json`);
if (existsSync(transcriptsPath)) {
  try {
    const data = JSON.parse(readFileSync(transcriptsPath, "utf8"));
    totalTranscripts = (data.transcripts || []).filter(t => t.transcript && !t.no_audio).length;
  } catch { /* ignore */ }
}

// ──────────────────────────────────────────
// 3. Count downloaded videos
// ──────────────────────────────────────────

let downloadedVideos = 0;
const videoDir = join(REF_DIR, `${username}_videos`);
if (existsSync(videoDir)) {
  downloadedVideos = readdirSync(videoDir).filter(f => f.endsWith(".mp4")).length;
}

// ──────────────────────────────────────────
// 4. Calculate minimum scope
// ──────────────────────────────────────────

const minTopCLR = Math.min(15, Math.max(5, Math.ceil(totalTranscripts * 0.1)));
const minTopViews = Math.min(15, Math.max(5, Math.ceil(totalTranscripts * 0.1)));
const minFrameExtraction = Math.min(6, Math.max(3, Math.ceil(totalTranscripts * 0.03)));
const minAnalysisLines = totalPosts >= 100 ? 500 : totalPosts >= 50 ? 300 : 150;

// ──────────────────────────────────────────
// 5. Check what's missing for a complete analysis
// ──────────────────────────────────────────

const gaps = [];

if (!available.map) {
  gaps.push({
    what: "Mapa estratégico no generado",
    fix: `node scripts/ig-map.mjs @${username}`,
    priority: "ALTA",
  });
}

if (totalTranscripts === 0 && totalVideos > 0) {
  gaps.push({
    what: "Sin transcripciones — no se puede analizar contenido",
    fix: `node scripts/ig-pipeline.mjs @${username} --only-ids-file .data/ig-references/${username}_map.json`,
    priority: "BLOQUEANTE",
  });
}

if (!available.autoPatterns && totalTranscripts > 20) {
  gaps.push({
    what: "Auto-patterns no generados (hay suficientes transcripciones)",
    fix: `node scripts/ig-micro-patterns.mjs ${username}`,
    priority: "ALTA",
  });
}

if (!available.patterns && totalTranscripts > 10) {
  gaps.push({
    what: "Patterns apertura×cuerpo×cierre no generados",
    fix: `node scripts/ig-patterns.mjs @${username}`,
    priority: "MEDIA",
  });
}

if (downloadedVideos > 0) {
  // Check if frames exist for top videos
  const framesDir = join(REF_DIR, `${username}_frames`);
  if (!existsSync(framesDir) || readdirSync(framesDir).length === 0) {
    gaps.push({
      what: `${downloadedVideos} videos descargados pero sin frames extraídos`,
      fix: "Extraer frames con ffmpeg de top 3 CLR + bottom 3 para Pasada 6 (símbolos) y Lente A",
      priority: "ALTA",
    });
  }
}

// ──────────────────────────────────────────
// 6. Output
// ──────────────────────────────────────────

const result = {
  username: `@${username}`,
  data_available: {
    posts: totalPosts,
    videos: totalVideos,
    transcripts: totalTranscripts,
    downloaded_videos: downloadedVideos,
    files: Object.fromEntries(Object.entries(available).map(([k, v]) => [k, `${v.path} (${v.sizeKB}KB)`])),
  },
  must_read_before_analysis: mustRead,
  minimum_scope: {
    top_clr_with_full_transcript: minTopCLR,
    top_views_with_full_transcript: minTopViews,
    frames_to_extract: `Top ${Math.ceil(minFrameExtraction/2)} CLR + Bottom ${Math.floor(minFrameExtraction/2)} (para Lente A)`,
    minimum_analysis_lines: minAnalysisLines,
    cross_profile_validation: "OBLIGATORIO — usar ig-search.mjs para cada patrón nuevo",
  },
  gaps,
  missing_required: missing,
};

// Human-readable output
console.log(`\n${"═".repeat(60)}`);
console.log(`  PREFLIGHT ANÁLISIS IG: @${username}`);
console.log(`${"═".repeat(60)}\n`);

console.log(`  📊 Data disponible:`);
console.log(`     Posts: ${totalPosts} | Videos: ${totalVideos} | Transcripciones: ${totalTranscripts} | Descargados: ${downloadedVideos}`);
console.log();

if (missing.length > 0) {
  console.log(`  ❌ ARCHIVOS REQUERIDOS FALTANTES:`);
  for (const m of missing) {
    console.log(`     - ${m.label}: ${m.path}`);
  }
  console.log();
}

if (mustRead.length > 0) {
  console.log(`  📖 LEER OBLIGATORIO antes de escribir análisis:`);
  for (const f of mustRead) {
    console.log(`     - ${f.label}: ${f.path} (${f.sizeKB}KB)`);
  }
  console.log();
}

if (gaps.length > 0) {
  console.log(`  ⚠️  GAPS a resolver:`);
  for (const g of gaps) {
    console.log(`     [${g.priority}] ${g.what}`);
    console.log(`     Fix: ${g.fix}`);
  }
  console.log();
}

console.log(`  📏 SCOPE MÍNIMO del análisis:`);
console.log(`     Sección 6 (top CLR): mínimo ${minTopCLR} videos con transcripción COMPLETA`);
console.log(`     Sección 7 (top views): mínimo ${minTopViews} videos con transcripción COMPLETA`);
console.log(`     Frames: extraer de top ${Math.ceil(minFrameExtraction/2)} CLR + bottom ${Math.floor(minFrameExtraction/2)}`);
console.log(`     Largo mínimo: ${minAnalysisLines} líneas`);
console.log(`     Cross-profile: OBLIGATORIO con ig-search.mjs`);
console.log();

console.log(`${"═".repeat(60)}\n`);

// JSON output for scripts
console.log(JSON.stringify(result, null, 2));
