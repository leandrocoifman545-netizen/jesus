#!/usr/bin/env node
/**
 * Saves a script generation to .data/ so it appears in the web app.
 * Usage: echo '{"brief":{...},"script":{...}}' | node scripts/save-generation.mjs
 * Or:    node scripts/save-generation.mjs path/to/generation.json
 */
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { validateHooks } from "./validate-hooks.mjs";
import { execFileSync } from "child_process";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const BRIEFS_DIR = join(DATA_DIR, "briefs");
const GENERATIONS_DIR = join(DATA_DIR, "generations");

// Ensure directories exist
[DATA_DIR, BRIEFS_DIR, GENERATIONS_DIR].forEach((d) => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

// Read input from file arg or stdin
let input;
if (process.argv[2]) {
  input = readFileSync(process.argv[2], "utf-8");
} else {
  input = readFileSync("/dev/stdin", "utf-8");
}

const data = JSON.parse(input);
const { brief, script, batch, title, projectId } = data;

if (!script) {
  console.error("Error: se requiere al menos 'script' en el JSON");
  process.exit(1);
}

// ── Validation: check mandatory fields before saving ──
const warnings = [];
const errors = [];

// Required structural fields
const requiredFields = [
  ["angle_family", "Familia de ángulo (1-5)"],
  ["angle_specific", "Ángulo específico"],
  ["body_type", "Tipo de cuerpo"],
  ["segment", "Segmento (A/B/C/D)"],
  ["funnel_stage", "Funnel (TOFU/MOFU/RETARGET)"],
  ["niche", "Nicho específico"],
  ["model_sale_type", "Venta del modelo (1-10)"],
  ["transition_text", "Transición (Capa 1)"],
];

for (const [field, label] of requiredFields) {
  if (!script[field]) errors.push(`Falta campo obligatorio: ${label} (${field})`);
}

// Hooks validation
if (!script.hooks || script.hooks.length === 0) {
  errors.push("No hay hooks/leads");
} else {
  const shortHooks = script.hooks.filter(h => {
    const text = h.script_text || h.text || "";
    return text.split(/[.!?]+/).filter(Boolean).length < 2;
  });
  if (shortHooks.length > 0) {
    warnings.push(`${shortHooks.length} lead(s) tienen menos de 2 oraciones`);
  }
  const hooksNoTiming = script.hooks.filter(h => h.timing_seconds == null);
  if (hooksNoTiming.length > 0) {
    warnings.push(`${hooksNoTiming.length} hook(s) sin timing_seconds`);
  }

  // Structural pattern + similarity validation
  try {
    const hookResult = validateHooks(script.hooks);
    for (const e of hookResult.errors) {
      errors.push(`🔁 ${e.message}`);
    }
    for (const w of hookResult.warnings) {
      warnings.push(`🔁 ${w.message}`);
    }
  } catch (e) {
    warnings.push(`Hook validation skipped: ${e.message}`);
  }
}

// Body validation (either development.sections or body)
if (!script.development?.sections?.length && !script.body) {
  errors.push("No hay cuerpo (ni development.sections ni body)");
} else if (script.development?.sections?.length) {
  // Validate section_name and timing_seconds on each section
  const sectionsNoName = script.development.sections.filter(s => !s.section_name);
  if (sectionsNoName.length > 0) {
    errors.push(`${sectionsNoName.length} sección(es) sin 'section_name'. Usar section_name (no title).`);
  }
  const sectionsNoTiming = script.development.sections.filter(s => s.timing_seconds == null);
  if (sectionsNoTiming.length > 0) {
    errors.push(`${sectionsNoTiming.length} sección(es) sin 'timing_seconds'. Cada sección necesita duración en segundos.`);
  }
}

// Word count validation
const wordCount = script.word_count || 0;
const duration = script.total_duration_seconds || 0;
if (duration > 0 && duration <= 90 && wordCount > 250) {
  warnings.push(`Word count (${wordCount}) parece alto para ${duration}s`);
}
if (duration > 0 && duration >= 60 && wordCount < 100) {
  warnings.push(`Word count (${wordCount}) parece bajo para ${duration}s`);
}

// Belief change
if (!script.belief_change || (!script.belief_change.old_belief && !script.belief_change.old)) {
  warnings.push("Falta belief_change (cambio de creencia)");
} else if (!script.belief_change.mechanism) {
  errors.push("belief_change sin 'mechanism'. Debe tener: old_belief, mechanism, new_belief.");
}

// Micro-beliefs: must exist AND each body section must map to one
if (!script.micro_beliefs || script.micro_beliefs.length < 2) {
  errors.push("Faltan micro_beliefs (mínimo 2)");
} else {
  const sections = script.development?.sections || [];
  const sectionsWithMC = sections.filter(s => s.micro_belief && s.micro_belief.trim().length > 0);
  if (sections.length > 0 && sectionsWithMC.length === 0) {
    errors.push("Ninguna sección del body tiene campo 'micro_belief'. Cada sección debe instalar UNA micro-creencia específica.");
  } else if (sections.length > 0 && sectionsWithMC.length < sections.length) {
    errors.push(`${sections.length - sectionsWithMC.length} sección(es) del body no tienen campo 'micro_belief'. TODAS las secciones deben tener una micro-creencia asignada.`);
  }
}

// ── Micro-YES chain validation (obligatorio en guiones > 60s) ──
if (duration > 60) {
  if (!script.micro_yes_chain || script.micro_yes_chain.length === 0) {
    errors.push("Falta micro_yes_chain. Guiones de 60s+ requieren mínimo 5 puntos de micro-yes distribuidos en lead/body/pre-CTA.");
  } else if (script.micro_yes_chain.length < 5) {
    errors.push(`micro_yes_chain tiene ${script.micro_yes_chain.length} puntos (mínimo 5 para ${duration}s).`);
  } else {
    // Validate each entry has required fields
    const invalidMY = script.micro_yes_chain.filter(m => !m.location || !m.phrase);
    if (invalidMY.length > 0) {
      errors.push(`${invalidMY.length} punto(s) de micro_yes_chain sin 'location' o 'phrase'.`);
    }
  }
} else if (duration > 0 && duration <= 60 && script.micro_yes_chain && script.micro_yes_chain.length < 3) {
  warnings.push(`micro_yes_chain tiene ${script.micro_yes_chain.length} puntos. Incluso en guiones cortos, 3+ micro-yes mejoran conversión.`);
}

// ── Micro-YES cross-reference: each phrase must appear in the actual script text ──
if (script.micro_yes_chain?.length > 0) {
  // Defer allScriptText check — build it here if body is available already
  const myBodyText = script.body || (script.development?.sections || []).map(s => s.script_text || "").join(" ");
  const myAllText = [
    myBodyText,
    (script.hooks || []).map(h => h.script_text || h.text || "").join(" "),
    script.transition_text || "",
  ].join(" ").toLowerCase().replace(/\s+/g, " ").trim();

  if (myAllText.length > 20) {
    const missingMY = script.micro_yes_chain.filter(m => {
      if (!m.phrase || m.phrase.length < 5) return false;
      const normPhrase = m.phrase.toLowerCase().replace(/\s+/g, " ").trim();
      return !myAllText.includes(normPhrase);
    });
    if (missingMY.length > 0) {
      errors.push(`${missingMY.length} frase(s) de micro_yes_chain no aparecen en el texto del guion:\n    ${missingMY.map(m => `"${(m.phrase || "").substring(0, 50)}..."`).join("\n    ")}\n    Cada micro-yes debe ser una frase REAL del guion, no inventada en la metadata.`);
    }
  }
}

// ── Micro-VSL beat validation ──
const validFunctions = new Set(["identificacion", "quiebre", "mecanismo", "demolicion", "prueba", "venta_modelo"]);
const allSections = script.development?.sections || [];
if (allSections.length > 0) {
  // Check persuasion_function on each section
  const sectionsWithPF = allSections.filter(s => s.persuasion_function && validFunctions.has(s.persuasion_function));
  if (sectionsWithPF.length === 0) {
    errors.push("Ninguna sección tiene 'persuasion_function'. Cada beat DEBE tener una función persuasiva (identificacion, quiebre, mecanismo, demolicion, prueba, venta_modelo).");
  } else {
    // Check for duplicate functions (excluding venta_modelo which is always last)
    const funcs = sectionsWithPF.map(s => s.persuasion_function).filter(f => f !== "venta_modelo");
    const uniqueFuncs = new Set(funcs);
    if (uniqueFuncs.size < funcs.length) {
      const dupes = funcs.filter((f, i) => funcs.indexOf(f) !== i);
      errors.push(`Funciones persuasivas REPETIDAS: ${[...new Set(dupes)].join(", ")}. Cada beat debe cubrir una función DISTINTA.`);
    }
  }

  // Beat count vs duration
  const bodyBeats = allSections.filter(s => s.persuasion_function !== "venta_modelo");
  if (duration >= 75 && bodyBeats.length < 4) {
    warnings.push(`Guion de ${duration}s tiene solo ${bodyBeats.length} beats. Para 75-90s se recomiendan 5 beats.`);
  } else if (duration >= 60 && duration < 75 && bodyBeats.length < 3) {
    warnings.push(`Guion de ${duration}s tiene solo ${bodyBeats.length} beats. Para 60-75s se recomiendan 4 beats.`);
  }

  // Check that demolicion exists in 75s+ scripts
  if (duration >= 75 && !allSections.some(s => s.persuasion_function === "demolicion")) {
    warnings.push("Guion de 75s+ sin beat de 'demolicion'. Los micro-VSL de 75s+ deben incluir demolición de objeciones.");
  }
}

// Duration validation
if (duration > 0 && duration < 75) {
  warnings.push(`Duración ${duration}s está por debajo del mínimo recomendado de 75s para micro-VSL completo.`);
}
if (duration > 95 && script.funnel_stage !== "RETARGET") {
  warnings.push(`📉 Duración ${duration}s supera los 95s. Dato: cada 15s después de 45s, CLR cae ~0.30 puntos. Target: 75-90s para ads, 55-65s para orgánico.`);
}
if (duration > 110) {
  errors.push(`📉 Duración ${duration}s es excesiva (máx recomendado: 90s ads, 65s orgánico). CLR cae drásticamente después de 95s. Recortar.`);
}

// Ingredients
if (!script.ingredients_used || script.ingredients_used.length === 0) {
  warnings.push("Faltan ingredients_used");
}

// CTA blocks
if (!script.cta_blocks || script.cta_blocks.length < 3) {
  warnings.push("Faltan cta_blocks (se necesitan 3: clase_gratuita, taller_5, instagram)");
}

// CTA validation: offer_bridge must match active CTAs
const ctasActivosPath = join(DATA_DIR, "ctas-activos.json");
if (script.offer_bridge?.script_text && existsSync(ctasActivosPath)) {
  try {
    const ctasActivos = JSON.parse(readFileSync(ctasActivosPath, "utf-8"));
    const offerText = script.offer_bridge.script_text.toLowerCase().replace(/\s+/g, " ").trim();
    // Check if at least 30% of the CTA text is present in offer_bridge (fuzzy match — allows minor adapts)
    const matchesCTA = ctasActivos.some((cta) => {
      if (!cta.text) return false;
      // Extract key phrases (first 5 words of each sentence)
      const ctaSentences = cta.text.split(/[.!?]+/).filter(Boolean).map(s => s.trim().toLowerCase());
      const matchedSentences = ctaSentences.filter(s => {
        const keyPhrase = s.split(/\s+/).slice(0, 5).join(" ");
        return keyPhrase.length > 10 && offerText.includes(keyPhrase);
      });
      return matchedSentences.length >= Math.max(2, Math.floor(ctaSentences.length * 0.3));
    });
    if (!matchesCTA) {
      warnings.push("offer_bridge.script_text no coincide con ningún CTA activo de ctas-activos.json. Debería ser copia/adaptación de uno de los 3 bloques activos.");
    }
  } catch { /* non-critical */ }
}

// offer_bridge.product_type must be valid
if (script.offer_bridge?.product_type && !["webinar_gratis", "taller_5", "custom"].includes(script.offer_bridge.product_type)) {
  errors.push(`offer_bridge.product_type "${script.offer_bridge.product_type}" no es válido. Debe ser: webinar_gratis, taller_5, o custom.`);
}

// Voseo check (sample body text)
const bodyText = script.body || (script.development?.sections || []).map(s => s.script_text || "").join(" ");
if (bodyText && (bodyText.includes(" tú ") || bodyText.includes(" tienes ") || bodyText.includes(" puedes "))) {
  errors.push("El cuerpo usa 'tú/tienes/puedes' en vez de voseo argentino");
}

// ── Vocabulario prohibido: Jesús habla informal, no como consultor ──
const VOCABULARIO_PROHIBIDO = [
  { regex: /\btransform(ar|ación|ando|ó|á)\b/i, palabra: "transformar/transformación", reemplazo: "cambiar" },
  { regex: /\bgenerar?\s+ingresos\b/i, palabra: "generar ingresos", reemplazo: "ganar plata / hacer plata" },
  { regex: /\bemprendimiento\b/i, palabra: "emprendimiento", reemplazo: "negocio / producto" },
  { regex: /\bpotenci(ar|ando|á)\b/i, palabra: "potenciar", reemplazo: "eliminarlo (no tiene reemplazo)" },
  { regex: /\boptimiz(ar|ando|á)\b/i, palabra: "optimizar", reemplazo: "mejorar" },
  { regex: /\bimplement(ar|ando|ó|á)\b/i, palabra: "implementar", reemplazo: "hacer / armar" },
  { regex: /\bmonetiz(ar|ando|á)\b/i, palabra: "monetizar", reemplazo: "vender / cobrar" },
  { regex: /\bdiversific(ar|ando|á)\b/i, palabra: "diversificar", reemplazo: "tener más de una fuente" },
  { regex: /\bsostenible\b/i, palabra: "sostenible", reemplazo: "que dure / consistente" },
  { regex: /\bparadigma\b/i, palabra: "paradigma", reemplazo: "NUNCA usar" },
  { regex: /\becosistema\b/i, palabra: "ecosistema", reemplazo: "NUNCA usar (figurativo)" },
  { regex: /\bapalancarse?\b/i, palabra: "apalancarse", reemplazo: "NUNCA usar" },
  { regex: /\bsinergia\b/i, palabra: "sinergia", reemplazo: "NUNCA usar" },
  { regex: /\bdisruptivo\b/i, palabra: "disruptivo", reemplazo: "NUNCA usar" },
  { regex: /\bingresos?\s+pasivos?\b/i, palabra: "ingresos pasivos", reemplazo: "plata mientras dormís" },
  { regex: /\bescalable\b/i, palabra: "escalable", reemplazo: "que crece solo / que se vende solo" },
];

// Combine all script text: body sections + hooks + transition
const allScriptText = [
  bodyText,
  (script.hooks || []).map(h => h.script_text || h.text || "").join(" "),
  script.transition_text || "",
].join(" ");

if (allScriptText.trim()) {
  const vocabViolations = [];
  for (const rule of VOCABULARIO_PROHIBIDO) {
    if (rule.regex.test(allScriptText)) {
      vocabViolations.push(`"${rule.palabra}" → usá: ${rule.reemplazo}`);
    }
  }
  if (vocabViolations.length > 0) {
    errors.push(`🗣️ Vocabulario prohibido (Jesús no habla así):\n    ${vocabViolations.join("\n    ")}`);
  }
}

// ── Vocabulario de segmento — check que el guion habla como el avatar correcto ──
const segVocabPath = join(DATA_DIR, "segment-vocabulary.json");
if (script.segment && existsSync(segVocabPath) && allScriptText.trim()) {
  try {
    const segVocab = JSON.parse(readFileSync(segVocabPath, "utf-8"));
    const seg = segVocab[script.segment.toUpperCase()];
    if (seg) {
      // Check must_use: at least 2 words from the segment vocabulary must appear
      const textLower = allScriptText.toLowerCase();
      const foundWords = (seg.must_use || []).filter(w => textLower.includes(w.toLowerCase()));
      if (foundWords.length < 2) {
        errors.push(`🗣️ Segmento "${script.segment}" (${seg.label}) pero solo ${foundWords.length} palabra(s) del vocabulario del avatar aparecen en el guion (mínimo 2). Vocabulario del segmento: ${seg.must_use.join(", ")}. Encontradas: ${foundWords.length > 0 ? foundWords.join(", ") : "ninguna"}.`);
      }

      // Check must_avoid: these words should NOT appear for this segment
      const avoidFound = (seg.must_avoid || []).filter(w => textLower.includes(w.toLowerCase()));
      if (avoidFound.length > 0) {
        errors.push(`🗣️ Segmento "${script.segment}" NO debe usar: ${avoidFound.map(w => `"${w}"`).join(", ")} (palabras incorrectas para ${seg.label}).`);
      }
    }
  } catch { /* non-critical */ }
}

// ── Anti-ficción: frases genéricas que delatan escritura perezosa ──
const GENERIC_PHRASES = [
  { regex: /tenía problemas económicos/i, fix: "especificar: 'le pidió plata a su hermana por quinta vez'" },
  { regex: /cambió su vida/i, fix: "especificar QUÉ cambió: 'dejó el laburo de 12 horas'" },
  { regex: /empezó a ganar plata/i, fix: "número concreto: 'hizo $35.000 el primer mes'" },
  { regex: /sin experiencia previa/i, fix: "contar QUÉ no sabía: 'no sabía ni abrir un Excel'" },
  { regex: /desde la comodidad de su casa/i, fix: "eliminar — cliché universal de scam" },
  { regex: /ingresos extras?/i, fix: "número concreto: '$800 dólares por semana'" },
  { regex: /logró? su sueño/i, fix: "eliminar — motivacional genérico" },
  { regex: /personas? como (vos|tú|yo)/i, fix: "nombrar: 'Patricia, 52 años, de Tucumán'" },
  { regex: /miles? de personas/i, fix: "número concreto: '4.700 personas buscan esto por mes'" },
  { regex: /cualquier? persona puede/i, fix: "especificar: 'María no sabía prender la notebook'" },
  { regex: /genera(r|ndo)?\s+ingresos?\s+(desde|en)\s+(tu|su)\s+casa/i, fix: "eliminar — cliché de MLM" },
  { regex: /trabaj(ar|á[rs])?\s+desde\s+(cualquier|donde)/i, fix: "concreto: 'desde un café en Medellín'" },
];
if (allScriptText.trim()) {
  const genericFound = [];
  for (const rule of GENERIC_PHRASES) {
    if (rule.regex.test(allScriptText)) {
      genericFound.push(`"${allScriptText.match(rule.regex)?.[0]}" → ${rule.fix}`);
    }
  }
  if (genericFound.length >= 3) {
    errors.push(`🎭 ${genericFound.length} frases GENÉRICAS (anti-ficción, 3+ = BLOQUEO). Cada beat necesita al menos 1 detalle que nadie inventaría:\n    ${genericFound.join("\n    ")}`);
  } else if (genericFound.length > 0) {
    warnings.push(`🎭 ${genericFound.length} frase(s) genérica(s) (anti-ficción). Reemplazar por detalles específicos:\n    ${genericFound.join("\n    ")}`);
  }
}

// ── Anti-ficción POSITIVA: cada beat debe tener al menos 1 marcador de especificidad ──
// No alcanza con no ser genérico — tiene que ser ESPECÍFICO. Un beat sin números, nombres,
// objetos concretos o productos específicos es casi seguro genérico.
if (allSections.length > 0) {
  const SPECIFICITY_MARKERS = [
    /\$\s*\d/,                    // montos de dinero
    /\d{2,}/,                     // números de 2+ dígitos
    /\b(primera?|segunda?|tercera?|cuarta?|quinta?|sexta?)\s+vez\b/i, // frecuencia ordinal
    /\b(Hotmart|Gumroad|WhatsApp|Instagram|ChatGPT|Canva|Fiverr|Amazon|Google|TikTok|YouTube|Mercado Libre|PDF|Excel)\b/i,
    /\b(Tucumán|Córdoba|Medellín|Buenos Aires|Rosario|Montevideo|Bogotá|Lima|Santiago|Francia|Colombia|México|Perú|Chile)\b/,
    /\b(celular|notebook|computadora|sillón|auto|café|pizza|alquiler|cuota|supermercado|colectivo|subte|cocina|mesa|escritorio)\b/i,
    /\b(guía|ebook|checklist|plantilla|receta|rutina|prompt|sistema)\s+de\s+\w/i,
    /\b\d+\s*(minutos?|horas?|días?|semanas?|meses?|años?|copias?|ventas?|clientes?|dólares?|pesos?|audios?)\b/i,
    /\b(María|Patricia|Roberto|Laura|Martín|Carlos|Ana|Jorge|Marta|Diego|Valentina)\b/,
    /\b(hermana?|hermano|mamá|papá|hijo|hija|vecino|jefe|marido|esposa|novia|novio|suegra)\b/i,
    /\b(repostería|yoga|fitness|masajes?|fotografía|costura|crochet|jardinería|nutrición|diseño|maquillaje|peluquería|uñas|panadería)\b/i,
  ];

  const beatsNoSpecificity = [];
  for (const section of allSections) {
    if (section.persuasion_function === "venta_modelo") continue;
    const text = section.script_text || "";
    if (text.length < 20) continue;
    const hasMarker = SPECIFICITY_MARKERS.some(pat => pat.test(text));
    if (!hasMarker) {
      beatsNoSpecificity.push(section.section_name || section.persuasion_function || "?");
    }
  }

  if (beatsNoSpecificity.length >= 3) {
    errors.push(`🎭 Anti-ficción: ${beatsNoSpecificity.length} beats sin NINGÚN detalle específico (3+ = BLOQUEO): ${beatsNoSpecificity.join(", ")}. Cada beat necesita al menos 1: número concreto, nombre propio, objeto cotidiano, producto específico, o ciudad.`);
  } else if (beatsNoSpecificity.length > 0) {
    warnings.push(`🎭 Anti-ficción: ${beatsNoSpecificity.length} beat(s) sin detalle específico: ${beatsNoSpecificity.join(", ")}. Agregar: número, nombre, objeto, producto o ciudad.`);
  }
}

// ── P-IA3: Sinónimo cycling (la IA evita repetir y usa sinónimos forzados) ──
const SYNONYM_GROUPS = [
  { group: ["producto", "negocio", "emprendimiento", "proyecto", "venture"], label: "producto/negocio" },
  { group: ["plata", "dinero", "ingresos", "ganancias", "capital", "fondos"], label: "plata/dinero" },
  { group: ["crear", "armar", "diseñar", "desarrollar", "construir", "elaborar"], label: "crear/armar" },
  { group: ["vender", "comercializar", "monetizar", "ofrecer", "colocar"], label: "vender" },
  { group: ["herramienta", "recurso", "instrumento", "medio", "plataforma"], label: "herramienta" },
  { group: ["aprender", "capacitarse", "formarse", "estudiar", "instruirse"], label: "aprender" },
];
if (allScriptText.trim()) {
  const textWords = allScriptText.toLowerCase();
  const synProblems = [];
  for (const { group, label } of SYNONYM_GROUPS) {
    const found = group.filter(w => new RegExp(`\\b${w}\\b`, "i").test(textWords));
    if (found.length >= 3) {
      synProblems.push(`${label}: ${found.map(w => `"${w}"`).join(", ")} (${found.length} sinónimos — Jesús repite la misma palabra, no la disfraza)`);
    }
  }
  if (synProblems.length > 0) {
    warnings.push(`🤖 P-IA3 Sinónimo cycling:\n    ${synProblems.join("\n    ")}`);
  }
}

// ── Jerga de marketing en el guion — BLOCK (18x más frecuente en videos bottom) ──
const MARKETING_JARGON = [
  { regex: /\bfunnel\b/i, palabra: "funnel", fix: "clientes / proceso de venta" },
  { regex: /\bembudo\b/i, palabra: "embudo", fix: "clientes / proceso de venta" },
  { regex: /\blanzamiento\b/i, palabra: "lanzamiento", fix: "eliminar — jerga de marketing" },
  { regex: /\bcall[\s-]?to[\s-]?action\b/i, palabra: "call-to-action", fix: "eliminar" },
  { regex: /\bleads\b/i, palabra: "leads", fix: "clientes / gente interesada" },
  { regex: /\bcopywriting\b/i, palabra: "copywriting", fix: "eliminar" },
  { regex: /\bengagement\b/i, palabra: "engagement", fix: "eliminar" },
  { regex: /\bretargeting\b/i, palabra: "retargeting", fix: "eliminar" },
  { regex: /\bawareness\b/i, palabra: "awareness", fix: "eliminar" },
  { regex: /\bbranding\b/i, palabra: "branding", fix: "eliminar" },
];
if (allScriptText.trim()) {
  const jargonFound = [];
  for (const rule of MARKETING_JARGON) {
    if (rule.regex.test(allScriptText)) {
      jargonFound.push(`"${rule.palabra}" → ${rule.fix}`);
    }
  }
  if (jargonFound.length > 0) {
    errors.push(`📉 Jerga de marketing en el guion (18x más frecuente en videos bottom):\n    ${jargonFound.join("\n    ")}`);
  }
}

// ── Transición con rendición narrativa — BLOCK ──
const transitionText = (script.transition_text || "").trim();
if (transitionText) {
  const SURRENDER = [
    { regex: /^pero bueno/i, phrase: "Pero bueno" },
    { regex: /^de todos modos/i, phrase: "De todos modos" },
    { regex: /^en fin\b(?!\s+de\b)/i, phrase: "En fin" },
    { regex: /^como sea/i, phrase: "Como sea" },
  ];
  for (const rule of SURRENDER) {
    if (rule.regex.test(transitionText)) {
      errors.push(`📉 Transición empieza con "${rule.phrase}" — rendición narrativa (0 apariciones en top 25% de 191 videos). Reformular con energía igual o mayor.`);
    }
  }
}

// ── CLR killer words en body/transición — BLOCK ──
const bodyAndTransitionText = [bodyText, transitionText].join(" ");
const CLR_KILLERS = [
  { regex: /\bpero bueno\b/i, palabra: "pero bueno", note: "0 apariciones en top 25%" },
  { regex: /\bde todos modos\b/i, palabra: "de todos modos", note: "desconexión emocional" },
  { regex: /\ben fin\b(?!\s+de\b)/i, palabra: "en fin", note: "6.3x más en videos bottom" },
  { regex: /\bcomo sea\b/i, palabra: "como sea", note: "descarta lo anterior" },
];
if (bodyAndTransitionText.trim()) {
  const killersFound = [];
  for (const rule of CLR_KILLERS) {
    if (rule.regex.test(bodyAndTransitionText)) {
      killersFound.push(`"${rule.palabra}" (${rule.note})`);
    }
  }
  if (killersFound.length > 0) {
    errors.push(`📉 Palabras que MATAN el CLR:\n    ${killersFound.join("\n    ")}`);
  }
}

// ── Cierre con despedida en vez de instrucción — WARNING ──
const closeText = transitionText || (allSections.slice(-1)?.[0]?.script_text || "");
if (closeText) {
  const GOODBYES = [/nos vemos/i, /hasta la próxima/i, /\béxitos\b/i, /un abrazo/i, /espero que te (haya|sirva)/i, /\bchau\b/i, /nos encontramos/i];
  for (const pat of GOODBYES) {
    if (pat.test(closeText)) {
      warnings.push(`📉 Cierre suena a despedida ("${closeText.match(pat)?.[0]}"). CLR despedida=0.92 vs instrucción=1.48 (-37%). Última frase debe ser INSTRUCCIÓN.`);
      break;
    }
  }
}

// ── Data interna filtrada al copy — BLOCK ──
const DATA_LEAKS = [
  { regex: /\b562\s*(compradores|buyers|personas?\s+que\s+compraron)\b/i, desc: "referencia a 562 compradores" },
  { regex: /\b8\.?0?74\s*(leads|contactos|personas)\b/i, desc: "referencia a 8074 leads" },
  { regex: /\bsegún\s+(datos|estudios|estadísticas|encuestas)\b/i, desc: "apelación a datos/estudios" },
  { regex: /\b(la data|los datos)\s+(dice|muestran|indican|revelan)\b/i, desc: "datos como argumento" },
  { regex: /\bel\s+\d{1,3}%\s+de\s+(las personas|los compradores|la gente|nuestra audiencia|nuestros)\b/i, desc: "porcentaje de audiencia en copy" },
];
if (allScriptText.trim()) {
  const leaks = [];
  for (const rule of DATA_LEAKS) {
    if (rule.regex.test(allScriptText)) {
      leaks.push(rule.desc);
    }
  }
  if (leaks.length > 0) {
    errors.push(`🔒 Data INTERNA filtrada al copy (Jesús: "eso es data interna nuestra, solo la usás vos para vos"):\n    ${leaks.join("\n    ")}`);
  }
}

// ── Cargar TODAS las generaciones UNA vez (reutilizado por arc, vehicle, angle, niche, batch checks) ──
let _allGenerations = null;
function getAllGenerations() {
  if (_allGenerations) return _allGenerations;
  try {
    const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
    _allGenerations = files
      .map(f => { try { return JSON.parse(readFileSync(join(GENERATIONS_DIR, f), "utf-8")); } catch { return null; } })
      .filter(Boolean)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch {
    _allGenerations = [];
  }
  return _allGenerations;
}

// ── Arco narrativo repetido en últimos 3 — BLOCK ──
if (script.development?.emotional_arc) {
  const recentArcs = getAllGenerations().slice(0, 3).map(g => g.script?.development?.emotional_arc).filter(Boolean);
  if (recentArcs.includes(script.development.emotional_arc)) {
    errors.push(`🔁 Arco narrativo "${script.development.emotional_arc}" repetido en últimos 3 guiones (${recentArcs.join(", ")}). Hay 8 arcos — elegir uno distinto.`);
  }
}

// ── Vehículo narrativo repetido 2+ veces en últimos 5 — BLOCK ──
if (script.body_type) {
  const recentVehicles = getAllGenerations().slice(0, 5).map(g => g.script?.body_type).filter(Boolean);
  const count = recentVehicles.filter(v => v === script.body_type).length;
  if (count >= 2) {
    errors.push(`🔁 Vehículo "${script.body_type}" usado ${count}x en últimos 5 guiones. Rotar vehículos narrativos.`);
  }
}

// ── Ingredientes gastados (máx 3 de F#73/F#74/G#90/B#29) — BLOCK si >3 ──
const GASTADO_IDS = new Set(["F#73", "F#74", "G#90", "B#29"]);
if (script.ingredients_used?.length > 0) {
  const gastados = script.ingredients_used.filter(i => GASTADO_IDS.has(`${i.category}#${i.ingredient_number}`));
  if (gastados.length > 3) {
    errors.push(`🔁 ${gastados.length} ingredientes GASTADOS (máx 3): ${gastados.map(i => `${i.category}#${i.ingredient_number}`).join(", ")}. Usar ingredientes frescos: D#49, E#67, F#75, F#76, F#82, G#94, K#125-127.`);
  } else if (gastados.length > 0) {
    warnings.push(`${gastados.length} ingrediente(s) gastado(s): ${gastados.map(i => `${i.category}#${i.ingredient_number}`).join(", ")}. Considerar alternativas frescas.`);
  }
}

// ── CLR booster check — WARNING si no hay ninguno ──
const CLR_BOOSTERS = [/una?\s+locura/i, /literalmente/i, /lo único que tenés que hacer/i, /se acaba de filtrar/i, /en menos de un minuto/i, /\bnuev[oa]\b/i];
if (allScriptText.trim()) {
  const boostersFound = CLR_BOOSTERS.filter(r => r.test(allScriptText)).length;
  if (boostersFound === 0) {
    warnings.push(`📈 Sin palabras CLR booster. Considerar agregar: "una locura", "literalmente", "lo único que tenés que hacer es", "nuevo/a"`);
  }
}

// ── Patrones de escritura IA (humanizer automatizado) ──
// Detecta P-IA1, P-IA2, P-IA4, P-IA5, P-IA6, P-IA8, P-IA10 del humanizer.
// 3+ patrones = BLOQUEO, 1-2 = WARNING
const AI_PATTERNS = [];

if (allScriptText.trim()) {
  // P-IA1: Regla de tres — "encontrás, creás y vendés" (verbos en tríada paralela)
  const ruleOfThree = allScriptText.match(/\b\w+[áéí]s\b\s*,\s*\b\w+[áéí]s\b\s+y\s+\b\w+[áéí]s\b/gi) || [];
  if (ruleOfThree.length >= 1) {
    AI_PATTERNS.push(`P-IA1: Regla de tres ("${ruleOfThree[0]}"). Romper trío: a veces son 2, a veces 4, a veces 1 sola bien explicada.`);
  }

  // P-IA2: Paralelismo negativo — "No es X, es Y"
  const negParallel = allScriptText.match(/no (?:es|se trata de) .{2,30},\s*(?:es|se trata de) /gi) || [];
  if (negParallel.length >= 2) {
    AI_PATTERNS.push(`P-IA2: Paralelismo negativo x${negParallel.length} ("${negParallel[0].trim()}..."). Jesús dice: "X te sobra. Lo que te falta es Y."`);
  }

  // P-IA4: Filler de transición (máx 2 por guion)
  const fillerPhrases = ["la realidad es que", "básicamente", "justamente", "lo cierto es que", "lo importante es que", "lo interesante es que"];
  let fillerTotal = 0;
  for (const f of fillerPhrases) {
    const matches = allScriptText.toLowerCase().match(new RegExp(`\\b${f}\\b`, "g"));
    fillerTotal += matches ? matches.length : 0;
  }
  if (fillerTotal > 2) {
    AI_PATTERNS.push(`P-IA4: ${fillerTotal} fillers de transición (máx 2). Jesús los usa con intención, no como relleno.`);
  }

  // P-IA5: Cierre motivacional genérico
  const motivClosePatterns = [
    /las barreras? desaparecieron/i, /tu momento es ahora/i, /el campo de juego se niveló/i,
    /la única (?:barrera|limitación) sos vos/i, /el futuro (?:es tuyo|te espera)/i,
    /no hay límites/i, /todo es posible/i, /el cambio empieza (?:hoy|ahora|con vos)/i,
  ];
  for (const pat of motivClosePatterns) {
    if (pat.test(allScriptText)) {
      AI_PATTERNS.push(`P-IA5: Cierre motivacional genérico ("${allScriptText.match(pat)?.[0]}"). Jesús cierra con algo CONCRETO.`);
      break;
    }
  }

  // P-IA8: Arranques expositivos ("El problema es que...", "Lo interesante es que...")
  const expoStarters = [/\bel problema es que\b/i, /\blo interesante es que\b/i, /\besto significa que\b/i, /\bcabe destacar\b/i, /\bsin embargo\b/i, /\bno obstante\b/i, /\bes importante mencionar\b/i];
  const expoCount = expoStarters.reduce((sum, pat) => sum + (pat.test(allScriptText) ? 1 : 0), 0);
  if (expoCount >= 2) {
    AI_PATTERNS.push(`P-IA8: ${expoCount} arranques expositivos. Jesús no introduce ideas — las tira.`);
  }

  // P-IA10: Preguntas retóricas predecibles
  const predQPatterns = [/¿y si pudieras/i, /¿te imaginás/i, /¿qué pasaría si/i, /¿no te gustaría/i, /¿y si te dijera que/i, /¿y si existiera/i];
  const predQCount = predQPatterns.reduce((sum, pat) => sum + (pat.test(allScriptText) ? 1 : 0), 0);
  if (predQCount >= 1) {
    AI_PATTERNS.push(`P-IA10: Pregunta retórica predecible (${predQCount}). Las preguntas de Jesús tienen FILO — no son genéricas.`);
  }

  // P-IA9: Datos sin anclaje emocional — números de resultado sueltos sin contexto
  const sentences = allScriptText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const RESULT_NUMBER = /\b\d+\s*(copias?|ventas?|dólares?|pesos?|USD|por\s+(mes|día|semana)|al\s+(mes|día))\b|\$\s*\d+/i;
  const EMOTION_ANCHOR = /\b(cuota|auto|café|pizza|alquiler|sillón|dormi|almuerzo|cena|supermercado|bolsillo|sin levantarse|sin salir|mientras|imaginat|pensá que|eso es|o sea|una? locura|más que|menos que)\b/i;
  let unanchoredCount = 0;
  for (let i = 0; i < sentences.length; i++) {
    if (RESULT_NUMBER.test(sentences[i])) {
      const context = sentences[i] + " " + (sentences[i + 1] || "");
      if (!EMOTION_ANCHOR.test(context)) {
        unanchoredCount++;
      }
    }
  }
  if (unanchoredCount >= 2) {
    AI_PATTERNS.push(`P-IA9: ${unanchoredCount} dato(s) numéricos sin anclaje emocional. "Vendió 200 copias" → "200 copias. Eso es una cuota del auto. Sin levantarse del sillón."`);
  }
}

// P-IA6: Beats demasiado simétricos (todos con largo similar = robot)
if (allSections.length >= 3) {
  const beatWordCounts = allSections
    .filter(s => s.persuasion_function !== "venta_modelo")
    .map(s => (s.script_text || "").split(/\s+/).filter(Boolean).length);
  if (beatWordCounts.length >= 3) {
    const avg = beatWordCounts.reduce((a, b) => a + b, 0) / beatWordCounts.length;
    const allSimilar = avg > 10 && beatWordCounts.every(wc => Math.abs(wc - avg) <= 5);
    if (allSimilar) {
      AI_PATTERNS.push(`P-IA6: Beats demasiado simétricos (${beatWordCounts.join(", ")} palabras c/u). Variar ritmo: un beat corto y punchy, otro largo y narrativo.`);
    }
  }
}

if (AI_PATTERNS.length >= 3) {
  errors.push(`🤖 ${AI_PATTERNS.length} patrones de escritura IA detectados (3+ = BLOQUEO):\n    ${AI_PATTERNS.join("\n    ")}`);
} else if (AI_PATTERNS.length > 0) {
  warnings.push(`🤖 ${AI_PATTERNS.length} patrón(es) de escritura IA:\n    ${AI_PATTERNS.join("\n    ")}`);
}

// ── Angle duplicate check: block if angle_specific exists in confirmed/recorded generations ──
if (script.angle_specific) {
  const blockedStatuses = new Set(["confirmed", "recorded", "winner"]);
  const norm = (s) => s.toLowerCase().replace(/[\s\-—]+/g, "_").replace(/[^a-z0-9_\.]/g, "");
  const usedAngles = getAllGenerations()
    .filter(g => g.status && blockedStatuses.has(g.status) && g.script?.angle_specific)
    .filter(g => norm(g.script.angle_specific) === norm(script.angle_specific))
    .map(g => ({ angle: g.script.angle_specific, niche: g.script?.niche || "?", status: g.status, date: g.createdAt?.slice(0, 10), id: g.id?.slice(0, 8) }));
  if (usedAngles.length > 0) {
    const details = usedAngles.map(a => `${a.angle} [${a.status}] en "${a.niche}" (${a.date}, ${a.id})`).join("; ");
    errors.push(`⚠️  ÁNGULO REPETIDO: "${script.angle_specific}" ya se usó en generaciones confirmadas/grabadas: ${details}. Elegí un ángulo_specific distinto.`);
  }
}

// ── Niche duplicate check: warn if exact niche was used before ──
if (script.niche) {
  const nicheMatch = getAllGenerations().find(g =>
    g.script?.niche && g.script.niche.toLowerCase().trim() === script.niche.toLowerCase().trim()
  );
  if (nicheMatch) {
    warnings.push(`Nicho "${script.niche}" ya fue usado en generación ${nicheMatch.id?.slice(0, 8)} (${nicheMatch.createdAt?.slice(0, 10)})`);
  }
}

// ── Batch cross-check: diversidad dentro del mismo batch ──
if (batch) {
  const batchSiblings = getAllGenerations().filter(g => g.batch === batch);

  if (batchSiblings.length > 0) {
    // Arco repetido dentro del batch
    const batchArcs = batchSiblings.map(g => g.script?.development?.emotional_arc).filter(Boolean);
    if (script.development?.emotional_arc && batchArcs.includes(script.development.emotional_arc)) {
      errors.push(`🔁 Arco "${script.development.emotional_arc}" ya usado en este batch. Cada guion del batch necesita arco distinto.`);
    }

    // Vehículo repetido dentro del batch
    const batchVehicles = batchSiblings.map(g => g.script?.body_type).filter(Boolean);
    const vehInBatch = batchVehicles.filter(v => v === script.body_type).length;
    if (vehInBatch >= 2) {
      warnings.push(`🔁 Vehículo "${script.body_type}" usado ${vehInBatch}x en este batch.`);
    }

    // Familia de ángulo: máx 2 por batch (de reglas-diversidad.md)
    const batchFamilies = batchSiblings.map(g => g.script?.angle_family).filter(Boolean);
    const famInBatch = batchFamilies.filter(f => f === script.angle_family).length;
    if (famInBatch >= 2) {
      errors.push(`🔁 Familia "${script.angle_family}" usada ${famInBatch}x en este batch (máx 2 por familia en batch de 10). BLOQUEADO.`);
    }

    // Venta del modelo: no repetir dentro del batch
    const batchSales = batchSiblings.map(g => g.script?.model_sale_type).filter(Boolean);
    if (script.model_sale_type && batchSales.includes(script.model_sale_type)) {
      warnings.push(`🔁 Venta del modelo "${script.model_sale_type}" ya usada en este batch. Hay 10 tipos — rotar.`);
    }
  }
}

// Report
if (errors.length > 0) {
  console.error("\n❌ ERRORES (bloquean el guardado):");
  errors.forEach(e => console.error(`  - ${e}`));
}
if (warnings.length > 0) {
  console.error("\n⚠️  WARNINGS (se guarda pero revisar):");
  warnings.forEach(w => console.error(`  - ${w}`));
}

// Block save on errors unless --force flag
if (errors.length > 0 && !process.argv.includes("--force")) {
  console.error("\nUsá --force para guardar de todas formas.");
  process.exit(1);
}
if (errors.length === 0 && warnings.length === 0) {
  console.error("✅ Validación OK");
}

// ── Auto-enrich CTA blocks with layers from ctas-activos.json ──
if (existsSync(ctasActivosPath) && script.cta_blocks) {
  try {
    const ctasActivos = JSON.parse(readFileSync(ctasActivosPath, "utf-8"));
    for (const block of script.cta_blocks) {
      if (block.layers) continue; // already has layers, skip
      // Match by channel + variant
      const match = ctasActivos.find((cta) => {
        const channelMatch =
          cta.channel?.toLowerCase() === block.channel_label?.toLowerCase() ||
          cta.id?.startsWith(block.channel?.replace("_", "-"));
        const variantMatch = !block.variant || cta.variant === block.variant;
        return channelMatch && variantMatch;
      });
      if (match?.layers) {
        block.layers = match.layers;
        block.ingredients = match.ingredients || block.ingredients;
      }
    }
  } catch { /* non-critical */ }
}

const briefId = randomUUID();
const generationId = randomUUID();
const now = new Date().toISOString();

// Save brief
const briefData = {
  id: briefId,
  projectId: projectId || brief?.projectId,
  productDescription: brief?.productDescription || "Generado desde CLI",
  targetAudience: brief?.targetAudience || "",
  hookCount: script.hooks?.length || 5,
  createdAt: now,
};
writeFileSync(join(BRIEFS_DIR, `${briefId}.json`), JSON.stringify(briefData, null, 2));

// Save generation
const genData = {
  id: generationId,
  briefId,
  projectId: projectId || brief?.projectId,
  title: title || undefined,
  batch: batch || undefined,
  script,
  createdAt: now,
};
writeFileSync(join(GENERATIONS_DIR, `${generationId}.json`), JSON.stringify(genData, null, 2));

console.log(JSON.stringify({ generationId, briefId, url: `/scripts/${generationId}` }));

// ── Auto-regenerar matriz de cobertura ──
try {
  execFileSync("node", [join(import.meta.dirname, "update-coverage.mjs")], { stdio: "pipe" });
  console.error("✅ Matriz de cobertura actualizada automáticamente.");
} catch (e) {
  console.error(`⚠️ No se pudo actualizar la matriz de cobertura: ${e.message}`);
}
