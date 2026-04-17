#!/usr/bin/env node
/**
 * Audit v2 — verifica consistencia del sistema ADP.
 * Reemplaza el skill /audit conceptual con checks automatizados.
 *
 * Usage: node scripts/audit-v2.mjs
 * Exit code: 0 si todo limpio, 1 si hay errores críticos.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, ".data");
const V2_DIR = join(DATA_DIR, "v2");
const GENERATIONS_DIR = join(DATA_DIR, "generations");
const SKILLS_DIR = "/Users/lean/Documents/Claude/adp-guiones-v2/.claude/skills";

const CORE_FILES = [
  "arsenal-estructura.md",
  "arsenal-hooks.md",
  "audiencia-unificada.md",
  "diversidad-cobertura.md",
  "jesus-completo.md",
  "referencia-competidores.md",
  "reglas-duras.md",
];

const CANONICAL_FAMILIES = ["identidad_situacion", "oportunidad", "contraste_confrontacion", "mecanismo_proceso", "historia_emocion"];
const CANONICAL_BODY_TYPES = [
  "demolicion_mito", "historia_con_giro", "demo_proceso", "comparacion_caminos",
  "un_dia_en_la_vida", "pregunta_respuesta", "analogia_extendida", "contraste_emocional",
  "demolicion_alternativas", "qa_conversacional", "tier_list_rating", "trailer_recurso", "quiz_comparacion",
];
const CANONICAL_SALES = [
  "cementerio_modelos", "transparencia_total", "ventana_oportunidad_ia",
  "contraste_fisico", "eliminacion_barreras", "matematica_simple",
  "lean_anti_riesgo", "tiempo_vs_dinero", "democratizacion_ia", "prueba_diversidad",
];
const CANONICAL_SEGMENTS = ["A", "B", "C", "D"];
const LEGACY_PATH_PATTERNS = [
  /\.memory\//,
  /motor-audiencia/,
  /inteligencia-compradores/,
  /matriz-cobertura/,
  /reglas-diversidad/,
  /consejos-jesus/,
  /jesus-adp\.md/,
  /jesus-tono-adp-nuevo/,
  /avatar-frases-reales/,
  /copy-engine-ads/,
];

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

// ── 1. Archivos core v2 existen ──
const missingCore = CORE_FILES.filter(f => !existsSync(join(V2_DIR, f)));
check(
  "Archivos core v2 (7)",
  missingCore.length === 0,
  missingCore.length ? `faltan: ${missingCore.join(", ")}` : `${CORE_FILES.length} archivos OK`
);

// ── 2. Skills no apuntan a paths viejos ──
function walkSkills() {
  if (!existsSync(SKILLS_DIR)) return [];
  const matches = [];
  for (const entry of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "audit") continue; // el skill audit describe patrones legacy por diseño
    const skillFile = join(SKILLS_DIR, entry.name, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    const content = readFileSync(skillFile, "utf-8");
    for (const pat of LEGACY_PATH_PATTERNS) {
      if (pat.test(content)) {
        matches.push(`${entry.name}: ${pat.source}`);
        break;
      }
    }
  }
  return matches;
}
const legacyRefs = walkSkills();
check(
  "Skills sin paths legacy",
  legacyRefs.length === 0,
  legacyRefs.length ? legacyRefs.join("; ") : "todos los skills apuntan a v2"
);

// ── 3. Cobertura no tiene 'undefined' ──
const coveragePath = join(V2_DIR, "diversidad-cobertura.md");
let coverageContent = "";
if (existsSync(coveragePath)) coverageContent = readFileSync(coveragePath, "utf-8");
const undefRefs = coverageContent.match(/undefined#undefined/g) || [];
check(
  "Cobertura sin 'undefined' refs",
  undefRefs.length === 0,
  undefRefs.length ? `${undefRefs.length} refs corruptas — correr update-coverage.mjs` : "limpio"
);

// ── 4. Cobertura fresca (< 7 días) ──
if (existsSync(coveragePath)) {
  const ageHours = (Date.now() - statSync(coveragePath).mtimeMs) / 36e5;
  check(
    "Cobertura fresca (<7d)",
    ageHours < 24 * 7,
    `última actualización hace ${Math.round(ageHours)}h`
  );
}

// ── 5. Schema drift en generations ──
let driftDetails = [];
if (existsSync(GENERATIONS_DIR)) {
  const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
  const driftFams = new Set();
  const driftBodies = new Set();
  const driftSales = new Set();
  const driftSegments = new Set();
  let badIngredients = 0;

  for (const f of files) {
    let g;
    try { g = JSON.parse(readFileSync(join(GENERATIONS_DIR, f), "utf-8")); } catch { continue; }
    const s = g.script || {};
    if (s.angle_family && !CANONICAL_FAMILIES.includes(s.angle_family)) {
      // El normalizador de update-coverage acepta variantes — flagear solo las realmente desconocidas
      const knownVariants = ["1","2","3","4","5","identidad","oportunidad","confrontacion","mecanismo","historia","ventana_oportunidad","historia_personal"];
      if (!knownVariants.includes(String(s.angle_family).toLowerCase())) driftFams.add(s.angle_family);
    }
    if (s.body_type && !CANONICAL_BODY_TYPES.includes(s.body_type)) driftBodies.add(s.body_type);
    if (s.model_sale_type && !CANONICAL_SALES.includes(s.model_sale_type)) driftSales.add(s.model_sale_type);
    if (s.segment && !CANONICAL_SEGMENTS.includes(s.segment)) driftSegments.add(s.segment);
    for (const ing of (s.ingredients_used || [])) {
      const valid = (typeof ing === "string" && ing.includes("#")) ||
        (typeof ing === "object" && ing && ing.category && ing.ingredient_number != null);
      if (!valid) badIngredients++;
    }
  }
  if (driftFams.size) driftDetails.push(`familias: ${[...driftFams].join(",")}`);
  if (driftBodies.size) driftDetails.push(`body_types: ${[...driftBodies].slice(0,5).join(",")}${driftBodies.size>5?`+${driftBodies.size-5}`:""}`);
  if (driftSales.size) driftDetails.push(`sales: ${[...driftSales].slice(0,5).join(",")}${driftSales.size>5?`+${driftSales.size-5}`:""}`);
  if (driftSegments.size) driftDetails.push(`segments: ${[...driftSegments].join(",")}`);
  if (badIngredients) driftDetails.push(`${badIngredients} ingredientes con shape inválida`);
}
check(
  "Schema generations sin drift",
  driftDetails.length === 0,
  driftDetails.length ? driftDetails.join(" | ") : "todos los valores en lista canónica"
);

// ── 6. Correcciones de audiencia aplicadas ──
const audPath = join(V2_DIR, "audiencia-unificada.md");
if (existsSync(audPath)) {
  const aud = readFileSync(audPath, "utf-8");
  const has8estafa = /estafa.*?8\.?0?%|8\.?0?%.*?estafa/is.test(aud) || /T8.*?8%/is.test(aud);
  const has69tech = /6\.9%/.test(aud) && /tecnolog/i.test(aud);
  const has5clusters = /CLUSTER 5|Cluster 5/.test(aud);
  const issues = [];
  if (!has8estafa) issues.push("falta corrección 'estafa = 8%'");
  if (!has69tech) issues.push("falta corrección 'tech = 6.9%'");
  if (!has5clusters) issues.push("faltan los 5 clusters");
  check("Correcciones audiencia aplicadas", issues.length === 0, issues.length ? issues.join("; ") : "estafa 8%, tech 6.9%, 5 clusters OK");
}

// ── 7. Skill /guion completeness ──
const guionPath = join(SKILLS_DIR, "guion", "SKILL.md");
if (existsSync(guionPath)) {
  const guion = readFileSync(guionPath, "utf-8");
  // Acepta ambos formatos: FASE (legacy) o GATE (nuevo esquema por gates duros)
  const gates = ["GATE 1", "GATE 2", "GATE 3", "GATE 4", "GATE 5"].filter(p => guion.includes(p));
  const phases = ["FASE 1", "FASE 2", "FASE 3", "FASE 4", "FASE 5"].filter(p => guion.includes(p));
  const stages = Math.max(gates.length, phases.length);
  const stageLabel = gates.length >= 5 ? "gates" : "fases";
  const piaCount = (guion.match(/P-IA\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i).length;
  const vCount = (guion.match(/\bV\d+:/g) || []).filter((v, i, a) => a.indexOf(v) === i).length;
  const issues = [];
  if (stages !== 5) issues.push(`${stages}/5 ${stageLabel}`);
  if (piaCount < 13) issues.push(`${piaCount}/13 P-IA`);
  if (vCount < 8) issues.push(`${vCount}/8 V-checks`);
  check("Skill /guion completo", issues.length === 0, issues.length ? issues.join(", ") : `5 ${stageLabel}, 13 P-IA, 8 V-checks`);
}

// ── Output ──
const failed = checks.filter(c => !c.ok);
console.log("\n## Audit v2\n");
for (const c of checks) {
  const icon = c.ok ? "✅" : "❌";
  console.log(`${icon} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}
console.log(`\nTotal: ${checks.length - failed.length}/${checks.length} OK`);
if (failed.length) {
  console.log(`\n⚠️  ${failed.length} check(s) fallidos. Revisar arriba.`);
  process.exit(1);
}
console.log(`\n✅ Sistema limpio.`);
process.exit(0);
