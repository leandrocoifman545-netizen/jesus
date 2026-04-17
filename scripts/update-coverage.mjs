#!/usr/bin/env node
/**
 * Reconstruye la matriz de cobertura a partir de las generaciones guardadas.
 * También actualiza los ángulos saturados en angulos-expandidos.md.
 *
 * Usage: node scripts/update-coverage.mjs
 * Se puede llamar automáticamente después de cada save-generation.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { PATTERN_PHRASES, matchedPatterns } from "./lib/text-patterns.mjs";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GENERATIONS_DIR = join(DATA_DIR, "generations");

// Mapea variantes cortas/numéricas/legacy a la key canónica de familia.
function normalizeFamily(family) {
  if (!family) return "desconocido";
  const f = String(family).toLowerCase();
  const map = {
    "1": "identidad_situacion", "identidad": "identidad_situacion",
    "2": "oportunidad", "ventana_oportunidad": "oportunidad",
    "3": "contraste_confrontacion", "confrontacion": "contraste_confrontacion",
    "4": "mecanismo_proceso", "mecanismo": "mecanismo_proceso",
    "5": "historia_emocion", "historia": "historia_emocion", "historia_personal": "historia_emocion",
  };
  return map[f] || family;
}

// Acepta ingredients_used como string ("B#23") u objeto ({category, ingredient_number}).
function normalizeIngredient(ing) {
  if (!ing) return null;
  if (typeof ing === "string") {
    const trimmed = ing.trim();
    return trimmed.includes("#") ? trimmed : null;
  }
  if (typeof ing === "object" && ing.category && ing.ingredient_number != null) {
    return `${ing.category}#${ing.ingredient_number}`;
  }
  return null;
}

if (!existsSync(GENERATIONS_DIR)) {
  console.log("No hay directorio de generaciones.");
  process.exit(0);
}

// ── 1. Cargar todas las generaciones ──
const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
const generations = files
  .map(f => { try { return JSON.parse(readFileSync(join(GENERATIONS_DIR, f), "utf-8")); } catch { return null; } })
  .filter(Boolean)
  .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

console.log(`📊 ${generations.length} generaciones cargadas.`);

if (generations.length === 0) {
  console.log("No hay generaciones para analizar.");
  process.exit(0);
}

// ── 2. Extraer datos de cada generación ──
const FAMILIES = [
  "identidad_situacion",
  "oportunidad",
  "contraste_confrontacion",
  "mecanismo_proceso",
  "historia_emocion",
];
const FAMILY_LABELS = {
  identidad_situacion: "1. Identidad y Situación",
  oportunidad: "2. Oportunidad y Tendencia",
  contraste_confrontacion: "3. Contraste y Confrontación",
  mecanismo_proceso: "4. Mecanismo y Proceso",
  historia_emocion: "5. Historia y Emoción",
};

const BODY_TYPES = [
  "demolicion_mito",
  "historia_con_giro",
  "demo_proceso",
  "comparacion_caminos",
  "un_dia_en_la_vida",
  "pregunta_respuesta",
  "analogia_extendida",
  "contraste_emocional",
  "demolicion_alternativas",
  "qa_conversacional",
  "tier_list_rating",
  "trailer_recurso",
  "quiz_comparacion",
];
const BODY_LABELS = {
  demolicion_mito: "1. Demolición de mito",
  historia_con_giro: "2. Historia con giro",
  demo_proceso: "3. Demo/Proceso",
  comparacion_caminos: "4. Comparación caminos",
  un_dia_en_la_vida: "5. Un día en la vida",
  pregunta_respuesta: "6. Pregunta y respuesta",
  analogia_extendida: "7. Analogía extendida",
  contraste_emocional: "8. Contraste emocional",
  demolicion_alternativas: "9. Demolición alternativas ⭐",
  qa_conversacional: "10. Q&A conversacional ⭐",
  tier_list_rating: "11. Tier-list/Rating",
  trailer_recurso: "12. Trailer de recurso",
  quiz_comparacion: "13. Quiz de comparación",
};

const SEGMENTS = ["A", "B", "C", "D"];
const FUNNEL_STAGES = ["TOFU", "MOFU", "RETARGET"];

// Contadores
const familyCounts = {};
const bodyCounts = {};
const segmentCounts = {};
const funnelCounts = {};
const angleCounts = {};     // ángulo específico (1.1, 2.3, etc.)
const leadTypeCounts = {};
const comboCounts = {};     // familia × body_type
const nicheList = [];       // para listar nichos usados
const avatarCounts = {};
const saleCounts = {};

for (const g of generations) {
  const s = g.script || {};
  const family = normalizeFamily(s.angle_family);
  const body = s.body_type || "desconocido";
  const segment = s.segment || "?";
  const funnel = s.funnel_stage || "?";
  const angle = s.angle_specific || "?";
  const avatar = s.avatar || "?";
  const sale = s.model_sale_type || "?";

  familyCounts[family] = (familyCounts[family] || 0) + 1;
  bodyCounts[body] = (bodyCounts[body] || 0) + 1;
  segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
  funnelCounts[funnel] = (funnelCounts[funnel] || 0) + 1;
  angleCounts[angle] = (angleCounts[angle] || 0) + 1;
  avatarCounts[avatar] = (avatarCounts[avatar] || 0) + 1;
  saleCounts[sale] = (saleCounts[sale] || 0) + 1;

  // Combo familia × body
  const comboKey = `${family}|${body}`;
  comboCounts[comboKey] = (comboCounts[comboKey] || 0) + 1;

  // Lead types
  for (const hook of (s.hooks || [])) {
    const type = hook.hook_type;
    if (type) leadTypeCounts[type] = (leadTypeCounts[type] || 0) + 1;
  }

  // Nichos
  if (s.niche) {
    nicheList.push({ niche: s.niche, family, angle, id: g.id?.slice(0, 8) || "?" });
  }
}

// ── 3. Generar matriz de cobertura ──
const r = [];
r.push("# Matriz de Cobertura — Auto-generado");
r.push(`> Fecha: ${new Date().toISOString().slice(0, 10)}`);
r.push(`> Base: ${generations.length} generaciones`);
r.push(`> Este archivo se regenera con: \`node scripts/update-coverage.mjs\``);
r.push("");

// 3a-pre. Últimas generaciones (para copiar a otra terminal)
const LAST_N = 10;
const lastGens = generations.slice(0, LAST_N);
r.push("## Últimas generaciones (no repetir)");
r.push("");
r.push("| ID | Nicho | Familia | Ángulo | Body Type | Fecha |");
r.push("|-----|-------|---------|--------|-----------|-------|");
for (const g of lastGens) {
  const s = g.script || {};
  const id = (g.id || "?").slice(0, 8);
  const niche = s.niche || "?";
  const fam = FAMILY_LABELS[s.angle_family] || s.angle_family || "?";
  const shortFam = fam.replace(/^\d+\.\s*/, "").slice(0, 20);
  const angle = s.angle_specific || "?";
  const body = BODY_LABELS[s.body_type] || s.body_type || "?";
  const shortBody = body.replace(/^\d+\.\s*/, "").slice(0, 22);
  const date = (g.createdAt || "?").slice(0, 10);
  r.push(`| ${id} | ${niche} | ${shortFam} | ${angle} | ${shortBody} | ${date} |`);
}
r.push("");

