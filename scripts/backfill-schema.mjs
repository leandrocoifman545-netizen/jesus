#!/usr/bin/env node
/**
 * Backfill de schema en generations: mapea valores legacy/typos a los canónicos
 * de arsenal-estructura.md. Hace backup automático antes de tocar nada.
 *
 * Usage: node scripts/backfill-schema.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync, statSync } from "fs";
import { join } from "path";

const DRY = process.argv.includes("--dry-run");
const DATA_DIR = join(import.meta.dirname, "..", ".data");
const GENERATIONS_DIR = join(DATA_DIR, "generations");
const BACKUP_DIR = join(DATA_DIR, `generations.backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`);

// Mapeos basados en arsenal-estructura.md (13 vehículos canónicos, 10 ventas canónicas)
const BODY_MAP = {
  "pregunta_y_respuesta": "pregunta_respuesta",         // typo
  "conversacion_experto_novato": "qa_conversacional",   // estilo Q&A entre 2
  "victor_elas_conversation": "qa_conversacional",      // estilo Q&A entre 2
  "storytelling_hollywood": "historia_con_giro",        // narrativa con giro
  "listicle": "tier_list_rating",                       // formato de lista/ranking
};
const SALE_MAP = {
  "ventana_oportunidad": "ventana_oportunidad_ia",      // canónico tiene _ia
  "cementerio_de_modelos": "cementerio_modelos",        // typo
  "contraste_negocio_fisico": "contraste_fisico",       // canónico más corto
  "tiempo_vs_escala": "tiempo_vs_dinero",               // variante semántica
  "prueba_personal": "prueba_diversidad",
  "historia_origen": "transparencia_total",
  "autoridad_por_origen": "transparencia_total",
  "custom": "prueba_diversidad",                        // placeholder genérico
};
const SEGMENT_MAP = {
  "C5": "D",         // cluster 5 (55+) → segment D más cercano
  "Todos": "A",      // sin segment específico → default A
};

const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
console.log(`📋 ${files.length} generations a procesar.\n`);

if (!DRY) {
  mkdirSync(BACKUP_DIR);
  for (const f of files) copyFileSync(join(GENERATIONS_DIR, f), join(BACKUP_DIR, f));
  console.log(`💾 Backup: ${BACKUP_DIR}\n`);
}

let changed = 0;
const summary = { body: 0, sale: 0, segment: 0 };
const samples = [];

for (const f of files) {
  let g;
  try { g = JSON.parse(readFileSync(join(GENERATIONS_DIR, f), "utf-8")); } catch { continue; }
  const s = g.script;
  if (!s) continue;
  const changes = [];
  if (s.body_type && BODY_MAP[s.body_type]) {
    changes.push(`body_type: ${s.body_type} → ${BODY_MAP[s.body_type]}`);
    s.body_type = BODY_MAP[s.body_type];
    summary.body++;
  }
  if (s.model_sale_type && SALE_MAP[s.model_sale_type]) {
    changes.push(`sale: ${s.model_sale_type} → ${SALE_MAP[s.model_sale_type]}`);
    s.model_sale_type = SALE_MAP[s.model_sale_type];
    summary.sale++;
  }
  if (s.segment && SEGMENT_MAP[s.segment]) {
    changes.push(`segment: ${s.segment} → ${SEGMENT_MAP[s.segment]}`);
    s.segment = SEGMENT_MAP[s.segment];
    summary.segment++;
  }
  if (changes.length) {
    if (samples.length < 5) samples.push(`  ${f.slice(0, 8)}: ${changes.join(", ")}`);
    if (!DRY) writeFileSync(join(GENERATIONS_DIR, f), JSON.stringify(g, null, 2));
    changed++;
  }
}

console.log(`Cambios:`);
console.log(`  body_type: ${summary.body}`);
console.log(`  model_sale_type: ${summary.sale}`);
console.log(`  segment: ${summary.segment}`);
console.log(`\nMuestra:`);
samples.forEach(s => console.log(s));
console.log(`\n${DRY ? "[DRY-RUN] Sin escribir." : `✅ ${changed} archivos modificados.`}`);
