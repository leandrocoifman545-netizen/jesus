#!/usr/bin/env node
/**
 * Validates hooks/leads against structural patterns and existing hooks.
 *
 * Two modes:
 *   1. Piped JSON: echo '{"hooks":[...]}' | node scripts/validate-hooks.mjs
 *   2. Module: import { validateHooks } from './validate-hooks.mjs'
 *
 * Returns errors (block save) and warnings (save but flag).
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GENERATIONS_DIR = join(DATA_DIR, "generations");

// ── Text normalization (strip accents for regex matching) ──
function normalizeForRegex(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿¡"""''`]/g, "");
}

// ── Banned structural patterns ──
// Each pattern has: id, name, regex (case-insensitive), description
// NOTE: regexes match against accent-stripped text
const BANNED_PATTERNS = [
  {
    id: "P1",
    name: "Elogio → vale plata",
    regex: /cuant[ao]s?\s+(veces|amigas?|personas?)\s+(te\s+)?(dijeron|pidieron|preguntaron|dijo|pidio|pregunto)/i,
    description: "\"¿Cuántas veces te dijeron/preguntaron [elogio]?\" — halago genérico + monetización",
  },
  {
    id: "P2",
    name: "Persona + IA → guía → vende",
    // Match: someone asked/used AI to create a guide/product that sells
    regex: /(?:le\s+pidi[oó]|arm[oó]|cre[oó]).*(?:IA|inteligencia artificial).*(?:gu[ií]a|curso|producto|ebook).*(?:vend|gana|cobra)/is,
    description: "\"[Persona] le pidió a la IA que arme... guía... vende\" — arco predecible",
  },
  {
    id: "P3",
    name: "Hora nocturna + hijos duermen",
    regex: /(?:son las|eran las)\s+\d+\s+(?:de la noche|de la ma[ñn]ana).*(?:chicos|hijos|nenes).*(?:dorm|libr|hora)/is,
    description: "\"Son las 10 de la noche. Los chicos durmieron...\" — escena doméstica repetida",
  },
  {
    id: "P4",
    name: "Sabés más que la mayoría",
    regex: /(?:sabes|haces|conoces)\s+mas\s+(?:que|de).*(?:mayoria|99|gente que|libros|ebooks|cursos que se)/is,
    description: "\"Sabés más de X que la mayoría\" — flattery + guilt",
  },
  {
    id: "P5",
    name: "Triple negación de barreras",
    regex: /no\s+necesitas.{5,50}no\s+necesitas.{5,50}no\s+necesitas/is,
    description: "\"No necesitás X. No necesitás Y. No necesitás Z.\" — fórmula reconocible",
  },
  {
    id: "P6",
    name: "¿Cuántos cursos compraste?",
    regex: /cuant[ao]s?\s+cursos?\s+(?:compraste|hiciste|empezaste|pagaste)/i,
    description: "\"¿Cuántos cursos compraste que no terminaste?\" — quemado en RETARGET",
  },
  {
    id: "P7",
    name: "Cada vez más gente busca X",
    regex: /cada\s+vez\s+mas\s+(?:gente|personas?)\s+busc[aa]/i,
    description: "\"Cada vez más gente busca [X] en Google\" — tendencia genérica",
  },
];

// ── Skeleton extraction ──
// Replaces specific nouns/niches with placeholders to compare structure
function extractSkeleton(text) {
  let s = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/["""''`]/g, "")
    .replace(/\d+[\.,]?\d*/g, "[NUM]")  // numbers → [NUM]
    .replace(/\$\s*\[NUM\]/g, "[MONEY]")  // $NUM → [MONEY]
    // Common nicho nouns → [NICHO]
    .replace(/\b(skincare|costura|crochet|bordado|yoga|meditacion|masajes?|terapias?|jardineria|plantas?|fitness|ejercicio|cocina|recetas?|decoracion|organizacion|limpieza|crianza|ingles|viajes?|fotografia|musica|dibujo|pintura|manualidades|autos?|mecanica|reparacion|plomeria|electricidad|carpinteria)\b/g, "[NICHO]")
    // People names → [NOMBRE]
    .replace(/\b(marta|susana|andrea|juan|carlos|maria|pedro|laura|ana|jorge|pablo)\b/g, "[NOMBRE]")
    // "guia de X" → "guia de [NICHO]"
    .replace(/guia\s+de\s+\w+(\s+\w+)?/g, "guia de [NICHO]")
    // Strip extra whitespace
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

// ── N-gram similarity ──
function getNgrams(text, n = 3) {
  const words = text.split(/\s+/);
  const ngrams = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(" "));
  }
  return ngrams;
}

