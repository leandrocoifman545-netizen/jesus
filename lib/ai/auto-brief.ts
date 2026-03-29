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
  ALL_AVATARS,
  ALL_AWARENESS_LEVELS,
  AVATAR_SEGMENT_MAP,
  AVATAR_BUYER_WEIGHTS,
  AWARENESS_LABELS,
  AWARENESS_CHANNEL_MAP,
} from "../constants/hook-types";
import { pickAngleForFamily, type AngleCandidate } from "./angle-discovery";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Pattern intelligence from IG analysis (pattern-coverage.json).
 * Suggests high-CLR opening patterns that ADP hasn't used yet.
 */
interface PatternSuggestion {
  pattern: string;
  zone: string;
  ig_avg_clr: number;
  ig_count: number;
  ig_profiles: string[];
}

async function loadUntappedPatterns(): Promise<PatternSuggestion[]> {
  try {
    const coveragePath = join(process.cwd(), ".data/ig-references/pattern-coverage.json");
    const raw = await readFile(coveragePath, "utf8");
    const data = JSON.parse(raw);
    // top_untapped is already sorted by CLR desc
    return (data.top_untapped || []).filter(
      (p: PatternSuggestion) => p.zone === "opening" && p.ig_avg_clr > 80
    );
  } catch {
    return [];
  }
}

/**
 * Compatibility matrix: which body_types work well with each angle_family.
 * If an angle has compatible types, auto-brief will prefer those over incompatible ones.
 * This prevents nonsensical combos like historia + pregunta_respuesta.
 */
const ANGLE_BODY_COMPAT: Record<string, string[]> = {
  identidad: ["historia_con_giro", "contraste_emocional", "un_dia_en_la_vida", "analogia_extendida"],
  oportunidad: ["demo_proceso", "comparacion_caminos", "demolicion_mito", "analogia_extendida", "demolicion_alternativas"],
  confrontacion: ["demolicion_mito", "comparacion_caminos", "contraste_emocional", "pregunta_respuesta", "demolicion_alternativas"],
  mecanismo: ["demo_proceso", "analogia_extendida", "demolicion_mito", "comparacion_caminos", "demolicion_alternativas"],
  historia: ["historia_con_giro", "un_dia_en_la_vida", "contraste_emocional", "analogia_extendida", "qa_conversacional"],
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
  avatar: string;
  awareness_level: number;
  discovered_angle: AngleCandidate | null; // enrichment from research data
  suggested_hook_pattern: PatternSuggestion | null; // from IG pattern intelligence
  constraints_text: string; // pre-formatted text to inject into the prompt
}

/**
 * Pick avatar using buyer weights × inverse coverage.
 * High-weight avatars (Roberto 30%, Patricia 26%) get selected more,
 * but underrepresented avatars get a boost to maintain diversity.
 * Martín (2% weight) is capped at ~1 of 10 scripts.
 */
