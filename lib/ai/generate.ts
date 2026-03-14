import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts/system";
import { SYSTEM_PROMPT_LONGFORM } from "./prompts/system-longform";
import { AVATAR_CONTEXT } from "./prompts/avatar-context";
import { TONE_JESUS } from "./prompts/tone-jesus";
import { TECHNIQUES_CONTEXT } from "./prompts/techniques";
import {
  type ScriptOutput,
  type Hook,
  type DevelopmentSection,
} from "./schemas/script-output";
import { type LongformOutput, type LongformOutputMode } from "./schemas/longform-output";
import { type ReferenceAnalysis } from "./schemas/reference-analysis";
import { listReferences, listGenerations, getBurnedLeads, getCaseStudies } from "../storage/local";
import { getCoverage } from "../coverage";
import { getAudienceContext } from "../knowledge/audience";
import { getObjectionsContext } from "../knowledge/objections";

export type ContentType = "shortform" | "longform";

export interface BriefInput {
  productDescription: string;
  targetAudience: string;
  brandTone?: string;
  platform?: string;
  hookCount: number;
  additionalNotes?: string;
  references?: string[];
  brandDocument?: string;
  generationRules?: string; // project-specific rules (overrides generic system prompt where they conflict)
  projectId?: string; // used to filter winners by project + coverage gaps
  useCaseStudy?: boolean; // whether this script should include a case study fragment
  // Long-form specific
  contentType?: ContentType;
  outputMode?: LongformOutputMode; // "full_script" | "structure"
  targetDurationMinutes?: number; // 8-20 min
  youtubeReferences?: string[]; // transcriptions of YouTube reference videos
}

const FORMAT_LABELS: Record<string, string> = {
  vertical_ad: "Vertical Ad (9:16)",
  vertical_organic: "Vertical Orgánico (9:16)",
  horizontal_ad: "Horizontal Ad (16:9)",
};

// Keep backwards compat for old platform values
const LEGACY_FORMAT_MAP: Record<string, string> = {
  tiktok: "vertical_ad",
  reels: "vertical_ad",
  shorts: "vertical_ad",
};

// --- Clients ---

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no está configurada. Agregala en .env.local");
  return new Anthropic({ apiKey });
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada. Agregala en .env.local");
  return new GoogleGenAI({ apiKey });
}

// --- JSON Schema descriptions for Claude ---

const SCRIPT_SCHEMA_DESC = `Responde con un JSON con esta estructura exacta:
{
  "platform_adaptation": {
    "platform": string (DEBE ser uno de: "Vertical Ad (9:16)", "Vertical Orgánico (9:16)", "Horizontal Ad (16:9)"),
    "recommended_duration_seconds": number,
    "content_style": string,
    "key_considerations": string
  },
  "visual_format": {
    "format_name": string (nombre del formato visual, ej: "Talking Head", "Split Screen", "Gameplay Background"),
    "difficulty_level": number (1 a 5, donde 1 es solo cámara y 5 requiere producción compleja),
    "setup_instructions": string (instrucciones de setup para el equipo de grabación),
    "recording_notes": string (notas adicionales para la sesión de grabación)
  },
  "hooks": [{
    "variant_number": number,
    "hook_type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico",
    "script_text": string,
    "timing_seconds": number
  }],
  "development": {
    "framework_used": string (ej: "PAS", "AIDA", "BAB", "Hook-Story-Offer", "3_Acts", u otro que aplique),
    "emotional_arc": string,
    "sections": [{
      "section_name": string,
      "is_rehook": boolean,
      "script_text": string,
      "timing_seconds": number
    }]
  },
  "cta": {
    "verbal_cta": string,
    "reason_why": string,
    "timing_seconds": number,
    "cta_type": "directo" | "reframe" | "embedded_command" | "micro_compromiso" | "exclusion" | "conversacional" | "custom"
  },
  "ingredients_used": [
    {
      "category": string ("A" a "K"),
      "ingredient_number": number (1-127),
      "ingredient_name": string (nombre exacto del ingrediente)
    }
  ],
  "model_sale_type": string ("cementerio_de_modelos" | "transparencia_total" | "ventana_oportunidad" | "contraste_fisico" | "eliminacion_barreras" | "matematica_simple" | "lean_anti_riesgo" | "tiempo_vs_dinero" | "democratizacion_ia" | "prueba_diversidad"),
  "offer_bridge": {
    "product_type": "webinar_gratis" | "taller_5" | "custom",
    "script_text": string (texto que vende QUE se lleva el viewer al hacer clic — 3 promesas: encontrar + crear + vender),
    "timing_seconds": number
  },
  "body_type": string ("demolicion_mito" | "historia_con_giro" | "demo_proceso" | "comparacion_caminos" | "un_dia_en_la_vida" | "pregunta_respuesta" | "analogia_extendida" | "contraste_emocional"),
  "angle_family": string ("identidad" | "oportunidad" | "confrontacion" | "mecanismo" | "historia"),
  "angle_specific": string (ej: "1.2_oficinista_atrapado", "3.4_comparacion_social"),
  "segment": string ("A" | "B" | "C" | "D"),
  "funnel_stage": string ("TOFU" | "MOFU" | "BOFU"),
  "niche": string (nicho específico del guion, ej: "recetas para diabéticos"),
  "belief_change": {
    "old_belief": string (creencia vieja que el viewer tiene),
    "mechanism": string (mecanismo que la refuta),
    "new_belief": string (creencia nueva que adopta)
  },
  "transition_text": string (1 oración que conecta el ejemplo del body con el bloque CTA genérico),
  "total_duration_seconds": number,
  "word_count": number
}`;

const HOOKS_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "hooks": [{
    "variant_number": number,
    "hook_type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico",
    "script_text": string,
    "timing_seconds": number
  }]
}`;

const SINGLE_HOOK_SCHEMA_DESC = `Responde con un JSON con esta estructura (un solo hook, NO un array):
{
  "variant_number": number,
  "hook_type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico",
  "script_text": string,
  "timing_seconds": number
}`;

const SECTION_SCHEMA_DESC = `Responde con un JSON con esta estructura (una sola sección):
{
  "section_name": string,
  "is_rehook": boolean,
  "script_text": string,
  "timing_seconds": number
}`;

const CTA_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "verbal_cta": string,
  "reason_why": string,
  "timing_seconds": number,
  "cta_type": "directo" | "reframe" | "embedded_command" | "micro_compromiso" | "exclusion" | "conversacional" | "custom"
}`;

