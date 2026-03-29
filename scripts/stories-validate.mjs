#!/usr/bin/env node
/**
 * Validates a story sequence JSON before saving to .data/stories/.
 * Usage: echo '{"sequence_type":"cta_lead_magnet",...}' | node scripts/stories-validate.mjs
 * Or:    node scripts/stories-validate.mjs path/to/story.json
 *
 * Exits 0 if valid (may have warnings), exits 1 if has blocking errors.
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dirname, "..", ".data");
const STORIES_DIR = join(DATA_DIR, "stories");

// Read input
let input;
if (process.argv[2]) {
  input = readFileSync(process.argv[2], "utf-8");
} else {
  input = readFileSync("/dev/stdin", "utf-8");
}

const data = JSON.parse(input);
const warnings = [];
const errors = [];

// ── 1. Required fields ──
const requiredFields = [
  ["sequence_type", "Tipo de secuencia"],
  ["avatar", "Avatar"],
  ["big_idea", "Big idea"],
  ["creative_idea", "Idea creativa"],
  ["calentamiento_layer", "Capa de calentamiento"],
  ["tension_id", "Tensión emocional"],
  ["emotional_arc", "Arco emocional"],
  ["angle_family", "Familia de ángulo"],
];

for (const [field, label] of requiredFields) {
  if (!data[field]) errors.push(`Falta campo obligatorio: ${label} (${field})`);
}

// ── 2. Stories array validation ──
if (!data.stories || data.stories.length === 0) {
  errors.push("No hay stories en la secuencia");
} else {
  const stories = data.stories;

  // R2: Story count (ranges per type)
  const storyRanges = {
    cta_volumen: [2, 4],
    cta_lead_magnet: [4, 6],
    expertise: [5, 8],
    behind_the_scenes: [7, 12],
    // Default for all other types: 7-15
  };
  const [minStories, maxStories] = storyRanges[data.sequence_type] || [7, 15];
  if (stories.length < minStories || stories.length > maxStories) {
    errors.push(`Cantidad de stories fuera de rango: ${stories.length} (debe ser ${minStories}-${maxStories} para ${data.sequence_type})`);
  }

  // R1: First story must be selfie
  const firstStory = stories[0];
  if (data.sequence_type !== "actuada_triangulo") {
    if (firstStory && firstStory.visual_format && !firstStory.visual_format.startsWith("F1")) {
      errors.push("Story 1 debe ser foto selfie (F1) mostrando la cara (R1)");
    }
  }

  // R3: No 2 consecutive videos of same type
  for (let i = 1; i < stories.length; i++) {
    const prev = stories[i - 1].visual_format || "";
    const curr = stories[i].visual_format || "";
    if (prev.startsWith("V") && curr === prev) {
      errors.push(`Stories ${i} y ${i + 1}: 2 videos del mismo formato seguidos (R3): ${curr}`);
    }
  }

  // R7: At least 1 interaction
  const hasInteraction = stories.some(s => s.interaction);
  if (!hasInteraction) {
    warnings.push("No hay ninguna interacción (encuesta, caja, botón) — se requiere mínimo 1 (R7)");
  }

  // Each story should have visual_format
  const noFormat = stories.filter(s => !s.visual_format);
  if (noFormat.length > 0) {
    warnings.push(`${noFormat.length} story(ies) sin visual_format asignado`);
  }

  // Each story should have function
  const noFunction = stories.filter(s => !s.function);
  if (noFunction.length > 0) {
    warnings.push(`${noFunction.length} story(ies) sin función asignada`);
  }

  // Emotion changes (montaña rusa)
  const emotions = stories.map(s => s.emotion).filter(Boolean);
  const uniqueEmotions = [...new Set(emotions)];
  if (uniqueEmotions.length < 3) {
    errors.push(`Solo ${uniqueEmotions.length} emociones distintas — se requieren mínimo 3 para montaña rusa emocional`);
  }

  // Trigger distribution
  const triggers = stories.map(s => s.trigger).filter(Boolean);
  if (triggers.length < Math.floor(stories.length * 0.5)) {
    warnings.push(`Solo ${triggers.length}/${stories.length} stories tienen trigger asignado — se recomienda en todas`);
  }
  // Check consecutive same triggers
  for (let i = 1; i < stories.length; i++) {
    if (stories[i].trigger && stories[i].trigger === stories[i - 1]?.trigger) {
      warnings.push(`Stories ${i} y ${i + 1} tienen el mismo trigger (${stories[i].trigger}) — redistribuir`);
    }
  }
}

// ── 3. CTA validation ──
if (data.cta && data.cta.type === "inbound") {
  if (!data.cta.keyword) {
    errors.push("CTA inbound sin keyword definida");
  }
  if (!data.cta.setter_script) {
    warnings.push("CTA inbound sin setter_script — el setter no sabrá qué decir");
  }
}

// ── 4. Objections dissolved ──
const needsPersuasion = data.sequence_type !== "cta_volumen";
if (needsPersuasion) {
  if (!data.objections_dissolved || data.objections_dissolved.length < 2) {
    const count = data.objections_dissolved?.length || 0;
    errors.push(`Solo ${count} objeciones disueltas — se requieren mínimo 2 (excepto CTA Volumen)`);
  }
}

// ── 5. Micro-yes chain ──
if (needsPersuasion) {
  if (!data.micro_yes_chain || data.micro_yes_chain.length < 3) {
    const count = data.micro_yes_chain?.length || 0;
    warnings.push(`Solo ${count} micro-yes visuales — se recomiendan mínimo 3`);
  }
}

// ── 6. Text anti-IA patterns ──
const allText = (data.stories || []).map(s => {
  return [s.text_on_screen, s.text_spoken].filter(Boolean).join(" ");
}).join(" ");

// S-IA3: Elevated vocabulary
const elevatedWords = ["impactante", "revolucionario", "transformador", "increíble", "extraordinario", "fascinante"];
const foundElevated = elevatedWords.filter(w => allText.toLowerCase().includes(w));
if (foundElevated.length > 0) {
  errors.push(`S-IA3 Vocabulario elevado detectado: ${foundElevated.join(", ")} — reemplazar con vocabulario de Jesús`);
}

// S-IA9: Marketing jargon
const marketingWords = ["funnel", "embudo", "lanzamiento", "leads", "engagement", "conversión", "monetizar", "escalable", "copywriting", "retargeting"];
const foundMarketing = marketingWords.filter(w => allText.toLowerCase().includes(w));
if (foundMarketing.length > 0) {
  errors.push(`S-IA9 Jerga de marketing detectada: ${foundMarketing.join(", ")} — reemplazar con lenguaje del avatar`);
}

// S-IA8: Internal data leaked
const internalPatterns = [/562\s*compradores/i, /22[.,]?819\s*conversaciones/i, /8[.,]?074\s*leads/i, /según datos/i, /según estudios/i];
for (const pattern of internalPatterns) {
  if (pattern.test(allText)) {
    errors.push(`S-IA8 Data interna filtrada: "${allText.match(pattern)?.[0]}" — NUNCA exponer data interna en copy`);
  }
}

// S-IA10: Too much text per story
if (data.stories) {
  for (const s of data.stories) {
    if (s.text_on_screen) {
      const lines = s.text_on_screen.split("\n").filter(Boolean);
      if (lines.length > 3) {
        warnings.push(`Story ${s.number}: ${lines.length} líneas de texto en pantalla (máximo recomendado: 2-3)`);
      }
    }
  }
}

// Voseo check (no tú/tienes/puedes)
const voseoViolations = allText.match(/\b(tú|tienes|puedes|quieres|necesitas|debes)\b/gi);
if (voseoViolations && voseoViolations.length > 0) {
  errors.push(`Falta voseo argentino — se encontró: ${[...new Set(voseoViolations)].join(", ")}`);
}

// ── 7. Hook anti-repetition ──
const prohibitedHookPatterns = [
  { id: "SH1", pattern: /^hoy me qued[eé] pensando/i, name: "Reflexión genérica" },
  { id: "SH2", pattern: /^me escribi[oó] alguien/i, name: "DM → respuesta" },
  { id: "SH3", pattern: /^[¿?]sab[eé]s qu[eé] d[ií]a es/i, name: "¿Sabés qué día es?" },
  { id: "SH4", pattern: /^no vas a creer/i, name: "Promesa vacía" },
  { id: "SH5", pattern: /^tengo que contarte/i, name: "Misterio sin ancla" },
  { id: "SH6", pattern: /me cambi[oó] la vida/i, name: "Afirmación grandiosa" },
];

if (data.stories && data.stories.length > 0) {
  const hookText = data.stories[0].text_on_screen || data.stories[0].text_spoken || "";
  for (const { id, pattern, name } of prohibitedHookPatterns) {
    if (pattern.test(hookText)) {
      errors.push(`${id} Hook prohibido detectado: "${name}" — cambiar el mecanismo del hook`);
    }
  }
}

// ── 8. Check against recent stories for repetition ──
if (existsSync(STORIES_DIR)) {
  try {
    const recentFiles = readdirSync(STORIES_DIR)
      .filter(f => f.endsWith(".json"))
      .sort()
      .slice(-10);

    const recentHooks = [];
    for (const f of recentFiles) {
      try {
        const recent = JSON.parse(readFileSync(join(STORIES_DIR, f), "utf-8"));
        if (recent.stories && recent.stories[0]) {
          recentHooks.push({
            file: f,
            type: recent.sequence_type,
            hook: recent.stories[0].text_on_screen || recent.stories[0].text_spoken || "",
          });
        }
      } catch {}
    }

    // Check same type used in last 2 weeks
    if (data.sequence_type && data.sequence_type !== "cta_lead_magnet") {
      const sameType = recentHooks.filter(h => h.type === data.sequence_type);
      if (sameType.length >= 2) {
        warnings.push(`Tipo "${data.sequence_type}" usado ${sameType.length} veces en últimas 10 secuencias — considerar rotar`);
      }
    }
  } catch {}
}

// ── Output results ──
console.log("\n🎬 VALIDACIÓN DE STORY SEQUENCE\n");
console.log(`Tipo: ${data.sequence_type || "?"}`);
console.log(`Avatar: ${data.avatar || "?"}`);
console.log(`Stories: ${data.stories?.length || 0}`);
console.log(`Big idea: ${data.big_idea || "?"}`);
console.log("");

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ Secuencia válida — sin errores ni warnings\n");
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} WARNING(S):`);
  for (const w of warnings) console.log(`   ⚠️  ${w}`);
  console.log("");
}

if (errors.length > 0) {
  console.log(`❌ ${errors.length} ERROR(ES) — CORREGIR ANTES DE GUARDAR:`);
  for (const e of errors) console.log(`   ❌ ${e}`);
  console.log("");
  process.exit(1);
}

console.log("✅ Secuencia válida (con warnings)\n");
process.exit(0);
