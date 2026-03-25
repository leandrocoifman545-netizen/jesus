#!/usr/bin/env node
/**
 * Búsqueda cross-profile en TODAS las transcripciones y captions.
 *
 * El problema: tenemos 400+ transcripciones en 6 perfiles pero no podemos
 * buscar "todos los hooks sobre dinero" o "todos los cierres con urgencia".
 * Esto lo resuelve.
 *
 * Uso:
 *   node scripts/ig-search.mjs "dinero"                    → busca en transcripciones + captions
 *   node scripts/ig-search.mjs "dinero" --transcripts      → solo en transcripciones
 *   node scripts/ig-search.mjs "dinero" --captions         → solo en captions
 *   node scripts/ig-search.mjs "dinero" --hooks            → solo en primeras frases (hooks)
 *   node scripts/ig-search.mjs "dinero" --profile hormozi  → solo 1 perfil
 *   node scripts/ig-search.mjs "dinero" --min-clr 5        → solo posts con CLR >= 5%
 *   node scripts/ig-search.mjs "dinero" --min-views 50000  → solo posts con views >= 50K
 *   node scripts/ig-search.mjs --top-hooks 30              → top 30 hooks por CLR (sin buscar)
 *   node scripts/ig-search.mjs --top-hooks 30 --min-views 10000  → top hooks con mín views
 *
 * Output: tabla con resultados, métricas, y contexto.
 */

import fs from "fs";
import path from "path";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let query = "";
let onlyTranscripts = false;
let onlyCaptions = false;
let onlyHooks = false;
let profileFilter = "";
let minCLR = 0;
let minViews = 0;
let topHooksN = 0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--transcripts") onlyTranscripts = true;
  else if (args[i] === "--captions") onlyCaptions = true;
  else if (args[i] === "--hooks") onlyHooks = true;
  else if (args[i] === "--profile" && args[i + 1]) { profileFilter = args[++i]; }
  else if (args[i] === "--min-clr" && args[i + 1]) { minCLR = parseFloat(args[++i]); }
  else if (args[i] === "--min-views" && args[i + 1]) { minViews = parseInt(args[++i], 10); }
  else if (args[i] === "--top-hooks" && args[i + 1]) { topHooksN = parseInt(args[++i], 10); }
  else if (!args[i].startsWith("--")) { query = args[i]; }
}

if (!query && !topHooksN) {
  console.error("Uso: node scripts/ig-search.mjs \"término\" [--transcripts|--captions|--hooks] [--profile X] [--min-clr 5] [--min-views 50000]");
  console.error("      node scripts/ig-search.mjs --top-hooks 30 [--min-views 10000]");
  process.exit(1);
}

function clr(comments, likes) {
  if (!likes) return 0;
  return Math.round((comments / likes) * 10000) / 100;
}

// Load ALL profile data
const profiles = [];
const jsonFiles = fs.readdirSync(REF_DIR).filter(f =>
  f.endsWith(".json") &&
  !f.includes("_transcripts") &&
  !f.includes("_metrics") &&
  !f.includes("metrics-summary") &&
  !f.includes("ctas-activos")
);

for (const file of jsonFiles) {
  const username = file.replace(".json", "");
  if (profileFilter && username !== profileFilter) continue;

  const data = JSON.parse(fs.readFileSync(path.join(REF_DIR, file), "utf8"));
  const posts = data._raw_posts || data.posts || [];

  // Load transcripts if they exist
  const tFile = path.join(REF_DIR, `${username}_transcripts.json`);
  let transcripts = [];
  if (fs.existsSync(tFile)) {
    const tData = JSON.parse(fs.readFileSync(tFile, "utf8"));
    transcripts = tData.transcripts || [];
  }

  // Create transcript lookup
  const tMap = {};
  for (const t of transcripts) {
    tMap[t.shortCode] = t;
  }

  profiles.push({ username, posts, transcripts, tMap });
}

console.log(`Cargados: ${profiles.length} perfiles, ${profiles.reduce((s, p) => s + p.posts.length, 0)} posts, ${profiles.reduce((s, p) => s + p.transcripts.length, 0)} transcripciones\n`);

// ──────────────────────────────────────────
// Top hooks mode (no query needed)
// ──────────────────────────────────────────

if (topHooksN > 0) {
  const allHooks = [];

  for (const { username, transcripts } of profiles) {
    for (const t of transcripts) {
      if (!t.transcript || t.no_audio) continue;
      if (minViews > 0 && (t.views || 0) < minViews) continue;

      const text = t.transcript.trim();
      const firstMatch = text.match(/^[^.?!]{5,120}[.?!]?/);
      const hook = firstMatch ? firstMatch[0].trim() : text.slice(0, 100);
      const postCLR = clr(t.comments || 0, t.likes || 0);

      if (minCLR > 0 && postCLR < minCLR) continue;

      allHooks.push({
        profile: username,
        shortCode: t.shortCode,
        hook,
        clr: postCLR,
        views: t.views || 0,
        likes: t.likes || 0,
        comments: t.comments || 0,
        duration: Math.round(t.duration || 0),
      });
    }
  }

  allHooks.sort((a, b) => b.clr - a.clr);
  const top = allHooks.slice(0, topHooksN);

  console.log(`Top ${topHooksN} hooks por CLR${minViews ? ` (min ${minViews.toLocaleString()} views)` : ""}${minCLR ? ` (min ${minCLR}% CLR)` : ""}:\n`);
  console.log("  #  | CLR    | Views     | Profile       | Hook");
  console.log("  " + "-".repeat(100));

  for (let i = 0; i < top.length; i++) {
    const h = top[i];
    console.log(`  ${String(i + 1).padStart(2)} | ${String(h.clr + "%").padStart(6)} | ${String(h.views.toLocaleString()).padStart(9)} | @${h.profile.padEnd(13)} | ${h.hook.slice(0, 70)}`);
  }

  console.log(`\n  Total hooks analizados: ${allHooks.length} de ${profiles.reduce((s, p) => s + p.transcripts.length, 0)} transcripciones`);
  process.exit(0);
}