// 3a. Resumen general
r.push("## Resumen general");
r.push("");
r.push("| Dimensión | Valores usados | Total generaciones |");
r.push("|-----------|---------------|-------------------|");
r.push(`| Familias de ángulo | ${Object.keys(familyCounts).length} / ${FAMILIES.length} | ${generations.length} |`);
r.push(`| Body types | ${Object.keys(bodyCounts).length} / ${BODY_TYPES.length} | ${generations.length} |`);
r.push(`| Segmentos | ${Object.keys(segmentCounts).length} / ${SEGMENTS.length} | ${generations.length} |`);
r.push(`| Funnel stages | ${Object.keys(funnelCounts).length} / ${FUNNEL_STAGES.length} | ${generations.length} |`);
r.push(`| Lead types distintos | ${Object.keys(leadTypeCounts).length} | — |`);
r.push(`| Avatares distintos | ${Object.keys(avatarCounts).length} | — |`);
r.push(`| Ventas del modelo distintas | ${Object.keys(saleCounts).length} | — |`);
r.push("");

// 3b. Familia de ángulo
r.push("## Cobertura por familia de ángulo");
r.push("");
r.push("| Familia | Count | % |");
r.push("|---------|-------|---|");
for (const fam of FAMILIES) {
  const count = familyCounts[fam] || 0;
  const pct = Math.round(count / generations.length * 100);
  const label = FAMILY_LABELS[fam] || fam;
  r.push(`| ${label} | ${count} | ${pct}% |`);
}
// Familias desconocidas
for (const [fam, count] of Object.entries(familyCounts)) {
  if (!FAMILIES.includes(fam)) {
    const pct = Math.round(count / generations.length * 100);
    r.push(`| ❓ ${fam} | ${count} | ${pct}% |`);
  }
}
r.push("");

