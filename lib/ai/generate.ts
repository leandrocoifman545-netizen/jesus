import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts/system";
import {
  type ScriptOutput,
  type Hook,
  type DevelopmentSection,
} from "./schemas/script-output";
import { type ReferenceAnalysis } from "./schemas/reference-analysis";
import { listReferences, listGenerations, getBurnedLeads, getCaseStudies } from "../storage/local";
import { computeCoverage } from "../coverage";

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
    "platform": string,
    "recommended_duration_seconds": number,
    "content_style": string,
    "key_considerations": string
  },
  "hooks": [{
    "variant_number": number,
    "hook_type": "curiosity_gap" | "contrarian" | "question" | "statistical" | "pain_point" | "pattern_interrupt" | "reveal_teaser" | "authority_social_proof",
    "script_text": string,
    "timing_seconds": number
  }],
  "development": {
    "framework_used": "AIDA" | "PAS" | "BAB" | "Hook-Story-Offer" | "3_Acts",
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
    "cta_type": "swipe_up" | "link_bio" | "comment" | "shop_now" | "learn_more" | "download" | "sign_up" | "custom"
  },
  "total_duration_seconds": number,
  "word_count": number
}`;

const HOOKS_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "hooks": [{
    "variant_number": number,
    "hook_type": "curiosity_gap" | "contrarian" | "question" | "statistical" | "pain_point" | "pattern_interrupt" | "reveal_teaser" | "authority_social_proof",
    "script_text": string,
    "timing_seconds": number
  }]
}`;

const SINGLE_HOOK_SCHEMA_DESC = `Responde con un JSON con esta estructura (un solo hook, NO un array):
{
  "variant_number": number,
  "hook_type": "curiosity_gap" | "contrarian" | "question" | "statistical" | "pain_point" | "pattern_interrupt" | "reveal_teaser" | "authority_social_proof",
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
  "cta_type": "swipe_up" | "link_bio" | "comment" | "shop_now" | "learn_more" | "download" | "sign_up" | "custom"
}`;

const REFERENCE_SCHEMA_DESC = `Responde con un JSON con esta estructura:
{
  "hook": {
    "text": string,
    "type": "curiosity_gap" | "contrarian" | "question" | "statistical" | "pain_point" | "pattern_interrupt" | "reveal_teaser" | "authority_social_proof",
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
    "type": "swipe_up" | "link_bio" | "comment" | "shop_now" | "learn_more" | "download" | "sign_up" | "custom" | "none",
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

  prompt += `\n\n**Duración objetivo:** 60 a 90 segundos (elegí la duración óptima según la complejidad del producto, apuntá a 60-90s para desarrollar bien el mensaje)`;

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
  } catch {
    return "";
  }
}

async function buildCoverageGaps(projectId?: string): Promise<string> {
  try {
    const coverage = await computeCoverage();

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
  } catch {
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
  } catch {
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
  } catch {
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

  // Inject burned leads to avoid repetition
  prompt += await buildBurnedLeadsContext();

  const format = resolveFormat(brief.platform);
  const formatLabel = FORMAT_LABELS[format] || format;

  prompt += `\n\n## INSTRUCCIÓN
Genera un guión publicitario completo en formato ${formatLabel} con:
1. ${brief.hookCount} variantes de hook de apertura (cada una con un tipo de hook diferente, numeradas del 1 al ${brief.hookCount})
2. Desarrollo del mensaje central (cuerpo del guión independiente de los hooks)
3. Cierre con CTA dual (verbal + visual)

IMPORTANTE: Los hooks deben ser INDEPENDIENTES del cuerpo. Cualquier hook debe poder combinarse con el mismo desarrollo y CTA sin necesidad de modificar nada.

Adapta todo al formato ${formatLabel} y al público objetivo especificado.
${brief.brandTone ? `Respeta estrictamente el tono de marca: "${brief.brandTone}".` : "Elegí el tono más apropiado según el producto y la audiencia."}
Apuntá a una duración de entre 60 y 90 segundos. Esto permite desarrollar bien el mensaje sin apurar.

REGLA DE DIVERSIDAD: Si hay winners o referencias cargadas, aplicá sus PRINCIPIOS (retención, tono, números concretos) pero NUNCA copies la misma combinación de framework + hook type + nicho. Cada guion debe ser único.

${SCRIPT_SCHEMA_DESC}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después.`;

  return prompt;
}

function summarizeScript(script: ScriptOutput): string {
  const sections = script.development.sections
    .map((s) => `  - [${s.section_name}] (${s.timing_seconds}s): "${s.script_text}"`)
    .join("\n");

  return `## GUIÓN ACTUAL

**Plataforma:** ${script.platform_adaptation.platform}
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
    temperature: 0.9,
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
${rules.slice(0, 2000)}

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
    temperature: 0.9,
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
- Cada hook debe usar un tipo DIFERENTE a los existentes. Si ya se usaron todos los tipos, podés repetir tipos pero con un ángulo completamente distinto.
- Los hooks deben ser INDEPENDIENTES: cualquiera debe poder combinarse con el cuerpo del guión sin modificar nada.
- Mantené el mismo tono, plataforma y público objetivo del brief.
- Cada hook debe ser decible en 3 segundos o menos (5-10 palabras máximo).

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
  const lastSection = script.development.sections[script.development.sections.length - 1];

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

  const prompt = `${buildBriefContext(brief)}

${summarizeScript(script)}

## HOOK A REGENERAR
- Variante #${hook.variant_number} (${hook.hook_type}): "${hook.script_text}"

## OTROS HOOKS (NO repetir ideas)
${otherHooks}

## INSTRUCCIÓN
Regenerá ÚNICAMENTE el hook variante #${hook.variant_number}.

REGLAS:
- Generá un hook completamente NUEVO y DIFERENTE al actual.
- Podés cambiar el tipo de hook si querés, pero NO uses un tipo que ya esté en los otros hooks (a menos que el ángulo sea completamente distinto).
- El hook debe ser decible en 3 segundos o menos (5-10 palabras máximo).
- Debe ser INDEPENDIENTE del cuerpo: cualquier hook debe poder combinarse con el desarrollo sin modificar nada.
- Mantené el mismo variant_number: ${hook.variant_number}.
- ${brief.brandTone ? `Respetá el tono de marca: "${brief.brandTone}".` : "Mantené el mismo tono del guión original."}

${SINGLE_HOOK_SCHEMA_DESC}

Responde ÚNICAMENTE con el JSON.`;

  return callClaude(prompt, undefined, 2048, brief.generationRules) as Promise<Hook>;
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
