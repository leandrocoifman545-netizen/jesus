#!/usr/bin/env node
/**
 * #5 - Session Notes → Feedback Loop
 * Reads all generations with sessionNotes and extracts actionable patterns.
 * Outputs a structured file that the guion skill references.
 *
 * Usage: node scripts/extract-session-insights.mjs
 * Output: .data/session-insights.md
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const GENS_DIR = join(import.meta.dirname, "..", ".data", "generations");
const OUTPUT_PATH = join(import.meta.dirname, "..", ".data", "session-insights.md");

// Read all generations with session notes
const gens = readdirSync(GENS_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => {
    try { return JSON.parse(readFileSync(join(GENS_DIR, f), "utf-8")); }
    catch { return null; }
  })
  .filter(g => g && g.sessionNotes && g.sessionNotes.trim().length > 5);

if (gens.length === 0) {
  const md = `# Session Insights — Sin data todavía\n\nNo hay generaciones con notas de sesión. Después de grabar con Jesús, agregar notas en cada guion.\n`;
  writeFileSync(OUTPUT_PATH, md);
  console.log(JSON.stringify({ status: "NO_NOTES", total: 0 }));
  process.exit(0);
}

// Sort by date (newest first)
gens.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

// ── Categorize insights ──
const positives = []; // what worked
const negatives = []; // what didn't
const adjustments = []; // what Jesús changed on the fly
const uncategorized = [];

// Simple pattern matching for categorization
const positivePatterns = /funcion[óo]|gust[óo]|bien|bueno|genial|fluye|natural|perfecto|sirv[eió]/i;
const negativePatterns = /no funcion|malo|flojo|forzado|raro|no fluye|descart|cambiar|no sirv/i;
const adjustmentPatterns = /cambi[óo]|modific|ajust|improv|mejor si|en vez de|probamos/i;

gens.forEach(g => {
  const note = g.sessionNotes.trim();
  const entry = {
    title: g.title || "Sin título",
    date: (g.createdAt || "").split("T")[0],
    angle: g.script?.angle_family || "?",
    bodyType: g.script?.body_type || "?",
    niche: g.script?.niche || "?",
    segment: g.script?.segment || "?",
    status: g.status || "draft",
    note,
  };

  if (positivePatterns.test(note)) positives.push(entry);
  else if (negativePatterns.test(note)) negatives.push(entry);
  else if (adjustmentPatterns.test(note)) adjustments.push(entry);
  else uncategorized.push(entry);
});

// ── Generate markdown ──
const now = new Date().toISOString().split("T")[0];
let md = `# Session Insights — Actualizado ${now}\n\n`;
md += `**Total guiones con notas:** ${gens.length}\n\n`;

if (positives.length > 0) {
  md += `## Lo que FUNCIONA (repetir)\n\n`;
  positives.forEach(p => {
    md += `### ${p.title} (${p.angle}, ${p.bodyType}, ${p.niche})\n`;
    md += `- **Segmento:** ${p.segment} | **Status:** ${p.status} | **Fecha:** ${p.date}\n`;
    md += `- **Nota:** ${p.note}\n\n`;
  });
}

if (negatives.length > 0) {
  md += `## Lo que NO funciona (evitar)\n\n`;
  negatives.forEach(n => {
    md += `### ${n.title} (${n.angle}, ${n.bodyType}, ${n.niche})\n`;
    md += `- **Segmento:** ${n.segment} | **Status:** ${n.status} | **Fecha:** ${n.date}\n`;
    md += `- **Nota:** ${n.note}\n\n`;
  });
}

if (adjustments.length > 0) {
  md += `## Ajustes que Jesús hizo en sesión\n\n`;
  adjustments.forEach(a => {
    md += `### ${a.title} (${a.angle}, ${a.bodyType}, ${a.niche})\n`;
    md += `- **Segmento:** ${a.segment} | **Status:** ${a.status} | **Fecha:** ${a.date}\n`;
    md += `- **Nota:** ${a.note}\n\n`;
  });
}

if (uncategorized.length > 0) {
  md += `## Otras notas\n\n`;
  uncategorized.forEach(u => {
    md += `- **${u.title}** (${u.date}): ${u.note}\n`;
  });
}

md += `\n---\n\n`;
md += `## Cómo usar estos insights\n\n`;
md += `- Lo que FUNCIONA → sesgar futuras decisiones hacia esos patterns\n`;
md += `- Lo que NO funciona → evitar esas combinaciones\n`;
md += `- Ajustes de Jesús → aplicar directamente en futuros guiones\n`;
md += `- Estas notas tienen más peso que la teoría de los archivos de sistema\n`;

writeFileSync(OUTPUT_PATH, md);
console.log(JSON.stringify({
  status: "OK",
  total_with_notes: gens.length,
  positives: positives.length,
  negatives: negatives.length,
  adjustments: adjustments.length,
  uncategorized: uncategorized.length,
  output: OUTPUT_PATH,
}));
