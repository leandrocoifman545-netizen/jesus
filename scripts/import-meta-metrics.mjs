#!/usr/bin/env node
/**
 * Import Meta Ads metrics → actualiza generaciones con data real.
 *
 * Cierra el feedback loop: lo que funciona en Meta vuelve al sistema,
 * y el auto-brief sesga hacia lo que convierte.
 *
 * Uso:
 *   node scripts/import-meta-metrics.mjs metrics.csv
 *   node scripts/import-meta-metrics.mjs metrics.json
 *
 * Formato CSV esperado (export de Meta Ads Manager):
 *   ad_name, impressions, reach, clicks, ctr, cpc, cpl, conversions, spend, frequency
 *
 * Formato JSON esperado:
 *   [{ "ad_name": "...", "impressions": 1000, ... }]
 *
 * Matching: busca el título del guion dentro del ad_name de Meta.
 * Después de importar, corre update-winners.mjs automáticamente.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GENS_DIR = join(DATA_DIR, "generations");

// ── Parse input ──
const inputFile = process.argv[2];
if (!inputFile) {
  console.log(`
Uso: node scripts/import-meta-metrics.mjs <archivo.csv|json>

Formato CSV (desde Meta Ads Manager → Export):
  ad_name, impressions, reach, clicks, ctr, cpc, cpl, conversions, spend, frequency

Formato JSON:
  [{ "ad_name": "Guion titulo...", "impressions": 1000, "ctr": 2.5, ... }]

El script matchea ad_name con el título de cada generación y guarda las métricas.
`);
  process.exit(1);
}

function parseCSV(content) {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      const val = values[i] || "";
      // Try to parse numbers
      const num = parseFloat(val.replace(/[%$,]/g, ""));
      obj[h] = isNaN(num) ? val : num;
    });
    return obj;
  });
}

function parseJSON(content) {
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : data.data || data.ads || [];
}

// ── Load metrics ──
const content = readFileSync(inputFile, "utf-8");
const ext = extname(inputFile).toLowerCase();
let metrics;
try {
  metrics = ext === ".json" ? parseJSON(content) : parseCSV(content);
} catch (err) {
  console.error(`Error parseando ${inputFile}: ${err.message}`);
  process.exit(1);
}

console.log(`Métricas cargadas: ${metrics.length} ads\n`);

// ── Load generations ──
const genFiles = readdirSync(GENS_DIR).filter(f => f.endsWith(".json"));
const generations = genFiles.map(f => {
  try {
    const data = JSON.parse(readFileSync(join(GENS_DIR, f), "utf-8"));
    data._filename = f;
    return data;
  } catch { return null; }
}).filter(Boolean);

console.log(`Generaciones cargadas: ${generations.length}\n`);

// ── Match & update ──
let matched = 0;
let unmatched = [];

for (const ad of metrics) {
  const adName = (ad.ad_name || ad.name || ad.titulo || "").toLowerCase();
  if (!adName) continue;

  // Find best matching generation
  const gen = generations.find(g => {
    const title = (g.title || "").toLowerCase();
    const id = (g.id || "").toLowerCase();
    // Match if title is contained in ad_name or vice versa
    return title && (adName.includes(title) || title.includes(adName) || adName.includes(id));
  });

  if (gen) {
    // Update generation with metrics
    gen.metaMetrics = {
      impressions: ad.impressions || 0,
      reach: ad.reach || 0,
      clicks: ad.clicks || ad.link_clicks || 0,
      ctr: ad.ctr || 0,
      cpc: ad.cpc || ad.cost_per_click || 0,
      cpl: ad.cpl || ad.cost_per_lead || ad.cost_per_result || 0,
      conversions: ad.conversions || ad.results || 0,
      spend: ad.spend || ad.amount_spent || 0,
      frequency: ad.frequency || 0,
      importedAt: new Date().toISOString(),
    };

    // Auto-promote to winner if CPL is good (configurable threshold)
    if (gen.metaMetrics.cpl > 0 && gen.metaMetrics.conversions >= 3) {
      if (!gen.status || gen.status === "recorded" || gen.status === "confirmed") {
        gen.status = "winner";
        console.log(`  WINNER  "${gen.title}" — CPL: $${gen.metaMetrics.cpl}, Conv: ${gen.metaMetrics.conversions}`);
      }
    }

    // Save updated generation
    const genPath = join(GENS_DIR, gen._filename);
    const { _filename, ...cleanGen } = gen;
    writeFileSync(genPath, JSON.stringify(cleanGen, null, 2));
    matched++;
    console.log(`  OK  "${gen.title}" ← CPL: $${gen.metaMetrics.cpl || "N/A"}, CTR: ${gen.metaMetrics.ctr}%`);
  } else {
    unmatched.push(adName.substring(0, 60));
  }
}

console.log(`\n━━━ Resultado ━━━`);
console.log(`Matched: ${matched}/${metrics.length}`);
if (unmatched.length > 0) {
  console.log(`\nSin match (${unmatched.length}):`);
  unmatched.forEach(name => console.log(`  ? ${name}`));
}

// ── Auto-run post-gen pipeline to update winner patterns ──
if (matched > 0) {
  console.log("\nActualizando winner patterns...");
  const { execSync } = await import("child_process");
  try {
    execSync("node scripts/update-winners.mjs", {
      encoding: "utf-8",
      cwd: join(import.meta.dirname, ".."),
      timeout: 15_000,
    });
    console.log("Winner patterns actualizados.");
  } catch (err) {
    console.log(`Warning: no se pudo actualizar winners — ${err.message?.split("\n")[0]}`);
  }
}
