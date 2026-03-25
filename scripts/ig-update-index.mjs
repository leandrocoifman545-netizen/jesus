#!/usr/bin/env node
/**
 * Auto-genera INDEX.md desde metrics-summary.json + pattern-library.json
 * Nunca más se desactualiza.
 *
 * Uso: node scripts/ig-update-index.mjs
 * (Se corre automáticamente al final de ig-pipeline.mjs)
 */

import fs from "fs";
import path from "path";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");
const summaryPath = path.join(REF_DIR, "metrics-summary.json");
const patternPath = path.join(REF_DIR, "pattern-library.json");

if (!fs.existsSync(summaryPath)) {
  console.error("Primero corré: node scripts/ig-analyze.mjs --all");
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const patterns = fs.existsSync(patternPath) ? JSON.parse(fs.readFileSync(patternPath, "utf8")) : null;

let md = `# Índice de Análisis de Perfiles de Instagram\n\n`;
md += `> Última actualización: ${new Date().toISOString().slice(0, 10)} (auto-generado por ig-update-index.mjs)\n`;
md += `> Total: ${summary.total_posts_analyzed} posts, ${summary.total_transcripts} transcripciones, ${summary.total_hooks} hooks\n\n`;
md += `---\n\n`;

// Comparison table
md += `## Tabla comparativa\n\n`;
md += `| Perfil | Posts | Videos | Avg Views | CLR Global | CTA Mult | Top Keyword | Transcripciones |\n`;
md += `|--------|------:|-------:|----------:|-----------:|---------:|------------|----------------:|\n`;

for (const p of summary.profiles.filter(p => p.posts > 0)) {
  const kw = p.top_keyword ? `${p.top_keyword.keyword} (${p.top_keyword.clr}%)` : "N/A";
  md += `| **@${p.username}** | ${p.posts} | ${p.videos} | ${p.avg_views.toLocaleString()} | ${p.clr_global}% | ${p.cta_multiplier}x | ${kw} | ${p.transcripts} |\n`;
}

md += `\n---\n\n`;

// Pattern insights (if available)
if (patterns) {
  md += `## Patrones cross-profile (${patterns.total_videos} videos)\n\n`;

  md += `### Aperturas que más engagement generan\n\n`;
  md += `| Patrón | Usos | Avg CLR | Perfiles |\n`;
  md += `|--------|-----:|--------:|---------|\n`;
  for (const p of patterns.opening_patterns.filter(p => p.count >= 5).slice(0, 8)) {
    md += `| **${p.pattern}** | ${p.count} | ${p.avg_clr}% | ${p.profiles.join(", ")} |\n`;
  }

  md += `\n### Cierres que más comments generan\n\n`;
  md += `| Patrón | Usos | Avg CLR | Perfiles |\n`;
  md += `|--------|-----:|--------:|---------|\n`;
  for (const p of patterns.closing_patterns.filter(p => p.count >= 5).slice(0, 6)) {
    md += `| **${p.pattern}** | ${p.count} | ${p.avg_clr}% | ${p.profiles.join(", ")} |\n`;
  }

  md += `\n---\n\n`;
}

// Files per profile
md += `## Archivos disponibles por perfil\n\n`;
md += `| Perfil | .json | _transcripts | _metrics | _tables | _patterns | _analisis | _videos/ |\n`;
md += `|--------|:-----:|:------------:|:--------:|:-------:|:---------:|:---------:|:--------:|\n`;

for (const p of summary.profiles) {
  const u = p.username;
  const exists = (f) => fs.existsSync(path.join(REF_DIR, f)) ? "✅" : "❌";
  const videoDir = path.join(REF_DIR, `${u}_videos`);
  const videoCount = fs.existsSync(videoDir) ? fs.readdirSync(videoDir).filter(f => f.endsWith(".mp4")).length : 0;

  md += `| @${u} | ${exists(u + ".json")} | ${exists(u + "_transcripts.json")} | ${exists(u + "_metrics.json")} | ${exists(u + "_tables.md")} | ${exists(u + "_patterns.json")} | ${exists(u + "_analisis.md")} | ${videoCount > 0 ? `✅ (${videoCount})` : "❌"} |\n`;
}

md += `\n---\n\n`;

// Cross-analysis docs
md += `## Documentos de análisis cruzado\n\n`;

const crossDocs = [
  { file: "pattern-library.md", desc: "Patrones de apertura×cuerpo×cierre cross-profile con CLR" },
  { file: "pattern-library.json", desc: "Misma data en JSON (machine-readable)" },
  { file: "metrics-summary.json", desc: "KPIs comparativos de todos los perfiles" },
  { file: "patrones-organico-ig.md", desc: "14 reglas accionables para ADP (de 4 perfiles)" },
  { file: "cross_analysis.md", desc: "Duración × CTA × CLR, sweet spots, outliers" },
  { file: "caption_analysis.md", desc: "Palabras × CLR, caption length sweet spot" },
  { file: "temporal_analysis.md", desc: "Keyword decay, frecuencia, timing" },
  { file: "herasmedia_hooks_bank.md", desc: "167 hooks categorizados con métricas" },
  { file: "tino_beat_mapping.md", desc: "28 videos mapeados beat-por-beat + 8 templates" },
];

md += `| Archivo | Qué contiene | Existe |\n`;
md += `|---------|-------------|:------:|\n`;
for (const d of crossDocs) {
  const exists = fs.existsSync(path.join(REF_DIR, d.file)) ? "✅" : "❌";
  md += `| \`${d.file}\` | ${d.desc} | ${exists} |\n`;
}

md += `\n---\n\n`;

// Scripts
md += `## Scripts disponibles\n\n`;
md += `| Script | Qué hace |\n`;
md += `|--------|----------|\n`;
md += `| \`ig-pipeline.mjs @user\` | Pipeline completo: scrape→download→transcribe→analyze |\n`;
md += `| \`ig-analyze.mjs --all\` | Regenera métricas + comparativa cross-profile |\n`;
md += `| \`ig-patterns.mjs --all --export\` | Análisis de patrones estructurales + pattern-library.md |\n`;
md += `| \`ig-search.mjs "término"\` | Búsqueda cross-profile en transcripciones + captions |\n`;
md += `| \`ig-search.mjs --top-hooks 30\` | Top hooks por CLR cross-profile |\n`;
md += `| \`ig-update-index.mjs\` | Regenera este INDEX.md |\n`;

const outPath = path.join(REF_DIR, "INDEX.md");
fs.writeFileSync(outPath, md);
console.log(`INDEX.md actualizado: ${outPath}`);
