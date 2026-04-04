#!/usr/bin/env node
/**
 * Evaluador de CALIDAD de análisis de stories/destacadas.
 * Usa Claude API para comparar el análisis contra el benchmark de Joaco Coronel.
 *
 * Se ejecuta DESPUÉS del linter de estructura (validate-analysis.mjs).
 * El linter chequea que las secciones EXISTAN. Este script chequea que sean BUENAS.
 *
 * Uso: node scripts/quality-check-analysis.mjs <path-to-analysis.md>
 * Output: JSON { "decision": "allow"|"block", "reason": "..." }
 */
import { readFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const BENCHMARK_PATH = join(DATA_DIR, "analisis-joaco-coronel-benchmark.md");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/quality-check-analysis.mjs <file.md>");
  process.exit(1);
}

// ── Read files ──
let analysis, benchmark;
try {
  analysis = readFileSync(filePath, "utf-8");
} catch {
  console.error(`Cannot read analysis: ${filePath}`);
  process.exit(1);
}
try {
  benchmark = readFileSync(BENCHMARK_PATH, "utf-8");
} catch {
  // If benchmark doesn't exist, allow (can't compare)
  console.log(JSON.stringify({ decision: "allow", reason: "Benchmark not found, skipping quality check" }));
  process.exit(0);
}

// ── Truncate if too long (keep under 50K chars each) ──
const MAX_CHARS = 50000;
if (analysis.length > MAX_CHARS) analysis = analysis.slice(0, MAX_CHARS) + "\n[...truncated]";
if (benchmark.length > MAX_CHARS) benchmark = benchmark.slice(0, MAX_CHARS) + "\n[...truncated]";

// ── Get API key ──
let apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  try {
    const envFile = readFileSync(join(import.meta.dirname, "..", ".env.local"), "utf-8");
    const match = envFile.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch {}
}
if (!apiKey) {
  // No API key = can't evaluate, allow through
  console.log(JSON.stringify({ decision: "allow", reason: "No ANTHROPIC_API_KEY, skipping quality check" }));
  process.exit(0);
}

// ── Call Claude API to evaluate ──
const EVAL_PROMPT = `Sos un evaluador estricto de análisis de stories de Instagram. Tu trabajo es comparar un análisis contra un benchmark de calidad y detectar secciones superficiales.

## BENCHMARK (así debe verse un análisis de calidad):
<benchmark>
${benchmark}
</benchmark>

## ANÁLISIS A EVALUAR:
<analysis>
${analysis}
</analysis>

## INSTRUCCIONES DE EVALUACIÓN

Evaluá CADA una de estas secciones del análisis. Para cada una, dá un score de 1 a 5:

1. **Pasada 3 (Ausencias):** ¿Cada ausencia tiene una explicación de POR QUÉ es deliberada? ¿Conecta con axiomas? En el benchmark, cada ausencia tiene "Por qué" específico. Score 1-2 = solo lista sin explicar. Score 3 = explica pero genérico. Score 4-5 = explica con axiomas y es específico al creador.

2. **Pasada 4 (Modelos mentales):** ¿Cada modelo explica CÓMO PIENSA el creador (no solo qué hace)? En el benchmark: "Estoy dando una clase, no vendiendo" explica el PRINCIPIO detrás de todas las decisiones. Score 1-2 = describe acciones. Score 3 = principios genéricos. Score 4-5 = principios que GENERAN las decisiones observadas.

3. **Pasada 6 (Símbolos):** ¿Cada símbolo tiene INTERPRETACIÓN de significado, no solo descripción? En el benchmark: "Gorra = casual/identidad" no alcanza — "Gorra = igualdad con el viewer, anti-guru" sí. Score 1-2 = lista objetos. Score 3 = interpreta obvio. Score 4-5 = interpretación que el viewer siente pero no articula.

4. **Pasada 7 (Ritmo):** ¿Analiza POR QUÉ ciertas partes son lentas y otras rápidas? ¿O solo lista duraciones? Score 1-2 = tabla de duraciones sin análisis. Score 3 = menciona lento/rápido. Score 4-5 = explica la FUNCIÓN del ritmo en cada sección.

5. **Transferencias:** ¿Las 7 columnas tienen contenido ESPECÍFICO al creador y al proyecto destino? ¿O dicen "igual que la referencia"? Score 1-2 = genérico/copia. Score 3 = adapta pero obvio. Score 4-5 = encuentra OPORTUNIDADES que la referencia NO tiene.

6. **Predicciones:** ¿Las 3 predicciones predicen algo NO OBVIO? ¿La respuesta demuestra comprensión profunda? Score 1-2 = obvias. Score 3 = interesantes. Score 4-5 = revelan algo que no se ve sin análisis profundo.

## OUTPUT REQUERIDO

Respondé SOLO con JSON válido, sin markdown ni explicaciones:
{
  "scores": {
    "ausencias": N,
    "modelos_mentales": N,
    "simbolos": N,
    "ritmo": N,
    "transferencias": N,
    "predicciones": N
  },
  "lowest_score": N,
  "lowest_section": "nombre",
  "feedback": "feedback específico para la sección más baja — qué falta y cómo mejorarlo",
  "overall": N
}

Donde overall = promedio de los 6 scores, redondeado a 1 decimal.
Si overall < 3.0 o ANY score < 2: el análisis es insuficiente.
Sé ESTRICTO. El benchmark es 4.5+. Un análisis promedio es 3.0.`;

try {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: EVAL_PROMPT }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    // API error = allow through (don't block on infra issues)
    console.log(JSON.stringify({ decision: "allow", reason: `API error (${response.status}), skipping quality check` }));
    process.exit(0);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  // Parse JSON from response
  let evalResult;
  try {
    // Try to extract JSON from the response (might have markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      evalResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found");
    }
  } catch {
    console.log(JSON.stringify({ decision: "allow", reason: "Could not parse evaluator response, skipping" }));
    process.exit(0);
  }

  const overall = evalResult.overall || 0;
  const lowest = evalResult.lowest_score || 0;
  const lowestSection = evalResult.lowest_section || "desconocida";
  const feedback = evalResult.feedback || "";
  const scores = evalResult.scores || {};

  // Format score card
  const scoreCard = Object.entries(scores)
    .map(([k, v]) => `  ${k}: ${v}/5`)
    .join("\n");

  if (overall < 3.0 || lowest < 2) {
    console.log(JSON.stringify({
      decision: "block",
      reason: [
        `🚫 CALIDAD INSUFICIENTE (${overall}/5.0 — mínimo 3.0)`,
        "",
        "Scores por sección:",
        scoreCard,
        "",
        `⚠️ Sección más baja: ${lowestSection} (${lowest}/5)`,
        `Feedback: ${feedback}`,
        "",
        "Mejorá las secciones con score < 3 y volvé a guardar.",
      ].join("\n"),
    }));
    process.exit(1);
  } else {
    console.log(JSON.stringify({
      decision: "allow",
      reason: [
        `✅ CALIDAD APROBADA (${overall}/5.0)`,
        "",
        "Scores:",
        scoreCard,
        ...(lowest < 3 ? [`\n⚠️ Atención: ${lowestSection} tiene ${lowest}/5 — considerar mejorar`] : []),
      ].join("\n"),
    }));
    process.exit(0);
  }

} catch (err) {
  // Network/runtime error = allow through
  console.log(JSON.stringify({ decision: "allow", reason: `Runtime error: ${err.message}, skipping quality check` }));
  process.exit(0);
}