function pickWeightedAvatar(
  all: readonly string[],
  counts: Record<string, number>,
  totalGenerations: number,
): string {
  const scores = all.map((avatar) => {
    const weight = AVATAR_BUYER_WEIGHTS[avatar] || 0.05;
    const used = counts[avatar] || 0;
    const targetCount = Math.max(1, Math.round(weight * totalGenerations));
    // Gap: how much this avatar is underrepresented vs its target
    const gap = Math.max(0, targetCount - used);
    // Score = buyer weight × (1 + gap bonus). Never-used avatars get extra boost.
    const score = weight * (1 + gap * 0.5 + (used === 0 ? 2 : 0));
    return { avatar, score };
  });

  // Weighted random selection from top candidates
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  let rand = Math.random() * totalScore;
  for (const s of scores) {
    rand -= s.score;
    if (rand <= 0) return s.avatar;
  }
  return scores[0].avatar;
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
  avatar?: string;
  awareness_level?: number;
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
  // Avatar selection: weighted by real buyer data (562 compradores)
  // Uses buyer weights × inverse coverage to balance representation with diversity
  const avatar = overrides?.avatar || pickWeightedAvatar(ALL_AVATARS, coverage.byAvatar, coverage.totalGenerations);
  // If no segment override, derive from avatar mapping (avatar is more specific than segment)
  const segment = overrides?.segment || AVATAR_SEGMENT_MAP[avatar] || pickLeastUsed(ALL_SEGMENTS, coverage.bySegment);

  // Awareness level selection (Schwartz 1-5)
  const awarenessLevelStrs = ALL_AWARENESS_LEVELS.map(String);
  const awarenessStr = overrides?.awareness_level
    ? String(overrides.awareness_level)
    : pickLeastUsed(awarenessLevelStrs, coverage.byAwareness);
  const awarenessLevel = parseInt(awarenessStr, 10);

  // Funnel routing: awareness 1-2 → RETARGET (orgánico), 3-5 → TOFU/MOFU (ads directos)
  let funnel: string;
  if (overrides?.funnel_stage) {
    funnel = overrides.funnel_stage;
  } else if (awarenessLevel <= 2) {
    // Levels 1-2 go to retargeting/organic — NOT direct ads
    funnel = "RETARGET";
  } else {
    funnel = pickLeastUsed(["TOFU", "MOFU"], coverage.byFunnel);
  }

  const modelSale = overrides?.model_sale_type || pickLeastUsed(ALL_MODEL_SALE_TYPES, coverage.byModelSaleType);
  const emotion = overrides?.emotion || ALL_EMOTIONS[Math.floor(Math.random() * ALL_EMOTIONS.length)];

  // Try to enrich with a discovered angle (niche + big idea from research)
  let discoveredAngle: AngleCandidate | null = null;
  try {
    discoveredAngle = await pickAngleForFamily(angle);
  } catch {
    // Non-critical — if angle discovery fails, we still have coverage-based selection
  }

  // Load IG pattern intelligence — suggest untapped opening patterns
  let hookPattern: PatternSuggestion | null = null;
  try {
    const untapped = await loadUntappedPatterns();
    if (untapped.length > 0) {
      // Weighted random: higher CLR = more likely to be picked, but still rotate
      const totalClr = untapped.reduce((s, p) => s + p.ig_avg_clr, 0);
      let rand = Math.random() * totalClr;
      for (const p of untapped) {
        rand -= p.ig_avg_clr;
        if (rand <= 0) { hookPattern = p; break; }
      }
      if (!hookPattern) hookPattern = untapped[0];
    }
  } catch {
    // Non-critical
  }

  // Format as hard constraints for the prompt
  const constraints = formatConstraints(coverage, {
    angle,
    body,
    segment,
    funnel,
    modelSale,
    emotion,
    avatar,
    awarenessLevel,
    discoveredAngle,
    hookPattern,
  });

  return {
    angle_family: angle,
    body_type: body,
    segment,
    funnel_stage: funnel,
    model_sale_type: modelSale,
    emotion,
    avatar,
    awareness_level: awarenessLevel,
    discovered_angle: discoveredAngle,
    suggested_hook_pattern: hookPattern,
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
    avatar: string;
    awarenessLevel: number;
    discoveredAngle: AngleCandidate | null;
    hookPattern: PatternSuggestion | null;
  },
): string {
  const totalGen = coverage.totalGenerations;
  const awarenessLabel = AWARENESS_LABELS[picks.awarenessLevel] || `Nivel ${picks.awarenessLevel}`;
  const awarenessChannels = AWARENESS_CHANNEL_MAP[picks.awarenessLevel] || ["ads_directos"];

  let text = `\n\n## SELECCIÓN AUTOMÁTICA (basada en ${totalGen} generaciones + research de Google Suggest)

### RESTRICCIONES DURAS — usá EXACTAMENTE estos valores:
- **Familia de ángulo:** ${picks.angle} (usado ${coverage.byAngle[picks.angle] || 0}/${totalGen} veces — sub-representado)
- **Tipo de cuerpo:** ${picks.body} (usado ${coverage.byBodyType[picks.body] || 0}/${totalGen} veces — sub-representado)
- **Segmento:** ${picks.segment} (usado ${coverage.bySegment[picks.segment] || 0}/${totalGen} veces)
- **Funnel:** ${picks.funnel} (usado ${coverage.byFunnel[picks.funnel] || 0}/${totalGen} veces)
- **Venta del modelo:** ${picks.modelSale} (usado ${coverage.byModelSaleType[picks.modelSale] || 0}/${totalGen} veces)
- **Arco emocional:** ${picks.emotion}
- **Avatar:** ${picks.avatar} (usado ${coverage.byAvatar[picks.avatar] || 0}/${totalGen} veces)
- **Nivel de conciencia (Schwartz):** ${picks.awarenessLevel} — ${awarenessLabel} (usado ${coverage.byAwareness[String(picks.awarenessLevel)] || 0}/${totalGen} veces)
- **Canales válidos para este nivel:** ${awarenessChannels.join(", ")}`;

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

  // Inject IG pattern intelligence — suggest opening pattern from untapped high-CLR patterns
  if (picks.hookPattern) {
    const hp = picks.hookPattern;
    text += `

### PATRÓN DE APERTURA SUGERIDO (inteligencia IG — ${hp.ig_count} videos, CLR ${hp.ig_avg_clr.toFixed(1)}%):
- **Patrón:** \`${hp.pattern}\` — ADP nunca lo usó, pero en IG genera CLR ${hp.ig_avg_clr.toFixed(1)}%
- **Perfiles que lo usan:** ${hp.ig_profiles.join(", ")}
- **Acción:** Al menos 1 de los 5 leads DEBE usar este patrón de apertura. No es el único — pero asegurate de que esté representado.
- **Referencia:** Ver pattern-library.md para ejemplos concretos de este patrón en acción.`;
  }

  text += `

### AVATAR — ESCRIBILE A ESTA PERSONA:
Estás escribiendo para **${picks.avatar}**. Leé su perfil completo en avatares-adp.md.
- Usá SU lenguaje, SUS frases textuales, SU situación concreta
- El lead debe sonar como si conocieras a ${picks.avatar} personalmente
- Los ejemplos y analogías del cuerpo deben resonar con SU vida
- SUS tensiones dominantes guían el arco emocional

### NIVEL DE CONCIENCIA (SCHWARTZ) — NIVEL ${picks.awarenessLevel}: ${awarenessLabel}
${picks.awarenessLevel === 1 ? `**UNAWARE:** El viewer NO sabe que tiene un problema. El guion tiene que DESPERTAR la conciencia del problema sin vender nada. Tono: educativo, revelador. CERO mención de producto o solución. Solo "¿sabías que...?" / "Lo que nadie te dice es..."` :
  picks.awarenessLevel === 2 ? `**PROBLEM AWARE:** El viewer SABE que tiene un problema pero no sabe que hay solución. El guion amplifica el dolor y revela que existe una salida. Tono: empático → esperanzador. Mencionar que hay solución pero NO nombrar el producto. "Hay una forma de..." / "Descubrí que..."` :
  picks.awarenessLevel === 3 ? `**SOLUTION AWARE:** El viewer sabe que hay soluciones pero no conoce la nuestra. El guion posiciona productos digitales con IA como LA solución. Tono: mecanismo + diferenciación. Nombrar el método, explicar por qué es diferente. CTA directo.` :
  picks.awarenessLevel === 4 ? `**PRODUCT AWARE:** El viewer ya conoce ADP / el taller. El guion refuerza beneficios, destruye objeciones restantes y empuja a la acción. Tono: prueba social + urgencia. Casos de éxito, garantía, escasez real.` :
  `**MOST AWARE:** El viewer ya casi compra. Solo necesita el empujón final. El guion es pura oferta: precio, garantía, bonus, deadline. Tono: directo, sin rodeos. "¿Qué estás esperando?" / "Hoy se cierra."`}

### ESTO NO ES SUGERENCIA — ES OBLIGATORIO:
- El campo "angle_family" del JSON DEBE ser "${picks.angle}"
- El campo "body_type" del JSON DEBE ser "${picks.body}"
- El campo "segment" del JSON DEBE ser "${picks.segment}"
- El campo "funnel_stage" del JSON DEBE ser "${picks.funnel}"
- El campo "model_sale_type" del JSON DEBE ser "${picks.modelSale}"
- El campo "avatar" del JSON DEBE ser "${picks.avatar}"
- El campo "awareness_level" del JSON DEBE ser ${picks.awarenessLevel}
- El arco emocional del cuerpo DEBE seguir: ${picks.emotion}
- Si alguno de estos campos no coincide con lo especificado acá, el guion se va a RECHAZAR y regenerar.`;

  return text;
}