// 3c. Body types
r.push("## Cobertura por body type");
r.push("");
r.push("| Body Type | Count | % |");
r.push("|-----------|-------|---|");
for (const bt of BODY_TYPES) {
  const count = bodyCounts[bt] || 0;
  const pct = Math.round(count / generations.length * 100);
  const label = BODY_LABELS[bt] || bt;
  r.push(`| ${label} | ${count} | ${pct}% |`);
}
for (const [bt, count] of Object.entries(bodyCounts)) {
  if (!BODY_TYPES.includes(bt)) {
    const pct = Math.round(count / generations.length * 100);
    r.push(`| ❓ ${bt} | ${count} | ${pct}% |`);
  }
}
r.push("");

// 3d. Segmentos
r.push("## Cobertura por segmento");
r.push("");
r.push("| Segmento | Count | % |");
r.push("|----------|-------|---|");
for (const seg of SEGMENTS) {
  const count = segmentCounts[seg] || 0;
  const pct = Math.round(count / generations.length * 100);
  r.push(`| ${seg} | ${count} | ${pct}% |`);
}
r.push("");

// 3e. Funnel
r.push("## Cobertura por funnel stage");
r.push("");
r.push("| Stage | Count | % |");
r.push("|-------|-------|---|");
for (const stage of FUNNEL_STAGES) {
  const count = funnelCounts[stage] || 0;
  const pct = Math.round(count / generations.length * 100);
  r.push(`| ${stage} | ${count} | ${pct}% |`);
}
r.push("");

// 3f. Avatares
r.push("## Cobertura por avatar");
r.push("");
const avatarSorted = Object.entries(avatarCounts).sort((a, b) => b[1] - a[1]);
r.push("| Avatar | Count | % |");
r.push("|--------|-------|---|");
for (const [av, count] of avatarSorted) {
  const pct = Math.round(count / generations.length * 100);
  r.push(`| ${av} | ${count} | ${pct}% |`);
}
r.push("");

// 3g. Ventas del modelo
r.push("## Cobertura por venta del modelo");
r.push("");
const saleSorted = Object.entries(saleCounts).sort((a, b) => b[1] - a[1]);
r.push("| Tipo de venta | Count | % |");
r.push("|---------------|-------|---|");
for (const [sale, count] of saleSorted) {
  const pct = Math.round(count / generations.length * 100);
  r.push(`| ${sale} | ${count} | ${pct}% |`);
}
r.push("");

// 3h. Lead types
r.push("## Cobertura por tipo de lead");
r.push("");
const leadSorted = Object.entries(leadTypeCounts).sort((a, b) => b[1] - a[1]);
r.push("| Lead Type | Count | % del total hooks |");
r.push("|-----------|-------|------------------|");
const totalHooks = Object.values(leadTypeCounts).reduce((a, b) => a + b, 0);
for (const [lt, count] of leadSorted) {
  const pct = Math.round(count / totalHooks * 100);
  r.push(`| ${lt} | ${count} | ${pct}% |`);
}
r.push("");

// 3i. Matriz cruzada: familia × body type
r.push("## Matriz cruzada: Familia × Body Type");
r.push("");
const bodyKeys = [...BODY_TYPES, ...Object.keys(bodyCounts).filter(bt => !BODY_TYPES.includes(bt))];
const shortBodyLabels = bodyKeys.map(bt => {
  const label = BODY_LABELS[bt];
  if (label) return label.replace(/^\d+\.\s*/, "").slice(0, 15);
  return bt.slice(0, 15);
});