// ──────────────────────────────────────────
// Search mode
// ──────────────────────────────────────────

const queryLower = query.toLowerCase();
const queryRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
const results = [];

for (const { username, posts, tMap } of profiles) {
  for (const post of posts) {
    const code = post.shortCode;
    const caption = post.caption || "";
    const transcript = tMap[code]?.transcript || "";
    const postCLR = clr(post.comments || 0, post.likes || 0);
    const views = post.views || 0;

    // Apply filters
    if (minCLR > 0 && postCLR < minCLR) continue;
    if (minViews > 0 && views < minViews) continue;

    let matched = false;
    let matchSource = [];
    let context = "";

    // Search in captions
    if (!onlyTranscripts && !onlyHooks) {
      if (caption.toLowerCase().includes(queryLower)) {
        matched = true;
        matchSource.push("caption");
        // Extract context around match
        const idx = caption.toLowerCase().indexOf(queryLower);
        const start = Math.max(0, idx - 40);
        const end = Math.min(caption.length, idx + query.length + 40);
        context = (start > 0 ? "..." : "") + caption.slice(start, end).replace(/\n/g, " ") + (end < caption.length ? "..." : "");
      }
    }

    // Search in transcripts
    if (!onlyCaptions && transcript && !onlyHooks) {
      if (transcript.toLowerCase().includes(queryLower)) {
        matched = true;
        matchSource.push("transcript");
        if (!context) {
          const idx = transcript.toLowerCase().indexOf(queryLower);
          const start = Math.max(0, idx - 50);
          const end = Math.min(transcript.length, idx + query.length + 50);
          context = (start > 0 ? "..." : "") + transcript.slice(start, end).replace(/\n/g, " ") + (end < transcript.length ? "..." : "");
        }
      }
    }

    // Search only in hooks (first sentence)
    if (onlyHooks && transcript) {
      const firstMatch = transcript.trim().match(/^[^.?!]{5,120}[.?!]?/);
      const hook = firstMatch ? firstMatch[0] : transcript.slice(0, 100);
      if (hook.toLowerCase().includes(queryLower)) {
        matched = true;
        matchSource.push("hook");
        context = hook;
      }
    }

    if (matched) {
      results.push({
        profile: username,
        shortCode: code,
        source: matchSource.join("+"),
        clr: postCLR,
        views,
        likes: post.likes || 0,
        comments: post.comments || 0,
        duration: Math.round(post.videoDuration || post.duration || 0),
        context,
        url: post.url || `https://www.instagram.com/p/${code}/`,
      });
    }
  }
}

// Sort by CLR
results.sort((a, b) => b.clr - a.clr);

// Print results
const scope = onlyTranscripts ? "transcripciones" : onlyCaptions ? "captions" : onlyHooks ? "hooks" : "todo";
console.log(`"${query}" — ${results.length} resultados en ${scope}${minCLR ? ` (CLR >= ${minCLR}%)` : ""}${minViews ? ` (views >= ${minViews.toLocaleString()})` : ""}\n`);

if (results.length === 0) {
  console.log("  Sin resultados.");
  process.exit(0);
}

console.log("  #  | CLR    | Views     | Source     | Profile       | Contexto");
console.log("  " + "-".repeat(110));

for (let i = 0; i < Math.min(50, results.length); i++) {
  const r = results[i];
  console.log(`  ${String(i + 1).padStart(2)} | ${String(r.clr + "%").padStart(6)} | ${String(r.views.toLocaleString()).padStart(9)} | ${r.source.padEnd(10)} | @${r.profile.padEnd(13)} | ${r.context.slice(0, 65)}`);
}

if (results.length > 50) {
  console.log(`\n  ... y ${results.length - 50} resultados más.`);
}

// Stats
const avgCLR = results.reduce((s, r) => s + r.clr, 0) / results.length;
const avgViews = results.filter(r => r.views > 0).reduce((s, r) => s + r.views, 0) / results.filter(r => r.views > 0).length;
console.log(`\n  Stats: ${results.length} matches | Avg CLR: ${avgCLR.toFixed(2)}% | Avg Views: ${Math.round(avgViews).toLocaleString()}`);

// Profile breakdown
const byProfile = {};
for (const r of results) {
  if (!byProfile[r.profile]) byProfile[r.profile] = 0;
  byProfile[r.profile]++;
}
console.log(`  Por perfil: ${Object.entries(byProfile).map(([p, c]) => `@${p}: ${c}`).join(", ")}`);
