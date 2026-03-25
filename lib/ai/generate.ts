import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

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
import { listReferences, listGenerations, getBurnedLeads, getCaseStudies, getActiveCTAs } from "../storage/local";
import { getCoverage } from "../coverage";
import { getAudienceContext } from "../knowledge/audience";
import { getObjectionsContext } from "../knowledge/objections";
import { getKnowledgeContext, getKnowledgeContextLongform } from "../knowledge/data-files";
import { buildAutoBrief } from "./auto-brief";
import { isResearchStale, triggerResearchRefresh } from "./angle-discovery";

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

function getGroqApiKey(forcePaid = false) {
  const freeKey = process.env.GROQ_API_KEY_FREE;
  const paidKey = process.env.GROQ_API_KEY;

  // Force paid for very long videos that would hit free rate limits
  if (forcePaid && paidKey) return paidKey;

  // Default: free key first
  if (freeKey) return freeKey;
  if (paidKey) return paidKey;

  throw new Error("GROQ_API_KEY no está configurada. Agregala en .env.local");
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
    "hook_type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico" | "simplificacion_error" | "nadie_explica" | "hipotetico_personal" | "identidad_dolor" | "pregunta_limitacion" | "asimetria_temporal",
    "script_text": string,
    "timing_seconds": number
  }],
  "development": {
    "framework_used": string (ej: "PAS", "AIDA", "BAB", "Hook-Story-Offer", "3_Acts", u otro que aplique),
    "emotional_arc": string,
    "sections": [{
      "section_name": string,
      "persuasion_function": "identificacion" | "quiebre" | "mecanismo" | "demolicion" | "prueba" | "venta_modelo" (función persuasiva del beat — OBLIGATORIO, cada beat debe tener una función DISTINTA),
      "micro_belief": string (micro-creencia que este beat instala, 1 frase corta — OBLIGATORIO),
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
  "body_type": string ("demolicion_mito" | "historia_con_giro" | "demo_proceso" | "comparacion_caminos" | "un_dia_en_la_vida" | "pregunta_respuesta" | "analogia_extendida" | "contraste_emocional" | "demolicion_alternativas" | "qa_conversacional"),
  "angle_family": string ("identidad" | "oportunidad" | "confrontacion" | "mecanismo" | "historia"),
  "angle_specific": string (ej: "1.2_oficinista_atrapado", "3.4_comparacion_social"),
  "segment": string ("A" | "B" | "C" | "D"),
  "funnel_stage": string ("TOFU" | "MOFU" | "RETARGET"),
  "avatar": string ("patricia" | "martin" | "laura" | "roberto" | "valentina" | "diego" | "camila" | "soledad"),
  "awareness_level": number (1-5, nivel de conciencia Schwartz: 1=Unaware, 2=Problem Aware, 3=Solution Aware, 4=Product Aware, 5=Most Aware),
  "niche": string (nicho específico del guion, ej: "recetas para diabéticos"),
  "belief_change": {
    "old_belief": string (creencia vieja que el viewer tiene),
    "mechanism": string (mecanismo que la refuta),
    "new_belief": string (creencia nueva que adopta)
  },
  "micro_beliefs": [
    {
      "belief": string (la micro-creencia en una frase, ej: "Gente común ya lo está haciendo"),
      "installed_via": string (técnica usada para instalarla, ej: "historia de alumno", "demo en vivo", "dato concreto"),
      "persuasion_function": "identificacion" | "quiebre" | "mecanismo" | "demolicion" | "prueba" | "venta_modelo" (función del beat donde se instala),
      "section_name": string (nombre de la sección del body donde se instala)
    }
  ],
  "transition_text": string (1 oración que conecta el ejemplo del body con el bloque CTA genérico),
  "total_duration_seconds": number,
  "word_count": number
}`;

const HOOKS_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "hooks": [{
    "variant_number": number,
    "hook_type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico" | "simplificacion_error" | "nadie_explica" | "hipotetico_personal" | "identidad_dolor" | "pregunta_limitacion" | "asimetria_temporal",
    "script_text": string,
    "timing_seconds": number
  }]
}`;

const SINGLE_HOOK_SCHEMA_DESC = `Responde con un JSON con esta estructura (un solo hook, NO un array):
{
  "variant_number": number,
  "hook_type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico" | "simplificacion_error" | "nadie_explica" | "hipotetico_personal" | "identidad_dolor" | "pregunta_limitacion" | "asimetria_temporal",
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
    "type": "situacion_especifica" | "dato_concreto" | "pregunta_incomoda" | "confesion" | "contraintuitivo" | "provocacion" | "historia_mini" | "analogia" | "negacion_directa" | "observacion_tendencia" | "timeline_provocacion" | "contrato_compromiso" | "actuacion_dialogo" | "anti_publico" | "simplificacion_error" | "nadie_explica" | "hipotetico_personal" | "identidad_dolor" | "pregunta_limitacion" | "asimetria_temporal",
    "word_count": number,
    "estimated_seconds": number
  },
  "structure": {
    "framework": "AIDA" | "PAS" | "BAB" | "Hook-Story-Offer" | "3_Acts" | "micro_vsl" | "other",
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
  "patterns_to_replicate": string[],
  "advertiser": {
    "name": string (nombre del anunciante/marca),
    "platform": "meta" | "tiktok" | "youtube" | "unknown",
    "ranking_position": "top_5" | "top_10" | "top_20" | "unknown" (posición en ranking por impresiones en Ad Library),
    "language": string (ej: "es", "en", "pt"),
    "country": string (ej: "AR", "US", "BR")
  },
  "generation_mapping": {
    "angle_family": "identidad" | "oportunidad" | "confrontacion" | "mecanismo" | "historia" (familia de ángulo más cercana),
    "body_type": "demolicion_mito" | "historia_con_giro" | "demo_proceso" | "comparacion_caminos" | "un_dia_en_la_vida" | "pregunta_respuesta" | "analogia_extendida" | "contraste_emocional" | "demolicion_alternativas" | "qa_conversacional" (vehículo narrativo más cercano),
    "persuasion_functions": [{ "section_name": string, "function": "identificacion" | "quiebre" | "mecanismo" | "demolicion" | "prueba" | "venta_modelo" }] (funciones persuasivas detectadas en cada sección del cuerpo),
    "belief_change": { "old_belief": string, "mechanism": string, "new_belief": string } (cambio de creencia implícito o explícito),
    "ingredients_detected": [{ "category": "A"-"K", "ingredient_number": number, "ingredient_name": string }] (ingredientes de la enciclopedia ADP detectados, ej: B#29 Dolor comparativo, F#73 Demo implícita, G#90 Persona improbable),
    "model_sale_type": string (tipo de venta del modelo: "matematica_simple" | "cementerio_de_modelos" | "transparencia_total" | "ventana_oportunidad" | "eliminacion_barreras" | "lean_anti_riesgo" | "tiempo_vs_dinero" | "democratizacion_ia" | "prueba_diversidad" | "contraste_fisico" | "none"),
    "awareness_level": 1-5 (nivel Schwartz: 1=Unaware, 2=Problem Aware, 3=Solution Aware, 4=Product Aware, 5=Most Aware),
    "segment_equivalent": "A" | "B" | "C" | "D" (A=emprendedor frustrado, B=principiante 45+, C=mamá/papá sobrecargado, D=escéptico),
    "big_idea": string (la UNA idea central del anuncio en una frase)
  },
  "actionable": {
    "what_to_steal": string[] (técnicas específicas aplicables a ads de productos digitales con IA en LATAM),
    "what_not_to_copy": string[] (qué no aplica o sería contraproducente copiar),
    "craft_notes": string[] (observaciones sobre calidad de escritura a nivel de oración: ritmo, cadencia, word choice, transiciones)
  }
}`;

// --- Brief context builders ---

function resolveFormat(platform?: string): string {
  if (!platform) return "vertical_ad";
  return LEGACY_FORMAT_MAP[platform] || platform;
}

/** Extract segment (A/B/C/D) from brief fields if mentioned. */
function extractSegment(brief: BriefInput): string | undefined {
  const haystack = `${brief.additionalNotes || ""} ${brief.targetAudience || ""}`;
  // Match "[SEGMENTO: A]" or "segmento A" or "seg A"
  const match = haystack.match(/\[SEGMENTO:\s*([ABCD])\]/) || haystack.match(/\bseg(?:mento)?\s*([abcd])\b/i);
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
    prompt += `\n\n**Duración objetivo:** 75 a 90 segundos (micro-VSL de 5 beats — mínimo 75s para que entren todos los beats)`;
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

  const keyPhrases = [...new Set(refs.flatMap((r) => r.analysis.tone?.key_phrases || []))].slice(0, 10);

  const rehookCount = refs.filter((r) => r.analysis.structure?.has_rehook).length;
  const ugcCount = refs.filter((r) => r.analysis.tone?.ugc_style).length;

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
    return `\n\n## PRINCIPIOS DE REFERENCIA — DATOS NO DISPONIBLES
⚠️ Error cargando análisis de referencias. Aplicá estos principios universales:
- Hook en 0-3 segundos, sin introducción
- Re-hook entre segundo 10-15 en videos de 20s+
- Cambio de creencia explícito (vieja → mecanismo → nueva)
- Cierre con CTA que repita la promesa del hook
- Tono conversacional, directo, como si hablaras con un amigo`;
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
        if (w.script.angle_family) section += ` | Ángulo: ${w.script.angle_family}`;
        if (w.script.body_type) section += ` | Cuerpo: ${w.script.body_type}`;
        if (w.script.segment) section += ` | Seg: ${w.script.segment}`;
        if (w.script.model_sale_type) section += ` | Venta: ${w.script.model_sale_type}`;
        if (w.script.niche) section += `\n- Nicho: ${w.script.niche}`;
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
    return `\n\n## WINNERS INTERNOS — DATOS NO DISPONIBLES
⚠️ Error cargando generaciones. Apuntá a estos estándares de calidad:
- Micro-VSL de 5 beats con persuasion_function distinta en cada uno
- Mínimo 3 datos concretos (números, nombres, lugares)
- Arco emocional claro (dolor → pivote → visión)
- Leads de 2-3 oraciones que abren curiosidad sin revelar todo`;
  }
}

async function buildCoverageGaps(projectId?: string): Promise<string> {
  try {
    const coverage = await getCoverage();

    // Only show gaps if there's enough data to be meaningful
    if (coverage.totalGenerations < 5) return "";

    const gaps = coverage.gaps;

    // Find over-represented and under-represented items
    const fwEntries = Object.entries(coverage.byFramework).sort((a, b) => b[1] - a[1]);
    const hookEntries = Object.entries(coverage.byLeadType).sort((a, b) => b[1] - a[1]);
    const ingredientEntries = Object.entries(coverage.byLeadType); // proxy — real ingredient tracking comes from knowledge files
    const overusedFw = fwEntries.filter(([, count]) => count > coverage.totalGenerations * 0.3);
    const underusedFw = fwEntries.filter(([, count]) => count <= 2).map(([name]) => name);
    const overusedHooks = hookEntries.filter(([, count]) => count > coverage.totalGenerations * 0.25);
    const underusedHooks = hookEntries.filter(([, count]) => count <= 2).map(([name]) => name);

    let section = `\n\n## COBERTURA ACTUAL — REGLAS AUTOMÁTICAS DE DIVERSIDAD\n`;

    // [FIX #2] Block saturated hook types explicitly
    if (overusedHooks.length > 0) {
      section += `\n### Hook types SATURADOS — PROHIBIDO usar estos como tipo principal del lead:\n`;
      for (const [name, count] of overusedHooks) {
        section += `- ❌ ${name}: usado ${count} veces (>${Math.round(coverage.totalGenerations * 0.25)} = saturado)\n`;
      }
      section += `OBLIGATORIO: Elegí tipos de la lista de "poco usados" de abajo.\n`;
    }

    if (underusedHooks.length > 0) {
      section += `\n### Hook types FRESCOS — PRIORIZAR estos:\n`;
      section += `- ✅ Probá: ${underusedHooks.join(", ")}\n`;
    }

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

    if (gaps.length > 0) {
      section += `\n### Gaps detectados\n`;
      for (const gap of gaps.slice(0, 8)) {
        section += `- ${gap}\n`;
      }
    }

    // [FIX #1] Force fresh ingredients — list the defaults to avoid
    section += `\n### INGREDIENTES — REGLA ANTI-DEFAULT
Los siguientes ingredientes están SOBREUSADOS en el sistema. NO los uses salvo que el guion lo requiera explícitamente:
- ❌ F#73 (Demo implícita), F#74 (Eliminación complejidad), G#90 (Persona improbable), B#29 (Dolor comparativo)
- ❌ Máximo 1 de estos 4 por guion. Si ya usaste 1, elegí otros.
OBLIGATORIO: Incluí al menos 1 ingrediente de la lista FRESCOS del system prompt (D#49, E#67, F#75, F#76, F#82, G#94, K#125-127, B#31, C#42).`;

    // [FIX #6] Body type anti-convergence — force different body types to FEEL different
    section += `\n\n### ANTI-CONVERGENCIA DE CUERPOS — Los 10 tipos tienen que SONAR distinto
Cada tipo de cuerpo tiene un RITMO NARRATIVO propio. No alcanza con poner el label correcto — el texto tiene que reflejarlo:

- **demolicion_mito**: Arranca AFIRMANDO la creencia falsa como si fuera verdad. Después la destruye con evidencia. Ritmo: certeza → quiebre → reconstrucción. NUNCA empieza con pregunta.
- **historia_con_giro**: Narración en tercera persona o primera persona de otro. Tiene PERSONAJE, ESCENA, COMPLICACIÓN, GIRO. Sin personaje concreto = no es historia.
- **demo_proceso**: Imperativo/segunda persona dominante ("Abrís X, hacés Y, sale Z"). Pasos concretos. Si no hay al menos 2 pasos explícitos, no es demo.
- **comparacion_caminos**: Estructura A vs B explícita. Las dos opciones tienen que estar NOMBRADAS y CONTRASTADAS punto por punto. Un camino no basta.
- **un_dia_en_la_vida**: Future pacing SENSORIAL. Verbos en presente o futuro cercano. Describe lo que el viewer VE, SIENTE, HACE en su día transformado. Sin sensorialidad = no es "un día en la vida".
- **pregunta_respuesta**: Ritmo rápido de objeción → respuesta → objeción → respuesta. Mínimo 3 pares pregunta/respuesta. Si tiene menos de 3, no es P&R.
- **analogia_extendida**: La analogía DOMINA todo el cuerpo (no es 1 frase). El objeto cotidiano se desarrolla en paralelo al producto durante al menos 3 beats.
- **contraste_emocional**: Momento oscuro PRIMERO (mínimo 2 oraciones de dolor real). Después pivote. Después momento de luz. El contraste tiene que ser EMOCIONAL, no lógico.
- **demolicion_alternativas** ⭐ WINNER: Presenta 2-3 alternativas REALES con nombres propios (Fiverr, Digistore, freelance). Cada una tiene un "pero" que la descalifica progresivamente. PD con IA queda como la opción lógica. Anti-hype obligatorio ("no te vas a hacer millonario"). Números reales sin exagerar ($50-60/día). Requisitos mínimos como eliminador de excusas ("teléfono + internet + español").
- **qa_conversacional** ⭐ WINNER: UNA sola pregunta u objeción del avatar desarrollada a fondo. Tono de consejero respondiendo un DM. Fluye naturalmente sin beats rígidos. Puede no tener CTA formal — el consejo final ES el cierre. Ideal para awareness 3+ y orgánico/retargeting.

REGLA: Si dos cuerpos del mismo batch podrían intercambiar su body_type sin que se note, REESCRIBÍ uno.`;

    return section;
  } catch (err) {
    console.error("[buildCoverageGaps] Error computando cobertura:", err);
    return `\n\n## COBERTURA — DATOS NO DISPONIBLES (modo conservador)
⚠️ Error leyendo cobertura. Aplicá reglas anti-repetición estrictas:

### INGREDIENTES — REGLA ANTI-DEFAULT (SIEMPRE ACTIVA)
- ❌ F#73 (Demo implícita), F#74 (Eliminación complejidad), G#90 (Persona improbable), B#29 (Dolor comparativo)
- ❌ Máximo 1 de estos 4 por guion
- ✅ Incluí al menos 1 ingrediente fresco: D#49, E#67, F#75, F#76, F#82, G#94, K#125-127, B#31, C#42

### HOOKS — SIN DATOS DE SATURACIÓN
- Usá al menos 3 tipos DISTINTOS de hook en los leads
- NO generes todos del mismo tipo`;
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
    return "\n\n## CASO DE ÉXITO — ERROR CARGANDO\n⚠️ Los casos de éxito no se pudieron cargar. No incluyas testimonios inventados.";
  }
}

async function buildBurnedLeadsContext(): Promise<string> {
  try {
    const burned = await getBurnedLeads();
    if (burned.length === 0) return "";

    // Group by hook_type to extract PATTERNS, not just text
    const byType: Record<string, string[]> = {};
    for (const l of burned) {
      const type = l.hookType || "desconocido";
      if (!byType[type]) byType[type] = [];
      byType[type].push(l.text.slice(0, 60));
    }

    let section = `\n\n## LEADS QUEMADOS — PATRONES PROHIBIDOS
No se trata solo de no repetir el texto. No repitas el PATRÓN (mismo tipo de hook + misma estructura narrativa).
`;

    for (const [type, texts] of Object.entries(byType)) {
      section += `\n### Tipo "${type}" (${texts.length} leads quemados):\n`;
      // Show max 5 examples per type to illustrate the pattern
      for (const t of texts.slice(-5)) {
        section += `- "${t}..."\n`;
      }
      if (texts.length >= 3) {
        section += `⛔ PATRÓN SATURADO: Ya hay ${texts.length}+ leads de tipo "${type}". NO generar más de este tipo salvo que el brief lo pida explícitamente.\n`;
      }
    }

    section += `
REGLA: Si tu lead tiene la MISMA estructura que uno quemado (pregunta + negación + gancho, dato + contraste + revelación, etc.), es REPETIDO aunque el texto sea diferente. Cambiá el tipo de hook Y la estructura narrativa.`;

    return section;
  } catch (err) {
    console.error("[buildBurnedLeadsContext] Error cargando leads quemados:", err);
    return `\n\n## LEADS QUEMADOS — DATOS NO DISPONIBLES (modo conservador)
⚠️ Error leyendo leads quemados. Aplicá diversidad estricta:
- Cada lead DEBE usar un tipo de hook DISTINTO
- NO uses más de 1 lead de tipo "pregunta_incomoda" o "dato_concreto" (los más comunes)
- Evitá el patrón "pregunta → negación → revelación" — es el más gastado`;
  }
}

// [FIX #5] Inject active CTAs so the model uses real CTA blocks instead of inventing generic ones
async function buildActiveCTAsContext(): Promise<string> {
  try {
    const ctas = await getActiveCTAs();
    if (ctas.length === 0) return "";

    let section = `\n\n## CTAs ACTIVOS DE LA SEMANA — USARLOS TAL CUAL (NO inventar CTAs)
Los siguientes bloques CTA están activos esta semana. El campo "offer_bridge" del JSON DEBE usar uno de estos.
NO inventes CTAs ad-hoc. Elegí el bloque que mejor encaje con el segmento/funnel del guion.

`;
    for (const cta of ctas) {
      section += `### ${cta.channel.toUpperCase()} — Variante ${cta.variant}\n`;
      section += `- Canal: ${cta.channel}\n`;
      if (cta.layers) {
        section += `- Oferta: ${cta.layers.oferta}\n`;
        section += `- Prueba: ${cta.layers.prueba}\n`;
        section += `- Riesgo cero: ${cta.layers.riesgo_cero}\n`;
        section += `- Urgencia: ${cta.layers.urgencia}\n`;
        section += `- Orden NLP: ${cta.layers.orden_nlp}\n`;
      }
      section += `- Texto completo: "${cta.text}"\n\n`;
    }

    section += `REGLA DURA — COPIAR, NO INVENTAR:
1. El "offer_bridge.script_text" DEBE ser una COPIA TEXTUAL de uno de los bloques de arriba. Podés adaptar mínimamente (conectar con el nicho del guion), pero las 6 capas deben estar presentes.
2. "offer_bridge.product_type" DEBE ser "webinar_gratis" (si usaste Clase Gratuita) o "taller_5" (si usaste Taller $5).
3. Los "cta_blocks" deben incluir los 3 canales con el texto EXACTO de arriba.
4. Si inventás un CTA ad-hoc en vez de copiar uno de estos, el guion se RECHAZA.`;

    return section;
  } catch (err) {
    console.error("[buildActiveCTAsContext] Error cargando CTAs activos:", err);
    return `\n\n## CTAs ACTIVOS — DATOS NO DISPONIBLES
⚠️ Error cargando CTAs. Usá esta estructura obligatoria de 6 capas:
1. **Oferta:** 3 promesas concretas (encontrar + crear + vender)
2. **Prueba:** social proof con número real ("17 mil personas")
3. **Riesgo cero:** "Es gratis" / "5 dólares"
4. **Urgencia:** cupos limitados / empieza esta semana
5. **Orden NLP:** "Tocá el botón" / "Comentá CLASE"
6. **Follow-up:** indicar siguiente paso

NO inventes CTAs sueltos. Seguí las 6 capas.`;
  }
}

/** Extract structured overrides from additionalNotes if the user specified them */
export function extractBriefOverrides(brief: BriefInput): Record<string, string | undefined> {
  const notes = brief.additionalNotes || "";
  const overrides: Record<string, string | undefined> = {};

  // Match [ÁNGULO: identidad] or [ANGULO: identidad]
  const angleMatch = notes.match(/\[[ÁA]NGULO:\s*(\w+)\]/i);
  if (angleMatch) overrides.angle_family = angleMatch[1].toLowerCase();

  // Match [CUERPO: demolicion_mito] or [BODY: demo_proceso]
  const bodyMatch = notes.match(/\[(CUERPO|BODY):\s*([\w_]+)\]/i);
  if (bodyMatch) overrides.body_type = bodyMatch[2].toLowerCase();

  // Match [SEGMENTO: A]
  const segMatch = notes.match(/\[SEGMENTO:\s*([ABCD])\]/i);
  if (segMatch) overrides.segment = segMatch[1].toUpperCase();

  // Match [FUNNEL: TOFU]
  const funnelMatch = notes.match(/\[FUNNEL:\s*(\w+)\]/i);
  if (funnelMatch) overrides.funnel_stage = funnelMatch[1].toUpperCase();

  // Match [VENTA: tiempo_vs_dinero]
  const saleMatch = notes.match(/\[VENTA:\s*([\w_]+)\]/i);
  if (saleMatch) overrides.model_sale_type = saleMatch[1].toLowerCase();

  // Match [EMOCIÓN: miedo → alivio] or [EMOCION: ...]
  const emotionMatch = notes.match(/\[EMOCI[ÓO]N:\s*([^\]]+)\]/i);
  if (emotionMatch) overrides.emotion = emotionMatch[1].trim();

  // Match [AVATAR: martin] or [AVATAR: laura]
  const avatarMatch = notes.match(/\[AVATAR:\s*(\w+)\]/i);
  if (avatarMatch) overrides.avatar = avatarMatch[1].toLowerCase();

  // Match [AWARENESS: 3] or [SCHWARTZ: 3] or [NIVEL: 3]
  const awarenessMatch = notes.match(/\[(AWARENESS|SCHWARTZ|NIVEL):\s*([1-5])\]/i);
  if (awarenessMatch) overrides.awareness_level = awarenessMatch[2];

  return overrides;
}

