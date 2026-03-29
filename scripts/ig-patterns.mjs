#!/usr/bin/env node
/**
 * MÁQUINA DE ANÁLISIS DE PATRONES — ig-patterns.mjs
 *
 * No cuenta cosas. ENTIENDE por qué los videos funcionan.
 *
 * Disecciona cada video transcrito en 3 zonas usando timestamps de Whisper:
 *   APERTURA (0-8s)    → Hook real (no la primera frase, las primeras 3)
 *   CUERPO   (8s-últimos 15s) → Estructura narrativa, beats, dolor, mecanismo
 *   CIERRE   (últimos 15s)    → Buildup al CTA, estructura de cierre
 *
 * Después cruza estructura × performance para encontrar:
 *   - ¿Qué tipo de apertura genera más CLR?
 *   - ¿Qué tipo de cierre genera más comments?
 *   - ¿Qué estructura de cuerpo genera más views?
 *   - ¿Qué combinaciones apertura×cierre son ganadoras?
 *
 * Uso:
 *   node scripts/ig-patterns.mjs @username              → analiza 1 perfil
 *   node scripts/ig-patterns.mjs --all                  → todos los perfiles
 *   node scripts/ig-patterns.mjs --all --export         → genera pattern-library.md
 *
 * Output:
 *   .data/ig-references/{username}_patterns.json  — patrones estructurales
 *   .data/ig-references/pattern-library.json      — biblioteca cross-profile (con --all)
 *   .data/ig-references/pattern-library.md        — documento legible (con --export)
 */

import fs from "fs";
import path from "path";
import { classifyOpening, classifyBody, classifyClosing, classifyCaption } from "./lib/classifiers.mjs";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

// Parse args
const args = process.argv.slice(2);
let allMode = false;
let exportMode = false;
const usernames = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--all") allMode = true;
  else if (args[i] === "--export") exportMode = true;
  else usernames.push(args[i].replace(/^@/, ""));
}

if (allMode) {
  const files = fs.readdirSync(REF_DIR).filter(f =>
    f.endsWith("_transcripts.json") && !f.includes("metrics")
  );
  for (const f of files) {
    const u = f.replace("_transcripts.json", "");
    if (!usernames.includes(u)) usernames.push(u);
  }
}

if (usernames.length === 0) {
  console.error("Uso: node scripts/ig-patterns.mjs @username | --all [--export]");
  process.exit(1);
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function clr(comments, likes) {
  if (!likes || likes <= 0 || !comments || comments < 0) return 0;
  return Math.round((comments / likes) * 10000) / 100;
}

function round2(n) { return Math.round(n * 100) / 100; }
function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }

// Temporal decay: recent posts get more weight
// Half-life = 90 days. A post from 90 days ago has 50% weight.
function decayWeight(timestamp) {
  if (!timestamp) return 1;
  const HALF_LIFE_MS = 90 * 24 * 60 * 60 * 1000;
  const age = Date.now() - new Date(timestamp).getTime();
  if (age <= 0) return 1;
  return Math.pow(0.5, age / HALF_LIFE_MS);
}

// Weighted average using decay
function weightedAvg(values, weights) {
  if (!values.length) return 0;
  let sumW = 0, sumVW = 0;
  for (let i = 0; i < values.length; i++) {
    const w = weights[i] || 1;
    sumW += w;
    sumVW += values[i] * w;
  }
  return sumW > 0 ? sumVW / sumW : 0;
}
function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ──────────────────────────────────────────
// Zone extraction using Whisper segments
// ──────────────────────────────────────────

const OPENING_SECONDS = 8;
const CLOSING_SECONDS = 15;

function extractZones(transcript) {
  const segments = transcript.segments || [];
  const duration = transcript.duration || 0;
  const text = transcript.transcript || "";

  if (segments.length === 0 || !text || duration === 0) {
    return null;
  }

  const closingStart = Math.max(OPENING_SECONDS + 1, duration - CLOSING_SECONDS);

  const opening = { segments: [], text: "", duration: 0 };
  const body = { segments: [], text: "", duration: 0 };
  const closing = { segments: [], text: "", duration: 0 };

  for (const seg of segments) {
    const segText = (seg.text || "").trim();
    if (!segText) continue;

    if (seg.start < OPENING_SECONDS) {
      opening.segments.push(seg);
      opening.text += " " + segText;
    } else if (seg.start >= closingStart) {
      closing.segments.push(seg);
      closing.text += " " + segText;
    } else {
      body.segments.push(seg);
      body.text += " " + segText;
    }
  }

  opening.text = opening.text.trim();
  body.text = body.text.trim();
  closing.text = closing.text.trim();

  opening.duration = opening.segments.length ?
    Math.max(...opening.segments.map(s => s.end)) - Math.min(...opening.segments.map(s => s.start)) : 0;
  closing.duration = closing.segments.length ?
    Math.max(...closing.segments.map(s => s.end)) - Math.min(...closing.segments.map(s => s.start)) : 0;
  body.duration = duration - opening.duration - closing.duration;

  return { opening, body, closing, total_duration: duration };
}

