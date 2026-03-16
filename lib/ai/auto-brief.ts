/**
 * Auto-brief: smart selection of script parameters based on coverage data
 * AND discovered angles from research/trends.
 *
 * When the user doesn't specify angle, body type, segment, niche, etc.,
 * this module picks the LEAST USED option from each dimension AND enriches
 * it with a concrete niche + big idea from Google Suggest research data.
 *
 * The result is diverse by construction AND grounded in real search data.
 */

import { getCoverage, type CoverageData } from "../coverage";
import {
  ALL_ANGLE_FAMILIES,
  ALL_BODY_TYPES,
  ALL_SEGMENTS,
  ALL_FUNNELS,
} from "../constants/hook-types";
import { pickAngleForFamily, type AngleCandidate } from "./angle-discovery";

/**
 * Compatibility matrix: which body_types work well with each angle_family.
 * If an angle has compatible types, auto-brief will prefer those over incompatible ones.
 * This prevents nonsensical combos like historia + pregunta_respuesta.
 */
const ANGLE_BODY_COMPAT: Record<string, string[]> = {
  identidad: ["historia_con_giro", "contraste_emocional", "un_dia_en_la_vida", "analogia_extendida"],
  oportunidad: ["demo_proceso", "comparacion_caminos", "demolicion_mito", "analogia_extendida"],
  confrontacion: ["demolicion_mito", "comparacion_caminos", "contraste_emocional", "pregunta_respuesta"],
  mecanismo: ["demo_proceso", "analogia_extendida", "demolicion_mito", "comparacion_caminos"],
  historia: ["historia_con_giro", "un_dia_en_la_vida", "contraste_emocional", "analogia_extendida"],
};

const ALL_MODEL_SALE_TYPES = [
  "cementerio_de_modelos",
  "transparencia_total",
  "ventana_oportunidad",
  "contraste_fisico",
  "eliminacion_barreras",
  "matematica_simple",
  "lean_anti_riesgo",
  "tiempo_vs_dinero",
  "democratizacion_ia",
  "prueba_diversidad",
];

const ALL_EMOTIONS = [
  "indignación → determinación",
  "miedo → alivio",
  "curiosidad → ambición",
  "frustración → esperanza",
  "vergüenza → orgullo",
  "envidia → motivación",
  "aburrimiento → urgencia",
  "desconfianza → convicción",
];

export interface AutoBriefResult {
  angle_family: string;
  body_type: string;
  segment: string;
  funnel_stage: string;
  model_sale_type: string;
  emotion: string;
  discovered_angle: AngleCandidate | null; // enrichment from research data
  constraints_text: string; // pre-formatted text to inject into the prompt
}

/**
 * Pick the least-used value from a dimension, with randomness among ties.
 */
function pickLeastUsed(
  all: readonly string[],
  counts: Record<string, number>,
): string {
  const withCounts = all.map((item) => ({
    item,
    count: counts[item] || 0,
  }));
  const minCount = Math.min(...withCounts.map((x) => x.count));
  const candidates = withCounts.filter((x) => x.count === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)].item;
}

/**
 * Build smart auto-selections based on coverage gaps + research data.
 * Only fills in what's missing — if the user already specified something,
 * pass it as `overrides` and it won't be auto-selected.
 */