const REFERENCE_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "hook": {
    "text": string,
    "type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico",
    "word_count": number,
    "estimated_seconds": number
  },
  "structure": {
    "framework": "AIDA" | "PAS" | "BAB" | "Hook-Story-Offer" | "3_Acts" | "other",
    "sections": [{ "name": string, "summary": string, "estimated_seconds": number }],
    "has_rehook": boolean,
    "rehook_text": string | null
  },
  "tone": {
    "primary_tone": string,
    "formality_level": "very_casual" | "casual" | "neutral" | "formal" | "very_formal",
    "uses_first_person": boolean,
    "ugc_style": boolean,
    "humor_level": "none" | "light" | "moderate" | "heavy",
    "key_phrases": string[]
  },
  "cta": {
    "text": string,
    "type": "directo" | "reframe" | "embedded_command" | "micro_compromiso" | "exclusion" | "conversacional" | "custom" | "none",
    "has_urgency": boolean,
    "has_reason_why": boolean,
    "is_dual": boolean
  },
  "estimated_total_duration_seconds": number,
  "total_word_count": number,
  "emotional_arc": string,
  "strengths": string[],
  "patterns_to_replicate": string[]
}`;

// --- Brief context builders ---

function resolveFormat(platform?: string): string {
  if (!platform) return "vertical_ad";
  return LEGACY_FORMAT_MAP[platform] || platform;
}

/** Extract segment (A/B/C/D) from brief fields if mentioned. */
function extractSegment(brief: BriefInput): string | undefined {
  const haystack = `${brief.additionalNotes || ""} ${brief.targetAudience || ""}`;
  const match = haystack.match(/\bseg(?:mento)?\s*([abcd])\b/i);
  return match ? match[1].toUpperCase() : undefined;
}

function buildBriefContext(brief: BriefInput): string {
  const format = resolveFormat(brief.platform);
  const formatLabel = FORMAT_LABELS[format] || format;

  let prompt = `## BRIEF DEL CLIENTE

**Producto/Servicio:** ${brief.productDescription}

**Público Objetivo:** ${brief.targetAudience}`;

  if (brief.brandTone) {
    prompt += `\n\n**Tono de Marca:** ${brief.brandTone}`;
  } else {
    prompt += `\n\n**Tono de Marca:** Elegí el tono más apropiado según el producto y la audiencia.`;
  }

  prompt += `\n\n**Formato:** ${formatLabel}`;

  // Extract duration from additionalNotes if specified (e.g. "[DURACIÓN: 60s]")
  const durationMatch = brief.additionalNotes?.match(/\[DURACIÓN:\s*(\d+)s?\]/i);
  const targetDuration = durationMatch ? parseInt(durationMatch[1], 10) : null;
  if (targetDuration) {
    prompt += `\n\n**Duración objetivo:** ${targetDuration} segundos`;
  } else {
    prompt += `\n\n**Duración objetivo:** 60 a 90 segundos (elegí la duración óptima según la complejidad del producto)`;
  }

  if (brief.brandDocument) {
    prompt += `\n\n## DOCUMENTO DE MARCA (información adicional del cliente)\n${brief.brandDocument}`;
  }

  if (brief.additionalNotes) {
    prompt += `\n\n**Notas Adicionales:** ${brief.additionalNotes}`;
  }

  if (brief.references && brief.references.length > 0) {
    prompt += `\n\n## REFERENCIAS DE ANUNCIOS GANADORES\nAnaliza el estilo, estructura y tono de estas referencias y replícalo:\n`;
    brief.references.forEach((ref, i) => {
      prompt += `\n### Referencia ${i + 1}:\n${ref}\n`;
    });
  }

  return prompt;
}

function buildLearnedPatterns(refs: { analysis: ReferenceAnalysis }[]): string {
  if (refs.length === 0) return "";

  try {
  // Extract principles, not structures to copy
  const allPatterns = refs.flatMap((r) => r.analysis.patterns_to_replicate);
  const uniquePatterns = [...new Set(allPatterns)].slice(0, 12);

  const allStrengths = refs.flatMap((r) => r.analysis.strengths);
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 8);

  const keyPhrases = [...new Set(refs.flatMap((r) => r.analysis.tone.key_phrases))].slice(0, 10);

  const rehookCount = refs.filter((r) => r.analysis.structure.has_rehook).length;
  const ugcCount = refs.filter((r) => r.analysis.tone.ugc_style).length;

  // Stats for context only (NOT as instructions to copy)
  const hookTypeCounts: Record<string, number> = {};
  refs.forEach((r) => { hookTypeCounts[r.analysis.hook.type] = (hookTypeCounts[r.analysis.hook.type] || 0) + 1; });
  const frameworkCounts: Record<string, number> = {};
  refs.forEach((r) => { frameworkCounts[r.analysis.structure.framework] = (frameworkCounts[r.analysis.structure.framework] || 0) + 1; });

  // Identify over-represented combos to AVOID repeating
  const topFramework = Object.entries(frameworkCounts).sort((a, b) => b[1] - a[1])[0];
  const topHookType = Object.entries(hookTypeCounts).sort((a, b) => b[1] - a[1])[0];

  let section = `\n\n## PRINCIPIOS VALIDADOS POR ${refs.length} ADS GANADORES

Los siguientes PRINCIPIOS fueron extraídos de ads reales con buen performance.
Aplicalos como guía, pero NO copies la estructura ni el ángulo exacto de los winners.
Cada guion nuevo debe tener su PROPIA combinación de framework + hook type + nicho.

### Principios de retención (aplicar siempre)
- ${rehookCount}/${refs.length} winners usan re-hook → incluí re-hook en videos de 20s+
- ${ugcCount}/${refs.length} son estilo UGC conversacional → el tono mentor/directo funciona
- Frases que conectan: ${keyPhrases.map((p) => `"${p}"`).join(", ")}

### Principios de estructura (aplicar el concepto, no la estructura exacta)
${uniqueStrengths.map((s) => `- ${s}`).join("\n")}

### Principios de copywriting (aplicar creativamente)
${uniquePatterns.map((p) => `- ${p}`).join("\n")}

### DIVERSIDAD OBLIGATORIA
Los winners analizados tienden a usar ${topFramework ? topFramework[0] : "un mismo framework"} y hooks tipo ${topHookType ? topHookType[0] : "similar"}.
Para evitar saturar la audiencia, PRIORIZÁ frameworks y hook types DIFERENTES a los más usados en winners.
Usá los principios de arriba pero con combinaciones frescas.`;

  return section;
  } catch (err) {
    console.error("[buildLearnedPatterns] Error procesando referencias:", err);
    return "";
  }
}