// ──────────────────────────────────────────
// Beat mapping — body divided into 4 temporal quarters
// ──────────────────────────────────────────

function mapBodyBeats(bodyZone) {
  const segments = bodyZone.segments;
  if (segments.length < 4) return null;

  const bodyStart = Math.min(...segments.map(s => s.start));
  const bodyEnd = Math.max(...segments.map(s => s.end));
  const bodyDuration = bodyEnd - bodyStart;
  if (bodyDuration < 10) return null; // too short to meaningfully split

  const quarterDur = bodyDuration / 4;
  const quarters = [
    { label: "Q1_setup", start: bodyStart, end: bodyStart + quarterDur, segments: [], text: "" },
    { label: "Q2_develop", start: bodyStart + quarterDur, end: bodyStart + 2 * quarterDur, segments: [], text: "" },
    { label: "Q3_escalate", start: bodyStart + 2 * quarterDur, end: bodyStart + 3 * quarterDur, segments: [], text: "" },
    { label: "Q4_resolve", start: bodyStart + 3 * quarterDur, end: bodyEnd + 0.01, segments: [], text: "" },
  ];

  for (const seg of segments) {
    const segMid = (seg.start + seg.end) / 2;
    for (const q of quarters) {
      if (segMid >= q.start && segMid < q.end) {
        q.segments.push(seg);
        q.text += " " + (seg.text || "").trim();
        break;
      }
    }
  }

  return quarters.map(q => ({
    label: q.label,
    text: q.text.trim(),
    patterns: classifyBody(q.text.trim()),
    word_count: q.text.trim().split(/\s+/).filter(w => w).length,
  }));
}

// ──────────────────────────────────────────
// CTA buildup analysis
// ──────────────────────────────────────────

function analyzeCTABuildup(closing) {
  const segments = closing.segments;
  if (segments.length < 2) return null;

  // Find where CTA keywords appear
  let ctaSegIdx = -1;
  for (let i = 0; i < segments.length; i++) {
    const t = (segments[i].text || "").toLowerCase();
    if (/(comenta|comentá|escribí|escribe|link|bio|dm|mensaje)/i.test(t)) {
      ctaSegIdx = i;
      break;
    }
  }

  if (ctaSegIdx < 0) return null;

  // Everything before CTA keyword = buildup
  const buildup = segments.slice(0, ctaSegIdx);
  const ctaAndAfter = segments.slice(ctaSegIdx);

  const buildupText = buildup.map(s => (s.text || "").trim()).join(" ");
  const ctaText = ctaAndAfter.map(s => (s.text || "").trim()).join(" ");

  // Classify buildup type
  const lower = buildupText.toLowerCase();
  let buildupType = "directo"; // default

  if (/(si querés|si quieres|para\s+que\s+te|te\s+voy\s+a|te\s+mando|te\s+envío)/i.test(lower)) {
    buildupType = "promesa_valor";
  }
  if (/(la\s+verdad|honestamente|te\s+soy\s+sincero|la\s+realidad)/i.test(lower)) {
    buildupType = "transparencia";
  }
  if (/(pero\s+ojo|cuidado|advertencia|lo\s+que\s+pasa|el\s+problema)/i.test(lower)) {
    buildupType = "tension_antes_cta";
  }
  if (/(fácil|simple|rápido|en\s+\d+\s+minuto|solo\s+tenés|solo\s+tienes)/i.test(lower)) {
    buildupType = "simplificacion";
  }
  if (/(no\s+te\s+cob|gratis|free|regalo|sin\s+costo)/i.test(lower)) {
    buildupType = "remocion_riesgo";
  }

  return {
    buildup_text: buildupText,
    buildup_type: buildupType,
    buildup_segments: buildup.length,
    buildup_duration: buildup.length ? round2(buildup[buildup.length - 1].end - buildup[0].start) : 0,
    cta_text: ctaText,
    cta_segments: ctaAndAfter.length,
  };
}

