#!/usr/bin/env node
/**
 * #1 - Winner Patterns Extraction
 * Reads all generations with status "winner" or "recorded" and extracts
 * actionable patterns for future script generation.
 *
 * Usage: node scripts/extract-winner-patterns.mjs
 * Output: JSON with patterns + saves .data/winner-patterns.md
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const GENS_DIR = join(import.meta.dirname, "..", ".data", "generations");
const OUTPUT_PATH = join(import.meta.dirname, "..", ".data", "winner-patterns.md");

// Read all generations
const gens = readdirSync(GENS_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => {
    try { return JSON.parse(readFileSync(join(GENS_DIR, f), "utf-8")); }
    catch { return null; }
  })
  .filter(Boolean);

// Separate winners and recorded (both have real-world validation)
const winners = gens.filter(g => g.status === "winner");
const recorded = gens.filter(g => g.status === "recorded");
const validated = [...winners, ...recorded];

if (validated.length === 0) {
  console.log(JSON.stringify({ status: "NO_WINNERS", message: "No hay guiones con status winner o recorded todavía." }));
  process.exit(0);
}

// ── Extract patterns ──

// 1. Angle families that won
const angleFamilyCounts = {};
validated.forEach(g => {
  const af = g.script?.angle_family || "unknown";
  angleFamilyCounts[af] = (angleFamilyCounts[af] || 0) + 1;
});

// 2. Body types that won
const bodyTypeCounts = {};
validated.forEach(g => {
  const bt = g.script?.body_type || "unknown";
  bodyTypeCounts[bt] = (bodyTypeCounts[bt] || 0) + 1;
});

// 3. Lead/hook types that won
const hookTypeCounts = {};
validated.forEach(g => {
  (g.script?.hooks || []).forEach(h => {
    const ht = h.hook_type || h.hookType || "unknown";
    hookTypeCounts[ht] = (hookTypeCounts[ht] || 0) + 1;
  });
});

// 4. Model sale types
const modelSaleCounts = {};
validated.forEach(g => {
  const ms = g.script?.model_sale_type || "unknown";
  modelSaleCounts[ms] = (modelSaleCounts[ms] || 0) + 1;
});

// 5. Segments
const segmentCounts = {};
validated.forEach(g => {
  const s = g.script?.segment || "unknown";
  segmentCounts[s] = (segmentCounts[s] || 0) + 1;
});

// 6. Ingredients that appear in winners
const ingredientCounts = {};
validated.forEach(g => {
  (g.script?.ingredients_used || []).forEach(ing => {
    const key = `${ing.category}#${ing.ingredient_number} ${ing.ingredient_name}`;
    ingredientCounts[key] = (ingredientCounts[key] || 0) + 1;
  });
});

// 7. Session notes patterns (what Jesús said worked)
const sessionInsights = validated
  .filter(g => g.sessionNotes && g.sessionNotes.trim().length > 5)
  .map(g => ({
    title: g.title || "Sin título",
    notes: g.sessionNotes.trim(),
    angle: g.script?.angle_family || "?",
    bodyType: g.script?.body_type || "?",
  }));

// 8. Best lead indices from metrics
const bestLeadTypes = [];
validated.forEach(g => {
  if (g.metrics?.bestLeadIndex != null && g.script?.hooks?.[g.metrics.bestLeadIndex]) {
    const hook = g.script.hooks[g.metrics.bestLeadIndex];
    bestLeadTypes.push({
      type: hook.hook_type || hook.hookType || "unknown",
      text: (hook.script_text || hook.text || "").substring(0, 100),
      title: g.title || "Sin título",
    });
  }
});

// 9. Niches that worked
const nicheCounts = {};
validated.forEach(g => {
  const n = g.script?.niche || "unknown";
  nicheCounts[n] = (nicheCounts[n] || 0) + 1;
});

// ── Sort by count ──
const sortObj = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

// ── Generate markdown report ──
const now = new Date().toISOString().split("T")[0];
let md = `# Winner Patterns — Actualizado ${now}\n\n`;
md += `**Total validados:** ${validated.length} (${winners.length} winners + ${recorded.length} recorded)\n\n`;

md += `## Familias de ángulo que funcionan\n`;
sortObj(angleFamilyCounts).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });

md += `\n## Tipos de cuerpo que funcionan\n`;
sortObj(bodyTypeCounts).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });

md += `\n## Tipos de lead que funcionan\n`;
sortObj(hookTypeCounts).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });

if (bestLeadTypes.length > 0) {
  md += `\n## Leads específicos que Jesús marcó como mejores\n`;
  bestLeadTypes.forEach(l => { md += `- **${l.type}** (${l.title}): "${l.text}..."\n`; });
}

md += `\n## Venta del modelo que funciona\n`;
sortObj(modelSaleCounts).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });

md += `\n## Segmentos validados\n`;
sortObj(segmentCounts).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });

md += `\n## Nichos que funcionaron\n`;
sortObj(nicheCounts).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });

if (Object.keys(ingredientCounts).length > 0) {
  md += `\n## Ingredientes más usados en winners\n`;
  sortObj(ingredientCounts).slice(0, 15).forEach(([k, v]) => { md += `- **${k}**: ${v} veces\n`; });
}

if (sessionInsights.length > 0) {
  md += `\n## Notas de sesión (qué dijo Jesús que funcionó)\n`;
  sessionInsights.forEach(s => {
    md += `\n### ${s.title} (${s.angle}, ${s.bodyType})\n${s.notes}\n`;
  });
}

md += `\n---\n\n`;
md += `## Cómo usar estos patterns\n\n`;
md += `- **Sesgar hacia lo validado:** si un tipo de lead tiene más winners, priorizarlo (pero no repetir — diversidad sigue mandando).\n`;
md += `- **Ingredientes probados:** los que aparecen en winners son seguros. Combinar con frescos para no repetir.\n`;
md += `- **Notas de Jesús:** feedback directo sobre qué fluye y qué no. Más valioso que la teoría.\n`;
md += `- **NUNCA copiar:** estos patterns son para SESGAR decisiones, no para copiar guiones.\n`;

writeFileSync(OUTPUT_PATH, md);
console.log(JSON.stringify({
  status: "OK",
  winners: winners.length,
  recorded: recorded.length,
  total_validated: validated.length,
  top_angle: sortObj(angleFamilyCounts)[0]?.[0] || "none",
  top_body_type: sortObj(bodyTypeCounts)[0]?.[0] || "none",
  top_hook_type: sortObj(hookTypeCounts)[0]?.[0] || "none",
  session_insights: sessionInsights.length,
  output: OUTPUT_PATH,
}));