// Header
r.push(`| Familia \\ Body | ${shortBodyLabels.join(" | ")} | **Total** |`);
r.push(`|${"-".repeat(16)}|${shortBodyLabels.map(() => "-".repeat(17)).join("|")}|${"-".repeat(11)}|`);

for (const fam of [...FAMILIES, ...Object.keys(familyCounts).filter(f => !FAMILIES.includes(f))]) {
  const label = FAMILY_LABELS[fam] || fam;
  const shortLabel = label.replace(/^\d+\.\s*/, "").slice(0, 14);
  const cells = bodyKeys.map(bt => {
    const count = comboCounts[`${fam}|${bt}`] || 0;
    return count === 0 ? "—" : String(count);
  });
  const total = Object.entries(comboCounts)
    .filter(([k]) => k.startsWith(`${fam}|`))
    .reduce((sum, [, v]) => sum + v, 0);
  r.push(`| ${shortLabel} | ${cells.join(" | ")} | **${total}** |`);
}
r.push("");

// 3j. Ángulos específicos (para detectar saturación)
r.push("## Ángulos específicos (saturación)");
r.push("");
const angleSorted = Object.entries(angleCounts).sort((a, b) => b[1] - a[1]);
r.push("| Ángulo | Count | Estado |");
r.push("|--------|-------|--------|");
for (const [angle, count] of angleSorted) {
  let estado = "✅ OK";
  if (count >= 5) estado = "⚠️ Saturado";
  if (count >= 8) estado = "🔴 Quemado";
  r.push(`| ${angle} | ${count} | ${estado} |`);
}
r.push("");

// 3k. Gaps detectados
r.push("## Gaps detectados (priorizar)");
r.push("");
const gaps = [];

// Familias sin cobertura o baja
for (const fam of FAMILIES) {
  if (!familyCounts[fam]) gaps.push(`❌ Familia "${FAMILY_LABELS[fam]}" tiene 0 guiones`);
  else if (familyCounts[fam] < 3) gaps.push(`⚠️ Familia "${FAMILY_LABELS[fam]}" tiene solo ${familyCounts[fam]} guiones`);
}
// Body types sin cobertura
for (const bt of BODY_TYPES) {
  if (!bodyCounts[bt]) gaps.push(`❌ Body type "${BODY_LABELS[bt]}" tiene 0 guiones`);
  else if (bodyCounts[bt] < 2) gaps.push(`⚠️ Body type "${BODY_LABELS[bt]}" tiene solo ${bodyCounts[bt]} guion(es)`);
}
// Segmentos sin cobertura
for (const seg of SEGMENTS) {
  if (!segmentCounts[seg]) gaps.push(`❌ Segmento "${seg}" tiene 0 guiones`);
  else if (segmentCounts[seg] < 3) gaps.push(`⚠️ Segmento "${seg}" tiene solo ${segmentCounts[seg]} guiones`);
}
// Funnel stages
for (const stage of FUNNEL_STAGES) {
  if (!funnelCounts[stage]) gaps.push(`❌ Funnel "${stage}" tiene 0 guiones`);
}

if (gaps.length === 0) {
  r.push("No se detectaron gaps mayores. Todas las dimensiones tienen cobertura.");
} else {
  for (const gap of gaps) r.push(`- ${gap}`);
}
r.push("");

// 3l. Nichos usados
r.push("## Nichos usados");
r.push("");
const nicheCountMap = {};
for (const n of nicheList) {
  nicheCountMap[n.niche] = (nicheCountMap[n.niche] || 0) + 1;
}
const nicheSorted = Object.entries(nicheCountMap).sort((a, b) => b[1] - a[1]);
r.push("| Nicho | Count |");
r.push("|-------|-------|");
for (const [niche, count] of nicheSorted) {
  r.push(`| ${niche} | ${count} |`);
}
r.push("");

// 3m. Patrones textuales saturados (bigramas/trigramas recurrentes en títulos + belief_change)
r.push("## Patrones textuales saturados");
r.push("");
r.push("> Frases/estructuras que aparecen en 3+ guiones. Evitarlas como eje de nuevos guiones.");
r.push("> Fuente: títulos + belief_change.old_belief / mechanism / new_belief. Se alimenta auto.");
r.push("");