async function buildWinnerExamples(projectId?: string): Promise<string> {
  try {
    const generations = await listGenerations();
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

    // All winners
    const allWinners = generations.filter((g) => g.status === "winner");
    if (allWinners.length === 0) return "";

    // Separate by project: same project = full context, other projects = principles only
    const sameProject = projectId
      ? allWinners.filter((g) => g.projectId === projectId)
      : allWinners;
    const otherProjects = projectId
      ? allWinners.filter((g) => g.projectId && g.projectId !== projectId)
      : [];

    let section = `\n\n## WINNERS INTERNOS (guiones nuestros que funcionaron en ads)\n`;
    section += `IMPORTANTE: Estos son referencia de CALIDAD y TONO, no moldes para copiar.\n`;
    section += `Aplicá los principios pero con ángulo, nicho y estructura DIFERENTES.\n`;

    // Same-project winners with temporal decay
    if (sameProject.length > 0) {
      section += `\n### Winners de este proyecto (máxima relevancia)\n`;
      const sorted = sameProject.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      for (const w of sorted.slice(0, 5)) {
        const age = now - new Date(w.createdAt).getTime();
        let freshness: string;
        if (age < ONE_WEEK) freshness = "RECIENTE — principios + estilo muy relevantes";
        else if (age < ONE_MONTH) freshness = "2-4 semanas — principios relevantes, no repetir estructura";
        else freshness = "antiguo — solo principios generales aplican";

        const hooks = w.script.hooks.slice(0, 2).map((h) => `"${h.script_text.slice(0, 60)}..." (${h.hook_type})`).join(" | ");
        const framework = w.script.development.framework_used;

        section += `\n**${w.title || "Sin título"}** [${freshness}]`;
        section += `\n- Framework: ${framework} | ${w.script.total_duration_seconds}s`;
        section += `\n- Leads usados: ${hooks}`;
        if (w.sessionNotes) section += `\n- Qué funcionó: ${w.sessionNotes}`;
        if (w.metrics?.notes) section += `\n- Métricas: ${w.metrics.notes}`;

        // Only include full body for recent winners
        if (age < ONE_WEEK) {
          const body = w.script.development.sections.map((s) => s.script_text).join(" ");
          section += `\n- Cuerpo: ${body.slice(0, 250)}${body.length > 250 ? "..." : ""}`;
        }
        section += `\n- ⚠️ NO repetir: ${framework} + ${w.script.hooks[0]?.hook_type}. Usá otra combinación.\n`;
      }
    }

    // Other-project winners: only principles
    if (otherProjects.length > 0) {
      section += `\n### Principios de winners de otros proyectos (solo referencia de tono/retención)\n`;
      const otherSorted = otherProjects.slice(0, 3);
      for (const w of otherSorted) {
        section += `- ${w.title || "Sin título"}: ${w.script.development.framework_used}, tono ${w.script.platform_adaptation.content_style || "conversacional"}`;
        if (w.sessionNotes) section += ` — ${w.sessionNotes}`;
        section += `\n`;
      }
    }

    return section;
  } catch (err) {
    console.error("[buildWinnerExamples] Error cargando winners:", err);
    return "";
  }
}

async function buildCoverageGaps(projectId?: string): Promise<string> {
  try {
    const coverage = await getCoverage();

    // Only show gaps if there's enough data to be meaningful
    if (coverage.totalGenerations < 5) return "";

    const gaps = coverage.gaps;

    // Find over-represented frameworks and hook types
    const fwEntries = Object.entries(coverage.byFramework).sort((a, b) => b[1] - a[1]);
    const hookEntries = Object.entries(coverage.byLeadType).sort((a, b) => b[1] - a[1]);
    const overusedFw = fwEntries.filter(([, count]) => count > coverage.totalGenerations * 0.3);
    const underusedFw = fwEntries.filter(([, count]) => count <= 2).map(([name]) => name);
    const underusedHooks = hookEntries.filter(([, count]) => count <= 2).map(([name]) => name);

    if (gaps.length === 0 && overusedFw.length === 0 && underusedFw.length === 0) return "";

    let section = `\n\n## COBERTURA ACTUAL — PRIORIZÁ LO QUE FALTA\n`;

    if (overusedFw.length > 0) {
      section += `\n### Frameworks sobre-representados (EVITAR salvo que el brief lo requiera)\n`;
      for (const [name, count] of overusedFw) {
        section += `- ${name}: usado ${count}/${coverage.totalGenerations} veces → NO usar salvo justificación\n`;
      }
    }

    if (underusedFw.length > 0) {
      section += `\n### Frameworks sub-representados (PRIORIZAR)\n`;
      section += `- Probá: ${underusedFw.join(", ")}\n`;
    }

    if (underusedHooks.length > 0) {
      section += `\n### Hook types poco usados (PRIORIZAR)\n`;
      section += `- Probá: ${underusedHooks.join(", ")}\n`;
    }

    if (gaps.length > 0) {
      section += `\n### Gaps detectados\n`;
      for (const gap of gaps.slice(0, 8)) {
        section += `- ${gap}\n`;
      }
    }

    return section;
  } catch (err) {
    console.error("[buildCoverageGaps] Error computando cobertura:", err);
    return "";
  }
}

