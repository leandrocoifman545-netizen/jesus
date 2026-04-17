#!/usr/bin/env node
/**
 * check-big-idea.mjs — Detecta si una big idea candidata repite algo ya generado.
 *
 * Uso:
 *   node scripts/check-big-idea.mjs "big idea candidata"
 *   node scripts/check-big-idea.mjs "big idea" --old "creencia vieja" --new "creencia nueva"
 *
 * Compara contra: title + big_idea + belief_change.{old, new, mechanism} de
 * todas las generaciones en `.data/generations/`.
 *
 * Si se pasan --old/--new, hace comparación ESPECÍFICA de creencia contra creencia
 * (belief-vs-belief Jaccard), que captura similitud conceptual aunque cambien
 * las palabras y el nicho. Bloquea si la creencia vieja ya fue destruida antes.
 *
 * Verdict: forbidden | block | warn | ok.
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PATTERN_PHRASES, FORBIDDEN_ANGLES, STOPWORDS as SHARED_STOPWORDS, matchedPatterns as sharedMatched, matchedForbidden } from "./lib/text-patterns.mjs";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GEN_DIR = join(DATA_DIR, "generations");

const STOPWORDS = SHARED_STOPWORDS.size > 0 ? SHARED_STOPWORDS : new Set([
  "de","la","el","en","y","a","los","del","las","un","por","con","no","una","su",
  "para","es","al","lo","como","más","o","pero","sus","le","ya","que","este","sí",
  "porque","esta","entre","cuando","muy","sin","sobre","también","me","hasta","hay",
  "donde","quien","desde","todo","nos","durante","todos","uno","les","ni","contra",
  "otros","ese","eso","había","ante","ellos","e","esto","mí","antes","algunos",
  "qué","unos","yo","otro","otras","otra","él","tanto","esa","estos","mucho",
  "quienes","nada","muchos","cual","poco","ella","estar","estas","algunas","algo",
  "nosotros","mi","mis","tú","te","ti","tu","tus","ellas","nosotras","vosotros",
  "vosotras","os","mío","mía","míos","mías","tuyo","tuya","tuyos","tuyas","suyo",
  "suya","suyos","suyas","nuestro","nuestra","nuestros","nuestras","vuestro",
  "vuestra","vuestros","vuestras","esos","esas","estoy","estás","está","estamos",
  "están","esté","estés","estemos","estén","estaré","estarás","estará","estaremos",
  "estarán","estaría","estarías","estaríamos","estarían","estaba","estabas","estaba",
  "estábamos","estaban","estuve","estuviste","estuvo","estuvimos","estuvieron",
  "estuviera","estuvieras","estuviéramos","estuvieran","estuviese","estuvieses",
  "estuviésemos","estuviesen","estando","estado","estada","estados","estadas",
  "he","has","ha","hemos","han","haya","hayas","hayamos","hayan","habré","habrás",
  "habrá","habremos","habrán","habría","habrías","habríamos","habrían","había",
  "habías","habíamos","habían","hube","hubiste","hubo","hubimos","hubieron",
  "soy","eres","es","somos","son","sea","seas","seamos","sean","seré","serás",
  "será","seremos","serán","sería","serías","seríamos","serían","era","eras",
  "éramos","eran","fui","fuiste","fue","fuimos","fueron","fuera","fueras",
  "fuéramos","fueran","siendo","sido","tengo","tienes","tiene","tenemos","tienen",
  "tenga","tengas","tengamos","tengan","tendré","tendrás","tendrá","tendremos",
  "tendrán","tendría","tendrías","tendríamos","tendrían","tenía","tenías","teníamos",
  "tenían","tuve","tuviste","tuvo","tuvimos","tuvieron","ser","haber","tener",
  "hacer","estar","poder","decir","ir","ver","dar","saber","querer","cosas","cosa",
  "así","cada","bien","sólo","solo","gran","unos","unas",
]);

// PATTERN_PHRASES ahora viven en ./lib/text-patterns.mjs (fuente única).

// Stopwords adicionales para trigramas/bigramas (ignorar conectores comunes al comparar frases)
const PHRASE_STOPS = new Set([
  "que","para","pero","cuando","desde","hasta","sobre","entre","bajo","como",
  "antes","donde","porque","aunque","mientras","hace","hacés","hacer","sabés","sabes",
  "tenés","tiene","tienen","tener","sos","son","voy","vas","va","vamos","decir",
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  if (!text) return [];
  return normalize(text).split(" ").filter(w => w.length > 3 && !STOPWORDS.has(w));
}

// Trigramas de palabras significativas (sin stopwords + phrase stops)
function trigrams(text) {
  const tokens = normalize(text).split(" ").filter(w => w.length > 2 && !STOPWORDS.has(w) && !PHRASE_STOPS.has(w));
  const out = [];
  for (let i = 0; i <= tokens.length - 3; i++) out.push(tokens.slice(i, i + 3).join(" "));
  return new Set(out);
}

function bigrams(text) {
  const tokens = normalize(text).split(" ").filter(w => w.length > 2 && !STOPWORDS.has(w) && !PHRASE_STOPS.has(w));
  const out = [];
  for (let i = 0; i <= tokens.length - 2; i++) out.push(tokens.slice(i, i + 2).join(" "));
  return new Set(out);
}

function jaccard(aSet, bSet) {
  if (aSet.size === 0 || bSet.size === 0) return 0;
  let inter = 0;
  for (const t of aSet) if (bSet.has(t)) inter++;
  const union = aSet.size + bSet.size - inter;
  return union === 0 ? 0 : inter / union;
}

const matchedPatterns = sharedMatched;

// ── Parse argv (soporta --old "..." --new "...") ──
function parseArgs(argv) {
  const args = { positional: [], old: "", new: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--old" || a === "--old-belief") { args.old = argv[++i] || ""; continue; }
    if (a === "--new" || a === "--new-belief") { args.new = argv[++i] || ""; continue; }
    args.positional.push(a);
  }
  return args;
}

const parsed = parseArgs(process.argv.slice(2));
const candidate = parsed.positional.join(" ").trim();
const candOldBelief = parsed.old.trim();
const candNewBelief = parsed.new.trim();

if (!candidate) {
  console.error("Uso: node scripts/check-big-idea.mjs \"big idea\" [--old \"creencia vieja\"] [--new \"creencia nueva\"]");
  process.exit(2);
}

const candTokens = new Set(tokenize(candidate));
const candPatterns = matchedPatterns(candidate);
// También chequear forbidden contra old/new belief (por si vienen ahí)
const candForbidden = [
  ...matchedForbidden(candidate),
  ...matchedForbidden(candOldBelief),
  ...matchedForbidden(candNewBelief),
].filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i); // dedupe
const candTrigrams = trigrams(candidate);
const candBigrams = bigrams(candidate);

// Tokens/trigramas de creencias (si vinieron)
const candOldTokens = new Set(tokenize(candOldBelief));
const candNewTokens = new Set(tokenize(candNewBelief));
const candOldTrigrams = trigrams(candOldBelief);
const candNewTrigrams = trigrams(candNewBelief);
const hasBeliefs = candOldBelief.length > 0 || candNewBelief.length > 0;

// Short-circuit: si la candidata matchea un ángulo prohibido, nunca pasa.
if (candForbidden.length > 0) {
  const forbiddenResult = {
    candidate,
    verdict: "forbidden",
    reason: candForbidden.map(f => `[${f.id}] ${f.reason}`).join(" | "),
    forbidden_matches: candForbidden.map(f => ({ id: f.id, reason: f.reason })),
    total_compared: 0,
  };
  console.log(JSON.stringify(forbiddenResult, null, 2));
  process.exit(1);
}

let files;
try {
  files = readdirSync(GEN_DIR).filter(f => f.endsWith(".json") && !f.includes(".backup"));
} catch {
  console.error(JSON.stringify({ verdict: "error", reason: "no se pudo leer .data/generations" }));
  process.exit(2);
}

const scored = [];
for (const f of files) {
  let g;
  try { g = JSON.parse(readFileSync(join(GEN_DIR, f), "utf-8")); } catch { continue; }
  const title = g.title || "";
  const bigIdea = g.script?.big_idea || "";
  const niche = g.script?.niche || "";
  const bc = g.script?.belief_change || {};
  const beliefText = [bc.old_belief, bc.mechanism, bc.new_belief].filter(Boolean).join(" ");
  const combined = `${title} ${bigIdea} ${beliefText}`.trim();
  if (!combined) continue;

  const gTokens = new Set(tokenize(combined));
  const j = jaccard(candTokens, gTokens);

  // Bonus por frases-patrón compartidas
  const gPatterns = matchedPatterns(combined);
  const sharedPatternIds = candPatterns.filter(p => gPatterns.some(q => q.id === p.id));
  const patternBonus = sharedPatternIds.reduce((s, p) => s + p.weight, 0);

  // Bonus por trigramas/bigramas compartidos (frase cerrada = copia)
  const gTrigrams = trigrams(combined);
  const gBigrams = bigrams(combined);
  const sharedTrigrams = [...candTrigrams].filter(t => gTrigrams.has(t));
  const sharedBigrams = [...candBigrams].filter(b => gBigrams.has(b));
  const ngramBonus = Math.min(0.45, sharedTrigrams.length * 0.20 + sharedBigrams.length * 0.05);

  // Similitud DIRECTA de creencias (old-vs-old, new-vs-new) — solo si la candidata vino con creencias
  let beliefSim = 0;
  let beliefDetail = null;
  if (hasBeliefs) {
    const gOldTokens = new Set(tokenize(bc.old_belief));
    const gNewTokens = new Set(tokenize(bc.new_belief));
    const gOldTrigrams = trigrams(bc.old_belief);
    const gNewTrigrams = trigrams(bc.new_belief);

    const oldJ = candOldBelief ? jaccard(candOldTokens, gOldTokens) : 0;
    const newJ = candNewBelief ? jaccard(candNewTokens, gNewTokens) : 0;

    const oldSharedTri = [...candOldTrigrams].filter(t => gOldTrigrams.has(t));
    const newSharedTri = [...candNewTrigrams].filter(t => gNewTrigrams.has(t));
    const oldTriBonus = Math.min(0.30, oldSharedTri.length * 0.20);
    const newTriBonus = Math.min(0.30, newSharedTri.length * 0.20);

    const oldSim = Math.min(1, oldJ + oldTriBonus);
    const newSim = Math.min(1, newJ + newTriBonus);
    // Pesar más la creencia vieja (es la que define el guion)
    beliefSim = Math.max(oldSim, newSim * 0.8, (oldSim + newSim) / 2);
    beliefDetail = {
      old_sim: Number(oldSim.toFixed(3)),
      new_sim: Number(newSim.toFixed(3)),
      old_shared_trigrams: oldSharedTri,
      new_shared_trigrams: newSharedTri,
    };
  }

  const score = Math.min(1, j + patternBonus + ngramBonus);
  // Score combinado que prioriza creencia si está disponible
  const combinedScore = hasBeliefs ? Math.max(score, beliefSim * 1.05) : score;

  scored.push({
    id: (g.id || f).slice(0, 8),
    title: title.slice(0, 80),
    big_idea: bigIdea.slice(0, 120),
    niche: niche.slice(0, 60),
    belief_old: (bc.old_belief || "").slice(0, 100),
    belief_new: (bc.new_belief || "").slice(0, 100),
    jaccard: Number(j.toFixed(3)),
    shared_patterns: sharedPatternIds.map(p => p.id),
    shared_trigrams: sharedTrigrams,
    shared_bigrams: sharedBigrams.slice(0, 5),
    text_score: Number(score.toFixed(3)),
    belief_sim: Number(beliefSim.toFixed(3)),
    belief_detail: beliefDetail,
    score: Number(combinedScore.toFixed(3)),
  });
}

scored.sort((a, b) => b.score - a.score);
const top = scored.slice(0, 5);
const topScore = top[0]?.score || 0;

// Contar cuántos guiones existentes comparten CADA patrón detectado en la candidata
const patternSaturation = {};
for (const p of candPatterns) {
  patternSaturation[p.id] = scored.filter(s => s.shared_patterns.includes(p.id)).length;
}
const maxPatternShare = Math.max(0, ...Object.values(patternSaturation));

// Belief saturation: cuántos guiones destruyen una creencia parecida (>=0.35 sim)
const beliefSaturated = hasBeliefs ? scored.filter(s => s.belief_sim >= 0.35).length : 0;
const topBeliefMatch = hasBeliefs ? scored.slice().sort((a, b) => b.belief_sim - a.belief_sim)[0] : null;
const topBeliefSim = topBeliefMatch?.belief_sim || 0;

let verdict = "ok";
let reason = "";

if (topScore >= 0.70) {
  verdict = "block";
  reason = `Score ${topScore.toFixed(2)} — muy similar a "${top[0]?.title}"`;
} else if (hasBeliefs && topBeliefSim >= 0.50) {
  verdict = "block";
  reason = `Creencia casi idéntica a "${topBeliefMatch?.title}" (old: "${topBeliefMatch?.belief_old}") — mismo guion con otro nicho`;
} else if (hasBeliefs && beliefSaturated >= 2) {
  verdict = "block";
  reason = `${beliefSaturated} guiones previos ya destruyen una creencia parecida — territorio conceptual saturado`;
} else if (maxPatternShare >= 3) {
  verdict = "block";
  const pid = Object.entries(patternSaturation).find(([, n]) => n === maxPatternShare)?.[0];
  reason = `Patrón "${pid}" ya aparece en ${maxPatternShare} guiones — saturado`;
} else if (hasBeliefs && topBeliefSim >= 0.35) {
  verdict = "warn";
  reason = `Creencia parecida a "${topBeliefMatch?.title}" (sim ${topBeliefSim.toFixed(2)}) — justificar diferencia`;
} else if (topScore >= 0.50 || maxPatternShare >= 2) {
  verdict = "warn";
  reason = topScore >= 0.50
    ? `Score ${topScore.toFixed(2)} — parecido a "${top[0]?.title}"`
    : `Patrón compartido con ${maxPatternShare} guiones previos`;
} else if (maxPatternShare >= 1) {
  verdict = "warn";
  reason = `Comparte un patrón con un guion previo — revisar`;
}

// Top matches por creencia (si se proveyeron creencias)
const topBeliefMatches = hasBeliefs
  ? scored.slice().sort((a, b) => b.belief_sim - a.belief_sim).slice(0, 5)
  : [];

const result = {
  candidate,
  candidate_old_belief: candOldBelief,
  candidate_new_belief: candNewBelief,
  verdict,
  reason,
  top_score: topScore,
  top_belief_sim: topBeliefSim,
  belief_saturated_count: beliefSaturated,
  matched_patterns_in_candidate: candPatterns.map(p => p.id),
  pattern_saturation: patternSaturation,
  top_matches: top,
  top_belief_matches: topBeliefMatches.map(m => ({
    id: m.id, title: m.title, belief_old: m.belief_old, belief_new: m.belief_new, belief_sim: m.belief_sim,
  })),
  total_compared: scored.length,
};

console.log(JSON.stringify(result, null, 2));
process.exit(verdict === "block" || verdict === "forbidden" ? 1 : 0);