// ──────────────────────────────────────────
// Analyze one profile
// ──────────────────────────────────────────

function analyzeProfile(username) {
  console.log(`\nAnalizando patrones de @${username}...`);

  const tPath = path.join(REF_DIR, `${username}_transcripts.json`);
  if (!fs.existsSync(tPath)) {
    console.log(`  Sin transcripciones. Saltando.`);
    return null;
  }

  const tData = JSON.parse(fs.readFileSync(tPath, "utf8"));
  const transcripts = (tData.transcripts || []).filter(t => t.transcript && !t.no_audio && (t.segments || []).length > 0);

  // Load timestamps from raw scrape data
  const scrapeFile = path.join(REF_DIR, `${username}.json`);
  const timestampMap = {};
  if (fs.existsSync(scrapeFile)) {
    try {
      const scrapeData = JSON.parse(fs.readFileSync(scrapeFile, "utf8"));
      const rawPosts = scrapeData._raw_posts || [];
      for (const p of rawPosts) {
        if (p.shortCode && p.timestamp) {
          timestampMap[p.shortCode] = p.timestamp;
        }
      }
    } catch (e) { /* ignore */ }
  }

  console.log(`  ${transcripts.length} transcripciones con segments (${Object.keys(timestampMap).length} con timestamp)`);

  const analyzed = [];

  for (const t of transcripts) {
    const zones = extractZones(t);
    if (!zones) continue;

    const postCLR = clr(t.comments || 0, t.likes || 0);
    const openingPatterns = classifyOpening(zones.opening.text);
    const bodyPatterns = classifyBody(zones.body.text);
    const closingPatterns = classifyClosing(zones.closing.text, t.caption);
    const ctaBuildup = analyzeCTABuildup(zones.closing);
    const beatMap = mapBodyBeats(zones.body);

    // Word density (words per second)
    const totalWords = (t.transcript || "").split(/\s+/).length;
    const wps = zones.total_duration > 0 ? round2(totalWords / zones.total_duration) : 0;

    const ts = timestampMap[t.shortCode] || null;
    const dw = decayWeight(ts);

    analyzed.push({
      shortCode: t.shortCode,
      url: t.url,
      timestamp: ts,
      decay_weight: round2(dw),
      views: t.views || 0,
      likes: t.likes || 0,
      comments: t.comments || 0,
      clr: postCLR,
      duration: round2(zones.total_duration),
      words_per_second: wps,

      opening: {
        text: zones.opening.text,
        duration: round2(zones.opening.duration),
        segments: zones.opening.segments.length,
        patterns: openingPatterns,
      },
      body: {
        text_preview: zones.body.text.slice(0, 200),
        duration: round2(zones.body.duration),
        segments: zones.body.segments.length,
        patterns: bodyPatterns,
        word_count: zones.body.text.split(/\s+/).length,
        beat_map: beatMap,
      },
      closing: {
        text: zones.closing.text,
        duration: round2(zones.closing.duration),
        segments: zones.closing.segments.length,
        patterns: closingPatterns,
        cta_buildup: ctaBuildup,
      },

      caption_preview: (t.caption || "").slice(0, 100),
      caption_patterns: classifyCaption(t.caption),
    });
  }

  analyzed.sort((a, b) => b.clr - a.clr);

  // ── Aggregate pattern stats ──

  // Opening patterns × performance
  const openingStats = {};
  for (const v of analyzed) {
    for (const p of v.opening.patterns) {
      if (!openingStats[p]) openingStats[p] = { count: 0, clrs: [], weights: [], views: [], examples: [] };
      openingStats[p].count++;
      openingStats[p].clrs.push(v.clr);
      openingStats[p].weights.push(v.decay_weight);
      openingStats[p].views.push(v.views);
      if (openingStats[p].examples.length < 3) {
        openingStats[p].examples.push({ text: v.opening.text.slice(0, 120), clr: v.clr, views: v.views, shortCode: v.shortCode });
      }
    }
  }

  // Body patterns × performance
  const bodyStats = {};
  for (const v of analyzed) {
    for (const p of v.body.patterns) {
      if (!bodyStats[p]) bodyStats[p] = { count: 0, clrs: [], weights: [], views: [] };
      bodyStats[p].count++;
      bodyStats[p].clrs.push(v.clr);
      bodyStats[p].weights.push(v.decay_weight);
      bodyStats[p].views.push(v.views);
    }
  }

  // Closing patterns × performance
  const closingStats = {};
  for (const v of analyzed) {
    for (const p of v.closing.patterns) {
      if (!closingStats[p]) closingStats[p] = { count: 0, clrs: [], weights: [], views: [], examples: [] };
      closingStats[p].count++;
      closingStats[p].clrs.push(v.clr);
      closingStats[p].weights.push(v.decay_weight);
      closingStats[p].views.push(v.views);
      if (closingStats[p].examples.length < 3) {
        closingStats[p].examples.push({ text: v.closing.text.slice(0, 120), clr: v.clr, shortCode: v.shortCode });
      }
    }
  }

  // CTA buildup stats
  const buildupStats = {};
  for (const v of analyzed) {
    const bu = v.closing.cta_buildup;
    if (!bu) continue;
    const type = bu.buildup_type;
    if (!buildupStats[type]) buildupStats[type] = { count: 0, clrs: [], durations: [] };
    buildupStats[type].count++;
    buildupStats[type].clrs.push(v.clr);
    buildupStats[type].durations.push(bu.buildup_duration);
  }

  // Winning combinations (opening × closing)
  const combos = {};
  for (const v of analyzed) {
    const oKey = v.opening.patterns[0] || "neutro";
    const cKey = v.closing.patterns.find(p => p.startsWith("cta")) || v.closing.patterns[0] || "sin_cta";
    const combo = `${oKey}→${cKey}`;
    if (!combos[combo]) combos[combo] = { count: 0, clrs: [], views: [] };
    combos[combo].count++;
    combos[combo].clrs.push(v.clr);
    combos[combo].views.push(v.views);
  }

  // Word density × performance
  const densityBuckets = { "lento(<2wps)": [], "normal(2-3wps)": [], "rapido(>3wps)": [] };
  for (const v of analyzed) {
    const bucket = v.words_per_second < 2 ? "lento(<2wps)" : v.words_per_second < 3 ? "normal(2-3wps)" : "rapido(>3wps)";
    densityBuckets[bucket].push(v);
  }

  // Format results
  const formatStats = (stats) => {
    return Object.entries(stats)
      .map(([pattern, d]) => ({
        pattern,
        count: d.count,
        avg_clr: round2(avg(d.clrs)),
        weighted_clr: round2(weightedAvg(d.clrs, d.weights || [])),
        median_clr: round2(median(d.clrs)),
        avg_views: Math.round(avg(d.views || [])),
        examples: d.examples || [],
        avg_duration: d.durations ? round2(avg(d.durations)) : undefined,
      }))
      .sort((a, b) => b.weighted_clr - a.weighted_clr);
  };

  const results = {
    username,
    analyzed_at: new Date().toISOString(),
    total_analyzed: analyzed.length,

    opening_patterns: formatStats(openingStats),
    body_patterns: formatStats(bodyStats),
    closing_patterns: formatStats(closingStats),
    cta_buildup_patterns: formatStats(buildupStats),

    winning_combos: Object.entries(combos)
      .map(([combo, d]) => ({
        combo,
        count: d.count,
        avg_clr: round2(avg(d.clrs)),
        avg_views: Math.round(avg(d.views)),
      }))
      .filter(c => c.count >= 2)
      .sort((a, b) => b.avg_clr - a.avg_clr),

    density_performance: Object.entries(densityBuckets).map(([bucket, videos]) => ({
      bucket,
      count: videos.length,
      avg_clr: round2(avg(videos.map(v => v.clr))),
      avg_views: Math.round(avg(videos.map(v => v.views))),
    })),

    // Caption patterns × performance
    caption_patterns: (() => {
      const capStats = {};
      for (const v of analyzed) {
        for (const p of (v.caption_patterns || [])) {
          if (!capStats[p]) capStats[p] = { count: 0, clrs: [], views: [] };
          capStats[p].count++;
          capStats[p].clrs.push(v.clr);
          capStats[p].views.push(v.views);
        }
      }
      return Object.entries(capStats)
        .map(([pattern, d]) => ({
          pattern,
          count: d.count,
          avg_clr: round2(avg(d.clrs)),
          avg_views: Math.round(avg(d.views)),
        }))
        .sort((a, b) => b.avg_clr - a.avg_clr);
    })(),

    // Beat sequences — body quarter patterns × CLR
    beat_sequences: (() => {
      const seqStats = {};
      for (const v of analyzed) {
        if (!v.body.beat_map) continue;
        const seq = v.body.beat_map.map(q => q.patterns[0] || "narrativa_general").join("→");
        if (!seqStats[seq]) seqStats[seq] = { count: 0, clrs: [], views: [] };
        seqStats[seq].count++;
        seqStats[seq].clrs.push(v.clr);
        seqStats[seq].views.push(v.views);
      }
      return Object.entries(seqStats)
        .map(([seq, d]) => ({
          sequence: seq,
          count: d.count,
          avg_clr: round2(avg(d.clrs)),
          avg_views: Math.round(avg(d.views)),
        }))
        .filter(s => s.count >= 2)
        .sort((a, b) => b.avg_clr - a.avg_clr);
    })(),

    // Beat position patterns — what patterns work best in Q1/Q2/Q3/Q4
    beat_position_stats: (() => {
      const posStats = { Q1_setup: {}, Q2_develop: {}, Q3_escalate: {}, Q4_resolve: {} };
      for (const v of analyzed) {
        if (!v.body.beat_map) continue;
        for (const q of v.body.beat_map) {
          const pos = posStats[q.label];
          if (!pos) continue;
          for (const p of q.patterns) {
            if (!pos[p]) pos[p] = { count: 0, clrs: [] };
            pos[p].count++;
            pos[p].clrs.push(v.clr);
          }
        }
      }
      const result = {};
      for (const [label, stats] of Object.entries(posStats)) {
        result[label] = Object.entries(stats)
          .map(([pattern, d]) => ({ pattern, count: d.count, avg_clr: round2(avg(d.clrs)) }))
          .sort((a, b) => b.avg_clr - a.avg_clr)
          .slice(0, 8);
      }
      return result;
    })(),

    // Top 20 hooks (by CLR, with full opening text)
    top_hooks: analyzed.slice(0, 20).map(v => ({
      shortCode: v.shortCode,
      opening_text: v.opening.text,
      opening_duration: v.opening.duration,
      opening_patterns: v.opening.patterns,
      clr: v.clr,
      views: v.views,
      comments: v.comments,
    })),

    // Top 10 CTA buildups
    top_cta_buildups: analyzed
      .filter(v => v.closing.cta_buildup)
      .sort((a, b) => b.clr - a.clr)
      .slice(0, 10)
      .map(v => ({
        shortCode: v.shortCode,
        closing_text: v.closing.text,
        buildup: v.closing.cta_buildup,
        clr: v.clr,
        views: v.views,
      })),

    // Full analysis per video (for deep dives)
    all_videos: analyzed,
  };

  // Save
  const outPath = path.join(REF_DIR, `${username}_patterns.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`  Patrones: ${outPath}`);

  // Print summary
  console.log(`\n  === @${username} — Patrones ===`);
  console.log(`  Videos analizados: ${analyzed.length}`);

  console.log(`\n  APERTURAS (0-8s):`);
  for (const p of results.opening_patterns.slice(0, 5)) {
    console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(3)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | Views: ${p.avg_views.toLocaleString()}`);
  }

  console.log(`\n  CUERPO:`);
  for (const p of results.body_patterns.slice(0, 5)) {
    console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(3)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | Views: ${p.avg_views.toLocaleString()}`);
  }

  console.log(`\n  CIERRES:`);
  for (const p of results.closing_patterns.slice(0, 5)) {
    console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(3)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | Views: ${p.avg_views.toLocaleString()}`);
  }

  if (results.winning_combos.length > 0) {
    console.log(`\n  COMBOS GANADORES (apertura→cierre, 2+ usos):`);
    for (const c of results.winning_combos.slice(0, 5)) {
      console.log(`    ${c.combo.padEnd(35)} | ${String(c.count).padStart(3)}x | CLR: ${String(c.avg_clr + "%").padStart(8)}`);
    }
  }

  if (results.cta_buildup_patterns.length > 0) {
    console.log(`\n  BUILDUP al CTA:`);
    for (const p of results.cta_buildup_patterns) {
      console.log(`    ${p.pattern.padEnd(25)} | ${String(p.count).padStart(3)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | Duración buildup: ${p.avg_duration}s`);
    }
  }

  console.log(`\n  DENSIDAD (palabras/segundo):`);
  for (const d of results.density_performance) {
    console.log(`    ${d.bucket.padEnd(20)} | ${String(d.count).padStart(3)}x | CLR: ${String(d.avg_clr + "%").padStart(8)} | Views: ${d.avg_views.toLocaleString()}`);
  }

  if (results.beat_sequences.length > 0) {
    console.log(`\n  SECUENCIAS DE BEATS (Q1→Q2→Q3→Q4, 2+ usos):`);
    for (const s of results.beat_sequences.slice(0, 5)) {
      console.log(`    ${s.sequence.padEnd(55)} | ${String(s.count).padStart(3)}x | CLR: ${String(s.avg_clr + "%").padStart(8)}`);
    }
  }

  if (results.caption_patterns.length > 0) {
    console.log(`\n  CAPTIONS:`);
    for (const p of results.caption_patterns.slice(0, 8)) {
      console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(3)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | Views: ${p.avg_views.toLocaleString()}`);
    }
  }

  return results;
}

// ──────────────────────────────────────────
// Cross-profile pattern library
// ──────────────────────────────────────────

function generatePatternLibrary(allResults) {
  console.log("\n\n═══════════════════════════════════════════");
  console.log("  PATTERN LIBRARY — Cross-profile");
  console.log("═══════════════════════════════════════════\n");

  // Merge all patterns
  const mergeStats = (key) => {
    const merged = {};
    for (const result of allResults) {
      for (const p of result[key]) {
        if (!merged[p.pattern]) merged[p.pattern] = { count: 0, clrs: [], weights: [], views: [], profiles: new Set(), examples: [] };
        merged[p.pattern].count += p.count;
        // Reconstruct from source
        const profileVideos = result.all_videos.filter(v => {
          const patterns = key === "opening_patterns" ? v.opening.patterns :
            key === "body_patterns" ? v.body.patterns :
              key === "closing_patterns" ? v.closing.patterns : [];
          return patterns.includes(p.pattern);
        });
        for (const v of profileVideos) {
          merged[p.pattern].clrs.push(v.clr);
          merged[p.pattern].weights.push(v.decay_weight || 1);
          merged[p.pattern].views.push(v.views);
        }
        merged[p.pattern].profiles.add(result.username);
        // Add best examples
        for (const ex of p.examples || []) {
          if (merged[p.pattern].examples.length < 5) {
            merged[p.pattern].examples.push({ ...ex, profile: result.username });
          }
        }
      }
    }

    return Object.entries(merged)
      .map(([pattern, d]) => ({
        pattern,
        count: d.count,
        profiles: [...d.profiles],
        avg_clr: round2(avg(d.clrs)),
        weighted_clr: round2(weightedAvg(d.clrs, d.weights)),
        median_clr: round2(median(d.clrs)),
        avg_views: Math.round(avg(d.views)),
        examples: d.examples.sort((a, b) => (b.clr || 0) - (a.clr || 0)).slice(0, 3),
      }))
      .sort((a, b) => b.weighted_clr - a.weighted_clr);
  };

  const library = {
    generated_at: new Date().toISOString(),
    total_videos: allResults.reduce((s, r) => s + r.total_analyzed, 0),
    total_profiles: allResults.length,
    profiles: allResults.map(r => r.username),

    opening_patterns: mergeStats("opening_patterns"),
    body_patterns: mergeStats("body_patterns"),
    closing_patterns: mergeStats("closing_patterns"),

    // Merge top hooks across all profiles
    top_hooks_global: allResults
      .flatMap(r => r.top_hooks.map(h => ({ ...h, profile: r.username })))
      .sort((a, b) => b.clr - a.clr)
      .slice(0, 50),

    // Merge top CTA buildups
    top_cta_buildups_global: allResults
      .flatMap(r => r.top_cta_buildups.map(c => ({ ...c, profile: r.username })))
      .sort((a, b) => b.clr - a.clr)
      .slice(0, 20),

    // Merge caption patterns cross-profile
    caption_patterns: (() => {
      const merged = {};
      for (const result of allResults) {
        for (const p of (result.caption_patterns || [])) {
          if (!merged[p.pattern]) merged[p.pattern] = { count: 0, clrs: [], views: [], profiles: new Set() };
          merged[p.pattern].count += p.count;
          // Get CLR from source videos
          for (const v of result.all_videos) {
            if ((v.caption_patterns || []).includes(p.pattern)) {
              merged[p.pattern].clrs.push(v.clr);
              merged[p.pattern].views.push(v.views);
            }
          }
          merged[p.pattern].profiles.add(result.username);
        }
      }
      return Object.entries(merged)
        .map(([pattern, d]) => ({
          pattern,
          count: d.count,
          profiles: [...d.profiles],
          avg_clr: round2(avg(d.clrs)),
          avg_views: Math.round(avg(d.views)),
        }))
        .sort((a, b) => b.avg_clr - a.avg_clr);
    })(),

    // Merge beat sequences cross-profile
    beat_sequences: (() => {
      const merged = {};
      for (const result of allResults) {
        for (const s of (result.beat_sequences || [])) {
          if (!merged[s.sequence]) merged[s.sequence] = { count: 0, clrs: [], views: [] };
          merged[s.sequence].count += s.count;
          // Approximate from avg × count (not perfect but avoids re-processing all videos)
          for (let i = 0; i < s.count; i++) {
            merged[s.sequence].clrs.push(s.avg_clr);
            merged[s.sequence].views.push(s.avg_views);
          }
        }
      }
      return Object.entries(merged)
        .map(([seq, d]) => ({
          sequence: seq,
          count: d.count,
          avg_clr: round2(avg(d.clrs)),
          avg_views: Math.round(avg(d.views)),
        }))
        .filter(s => s.count >= 3)
        .sort((a, b) => b.avg_clr - a.avg_clr);
    })(),
  };

  const libPath = path.join(REF_DIR, "pattern-library.json");
  fs.writeFileSync(libPath, JSON.stringify(library, null, 2));
  console.log(`Pattern library: ${libPath}`);

  // Print cross-profile insights
  console.log(`\n  APERTURAS — Ranking cross-profile (${library.total_videos} videos, ${library.total_profiles} perfiles):`);
  for (const p of library.opening_patterns.filter(p => p.count >= 5).slice(0, 8)) {
    console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(4)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | ${p.profiles.join(", ")}`);
  }

  console.log(`\n  CUERPO — Ranking cross-profile:`);
  for (const p of library.body_patterns.filter(p => p.count >= 5).slice(0, 8)) {
    console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(4)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | ${p.profiles.join(", ")}`);
  }

  console.log(`\n  CIERRES — Ranking cross-profile:`);
  for (const p of library.closing_patterns.filter(p => p.count >= 3).slice(0, 8)) {
    console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(4)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | ${p.profiles.join(", ")}`);
  }

  if (library.caption_patterns.length > 0) {
    console.log(`\n  CAPTIONS — Ranking cross-profile:`);
    for (const p of library.caption_patterns.filter(p => p.count >= 10).slice(0, 8)) {
      console.log(`    ${p.pattern.padEnd(20)} | ${String(p.count).padStart(4)}x | CLR: ${String(p.avg_clr + "%").padStart(8)} | ${p.profiles.join(", ")}`);
    }
  }

  // Export markdown
  if (exportMode) {
    let md = `# Pattern Library — ${library.total_videos} videos de ${library.total_profiles} perfiles\n\n`;
    md += `> Generado: ${new Date().toISOString().slice(0, 10)}\n`;
    md += `> Perfiles: ${library.profiles.map(p => "@" + p).join(", ")}\n\n`;
    md += `---\n\n`;

    md += `## Patrones de APERTURA (0-8s) × Performance\n\n`;
    md += `Qué tipo de hook genera más CLR y más views.\n\n`;
    md += `| Patrón | Usos | Avg CLR | Weighted CLR | Median CLR | Avg Views | Perfiles |\n`;
    md += `|--------|-----:|--------:|-------------:|-----------:|----------:|---------|\n`;
    for (const p of library.opening_patterns.filter(p => p.count >= 3)) {
      md += `| **${p.pattern}** | ${p.count} | ${p.avg_clr}% | ${p.weighted_clr || p.avg_clr}% | ${p.median_clr}% | ${p.avg_views.toLocaleString()} | ${p.profiles.join(", ")} |\n`;
    }

    md += `\n### Top 30 hooks reales (por CLR)\n\n`;
    for (let i = 0; i < Math.min(30, library.top_hooks_global.length); i++) {
      const h = library.top_hooks_global[i];
      md += `${i + 1}. **@${h.profile}** (CLR ${h.clr}%, ${h.views.toLocaleString()} views)\n`;
      md += `   > ${h.opening_text}\n`;
      md += `   Patrones: ${h.opening_patterns.join(", ")} | ${round2(h.opening_duration)}s\n\n`;
    }

    md += `---\n\n`;
    md += `## Patrones de CUERPO × Performance\n\n`;
    md += `Qué estructura narrativa correlaciona con engagement.\n\n`;
    md += `| Patrón | Usos | Avg CLR | Median CLR | Avg Views | Perfiles |\n`;
    md += `|--------|-----:|--------:|-----------:|----------:|---------|\n`;
    for (const p of library.body_patterns.filter(p => p.count >= 3)) {
      md += `| **${p.pattern}** | ${p.count} | ${p.avg_clr}% | ${p.median_clr}% | ${p.avg_views.toLocaleString()} | ${p.profiles.join(", ")} |\n`;
    }

    md += `\n---\n\n`;
    md += `## Patrones de CIERRE (últimos 15s) × Performance\n\n`;
    md += `Cómo llegan al CTA y qué buildup funciona mejor.\n\n`;
    md += `| Patrón | Usos | Avg CLR | Median CLR | Avg Views | Perfiles |\n`;
    md += `|--------|-----:|--------:|-----------:|----------:|---------|\n`;
    for (const p of library.closing_patterns.filter(p => p.count >= 3)) {
      md += `| **${p.pattern}** | ${p.count} | ${p.avg_clr}% | ${p.median_clr}% | ${p.avg_views.toLocaleString()} | ${p.profiles.join(", ")} |\n`;
    }

    md += `\n### Top 15 buildups al CTA (por CLR)\n\n`;
    for (let i = 0; i < Math.min(15, library.top_cta_buildups_global.length); i++) {
      const c = library.top_cta_buildups_global[i];
      md += `${i + 1}. **@${c.profile}** (CLR ${c.clr}%, ${c.views.toLocaleString()} views)\n`;
      md += `   Buildup (${c.buildup.buildup_type}, ${c.buildup.buildup_duration}s): "${c.buildup.buildup_text.slice(0, 150)}"\n`;
      md += `   CTA: "${c.buildup.cta_text.slice(0, 100)}"\n\n`;
    }

    if (library.caption_patterns && library.caption_patterns.length > 0) {
      md += `\n---\n\n`;
      md += `## Patrones de CAPTION × Performance\n\n`;
      md += `Qué tipo de descripción correlaciona con mejor engagement.\n\n`;
      md += `| Patrón | Usos | Avg CLR | Avg Views | Perfiles |\n`;
      md += `|--------|-----:|--------:|----------:|---------|\n`;
      for (const p of library.caption_patterns.filter(p => p.count >= 5)) {
        md += `| **${p.pattern}** | ${p.count} | ${p.avg_clr}% | ${p.avg_views.toLocaleString()} | ${p.profiles.join(", ")} |\n`;
      }
    }

    if (library.beat_sequences && library.beat_sequences.length > 0) {
      md += `\n---\n\n`;
      md += `## Secuencias de BEATS (Q1→Q2→Q3→Q4) × Performance\n\n`;
      md += `Cómo se estructura el cuerpo del video en 4 cuartos temporales.\n\n`;
      md += `| Secuencia | Usos | Avg CLR | Avg Views |\n`;
      md += `|-----------|-----:|--------:|----------:|\n`;
      for (const s of library.beat_sequences.slice(0, 15)) {
        md += `| ${s.sequence} | ${s.count} | ${s.avg_clr}% | ${s.avg_views.toLocaleString()} |\n`;
      }
    }

    md += `---\n\n`;
    md += `## Cómo usar esta library\n\n`;
    md += `1. **Al generar hooks para ADP:** Consultar la tabla de aperturas. Los patrones con mejor CLR SON los que debemos priorizar.\n`;
    md += `2. **Al elegir estructura de cuerpo:** Los patrones de cuerpo con mejor CLR indican qué beats emocionales resuenan más.\n`;
    md += `3. **Al diseñar el cierre:** La combinación CTA doble (video + caption) con buildup de promesa_valor o remocion_riesgo domina.\n`;
    md += `4. **Para evitar patrones agotados:** Si un patrón tiene muchos usos pero CLR decayendo, está saturado.\n`;
    md += `5. **Para encontrar combos ganadores:** Cruzar apertura × cierre en pattern-library.json campo winning_combos.\n`;

    const mdPath = path.join(REF_DIR, "pattern-library.md");
    fs.writeFileSync(mdPath, md);
    console.log(`\nExportado: ${mdPath}`);
  }

  return library;
}

// ──────────────────────────────────────────
// Run
// ──────────────────────────────────────────

const allResults = [];

for (const username of usernames) {
  try {
    const result = analyzeProfile(username);
    if (result) allResults.push(result);
  } catch (err) {
    console.error(`Error con @${username}: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
  }
}

if (allResults.length > 1) {
  generatePatternLibrary(allResults);
}

console.log("\nListo.");