async function buildCaseStudiesContext(useCaseStudy: boolean): Promise<string> {
  if (!useCaseStudy) return "";

  try {
    const cases = await getCaseStudies();
    if (cases.length === 0) return "";

    let section = `\n\n## CASO DE ÉXITO DISPONIBLE — USALO EN ESTE GUION

Tenés los siguientes casos de éxito REALES para incluir en este guion.
Elegí el que mejor encaje con el ángulo y usá UN FRAGMENTO adaptado al contexto.

REGLAS:
- NUNCA mencionar "academia de publicistas" ni el producto original. Adaptá la historia al contexto de ADP/productos digitales con IA.
- Usá máximo 1 caso por guion.
- Siempre marcá el corte con: [CORTE A: {archivo} — {nombre}] para que el editor sepa qué clip insertar.
- La transición tiene que ser natural: Jesús dice algo → corta al clip → vuelve a Jesús.
- El fragmento del caso de éxito va ENTRECOMILLADO (es lo que dice la persona en el video).

CASOS DISPONIBLES:\n`;

    for (const c of cases) {
      const nameLabel = c.name || "Persona anónima";
      const ageLabel = c.age ? `, ${c.age} años` : "";
      const locLabel = c.location ? `, ${c.location}` : "";

      section += `\n**${c.fileReference} — ${nameLabel}${ageLabel}${locLabel}**\n`;
      section += `- Antes: ${c.situationBefore}\n`;
      if (c.result) section += `- Resultado: ${c.result}\n`;
      section += `- Frase clave: "${c.keyQuote}"\n`;
      if (c.objection) section += `- Objeción que tenía: ${c.objection}\n`;
      section += `- Mejor para: ${c.bestFor}\n`;
      section += `- Usar como: ${c.useAs === "lead" ? "lead/hook" : c.useAs === "body_fragment" ? "fragmento en el cuerpo" : c.useAs === "pre_cta" ? "pre-CTA / cierre" : "respuesta a objeción"}\n`;
    }

    section += `\nEJEMPLO DE USO EN GUION:
[Jesús a cámara]: "Y no soy yo el que te lo dice."
[CORTE A: C1345 — Ernesto]: "Estaba trabajando en Uber, en gastronomía... hoy me dedico 100% a esto."
[Jesús a cámara]: "Ernesto tiene 39 años y vive en Buenos Aires. Esto es real."
`;

    return section;
  } catch (err) {
    console.error("[buildCaseStudiesContext] Error cargando casos:", err);
    return "";
  }
}

async function buildBurnedLeadsContext(): Promise<string> {
  try {
    const burned = await getBurnedLeads();
    if (burned.length === 0) return "";

    const leadTexts = burned.slice(-30).map((l) => `- "${l.text.slice(0, 80)}${l.text.length > 80 ? "..." : ""}"`).join("\n");
    return `\n\n## LEADS QUEMADOS (NO generar leads parecidos a estos — ya se usaron)
${leadTexts}

IMPORTANTE: No generar leads con el mismo ángulo + misma estructura que los quemados. Cada lead nuevo debe ser original.`;
  } catch (err) {
    console.error("[buildBurnedLeadsContext] Error cargando leads quemados:", err);
    return "";
  }
}

async function buildUserPrompt(brief: BriefInput): Promise<string> {
  let prompt = buildBriefContext(brief);

  const refs = await listReferences();
  prompt += buildLearnedPatterns(refs);

  // Inject winner examples (filtered by project, with decay)
  prompt += await buildWinnerExamples(brief.projectId);

  // Inject coverage gaps to drive diversity
  prompt += await buildCoverageGaps(brief.projectId);

  // Inject case studies if this script should use one
  prompt += await buildCaseStudiesContext(brief.useCaseStudy || false);

  // Inject real audience intelligence (pain points, desires, fears, triggers)
  const segment = extractSegment(brief);
  prompt += await getAudienceContext(segment);

  // Inject segment-specific objections to anticipate and address
  prompt += await getObjectionsContext(segment);

  // Inject burned leads to avoid repetition
  prompt += await buildBurnedLeadsContext();

  const format = resolveFormat(brief.platform);
  const formatLabel = FORMAT_LABELS[format] || format;

  prompt += `\n\n## INSTRUCCIÓN
Genera un guión publicitario completo en formato ${formatLabel} con:
1. ${brief.hookCount} variantes de hook de apertura (cada una con un tipo de hook diferente, numeradas del 1 al ${brief.hookCount})
2. Desarrollo del mensaje central (cuerpo del guión independiente de los hooks)
3. Cierre con CTA dual (verbal + visual)

IMPORTANTE: Los leads deben ser INDEPENDIENTES del cuerpo. Cualquier lead debe poder combinarse con el mismo desarrollo y CTA sin necesidad de modificar nada.

Adapta todo al formato ${formatLabel} y al público objetivo especificado.
${brief.brandTone ? `Respeta estrictamente el tono de marca: "${brief.brandTone}".` : "Elegí el tono más apropiado según el producto y la audiencia."}
Apuntá a una duración de ${brief.additionalNotes?.match(/\[DURACIÓN:\s*(\d+)s?\]/i)?.[1] ? `${brief.additionalNotes.match(/\[DURACIÓN:\s*(\d+)s?\]/i)![1]} segundos` : "entre 60 y 90 segundos"}.

Usá los datos reales del avatar (frases, tensiones, perfiles) para dar AUTENTICIDAD. Que suene como si conocieras a la persona.

${SCRIPT_SCHEMA_DESC}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después.`;

  return prompt;
}

function summarizeScript(script: ScriptOutput): string {
  const sections = script.development.sections
    .map((s) => `  - [${s.section_name}] (${s.timing_seconds}s): "${s.script_text}"`)
    .join("\n");

  return `## GUIÓN ACTUAL

**Formato:** ${script.platform_adaptation.platform}
**Framework:** ${script.development.framework_used}
**Arco emocional:** ${script.development.emotional_arc}
**Duración total:** ${script.total_duration_seconds}s

### Desarrollo actual:
${sections}

### CTA actual:
"${script.cta.verbal_cta}" (${script.cta.cta_type}, ${script.cta.timing_seconds}s)
Razón: ${script.cta.reason_why}`;
}

// --- Claude API call with prompt caching ---

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_MODEL_FAST = "claude-haiku-4-5-20251001";

function extractJSON(text: string): unknown {
  let cleaned = text.trim();
  // Strip markdown code blocks if present
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) cleaned = jsonMatch[1].trim();
  return JSON.parse(cleaned);
}

async function callClaude(
  userPrompt: string,
  learnedPatterns?: string,
  maxTokens = 16384,
  generationRules?: string,
): Promise<unknown> {
  const client = getAnthropicClient();

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
    // Avatar intelligence — cached, changes rarely
    {
      type: "text",
      text: AVATAR_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
    // Jesus tone + history — cached, changes rarely
    {
      type: "text",
      text: TONE_JESUS,
      cache_control: { type: "ephemeral" },
    },
    // Retention + sales techniques — cached
    {
      type: "text",
      text: TECHNIQUES_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
  ];

  // Project-specific generation rules (highest priority — overrides generic system prompt)
  if (generationRules) {
    systemBlocks.push({
      type: "text",
      text: `## REGLAS DEL PROYECTO (PRIORIDAD MÁXIMA — si hay conflicto con las reglas genéricas, estas GANAN)\n\n${generationRules}`,
      cache_control: { type: "ephemeral" },
    });
  }

  // Learned patterns as separate cached block (changes only when references change)
  if (learnedPatterns) {
    systemBlocks.push({
      type: "text",
      text: learnedPatterns,
      cache_control: { type: "ephemeral" },
    });
  }

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: systemBlocks,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.75,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de texto de Claude");
  }

  return extractJSON(textBlock.text);
}

