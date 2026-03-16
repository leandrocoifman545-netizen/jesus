// Shared classification functions for angle family and body type inference.
// Used by coverage.ts and analytics route — single source of truth.

import type { StoredGeneration } from "../storage/local";

/**
 * Infer angle family from structured fields, falling back to text-based heuristics.
 */
export function inferAngleFamily(gen: StoredGeneration): string {
  const script = gen.script as any;
  if (script.angle_family) return script.angle_family;

  const text = [
    gen.title,
    gen.sessionNotes,
    script.platform_adaptation?.content_style,
    script.platform_adaptation?.key_considerations,
    gen.script.hooks?.[0]?.script_text,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/storytelling|historia|origen|fracaso|alumno/.test(text)) return "historia";
  if (/demo|proceso|paso a paso|pantalla|matemát/.test(text)) return "mecanismo";
  if (/anti.?gur|desconfianza|ciclo roto|desperdici|consumidor/.test(text)) return "confrontacion";
  if (/ventana|tendencia|nicho|oportunidad|economía del conocimiento/.test(text)) return "oportunidad";
  if (/mamá|jubilad|oficin|freelanc|joven|desemplead|emprendedor quemado/.test(text)) return "identidad";

  return "sin_clasificar";
}

/**
 * Infer body type from structured fields, falling back to text-based heuristics.
 */
export function inferBodyType(gen: StoredGeneration): string {
  const script = gen.script as any;
  if (script.body_type) return script.body_type;

  const framework = gen.script.development?.framework_used?.toLowerCase() || "";
  const sections = gen.script.development?.sections?.map((s: any) => s.section_name?.toLowerCase() || "").join(" ") || "";
  const text = `${framework} ${sections}`;

  if (/analog/.test(text)) return "analogia_extendida";
  if (/compar|camino|versus|vs/.test(text)) return "comparacion_caminos";
  if (/demo|proceso|paso/.test(text)) return "demo_proceso";
  if (/mito|creencia|demolici/.test(text)) return "demolicion_mito";
  if (/historia|giro|story/.test(text)) return "historia_con_giro";
  if (/pregunta|respuesta|q&a|obje/.test(text)) return "pregunta_respuesta";
  if (/futuro|día en la vida|future/.test(text)) return "un_dia_en_la_vida";
  if (/contraste|emocional|dolor/.test(text)) return "contraste_emocional";

  return "sin_clasificar";
}

/**
 * Infer emotional arc from structured fields, falling back to text-based heuristics.
 */