async function buildUserPrompt(brief: BriefInput): Promise<{ prompt: string; patterns: string }> {
  // Auto-refresh research if stale (runs in background, doesn't block generation)
  isResearchStale().then(({ stale }) => {
    if (stale) triggerResearchRefresh();
  }).catch(() => {});

  let prompt = buildBriefContext(brief);

  // AUTO-BRIEF: smart selection of all parameters based on coverage data
  const rawOverrides = extractBriefOverrides(brief);
  const overrides = {
    ...rawOverrides,
    awareness_level: rawOverrides.awareness_level ? parseInt(rawOverrides.awareness_level, 10) : undefined,
  };

  // Phase 1: Run all independent async operations in parallel
  const [refs, winnerExamples, coverageGaps, autoBrief, caseStudies, burnedLeads, activeCTAs] =
    await Promise.all([
      listReferences(),
      buildWinnerExamples(brief.projectId),
      buildCoverageGaps(brief.projectId),
      buildAutoBrief(overrides),
      buildCaseStudiesContext(brief.useCaseStudy || false),
      buildBurnedLeadsContext(),
      buildActiveCTAsContext(),
    ]);

  const patterns = buildLearnedPatterns(refs);
  prompt += patterns;
  prompt += winnerExamples;
  prompt += coverageGaps;
  prompt += autoBrief.constraints_text;
  prompt += caseStudies;

  // Phase 2: These depend on autoBrief.segment — run in parallel with each other
  const segment = extractSegment(brief) || autoBrief.segment;
  const [audienceCtx, objectionsCtx] = await Promise.all([
    getAudienceContext(segment),
    getObjectionsContext(segment),
  ]);

  prompt += audienceCtx;
  prompt += objectionsCtx;
  prompt += burnedLeads;
  prompt += activeCTAs;

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

### [FIX #3] REGLA ANTI-NICHO GENÉRICO
NO uses nichos "seguros" por default (fitness, recetas, mascotas, finanzas personales). Si el brief no especifica nicho:
- Elegí un nicho ESPECÍFICO y CONCRETO (no "recetas" → "recetas para celíacos", no "fitness" → "movilidad para oficinistas de 40+")
- El nicho tiene que pasar el test: "¿alguien buscaría esto en Google con estas palabras exactas?" Si no → más específico
- PROHIBIDO: nichos de 1 sola palabra. MÍNIMO 2 palabras que delimiten audiencia o problema concreto
- Bonus: nichos que suenen contraintuitivos o que el viewer no sabía que existían retienen más

### REGLA MICRO-CREENCIAS OBLIGATORIAS
ANTES de escribir el cuerpo, definí 5 micro-creencias (1 por beat). Cada micro-creencia es una frase que el viewer DEBE aceptar para que la venta sea inevitable.
- Cada sección de development.sections DEBE tener "persuasion_function" (identificacion/quiebre/mecanismo/demolicion/prueba) y "micro_belief" (la frase de la creencia).
- La micro-creencia NO es el texto del guion — es la CONCLUSIÓN que el viewer saca después de escuchar ese beat.
- Ejemplo: Beat quiebre → micro_belief: "Lo que creía sobre necesitar experiencia está mal" → script_text: toda la narrativa que INSTALA esa creencia.
- Si un beat no tiene micro_belief o persuasion_function, el guion se RECHAZA.

### [FIX #4] REGLA ANTI-DECAY — Uniformidad de calidad
Si estás generando múltiples hooks/leads para el mismo guion:
- El hook #${brief.hookCount} tiene que ser TAN CREATIVO como el hook #1. No hay excusa para que los últimos sean más flojos.
- Técnica: escribí el último hook PRIMERO mentalmente, después los demás. Si el último es genérico, descartalo y reescribilo.
- Cada hook debe usar un TIPO DISTINTO (no 3 preguntas incómodas y 2 datos concretos)
- Si notás que estás repitiendo estructura (pregunta → negación → gancho), PARÁ y cambiá el approach
- AUTOTEST: leé los ${brief.hookCount} hooks en orden inverso. Si los últimos suenan como relleno → reescribí

${SCRIPT_SCHEMA_DESC}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después.`;

  return { prompt, patterns };
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
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fix unescaped newlines/tabs inside JSON string values
    // Walk character by character to find strings and escape their newlines
    let inString = false;
    let escaped = false;
    let fixed = "";
    for (const ch of cleaned) {
      if (escaped) {
        fixed += ch;
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        fixed += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        fixed += ch;
        continue;
      }
      if (inString && ch === "\n") {
        fixed += "\\n";
        continue;
      }
      if (inString && ch === "\t") {
        fixed += "\\t";
        continue;
      }
      fixed += ch;
    }
    return JSON.parse(fixed);
  }
}

async function callClaude(
  userPrompt: string,
  learnedPatterns?: string,
  maxTokens = 16384,
  generationRules?: string,
): Promise<unknown> {
  const client = getAnthropicClient();

  // Load knowledge files (cached in memory for 60s)
  const knowledgeContext = await getKnowledgeContext();

  // Consolidate system blocks to stay within Anthropic's 4 cache_control limit.
  // Block 1: System prompt (core rules)
  // Block 2: Static context (avatar + tone + techniques — rarely changes)
  // Block 3: Knowledge base (data files — cached 60s)
  // Block 4: Dynamic context (generation rules + learned patterns — changes per call)
  const staticContext = [AVATAR_CONTEXT, TONE_JESUS, TECHNIQUES_CONTEXT].join("\n\n---\n\n");

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: staticContext,
      cache_control: { type: "ephemeral" },
    },
  ];

  // Knowledge base: angles, body types, ingredients, diversity rules, model sales, CTAs, winner patterns, session insights
  if (knowledgeContext) {
    systemBlocks.push({
      type: "text",
      text: knowledgeContext,
      cache_control: { type: "ephemeral" },
    });
  }

  // Dynamic context: project rules + learned patterns (combined into 1 block)
  const dynamicParts: string[] = [];
  if (generationRules) {
    dynamicParts.push(`## REGLAS DEL PROYECTO (PRIORIDAD MÁXIMA — si hay conflicto con las reglas genéricas, estas GANAN)\n\n${generationRules}`);
  }
  if (learnedPatterns) {
    dynamicParts.push(learnedPatterns);
  }
  if (dynamicParts.length > 0) {
    systemBlocks.push({
      type: "text",
      text: dynamicParts.join("\n\n---\n\n"),
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

const BASE_VALIDATION_RULES = `Reglas base (SIEMPRE aplicar):
- Hooks/leads de 2-3 oraciones (nunca frases sueltas de 5-10 palabras)
- Voseo argentino: "tenés", "podés", NUNCA "tú", "tienes", "puedes"
- Al menos 1 muletilla de Jesús ("La realidad es que...", "¿Me explico?", "Básicamente")
- Re-hook si video > 20 segundos
- Al menos 3 números concretos (precios, cantidades, tiempos)
- NUNCA "trabajos" (debe decir "negocios")
- NUNCA porcentajes inventados en hooks
- Mecanismo cierra con VENDERLO ("y lo vendés" / "y genera ingresos")
- NUNCA referencia al taller o Instagram en el cuerpo`;

/** Deterministic body-type coherence check (no API call — free & fast) */
function validateBodyTypeCoherence(script: ScriptOutput): string[] {
  const issues: string[] = [];
  const bt = script.body_type;
  if (!bt) return issues;

  const bodyText = script.development.sections.map((s) => s.script_text).join(" ").toLowerCase();
  const firstSection = script.development.sections[0]?.script_text?.toLowerCase() || "";

  switch (bt) {
    case "demolicion_mito": {
      // Must NOT start with a question — should affirm a false belief first
      if (firstSection.trim().startsWith("¿")) {
        issues.push(`body_type es "demolicion_mito" pero la primera sección arranca con pregunta. Debe arrancar AFIRMANDO la creencia falsa como si fuera verdad, no preguntando.`);
      }
      // Should have some belief-breaking language
      const breakWords = ["pero", "sin embargo", "la verdad", "en realidad", "el problema", "mentira", "falso", "no es cierto", "error"];
      if (!breakWords.some((w) => bodyText.includes(w))) {
        issues.push(`body_type es "demolicion_mito" pero no se detecta quiebre de creencia en el cuerpo. Necesita un momento claro de "eso que creías es falso".`);
      }
      break;
    }
    case "historia_con_giro": {
      // Must have a character (name, age, profession, or "una persona/alguien/él/ella")
      const charIndicators = /\b(se llama|tiene \d+ años|trabajaba|era |vivía|un tipo|una mina|una persona|alguien que|él |ella )\b/;
      if (!charIndicators.test(bodyText)) {
        issues.push(`body_type es "historia_con_giro" pero no se detecta un PERSONAJE concreto. Necesita nombre, edad, situación o al menos una persona identificable.`);
      }
      break;
    }
    case "demo_proceso": {
      // Must have at least 2 explicit steps (imperative verbs or "paso 1/2/3")
      const stepIndicators = (bodyText.match(/\b(abrís|entrás|escribís|le decís|hacés|subís|creás|ponés|buscás|paso \d|primero|segundo|después|luego)\b/g) || []);
      if (stepIndicators.length < 2) {
        issues.push(`body_type es "demo_proceso" pero se detectaron menos de 2 pasos explícitos. Un demo necesita al menos 2 instrucciones claras tipo "hacés X, después Y".`);
      }
      break;
    }
    case "comparacion_caminos": {
      // Must have two explicit paths contrasted
      const vsIndicators = /\b(camino [ab12]|opción [ab12]|por un lado|por otro|en cambio|mientras que|vs\.?|versus)\b/i;
      if (!vsIndicators.test(bodyText)) {
        issues.push(`body_type es "comparacion_caminos" pero no se detectan 2 caminos contrastados. Necesita estructura A vs B explícita.`);
      }
      break;
    }
    case "un_dia_en_la_vida": {
      // Must have sensory/temporal language (future pacing)
      const sensoryWords = (bodyText.match(/\b(te levantás|abrís los ojos|te sentás|mirás|sentís|escuchás|olés|tocás|imaginat[eé]|visualiz|mañana|mediodía|noche|despertás)\b/g) || []);
      if (sensoryWords.length < 2) {
        issues.push(`body_type es "un_dia_en_la_vida" pero falta future pacing sensorial. Necesita verbos que describan lo que el viewer VE, SIENTE, HACE en su día transformado.`);
      }
      break;
    }
    case "pregunta_respuesta": {
      // Must have at least 3 question marks in the body
      const questionCount = (bodyText.match(/\?/g) || []).length;
      if (questionCount < 3) {
        issues.push(`body_type es "pregunta_respuesta" pero solo tiene ${questionCount} preguntas. Necesita mínimo 3 pares pregunta/respuesta.`);
      }
      break;
    }
    case "analogia_extendida": {
      // The analogy object should appear in at least 3 sections
      // Hard to check deterministically — check that "como" or "igual que" appears multiple times
      const analogyMarkers = (bodyText.match(/\b(como cuando|igual que|es como|pensalo como|imaginate que|la misma lógica)\b/g) || []);
      if (analogyMarkers.length < 2) {
        issues.push(`body_type es "analogia_extendida" pero la analogía aparece menos de 2 veces. Una analogía extendida domina TODO el cuerpo, no es 1 frase.`);
      }
      break;
    }
    case "contraste_emocional": {
      // First section should have pain/dark language, not start positive
      const darkWords = ["cansad", "harto", "agotad", "frustrad", "no podés", "no sabés", "miedo", "desesper", "hartaz", "angust", "dolor", "sufr"];
      const hasDarkStart = darkWords.some((w) => firstSection.includes(w));
      if (!hasDarkStart) {
        issues.push(`body_type es "contraste_emocional" pero la primera sección no arranca con momento OSCURO. Necesita mínimo 2 oraciones de dolor real antes del pivote.`);
      }
      break;
    }
    case "demolicion_alternativas": {
      // Must mention at least 2 alternatives by name or description, each with a "pero/but" that disqualifies them
      const altMarkers = (bodyText.match(/\b(primer[oa]|segund[oa]|tercer[oa]|la primera|la segunda|la tercera|fiverr|digistore|freelanc|afiliado|marketing de afiliado)\b/g) || []);
      const butMarkers = (bodyText.match(/\b(pero|sin embargo|el problema|lo malo|la contra|ojo que|cuidado)\b/g) || []);
      if (altMarkers.length < 2) {
        issues.push(`body_type es "demolicion_alternativas" pero se mencionan menos de 2 alternativas. Necesita 2-3 alternativas reales con nombres o descripciones concretas.`);
      }
      if (butMarkers.length < 2) {
        issues.push(`body_type es "demolicion_alternativas" pero falta demolición de cada alternativa. Cada una necesita un "pero" que la descalifique.`);
      }
      break;
    }
    case "qa_conversacional": {
      // Should have a question/objection being addressed, conversational tone
      const questionPresent = bodyText.includes("?") || /\b(me preguntan|la pregunta|mucha gente|puedo|se puede|necesito)\b/.test(bodyText);
      if (!questionPresent) {
        issues.push(`body_type es "qa_conversacional" pero no se detecta una pregunta u objeción central. Debe responder UNA pregunta/objeción como si fuera un DM.`);
      }
      break;
    }
  }

  return issues;
}

async function validateScript(script: ScriptOutput, rules?: string): Promise<ValidationResult> {
  const effectiveRules = rules ? `${BASE_VALIDATION_RULES}\n\nReglas del proyecto:\n${rules}` : BASE_VALIDATION_RULES;

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
${effectiveRules.slice(0, 6000)}

Responde con JSON: {"passed": true/false, "issues": ["problema 1", "problema 2"]}
Solo marcá passed=false si hay problemas GRAVES (tú en vez de vos, hooks de 1 frase, sin números). Problemas menores = passed=true con issues informativos.`,
      }],
      temperature: 0.1,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { passed: true, issues: [] };
    const aiResult = extractJSON(textBlock.text) as ValidationResult;

    // [FIX #6b] Deterministic body-type coherence — merge with AI validation
    const bodyTypeIssues = validateBodyTypeCoherence(script);
    if (bodyTypeIssues.length > 0) {
      aiResult.issues = [...aiResult.issues, ...bodyTypeIssues];
      aiResult.passed = false; // Body type mismatch = grave, force regeneration
    }

    return aiResult;
  } catch {
    // Even if AI validation fails, still run deterministic checks
    const bodyTypeIssues = validateBodyTypeCoherence(script);
    if (bodyTypeIssues.length > 0) {
      return { passed: false, issues: bodyTypeIssues };
    }
    return { passed: true, issues: [] };
  }
}

// --- Main generation functions (Claude) ---

export interface GenerationResult {
  script: ScriptOutput;
  validation: ValidationResult;
}

export async function generateScript(brief: BriefInput): Promise<GenerationResult> {
  const { prompt, patterns } = await buildUserPrompt(brief);
  const promptWithoutPatterns = prompt.replace(patterns, "");

  let script = await callClaude(promptWithoutPatterns, patterns || undefined, 16384, brief.generationRules) as ScriptOutput;

  // Auto-validate and retry once if critical issues found (ALWAYS runs)
  let validation = await validateScript(script, brief.generationRules);
  if (!validation.passed) {
    console.log("[validate] Issues found, regenerating:", validation.issues);
    const fixPrompt = promptWithoutPatterns + `\n\n## CORRECCIONES OBLIGATORIAS\nLa generación anterior tenía estos problemas. Corregí TODOS:\n${validation.issues.map((i) => `- ${i}`).join("\n")}`;
    script = await callClaude(fixPrompt, patterns || undefined, 16384, brief.generationRules) as ScriptOutput;
    // After retry: only run deterministic checks (no extra API call)
    const bodyTypeIssues = validateBodyTypeCoherence(script);
    validation = bodyTypeIssues.length > 0
      ? { passed: false, issues: bodyTypeIssues }
      : { passed: true, issues: [] };
  }

  return { script, validation };
}

export async function generateScriptStream(
  brief: BriefInput,
  onChunk: (text: string) => void,
): Promise<GenerationResult> {
  const client = getAnthropicClient();
  const { prompt, patterns } = await buildUserPrompt(brief);
  const promptWithoutPatterns = prompt.replace(patterns, "");

  // Load knowledge files (cached in memory for 60s)
  const knowledgeContext = await getKnowledgeContext();

  const staticContext = [AVATAR_CONTEXT, TONE_JESUS, TECHNIQUES_CONTEXT].join("\n\n---\n\n");

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: staticContext,
      cache_control: { type: "ephemeral" },
    },
  ];

  if (knowledgeContext) {
    systemBlocks.push({
      type: "text",
      text: knowledgeContext,
      cache_control: { type: "ephemeral" },
    });
  }

  const dynamicParts: string[] = [];
  if (brief.generationRules) {
    dynamicParts.push(`## REGLAS DEL PROYECTO (PRIORIDAD MÁXIMA — si hay conflicto con las reglas genéricas, estas GANAN)\n\n${brief.generationRules}`);
  }
  if (patterns) {
    dynamicParts.push(patterns);
  }
  if (dynamicParts.length > 0) {
    systemBlocks.push({
      type: "text",
      text: dynamicParts.join("\n\n---\n\n"),
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

  // Auto-validate streamed output and retry if critical issues (ALWAYS runs)
  let validation = await validateScript(script, brief.generationRules);
  if (!validation.passed) {
    console.log("[validate-stream] Issues found, regenerating:", validation.issues);
    onChunk("\n\n--- VALIDANDO Y CORRIGIENDO ---\n\n");
    const fixPrompt = promptWithoutPatterns + `\n\n## CORRECCIONES OBLIGATORIAS\nLa generación anterior tenía estos problemas. Corregí TODOS:\n${validation.issues.map((i) => `- ${i}`).join("\n")}`;
    script = await callClaude(fixPrompt, patterns || undefined, 16384, brief.generationRules) as ScriptOutput;
    // After retry: only run deterministic checks (no extra API call)
    const bodyTypeIssues = validateBodyTypeCoherence(script);
    validation = bodyTypeIssues.length > 0
      ? { passed: false, issues: bodyTypeIssues }
      : { passed: true, issues: [] };
  }

  return { script, validation };
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
9. Metadata del anunciante (nombre/marca, plataforma, idioma, país — inferir del contenido)
10. Mapeo al sistema ADP de generación de guiones:
    - Familia de ángulo (identidad/oportunidad/confrontacion/mecanismo/historia)
    - Vehículo narrativo (demolicion_mito/historia_con_giro/demo_proceso/comparacion_caminos/un_dia_en_la_vida/pregunta_respuesta/analogia_extendida/contraste_emocional/demolicion_alternativas/qa_conversacional)
    - Funciones persuasivas por sección (identificacion/quiebre/mecanismo/demolicion/prueba/venta_modelo)
    - Cambio de creencia (creencia vieja → mecanismo → creencia nueva)
    - Ingredientes detectados de la enciclopedia ADP (categorías A-K, ej: B#29, F#73, G#90)
    - Tipo de venta del modelo de negocio (si aplica)
    - Nivel de awareness Schwartz (1-5)
    - Segmento equivalente (A=emprendedor frustrado, B=principiante 45+, C=mamá/papá, D=escéptico)
    - Big idea (la UNA idea central en una frase)
11. Extracción accionable para ADP:
    - Qué técnicas específicas se pueden adaptar para ads de productos digitales con IA en LATAM
    - Qué NO copiar (no aplica o sería contraproducente)
    - Notas de craft: observaciones sobre calidad de escritura a nivel de oración (ritmo, cadencia, transiciones, power words)

TRANSCRIPCIÓN:
"""
${transcript}
"""

${REFERENCE_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL_FAST,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: `Eres un analista experto de publicidad de respuesta directa para video vertical. Analizás transcripciones de anuncios exitosos y extraés patrones estructurales, de tono y de copywriting.

CONTEXTO: Trabajás para ADP (Academia de Productos Digitales), que vende cursos sobre crear y vender productos digitales con IA en LATAM. Tu análisis mapea cada ad al sistema de generación de ADP que usa:
- 5 familias de ángulos: identidad, oportunidad, confrontacion, mecanismo, historia
- 10 vehículos narrativos: demolicion_mito, historia_con_giro, demo_proceso, comparacion_caminos, un_dia_en_la_vida, pregunta_respuesta, analogia_extendida, contraste_emocional, demolicion_alternativas, qa_conversacional
- 5 funciones persuasivas por beat: identificacion, quiebre, mecanismo, demolicion, prueba
- Enciclopedia de 127 ingredientes en categorías A-K (A=hooks, B=problema, C=agitación, D=quiebre, E=autoridad, F=mecanismo, G=prueba social, H=oferta, I=CTA, J=urgencia, K=NLP)
- 10 tipos de venta del modelo de negocio
- 5 niveles de awareness Schwartz (1=Unaware a 5=Most Aware)
- 4 segmentos: A(emprendedor frustrado), B(principiante 45+), C(mamá/papá sobrecargado), D(escéptico)

Respondés únicamente con JSON válido.`,
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
  "framework": "educational" | "storytelling" | "listicle" | "case_study" | "debate" | "tutorial" | "reaction_analysis" | "vsl_camuflado",
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
  "production_notes": string,
  "avatar": string (patricia | roberto | martin | laura | valentina | diego | camila | soledad),
  "awareness_level": number (1-5, nivel Schwartz),
  "angle_family": string (identidad | oportunidad | confrontacion | mecanismo | historia),
  "niche": string (nicho específico del video),
  "tension": string (tensión del motor de audiencia elegida),
  "primary_objection": string (objeción principal que disuelve el video),
  "ingredients_used": [{
    "category": string (A-K),
    "ingredient_number": number,
    "ingredient_name": string,
    "chapter_number": number (en qué capítulo se usa)
  }]
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

async function buildLongformDiversityContext(): Promise<string> {
  try {
    const allGenerations = await listGenerations();
    const longformGens = allGenerations
      .filter((g) => g.contentType === "longform" && g.longform)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    if (longformGens.length === 0) return "";

    const lines = longformGens.map((g) => {
      const lf = g.longform!;
      return `- "${g.title}" | framework: ${lf.framework} | avatar: ${lf.avatar || "?"} | ángulo: ${lf.angle_family || "?"} | tensión: ${lf.tension || "?"} | hook: "${lf.hook.script_text.slice(0, 80)}..."`;
    });

    return `\n\n## VIDEOS ANTERIORES (DIVERSIDAD — NO REPETIR)

Últimos ${longformGens.length} videos generados:
${lines.join("\n")}

**Reglas de diversidad:**
- NUNCA repetir el mismo framework 2 videos seguidos
- NUNCA el mismo avatar 2 videos seguidos
- NUNCA el mismo ángulo 2 videos seguidos
- Si el hook anterior era dato/número, usá otro tipo
- Rotar arcos emocionales`;
  } catch {
    return "";
  }
}

// --- Longform auto-brief (coverage-based selection) ---

import { getLongformCoverage } from "../coverage";
import { ALL_ANGLE_FAMILIES, ALL_AVATARS, AVATAR_BUYER_WEIGHTS, ALL_AWARENESS_LEVELS } from "../constants/hook-types";

const ALL_LONGFORM_FRAMEWORKS = ["educational", "storytelling", "listicle", "case_study", "tutorial", "debate", "reaction_analysis", "vsl_camuflado"];
const LONGFORM_FRAMEWORK_WEIGHTS: Record<string, number> = {
  educational: 0.30,
  storytelling: 0.20,
  listicle: 0.15,
  case_study: 0.10,
  tutorial: 0.10,
  debate: 0.05,
  reaction_analysis: 0.05,
  vsl_camuflado: 0.05,
};

const LONGFORM_ANGLE_FRAMEWORK_COMPAT: Record<string, string[]> = {
  identidad: ["storytelling", "educational", "case_study"],
  oportunidad: ["educational", "listicle", "reaction_analysis"],
  confrontacion: ["debate", "educational", "listicle"],
  mecanismo: ["tutorial", "educational", "listicle"],
  historia: ["storytelling", "case_study"],
};

function pickLongformWeighted(
  all: string[],
  weights: Record<string, number>,
  counts: Record<string, number>,
  total: number,
): string {
  const scores = all.map((item) => {
    const weight = weights[item] || 0.05;
    const used = counts[item] || 0;
    const target = Math.max(1, Math.round(weight * total));
    const gap = Math.max(0, target - used);
    const score = weight * (1 + gap * 0.5 + (used === 0 ? 2 : 0));
    return { item, score };
  });
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  let rand = Math.random() * totalScore;
  for (const s of scores) {
    rand -= s.score;
    if (rand <= 0) return s.item;
  }
  return scores[0].item;
}

function pickLeastUsedFrom(all: readonly string[], counts: Record<string, number>): string {
  const withCounts = all.map((item) => ({ item, count: counts[item] || 0 }));
  const minCount = Math.min(...withCounts.map((x) => x.count));
  const candidates = withCounts.filter((x) => x.count === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)].item;
}

function pickLongformAvatar(counts: Record<string, number>, total: number): string {
  const scores = ALL_AVATARS.map((avatar) => {
    const weight = AVATAR_BUYER_WEIGHTS[avatar] || 0.05;
    const used = counts[avatar] || 0;
    const target = Math.max(1, Math.round(weight * total));
    const gap = Math.max(0, target - used);
    const score = weight * (1 + gap * 0.5 + (used === 0 ? 2 : 0));
    return { avatar, score };
  });
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  let rand = Math.random() * totalScore;
  for (const s of scores) {
    rand -= s.score;
    if (rand <= 0) return s.avatar;
  }
  return scores[0].avatar;
}

async function buildLongformAutoBrief(brief: BriefInput): Promise<string> {
  try {
    const coverage = await getLongformCoverage();
    const total = coverage.totalLongform;

    // Parse user overrides from additionalNotes
    const notes = brief.additionalNotes || "";
    const frameworkMatch = notes.match(/\[FRAMEWORK:\s*(\w+)\]/i);
    const avatarMatch = notes.match(/\[AVATAR:\s*(\w+)\]/i);
    const angleMatch = notes.match(/\[ÁNGULO:\s*(\w+)\]/i) || notes.match(/\[ANGULO:\s*(\w+)\]/i);
    const awarenessMatch = notes.match(/\[AWARENESS:\s*(\d)\]/i) || notes.match(/\[SCHWARTZ:\s*(\d)\]/i);

    // Select framework (weighted by distribution %)
    const framework = frameworkMatch?.[1] || pickLongformWeighted(ALL_LONGFORM_FRAMEWORKS, LONGFORM_FRAMEWORK_WEIGHTS, coverage.byFramework, total);

    // Select angle compatible with framework
    let angle: string;
    if (angleMatch?.[1]) {
      angle = angleMatch[1];
    } else {
      const compatAngles = Object.entries(LONGFORM_ANGLE_FRAMEWORK_COMPAT)
        .filter(([, frameworks]) => frameworks.includes(framework))
        .map(([family]) => family);
      angle = compatAngles.length > 0
        ? pickLeastUsedFrom(compatAngles, coverage.byAngle)
        : pickLeastUsedFrom(ALL_ANGLE_FAMILIES, coverage.byAngle);
    }

    // Select avatar (weighted by buyer data)
    const avatar = avatarMatch?.[1] || pickLongformAvatar(coverage.byAvatar, total);

    // Select awareness level
    const awarenessStrs = ALL_AWARENESS_LEVELS.map(String);
    const awareness = awarenessMatch?.[1] || pickLeastUsedFrom(awarenessStrs, coverage.byAwareness);

    return `\n\n## SELECCIÓN AUTOMÁTICA (basada en ${total} videos longform generados)

### RESTRICCIONES DURAS — usá EXACTAMENTE estos valores:
- **Framework:** ${framework} (usado ${coverage.byFramework[framework] || 0}/${total} veces)
- **Familia de ángulo:** ${angle} (usado ${coverage.byAngle[angle] || 0}/${total} veces)
- **Avatar principal:** ${avatar} (usado ${coverage.byAvatar[avatar] || 0}/${total} veces)
- **Nivel de conciencia (Schwartz):** ${awareness} (usado ${coverage.byAwareness[awareness] || 0}/${total} veces)

Estos valores son restricciones DURAS. Usá exactamente el framework, ángulo y avatar indicados.
El avatar define el TONO entero del video — escribile a esa persona.`;
  } catch {
    return "";
  }
}

// --- Longform post-validation (deterministic — no API call) ---

interface LongformValidationResult {
  passed: boolean;
  issues: string[];
}

function validateLongform(longform: LongformOutput, targetMinutes: number): LongformValidationResult {
  const issues: string[] = [];

  // 1. Voseo check — scan all text for "tú/tienes/puedes"
  const allText = [
    longform.hook.script_text,
    ...longform.chapters.map((ch) => ch.content),
    longform.conclusion.content,
    longform.cta.primary_text,
    longform.cta.midroll_text || "",
  ].join(" ").toLowerCase();

  const tuteoPatterns = /\b(tú |tienes|puedes|debes|quieres|sabes que tú|haces|necesitas|piensas)\b/;
  if (tuteoPatterns.test(allText)) {
    issues.push("GRAVE: Se detectó tuteo (tú/tienes/puedes). Todo debe ser voseo argentino (vos/tenés/podés).");
  }

  // 2. Duration within ±10%
  const targetSeconds = targetMinutes * 60;
  const tolerance = targetSeconds * 0.1;
  if (longform.total_duration_seconds < targetSeconds - tolerance) {
    issues.push(`Duración (${Math.round(longform.total_duration_seconds / 60)}min) está por debajo del target (${targetMinutes}min ±10%).`);
  }
  if (longform.total_duration_seconds > targetSeconds + tolerance) {
    issues.push(`Duración (${Math.round(longform.total_duration_seconds / 60)}min) excede el target (${targetMinutes}min ±10%).`);
  }

  // 3. Hook specificity — if it's under 20 words, probably too generic
  const hookWords = longform.hook.script_text.split(/\s+/).length;
  if (hookWords < 15) {
    issues.push("Hook demasiado corto (< 15 palabras). Debería ser específico e irrepetible, no genérico.");
  }

  // 4. SEO title length
  if (longform.seo.title.length > 60) {
    issues.push(`Título SEO tiene ${longform.seo.title.length} chars (máx 60).`);
  }

  // 5. Missing required fields
  if (!longform.avatar) {
    issues.push("Falta campo 'avatar' — debe elegir UN avatar del sistema.");
  }
  if (!longform.angle_family) {
    issues.push("Falta campo 'angle_family' — debe indicar la familia de ángulo.");
  }
  if (!longform.tension) {
    issues.push("Falta campo 'tension' — debe activar el motor de audiencia.");
  }
  if (!longform.primary_objection) {
    issues.push("Falta campo 'primary_objection' — el video debe disolver una objeción.");
  }
  if (!longform.ingredients_used || longform.ingredients_used.length === 0) {
    issues.push("Falta campo 'ingredients_used' — debe distribuir ingredientes por capítulo.");
  }

  // 6. Ingredient count by duration
  const minIngredients = targetMinutes <= 10 ? 15 : 25;
  if (longform.ingredients_used && longform.ingredients_used.length < minIngredients) {
    issues.push(`Solo ${longform.ingredients_used.length} ingredientes (mínimo ${minIngredients} para ${targetMinutes}min).`);
  }

  // 7. Chapters must have transitions between them
  if (longform.chapters.length > 1 && longform.transitions.length < longform.chapters.length - 1) {
    issues.push(`Faltan transiciones: ${longform.chapters.length} capítulos pero solo ${longform.transitions.length} transiciones.`);
  }

  // 8. Each chapter should have content
  for (const ch of longform.chapters) {
    if (!ch.content || ch.content.length < 50) {
      issues.push(`Capítulo ${ch.number} ("${ch.title}") tiene contenido muy corto.`);
    }
  }

  // 9. Pattern interrupts — for videos > 8 min, should have visual_notes on most chapters
  if (targetMinutes >= 8) {
    const chaptersWithVisuals = longform.chapters.filter((ch) => ch.visual_notes && ch.visual_notes.length > 10).length;
    if (chaptersWithVisuals < Math.ceil(longform.chapters.length * 0.5)) {
      issues.push("Menos de la mitad de los capítulos tienen notas de producción (visual_notes). Necesita pattern interrupts.");
    }
  }

  return {
    passed: issues.filter((i) => i.startsWith("GRAVE")).length === 0,
    issues,
  };
}

async function buildLongformUserPrompt(brief: BriefInput): Promise<string> {
  const outputMode = brief.outputMode || "full_script";
  const duration = brief.targetDurationMinutes || 10;
  const chapters = Math.max(3, Math.min(5, Math.round(duration / 3)));

  let prompt = buildLongformBriefContext(brief);

  // Inject auto-brief (coverage-based framework/avatar/angle selection)
  const autoBriefContext = await buildLongformAutoBrief(brief);
  if (autoBriefContext) {
    prompt += autoBriefContext;
  }

  // Inject diversity context from previous longform generations
  const diversityContext = await buildLongformDiversityContext();
  if (diversityContext) {
    prompt += diversityContext;
  }

  const modeInstruction = outputMode === "both"
    ? `Generá un guión de YouTube largo con AMBOS: guión completo Y estructura. En cada capítulo:
- "content": escribí el texto completo palabra por palabra (guión para teleprompter)
- "key_points": escribí 5-10 bullet points con la estructura/ideas clave (para improvisar)
Así el presentador tiene las dos opciones.`
    : `Generá un guión de YouTube largo en modo "${outputMode}" con:`;

  prompt += `\n\n## INSTRUCCIÓN
${modeInstruction}
1. Elegí UN avatar y escribile a él/ella durante todo el video
2. Activá el motor de audiencia: elegí tensión + vocabulario + objeción a disolver
3. Hook potente de 30-60 segundos que enganche y prometa algo claro
4. ${chapters} capítulos de contenido (cada uno con título, contenido y notas visuales)
5. Distribuí ingredientes de la enciclopedia por capítulo (15-25 para 8-10min, 25-40 para 15-20min)
6. Transiciones entre capítulos que mantengan la curiosidad
7. Conclusión con impacto (no resumen aburrido)
8. CTA nativo de YouTube (suscribirse, ver otro video, link en descripción)
9. SEO completo: título (máx 60 chars), descripción, tags, idea de thumbnail
10. Completá TODOS los campos del JSON: avatar, awareness_level, angle_family, niche, tension, primary_objection, ingredients_used

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

  // Load longform-specific knowledge (12 files: avatares, compradores, motor audiencia, objeciones, ingredientes, etc.)
  const knowledgeContext = await getKnowledgeContextLongform();

  const staticContext = [AVATAR_CONTEXT, TONE_JESUS, TECHNIQUES_CONTEXT].join("\n\n---\n\n");

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT_LONGFORM,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: staticContext,
      cache_control: { type: "ephemeral" },
    },
  ];

  if (knowledgeContext) {
    systemBlocks.push({
      type: "text",
      text: knowledgeContext,
      cache_control: { type: "ephemeral" },
    });
  }

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

export interface LongformGenerationResult {
  longform: LongformOutput;
  validation: LongformValidationResult;
}

export async function generateLongform(brief: BriefInput): Promise<LongformGenerationResult> {
  const prompt = await buildLongformUserPrompt(brief);
  const longform = await callClaudeLongform(prompt, brief.generationRules) as LongformOutput;
  const validation = validateLongform(longform, brief.targetDurationMinutes || 10);
  return { longform, validation };
}

export async function generateLongformStream(
  brief: BriefInput,
  onChunk: (text: string) => void,
): Promise<LongformGenerationResult> {
  const client = getAnthropicClient();
  const prompt = await buildLongformUserPrompt(brief);

  // Load longform-specific knowledge (12 files: avatares, compradores, motor audiencia, objeciones, ingredientes, etc.)
  const knowledgeContext = await getKnowledgeContextLongform();

  const staticContext = [AVATAR_CONTEXT, TONE_JESUS, TECHNIQUES_CONTEXT].join("\n\n---\n\n");

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT_LONGFORM,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: staticContext,
      cache_control: { type: "ephemeral" },
    },
  ];

  if (knowledgeContext) {
    systemBlocks.push({
      type: "text",
      text: knowledgeContext,
      cache_control: { type: "ephemeral" },
    });
  }

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

  const longform = extractJSON(fullText) as LongformOutput;
  const validation = validateLongform(longform, brief.targetDurationMinutes || 10);
  return { longform, validation };
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

// --- Audio transcription (Groq Whisper) ---

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string, forcePaid = false): Promise<string> {
  const apiKey = getGroqApiKey(forcePaid);

  // Build multipart form with the audio buffer
  const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("mp4") ? "mp4" : mimeType.includes("wav") ? "wav" : "mp3";
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
  const formData = new FormData();
  formData.append("file", blob, `audio.${ext}`);
  formData.append("model", "whisper-large-v3");
  formData.append("language", "es");
  formData.append("response_format", "text");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq transcription failed (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  if (!text.trim()) throw new Error("Transcripción vacía. Intentá con otro audio.");
  return text.trim();
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

// --- Ad Copy Embudo (Schwartz funnel in a single text) ---

export interface AdCopyEmbudo {
  title: string;
  copy_text: string;
  word_count: number;
  awareness_flow: string; // "1→2→3→4→5"
  target_platform: string;
  angle_used: string;
  niche: string;
}

/**
 * Generate an Ad Copy Embudo from an existing script.
 * A single text (200-350 words) that walks through all 5 awareness levels.
 */
export async function generateAdCopyEmbudo(script: ScriptOutput): Promise<AdCopyEmbudo> {
  const client = getAnthropicClient();

  const bodyText = script.development.sections.map((s) => s.script_text).join("\n");
  const hooksText = script.hooks.map((h) => `[${h.hook_type}] ${h.script_text}`).join("\n");

  const prompt = `## TAREA: Generar un Ad Copy Embudo

Tenés un guion de video existente. Tu tarea es convertirlo en un AD COPY EMBUDO: un SOLO texto de 200-350 palabras que recorre los 5 niveles de conciencia de Schwartz en secuencia.

### El guion original:

**Ángulo:** ${script.angle_family || "no especificado"} — ${script.angle_specific || ""}
**Nicho:** ${script.niche || "no especificado"}
**Segmento:** ${script.segment || "no especificado"}
**Avatar:** ${script.avatar || "no especificado"}
**Creencia central:** ${script.belief_change?.old_belief || ""} → ${script.belief_change?.new_belief || ""}

**Hooks disponibles:**
${hooksText}

**Cuerpo:**
${bodyText}

### Estructura del Ad Copy Embudo (5 bloques en un solo texto):

1. **UNAWARE (2-3 oraciones):** Despertar la conciencia del problema. "¿Sabías que...?" Sin vender nada.
2. **PROBLEM AWARE (2-3 oraciones):** Amplificar el dolor. "Y lo peor es que..." Revelar que hay salida.
3. **SOLUTION AWARE (3-4 oraciones):** Posicionar productos digitales con IA como LA solución. Diferenciar del resto.
4. **PRODUCT AWARE (2-3 oraciones):** Presentar la oferta concreta (clase/taller). Prueba social.
5. **MOST AWARE (1-2 oraciones):** CTA directo. Precio, urgencia, acción.

### Reglas:
- 200-350 palabras TOTAL (es un copy para Meta/TikTok ads, no un guion de video)
- Voseo argentino SIEMPRE
- Las transiciones entre niveles deben ser INVISIBLES — que fluya como un solo texto
- Usar datos reales del guion original (no inventar)
- El copy debe poder funcionar SOLO, sin video
- NO usar emojis ni bullets — es prosa continua
- Comprimir: cada palabra cuenta. Si se puede decir en menos palabras, hacelo.

### Responde con JSON:
{
  "title": string (título interno del copy, 5-10 palabras),
  "copy_text": string (el ad copy embudo completo, 200-350 palabras),
  "word_count": number,
  "awareness_flow": "1→2→3→4→5",
  "target_platform": "Meta Ads",
  "angle_used": string (ángulo del guion original),
  "niche": string (nicho del guion original)
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON.`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: "Eres un copywriter senior de performance marketing. Escribís en español argentino (voseo). Especializás en ad copies que convierten para Meta Ads y TikTok Ads.",
      },
    ],
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de Claude para ad copy embudo");
  }

  return extractJSON(textBlock.text) as AdCopyEmbudo;
}

// --- Retargeting: Hammer Them (4 quadrants) ---

export interface RetargetingQuadrant {
  quadrant: "Q1_preguntas" | "Q2_preguntas_segundo_orden" | "Q3_expectativas" | "Q4_objeciones";
  quadrant_label: string;
  script_text: string;
  hook: string;
  timing_seconds: number;
  awareness_level: number;
}

export interface RetargetingPack {
  source_generation_id: string;
  angle_used: string;
  niche: string;
  quadrants: RetargetingQuadrant[];
}

/**
 * Generate retargeting pieces from an existing script using Hammer Them framework.
 * 4 quadrants: Preguntas, Preguntas de 2do orden, Expectativas, Objeciones.
 */
export async function generateRetargeting(
  script: ScriptOutput,
  generationId: string,
): Promise<RetargetingPack> {
  const client = getAnthropicClient();

  const bodyText = script.development.sections.map((s) => s.script_text).join("\n");

  const prompt = `## TAREA: Generar 4 piezas de RETARGETING (Hammer Them)

Tenés un guion de video que ya se usó en ads fríos. Ahora necesitás 4 piezas CORTAS de retargeting para la audiencia que ya vio el ad pero no convirtió.

### El guion original:

**Ángulo:** ${script.angle_family || "no especificado"} — ${script.angle_specific || ""}
**Nicho:** ${script.niche || "no especificado"}
**Segmento:** ${script.segment || "no especificado"}
**Avatar:** ${script.avatar || "no especificado"}
**Creencia central:** ${script.belief_change?.old_belief || ""} → ${script.belief_change?.new_belief || ""}

**Cuerpo:**
${bodyText}

### Los 4 cuadrantes de Hammer Them:

**Q1 — PREGUNTAS (awareness 2-3):**
Preguntas que el viewer se hizo después de ver el ad original. "¿Pero cómo funciona exactamente?" / "¿Cuánto cuesta?" / "¿Es para mí?"
- 20-30 segundos
- Responder 1-2 preguntas concretas que quedaron abiertas
- Tono: servicial, como un amigo que explica

**Q2 — PREGUNTAS DE SEGUNDO ORDEN (awareness 3-4):**
Preguntas más profundas que aparecen después de las primeras. "¿Y si no funciona para mi nicho?" / "¿Cuánto tiempo hasta ver resultados?"
- 20-30 segundos
- Responder la objeción implícita detrás de la pregunta
- Tono: experto, con datos concretos

**Q3 — EXPECTATIVAS (awareness 4):**
Setear expectativas realistas. "Esto es lo que pasa en los primeros 7 días" / "Lo que NO te van a decir otros"
- 25-35 segundos
- Future pacing concreto y honesto
- Tono: transparente, sin promesas exageradas

**Q4 — OBJECIONES (awareness 4-5):**
Destruir la objeción final que frena la compra. "Pero yo no sé de tecnología" / "Ya me estafaron antes"
- 20-30 segundos
- Confrontar la objeción de frente con evidencia o analogía
- Tono: confrontativo pero empático

### Reglas:
- Cada pieza es INDEPENDIENTE (funciona sola)
- Voseo argentino SIEMPRE
- Referencia al ad original: "El otro día te mostré..." / "Si viste mi video sobre..."
- NO repetir el contenido del ad original — EXPANDIR
- Cada pieza tiene su propio hook de 1 oración

### Responde con JSON:
{
  "source_generation_id": "${generationId}",
  "angle_used": "${script.angle_family || ""}",
  "niche": "${script.niche || ""}",
  "quadrants": [
    {
      "quadrant": "Q1_preguntas",
      "quadrant_label": "Preguntas directas",
      "script_text": string (guion completo de la pieza),
      "hook": string (hook de apertura, 1 oración),
      "timing_seconds": number,
      "awareness_level": number (2-5)
    },
    ... (4 cuadrantes total)
  ]
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON.`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: "Eres un director creativo senior de retargeting. Escribís en español argentino (voseo). Especialidad: piezas cortas que convierten audiencia tibia en compradores.",
      },
    ],
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de Claude para retargeting");
  }

  return extractJSON(textBlock.text) as RetargetingPack;
}

// --- Explotar Ángulo (batch from 1 angle) ---

export interface AngleExplosionResult {
  angle_family: string;
  angle_specific: string;
  niche: string;
  scripts_by_awareness: {
    awareness_level: number;
    awareness_label: string;
    hook: string;
    body_summary: string;
    tone_description: string;
  }[];
  ad_copy_embudo: AdCopyEmbudo;
  retargeting_hooks: {
    quadrant: string;
    hook: string;
  }[];
}

/**
 * "Exploit" a single angle: generate ideas across all 5 awareness levels,
 * an ad copy embudo, and retargeting hooks.
 * This is a planning tool — generates outlines, not full scripts.
 */
export async function explodeAngle(
  angleFamily: string,
  angleSpecific: string,
  niche: string,
  avatar: string,
): Promise<AngleExplosionResult> {
  const client = getAnthropicClient();

  const prompt = `## TAREA: EXPLOTAR UN ÁNGULO — Generar plan completo

Tenés UN ángulo de comunicación. Tu tarea es "explotarlo" en múltiples piezas planificadas.

### El ángulo:
- **Familia:** ${angleFamily}
- **Ángulo específico:** ${angleSpecific}
- **Nicho:** ${niche}
- **Avatar:** ${avatar}

### Qué generar:

**1. 5 versiones por nivel de conciencia (Schwartz):**
Para cada nivel (1-5), generar:
- Un hook de apertura (2-3 oraciones)
- Un resumen del cuerpo (qué diría el guion, 2-3 oraciones)
- Descripción del tono que tendría

**2. Un Ad Copy Embudo:**
Un texto de 200-350 palabras que recorre los 5 niveles en secuencia.

**3. 4 hooks de retargeting (Hammer Them):**
Un hook por cuadrante (Q1 Preguntas, Q2 Preguntas 2do orden, Q3 Expectativas, Q4 Objeciones).

### Reglas:
- Voseo argentino SIEMPRE
- Cada pieza es DISTINTA — no repetir el mismo mensaje con palabras distintas
- Los niveles 1-2 NO venden producto. Los 3-5 sí.
- Total: 5 outlines + 1 ad copy + 4 retargeting hooks = 10 piezas de 1 ángulo

### Responde con JSON:
{
  "angle_family": "${angleFamily}",
  "angle_specific": "${angleSpecific}",
  "niche": "${niche}",
  "scripts_by_awareness": [
    {
      "awareness_level": 1,
      "awareness_label": "Unaware",
      "hook": string (2-3 oraciones),
      "body_summary": string (2-3 oraciones resumen),
      "tone_description": string (cómo sonaría este guion)
    },
    ... (5 niveles)
  ],
  "ad_copy_embudo": {
    "title": string,
    "copy_text": string (200-350 palabras, recorre los 5 niveles),
    "word_count": number,
    "awareness_flow": "1→2→3→4→5",
    "target_platform": "Meta Ads",
    "angle_used": "${angleFamily}",
    "niche": "${niche}"
  },
  "retargeting_hooks": [
    { "quadrant": "Q1_preguntas", "hook": string },
    { "quadrant": "Q2_preguntas_segundo_orden", "hook": string },
    { "quadrant": "Q3_expectativas", "hook": string },
    { "quadrant": "Q4_objeciones", "hook": string }
  ]
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON.`;

  const knowledgeContext = await getKnowledgeContext();

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: "Eres un director creativo senior de performance marketing. Escribís en español argentino (voseo). Tu especialidad: multiplicar ángulos de comunicación en arsenales completos de creativos.",
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: knowledgeContext,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Sin respuesta de Claude para angle explosion");
  }

  return extractJSON(textBlock.text) as AngleExplosionResult;
}

// --- Ad Copies Matrix: 5 hooks × 3 CTAs = 15 copies ---

export interface AdCopyVersion {
  hook_index: number;
  hook_type: string;
  cta_channel: string;
  cta_label: string;
  version_name: string;
  headline: string;
  description: string;
  primary_text: string;
  word_count: number;
  structure_used: string;
}

export interface AdCopiesMatrix {
  generation_id: string;
  angle: string;
  niche: string;
  total_versions: number;
  versions: AdCopyVersion[];
  diversity_warnings?: string[];
  createdAt: string;
}

/**
 * Pre-assign 15 unique structure+tone combos across the matrix.
 * No two copies share the same (structure × tone × persona) combo.
 */
function buildDiversityGrid(): { structure: string; tone: string; persona: string }[] {
  const structures = [
    "Storytelling cinematográfico",
    "Testimonio con audio/WhatsApp",
    "Math-based / calculadora",
    "Contrarian manifesto",
    "Listicle de señales",
    "Before/After emocional",
    "Descubrimiento accidental",
    "Comparación directa",
  ];
  const tones = [
    "empático-cálido", "urgente-directo", "analítico-frío",
    "rebelde-confrontativo", "aspiracional-esperanzador",
  ];
  const personas = [
    "protagonista (el alumno cuenta)",
    "narrador omnisciente (tercera persona)",
    "Jesús habla directo",
  ];

  // 15 slots: 5 hooks × 3 CTAs
  // Assign so no two in same CTA channel share structure, and no two in same hook share tone
  const grid: { structure: string; tone: string; persona: string }[] = [];

  for (let ctaIdx = 0; ctaIdx < 3; ctaIdx++) {
    // Shuffle structures for this channel
    const shuffled = [...structures].sort(() => Math.random() - 0.5);
    for (let hookIdx = 0; hookIdx < 5; hookIdx++) {
      grid.push({
        structure: shuffled[hookIdx % structures.length],
        tone: tones[(hookIdx + ctaIdx) % tones.length],
        persona: personas[(hookIdx + ctaIdx * 2) % personas.length],
      });
    }
  }

  return grid;
}

/**
 * Generate 15 ad copies for a script: 5 hooks × 3 CTAs.
 * Each copy is GENUINELY DIFFERENT: distinct structure, tone, persona, opening scene, and proof angle.
 * 3 parallel calls (one per CTA channel, 5 hooks each).
 */
export async function generateAdCopiesMatrix(
  script: ScriptOutput,
  generationId: string,
): Promise<AdCopiesMatrix> {
  const client = getAnthropicClient();

  const bodyText = script.development.sections.map((s) => s.script_text).join("\n");
  const angle = `${script.angle_family || "no especificado"} — ${script.angle_specific || ""}`;
  const niche = script.niche || "no especificado";

  const hooksInfo = script.hooks.map((h) =>
    `Hook ${h.variant_number} [${h.hook_type}]: "${h.script_text}"`
  ).join("\n");

  const ctaChannels = [
    {
      key: "clase_gratuita",
      label: "Clase Gratuita",
      offer: "Clase gratuita de 2 horas en vivo. Gratis. Sin compromiso. Muestra cómo encontrar productos que se venden, crearlos con IA y venderlos con publicidad.",
      ctaTone: "educativo — invitar a aprender, cero presión",
    },
    {
      key: "taller_5",
      label: "Taller $5",
      offer: "Taller de 3 días en vivo por $5 USD. Día 1: producto ganador. Día 2: crearlo completo. Día 3: venderlo. Salís con tu producto, tu anuncio y tu sistema.",
      ctaTone: "práctico — enfatizar que salís con algo concreto hecho, precio ridículo",
    },
    {
      key: "instagram",
      label: "Instagram Orgánico",
      offer: "Comentar una keyword (ej: CLASE) para recibir el link. CTA conversacional, no agresivo.",
      ctaTone: "casual y conversacional — como un amigo que te dice 'escribime'",
    },
  ];

  const diversityGrid = buildDiversityGrid();

  // Load IG reference captions for organic channel
  let igReferenceCaptions = "";
  try {
    const igDir = path.join(process.cwd(), ".data", "ig-references");
    const igFiles = fs.readdirSync(igDir).filter((f: string) => f.endsWith(".json"));
    const allCaptions: string[] = [];
    for (const file of igFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(igDir, file), "utf8"));
      // Top 5 captions by engagement per profile
      const top = (data.captions || []).slice(0, 5);
      for (const c of top) {
        if (c.caption && c.caption.length > 30) {
          allCaptions.push(`[@${data.username}] ${c.caption.slice(0, 500)}`);
        }
      }
    }
    if (allCaptions.length > 0) {
      // Max 15 reference captions to keep prompt reasonable
      igReferenceCaptions = allCaptions.slice(0, 15).join("\n\n---\n\n");
    }
  } catch { /* no ig references yet, that's ok */ }

  const systemPrompt = `Sos un copywriter senior de performance marketing para Meta Ads. Escribís en español argentino (voseo).

REGLAS INQUEBRANTABLES:
- SIEMPRE abrís con escena cinematográfica, NUNCA con pregunta
- Anti-ficción: detalles tan específicos que nadie los inventaría
- Números impares y no-redondos ($35k, 9 días, 53 audios — NUNCA redondos)
- Español argentino (voseo) SIEMPRE
- 200-250 palabras cold
- Párrafos de 1-3 líneas máximo
- CTA suave, baja fricción
- NUNCA "no te alcanza la plata", NUNCA datos inventados, NUNCA emojis (máx 1 👇)
- Headline = SEGUNDO hook (no resumen). Máx 40 chars.
- Descripción = qué es + para quién + CTA. Máx 125 chars.

LAS 8 ESTRUCTURAS:
1. Storytelling cinematográfico — historia con escena, personaje, conflicto, descubrimiento, resultado
2. Testimonio con audio/WhatsApp — simula mensaje real, comillas extensas del alumno
3. Math-based / calculadora — números, cuentas, "hacé la cuenta vos"
4. Contrarian manifesto — "lo que te dijeron está mal", rebeldía contra lo convencional
5. Listicle de señales — "3 señales de que...", identificación por lista
6. Before/After emocional — contraste crudo entre antes y después
7. Descubrimiento accidental — "un día se topó con...", serendipia
8. Comparación directa — comparar camino A vs camino B`;

  const allVersions: AdCopyVersion[] = [];

  await Promise.all(
    ctaChannels.map(async (channel, ctaIdx) => {
      const MAX_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
      const assignments = diversityGrid.slice(ctaIdx * 5, ctaIdx * 5 + 5);

      const assignmentTable = assignments.map((a, i) =>
        `| Hook ${i + 1} | ${a.structure} | ${a.tone} | ${a.persona} |`
      ).join("\n");

      const isOrganic = channel.key === "instagram";

      const prompt = isOrganic
        ? `## TAREA: Generar 5 CAPTIONS de Instagram GENUINAMENTE DISTINTOS

### CONTEXTO:
Estos NO son ads. Son posts orgánicos para el Instagram de Jesús (@jesustassarolo).
El tono es como si Jesús estuviera hablando con un amigo. Nada de venta dura.
El CTA es suave: "comentá X", "escribime", "mirá el link en bio".

### REGLA PRINCIPAL:
Tienen que sonar a post REAL de alguien que postea seguido. Como una reflexión, una historia corta, o un pensamiento que tira al pasar. NO como un anuncio ni como un copy de marketing.

### TONO:
- Conversacional, como un mensaje de WhatsApp largo o una story hablada
- Primera persona SIEMPRE (Jesús habla)
- Puede arrancar con algo cotidiano: "Ayer estaba...", "Me acuerdo cuando...", "Hoy me preguntaron..."
- Párrafos cortos, ritmo de lectura rápida
- Puede tener 1 emoji máximo por caption (o ninguno)
- NO usar frases de marketing: "descubrí", "aprovechá", "no te pierdas", "método", "sistema"
- SÍ usar frases reales: "la verdad es que", "lo que nadie te dice", "me pasó algo", "fijate"

### Las 5 variantes deben diferir en:
1. **Apertura** — 5 inicios completamente distintos
2. **Tono emocional** — reflexivo, provocador, vulnerable, directo, anecdótico
3. **Largo** — variar entre 80 y 200 palabras (no todos iguales)

### Guion base (extraer la IDEA, no copiar):
**Ángulo:** ${angle}
**Nicho:** ${niche}
**Creencia:** ${script.belief_change?.old_belief || ""} → ${script.belief_change?.new_belief || ""}

**Cuerpo del guion (referencia):**
${bodyText}

### Los 5 hooks del VIDEO:
${hooksInfo}

### INSTRUCCIONES DE RESPUESTA:
Usá la herramienta submit_copies para enviar los 5 captions.
- hook_index: 0 a 4
- headline: primera línea del caption (lo que se ve antes del "más"). Máx 40 chars.
- description: no aplica, poné "Instagram orgánico"
- primary_text: el caption completo, 80-200 palabras. Usá \\n para saltos de línea.
- Si 2 captions se parecen, REESCRIBÍ antes de enviar.
${igReferenceCaptions ? `
### CAPTIONS DE REFERENCIA (estudiá el tono, NO copies):
Estos son captions reales de cuentas que nos gustan. Usá el TONO y ESTILO como referencia, pero escribí contenido ORIGINAL sobre el ángulo del guion.

${igReferenceCaptions}
` : ""}`

        : `## TAREA: Generar 5 Ad Copies GENUINAMENTE DISTINTOS para "${channel.label}"

### REGLA #1 DE DIVERSIDAD — LA MÁS IMPORTANTE:
Los 15 copies (5 hooks × 3 canales) se van a testear en Meta Ads SIMULTÁNEAMENTE.
Si dos copies se parecen, estamos desperdiciando presupuesto.

**CADA COPY DEBE DIFERIR EN ESTAS 5 DIMENSIONES:**
1. **ESTRUCTURA:** ya asignada abajo — NO cambiar
2. **TONO:** ya asignado abajo — escena inicial cambia según el tono
3. **PERSONA narrativa:** ya asignada — quién "habla" en el copy
4. **ESCENA DE APERTURA:** 5 escenas COMPLETAMENTE distintas (lugar, momento, acción)
5. **ÁNGULO DE PRUEBA:** usar distinto tipo de evidencia (número, cita, timeline, contraste, cálculo)

### Asignaciones forzadas (NO modificar):
| Hook | Estructura | Tono | Persona |
|------|-----------|------|---------|
${assignmentTable}

### Guion base (extraer la IDEA, no copiar texto):
**Ángulo:** ${angle}
**Nicho:** ${niche}
**Segmento:** ${script.segment || "no especificado"}
**Avatar:** ${script.avatar || "no especificado"}
**Awareness:** ${script.awareness_level || "no especificado"}
**Creencia:** ${script.belief_change?.old_belief || ""} → ${script.belief_change?.new_belief || ""}

**Cuerpo del guion (referencia, NO copiar):**
${bodyText}

### Los 5 hooks del VIDEO (el copy debe MATCHEAR lo que se ve):
${hooksInfo}

### Canal CTA: ${channel.label}
**Oferta:** ${channel.offer}
**Tono del CTA:** ${channel.ctaTone}

### CHECKLIST DE DIVERSIDAD (verificar ANTES de responder):
- [ ] ¿Las 5 escenas de apertura son en LUGARES distintos? (no 2 en cocina, no 2 mirando celular)
- [ ] ¿Los 5 headlines son estructuralmente distintos? (no 2 que empiecen igual)
- [ ] ¿Los 5 tipos de prueba son distintos? (no 2 con "X ventas", no 2 con timeline)
- [ ] ¿Ningún copy comparte más de 1 oración con otro?
- [ ] ¿Los word counts varían? (entre 200 y 250, no todos 230)

### INSTRUCCIONES DE RESPUESTA:
Usá la herramienta submit_copies para enviar los 5 copies.
- hook_index: 0 a 4
- primary_text: 200-250 palabras. Usá \\n para saltos de línea.
- Si 2 copies se parecen, REESCRIBÍ antes de enviar.`;

      const systemForChannel = isOrganic
        ? `Sos Jesús Tassarolo escribiendo captions para tu Instagram personal. Escribís en español argentino (voseo).
Tu estilo: directo, sin rodeos, como si hablaras con un amigo. Contás tu experiencia real. No vendés — compartís.
NUNCA usás lenguaje de marketing. NUNCA empezás con preguntas retóricas. Sos una persona real posteando, no un copywriter.
Frases típicas tuyas: "la verdad es que", "te lo digo así", "me pasó algo", "fijate esto", "lo que aprendí", "no es joda".`
        : systemPrompt;

      // Use tool_use to force valid JSON output
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 16384,
        system: [{ type: "text", text: systemForChannel }],
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        tool_choice: { type: "tool", name: "submit_copies" },
        tools: [{
          name: "submit_copies",
          description: "Submit the 5 ad copies for this CTA channel",
          input_schema: {
            type: "object" as const,
            properties: {
              copies: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                  type: "object",
                  properties: {
                    hook_index: { type: "number" },
                    hook_type: { type: "string" },
                    headline: { type: "string", description: "Max 40 chars" },
                    description: { type: "string", description: "Max 125 chars" },
                    primary_text: { type: "string", description: "200-250 words, use \\n for line breaks" },
                    word_count: { type: "number" },
                    structure_used: { type: "string" },
                  },
                  required: ["hook_index", "hook_type", "headline", "description", "primary_text", "word_count", "structure_used"],
                },
              },
            },
            required: ["copies"],
          },
        }],
      });

      // Check if response was truncated
      if (response.stop_reason !== "tool_use") {
        console.warn(`[copies-matrix] ${channel.label} stop_reason: ${response.stop_reason} (expected tool_use)`);
      }

      const toolBlock = response.content.find((b) => b.type === "tool_use");
      if (!toolBlock || toolBlock.type !== "tool_use") {
        throw new Error(`Sin respuesta tool_use para copies ${channel.label} (stop: ${response.stop_reason})`);
      }

      const toolInput = toolBlock.input as Record<string, unknown>;
      let copies = toolInput.copies;

      // If copies came as string (model bug), try to parse it
      if (typeof copies === "string") {
        console.log(`[copies-matrix] ${channel.label} got string copies, first 200 chars: ${(copies as string).slice(0, 200)}`);
        try { copies = JSON.parse(copies as string); } catch (e) {
          // Try extracting JSON array from the string
          const match = (copies as string).match(/\[[\s\S]*\]/);
          if (match) {
            try { copies = JSON.parse(match[0]); } catch { /* fall through */ }
          }
        }
      }

      // If toolInput itself is the copies array (no wrapper object)
      if (!copies || (typeof copies === "string")) {
        // Check if the entire input has copy-like fields
        if (toolInput && typeof toolInput === "object" && "hook_index" in toolInput) {
          copies = [toolInput]; // single copy returned as object
        }
      }

      // Removed debug log

      type CopyItem = {
        hook_index: number;
        hook_type: string;
        headline: string;
        description: string;
        primary_text: string;
        word_count: number;
        structure_used: string;
      };

      if (!Array.isArray(copies) || copies.length < 1 || typeof copies[0] !== "object" || !(copies[0] as CopyItem).headline) {
        throw new Error(`Respuesta inválida para ${channel.label}: esperaba 5 copies, recibí ${Array.isArray(copies) ? `${copies.length} items (first type: ${typeof copies[0]})` : typeof copies}`);
      }

      const typedCopies = copies as CopyItem[];

      for (const copy of typedCopies) {
        allVersions.push({
          hook_index: copy.hook_index,
          hook_type: copy.hook_type,
          cta_channel: channel.key,
          cta_label: channel.label,
          version_name: `H${copy.hook_index + 1}-${channel.label.replace(/\s+/g, "")}`,
          headline: copy.headline,
          description: copy.description,
          primary_text: copy.primary_text,
          word_count: copy.word_count,
          structure_used: copy.structure_used,
        });
      }
      break; // success, exit retry loop
      } catch (err) {
        if (attempt === MAX_RETRIES - 1) throw err;
        console.warn(`Retry ${attempt + 1} for ${channel.label}: ${err}`);
      }
      } // end retry loop
    }),
  );

  allVersions.sort((a, b) => a.hook_index - b.hook_index || a.cta_channel.localeCompare(b.cta_channel));

  // Post-generation diversity check: flag copies that share too many words
  const warnings: string[] = [];
  for (let i = 0; i < allVersions.length; i++) {
    for (let j = i + 1; j < allVersions.length; j++) {
      const similarity = textSimilarity(allVersions[i].primary_text, allVersions[j].primary_text);
      if (similarity > 0.4) {
        warnings.push(
          `${allVersions[i].version_name} y ${allVersions[j].version_name} tienen ${Math.round(similarity * 100)}% similitud`
        );
      }
    }
  }

  return {
    generation_id: generationId,
    angle,
    niche,
    total_versions: allVersions.length,
    versions: allVersions,
    diversity_warnings: warnings,
    createdAt: new Date().toISOString(),
  };
}

/** Simple word-overlap similarity (Jaccard on word trigrams) */
function textSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const trigrams = (text: string) => {
    const words = text.toLowerCase().replace(/[^a-záéíóúñü\s]/g, "").split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i <= words.length - 3; i++) {
      set.add(words.slice(i, i + 3).join(" "));
    }
    return set;
  };
  const setA = trigrams(a);
  const setB = trigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  return intersection / Math.min(setA.size, setB.size);
}