const TEXT_STOPWORDS = new Set([
  "de","la","el","en","y","a","los","del","las","un","por","con","no","una","su",
  "para","es","al","lo","como","más","o","pero","sus","le","ya","que","este","sí",
  "porque","esta","entre","cuando","muy","sin","sobre","también","me","hasta","hay",
  "donde","quien","desde","todo","nos","durante","todos","uno","les","ni","contra",
  "otros","ese","eso","había","ante","ellos","e","esto","mí","antes","algunos",
  "qué","unos","yo","otro","otras","otra","él","tanto","esa","estos","mucho","cosa",
  "así","cada","bien","sólo","solo","gran","unos","unas","hace","hacer","hacés",
  "sabes","sabés","tenés","tiene","tener","sos","son","voy","vas","va","decir",
  "vos","vos.","vos,","mi","mis","mes","día","años","años.","años,","todo.","cuenta",
]);

function normText(t) {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(t) {
  return normText(t).split(" ").filter(w => w.length > 3 && !TEXT_STOPWORDS.has(w));
}

function ngramsOf(tokens, n) {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(" "));
  return out;
}

const bigramsCount = new Map();
const trigramsCount = new Map();
const bigramGuions = new Map();
const trigramGuions = new Map();

for (const g of generations) {
  const s = g.script || {};
  const bc = s.belief_change || {};
  const texts = [
    g.title, s.big_idea, bc.old_belief, bc.mechanism, bc.new_belief,
  ].filter(Boolean);

  const seenBi = new Set();
  const seenTri = new Set();
  for (const t of texts) {
    const tokens = getTokens(t);
    for (const bg of ngramsOf(tokens, 2)) seenBi.add(bg);
    for (const tg of ngramsOf(tokens, 3)) seenTri.add(tg);
  }
  for (const bg of seenBi) {
    bigramsCount.set(bg, (bigramsCount.get(bg) || 0) + 1);
    if (!bigramGuions.has(bg)) bigramGuions.set(bg, []);
    bigramGuions.get(bg).push((g.id || "?").slice(0, 8));
  }
  for (const tg of seenTri) {
    trigramsCount.set(tg, (trigramsCount.get(tg) || 0) + 1);
    if (!trigramGuions.has(tg)) trigramGuions.set(tg, []);
    trigramGuions.get(tg).push((g.id || "?").slice(0, 8));
  }
}

const hotTrigrams = [...trigramsCount.entries()]
  .filter(([, c]) => c >= 3)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

const hotBigrams = [...bigramsCount.entries()]
  .filter(([, c]) => c >= 4)
  .filter(([bg]) => !hotTrigrams.some(([tg]) => tg.includes(bg))) // no duplicar si ya está en un trigrama saturado
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

// Contar también los PATTERN_PHRASES (regex curados) contra todos los guiones
const patternHits = new Map();
const patternExamples = new Map();
for (const g of generations) {
  const s = g.script || {};
  const bc = s.belief_change || {};
  const combined = [g.title, s.big_idea, bc.old_belief, bc.mechanism, bc.new_belief].filter(Boolean).join(" ");
  const hits = matchedPatterns(combined);
  const seen = new Set();
  for (const p of hits) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    patternHits.set(p.id, (patternHits.get(p.id) || 0) + 1);
    if (!patternExamples.has(p.id)) patternExamples.set(p.id, []);
    patternExamples.get(p.id).push(g.title || (g.id || "?").slice(0, 8));
  }
}
const hotPatterns = [...patternHits.entries()]
  .filter(([, c]) => c >= 2)
  .sort((a, b) => b[1] - a[1]);

r.push("### Patrones curados (regex — fuente: lib/text-patterns.mjs)");
r.push("");
if (hotPatterns.length === 0) {
  r.push("_Ningún patrón curado aparece 2+ veces._");
} else {
  r.push("| Patrón | Count | Ejemplos de títulos |");
  r.push("|--------|-------|---------------------|");
  for (const [pid, c] of hotPatterns) {
    const examples = (patternExamples.get(pid) || []).slice(0, 2).map(t => t.slice(0, 40)).join(" · ");
    const flag = c >= 4 ? "🔴" : c >= 3 ? "⚠️" : "🟡";
    r.push(`| ${flag} \`${pid}\` | ${c} | ${examples} |`);
  }
}
r.push("");