export async function buildAutoBrief(overrides?: {
  angle_family?: string;
  body_type?: string;
  segment?: string;
  funnel_stage?: string;
  model_sale_type?: string;
  emotion?: string;
}): Promise<AutoBriefResult> {
  const coverage = await getCoverage();

  const angle = overrides?.angle_family || pickLeastUsed(ALL_ANGLE_FAMILIES, coverage.byAngle);

  // Pick body_type compatible with the selected angle (if not overridden)
  let body: string;
  if (overrides?.body_type) {
    body = overrides.body_type;
  } else {
    const compatTypes = ANGLE_BODY_COMPAT[angle];
    if (compatTypes && compatTypes.length > 0) {
      // Prefer compatible types, but still pick least-used among them
      body = pickLeastUsed(compatTypes, coverage.byBodyType);
    } else {
      body = pickLeastUsed(ALL_BODY_TYPES, coverage.byBodyType);
    }
  }
  const segment = overrides?.segment || pickLeastUsed(ALL_SEGMENTS, coverage.bySegment);
  const funnel = overrides?.funnel_stage || pickLeastUsed(ALL_FUNNELS, coverage.byFunnel);
  const modelSale = overrides?.model_sale_type || pickLeastUsed(ALL_MODEL_SALE_TYPES, coverage.byModelSaleType);
  const emotion = overrides?.emotion || ALL_EMOTIONS[Math.floor(Math.random() * ALL_EMOTIONS.length)];

  // Try to enrich with a discovered angle (niche + big idea from research)
  let discoveredAngle: AngleCandidate | null = null;
  try {
    discoveredAngle = await pickAngleForFamily(angle);
  } catch {
    // Non-critical — if angle discovery fails, we still have coverage-based selection
  }

  // Format as hard constraints for the prompt
  const constraints = formatConstraints(coverage, {
    angle,
    body,
    segment,
    funnel,
    modelSale,
    emotion,
    discoveredAngle,
  });

  return {
    angle_family: angle,
    body_type: body,
    segment,
    funnel_stage: funnel,
    model_sale_type: modelSale,
    emotion,
    discovered_angle: discoveredAngle,
    constraints_text: constraints,
  };
}

function formatConstraints(
  coverage: CoverageData,
  picks: {
    angle: string;
    body: string;
    segment: string;
    funnel: string;
    modelSale: string;
    emotion: string;
    discoveredAngle: AngleCandidate | null;
  },
): string {
  const totalGen = coverage.totalGenerations;

  let text = `\n\n## SELECCIÓN AUTOMÁTICA (basada en ${totalGen} generaciones + research de Google Suggest)

### RESTRICCIONES DURAS — usá EXACTAMENTE estos valores:
- **Familia de ángulo:** ${picks.angle} (usado ${coverage.byAngle[picks.angle] || 0}/${totalGen} veces — sub-representado)
- **Tipo de cuerpo:** ${picks.body} (usado ${coverage.byBodyType[picks.body] || 0}/${totalGen} veces — sub-representado)
- **Segmento:** ${picks.segment} (usado ${coverage.bySegment[picks.segment] || 0}/${totalGen} veces)
- **Funnel:** ${picks.funnel} (usado ${coverage.byFunnel[picks.funnel] || 0}/${totalGen} veces)
- **Venta del modelo:** ${picks.modelSale} (usado ${coverage.byModelSaleType[picks.modelSale] || 0}/${totalGen} veces)
- **Arco emocional:** ${picks.emotion}`;

  // Inject discovered angle with concrete niche + big idea
  if (picks.discoveredAngle) {
    const da = picks.discoveredAngle;
    text += `

### ÁNGULO DESCUBIERTO (de research real — Google Suggest × 5 países LATAM):
- **Nicho sugerido:** ${da.niche}
- **Big idea:** ${da.big_idea}
- **Keyword de origen:** "${da.keyword || "N/A"}" (score: ${da.keyword_score || 0})
- **Fuente:** ${da.source}

USALO como base para el nicho del guion. Podés adaptarlo (hacerlo más específico, cruzarlo con el segmento ${picks.segment}) pero NO lo ignores — esta big idea viene de búsquedas REALES de gente REAL.`;
  } else {
    text += `

### SIN DATOS DE RESEARCH
No hay research reciente disponible. Elegí un nicho ESPECÍFICO (2+ palabras) siguiendo la regla anti-nicho genérico.
Para alimentar el discovery: correr \`node scripts/research-angles.mjs\` y \`node scripts/trends-scan.mjs\`.`;
  }

  text += `

### ESTO NO ES SUGERENCIA — ES OBLIGATORIO:
- El campo "angle_family" del JSON DEBE ser "${picks.angle}"
- El campo "body_type" del JSON DEBE ser "${picks.body}"
- El campo "segment" del JSON DEBE ser "${picks.segment}"
- El campo "funnel_stage" del JSON DEBE ser "${picks.funnel}"
- El campo "model_sale_type" del JSON DEBE ser "${picks.modelSale}"
- El arco emocional del cuerpo DEBE seguir: ${picks.emotion}
- Si alguno de estos campos no coincide con lo especificado acá, el guion se va a RECHAZAR y regenerar.`;

  return text;
}
