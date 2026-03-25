#!/usr/bin/env node
/**
 * Pipeline completo de análisis de Instagram en UN comando.
 *
 * Orquesta: scrape → descarga → transcripción (con retry) → análisis de métricas
 *
 * Uso:
 *   node scripts/ig-pipeline.mjs @username                    → pipeline completo
 *   node scripts/ig-pipeline.mjs @username --limit 50         → máx 50 posts
 *   node scripts/ig-pipeline.mjs @username --skip-download    → solo scrape + analyze
 *   node scripts/ig-pipeline.mjs @username --skip-transcribe  → scrape + download, sin transcribir
 *   node scripts/ig-pipeline.mjs @username --months 6         → filtrar últimos 6 meses en análisis
 *   node scripts/ig-pipeline.mjs @username --top-performers   → solo descargar top CLR+views
 *
 * Fases:
 *   1. Scrape (Apify)        → {username}.json
 *   2. Download (direct/yt-dlp) → {username}_videos/
 *   3. Transcribe (Groq)     → {username}_transcripts.json (con retry automático)
 *   4. Analyze               → {username}_metrics.json + {username}_tables.md
 */

import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let username = "";
let limit = 0;
let skipDownload = false;
let skipTranscribe = false;
let topPerformers = false;
let months = 12;
let lang = null; // null = auto-detect, "es"/"en" = force

const passthrough = []; // args to pass to sub-scripts

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit" && args[i + 1]) {
    limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--skip-download") {
    skipDownload = true;
  } else if (args[i] === "--skip-transcribe") {
    skipTranscribe = true;
  } else if (args[i] === "--top-performers") {
    topPerformers = true;
  } else if (args[i] === "--months" && args[i + 1]) {
    months = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--lang" && args[i + 1]) {
    lang = args[i + 1];
    i++;
  } else if (args[i].startsWith("@") || (!args[i].startsWith("--") && !username)) {
    username = args[i].replace(/^@/, "");
  }
}

if (!username) {
  console.error("Uso: node scripts/ig-pipeline.mjs @username [--limit 50] [--skip-download] [--skip-transcribe] [--months 6] [--lang es]");
  process.exit(1);
}