if (hotTrigrams.length === 0 && hotBigrams.length === 0) {
  r.push("### Trigramas/bigramas crudos");
  r.push("");
  r.push("_Sin n-gramas textuales saturados detectados._");
  r.push("");
} else {
  r.push("### Trigramas (3+ apariciones)");
  r.push("");
  if (hotTrigrams.length === 0) {
    r.push("_Ninguno._");
  } else {
    r.push("| Trigrama | Count | Guiones (primeros IDs) |");
    r.push("|----------|-------|------------------------|");
    for (const [tg, c] of hotTrigrams) {
      const ids = (trigramGuions.get(tg) || []).slice(0, 4).join(", ");
      r.push(`| \`${tg}\` | ${c} | ${ids} |`);
    }
  }
  r.push("");
  r.push("### Bigramas (4+ apariciones, sin estar en trigramas saturados)");
  r.push("");
  if (hotBigrams.length === 0) {
    r.push("_Ninguno._");
  } else {
    r.push("| Bigrama | Count |");
    r.push("|---------|-------|");
    for (const [bg, c] of hotBigrams) r.push(`| \`${bg}\` | ${c} |`);
  }
}
r.push("");
r.push("**Cómo usar:** Si tu big idea incluye 2+ de estos trigramas → cambiar el ángulo. No es rotación cosmética, es el mismo guion repetido.");
r.push("");

r.push("---");
r.push(`*Auto-generado por update-coverage.mjs — NO editar manualmente.*`);

const matrizOutput = r.join("\n");
writeFileSync(join(DATA_DIR, "matriz-cobertura.md"), matrizOutput);
console.log(`✅ Guardado: .data/matriz-cobertura.md (${hotTrigrams.length} trigramas, ${hotBigrams.length} bigramas saturados)`);

