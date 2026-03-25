#!/usr/bin/env node
/**
 * CROSS-REFERENCE: Pattern Library × ADP Generations
 *
 * Cruza los patrones detectados en perfiles de IG (pattern-library.json)
 * con los 36+ guiones generados por ADP para encontrar:
 *   - Qué patrones ya usamos
 *   - Cuáles están sobreexplotados
 *   - Cuáles son OPORTUNIDADES sin tocar (alto CLR en IG, 0 usos en ADP)
 *
 * Uso:
 *   node scripts/ig-cross-generations.mjs
 *
 * Output:
 *   .data/ig-references/pattern-coverage.json
 *   .data/ig-references/pattern-coverage.md
 */

import fs from "fs";
import path from "path";
import { classifyOpening, classifyBody, classifyClosing } from "./lib/classifiers.mjs";

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");
const GEN_DIR = path.join(process.cwd(), ".data", "generations");

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function round2(n) { return Math.round(n * 100) / 100; }

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function first3Sentences(text) {
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  return sentences.join(" ");
}

// ──────────────────────────────────────────
// Body type mapping: ADP body_type → pattern-library body patterns
// ──────────────────────────────────────────

const BODY_TYPE_MAP = {
  // Direct matches
  "caso_real":              "caso_real",
  "demo_proceso":           "demo_proceso",
  "analogia_extendida":     "analogia",
  "demolicion_mito":        "demolicion_objecion",
  "demolicion_alternativas": "demolicion_objecion",
  "pregunta_respuesta":     "qa_rapido",
  "qa_conversacional":      "qa_rapido",
  "historia_con_giro":      "caso_real",
  "comparacion_caminos":    "comparacion",
  "contraste_emocional":    "agitacion_fuerte",
  "un_dia_en_la_vida":      "future_pacing",
};

function mapBodyType(adpBodyType) {
  return BODY_TYPE_MAP[adpBodyType] || null;
}

// ──────────────────────────────────────────
// Status logic
// ──────────────────────────────────────────

function getStatus(uses) {
  if (uses === 0) return { label: "UNTAPPED", emoji: "\uD83C\uDD95" };   // 🆕
  if (uses <= 2)  return { label: "Underused", emoji: "\uD83D\uDD04" };  // 🔄
  if (uses <= 5)  return { label: "Used", emoji: "\u2705" };              // ✅
  return { label: "Overused", emoji: "\u26A0\uFE0F" };                    // ⚠️
}

// ──────────────────────────────────────────
// Load data
// ──────────────────────────────────────────

console.log("Cargando pattern-library.json...");
const libPath = path.join(REF_DIR, "pattern-library.json");
if (!fs.existsSync(libPath)) {
  console.error("ERROR: No existe pattern-library.json. Corré primero: node scripts/ig-patterns.mjs --all");
  process.exit(1);
}
const library = JSON.parse(fs.readFileSync(libPath, "utf8"));

console.log(`  ${library.opening_patterns.length} opening patterns, ${library.body_patterns.length} body patterns, ${library.closing_patterns.length} closing patterns`);

console.log("\nCargando generaciones...");
const genFiles = fs.readdirSync(GEN_DIR).filter(f => f.endsWith(".json"));
const generations = [];

for (const f of genFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(GEN_DIR, f), "utf8"));
    if (data.script) generations.push(data);
  } catch (err) {
    console.warn(`  Saltando ${f}: ${err.message}`);
  }
}

console.log(`  ${generations.length} generaciones cargadas`);

// ──────────────────────────────────────────
// Classify each generation
// ──────────────────────────────────────────

console.log("\nClasificando hooks de ADP con regex de ig-patterns...");

// Track opening pattern usage from ADP hooks
const adpOpeningCounts = {};  // pattern → count
const adpOpeningDetails = {}; // pattern → [{gen_id, hook_variant, text}]

for (const gen of generations) {
  const hooks = gen.script.hooks || [];
  for (const hook of hooks) {
    const text = first3Sentences(hook.script_text || "");
    const patterns = classifyOpening(text);
    for (const p of patterns) {
      adpOpeningCounts[p] = (adpOpeningCounts[p] || 0) + 1;
      if (!adpOpeningDetails[p]) adpOpeningDetails[p] = [];
      if (adpOpeningDetails[p].length < 3) {
        adpOpeningDetails[p].push({
          gen_id: gen.id,
          hook_variant: hook.variant_number,
          hook_type: hook.hook_type,
          text: text.slice(0, 120),
        });
      }
    }
  }
}

// Track body pattern usage from ADP body_type
const adpBodyCounts = {};
const adpBodyDetails = {};

