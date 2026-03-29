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

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GENERATIONS_DIR = join(DATA_DIR, "generations");

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
  const family = s.angle_family || "desconocido";
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

r.push("---");
r.push(`*Auto-generado por update-coverage.mjs — NO editar manualmente.*`);

const matrizOutput = r.join("\n");
writeFileSync(join(DATA_DIR, "matriz-cobertura.md"), matrizOutput);
console.log(`✅ Guardado: .data/matriz-cobertura.md`);

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

// ── 5. Resumen en consola ──
console.log("\n── Resumen de cobertura ──");
console.log(`   Generaciones: ${generations.length}`);
console.log(`   Familias: ${Object.keys(familyCounts).length}/${FAMILIES.length}`);
console.log(`   Body types: ${Object.keys(bodyCounts).length}/${BODY_TYPES.length}`);
console.log(`   Segmentos: ${Object.keys(segmentCounts).length}/${SEGMENTS.length}`);
console.log(`   Lead types: ${Object.keys(leadTypeCounts).length}`);
console.log(`   Gaps: ${gaps.length}`);
