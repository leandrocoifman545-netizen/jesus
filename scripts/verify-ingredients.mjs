#!/usr/bin/env node
/**
 * Verifies that ingredients declared in a story sequence JSON are REAL
 * (textually present in their declared source files) — not invented.
 *
 * Usage: node scripts/verify-ingredients.mjs path/to/story.json
 *
 * Expected JSON structure (Fase 3 standard — 2026-04-15):
 *   {
 *     "ingredients": {
 *       "E1": [{"text": "frase textual", "source": "stories-core/03-inteligencia-compradores.md", "line": 287, "story_number": 4, "used_as": "text_on_screen"}],
 *       "E2": [{"text": "DM textual", "source": "stories-core/03-inteligencia-compradores.md", "category": "confianza"}],
 *       "E3": [{"text": "quote Jesús", "source": ".memory/jesus-historia.md", "line": 86}]
 *     },
 *     ...
 *   }
 *
 * Exits 0 if all ingredients verified (may have warnings for optional fields).
 * Exits 1 if any ingredient is NOT found textually in its source (invention detected).
 */
import { readFileSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const ALLOWED_ROOTS = [
  "stories-core/",
  ".data/stories-core/",
  "/Users/lean/Documents/script-generator/.data/stories-core/",
  ".memory/",
  "/Users/lean/Documents/script-generator/.memory/",
];

// ── Input handling ──
let input;
if (process.argv[2]) {
  input = readFileSync(process.argv[2], "utf-8");
} else {
  input = readFileSync("/dev/stdin", "utf-8");
}

const data = JSON.parse(input);
const warnings = [];
const errors = [];

// ── 0. Campo ingredients obligatorio ──
if (!data.ingredients) {
  errors.push("Campo 'ingredients' no presente en el JSON. Sin ingredientes declarados no hay verificación posible — el modelo generó sin ancla.");
  reportAndExit();
}

// ── 1. Normalización de texto para match tolerante ──
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u2032']/g, "'")           // comillas simples tipográficas
    .replace(/[\u201C\u201D\u2033"]/g, '"')           // comillas dobles tipográficas
    .replace(/\s+/g, " ")                             // espacios múltiples → 1
    .replace(/[.,;:!?¡¿\-–—]/g, " ")                  // puntuación → espacio
    .replace(/\s+/g, " ")                             // re-colapsar
    .trim();
}

// ── 2. Resolver path de fuente ──
function resolveSourcePath(source) {
  if (source.startsWith("/")) return source;  // absolute
  if (source.startsWith(".data/") || source.startsWith(".memory/")) {
    return join(PROJECT_ROOT, source);
  }
  if (source.startsWith("stories-core/")) {
    return join(PROJECT_ROOT, ".data", source);
  }
  // Fallback: assume it's relative to .data/
  return join(PROJECT_ROOT, ".data", source);
}

// ── 3. Validar que fuente está en lista permitida ──
function isSourceAllowed(source) {
  return ALLOWED_ROOTS.some(root => source.includes(root));
}

// ── 4. Cache de archivos leídos para no releer ──
const fileCache = new Map();

function readSource(source) {
  const path = resolveSourcePath(source);
  if (fileCache.has(path)) return fileCache.get(path);
  if (!existsSync(path)) {
    fileCache.set(path, null);
    return null;
  }
  try {
    const content = readFileSync(path, "utf-8");
    fileCache.set(path, content);
    return content;
  } catch {
    fileCache.set(path, null);
    return null;
  }
}

// ── 5. Buscar frase textual en fuente ──
function textExistsIn(text, source, paraphrased = false) {
  const content = readSource(source);
  if (content === null) {
    return { found: false, reason: "source-not-found" };
  }
  const normalizedContent = normalize(content);
  const normalizedText = normalize(text);
  if (normalizedContent.includes(normalizedText)) {
    return { found: true };
  }
  // Si paraphrased=true, buscar solo palabras clave (mín 60% de palabras >3 chars presentes)
  if (paraphrased) {
    const words = normalizedText.split(" ").filter(w => w.length > 3);
    const matched = words.filter(w => normalizedContent.includes(w));
    if (words.length > 0 && matched.length / words.length >= 0.6) {
      return { found: true, partial: true };
    }
  }
  return { found: false, reason: "text-not-found" };
}

// ── 6. Verificar cada ingrediente ──
function verifyIngredientList(key, list, requireSource = true) {
  if (!list) return;
  if (!Array.isArray(list)) {
    // Algunos ingredientes son singulares (E4, E5, E6) — normalizar a array
    list = [list];
  }
  list.forEach((item, idx) => {
    const label = `${key}[${idx}]`;
    if (typeof item === "string") {
      // Ingrediente simple sin estructura — solo recomendación
      warnings.push(`${label}: formato legacy (string simple). Recomendado: {"text": "...", "source": "..."}`);
      return;
    }
    if (!item || typeof item !== "object") {
      errors.push(`${label}: formato inválido — debe ser objeto con {text, source}`);
      return;
    }
    if (!item.text) {
      // E4/E6/E7/E8/E9 pueden ser puramente descriptivos sin texto literal
      if (!["E4", "E5", "E6", "E7", "E8", "E9"].includes(key)) {
        errors.push(`${label}: falta campo 'text' (texto literal del ingrediente)`);
      }
      return;
    }
    if (!item.source && requireSource) {
      errors.push(`${label}: falta campo 'source' (archivo fuente). Sin fuente no se puede verificar — es invención por defecto.`);
      return;
    }
    // Chequear fuente permitida
    if (item.source && !isSourceAllowed(item.source)) {
      warnings.push(`${label}: fuente "${item.source}" NO está en stories-core/ ni .memory/. Fuentes permitidas: ${ALLOWED_ROOTS.slice(0, 2).join(", ")}`);
    }
    // Si es solo E4-E9 descriptivo, no chequear match textual
    if (["E4", "E6", "E7", "E8", "E9"].includes(key)) {
      return;
    }
    // Chequear match textual
    const result = textExistsIn(item.text, item.source, item.paraphrased === true);
    if (!result.found) {
      if (result.reason === "source-not-found") {
        errors.push(`${label}: fuente "${item.source}" no existe o no se puede leer`);
      } else {
        errors.push(
          `${label}: frase "${truncate(item.text, 60)}" NO encontrada textualmente en ${item.source}. ` +
          `Si es cita parafraseada, marcar "paraphrased": true.`
        );
      }
    } else if (result.partial) {
      warnings.push(`${label}: match parcial (paraphrased) en ${item.source} — revisar fidelidad`);
    }
  });
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}

// Verificar cada tipo de ingrediente
const ing = data.ingredients;
verifyIngredientList("E1", ing.E1);  // Frases textuales de compradores
verifyIngredientList("E2", ing.E2);  // DMs reales
verifyIngredientList("E3", ing.E3);  // Anécdotas Jesús
verifyIngredientList("E4", ing.E4, false);  // Técnicas visuales (descriptivas)
verifyIngredientList("E5", ing.E5, false);  // Arco emocional
verifyIngredientList("E6", ing.E6, false);  // Winner pattern
verifyIngredientList("E7", ing.E7, false);  // Técnica creador
verifyIngredientList("E8", ing.E8, false);  // Axioma
verifyIngredientList("E9", ing.E9, false);  // Template Naffe

// ── 7. Mínimos obligatorios ──
function countItems(v) {
  if (!v) return 0;
  if (Array.isArray(v)) return v.filter(x => x && (typeof x === "string" || x.text)).length;
  return v.text ? 1 : 0;
}

const minE1 = 2;  // mínimo 2 frases textuales
const minE2 = data.cta?.type === "inbound" ? 2 : 0;  // mínimo 2 DMs si hay CTA
const minE3 = 1;  // mínimo 1 anécdota (o N/A documentado)

if (countItems(ing.E1) < minE1) {
  errors.push(`E1: solo ${countItems(ing.E1)} frase(s) textual(es) — mínimo ${minE1} requerido (2-3 por secuencia según Paso 1b)`);
}
if (minE2 > 0 && countItems(ing.E2) < minE2) {
  warnings.push(`E2: solo ${countItems(ing.E2)} DM(s) — mínimo ${minE2} recomendado para CTA con R14 doble CTA`);
}
if (countItems(ing.E3) < minE3 && !ing.E3_not_applicable) {
  warnings.push(`E3: solo ${countItems(ing.E3)} anécdota(s) — mínimo ${minE3} recomendado (o documentar "E3_not_applicable": "razón")`);
}

// ── 8. Verificar contra plan activo (si existe) ──
if (data.week || data.planned_day) {
  const weekMatch = data.week || extractWeekFromId(data.id);
  if (weekMatch) {
    const planPath = join(PROJECT_ROOT, ".data", "plans-stories", `semana-${weekMatch}`, "plan.md");
    if (existsSync(planPath)) {
      const planContent = readFileSync(planPath, "utf-8");
      const hasMenu = /## Menú de ingredientes por secuencia/i.test(planContent);
      if (hasMenu) {
        // Para cada E1 declarada, chequear que aparezca en el plan
        (ing.E1 || []).forEach((item, idx) => {
          if (!item?.text) return;
          if (!normalize(planContent).includes(normalize(item.text))) {
            warnings.push(
              `E1[${idx}]: frase "${truncate(item.text, 50)}" no aparece en el menú del plan.md de la semana. ` +
              `¿Se eligió fuera del menú? Verificar que esté en una de las categorías permitidas.`
            );
          }
        });
      } else {
        warnings.push(`Plan.md de la semana ${weekMatch} existe pero NO tiene sección "Menú de ingredientes". Fase 2 del sistema no aplicada a este plan.`);
      }
    }
  }
}

function extractWeekFromId(id) {
  if (!id) return null;
  const m = id.match(/semana-?(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// ── 9. Test de genericidad (qualitative) ──
const genericPhrases = [
  "no sos el único",
  "te mereces algo mejor",
  "creé en vos",
  "creé en ti",
  "el futuro es tuyo",
  "todo es posible",
  "vos podés",
];
const allIngText = [
  ...(ing.E1 || []),
  ...(ing.E3 || []),
].map(i => i?.text || "").join(" ").toLowerCase();
const foundGeneric = genericPhrases.filter(p => allIngText.includes(p));
if (foundGeneric.length > 0) {
  warnings.push(`Frases genéricas motivacionales detectadas en ingredientes: ${foundGeneric.join(", ")}. Ingredientes reales de compradores son ESPECÍFICOS, no motivacionales.`);
}

// ── Output ──
reportAndExit();

function reportAndExit() {
  console.log("\n🔬 VERIFICACIÓN DE INGREDIENTES\n");
  console.log(`ID: ${data.id || "?"}`);
  console.log(`Tipo: ${data.sequence_type || "?"}`);
  if (data.ingredients) {
    console.log(`E1 declarados: ${countItems(data.ingredients.E1)} | E2: ${countItems(data.ingredients.E2)} | E3: ${countItems(data.ingredients.E3)}`);
  }
  console.log("");

  if (warnings.length === 0 && errors.length === 0) {
    console.log("✅ Todos los ingredientes verificados textualmente en sus fuentes.\n");
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING(S):`);
    for (const w of warnings) console.log(`   ⚠️  ${w}`);
    console.log("");
  }

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} ERROR(ES) — INGREDIENTES NO VERIFICADOS (posible invención):`);
    for (const e of errors) console.log(`   ❌ ${e}`);
    console.log("");
    console.log("💡 Acciones posibles:");
    console.log("   1. Si la frase es TEXTUAL: corregir el campo 'text' para que coincida con el archivo fuente");
    console.log("   2. Si es cita parafraseada: agregar 'paraphrased': true al ingrediente");
    console.log("   3. Si es invención: reemplazar por frase real del núcleo stories-core/\n");
    process.exit(1);
  }

  console.log("✅ Verificado (con warnings no bloqueantes).\n");
  process.exit(0);
}
