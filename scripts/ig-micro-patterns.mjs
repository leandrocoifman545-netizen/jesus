#!/usr/bin/env node
/**
 * MICRO-PATRONES AUTOMÁTICOS — ig-micro-patterns.mjs
 *
 * Replica el análisis exhaustivo que se hizo a mano con Ramiro:
 *   A. Patrones lingüísticos (frases top-only, killer phrases, transiciones, aperturas, cierres)
 *   B. Patrones estructurales (duración×CLR, WPS, oraciones, preguntas, revenue claims, CTAs)
 *   C. Patrones de caption (largo, "comenta", emoji, hashtag, pregunta, keywords CTA)
 *   D. Patrones por tipo de post (Video vs Sidecar)
 *
 * Uso:
 *   node scripts/ig-micro-patterns.mjs ramiro.cubria
 *   node scripts/ig-micro-patterns.mjs ramiro.cubria --top-pct 30
 *
 * Output:
 *   .data/ig-references/{profile}_auto-patterns.md   — reporte legible
 *   .data/ig-references/{profile}_auto-patterns.json  — datos estructurados
 */

import fs from "fs";
import path from "path";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

// ──────────────────────────────────────────
// Args
// ──────────────────────────────────────────
const args = process.argv.slice(2);
let profile = "";
let topPct = 25; // percentile for top/bottom split

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--top-pct" && args[i + 1]) {
    topPct = parseInt(args[i + 1], 10);
    i++;
  } else if (!args[i].startsWith("--")) {
    profile = args[i].replace(/^@/, "");
  }
}

if (!profile) {
  console.error("Uso: node scripts/ig-micro-patterns.mjs <profile> [--top-pct 25]");
  process.exit(1);
}

// ──────────────────────────────────────────
// Spanish stopwords
// ──────────────────────────────────────────
const STOPWORDS = new Set([
  "a", "al", "algo", "ante", "antes", "como", "con", "contra",
  "cual", "cuando", "de", "del", "desde", "donde", "durante",
  "e", "el", "ella", "ellas", "ellos", "en", "entre", "era",
  "esa", "esas", "ese", "eso", "esos", "esta", "estaba", "estado",
  "estas", "este", "esto", "estos", "fue", "ha", "hacia",
  "hasta", "hay", "la", "las", "le", "les", "lo", "los",
  "más", "me", "mi", "mí", "muy", "nada", "ni", "no",
  "nos", "nosotros", "nuestro", "o", "otra", "otras", "otro",
  "otros", "para", "pero", "por", "qué", "que", "se", "ser",
  "si", "sí", "sin", "sino", "sobre", "somos", "son", "soy",
  "su", "sus", "también", "te", "ti", "tiene", "tienen",
  "todo", "todos", "tu", "tú", "tus", "un", "una", "unas",
  "uno", "unos", "usted", "ustedes", "va", "vamos", "van",
  "vos", "y", "ya", "yo",
  // Extra common filler
  "ahí", "así", "eso", "acá", "ahora", "después", "puede",
  "cada", "hacer", "porque", "esa", "ese", "puede", "puede",
  "tengo", "tenés", "tiene", "tienen", "ser", "estar", "hoy",
  "día", "ir", "ver", "dar", "poner", "decir", "dice",
]);

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100; }
function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }
function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function clr(comments, likes) {
  if (!likes || likes <= 0) return 0;
  return round2(comments / likes);
}
function pct(n, total) {
  if (!total) return "0%";
  return round2(n / total * 100) + "%";
}

function countOccurrences(text, phrase) {
  const lower = text.toLowerCase();
  const target = phrase.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = lower.indexOf(target, pos)) !== -1) {
    count++;
    pos += target.length;
  }
  return count;
}