// --- Post-generation validation ---

interface ValidationResult {
  passed: boolean;
  issues: string[];
}

async function validateScript(script: ScriptOutput, rules?: string): Promise<ValidationResult> {
  if (!rules) return { passed: true, issues: [] };

  try {
    const client = getAnthropicClient();
    const scriptJSON = JSON.stringify(script, null, 2);

    const response = await client.messages.create({
      model: CLAUDE_MODEL_FAST,
      max_tokens: 1024,
      system: [{ type: "text", text: "Sos un validador de guiones. Respondés SOLO con JSON." }],
      messages: [{
        role: "user",
        content: `Validá si este guion cumple con las reglas del proyecto. Revisá SOLO estas cosas:
1. ¿Los hooks/leads tienen 2-3 oraciones (no son frases sueltas de 5-10 palabras)?
2. ¿Usa voseo argentino ("tenés", "podés") y NUNCA "tú"?
3. ¿Tiene al menos 1 muletilla de Jesús ("La realidad es que...", "¿Me explico?", "Básicamente", "¿Me siguen?", "¿Viste?")?
4. ¿Tiene un re-hook si dura más de 20 segundos?
5. ¿Tiene al menos 3 números concretos (precios, cantidades, tiempos)?
6. ¿NO usa "trabajos" (debe decir "negocios")?
7. ¿NO usa porcentajes inventados en hooks?

GUION:
${scriptJSON}

REGLAS:
${rules.slice(0, 6000)}

Responde con JSON: {"passed": true/false, "issues": ["problema 1", "problema 2"]}
Solo marcá passed=false si hay problemas GRAVES (tú en vez de vos, hooks de 1 frase, sin números). Problemas menores = passed=true con issues informativos.`,
      }],
      temperature: 0.1,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { passed: true, issues: [] };
    return extractJSON(textBlock.text) as ValidationResult;
  } catch {
    // Validation failure shouldn't block generation
    return { passed: true, issues: [] };
  }
}

// --- Main generation functions (Claude) ---

export async function generateScript(brief: BriefInput): Promise<ScriptOutput> {
  const prompt = await buildUserPrompt(brief);
  const refs = await listReferences();
  const patterns = buildLearnedPatterns(refs);
  const promptWithoutPatterns = prompt.replace(patterns, "");

  let script = await callClaude(promptWithoutPatterns, patterns || undefined, 16384, brief.generationRules) as ScriptOutput;

  // Auto-validate and retry once if critical issues found
  if (brief.generationRules) {
    const validation = await validateScript(script, brief.generationRules);
    if (!validation.passed) {
      console.log("[validate] Issues found, regenerating:", validation.issues);
      const fixPrompt = promptWithoutPatterns + `\n\n## CORRECCIONES OBLIGATORIAS\nLa generación anterior tenía estos problemas. Corregí TODOS:\n${validation.issues.map((i) => `- ${i}`).join("\n")}`;
      script = await callClaude(fixPrompt, patterns || undefined, 16384, brief.generationRules) as ScriptOutput;
    }
  }

  return script;
}

export async function generateScriptStream(
  brief: BriefInput,
  onChunk: (text: string) => void,
): Promise<ScriptOutput> {
  const client = getAnthropicClient();
  const prompt = await buildUserPrompt(brief);
  const refs = await listReferences();
  const patterns = buildLearnedPatterns(refs);
  const promptWithoutPatterns = prompt.replace(patterns, "");

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: AVATAR_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
    // Jesus tone + history — cached, changes rarely
    {
      type: "text",
      text: TONE_JESUS,
      cache_control: { type: "ephemeral" },
    },
    // Retention + sales techniques — cached
    {
      type: "text",
      text: TECHNIQUES_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
  ];

  // Project-specific generation rules (highest priority)
  if (brief.generationRules) {
    systemBlocks.push({
      type: "text",
      text: `## REGLAS DEL PROYECTO (PRIORIDAD MÁXIMA — si hay conflicto con las reglas genéricas, estas GANAN)\n\n${brief.generationRules}`,
      cache_control: { type: "ephemeral" },
    });
  }

  if (patterns) {
    systemBlocks.push({
      type: "text",
      text: patterns,
      cache_control: { type: "ephemeral" },
    });
  }

  let fullText = "";

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 16384,
    system: systemBlocks,
    messages: [{ role: "user", content: promptWithoutPatterns }],
    temperature: 0.75,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullText += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  let script = extractJSON(fullText) as ScriptOutput;

  // Auto-validate streamed output and retry if critical issues
  if (brief.generationRules) {
    const validation = await validateScript(script, brief.generationRules);
    if (!validation.passed) {
      console.log("[validate-stream] Issues found, regenerating:", validation.issues);
      onChunk("\n\n--- VALIDANDO Y CORRIGIENDO ---\n\n");
      const fixPrompt = promptWithoutPatterns + `\n\n## CORRECCIONES OBLIGATORIAS\nLa generación anterior tenía estos problemas. Corregí TODOS:\n${validation.issues.map((i) => `- ${i}`).join("\n")}`;
      script = await callClaude(fixPrompt, patterns || undefined, 16384, brief.generationRules) as ScriptOutput;
    }
  }

  return script;
}

export async function analyzeTranscript(transcript: string): Promise<ReferenceAnalysis> {
  const client = getAnthropicClient();

  const prompt = `Analiza la siguiente transcripción de un anuncio de video vertical que tuvo buen performance.

Extrae:
1. El hook (primera frase), su tipo y duración estimada
2. La estructura del guión (framework, secciones, si tiene re-hook)
3. El tono (formalidad, UGC, humor, frases clave del estilo)
4. El CTA (texto, tipo, si tiene urgencia, si es dual verbal+visual)
5. Duración total estimada y conteo de palabras
6. El arco emocional
7. Las fortalezas principales del guión
8. Patrones específicos que vale la pena replicar en futuros guiones

TRANSCRIPCIÓN:
"""
${transcript}
"""

${REFERENCE_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL_FAST,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: "Eres un analista de publicidad para video vertical. Analizás transcripciones de anuncios exitosos y extraés patrones estructurales, de tono y de copywriting. Respondés únicamente con JSON válido.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de texto de Claude");
  }

  return extractJSON(textBlock.text) as ReferenceAnalysis;
}

export async function generateMoreHooks(
  brief: BriefInput,
  existingHooks: Hook[],
  count: number,
): Promise<Hook[]> {
  const existingList = existingHooks
    .map((h) => `- Hook ${h.variant_number} (${h.hook_type}): "${h.script_text}"`)
    .join("\n");

  const startNumber = existingHooks.length + 1;
  const burnedContext = await buildBurnedLeadsContext();

  const prompt = `${buildBriefContext(brief)}

## HOOKS EXISTENTES (NO repetir tipos ni ideas similares)
${existingList}
${burnedContext}

## INSTRUCCIÓN
Genera ${count} hooks NUEVOS para el mismo guión, numerados del ${startNumber} al ${startNumber + count - 1}.

REGLAS:
- Cada hook/lead debe usar un tipo DIFERENTE a los existentes. Si ya se usaron todos los tipos, podés repetir tipos pero con un ángulo completamente distinto.
- Los leads deben ser INDEPENDIENTES: cualquiera debe poder combinarse con el cuerpo del guión sin modificar nada.
- Mantené el mismo tono, formato y público objetivo del brief.
- Cada lead debe tener 2-3 ORACIONES (situación específica + gap de curiosidad + puente al cuerpo). NO frases sueltas de 5 palabras.

${HOOKS_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  const parsed = await callClaude(prompt, undefined, 8192, brief.generationRules) as { hooks: Hook[] };
  return parsed.hooks;
}

export async function regenerateSection(
  brief: BriefInput,
  script: ScriptOutput,
  sectionIndex: number,
): Promise<DevelopmentSection> {
  const section = script.development.sections[sectionIndex];

  const prompt = `${buildBriefContext(brief)}

${summarizeScript(script)}

## INSTRUCCIÓN
Regenerá ÚNICAMENTE la sección "${section.section_name}" (índice ${sectionIndex}) del desarrollo.

La sección actual es:
- Nombre: ${section.section_name}
- Script: "${section.script_text}"
- Duración: ${section.timing_seconds}s
${section.is_rehook ? "- Es un RE-HOOK" : ""}

REGLAS:
- Mantené el mismo nombre de sección y rol dentro del framework ${script.development.framework_used}.
- Generá un NUEVO script_text con un enfoque diferente pero que cumpla la misma función narrativa.
- Mantené una duración similar (~${section.timing_seconds}s).
- ${brief.brandTone ? `Respetá el tono de marca: "${brief.brandTone}".` : "Mantené el mismo tono del guión original."}
- Las secciones anterior y posterior deben seguir conectando bien. Contexto:
${sectionIndex > 0 ? `  Sección anterior: "${script.development.sections[sectionIndex - 1].script_text}"` : "  (Es la primera sección del desarrollo)"}
${sectionIndex < script.development.sections.length - 1 ? `  Sección siguiente: "${script.development.sections[sectionIndex + 1].script_text}"` : "  (Es la última sección antes del CTA)"}

${SECTION_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  return callClaude(prompt, undefined, 2048, brief.generationRules) as Promise<DevelopmentSection>;
}

export async function regenerateCTA(
  brief: BriefInput,
  script: ScriptOutput,
): Promise<ScriptOutput["cta"]> {
  const lastSection = script.development.sections.length > 0
    ? script.development.sections[script.development.sections.length - 1]
    : { section_name: "intro", script_text: "", timing_seconds: 0 };

  const prompt = `${buildBriefContext(brief)}

${summarizeScript(script)}

## INSTRUCCIÓN
Regenerá ÚNICAMENTE el CTA (Call To Action) del guión.

El CTA actual es:
- Verbal: "${script.cta.verbal_cta}"
- Razón: ${script.cta.reason_why}
- Tipo: ${script.cta.cta_type}
- Duración: ${script.cta.timing_seconds}s

REGLAS:
- Generá un CTA completamente NUEVO y DIFERENTE al actual.
- Debe ser CTA dual (verbal + visual/texto en pantalla).
- Máximo 8 palabras para el CTA verbal.
- Incluí un reason_why convincente.
- Mantené una duración similar (~${script.cta.timing_seconds}s).
- Debe conectar naturalmente con la última sección: "${lastSection.script_text}"
- ${brief.brandTone ? `Respetá el tono de marca: "${brief.brandTone}".` : "Mantené el mismo tono del guión original."}
- ${brief.platform ? `Formato: ${FORMAT_LABELS[resolveFormat(brief.platform)] || brief.platform}.` : "Mantené el mismo formato del guión original."}

${CTA_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  return callClaude(prompt, undefined, 1024, brief.generationRules) as Promise<ScriptOutput["cta"]>;
}

export async function regenerateHook(
  brief: BriefInput,
  script: ScriptOutput,
  hookIndex: number,
): Promise<Hook> {
  const hook = script.hooks[hookIndex];

  const otherHooks = script.hooks
    .filter((_, i) => i !== hookIndex)
    .map((h) => `- Hook ${h.variant_number} (${h.hook_type}): "${h.script_text}"`)
    .join("\n");

  const burnedContext = await buildBurnedLeadsContext();

  const prompt = `${buildBriefContext(brief)}

${summarizeScript(script)}

## HOOK A REGENERAR
- Variante #${hook.variant_number} (${hook.hook_type}): "${hook.script_text}"

## OTROS HOOKS (NO repetir ideas)
${otherHooks}
${burnedContext}

## INSTRUCCIÓN
Regenerá ÚNICAMENTE el hook variante #${hook.variant_number}.

REGLAS:
- Generá un lead completamente NUEVO y DIFERENTE al actual.
- Podés cambiar el tipo de lead si querés, pero NO uses un tipo que ya esté en los otros leads (a menos que el ángulo sea completamente distinto).
- El lead debe tener 2-3 ORACIONES: situación específica + gap de curiosidad + puente al cuerpo. NO frases sueltas de 5 palabras.
- Debe ser INDEPENDIENTE del cuerpo: cualquier lead debe poder combinarse con el desarrollo sin modificar nada.
- Mantené el mismo variant_number: ${hook.variant_number}.
- ${brief.brandTone ? `Respetá el tono de marca: "${brief.brandTone}".` : "Mantené el mismo tono del guión original."}

${SINGLE_HOOK_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  return callClaude(prompt, undefined, 2048, brief.generationRules) as Promise<Hook>;
}

// --- Long-form YouTube generation ---

const LONGFORM_SCHEMA_DESC = `Responde con un JSON con esta estructura exacta:
{
  "output_mode": "full_script" | "structure",
  "title": string,
  "framework": "educational" | "storytelling" | "listicle" | "case_study" | "debate" | "tutorial" | "reaction_analysis",
  "hook": {
    "script_text": string (texto completo del hook, primeros 30-60 segundos),
    "visual_notes": string (qué mostrar en pantalla durante el hook),
    "estimated_duration_seconds": number
  },
  "chapters": [{
    "number": number,
    "title": string,
    "content": string (en full_script: texto completo. en structure: bullet points),
    "key_points": [string],
    "estimated_duration_seconds": number,
    "visual_notes": string (opcional: qué mostrar, B-roll, gráficos)
  }],
  "transitions": [{
    "from_chapter": number,
    "to_chapter": number,
    "transition_text": string
  }],
  "conclusion": {
    "content": string,
    "estimated_duration_seconds": number
  },
  "cta": {
    "primary_text": string (CTA principal al final),
    "midroll_text": string (opcional: CTA suave a mitad del video),
    "end_screen_notes": string (qué poner en el end screen)
  },
  "seo": {
    "title": string (máximo 60 caracteres, clickable),
    "description": string (2-3 párrafos con keywords),
    "tags": [string] (5-10 tags),
    "thumbnail_idea": string (descripción de la imagen + texto del thumbnail)
  },
  "total_duration_seconds": number,
  "word_count": number,
  "emotional_arc": string,
  "production_notes": string
}`;

const LONGFORM_REFERENCE_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "title": string,
  "framework": "educational" | "storytelling" | "listicle" | "case_study" | "debate" | "tutorial" | "reaction_analysis",
  "hook": {
    "text": string,
    "technique": string,
    "estimated_duration_seconds": number
  },
  "chapters": [{
    "number": number,
    "title": string,
    "summary": string,
    "estimated_duration_seconds": number,
    "retention_techniques": [string]
  }],
  "transitions": [{
    "from": number,
    "to": number,
    "technique": string
  }],
  "tone": {
    "energy_level": "low" | "medium" | "high",
    "formality": "very_casual" | "casual" | "neutral" | "formal",
    "key_phrases": [string]
  },
  "retention_patterns": [string],
  "strengths": [string],
  "patterns_to_replicate": [string],
  "estimated_total_duration_seconds": number,
  "total_word_count": number
}`;

export interface LongformReferenceAnalysis {
  title: string;
  framework: string;
  hook: { text: string; technique: string; estimated_duration_seconds: number };
  chapters: Array<{
    number: number;
    title: string;
    summary: string;
    estimated_duration_seconds: number;
    retention_techniques: string[];
  }>;
  transitions: Array<{ from: number; to: number; technique: string }>;
  tone: { energy_level: string; formality: string; key_phrases: string[] };
  retention_patterns: string[];
  strengths: string[];
  patterns_to_replicate: string[];
  estimated_total_duration_seconds: number;
  total_word_count: number;
}

function buildLongformBriefContext(brief: BriefInput): string {
  const outputMode = brief.outputMode || "full_script";
  const duration = brief.targetDurationMinutes || 10;

  let prompt = `## BRIEF — VIDEO YOUTUBE LARGO

**Producto/Servicio:** ${brief.productDescription}
**Público Objetivo:** ${brief.targetAudience}
**Modo de output:** ${outputMode === "both" ? "Ambos (guión completo + estructura)" : outputMode === "full_script" ? "Guión completo (texto palabra por palabra)" : "Estructura flexible (bullet points por capítulo)"}
**Duración objetivo:** ${duration} minutos`;

  if (brief.brandTone) {
    prompt += `\n**Tono:** ${brief.brandTone}`;
  }

  if (brief.brandDocument) {
    prompt += `\n\n## DOCUMENTO DE MARCA\n${brief.brandDocument}`;
  }

  if (brief.additionalNotes) {
    prompt += `\n\n**Notas:** ${brief.additionalNotes}`;
  }

  if (brief.youtubeReferences && brief.youtubeReferences.length > 0) {
    prompt += `\n\n## REFERENCIAS DE YOUTUBE (adaptar estilo y estructura al tono del presentador)\n`;
    brief.youtubeReferences.forEach((ref, i) => {
      prompt += `\n### Referencia ${i + 1}:\n${ref}\n`;
    });
  }

  return prompt;
}

function buildLongformUserPrompt(brief: BriefInput): string {
  const outputMode = brief.outputMode || "full_script";
  const duration = brief.targetDurationMinutes || 10;
  const chapters = Math.max(3, Math.min(5, Math.round(duration / 3)));

  let prompt = buildLongformBriefContext(brief);

  const modeInstruction = outputMode === "both"
    ? `Generá un guión de YouTube largo con AMBOS: guión completo Y estructura. En cada capítulo:
- "content": escribí el texto completo palabra por palabra (guión para teleprompter)
- "key_points": escribí 5-10 bullet points con la estructura/ideas clave (para improvisar)
Así el presentador tiene las dos opciones.`
    : `Generá un guión de YouTube largo en modo "${outputMode}" con:`;

  prompt += `\n\n## INSTRUCCIÓN
${modeInstruction}
1. Hook potente de 30-60 segundos que enganche y prometa algo claro
2. ${chapters} capítulos de contenido (cada uno con título, contenido y notas visuales)
3. Transiciones entre capítulos que mantengan la curiosidad
4. Conclusión con impacto (no resumen aburrido)
5. CTA nativo de YouTube (suscribirse, ver otro video, link en descripción)
6. SEO completo: título (máx 60 chars), descripción, tags, idea de thumbnail

Duración objetivo: ${duration} minutos (~${duration * 150} palabras en full_script).
${outputMode === "both" ? 'En el campo "output_mode" del JSON, usá "both".' : ""}

${brief.brandTone ? `Respetá el tono: "${brief.brandTone}".` : "Elegí el tono más apropiado para YouTube."}

Usá los datos reales del avatar si están disponibles para dar autenticidad.

${LONGFORM_SCHEMA_DESC}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después.`;

  return prompt;
}

async function callClaudeLongform(
  userPrompt: string,
  generationRules?: string,
): Promise<unknown> {
  const client = getAnthropicClient();

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT_LONGFORM,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: AVATAR_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
    // Jesus tone + history — cached, changes rarely
    {
      type: "text",
      text: TONE_JESUS,
      cache_control: { type: "ephemeral" },
    },
    // Retention + sales techniques — cached
    {
      type: "text",
      text: TECHNIQUES_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
  ];

  if (generationRules) {
    systemBlocks.push({
      type: "text",
      text: `## REGLAS DEL PROYECTO (PRIORIDAD MÁXIMA)\n\n${generationRules}`,
      cache_control: { type: "ephemeral" },
    });
  }

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 32768,
    system: systemBlocks,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.75,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de texto de Claude");
  }

  return extractJSON(textBlock.text);
}

export async function generateLongform(brief: BriefInput): Promise<LongformOutput> {
  const prompt = buildLongformUserPrompt(brief);
  return callClaudeLongform(prompt, brief.generationRules) as Promise<LongformOutput>;
}

export async function generateLongformStream(
  brief: BriefInput,
  onChunk: (text: string) => void,
): Promise<LongformOutput> {
  const client = getAnthropicClient();
  const prompt = buildLongformUserPrompt(brief);

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT_LONGFORM,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: AVATAR_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
    // Jesus tone + history — cached, changes rarely
    {
      type: "text",
      text: TONE_JESUS,
      cache_control: { type: "ephemeral" },
    },
    // Retention + sales techniques — cached
    {
      type: "text",
      text: TECHNIQUES_CONTEXT,
      cache_control: { type: "ephemeral" },
    },
  ];

  if (brief.generationRules) {
    systemBlocks.push({
      type: "text",
      text: `## REGLAS DEL PROYECTO (PRIORIDAD MÁXIMA)\n\n${brief.generationRules}`,
      cache_control: { type: "ephemeral" },
    });
  }

  let fullText = "";

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 32768,
    system: systemBlocks,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullText += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  return extractJSON(fullText) as LongformOutput;
}

export async function analyzeLongformReference(transcript: string): Promise<LongformReferenceAnalysis> {
  const client = getAnthropicClient();

  const prompt = `Analizá la siguiente transcripción de un video de YouTube largo.

Extraé:
1. El hook (primeros 30-60 segundos), qué técnica usa
2. La estructura por capítulos (título, resumen, duración, técnicas de retención)
3. Las transiciones entre capítulos (qué técnica usa para mantener al viewer)
4. El tono (nivel de energía, formalidad, frases clave)
5. Patrones de retención (qué hace para que no se vayan)
6. Fortalezas y patrones para replicar
7. Duración total estimada

TRANSCRIPCIÓN:
"""
${transcript}
"""

${LONGFORM_REFERENCE_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: "Sos un analista de contenido de YouTube. Analizás transcripciones de videos largos exitosos y extraés patrones de estructura, retención y tono. Respondés únicamente con JSON válido.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de texto de Claude");
  }

  return extractJSON(textBlock.text) as LongformReferenceAnalysis;
}

export async function regenerateLongformChapter(
  brief: BriefInput,
  longform: LongformOutput,
  chapterIndex: number,
): Promise<LongformOutput["chapters"][0]> {
  const chapter = longform.chapters[chapterIndex];
  const prevChapter = chapterIndex > 0 ? longform.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < longform.chapters.length - 1 ? longform.chapters[chapterIndex + 1] : null;

  const prompt = `${buildLongformBriefContext(brief)}

## VIDEO ACTUAL
**Título:** ${longform.title}
**Framework:** ${longform.framework}
**Arco:** ${longform.emotional_arc}
**Modo:** ${longform.output_mode}

## CAPÍTULO A REGENERAR (#${chapter.number}: "${chapter.title}")
Contenido actual: "${chapter.content.slice(0, 500)}${chapter.content.length > 500 ? "..." : ""}"
Duración: ${chapter.estimated_duration_seconds}s

${prevChapter ? `Capítulo anterior (#${prevChapter.number}): "${prevChapter.title}" — termina con: "${prevChapter.content.slice(-200)}"` : "(Es el primer capítulo)"}
${nextChapter ? `Capítulo siguiente (#${nextChapter.number}): "${nextChapter.title}" — arranca con: "${nextChapter.content.slice(0, 200)}"` : "(Es el último capítulo)"}

## INSTRUCCIÓN
Regenerá ÚNICAMENTE este capítulo. Mantené el número, generá un nuevo título si querés, y escribí contenido nuevo que cumpla la misma función en el arco del video. Que conecte con el capítulo anterior y el siguiente.

Responde con JSON:
{
  "number": ${chapter.number},
  "title": string,
  "content": string,
  "key_points": [string],
  "estimated_duration_seconds": number,
  "visual_notes": string
}

Responde ÚNICAMENTE con el JSON.`;

  return callClaudeLongform(prompt, brief.generationRules) as Promise<LongformOutput["chapters"][0]>;
}

// --- Gemini-only functions (audio transcription) ---

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const ai = getGeminiClient();
  const base64 = audioBuffer.toString("base64");

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType, data: base64 } },
                {
                  text: "Transcribe este audio de forma literal, palabra por palabra. No agregues nada extra, solo la transcripcion textual completa. Si hay musica de fondo o efectos de sonido, ignóralos y solo transcribí la voz.",
                },
              ],
            },
          ],
          config: { temperature: 0.1, maxOutputTokens: 4096 },
        });

        const text = response.text;
        if (!text) break;
        return text.trim();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
          const delay = (attempt + 1) * 15_000;
          console.warn(`Rate limited on ${model}, retrying in ${delay / 1000}s...`);
          await sleep(delay);
          continue;
        }
        if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("overloaded")) {
          break;
        }
        throw err;
      }
    }
  }
  throw new Error("No se pudo transcribir el audio. Intentá de nuevo en unos minutos.");
}

// --- PDF extraction (Claude) ---

export async function extractPDFText(pdfBuffer: Buffer): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBuffer.toString("base64"),
            },
          },
          {
            type: "text",
            text: "Extraé todo el texto de este documento PDF de forma literal y completa. No resumas, no agregues nada, solo transcribí todo el contenido textual tal cual aparece.",
          },
        ],
      },
    ],
    temperature: 0.1,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No se pudo extraer texto del PDF");
  }
  return textBlock.text.trim();
}