function jaccardSimilarity(set1, set2) {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// ── Load all existing hooks ──
function loadExistingHooks() {
  const hooks = [];
  if (!existsSync(GENERATIONS_DIR)) return hooks;

  const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
  for (const file of files) {
    try {
      const gen = JSON.parse(readFileSync(join(GENERATIONS_DIR, file), "utf-8"));
      const status = gen.status || "draft";
      const genHooks = gen.script?.hooks || [];
      for (const h of genHooks) {
        const text = h.script_text || h.text || "";
        if (text.length > 10) {
          hooks.push({
            text,
            hookType: h.hook_type || h.hookType || "unknown",
            generationId: gen.id?.slice(0, 8),
            status,
            niche: gen.script?.niche || "?",
            skeleton: extractSkeleton(text),
          });
        }
      }
    } catch { /* skip */ }
  }
  return hooks;
}

// ── Main validation ──
export function validateHooks(newHooks, options = {}) {
  const { skipExistingCheck = false, excludeGenerationId = null } = options;
  const errors = [];
  const warnings = [];

  // 1. Check against banned structural patterns (normalized = no accents)
  for (const hook of newHooks) {
    const text = hook.script_text || hook.text || "";
    const normalized = normalizeForRegex(text);
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.regex.test(normalized)) {
        errors.push({
          hookVariant: hook.variant_number,
          hookText: text.slice(0, 80),
          patternId: pattern.id,
          patternName: pattern.name,
          message: `Hook ${hook.variant_number} matchea patrón prohibido ${pattern.id}: ${pattern.name}. ${pattern.description}`,
        });
      }
    }
  }

  // 2. Check structural similarity against existing hooks
  if (!skipExistingCheck) {
    const existingHooks = loadExistingHooks();
    const SIMILARITY_ERROR_THRESHOLD = 0.55;   // >55% = ERROR (very similar skeleton)
    const SIMILARITY_WARN_THRESHOLD = 0.40;    // >40% = WARNING (somewhat similar)

    for (const hook of newHooks) {
      const text = hook.script_text || hook.text || "";
      const newSkeleton = extractSkeleton(text);
      const newNgrams = getNgrams(newSkeleton);

      if (newNgrams.size < 3) continue; // too short to compare

      let highestSimilarity = 0;
      let mostSimilar = null;

      for (const existing of existingHooks) {
        // Skip self-comparison (same generation)
        if (excludeGenerationId && existing.generationId === excludeGenerationId.slice(0, 8)) continue;
        // Skip exact text matches (same hook already saved)
        if (existing.text === text) continue;
        const existingNgrams = getNgrams(existing.skeleton);
        const sim = jaccardSimilarity(newNgrams, existingNgrams);

        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          mostSimilar = existing;
        }
      }

      if (highestSimilarity >= SIMILARITY_ERROR_THRESHOLD && mostSimilar) {
        errors.push({
          hookVariant: hook.variant_number,
          hookText: text.slice(0, 80),
          similarTo: mostSimilar.text.slice(0, 80),
          similarityScore: Math.round(highestSimilarity * 100),
          generationId: mostSimilar.generationId,
          niche: mostSimilar.niche,
          message: `Hook ${hook.variant_number} es ${Math.round(highestSimilarity * 100)}% similar a un hook existente de "${mostSimilar.niche}" (${mostSimilar.generationId}). Cambiar el mecanismo emocional, no solo el nicho.`,
        });
      } else if (highestSimilarity >= SIMILARITY_WARN_THRESHOLD && mostSimilar) {
        warnings.push({
          hookVariant: hook.variant_number,
          hookText: text.slice(0, 80),
          similarTo: mostSimilar.text.slice(0, 80),
          similarityScore: Math.round(highestSimilarity * 100),
          message: `Hook ${hook.variant_number} tiene ${Math.round(highestSimilarity * 100)}% similitud con hook de "${mostSimilar.niche}". Revisar que el mecanismo emocional sea distinto.`,
        });
      }
    }
  }

  // 3. Check intra-batch diversity (hooks within same generation shouldn't share structure)
  if (newHooks.length >= 3) {
    const skeletons = newHooks.map(h => extractSkeleton(h.script_text || h.text || ""));
    for (let i = 0; i < skeletons.length; i++) {
      for (let j = i + 1; j < skeletons.length; j++) {
        const sim = jaccardSimilarity(getNgrams(skeletons[i]), getNgrams(skeletons[j]));
        if (sim > 0.45) {
          warnings.push({
            hookVariant: `${newHooks[i].variant_number} vs ${newHooks[j].variant_number}`,
            message: `Hooks ${newHooks[i].variant_number} y ${newHooks[j].variant_number} del mismo guion son ${Math.round(sim * 100)}% similares entre sí. Diversificar mecanismo emocional.`,
          });
        }
      }
    }
  }

  return { errors, warnings, bannedPatternsChecked: BANNED_PATTERNS.length };
}

// ── CLI mode ──
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  let input;
  if (process.argv[2]) {
    input = readFileSync(process.argv[2], "utf-8");
  } else {
    input = readFileSync("/dev/stdin", "utf-8");
  }

  const data = JSON.parse(input);
  const hooks = data.hooks || data.script?.hooks || [];

  if (hooks.length === 0) {
    console.error("No hooks found in input");
    process.exit(1);
  }

  const result = validateHooks(hooks);

  if (result.errors.length > 0) {
    console.error("\n❌ HOOKS CON PATRONES PROHIBIDOS O MUY SIMILARES:");
    result.errors.forEach(e => console.error(`  - ${e.message}`));
  }
  if (result.warnings.length > 0) {
    console.error("\n⚠️  HOOKS A REVISAR:");
    result.warnings.forEach(w => console.error(`  - ${w.message}`));
  }
  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.error("✅ Hooks OK — sin patrones prohibidos ni repeticiones estructurales");
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.errors.length > 0 ? 1 : 0);
}