export function inferEmotionalArc(gen: StoredGeneration): string {
  const script = gen.script as any;

  // Check structured field first
  if (script.arc_narrative) {
    const arc = script.arc_narrative.toLowerCase();
    if (/revelaci|oportunidad/.test(arc) && !/provocaci/.test(arc)) return "revelacion_oportunidad";
    if (/dolor|esperanza/.test(arc)) return "dolor_esperanza";
    if (/confrontaci/.test(arc)) return "confrontacion_directa";
    if (/historia|personal/.test(arc)) return "historia_personal";
    if (/pregunta/.test(arc)) return "pregunta_tras_pregunta";
    if (/analog/.test(arc)) return "analogia";
    if (/futuro|sensorial/.test(arc)) return "futuro_sensorial";
    if (/provocaci|evidencia/.test(arc)) return "provocacion_evidencia";
    // Try numbered format: "#3 Confrontacion directa"
    const numMatch = arc.match(/#(\d)/);
    if (numMatch) {
      const map: Record<string, string> = {
        "1": "revelacion_oportunidad", "2": "dolor_esperanza",
        "3": "confrontacion_directa", "4": "historia_personal",
        "5": "pregunta_tras_pregunta", "6": "analogia",
        "7": "futuro_sensorial", "8": "provocacion_evidencia",
      };
      if (map[numMatch[1]]) return map[numMatch[1]];
    }
  }

  // Infer from body_type + angle_family combination
  const bodyType = script.body_type || "";
  const angleFamily = script.angle_family || "";
  const framework = script.development?.framework_used?.toLowerCase() || "";
  const text = `${bodyType} ${angleFamily} ${framework}`.toLowerCase();

  if (/historia_con_giro/.test(bodyType) && /historia/.test(angleFamily)) return "historia_personal";
  if (/demolicion_mito/.test(bodyType) && /confrontacion/.test(angleFamily)) return "confrontacion_directa";
  if (/analogia_extendida/.test(bodyType)) return "analogia";
  if (/pregunta_respuesta/.test(bodyType)) return "pregunta_tras_pregunta";
  if (/un_dia_en_la_vida/.test(bodyType)) return "futuro_sensorial";
  if (/demo_proceso/.test(bodyType)) return "revelacion_oportunidad";
  if (/contraste_emocional/.test(bodyType) && /confrontacion/.test(angleFamily)) return "provocacion_evidencia";
  if (/comparacion_caminos/.test(bodyType)) return "confrontacion_directa";

  // Fallback: infer from angle family alone
  if (/historia/.test(angleFamily)) return "historia_personal";
  if (/oportunidad/.test(angleFamily)) return "revelacion_oportunidad";
  if (/confrontacion/.test(angleFamily)) return "provocacion_evidencia";
  if (/mecanismo/.test(angleFamily)) return "revelacion_oportunidad";
  if (/identidad/.test(angleFamily)) return "dolor_esperanza";

  return "sin_clasificar";
}

/**
 * Infer segment from structured fields.
 */
export function inferSegment(gen: StoredGeneration): string {
  const script = gen.script as any;
  if (script.segment) return script.segment.toUpperCase();

  const text = [gen.title, gen.sessionNotes].filter(Boolean).join(" ").toLowerCase();
  const segMatch = text.match(/seg(?:mento)?\s*([abcd])/i);
  if (segMatch) return segMatch[1].toUpperCase();

  if (/mamá|mama|hijo|chicos/.test(text)) return "C";
  if (/jubilad|\+50|mayor/.test(text)) return "D";
  if (/freelanc|emprendedor|agencia/.test(text)) return "B";
  if (/joven|25|universidad/.test(text)) return "A";

  return "?";
}

/**
 * Extract tags from generation title/notes (fallback for old data without structured fields).
 * Used by coverage.ts for segment, funnel, niche extraction.
 */
export function extractTags(gen: StoredGeneration): {
  angle?: string;
  segment?: string;
  funnel?: string;
  bodyType?: string;
  niche?: string;
} {
  const script = gen.script as any;
  const text = [gen.title, gen.sessionNotes, script.development?.emotional_arc].filter(Boolean).join(" ").toLowerCase();

  const angles = [
    "latam", "consumidor ia", "mamá", "crianza", "ventas visibles",
    "storytelling", "edad", "anti-gurú", "ia desperdiciada",
    "colombia", "anti-estafa", "fitness", "skincare", "fotografía",
    "manualidades", "educación", "jardinería", "nutrición",
  ];
  const angle = angles.find((a) => text.includes(a));

  const segmentMatch = text.match(/seg(?:mento)?\s*([abcd])/i);
  const segment = segmentMatch ? segmentMatch[1].toUpperCase() : undefined;

  const funnels = ["tofu", "mofu", "bofu", "retarget", "evergreen"];
  const funnel = funnels.find((f) => text.includes(f));

  const bodyTypes = [
    "mecanismo", "idea de nicho", "cambio de creencia",
    "storytelling", "analogía", "comparación", "anti-gurú",
  ];
  const bodyType = bodyTypes.find((b) => text.includes(b));

  const nicheMatch = gen.title?.match(/(?:nicho|idea):\s*(.+?)(?:\s*[-—|]|$)/i);
  const niche = nicheMatch ? nicheMatch[1].trim() : undefined;

  return { angle, segment, funnel, bodyType, niche };
}