// ── 4. Actualizar ángulos saturados en angulos-expandidos.md ──
const angulosPath = join(DATA_DIR, "angulos-expandidos.md");
if (existsSync(angulosPath)) {
  let angulosContent = readFileSync(angulosPath, "utf-8");

  // Buscar la sección "### Ángulos saturados" y reemplazarla
  const saturatedStart = angulosContent.indexOf("### Ángulos saturados");
  const freshStart = angulosContent.indexOf("### Ángulos frescos");

  if (saturatedStart !== -1 && freshStart !== -1) {
    // Calcular saturados (5+) y quemados (8+)
    const saturated = angleSorted.filter(([, c]) => c >= 5);
    const fresh = angleSorted.filter(([, c]) => c <= 1);
    // Ángulos que nunca se usaron (buscar en el archivo cuáles existen)
    const allAngleIds = angulosContent.match(/### (\d+\.\d+)/g)?.map(m => m.replace("### ", "")) || [];
    const unused = allAngleIds.filter(id => !angleCounts[id] && !Object.keys(angleCounts).some(k => k.startsWith(id)));

    let newSaturated = "### Ángulos saturados (usar con moderación):\n";
    if (saturated.length === 0) {
      newSaturated += "- Ningún ángulo saturado actualmente\n";
    } else {
      for (const [angle, count] of saturated) {
        const status = count >= 8 ? "QUEMADO" : "saturado";
        newSaturated += `- ${angle} — ya tiene ${count}+ guiones (${status})\n`;
      }
    }
    newSaturated += '- "Estás sentado en una pira de dinero" como frase — quemada\n';

    let newFresh = "### Ángulos frescos (priorizar):\n";
    if (unused.length > 0) {
      for (const id of unused.slice(0, 8)) {
        newFresh += `- ${id} (0 guiones — sin explorar)\n`;
      }
    }
    // Ángulos con 1 solo uso
    const lowUse = angleSorted.filter(([, c]) => c === 1);
    for (const [angle] of lowUse.slice(0, 6)) {
      newFresh += `- ${angle} (1 guion — poco explorado)\n`;
    }
    if (unused.length === 0 && lowUse.length === 0) {
      newFresh += "- Todos los ángulos tienen cobertura\n";
    }

    // Reemplazar desde "### Ángulos saturados" hasta "### Ángulos frescos" + su contenido hasta "---"
    const afterFresh = angulosContent.indexOf("\n---", freshStart);
    if (afterFresh !== -1) {
      const before = angulosContent.slice(0, saturatedStart);
      const after = angulosContent.slice(afterFresh);
      angulosContent = before + newSaturated + "\n" + newFresh + after;
      writeFileSync(angulosPath, angulosContent);
      console.log(`✅ Actualizado: .data/angulos-expandidos.md (${saturated.length} saturados, ${unused.length} sin explorar)`);
    } else {
      console.log("⚠️ No se pudo encontrar el cierre de sección en angulos-expandidos.md");
    }
  } else {
    console.log("⚠️ No se encontró la sección de ángulos saturados en angulos-expandidos.md");
  }
} else {
  console.log("⚠️ No existe angulos-expandidos.md");
}

// ── 4b. Actualizar §5 de .data/v2/diversidad-cobertura.md ──
const V2_DIR = join(DATA_DIR, "v2");
const diversidadV2Path = join(V2_DIR, "diversidad-cobertura.md");

if (existsSync(diversidadV2Path)) {
  // Últimas 30 generaciones para ventana de "sub-usados"
  const last30 = generations.slice(0, 30);

  // Contar hook fórmulas (F1-F20). El campo es hook.formula o hook.hook_type
  const formulaCounts = {};
  for (const g of last30) {
    for (const h of (g.script?.hooks || [])) {
      const f = h.formula || h.hook_formula || null;
      if (f) formulaCounts[f] = (formulaCounts[f] || 0) + 1;
    }
  }
  const ALL_FORMULAS = Array.from({ length: 20 }, (_, i) => `F${i + 1}`);
  const hooksSubUsed = ALL_FORMULAS.filter(f => (formulaCounts[f] || 0) < 3);

  // Vehículos sub-usados (últimos 30)
  const vehCounts30 = {};
  for (const g of last30) {
    const bt = g.script?.body_type;
    if (bt) vehCounts30[bt] = (vehCounts30[bt] || 0) + 1;
  }
  const vehiclesSubUsed = BODY_TYPES.filter(bt => (vehCounts30[bt] || 0) < 2);

  // Ingredientes sub-usados (últimos 30)
  const ingCounts30 = {};
  for (const g of last30) {
    for (const ing of (g.script?.ingredients_used || [])) {
      const key = normalizeIngredient(ing);
      if (!key) continue;
      ingCounts30[key] = (ingCounts30[key] || 0) + 1;
    }
  }
  const ingZero = Object.entries(ingCounts30).filter(([, c]) => c === 0).map(([k]) => k);
  const ingTopUsed = Object.entries(ingCounts30).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const ingSubUsed = Object.entries(ingCounts30).filter(([, c]) => c === 1).map(([k]) => k);

  // Ventas del modelo sub-usadas
  const saleCounts30 = {};
  for (const g of last30) {
    const s = g.script?.model_sale_type;
    if (s) saleCounts30[s] = (saleCounts30[s] || 0) + 1;
  }
  const VENTA_TIPOS = [
    "cementerio_modelos", "transparencia_total", "ventana_oportunidad_ia",
    "contraste_fisico", "eliminacion_barreras", "matematica_simple",
    "lean_anti_riesgo", "tiempo_vs_dinero", "democratizacion_ia", "prueba_diversidad"
  ];
  const salesSubUsed = VENTA_TIPOS.filter(v => (saleCounts30[v] || 0) < 2);

  // Ritmos sub-usados (R1-R7)
  const rhythmCounts30 = {};
  for (const g of last30) {
    const r = g.script?.rhythm_template;
    if (r) rhythmCounts30[r] = (rhythmCounts30[r] || 0) + 1;
  }
  const ALL_RHYTHMS = ["R1", "R2", "R3", "R4", "R5", "R6", "R7"];
  const rhythmsSubUsed = ALL_RHYTHMS.filter(r => (rhythmCounts30[r] || 0) < 2);

  // Construir sección §5
  const s5 = [];
  s5.push("## §5 COBERTURA ACTUAL");
  s5.push("");
  s5.push(`> Auto-generado por update-coverage.mjs — ${new Date().toISOString().slice(0, 10)}`);
  s5.push(`> Ventana: últimas ${last30.length} generaciones`);
  s5.push("");

  s5.push("### Hooks sub-usados (fórmulas con <3 usos en últimos 30 guiones)");
  if (hooksSubUsed.length === 0) {
    s5.push("_Todas las fórmulas con 3+ usos. Cobertura plena._");
  } else {
    s5.push(hooksSubUsed.map(f => `- ${f} (${formulaCounts[f] || 0} usos)`).join("\n"));
  }
  s5.push("");

  s5.push("### Vehículos sub-usados (<2 usos en últimos 30)");
  if (vehiclesSubUsed.length === 0) {
    s5.push("_Todos los vehículos con 2+ usos._");
  } else {
    s5.push(vehiclesSubUsed.map(v => {
      const label = BODY_LABELS[v] || v;
      return `- ${label} (${vehCounts30[v] || 0} usos)`;
    }).join("\n"));
  }
  s5.push("");

  s5.push("### Ingredientes nunca usados o sub-usados");
  if (ingSubUsed.length === 0 && ingZero.length === 0) {
    s5.push("_Sin data de ingredientes en generaciones recientes._");
  } else {
    if (ingZero.length > 0) s5.push(`**Sin uso:** ${ingZero.join(", ")}`);
    if (ingSubUsed.length > 0) s5.push(`**1 uso:** ${ingSubUsed.slice(0, 30).join(", ")}`);
    if (ingTopUsed.length > 0) s5.push(`**Top usados (rotar):** ${ingTopUsed.map(([k, c]) => `${k}×${c}`).join(", ")}`);
  }
  s5.push("");

  s5.push("### Ventas del modelo sub-usadas");
  if (salesSubUsed.length === 0) {
    s5.push("_Todas las ventas con 2+ usos._");
  } else {
    s5.push(salesSubUsed.map(v => `- ${v} (${saleCounts30[v] || 0} usos)`).join("\n"));
  }
  s5.push("");

  s5.push("### Ritmos sub-usados (R1-R7, <2 usos)");
  if (rhythmsSubUsed.length === 0) {
    s5.push("_Todos los ritmos con 2+ usos._");
  } else {
    s5.push(rhythmsSubUsed.map(r => `- ${r} (${rhythmCounts30[r] || 0} usos)`).join("\n"));
  }
  s5.push("");

  s5.push("### Gaps detectados");
  if (gaps.length === 0) {
    s5.push("_Sin gaps mayores._");
  } else {
    s5.push(gaps.slice(0, 10).map(g => `- ${g}`).join("\n"));
  }
  s5.push("");

  // Reemplazar §5 en el archivo v2
  let v2Content = readFileSync(diversidadV2Path, "utf-8");
  const s5Start = v2Content.indexOf("## §5 COBERTURA ACTUAL");
  if (s5Start !== -1) {
    // Buscar siguiente "## " o "---\n" después de §5
    const afterS5 = v2Content.indexOf("\n---\n", s5Start);
    const nextSection = v2Content.indexOf("\n## ", s5Start + 10);
    const cutPoint = (afterS5 !== -1 && (nextSection === -1 || afterS5 < nextSection))
      ? afterS5 + 1
      : (nextSection !== -1 ? nextSection + 1 : v2Content.length);

    const before = v2Content.slice(0, s5Start);
    const after = v2Content.slice(cutPoint);
    v2Content = before + s5.join("\n") + after;
    writeFileSync(diversidadV2Path, v2Content);
    console.log(`✅ Actualizado: .data/v2/diversidad-cobertura.md §5 (${last30.length} gens analizadas)`);
  } else {
    console.log("⚠️ No se encontró '## §5 COBERTURA ACTUAL' en diversidad-cobertura.md v2");
  }
} else {
  console.log("⚠️ No existe .data/v2/diversidad-cobertura.md");
}

// ── 5. Resumen en consola ──
console.log("\n── Resumen de cobertura ──");
console.log(`   Generaciones: ${generations.length}`);
console.log(`   Familias: ${Object.keys(familyCounts).length}/${FAMILIES.length}`);
console.log(`   Body types: ${Object.keys(bodyCounts).length}/${BODY_TYPES.length}`);
console.log(`   Segmentos: ${Object.keys(segmentCounts).length}/${SEGMENTS.length}`);
console.log(`   Lead types: ${Object.keys(leadTypeCounts).length}`);
console.log(`   Gaps: ${gaps.length}`);