for (const gen of generations) {
  const bodyType = gen.script.body_type;
  if (!bodyType) continue;

  const mapped = mapBodyType(bodyType);
  if (mapped) {
    adpBodyCounts[mapped] = (adpBodyCounts[mapped] || 0) + 1;
    if (!adpBodyDetails[mapped]) adpBodyDetails[mapped] = [];
    if (adpBodyDetails[mapped].length < 3) {
      adpBodyDetails[mapped].push({
        gen_id: gen.id,
        body_type: bodyType,
        niche: gen.script.niche,
        angle: gen.script.angle_specific,
      });
    }
  }

  // Also classify the body development text with regex for richer matching
  const devText = typeof gen.script.development === "string"
    ? gen.script.development
    : (gen.script.development?.sections || []).map(s => s.script_text || "").join(" ");

  if (devText) {
    const bodyPatterns = classifyBody(devText);
    for (const p of bodyPatterns) {
      adpBodyCounts[p] = (adpBodyCounts[p] || 0) + 1;
      if (!adpBodyDetails[p]) adpBodyDetails[p] = [];
      if (adpBodyDetails[p].length < 3) {
        adpBodyDetails[p].push({
          gen_id: gen.id,
          body_type: bodyType,
          niche: gen.script.niche,
          angle: gen.script.angle_specific,
          source: "regex_on_development",
        });
      }
    }
  }
}

// Track closing pattern usage from ADP CTA blocks + transition
const adpClosingCounts = {};
const adpClosingDetails = {};

for (const gen of generations) {
  const ctaBlocks = gen.script.cta_blocks || [];
  const transition = gen.script.transition_text || "";
  // Combine all CTA text
  const ctaTexts = ctaBlocks.map(b => {
    if (typeof b === "string") return b;
    return [b.text, b.script_text, b.content].filter(Boolean).join(" ");
  });
  const allCtaText = [transition, ...ctaTexts].join(" ");

  if (allCtaText.trim()) {
    const closingPatterns = classifyClosing(allCtaText, "");
    for (const p of closingPatterns) {
      adpClosingCounts[p] = (adpClosingCounts[p] || 0) + 1;
      if (!adpClosingDetails[p]) adpClosingDetails[p] = [];
      if (adpClosingDetails[p].length < 3) {
        adpClosingDetails[p].push({
          gen_id: gen.id,
          niche: gen.script.niche,
          text: allCtaText.slice(0, 120),
        });
      }
    }
  }
}

// ──────────────────────────────────────────
// Build coverage matrix
// ──────────────────────────────────────────

console.log("\nConstruyendo matriz de cobertura...\n");

function buildCoverage(libraryPatterns, adpCounts, adpDetails) {
  const rows = [];
  for (const lp of libraryPatterns) {
    const uses = adpCounts[lp.pattern] || 0;
    const status = getStatus(uses);
    rows.push({
      pattern: lp.pattern,
      ig_count: lp.count,
      ig_avg_clr: lp.avg_clr,
      ig_median_clr: lp.median_clr || 0,
      ig_profiles: lp.profiles || [],
      adp_uses: uses,
      status: status.label,
      status_emoji: status.emoji,
      adp_examples: adpDetails[lp.pattern] || [],
    });
  }

  // Also find ADP patterns NOT in the library (ADP-only patterns)
  const libraryPatternNames = new Set(libraryPatterns.map(p => p.pattern));
  for (const [pat, count] of Object.entries(adpCounts)) {
    if (!libraryPatternNames.has(pat)) {
      rows.push({
        pattern: pat,
        ig_count: 0,
        ig_avg_clr: 0,
        ig_median_clr: 0,
        ig_profiles: [],
        adp_uses: count,
        status: "ADP-only",
        status_emoji: "\uD83D\uDD35",  // 🔵
        adp_examples: adpDetails[pat] || [],
      });
    }
  }

  return rows;
}

const openingCoverage = buildCoverage(library.opening_patterns, adpOpeningCounts, adpOpeningDetails);
const bodyCoverage = buildCoverage(library.body_patterns, adpBodyCounts, adpBodyDetails);
const closingCoverage = buildCoverage(library.closing_patterns, adpClosingCounts, adpClosingDetails);

// ──────────────────────────────────────────
// Print console summary
// ──────────────────────────────────────────

