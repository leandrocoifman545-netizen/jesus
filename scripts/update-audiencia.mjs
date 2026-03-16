#!/usr/bin/env node
/**
 * #3 - Pipeline de Audiencia
 * Ingests new WhatsApp bot export data and updates inteligencia-audiencia.
 *
 * Usage:
 *   node scripts/update-audiencia.mjs path/to/export.md    (from file)
 *   cat export.txt | node scripts/update-audiencia.mjs -    (from stdin)
 *
 * The script:
 * 1. Reads the new export (markdown/text with conversations)
 * 2. Extracts new verbatims, pain points, desires, fears, triggers, situations
 * 3. Merges with existing inteligencia-audiencia data
 * 4. Saves updated file with new date
 * 5. Updates avatar-frases-reales.md with new quotes
 *
 * Expected input format: markdown with quotes, stats, or raw conversation text.
 * The script is flexible — it extracts patterns regardless of exact format.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const DOWNLOADS_DIR = join(DATA_DIR, "downloads");
const MEMORY_DIR = join(import.meta.dirname, "..", ".memory");

// ── Read input ──
let input;
if (process.argv[2] === "-") {
  input = readFileSync("/dev/stdin", "utf-8");
} else if (process.argv[2]) {
  input = readFileSync(process.argv[2], "utf-8");
} else {
  console.error("Uso: node scripts/update-audiencia.mjs <archivo.md> o cat archivo | node scripts/update-audiencia.mjs -");
  console.error("\nEste script ingesta data nueva del bot de WhatsApp y actualiza:");
  console.error("  - .data/downloads/inteligencia-audiencia-FECHA.md");
  console.error("  - .memory/avatar-frases-reales.md (frases nuevas)");
  process.exit(1);
}

// ── Load existing audience data ──
let existingFile = null;
if (existsSync(DOWNLOADS_DIR)) {
  const files = readdirSync(DOWNLOADS_DIR)
    .filter(f => f.startsWith("inteligencia-audiencia-") && f.endsWith(".md"))
    .sort()
    .reverse();
  if (files[0]) {
    existingFile = readFileSync(join(DOWNLOADS_DIR, files[0]), "utf-8");
  }
}

// ── Extract patterns from new input ──

// Extract quoted text (lines starting with >, ", or between quotes)
const quotePatterns = [
  /^>\s*[""]?(.+?)[""]?\s*$/gm,           // > "quoted text"
  /[""]([^""]{15,200})[""](?:\s*[-—])/gm,  // "quoted text" — attribution
  /^[-•]\s*[""](.+?)[""]$/gm,              // - "quoted text"
];

const newQuotes = new Set();
for (const pattern of quotePatterns) {
  let match;
  while ((match = pattern.exec(input)) !== null) {
    const quote = match[1].trim();
    if (quote.length > 10 && quote.length < 300) {
      newQuotes.add(quote);
    }
  }
}

// Extract stats (numbers followed by context)
const statsPattern = /(\d[\d,.]+)\s+(leads?|conversacion|mensaje|respuesta|persona|usuario|compra|señal|venta)/gi;
const newStats = [];
let statMatch;
while ((statMatch = statsPattern.exec(input)) !== null) {
  newStats.push({ value: statMatch[1], context: statMatch[0].trim() });
}

// Categorize quotes by pain/desire/fear/trigger
const painKeywords = /no sé|no puedo|cansad|harta|frustrad|problem|difícil|complicad|imposible|atascad|estancad|no me alcanza|no tengo tiempo/i;
const desireKeywords = /quiero|quisiera|sueño|me gustaría|ojalá|necesito|busco|espero|mi meta|mi objetivo/i;
const fearKeywords = /miedo|terror|asusta|preocupa|insegur|estafa|no funcio|pierda|fraude|engaño/i;
const triggerKeywords = /inscrib|anotarme|empezar|cuánto sale|cómo me|dónde|quiero entrar|me interesa|link/i;

const categorized = {
  pains: [],
  desires: [],
  fears: [],
  triggers: [],
  uncategorized: [],
};

for (const quote of newQuotes) {
  if (painKeywords.test(quote)) categorized.pains.push(quote);
  else if (desireKeywords.test(quote)) categorized.desires.push(quote);
  else if (fearKeywords.test(quote)) categorized.fears.push(quote);
  else if (triggerKeywords.test(quote)) categorized.triggers.push(quote);
  else categorized.uncategorized.push(quote);
}

// ── Load existing avatar-frases-reales.md to check for duplicates ──
const avatarPath = join(MEMORY_DIR, "avatar-frases-reales.md");
let existingPhrases = "";
if (existsSync(avatarPath)) {
  existingPhrases = readFileSync(avatarPath, "utf-8");
}

// Filter out quotes that already exist
const isNew = (quote) => !existingPhrases.includes(quote.substring(0, 40));
const newPains = categorized.pains.filter(isNew);
const newDesires = categorized.desires.filter(isNew);
const newFears = categorized.fears.filter(isNew);
const newTriggers = categorized.triggers.filter(isNew);
const newUncategorized = categorized.uncategorized.filter(isNew);
const totalNew = newPains.length + newDesires.length + newFears.length + newTriggers.length + newUncategorized.length;

// ── Append new quotes to avatar-frases-reales.md ──
if (totalNew > 0) {
  let append = `\n\n## Frases nuevas (${new Date().toISOString().split("T")[0]})\n`;
  if (newPains.length) {
    append += `\n### Dolores\n`;
    newPains.forEach(q => { append += `- "${q}"\n`; });
  }
  if (newDesires.length) {
    append += `\n### Deseos\n`;
    newDesires.forEach(q => { append += `- "${q}"\n`; });
  }
  if (newFears.length) {
    append += `\n### Miedos\n`;
    newFears.forEach(q => { append += `- "${q}"\n`; });
  }
  if (newTriggers.length) {
    append += `\n### Señales de compra\n`;
    newTriggers.forEach(q => { append += `- "${q}"\n`; });
  }
  if (newUncategorized.length) {
    append += `\n### Sin categorizar (revisar)\n`;
    newUncategorized.forEach(q => { append += `- "${q}"\n`; });
  }

  writeFileSync(avatarPath, existingPhrases + append);
}

// ── Save updated inteligencia-audiencia ──
const today = new Date().toISOString().split("T")[0];
const newAudienciaPath = join(DOWNLOADS_DIR, `inteligencia-audiencia-${today}.md`);

let audienciaMd = existingFile || "# Inteligencia de Audiencia — Bot WhatsApp ADP\n\n";

// Append update section
audienciaMd += `\n\n## Actualización ${today}\n\n`;
if (newStats.length) {
  audienciaMd += `### Stats nuevos\n`;
  newStats.forEach(s => { audienciaMd += `- ${s.context}\n`; });
}
audienciaMd += `### Frases extraídas: ${totalNew} nuevas (${newQuotes.size} totales en export)\n`;
audienciaMd += `- Dolores: ${newPains.length} nuevos\n`;
audienciaMd += `- Deseos: ${newDesires.length} nuevos\n`;
audienciaMd += `- Miedos: ${newFears.length} nuevos\n`;
audienciaMd += `- Señales de compra: ${newTriggers.length} nuevos\n`;

writeFileSync(newAudienciaPath, audienciaMd);

// ── Output ──
console.log(JSON.stringify({
  status: "OK",
  quotes_found: newQuotes.size,
  new_quotes_added: totalNew,
  breakdown: {
    pains: newPains.length,
    desires: newDesires.length,
    fears: newFears.length,
    triggers: newTriggers.length,
    uncategorized: newUncategorized.length,
  },
  stats_found: newStats.length,
  files_updated: [
    totalNew > 0 ? avatarPath : null,
    newAudienciaPath,
  ].filter(Boolean),
}, null, 2));
