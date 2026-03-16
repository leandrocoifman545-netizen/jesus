#!/usr/bin/env node
/**
 * Saves a script generation to .data/ so it appears in the web app.
 * Usage: echo '{"brief":{...},"script":{...}}' | node scripts/save-generation.mjs
 * Or:    node scripts/save-generation.mjs path/to/generation.json
 */
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

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

// Duration minimum recommendation
if (duration > 0 && duration < 75) {
  warnings.push(`Duración ${duration}s está por debajo del mínimo recomendado de 75s para micro-VSL completo.`);
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

// ── Angle duplicate check: block if angle_specific exists in confirmed/recorded generations ──
// Only checks generations with status "confirmed" or "recorded" (not drafts).
// Drafts get deleted by the user, so they don't count.
if (script.angle_specific) {
  try {
    const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
    const blockedStatuses = new Set(["confirmed", "recorded", "winner"]);
    const usedAngles = [];
    for (const file of files) {
      try {
        const gen = JSON.parse(readFileSync(join(GENERATIONS_DIR, file), "utf-8"));
        // Only block if the generation has a confirmed/recorded/winner status
        if (!gen.status || !blockedStatuses.has(gen.status)) continue;
        const existingAngle = gen.script?.angle_specific;
        if (existingAngle) {
          // Normalize: lowercase, strip spaces
          const norm = (s) => s.toLowerCase().replace(/[\s\-—]+/g, "_").replace(/[^a-z0-9_\.]/g, "");
          if (norm(existingAngle) === norm(script.angle_specific)) {
            usedAngles.push({
              angle: existingAngle,
              niche: gen.script?.niche || "?",
              status: gen.status,
              date: gen.createdAt?.slice(0, 10),
              id: gen.id?.slice(0, 8),
            });
          }
        }
      } catch { /* skip corrupt files */ }
    }
    if (usedAngles.length > 0) {
      const details = usedAngles.map(a => `${a.angle} [${a.status}] en "${a.niche}" (${a.date}, ${a.id})`).join("; ");
      errors.push(`⚠️  ÁNGULO REPETIDO: "${script.angle_specific}" ya se usó en generaciones confirmadas/grabadas: ${details}. Elegí un ángulo_specific distinto.`);
    }
  } catch { /* non-critical */ }
}

// ── Niche duplicate check: warn if exact niche was used before ──
if (script.niche) {
  try {
    const files = readdirSync(GENERATIONS_DIR).filter(f => f.endsWith(".json"));
    for (const file of files) {
      try {
        const gen = JSON.parse(readFileSync(join(GENERATIONS_DIR, file), "utf-8"));
        const existingNiche = gen.script?.niche;
        if (existingNiche && existingNiche.toLowerCase().trim() === script.niche.toLowerCase().trim()) {
          warnings.push(`Nicho "${script.niche}" ya fue usado en generación ${gen.id?.slice(0, 8)} (${gen.createdAt?.slice(0, 10)})`);
          break;
        }
      } catch { /* skip */ }
    }
  } catch { /* non-critical */ }
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