function printTable(title, rows) {
  console.log(`\n${title}`);
  console.log("─".repeat(75));
  console.log(
    "Pattern".padEnd(25) + " | " +
    "IG avg CLR".padStart(10) + " | " +
    "ADP uses".padStart(8) + " | " +
    "Status"
  );
  console.log("─".repeat(75));

  // Sort: UNTAPPED first (by CLR desc), then underused, used, overused
  const statusOrder = { "UNTAPPED": 0, "Underused": 1, "Used": 2, "Overused": 3, "ADP-only": 4 };
  const sorted = [...rows].sort((a, b) => {
    const so = (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
    if (so !== 0) return so;
    return b.ig_avg_clr - a.ig_avg_clr;
  });

  for (const r of sorted) {
    const clrStr = r.ig_avg_clr > 0 ? (r.ig_avg_clr + "%") : "—";
    console.log(
      r.pattern.padEnd(25) + " | " +
      clrStr.padStart(10) + " | " +
      String(r.adp_uses).padStart(8) + " | " +
      `${r.status_emoji} ${r.status}`
    );
  }
}

printTable("OPENING PATTERNS:", openingCoverage);
printTable("BODY PATTERNS:", bodyCoverage);
printTable("CLOSING PATTERNS:", closingCoverage);

// ──────────────────────────────────────────
// Top 5 untapped opportunities
// ──────────────────────────────────────────

const allUntapped = [
  ...openingCoverage.filter(r => r.status === "UNTAPPED").map(r => ({ ...r, zone: "opening" })),
  ...bodyCoverage.filter(r => r.status === "UNTAPPED").map(r => ({ ...r, zone: "body" })),
  ...closingCoverage.filter(r => r.status === "UNTAPPED").map(r => ({ ...r, zone: "closing" })),
].sort((a, b) => b.ig_avg_clr - a.ig_avg_clr);

console.log("\n\n═══════════════════════════════════════════");
console.log("  TOP 5 OPORTUNIDADES SIN EXPLOTAR");
console.log("═══════════════════════════════════════════\n");

for (let i = 0; i < Math.min(5, allUntapped.length); i++) {
  const r = allUntapped[i];
  console.log(`  ${i + 1}. ${r.status_emoji} ${r.pattern} (${r.zone})`);
  console.log(`     IG: ${r.ig_count} usos, avg CLR ${r.ig_avg_clr}%`);
  console.log(`     Perfiles: ${r.ig_profiles.join(", ") || "—"}`);
  console.log();
}

if (allUntapped.length === 0) {
  console.log("  No hay patrones sin explotar — ADP cubre todos los patrones de la library.");
  console.log();
}

// ──────────────────────────────────────────
// Summary stats
// ──────────────────────────────────────────

const totalPatterns = openingCoverage.length + bodyCoverage.length + closingCoverage.length;
const untappedCount = allUntapped.length;
const underusedCount = [...openingCoverage, ...bodyCoverage, ...closingCoverage].filter(r => r.status === "Underused").length;
const usedCount = [...openingCoverage, ...bodyCoverage, ...closingCoverage].filter(r => r.status === "Used").length;
const overusedCount = [...openingCoverage, ...bodyCoverage, ...closingCoverage].filter(r => r.status === "Overused").length;

console.log(`Resumen: ${totalPatterns} patrones totales`);
console.log(`  🆕 UNTAPPED: ${untappedCount} | 🔄 Underused: ${underusedCount} | ✅ Used: ${usedCount} | ⚠️ Overused: ${overusedCount}`);

// ──────────────────────────────────────────
// Save JSON
// ──────────────────────────────────────────

const output = {
  generated_at: new Date().toISOString(),
  total_generations: generations.length,
  total_ig_videos: library.total_videos,
  ig_profiles: library.profiles,

  summary: {
    total_patterns: totalPatterns,
    untapped: untappedCount,
    underused: underusedCount,
    used: usedCount,
    overused: overusedCount,
  },

  top_untapped: allUntapped.slice(0, 10).map(r => ({
    pattern: r.pattern,
    zone: r.zone,
    ig_avg_clr: r.ig_avg_clr,
    ig_count: r.ig_count,
    ig_profiles: r.ig_profiles,
  })),

  opening_coverage: openingCoverage,
  body_coverage: bodyCoverage,
  closing_coverage: closingCoverage,
};

const jsonOutPath = path.join(REF_DIR, "pattern-coverage.json");
fs.writeFileSync(jsonOutPath, JSON.stringify(output, null, 2));
console.log(`\nGuardado: ${jsonOutPath}`);

// ──────────────────────────────────────────
// Save Markdown
// ──────────────────────────────────────────

function mdTable(rows) {
  // Sort: UNTAPPED first by CLR, then underused, used, overused
  const statusOrder = { "UNTAPPED": 0, "Underused": 1, "Used": 2, "Overused": 3, "ADP-only": 4 };
  const sorted = [...rows].sort((a, b) => {
    const so = (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
    if (so !== 0) return so;
    return b.ig_avg_clr - a.ig_avg_clr;
  });

  let md = "| Patrón | IG usos | IG avg CLR | ADP usos | Status |\n";
  md +=    "|--------|--------:|-----------:|---------:|--------|\n";

  for (const r of sorted) {
    const clrStr = r.ig_avg_clr > 0 ? `${r.ig_avg_clr}%` : "—";
    const igCount = r.ig_count > 0 ? String(r.ig_count) : "—";
    md += `| **${r.pattern}** | ${igCount} | ${clrStr} | ${r.adp_uses} | ${r.status_emoji} ${r.status} |\n`;
  }

  return md;
}

let md = `# Pattern Coverage: IG Library × ADP Generations\n\n`;
md += `> Generado: ${new Date().toISOString().slice(0, 10)}\n`;
md += `> ${generations.length} generaciones ADP × ${library.total_videos} videos IG (${library.profiles.map(p => "@" + p).join(", ")})\n\n`;

md += `## Resumen\n\n`;
md += `| Métrica | Valor |\n`;
md += `|---------|------:|\n`;
md += `| Patrones totales | ${totalPatterns} |\n`;
md += `| 🆕 UNTAPPED (0 usos ADP) | ${untappedCount} |\n`;
md += `| 🔄 Underused (1-2 usos) | ${underusedCount} |\n`;
md += `| ✅ Used (3-5 usos) | ${usedCount} |\n`;
md += `| ⚠️ Overused (6+ usos) | ${overusedCount} |\n\n`;

if (allUntapped.length > 0) {
  md += `## Top oportunidades sin explotar\n\n`;
  md += `Patrones con buen CLR en IG que ADP nunca usó.\n\n`;
  for (let i = 0; i < Math.min(10, allUntapped.length); i++) {
    const r = allUntapped[i];
    md += `${i + 1}. **${r.pattern}** (${r.zone}) — IG avg CLR ${r.ig_avg_clr}%, ${r.ig_count} usos en ${r.ig_profiles.join(", ")}\n`;
  }
  md += `\n`;
}

md += `---\n\n`;
md += `## OPENING PATTERNS (hooks)\n\n`;
md += `Clasificación por regex (primeras 3 oraciones del hook) — misma lógica que ig-patterns.mjs.\n\n`;
md += mdTable(openingCoverage);

md += `\n---\n\n`;
md += `## BODY PATTERNS\n\n`;
md += `Mapeo de body_type de ADP a patrones de la library + clasificación regex del texto del cuerpo.\n\n`;
md += mdTable(bodyCoverage);

md += `\n### Mapeo body_type → patrón\n\n`;
md += `| ADP body_type | → Patrón library |\n`;
md += `|---------------|------------------|\n`;
for (const [adp, lib] of Object.entries(BODY_TYPE_MAP)) {
  md += `| ${adp} | ${lib} |\n`;
}

md += `\n---\n\n`;
md += `## CLOSING PATTERNS (CTAs)\n\n`;
md += `Clasificación por regex del texto de transición + bloques CTA.\n\n`;
md += `> **NOTA:** En ads, los CTAs van en capas separadas (bloque CTA post-corte), por eso muchos clasifican como "sin_cta".\n`;
md += `> Pero el principio de **buildup antes del CTA** aplica igual: lo que pasa ANTES de "comentá X" o "link en bio" importa más que el CTA mismo.\n`;
md += `> Los patrones de cierre con mejor CLR (dm, desafío, cta_doble, open_loop) son transferibles a la **transición (Capa 1)** de ADP.\n\n`;
md += mdTable(closingCoverage);

md += `\n---\n\n`;
md += `## Cómo usar\n\n`;
md += `> **Aplica a orgánico Y ads.** Con Andromeda, Meta distribuye ambos con el mismo algoritmo.\n`;
md += `> Lo que retiene en un reel retiene en un ad. Las aperturas, buildups y cierres son transferibles.\n\n`;
md += `1. **Al armar plan semanal:** Priorizar patrones 🆕 UNTAPPED con alto CLR en IG\n`;
md += `2. **Al generar hooks:** Si hay opening patterns sin explotar, usarlos como hook_type\n`;
md += `3. **Rotar cuerpos:** Si un body pattern está ⚠️ Overused, elegir otro vehículo narrativo\n`;
md += `4. **Innovar en cierre/transición:** Probar closing patterns que en IG funcionan pero ADP no usó — especialmente buildup structures\n`;
md += `5. **Patrones ADP-only (🔵):** Son fórmulas que ADP inventó y los perfiles analizados no usan. Podrían ser ventajas competitivas o puntos ciegos.\n`;
md += `6. **Weighted CLR:** En pattern-library.json, el \`weighted_clr\` pondera posts recientes más alto (half-life 90 días). Priorizar patrones con weighted_clr alto.\n`;
md += `7. **Actualizar:** Correr de nuevo después de cada tanda de generaciones\n`;

const mdOutPath = path.join(REF_DIR, "pattern-coverage.md");
fs.writeFileSync(mdOutPath, md);
console.log(`Guardado: ${mdOutPath}`);

console.log("\nListo.");