function runScript(scriptName, scriptArgs = [], opts = {}) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  const fullArgs = [scriptPath, ...scriptArgs];
  const label = opts.label || scriptName;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  FASE: ${label}`);
  console.log(`  Comando: node ${scriptName} ${scriptArgs.join(" ")}`);
  console.log(`${"═".repeat(60)}\n`);

  try {
    execSync(`node ${fullArgs.join(" ")}`, {
      cwd: process.cwd(),
      stdio: "inherit",
      timeout: opts.timeout || 600000, // 10 min default
      env: process.env,
    });
    return true;
  } catch (err) {
    if (opts.allowFail) {
      console.error(`\n⚠️  ${label} falló pero continuamos: ${err.message}\n`);
      return false;
    }
    throw err;
  }
}

function fileExists(filename) {
  return fs.existsSync(path.join(REF_DIR, filename));
}

function fileAge(filename) {
  const filepath = path.join(REF_DIR, filename);
  if (!fs.existsSync(filepath)) return Infinity;
  const stat = fs.statSync(filepath);
  return (Date.now() - stat.mtimeMs) / (1000 * 60 * 60); // hours
}

// ──────────────────────────────────────────
// Pipeline
// ──────────────────────────────────────────

const startTime = Date.now();
console.log(`\n🔬 Pipeline completo para @${username}`);
console.log(`   Limit: ${limit || "todos"} posts | Months: ${months} | Top performers: ${topPerformers}`);
console.log(`   Skip download: ${skipDownload} | Skip transcribe: ${skipTranscribe} | Lang: ${lang || "auto-detect"}\n`);

// Phase 1: Scrape
const scrapeFile = `${username}.json`;
const scrapeAge = fileAge(scrapeFile);

if (scrapeAge < 24) {
  console.log(`\n⏭️  Scrape reciente (${Math.round(scrapeAge)}h ago). Saltando.\n`);
} else {
  const scrapeArgs = [`@${username}`];
  if (limit > 0) scrapeArgs.push("--limit", String(limit));

  runScript("scrape-ig.mjs", scrapeArgs, {
    label: "1/4 — SCRAPE (Apify)",
    timeout: 300000, // 5 min
  });
}

// Verify scrape worked
if (!fileExists(scrapeFile)) {
  console.error(`\n❌ Scrape falló — no existe ${scrapeFile}`);
  process.exit(1);
}

// Phase 2: Download videos
if (skipDownload) {
  console.log(`\n⏭️  Download saltado (--skip-download)\n`);
} else {
  const dlArgs = [`@${username}`];
  if (topPerformers) dlArgs.push("--top-performers");
  if (skipTranscribe) dlArgs.push("--skip-transcribe");
  if (lang) dlArgs.push("--lang", lang);

  runScript("ig-download-videos.mjs", dlArgs, {
    label: "2/4 — DOWNLOAD + TRANSCRIBE (Groq)",
    timeout: 600000, // 10 min
    allowFail: true,
  });
}

// Phase 3: Retry remaining transcriptions
if (!skipDownload && !skipTranscribe) {
  const transcriptsFile = `${username}_transcripts.json`;
  const videoDir = path.join(REF_DIR, `${username}_videos`);

  if (fs.existsSync(videoDir)) {
    const videoCount = fs.readdirSync(videoDir).filter(f => f.endsWith(".mp4")).length;
    let transcriptCount = 0;

    if (fileExists(transcriptsFile)) {
      const tData = JSON.parse(fs.readFileSync(path.join(REF_DIR, transcriptsFile), "utf8"));
      transcriptCount = (tData.transcripts || []).length;
    }

    const missing = videoCount - transcriptCount;
    if (missing > 3) {
      console.log(`\n📝 ${missing} transcripciones pendientes. Reintentando...`);

      // Retry up to 3 times
      for (let retry = 0; retry < 3; retry++) {
        const before = transcriptCount;
        runScript("ig-transcribe-remaining.mjs", [`@${username}`, ...(lang ? ["--lang", lang] : [])], {
          label: `3/4 — RETRY TRANSCRIBE (intento ${retry + 1}/3)`,
          timeout: 600000,
          allowFail: true,
        });

        // Check progress
        if (fileExists(transcriptsFile)) {
          const tData = JSON.parse(fs.readFileSync(path.join(REF_DIR, transcriptsFile), "utf8"));
          transcriptCount = (tData.transcripts || []).length;
        }

        const newMissing = videoCount - transcriptCount;
        if (newMissing <= 3) {
          console.log(`\n✅ Transcripciones completas (${transcriptCount}/${videoCount})`);
          break;
        }

        if (transcriptCount === before) {
          console.log(`\n⚠️  No hubo progreso en retry ${retry + 1}. Parando retries.`);
          break;
        }

        console.log(`\n📝 Progreso: ${transcriptCount}/${videoCount}. Aún faltan ${newMissing}.`);
      }
    } else {
      console.log(`\n✅ Transcripciones al día (${transcriptCount}/${videoCount}, faltan ${missing})`);
    }
  }
}

// Phase 4: Analyze metrics
runScript("ig-analyze.mjs", [`@${username}`, "--months", String(months)], {
  label: "4/7 — ANALYZE (métricas + tablas)",
  timeout: 60000,
});

// Phase 5: Pattern analysis
runScript("ig-patterns.mjs", [`@${username}`], {
  label: "5/7 — PATTERNS (apertura×cuerpo×cierre)",
  timeout: 60000,
  allowFail: true,
});

// Phase 6: Cross patterns × ADP generations
runScript("ig-cross-generations.mjs", [], {
  label: "6/7 — CROSS PATTERNS × GENERACIONES ADP",
  timeout: 30000,
  allowFail: true,
});

// Phase 7: Update INDEX
runScript("ig-update-index.mjs", [], {
  label: "7/7 — UPDATE INDEX",
  timeout: 30000,
  allowFail: true,
});

// ──────────────────────────────────────────
// Summary
// ──────────────────────────────────────────

const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
console.log(`\n${"═".repeat(60)}`);
console.log(`  ✅ PIPELINE COMPLETO para @${username} (${elapsed} min)`);
console.log(`${"═".repeat(60)}`);
console.log(`\n  Archivos generados:`);

const expectedFiles = [
  `${username}.json`,
  `${username}_transcripts.json`,
  `${username}_metrics.json`,
  `${username}_tables.md`,
  `${username}_patterns.json`,
];

for (const f of expectedFiles) {
  const fp = path.join(REF_DIR, f);
  if (fs.existsSync(fp)) {
    const size = (fs.statSync(fp).size / 1024).toFixed(0);
    console.log(`  ✅ ${f} (${size} KB)`);
  } else {
    console.log(`  ❌ ${f} (no generado)`);
  }
}

const videoDir = path.join(REF_DIR, `${username}_videos`);
if (fs.existsSync(videoDir)) {
  const count = fs.readdirSync(videoDir).filter(f => f.endsWith(".mp4")).length;
  console.log(`  ✅ ${username}_videos/ (${count} videos)`);
}

console.log(`\n  Siguiente paso: Claude analiza ${username}_metrics.json + ${username}_tables.md`);
console.log(`  (Ya no necesita leer los JSONs crudos — las tablas vienen hechas)\n`);
