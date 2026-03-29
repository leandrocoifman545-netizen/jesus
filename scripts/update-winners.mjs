#!/usr/bin/env node
/**
 * Analyzes winner/recorded scripts and generates updated pattern recommendations.
 * Outputs to .data/winner-patterns-auto.md and console.
 *
 * Usage: node scripts/update-winners.mjs
 * Run after marking scripts as "winner" via /post-session, or periodically.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GENERATIONS_DIR = join(DATA_DIR, "generations");

if (!existsSync(GENERATIONS_DIR)) {
  console.log("No hay directorio de generaciones.");
  process.exit(0);
}

// Load all generations
const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
const generations = files
  .map(f => { try { return JSON.parse(readFileSync(join(GENERATIONS_DIR, f), "utf-8")); } catch { return null; } })
  .filter(Boolean)
  .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

const winners = generations.filter(g => g.status === "winner");
const recorded = generations.filter(g => g.status === "recorded");
const confirmed = generations.filter(g => g.status === "confirmed");
const all = generations.filter(g => ["winner", "recorded", "confirmed"].includes(g.status));

if (all.length === 0) {
  console.log("No hay generaciones confirmadas/grabadas/winner para analizar.");
  process.exit(0);
}

// Helper: count occurrences of a field
function countField(gens, getField) {
  const counts = {};
  for (const g of gens) {
    const value = getField(g);
    if (value) counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// Helper: win rate
function winRate(field, total, winnerCounts) {
  const winCount = winnerCounts.find(([f]) => f === field)?.[1] || 0;
  return total > 0 ? Math.round(winCount / total * 100) : 0;
}

// Count patterns for all and for winners
const bodyAll = countField(all, g => g.script?.body_type);
const bodyWin = countField(winners, g => g.script?.body_type);
const arcAll = countField(all, g => g.script?.development?.emotional_arc);
const arcWin = countField(winners, g => g.script?.development?.emotional_arc);
const familyAll = countField(all, g => g.script?.angle_family);
const familyWin = countField(winners, g => g.script?.angle_family);
const segAll = countField(all, g => g.script?.segment);
const segWin = countField(winners, g => g.script?.segment);
const saleAll = countField(all, g => g.script?.model_sale_type);
const saleWin = countField(winners, g => g.script?.model_sale_type);
const funnelAll = countField(all, g => g.script?.funnel_stage);
const funnelWin = countField(winners, g => g.script?.funnel_stage);

// Lead types from winners
const winnerLeadTypes = {};
for (const w of winners) {
  for (const hook of (w.script?.hooks || [])) {
    const type = hook.hook_type;
    if (type) winnerLeadTypes[type] = (winnerLeadTypes[type] || 0) + 1;
  }
}
const leadTypesSorted = Object.entries(winnerLeadTypes).sort((a, b) => b[1] - a[1]);

// Ingredients from winners
const winnerIngredients = {};
for (const w of winners) {
  for (const ing of (w.script?.ingredients_used || [])) {
    const id = `${ing.category}#${ing.ingredient_number} ${ing.ingredient_name || ""}`.trim();
    winnerIngredients[id] = (winnerIngredients[id] || 0) + 1;
  }
}
const ingredientsSorted = Object.entries(winnerIngredients).sort((a, b) => b[1] - a[1]);

// Generate report
const r = [];
r.push("# Winner Patterns — Auto-generado");
r.push(`> Fecha: ${new Date().toISOString().slice(0, 10)}`);
r.push(`> Base: ${all.length} generaciones (${winners.length} winners, ${recorded.length} recorded, ${confirmed.length} confirmed)`);
r.push(`> Este archivo se regenera con: \`node scripts/update-winners.mjs\``);
r.push("");

if (winners.length === 0) {
  r.push("## ⚠️ No hay winners marcados aún");
  r.push("Marcar scripts como 'winner' en /post-session para que este análisis tenga data.");
  r.push("Mientras tanto, se muestran los patrones de scripts grabados.");
  r.push("");
}

// Body types
r.push("## Body Types (vehículos narrativos)");
r.push("| Body Type | Total | Winners | Win Rate |");
r.push("|-----------|-------|---------|----------|");
for (const [bt, total] of bodyAll) {
  const wr = winRate(bt, total, bodyWin);
  r.push(`| ${bt} | ${total} | ${bodyWin.find(([b]) => b === bt)?.[1] || 0} | ${wr}% |`);
}
r.push("");

// Arcs
r.push("## Arcos Narrativos");
r.push("| Arco | Total | Winners | Win Rate |");
r.push("|------|-------|---------|----------|");
for (const [arc, total] of arcAll) {
  const wr = winRate(arc, total, arcWin);
  r.push(`| ${arc} | ${total} | ${arcWin.find(([a]) => a === arc)?.[1] || 0} | ${wr}% |`);
}
r.push("");

// Families
r.push("## Familias de Ángulo");
r.push("| Familia | Total | Winners | Win Rate |");
r.push("|---------|-------|---------|----------|");
for (const [fam, total] of familyAll) {
  const wr = winRate(fam, total, familyWin);
  r.push(`| ${fam} | ${total} | ${familyWin.find(([f]) => f === fam)?.[1] || 0} | ${wr}% |`);
}
r.push("");

// Segments
r.push("## Segmentos");
r.push("| Segmento | Total | Winners | Win Rate |");
r.push("|----------|-------|---------|----------|");
for (const [seg, total] of segAll) {
  const wr = winRate(seg, total, segWin);
  r.push(`| ${seg} | ${total} | ${segWin.find(([s]) => s === seg)?.[1] || 0} | ${wr}% |`);
}
r.push("");

// Sale types
r.push("## Ventas del Modelo");
r.push("| Tipo | Total | Winners | Win Rate |");
r.push("|------|-------|---------|----------|");
for (const [sale, total] of saleAll) {
  const wr = winRate(sale, total, saleWin);
  r.push(`| ${sale} | ${total} | ${saleWin.find(([s]) => s === sale)?.[1] || 0} | ${wr}% |`);
}
r.push("");

// Lead types (winners only)
if (leadTypesSorted.length > 0) {
  r.push("## Lead Types en Winners");
  r.push("| Tipo | Apariciones en winners |");
  r.push("|------|-----------------------|");
  for (const [type, count] of leadTypesSorted) {
    r.push(`| ${type} | ${count} |`);
  }
  r.push("");
}

// Ingredients (winners only)
if (ingredientsSorted.length > 0) {
  r.push("## Ingredientes en Winners");
  r.push("| Ingrediente | Apariciones en winners |");
  r.push("|-------------|-----------------------|");
  for (const [ing, count] of ingredientsSorted.slice(0, 20)) {
    r.push(`| ${ing} | ${count} |`);
  }
  r.push("");
}

// Auto-recommendations
r.push("## Recomendaciones Automáticas");
r.push("");

const topBody = bodyWin[0];
if (topBody) r.push(`- **Body type con más wins:** ${topBody[0]} (${topBody[1]} wins) → sesgar hacia este tipo`);

const topArc = arcWin[0];
if (topArc) r.push(`- **Arco con más wins:** ${topArc[0]} (${topArc[1]} wins)`);

const topFamily = familyWin[0];
if (topFamily) r.push(`- **Familia con más wins:** ${topFamily[0]} (${topFamily[1]} wins)`);

// Underperformers
const lowWR = bodyAll.filter(([bt, total]) => total >= 3 && winRate(bt, total, bodyWin) === 0);
if (lowWR.length > 0) {
  r.push(`- **Body types sin wins (${lowWR.length}):** ${lowWR.map(([bt]) => bt).join(", ")} → considerar rotar menos hacia estos`);
}

// Duration analysis
const winnerDurations = winners.map(g => g.script?.total_duration_seconds).filter(Boolean);
if (winnerDurations.length > 0) {
  const avgDur = Math.round(winnerDurations.reduce((a, b) => a + b, 0) / winnerDurations.length);
  const minDur = Math.min(...winnerDurations);
  const maxDur = Math.max(...winnerDurations);
  r.push(`- **Duración winners:** promedio ${avgDur}s (rango: ${minDur}-${maxDur}s)`);
}

r.push("");
r.push("---");
r.push(`*Auto-generado por update-winners.mjs — NO editar manualmente.*`);

const output = r.join("\n");
writeFileSync(join(DATA_DIR, "winner-patterns-auto.md"), output);
console.log(output);
console.error(`\n✅ Guardado en .data/winner-patterns-auto.md`);