function splitSentences(text) {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 2);
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function extractNgrams(text, n) {
  const words = text.toLowerCase().replace(/[.,!?¿¡;:()"""'']/g, "").split(/\s+/).filter(Boolean);
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n);
    // Skip if all stopwords
    if (gram.every(w => STOPWORDS.has(w))) continue;
    ngrams.push(gram.join(" "));
  }
  return ngrams;
}

function countPhraseInTexts(texts, phrase) {
  let total = 0;
  for (const t of texts) {
    total += countOccurrences(t, phrase);
  }
  return total;
}

function countVideosWithPhrase(texts, phrase) {
  let count = 0;
  for (const t of texts) {
    if (t.toLowerCase().includes(phrase.toLowerCase())) count++;
  }
  return count;
}

// ──────────────────────────────────────────
// Load data
// ──────────────────────────────────────────
console.log(`\nAnalizando micro-patrones de @${profile}...`);

const scrapeFile = path.join(REF_DIR, `${profile}.json`);
const transcriptFile = path.join(REF_DIR, `${profile}_transcripts.json`);

if (!fs.existsSync(scrapeFile)) {
  console.error(`No existe ${scrapeFile}`);
  process.exit(1);
}

const scrapeData = JSON.parse(fs.readFileSync(scrapeFile, "utf8"));
const rawPosts = scrapeData._raw_posts || scrapeData.posts || [];
console.log(`  ${rawPosts.length} posts en scrape`);

let transcripts = [];
let hasTranscripts = false;
if (fs.existsSync(transcriptFile)) {
  const tData = JSON.parse(fs.readFileSync(transcriptFile, "utf8"));
  transcripts = (tData.transcripts || []).filter(t => t.transcript && t.transcript.trim().length > 10);
  hasTranscripts = transcripts.length > 0;
  console.log(`  ${transcripts.length} transcripciones válidas`);
} else {
  console.log(`  Sin transcripciones (${transcriptFile} no existe)`);
}

// Build post map by shortCode
const postMap = {};
for (const p of rawPosts) {
  if (p.shortCode) postMap[p.shortCode] = p;
}

// Enrich transcripts with post data
for (const t of transcripts) {
  const post = postMap[t.shortCode];
  if (post) {
    t.type = post.type || "Video";
    t.caption = t.caption || post.caption || "";
    t.views = t.views || post.views || 0;
    t.likes = t.likes || post.likes || 0;
    t.comments = t.comments || post.comments || 0;
    t.videoDuration = t.duration || post.videoDuration || 0;
  }
}

// ──────────────────────────────────────────
// Compute CLR for ALL posts
// ──────────────────────────────────────────
const allPostsWithCLR = rawPosts
  .filter(p => (p.likes || 0) > 0)
  .map(p => ({
    ...p,
    clr: clr(p.comments || 0, p.likes || 0),
  }))
  .sort((a, b) => b.clr - a.clr);

const videos = allPostsWithCLR.filter(p => (p.type || "").toLowerCase() === "video");
const sidecars = allPostsWithCLR.filter(p => (p.type || "").toLowerCase() === "sidecar");

// Compute CLR for transcribed videos
const transcribedWithCLR = transcripts
  .filter(t => (t.likes || 0) > 0)
  .map(t => ({
    ...t,
    clr: clr(t.comments || 0, t.likes || 0),
    wps: t.duration > 0 ? round2(wordCount(t.transcript) / t.duration) : 0,
  }))
  .sort((a, b) => b.clr - a.clr);

// Split into top/bottom
const topN = transcribedWithCLR.length >= 4 ? Math.floor(transcribedWithCLR.length * topPct / 100) : 0;
const bottomN = topN;
const topVideos = transcribedWithCLR.slice(0, topN);
const bottomVideos = topN > 0 ? transcribedWithCLR.slice(-bottomN) : [];

const topCLRThreshold = topVideos.length ? topVideos[topVideos.length - 1].clr : 0;
const bottomCLRThreshold = bottomVideos.length ? bottomVideos[0].clr : 0;

console.log(`  Top ${topPct}%: ${topN} videos (CLR >= ${topCLRThreshold})`);
console.log(`  Bottom ${topPct}%: ${bottomN} videos (CLR <= ${bottomCLRThreshold})`);

const topTexts = topVideos.map(v => v.transcript);
const bottomTexts = bottomVideos.map(v => v.transcript);

// ──────────────────────────────────────────
// A. LINGUISTIC PATTERNS
// ──────────────────────────────────────────
console.log("\n  Analizando patrones lingüísticos...");

// A.1 — Top phrases (2-4 grams that appear in top but NOT bottom)
function findDifferentialPhrases(topTexts, bottomTexts, ngramSize, minTopCount) {
  const topFreq = {};
  const bottomFreq = {};

  for (const text of topTexts) {
    const seen = new Set();
    for (const ng of extractNgrams(text, ngramSize)) {
      if (!seen.has(ng)) {
        topFreq[ng] = (topFreq[ng] || 0) + 1;
        seen.add(ng);
      }
    }
  }
  for (const text of bottomTexts) {
    const seen = new Set();
    for (const ng of extractNgrams(text, ngramSize)) {
      if (!seen.has(ng)) {
        bottomFreq[ng] = (bottomFreq[ng] || 0) + 1;
        seen.add(ng);
      }
    }
  }

  const topOnly = [];
  const bottomOnly = [];

  for (const [phrase, topCount] of Object.entries(topFreq)) {
    const bottomCount = bottomFreq[phrase] || 0;
    if (topCount >= minTopCount && bottomCount === 0) {
      topOnly.push({ phrase, top_videos: topCount, bottom_videos: 0 });
    }
  }

  for (const [phrase, bottomCount] of Object.entries(bottomFreq)) {
    const topCount = topFreq[phrase] || 0;
    if (bottomCount >= minTopCount && topCount === 0) {
      bottomOnly.push({ phrase, top_videos: 0, bottom_videos: bottomCount });
    }
  }

  topOnly.sort((a, b) => b.top_videos - a.top_videos);
  bottomOnly.sort((a, b) => b.bottom_videos - a.bottom_videos);

  return { topOnly, bottomOnly };
}

const phrases2 = hasTranscripts ? findDifferentialPhrases(topTexts, bottomTexts, 2, 2) : { topOnly: [], bottomOnly: [] };
const phrases3 = hasTranscripts ? findDifferentialPhrases(topTexts, bottomTexts, 3, 2) : { topOnly: [], bottomOnly: [] };
const phrases4 = hasTranscripts ? findDifferentialPhrases(topTexts, bottomTexts, 4, 2) : { topOnly: [], bottomOnly: [] };

// Merge and deduplicate (prefer longer phrases)
function mergeAndDedup(p2, p3, p4, limit) {
  const all = [...p4, ...p3, ...p2];
  const seen = new Set();
  const result = [];
  for (const p of all) {
    // Skip if a longer phrase containing this one is already included
    let dominated = false;
    for (const s of seen) {
      if (s.includes(p.phrase) || p.phrase.includes(s)) {
        dominated = true;
        break;
      }
    }
    if (!dominated) {
      result.push(p);
      seen.add(p.phrase);
    }
    if (result.length >= limit) break;
  }
  return result;
}

const topOnlyPhrases = mergeAndDedup(phrases2.topOnly, phrases3.topOnly, phrases4.topOnly, 30);
const killerPhrases = mergeAndDedup(phrases2.bottomOnly, phrases3.bottomOnly, phrases4.bottomOnly, 20);

// A.2 — Transition phrases frequency
const TRANSITION_PHRASES = [
  "pero bueno", "de todos modos", "en fin", "literalmente", "una locura",
  "puta locura", "comenta", "en menos de un minuto", "así que",
  "lo único que tenés", "lo único que tienes", "te lo envío", "te lo mando",
  "más te vale", "si querés", "si quieres", "solamente",
  "entonces", "simplemente", "en realidad", "la verdad",
  "nos vemos amigos", "adiós amigos", "es impresionante", "es increíble",
  "es una locura", "es una puta locura",
];

const transitionAnalysis = [];
if (hasTranscripts) {
  for (const phrase of TRANSITION_PHRASES) {
    let topTotal = 0, bottomTotal = 0;
    for (const t of topTexts) topTotal += countOccurrences(t, phrase);
    for (const t of bottomTexts) bottomTotal += countOccurrences(t, phrase);

    const topPerVideo = topTexts.length ? round2(topTotal / topTexts.length) : 0;
    const bottomPerVideo = bottomTexts.length ? round2(bottomTotal / bottomTexts.length) : 0;

    if (topTotal > 0 || bottomTotal > 0) {
      let ratio = "Similar";
      if (bottomPerVideo === 0 && topPerVideo > 0) ratio = "Solo en TOP";
      else if (topPerVideo === 0 && bottomPerVideo > 0) ratio = "Solo en BOTTOM";
      else if (topPerVideo > 0 && bottomPerVideo > 0) {
        const r = round2(topPerVideo / bottomPerVideo);
        if (r >= 2) ratio = `${r}x más en TOP`;
        else if (r <= 0.5) ratio = `${round2(bottomPerVideo / topPerVideo)}x más en BOTTOM`;
      }

      transitionAnalysis.push({
        phrase,
        top_per_video: topPerVideo,
        bottom_per_video: bottomPerVideo,
        top_total: topTotal,
        bottom_total: bottomTotal,
        ratio,
      });
    }
  }
  transitionAnalysis.sort((a, b) => {
    const aR = a.top_per_video / Math.max(a.bottom_per_video, 0.01);
    const bR = b.top_per_video / Math.max(b.bottom_per_video, 0.01);
    return bR - aR;
  });
}

// A.3 — Opening patterns (first 5 words)
const openingPatterns = [];
if (hasTranscripts) {
  for (const v of transcribedWithCLR) {
    const words = v.transcript.trim().split(/\s+/).slice(0, 5);
    openingPatterns.push({
      opening: words.join(" "),
      shortCode: v.shortCode,
      clr: v.clr,
    });
  }
}

// Classify openings by type
function classifyOpeningType(text) {
  const lower = text.toLowerCase().trim();
  if (/^(se\s+acaba|acaba\s+de)/.test(lower)) return "Urgencia";
  if (/^(todos|todas|todo\s+el)/.test(lower)) return "Universal";
  if (/^(cualquier)/.test(lower)) return "Cualquier";
  if (/^(me\s+acabo|acabo\s+de)/.test(lower)) return "Self";
  if (/^(te\s+voy|vos\s+pod|tú\s+pod|te\s+cuento)/.test(lower)) return "Direct-to-you";
  if (/^(despedí|le\s+pagué|contraté|vendí|compré)/.test(lower)) return "Action";
  if (/^(no\s+)/.test(lower)) return "Negation";
  if (/^(nadie)/.test(lower)) return "Nobody";
  if (/^(este|esta|esto)/.test(lower)) return "Demonstrative";
  if (/^¿|.*\?/.test(text.trim().split(/\s+/).slice(0, 5).join(" "))) return "Question";
  if (/^\d/.test(lower)) return "Number-lead";
  if (/^(mi\s|mis\s)/.test(lower)) return "Possessive";
  if (/^(si\s+)/.test(lower)) return "Conditional";
  if (/^(hay\s+)/.test(lower)) return "Existence";
  return "Otro";
}

const openingTypeStats = {};
if (hasTranscripts) {
  for (const v of transcribedWithCLR) {
    const type = classifyOpeningType(v.transcript);
    if (!openingTypeStats[type]) openingTypeStats[type] = { count: 0, clrs: [], max_clr: 0 };
    openingTypeStats[type].count++;
    openingTypeStats[type].clrs.push(v.clr);
    openingTypeStats[type].max_clr = Math.max(openingTypeStats[type].max_clr, v.clr);
  }
}

const openingTypeTable = Object.entries(openingTypeStats)
  .map(([type, d]) => ({
    type,
    count: d.count,
    avg_clr: round2(avg(d.clrs)),
    max_clr: d.max_clr,
  }))
  .sort((a, b) => b.avg_clr - a.avg_clr);

// A.4 — Closing patterns (last 10 words)
function classifyClosingType(text) {
  const lower = text.toLowerCase().trim();
  const lastWords = lower.split(/\s+/).slice(-15).join(" ");
  if (/comenta\s+\S+\s*$/.test(lastWords)) return 'Termina con "comenta [keyword]"';
  if (/mensaje\s+privado/.test(lastWords) || /por\s+dm/.test(lastWords) || /por\s+mensaje/.test(lastWords)) return '"...por mensaje privado"';
  if (/en\s+menos\s+de\s+un\s+minuto/.test(lastWords)) return '"...en menos de un minuto"';
  if (/adi[oó]s\s+amigos/.test(lastWords)) return '"Adiós amigos"';
  if (/nos\s+vemos\s+amigos/.test(lastWords)) return '"Nos vemos amigos"';
  if (/nos\s+vemos/.test(lastWords)) return '"Nos vemos"';
  return "Otro";
}

const closingTypeStats = {};
if (hasTranscripts) {
  for (const v of transcribedWithCLR) {
    const type = classifyClosingType(v.transcript);
    if (!closingTypeStats[type]) closingTypeStats[type] = { count: 0, clrs: [] };
    closingTypeStats[type].count++;
    closingTypeStats[type].clrs.push(v.clr);
  }
}

const closingTypeTable = Object.entries(closingTypeStats)
  .map(([type, d]) => ({
    type,
    count: d.count,
    avg_clr: round2(avg(d.clrs)),
  }))
  .sort((a, b) => b.avg_clr - a.avg_clr);

// A.5 — Word frequency differential
function wordFrequencyDiff(topTexts, bottomTexts, minCount) {
  const topFreq = {};
  const bottomFreq = {};

  for (const text of topTexts) {
    const words = text.toLowerCase().replace(/[.,!?¿¡;:()"""'']/g, "").split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (STOPWORDS.has(w) || w.length < 3) continue;
      topFreq[w] = (topFreq[w] || 0) + 1;
    }
  }
  for (const text of bottomTexts) {
    const words = text.toLowerCase().replace(/[.,!?¿¡;:()"""'']/g, "").split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (STOPWORDS.has(w) || w.length < 3) continue;
      bottomFreq[w] = (bottomFreq[w] || 0) + 1;
    }
  }

  const topDiff = [];
  const bottomDiff = [];

  for (const [word, tc] of Object.entries(topFreq)) {
    const bc = bottomFreq[word] || 0;
    if (tc >= minCount) {
      const ratio = bc > 0 ? round2(tc / bc) : tc;
      if (bc === 0 || ratio >= 3) {
        topDiff.push({ word, top: tc, bottom: bc, ratio: bc === 0 ? `Solo top (${tc})` : `${ratio}x` });
      }
    }
  }
  for (const [word, bc] of Object.entries(bottomFreq)) {
    const tc = topFreq[word] || 0;
    if (bc >= minCount) {
      const ratio = tc > 0 ? round2(bc / tc) : bc;
      if (tc === 0 || ratio >= 3) {
        bottomDiff.push({ word, top: tc, bottom: bc, ratio: tc === 0 ? `Solo bottom (${bc})` : `${ratio}x` });
      }
    }
  }

  topDiff.sort((a, b) => {
    const aR = a.bottom === 0 ? a.top * 100 : a.top / a.bottom;
    const bR = b.bottom === 0 ? b.top * 100 : b.top / b.bottom;
    return bR - aR;
  });
  bottomDiff.sort((a, b) => {
    const aR = a.top === 0 ? a.bottom * 100 : a.bottom / a.top;
    const bR = b.top === 0 ? b.bottom * 100 : b.bottom / b.top;
    return bR - aR;
  });

  return { topDiff: topDiff.slice(0, 25), bottomDiff: bottomDiff.slice(0, 25) };
}

const wordDiff = hasTranscripts ? wordFrequencyDiff(topTexts, bottomTexts, 3) : { topDiff: [], bottomDiff: [] };

// A.6 — Enthusiasm markers
const ENTHUSIASM_PHRASES = [
  "es una locura", "es una puta locura", "es impresionante", "es increíble",
  "son increíbles", "es una pelotudez", "una bestialidad", "una bestia",
];

const enthusiasmAnalysis = [];
if (hasTranscripts) {
  for (const phrase of ENTHUSIASM_PHRASES) {
    const topCount = countPhraseInTexts(topTexts, phrase);
    const bottomCount = countPhraseInTexts(bottomTexts, phrase);
    if (topCount > 0 || bottomCount > 0) {
      enthusiasmAnalysis.push({ phrase, top: topCount, bottom: bottomCount });
    }
  }
}

// ──────────────────────────────────────────
// B. STRUCTURAL PATTERNS
// ──────────────────────────────────────────
console.log("  Analizando patrones estructurales...");

// B.1 — Duration × CLR (15s buckets)
const durationBuckets = {};
for (const v of videos) {
  const dur = v.videoDuration || v.duration || 0;
  if (dur <= 0) continue;
  const bucket = `${Math.floor(dur / 15) * 15}-${Math.floor(dur / 15) * 15 + 15}s`;
  if (!durationBuckets[bucket]) durationBuckets[bucket] = { count: 0, clrs: [], start: Math.floor(dur / 15) * 15 };
  durationBuckets[bucket].count++;
  durationBuckets[bucket].clrs.push(v.clr);
}

const durationTable = Object.entries(durationBuckets)
  .map(([bucket, d]) => ({
    bucket,
    count: d.count,
    avg_clr: round2(avg(d.clrs)),
    start: d.start,
  }))
  .sort((a, b) => a.start - b.start);

// B.2 — Rhythm metrics top vs bottom
let rhythmMetrics = null;
if (hasTranscripts && topVideos.length > 0 && bottomVideos.length > 0) {
  function computeRhythmMetrics(vids) {
    const durations = vids.map(v => v.duration || v.videoDuration || 0).filter(d => d > 0);
    const wcs = vids.map(v => wordCount(v.transcript));
    const wpss = vids.map(v => v.wps).filter(w => w > 0);
    const sentCounts = vids.map(v => splitSentences(v.transcript).length);
    const questionCounts = vids.map(v => (v.transcript.match(/\?/g) || []).length);

    // Revenue claims: $, dólares, mil, million
    const revenueCounts = vids.map(v => {
      const t = v.transcript.toLowerCase();
      return (t.match(/(\$\d|\d+\s*(dólares|pesos|euros|mil|millones?|k\b|usd)|\d+\s+por\s+(día|mes|semana))/g) || []).length;
    });

    // Speed/ease promises
    const speedCounts = vids.map(v => {
      const t = v.transcript.toLowerCase();
      return (t.match(/(en\s+menos\s+de|en\s+\d+\s+(segundo|minuto|hora)|al\s+instante|automáticamente|completamente\s+gratis|100%\s+gratis|sin\s+pagar)/g) || []).length;
    });

    // "comenta" count
    const comentaCounts = vids.map(v => countOccurrences(v.transcript, "comenta"));

    // Sentence length alternation
    const alternations = vids.map(v => {
      const sents = splitSentences(v.transcript);
      if (sents.length < 3) return 0;
      let alt = 0;
      for (let i = 1; i < sents.length; i++) {
        const prev = wordCount(sents[i - 1]);
        const curr = wordCount(sents[i]);
        const prevCat = prev <= 6 ? "S" : prev <= 12 ? "M" : "L";
        const currCat = curr <= 6 ? "S" : curr <= 12 ? "M" : "L";
        if (prevCat !== currCat) alt++;
      }
      return round2(alt / (sents.length - 1));
    });

    return {
      avg_duration: round2(avg(durations)),
      avg_words: round2(avg(wcs)),
      avg_wps: round2(avg(wpss)),
      avg_sentences: round2(avg(sentCounts)),
      avg_questions: round2(avg(questionCounts)),
      avg_revenue_claims: round2(avg(revenueCounts)),
      avg_speed_promises: round2(avg(speedCounts)),
      avg_comenta_count: round2(avg(comentaCounts)),
      avg_alternation: round2(avg(alternations) * 100) + "%",
    };
  }

  rhythmMetrics = {
    top: computeRhythmMetrics(topVideos),
    bottom: computeRhythmMetrics(bottomVideos),
  };
}

// B.3 — CTA formula detection
const CTA_FORMULAS = [
  { name: '"lo único que tenés" + comenta', pattern: /lo\s+único\s+que\s+(tenés|tienes).*comenta/i },
  { name: '"solamente comenta"', pattern: /solamente\s+comenta/i },
  { name: '"comenta" + "te envío" + "en menos de un minuto"', pattern: /comenta.*te\s+(envío|mando).*en\s+menos\s+de\s+un\s+minuto/i },
  { name: '"si querés" + comenta + "en menos de"', pattern: /si\s+(querés|quieres).*comenta.*en\s+menos/i },
  { name: '"comenta" SIN "en menos de"', pattern: /comenta/i, exclude: /en\s+menos\s+de/i },
];

const ctaFormulaStats = [];
if (hasTranscripts) {
  for (const formula of CTA_FORMULAS) {
    const matching = transcribedWithCLR.filter(v => {
      const match = formula.pattern.test(v.transcript);
      if (formula.exclude) return match && !formula.exclude.test(v.transcript);
      return match;
    });
    if (matching.length > 0) {
      ctaFormulaStats.push({
        formula: formula.name,
        count: matching.length,
        avg_clr: round2(avg(matching.map(v => v.clr))),
      });
    }
  }
  ctaFormulaStats.sort((a, b) => b.avg_clr - a.avg_clr);
}

// B.4 — "comenta" repetition vs CLR
const comentaRepetitionStats = [];
if (hasTranscripts) {
  const buckets = { "0 veces": [], "1 vez": [], "2 veces": [], "3+ veces": [] };
  for (const v of transcribedWithCLR) {
    const count = countOccurrences(v.transcript, "comenta") + countOccurrences(v.transcript, "comentá");
    const key = count === 0 ? "0 veces" : count === 1 ? "1 vez" : count === 2 ? "2 veces" : "3+ veces";
    buckets[key].push(v.clr);
  }
  for (const [key, clrs] of Object.entries(buckets)) {
    comentaRepetitionStats.push({
      repetitions: key,
      count: clrs.length,
      avg_clr: round2(avg(clrs)),
    });
  }
}

// ──────────────────────────────────────────
// C. CAPTION PATTERNS
// ──────────────────────────────────────────
console.log("  Analizando patrones de caption...");

function captionWordCountClean(caption) {
  return (caption || "").replace(/#\w+/g, "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

// C.1 — Caption length × CLR (all posts)
const captionLengthBuckets = {};
for (const p of allPostsWithCLR) {
  const wc = captionWordCountClean(p.caption);
  const bucket = wc <= 10 ? "1-10" : wc <= 20 ? "11-20" : wc <= 35 ? "21-35" : wc <= 60 ? "36-60" : "60+";
  if (!captionLengthBuckets[bucket]) captionLengthBuckets[bucket] = { count: 0, clrs: [], order: wc <= 10 ? 1 : wc <= 20 ? 2 : wc <= 35 ? 3 : wc <= 60 ? 4 : 5 };
  captionLengthBuckets[bucket].count++;
  captionLengthBuckets[bucket].clrs.push(p.clr);
}

const captionLengthTable = Object.entries(captionLengthBuckets)
  .map(([bucket, d]) => ({ bucket, count: d.count, avg_clr: round2(avg(d.clrs)), order: d.order }))
  .sort((a, b) => a.order - b.order);

// C.2 — Caption features × CLR (top vs bottom quartile of ALL posts)
const topNAll = Math.max(1, Math.floor(allPostsWithCLR.length * topPct / 100));
const topAllPosts = allPostsWithCLR.slice(0, topNAll);
const bottomAllPosts = allPostsWithCLR.slice(-topNAll);

function captionFeaturePct(posts, testFn) {
  if (!posts.length) return "0%";
  const match = posts.filter(p => testFn(p.caption || "")).length;
  return round2(match / posts.length * 100) + "%";
}

const captionFeatures = [
  { feature: 'Tiene "comenta/comentá"', test: c => /(comenta|comentá)/i.test(c) },
  { feature: "Tiene emoji", test: c => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(c) },
  { feature: "Tiene hashtag", test: c => /#\w+/.test(c) },
  { feature: "Tiene pregunta", test: c => /\?/.test(c) },
  { feature: "Tiene exclamación", test: c => /!/.test(c) },
  { feature: 'Menciona DM/mensaje', test: c => /(dm|mensaje|privado|directo)/i.test(c) },
  { feature: "Largo <= 15 palabras", test: c => captionWordCountClean(c) <= 15 },
];

const captionFeatureTable = captionFeatures.map(f => ({
  feature: f.feature,
  top_pct: captionFeaturePct(topAllPosts, f.test),
  bottom_pct: captionFeaturePct(bottomAllPosts, f.test),
}));

// C.3 — Caption avg word count top vs bottom
const captionWordCountTop = round2(avg(topAllPosts.map(p => captionWordCountClean(p.caption))));
const captionWordCountBottom = round2(avg(bottomAllPosts.map(p => captionWordCountClean(p.caption))));

// C.4 — "Comenta X" keyword extraction
const ctaKeywordStats = {};
for (const p of allPostsWithCLR) {
  const caption = (p.caption || "").toLowerCase();
  // Match "comenta X" or "comentá X"
  const matches = caption.match(/(?:comenta|comentá)\s+[""]?(\w+)[""]?/gi) || [];
  for (const m of matches) {
    const kw = m.replace(/^(comenta|comentá)\s+[""]?/i, "").replace(/[""]$/, "").toUpperCase();
    if (kw.length < 2) continue;
    if (!ctaKeywordStats[kw]) ctaKeywordStats[kw] = { count: 0, clrs: [] };
    ctaKeywordStats[kw].count++;
    ctaKeywordStats[kw].clrs.push(p.clr);
  }
}

const ctaKeywordTable = Object.entries(ctaKeywordStats)
  .map(([kw, d]) => ({ keyword: kw, uses: d.count, avg_clr: round2(avg(d.clrs)) }))
  .sort((a, b) => b.avg_clr - a.avg_clr);

// ──────────────────────────────────────────
// D. POST TYPE PATTERNS
// ──────────────────────────────────────────
console.log("  Analizando patrones por tipo de post...");

const postTypeStats = {
  video: {
    count: videos.length,
    avg_likes: Math.round(avg(videos.map(p => p.likes || 0))),
    avg_comments: Math.round(avg(videos.map(p => p.comments || 0))),
    avg_views: Math.round(avg(videos.filter(p => p.views > 0).map(p => p.views))),
    avg_clr: round2(avg(videos.map(p => p.clr))),
  },
  sidecar: {
    count: sidecars.length,
    avg_likes: Math.round(avg(sidecars.map(p => p.likes || 0))),
    avg_comments: Math.round(avg(sidecars.map(p => p.comments || 0))),
    avg_clr: round2(avg(sidecars.map(p => p.clr))),
  },
};

// ──────────────────────────────────────────
// E. SCARCITY/URGENCY PATTERNS
// ──────────────────────────────────────────
const SCARCITY_PHRASES = [
  "se acaba de filtrar", "acaba de", "nuevo", "nueva", "24 horas",
  "lo borro", "limitado", "últimos",
];

const scarcityAnalysis = [];
if (hasTranscripts) {
  for (const phrase of SCARCITY_PHRASES) {
    const topVids = countVideosWithPhrase(topTexts, phrase);
    const bottomVids = countVideosWithPhrase(bottomTexts, phrase);
    const topPctVal = topTexts.length ? round2(topVids / topTexts.length * 100) : 0;
    const bottomPctVal = bottomTexts.length ? round2(bottomVids / bottomTexts.length * 100) : 0;
    if (topVids > 0 || bottomVids > 0) {
      scarcityAnalysis.push({
        phrase,
        top_videos: topVids,
        top_pct: topPctVal + "%",
        bottom_videos: bottomVids,
        bottom_pct: bottomPctVal + "%",
      });
    }
  }
}

// ──────────────────────────────────────────
// F. OBJECTION HANDLING PATTERNS
// ──────────────────────────────────────────
const OBJECTION_PHRASES = [
  "completamente gratis", "100% gratis", "no te preocupes",
  "cualquier pelotudo", "es una pelotudez", "nadie me cree",
  "no te va a costar", "sin pagar", "no necesitás",
];

const objectionAnalysis = [];
if (hasTranscripts) {
  for (const phrase of OBJECTION_PHRASES) {
    const topCount = countPhraseInTexts(topTexts, phrase);
    const bottomCount = countPhraseInTexts(bottomTexts, phrase);
    if (topCount > 0 || bottomCount > 0) {
      objectionAnalysis.push({ phrase, top: topCount, bottom: bottomCount });
    }
  }
}

// ──────────────────────────────────────────
// G. REVENUE CLAIMS VS CLR
// ──────────────────────────────────────────
const revenueVsCLR = [];
if (hasTranscripts) {
  const clrBuckets = {};
  for (const v of transcribedWithCLR) {
    const revCount = (v.transcript.toLowerCase().match(/(\$\d|\d+\s*(dólares|pesos|euros|mil|millones?|k\b|usd)|\d+\s+por\s+(día|mes|semana))/g) || []).length;
    const bucket = v.clr < 0.5 ? "0-0.5" : v.clr < 1.0 ? "0.5-1.0" : v.clr < 1.5 ? "1.0-1.5" : v.clr < 2.0 ? "1.5-2.0" : v.clr < 2.5 ? "2.0-2.5" : "2.5+";
    if (!clrBuckets[bucket]) clrBuckets[bucket] = { count: 0, revCounts: [], order: v.clr < 0.5 ? 1 : v.clr < 1.0 ? 2 : v.clr < 1.5 ? 3 : v.clr < 2.0 ? 4 : v.clr < 2.5 ? 5 : 6 };
    clrBuckets[bucket].count++;
    clrBuckets[bucket].revCounts.push(revCount);
  }

  for (const [bucket, d] of Object.entries(clrBuckets)) {
    revenueVsCLR.push({
      clr_range: bucket,
      videos: d.count,
      avg_revenue_claims: round2(avg(d.revCounts)),
      order: d.order,
    });
  }
  revenueVsCLR.sort((a, b) => a.order - b.order);
}

// ──────────────────────────────────────────
// BUILD RESULTS
// ──────────────────────────────────────────
console.log("\n  Generando reportes...");

const results = {
  profile,
  analyzed_at: new Date().toISOString(),
  total_posts: rawPosts.length,
  total_videos: videos.length,
  total_sidecars: sidecars.length,
  total_transcripts: transcripts.length,
  top_pct: topPct,
  top_count: topN,
  top_clr_threshold: topCLRThreshold,
  bottom_clr_threshold: bottomCLRThreshold,

  linguistic: {
    top_only_phrases: topOnlyPhrases,
    killer_phrases: killerPhrases,
    transition_analysis: transitionAnalysis,
    opening_types: openingTypeTable,
    closing_types: closingTypeTable,
    word_frequency_diff: wordDiff,
    enthusiasm_markers: enthusiasmAnalysis,
  },

  structural: {
    duration_vs_clr: durationTable,
    rhythm_top_vs_bottom: rhythmMetrics,
    cta_formulas: ctaFormulaStats,
    comenta_repetition: comentaRepetitionStats,
    revenue_vs_clr: revenueVsCLR,
    scarcity_patterns: scarcityAnalysis,
    objection_patterns: objectionAnalysis,
  },

  caption: {
    length_vs_clr: captionLengthTable,
    features_top_vs_bottom: captionFeatureTable,
    avg_word_count_top: captionWordCountTop,
    avg_word_count_bottom: captionWordCountBottom,
    cta_keywords: ctaKeywordTable,
  },

  post_type: postTypeStats,
};

// ──────────────────────────────────────────
// SAVE JSON
// ──────────────────────────────────────────
const jsonPath = path.join(REF_DIR, `${profile}_auto-patterns.json`);
fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
console.log(`  JSON: ${jsonPath}`);

// ──────────────────────────────────────────
// GENERATE MARKDOWN REPORT
// ──────────────────────────────────────────
let md = `# Micro-Patrones: @${profile} — Análisis Automático\n\n`;
md += `> **Fuente:** ${transcripts.length} transcripciones + ${rawPosts.length} posts scrapeados\n`;
md += `> **Métrica principal:** CLR (Comments / Likes)\n`;
md += `> **Top ${topPct}%:** ${topN} videos con CLR >= ${topCLRThreshold}\n`;
md += `> **Bottom ${topPct}%:** ${bottomN} videos con CLR <= ${bottomCLRThreshold}\n`;
md += `> **Fecha:** ${new Date().toISOString().slice(0, 10)}\n\n`;
md += `---\n\n`;

// 1. Linguistic patterns
md += `## 1. PATRONES LINGÜÍSTICOS\n\n`;

if (topOnlyPhrases.length > 0) {
  md += `### 1.1 Frases que aparecen en TOP ${topPct}% pero NO en BOTTOM ${topPct}%\n\n`;
  md += `| Frase | Videos TOP |\n`;
  md += `|-------|------------|\n`;
  for (const p of topOnlyPhrases.slice(0, 30)) {
    md += `| "${p.phrase}" | ${p.top_videos} videos |\n`;
  }
  md += `\n`;
}

if (killerPhrases.length > 0) {
  md += `### 1.2 Frases "killer" (aparecen en BOTTOM pero NO en TOP)\n\n`;
  md += `| Frase | Videos BOTTOM |\n`;
  md += `|-------|--------------|\n`;
  for (const p of killerPhrases.slice(0, 20)) {
    md += `| "${p.phrase}" | ${p.bottom_videos} videos |\n`;
  }
  md += `\n`;
}

if (openingTypeTable.length > 0) {
  md += `### 1.3 Estructura de apertura vs CLR\n\n`;
  md += `| Tipo de apertura | Videos | CLR promedio | CLR máximo |\n`;
  md += `|------------------|--------|-------------|------------|\n`;
  for (const o of openingTypeTable) {
    md += `| ${o.type} | ${o.count} | **${o.avg_clr}** | ${o.max_clr} |\n`;
  }
  md += `\n`;
}

if (transitionAnalysis.length > 0) {
  md += `### 1.4 Frases de transición: TOP vs BOTTOM\n\n`;
  md += `| Frase | TOP (por video) | BOTTOM (por video) | Diferencia |\n`;
  md += `|-------|----------------|-------------------|------------|\n`;
  for (const t of transitionAnalysis) {
    const topBold = t.top_per_video > t.bottom_per_video ? "**" : "";
    const bottomBold = t.bottom_per_video > t.top_per_video ? "**" : "";
    md += `| "${t.phrase}" | ${topBold}${t.top_per_video}${topBold} | ${bottomBold}${t.bottom_per_video}${bottomBold} | ${t.ratio} |\n`;
  }
  md += `\n`;
}

if (closingTypeTable.length > 0) {
  md += `### 1.5 Cierres de video vs CLR\n\n`;
  md += `| Cierre | Videos | CLR promedio |\n`;
  md += `|--------|--------|-------------|\n`;
  for (const c of closingTypeTable) {
    md += `| ${c.type} | ${c.count} | **${c.avg_clr}** |\n`;
  }
  md += `\n`;
}

if (wordDiff.topDiff.length > 0) {
  md += `### 1.6 Palabras diferenciadoras (HIGH en top, LOW en bottom)\n\n`;
  md += `| Palabra | TOP ${topPct}% | BOTTOM ${topPct}% | Ratio |\n`;
  md += `|---------|---------|------------|-------|\n`;
  for (const w of wordDiff.topDiff) {
    md += `| **"${w.word}"** | ${w.top} | ${w.bottom} | **${w.ratio}** |\n`;
  }
  md += `\n`;
}

if (wordDiff.bottomDiff.length > 0) {
  md += `### 1.7 Palabras "killer" (HIGH en bottom, LOW en top)\n\n`;
  md += `| Palabra | BOTTOM ${topPct}% | TOP ${topPct}% | Ratio |\n`;
  md += `|---------|------------|---------|-------|\n`;
  for (const w of wordDiff.bottomDiff) {
    md += `| **"${w.word}"** | ${w.bottom} | ${w.top} | **${w.ratio}** |\n`;
  }
  md += `\n`;
}

if (enthusiasmAnalysis.length > 0) {
  md += `### 1.8 Marcadores de entusiasmo\n\n`;
  md += `| Frase | TOP ${topPct}% | BOTTOM ${topPct}% |\n`;
  md += `|-------|---------|------------|\n`;
  for (const e of enthusiasmAnalysis) {
    md += `| "${e.phrase}" | **${e.top}** | ${e.bottom} |\n`;
  }
  md += `\n`;
}

// 2. Structural patterns
md += `---\n\n## 2. PATRONES ESTRUCTURALES\n\n`;

if (durationTable.length > 0) {
  md += `### 2.1 Duración vs CLR\n\n`;
  md += `| Rango de duración | Videos | CLR promedio |\n`;
  md += `|-------------------|--------|-------------|\n`;
  for (const d of durationTable) {
    md += `| ${d.bucket} | ${d.count} | **${d.avg_clr}** |\n`;
  }
  md += `\n`;
}

if (rhythmMetrics) {
  md += `### 2.2 Métricas de ritmo: TOP vs BOTTOM\n\n`;
  md += `| Métrica | TOP ${topPct}% | BOTTOM ${topPct}% | Diferencia |\n`;
  md += `|---------|---------|------------|------------|\n`;

  const metrics = [
    ["Duración promedio", `${rhythmMetrics.top.avg_duration}s`, `${rhythmMetrics.bottom.avg_duration}s`],
    ["Palabras promedio", rhythmMetrics.top.avg_words, rhythmMetrics.bottom.avg_words],
    ["Palabras/segundo", rhythmMetrics.top.avg_wps, rhythmMetrics.bottom.avg_wps],
    ["Oraciones/video", rhythmMetrics.top.avg_sentences, rhythmMetrics.bottom.avg_sentences],
    ["Preguntas/video", rhythmMetrics.top.avg_questions, rhythmMetrics.bottom.avg_questions],
    ["Revenue claims/video", rhythmMetrics.top.avg_revenue_claims, rhythmMetrics.bottom.avg_revenue_claims],
    ["Promesas velocidad/facilidad", rhythmMetrics.top.avg_speed_promises, rhythmMetrics.bottom.avg_speed_promises],
    ['"Comenta" por video', rhythmMetrics.top.avg_comenta_count, rhythmMetrics.bottom.avg_comenta_count],
    ["Alternancia corta-larga", rhythmMetrics.top.avg_alternation, rhythmMetrics.bottom.avg_alternation],
  ];

  for (const [name, top, bottom] of metrics) {
    const topVal = typeof top === "number" ? top : top;
    const bottomVal = typeof bottom === "number" ? bottom : bottom;
    let diff = "";
    if (typeof top === "number" && typeof bottom === "number" && bottom > 0) {
      const ratio = round2(top / bottom);
      if (ratio > 1.1) diff = `Top ${round2((ratio - 1) * 100)}% más`;
      else if (ratio < 0.9) diff = `Top ${round2((1 - ratio) * 100)}% menos`;
      else diff = "Similar";
    }
    md += `| ${name} | **${topVal}** | ${bottomVal} | ${diff} |\n`;
  }
  md += `\n`;
}

if (ctaFormulaStats.length > 0) {
  md += `### 2.3 Fórmulas de CTA y su CLR\n\n`;
  md += `| Fórmula | Videos | CLR promedio |\n`;
  md += `|---------|--------|-------------|\n`;
  for (const f of ctaFormulaStats) {
    md += `| ${f.formula} | ${f.count} | **${f.avg_clr}** |\n`;
  }
  md += `\n`;
}

if (comentaRepetitionStats.length > 0) {
  md += `### 2.4 Repetición de "comenta" vs CLR\n\n`;
  md += `| Veces que dice "comenta" | Videos | CLR promedio |\n`;
  md += `|--------------------------|--------|-------------|\n`;
  for (const c of comentaRepetitionStats) {
    md += `| ${c.repetitions} | ${c.count} | **${c.avg_clr}** |\n`;
  }
  md += `\n`;
}

if (revenueVsCLR.length > 0) {
  md += `### 2.5 Revenue claims vs CLR\n\n`;
  md += `| Rango CLR | Videos | Revenue claims/video |\n`;
  md += `|-----------|--------|----------------------|\n`;
  for (const r of revenueVsCLR) {
    md += `| ${r.clr_range} | ${r.videos} | **${r.avg_revenue_claims}** |\n`;
  }
  md += `\n`;
}

// 3. Caption patterns
md += `---\n\n## 3. PATRONES DE CAPTION\n\n`;

if (captionLengthTable.length > 0) {
  md += `### 3.1 Largo de caption vs CLR\n\n`;
  md += `| Palabras | Posts | CLR promedio |\n`;
  md += `|----------|------:|-------------|\n`;
  for (const c of captionLengthTable) {
    md += `| ${c.bucket} | ${c.count} | **${c.avg_clr}** |\n`;
  }
  md += `\n`;
}

md += `### 3.2 Características del caption: TOP vs BOTTOM\n\n`;
md += `| Característica | TOP ${topPct}% | BOTTOM ${topPct}% |\n`;
md += `|----------------|---------|------------|\n`;
for (const f of captionFeatureTable) {
  md += `| ${f.feature} | **${f.top_pct}** | ${f.bottom_pct} |\n`;
}
md += `| **Largo promedio** | **${captionWordCountTop} palabras** | ${captionWordCountBottom} palabras |\n`;
md += `\n`;

if (ctaKeywordTable.length > 0) {
  md += `### 3.3 Keywords de CTA y su CLR\n\n`;
  md += `| Keyword | Usos | CLR promedio |\n`;
  md += `|---------|------|-------------|\n`;
  for (const k of ctaKeywordTable.slice(0, 20)) {
    md += `| **"${k.keyword}"** | ${k.uses} | **${k.avg_clr}** |\n`;
  }
  md += `\n`;
}

// 4. Post type patterns
md += `---\n\n## 4. PATRONES POR TIPO DE POST\n\n`;
md += `| Tipo | Posts | Avg Likes | Avg Comments | Avg CLR |\n`;
md += `|------|-------:|----------:|-------------:|--------:|\n`;
if (postTypeStats.video.count > 0) {
  md += `| Video | ${postTypeStats.video.count} | ${postTypeStats.video.avg_likes.toLocaleString()} | ${postTypeStats.video.avg_comments.toLocaleString()} | **${postTypeStats.video.avg_clr}** |\n`;
}
if (postTypeStats.sidecar.count > 0) {
  md += `| Sidecar | ${postTypeStats.sidecar.count} | ${postTypeStats.sidecar.avg_likes.toLocaleString()} | ${postTypeStats.sidecar.avg_comments.toLocaleString()} | **${postTypeStats.sidecar.avg_clr}** |\n`;
}
md += `\n`;

if (durationTable.length > 0) {
  md += `### 4.1 Duración de videos (buckets de 15s)\n\n`;
  md += `| Duración | Videos | CLR promedio |\n`;
  md += `|----------|--------|-------------|\n`;
  for (const d of durationTable) {
    md += `| ${d.bucket} | ${d.count} | **${d.avg_clr}** |\n`;
  }
  md += `\n`;
}

// 5. Scarcity
if (scarcityAnalysis.length > 0) {
  md += `---\n\n## 5. PATRONES DE URGENCIA/NOVEDAD\n\n`;
  md += `| Frase | TOP ${topPct}% (videos) | TOP % | BOTTOM ${topPct}% (videos) | BOTTOM % |\n`;
  md += `|-------|------------|-------|--------------|----------|\n`;
  for (const s of scarcityAnalysis) {
    md += `| "${s.phrase}" | ${s.top_videos} | ${s.top_pct} | ${s.bottom_videos} | ${s.bottom_pct} |\n`;
  }
  md += `\n`;
}

// 6. Objection handling
if (objectionAnalysis.length > 0) {
  md += `---\n\n## 6. PATRONES DE MANEJO DE OBJECIONES\n\n`;
  md += `| Frase | TOP ${topPct}% | BOTTOM ${topPct}% |\n`;
  md += `|-------|---------|------------|\n`;
  for (const o of objectionAnalysis) {
    md += `| "${o.phrase}" | **${o.top}** | ${o.bottom} |\n`;
  }
  md += `\n`;
}

// 7. Summary table
if (rhythmMetrics) {
  md += `---\n\n## 7. TABLA DE REFERENCIA RÁPIDA\n\n`;
  md += `| Dimensión | TOP ${topPct}% (CLR >= ${topCLRThreshold}) | BOTTOM ${topPct}% (CLR <= ${bottomCLRThreshold}) |\n`;
  md += `|-----------|------|-------|\n`;
  md += `| Duración | ${rhythmMetrics.top.avg_duration}s | ${rhythmMetrics.bottom.avg_duration}s |\n`;
  md += `| Palabras/segundo | ${rhythmMetrics.top.avg_wps} | ${rhythmMetrics.bottom.avg_wps} |\n`;
  md += `| Oraciones/video | ${rhythmMetrics.top.avg_sentences} | ${rhythmMetrics.bottom.avg_sentences} |\n`;
  md += `| Preguntas/video | ${rhythmMetrics.top.avg_questions} | ${rhythmMetrics.bottom.avg_questions} |\n`;
  md += `| Revenue claims/video | ${rhythmMetrics.top.avg_revenue_claims} | ${rhythmMetrics.bottom.avg_revenue_claims} |\n`;
  md += `| Promesas velocidad | ${rhythmMetrics.top.avg_speed_promises} | ${rhythmMetrics.bottom.avg_speed_promises} |\n`;
  md += `| "Comenta" por video | ${rhythmMetrics.top.avg_comenta_count} | ${rhythmMetrics.bottom.avg_comenta_count} |\n`;
  md += `| Alternancia corta-larga | ${rhythmMetrics.top.avg_alternation} | ${rhythmMetrics.bottom.avg_alternation} |\n`;
  md += `| Caption largo promedio | ${captionWordCountTop} | ${captionWordCountBottom} |\n`;
  md += `\n`;
}

md += `---\n\n`;
md += `> **Nota metodológica:** Este análisis se generó automáticamente con \`ig-micro-patterns.mjs\`. CLR = Comments/Likes (ratio, no porcentaje). `;
md += `Top/Bottom split al ${topPct}% por CLR. Las frases diferenciadoras cuentan apariciones por VIDEO (no por ocurrencia total) para evitar que un video repetitivo distorsione.\n`;

// Save markdown
const mdPath = path.join(REF_DIR, `${profile}_auto-patterns.md`);
fs.writeFileSync(mdPath, md);
console.log(`  Markdown: ${mdPath}`);

// ──────────────────────────────────────────
// Console summary
// ──────────────────────────────────────────
console.log(`\n  === @${profile} — Resumen de micro-patrones ===`);
console.log(`  Posts: ${rawPosts.length} (${videos.length} videos, ${sidecars.length} sidecars)`);
console.log(`  Transcripciones: ${transcripts.length}`);
console.log(`  Top ${topPct}% CLR: >= ${topCLRThreshold} (${topN} videos)`);
console.log(`  Bottom ${topPct}% CLR: <= ${bottomCLRThreshold} (${bottomN} videos)`);

if (topOnlyPhrases.length > 0) {
  console.log(`\n  TOP frases exclusivas: ${topOnlyPhrases.slice(0, 5).map(p => `"${p.phrase}" (${p.top_videos})`).join(", ")}`);
}
if (killerPhrases.length > 0) {
  console.log(`  KILLER frases: ${killerPhrases.slice(0, 5).map(p => `"${p.phrase}" (${p.bottom_videos})`).join(", ")}`);
}

if (rhythmMetrics) {
  console.log(`\n  Duración: TOP ${rhythmMetrics.top.avg_duration}s vs BOTTOM ${rhythmMetrics.bottom.avg_duration}s`);
  console.log(`  WPS: TOP ${rhythmMetrics.top.avg_wps} vs BOTTOM ${rhythmMetrics.bottom.avg_wps}`);
  console.log(`  Preguntas/video: TOP ${rhythmMetrics.top.avg_questions} vs BOTTOM ${rhythmMetrics.bottom.avg_questions}`);
}

console.log(`\n  Archivos generados:`);
console.log(`    ${jsonPath}`);
console.log(`    ${mdPath}`);
console.log(`\nListo.`);
