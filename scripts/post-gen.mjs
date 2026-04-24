#!/usr/bin/env node
/**
 * Post-Generation Pipeline — corre TODO lo que antes era manual después de generar.
 *
 * Ejecuta en orden:
 *   1. extract-session-insights.mjs → actualiza session-insights.md
 *   2. update-winners.mjs → actualiza winner-patterns-auto.md (win rates)
 *   3. update-coverage.mjs → actualiza matriz de cobertura
 *
 * NOTA (2026-04-24): extract-winner-patterns.mjs fue removido del pipeline.
 * El archivo winner-patterns.md ahora se mantiene MANUALMENTE con los winners
 * validados del reporte de performance Meta Ads (umbral: ≥100 ventas + ROAS ≥1).
 * Regenerarlo automáticamente reintroducía data de ads fatigados / sin validar.
 *
 * Usage: node scripts/post-gen.mjs
 * Se ejecuta automáticamente después de cada /guion (ver CLAUDE.md)
 */
import { execSync } from "child_process";
import { join } from "path";

const SCRIPTS_DIR = import.meta.dirname;

const steps = [
  { name: "Session insights", script: "extract-session-insights.mjs" },
  { name: "Win rates (auto)", script: "update-winners.mjs" },
  { name: "Coverage matrix", script: "update-coverage.mjs" },
];

console.log("━━━ Post-Generation Pipeline ━━━\n");

let ok = 0;
let fail = 0;

for (const step of steps) {
  const path = join(SCRIPTS_DIR, step.script);
  try {
    const output = execSync(`node "${path}"`, {
      encoding: "utf-8",
      timeout: 30_000,
      cwd: join(SCRIPTS_DIR, ".."),
    });
    // Show last meaningful line
    const lastLine = output.trim().split("\n").pop();
    console.log(`  OK  ${step.name} → ${lastLine}`);
    ok++;
  } catch (err) {
    console.log(`  FAIL  ${step.name} → ${err.message?.split("\n")[0] || "error"}`);
    fail++;
  }
}

console.log(`\n━━━ Resultado: ${ok} OK, ${fail} FAIL ━━━`);
process.exit(fail > 0 ? 1 : 0);
