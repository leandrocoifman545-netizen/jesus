#!/usr/bin/env node
/**
 * Linter de análisis de stories/destacadas.
 * Valida que el output de un análisis profundo tenga TODAS las secciones requeridas
 * con la profundidad mínima especificada.
 *
 * Uso:
 *   node scripts/validate-analysis.mjs <path-to-markdown>
 *
 * Output: JSON compatible con Claude Code hooks
 *   { "decision": "block"|"allow", "reason": "..." }
 *
 * Exit 0 = análisis válido (allow)
 * Exit 1 = análisis incompleto (block con detalle de lo que falta)
 */
import { readFileSync } from "fs";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/validate-analysis.mjs <file.md>");
  process.exit(1);
}

let content;
try {
  content = readFileSync(filePath, "utf-8");
} catch (e) {
  console.error(`Cannot read file: ${filePath}`);
  process.exit(1);
}

// ── Normalize text for matching (strip accents) ──
function norm(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ── Split markdown into sections by ## headers ──
function splitSections(md) {
  const sections = [];
  const lines = md.split("\n");
  let currentHeader = null;
  let currentBody = [];

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (currentHeader !== null) {
        sections.push({ header: currentHeader, body: currentBody.join("\n") });
      }
      currentHeader = line.replace(/^##\s+/, "").trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeader !== null) {
    sections.push({ header: currentHeader, body: currentBody.join("\n") });
  }
  return sections;
}

// ── Count helpers ──
function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function countTableRows(text) {
  const lines = text.split("\n").filter(l => l.trim().startsWith("|"));
  // Subtract header + separator rows
  return Math.max(0, lines.length - 2);
}

function countBullets(text) {
  return text.split("\n").filter(l => /^\s*[-*•]\s+/.test(l) || /^\s*\d+[\.)]\s+/.test(l)).length;
}

function countCodeBlocks(text) {
  return (text.match(/```/g) || []).length / 2;
}

// ── Required sections with validation rules ──
const REQUIRED_SECTIONS = [
  {
    id: "FASE-1",
    name: "FASE -1: Cruce con referencias",
    patterns: ["fase.*-1", "cruce.*referencia"],
    minWords: 50,
    errorMsg: "Falta FASE -1 (cruce con referencias existentes ANTES de analizar)",
  },
  {
    id: "P1",
    name: "Pasada 1 — Inventario",
    patterns: ["inventario", "pasada.*1", "superficie"],
    minWords: 100,
    errorMsg: "Falta Pasada 1 / Inventario de stories (story por story)",
  },
  {
    id: "P2",
    name: "Pasada 2 — Decisiones",
    patterns: ["pasada.*2", "decisiones", "por.*qu[eé].*cada"],
    minWords: 50,
    errorMsg: "Falta Pasada 2 (decisiones y por qué)",
  },
  {
    id: "P3",
    name: "Pasada 3 — Ausencias",
    patterns: ["pasada.*3", "ausencia", "lo que.*no.*hay", "lo que.*falta"],
    minWords: 80,
    minItems: 5, // min 5 ausencias listadas
    errorMsg: "Falta Pasada 3 (lo que NO hay). Necesita mín 5 ausencias listadas",
  },
  {
    id: "P4",
    name: "Pasada 4 — Modelos mentales",
    patterns: ["pasada.*4", "modelos?.*mentales?"],
    minWords: 100,
    minItems: 3, // min 3 modelos mentales
    errorMsg: "Falta Pasada 4 (modelos mentales). Necesita mín 3 modelos",
  },
  {
    id: "P5",
    name: "Pasada 5 — Cadena de confianza",
    patterns: ["pasada.*5", "cadena.*confianza", "s[ií].*internos"],
    minWords: 50,
    errorMsg: "Falta Pasada 5 (cadena de confianza / SÍes internos)",
  },
  {
    id: "P6",
    name: "Pasada 6 — Mapa de símbolos",
    patterns: ["pasada.*6", "mapa.*s[ií]mbolos", "s[ií]mbolos.*comunicaci"],
    minWords: 100,
    minTableRows: 8, // min 8 símbolos
    errorMsg: "Falta Pasada 6 (mapa de símbolos). Necesita mín 8 símbolos en tabla",
  },
  {
    id: "P7",
    name: "Pasada 7 — Mapa de ritmo",
    patterns: ["pasada.*7", "mapa.*ritmo", "ritmo.*tempo"],
    minWords: 50,
    needsTable: true,
    errorMsg: "Falta Pasada 7 (mapa de ritmo). Necesita tabla de duraciones",
  },
  {
    id: "P8",
    name: "Pasada 8 — Incompletitud estratégica",
    patterns: ["pasada.*8", "incompletitud", "70.*30"],
    minWords: 80,
    errorMsg: "Falta Pasada 8 (incompletitud estratégica 70/30)",
  },
  {
    id: "LA",
    name: "Lente A — Comparación con fracasos",
    patterns: ["lente.*a", "comparaci.*fracaso", "fracasos.*comparaci"],
    minWords: 30,
    errorMsg: "Falta Lente A (comparación con fracasos)",
  },
  {
    id: "LB",
    name: "Lente B — Audiencia",
    patterns: ["lente.*b", "audiencia.*mapping", "audiencia.*creador"],
    minWords: 30,
    errorMsg: "Falta Lente B (audiencia mapping)",
  },
  {
    id: "LC",
    name: "Lente C — Producibilidad",
    patterns: ["lente.*c", "producibilidad", "celular.*20.*min"],
    minWords: 50,
    errorMsg: "Falta Lente C (filtro de producibilidad)",
  },
  {
    id: "LD",
    name: "Lente D — Embudo",
    patterns: ["lente.*d", "embudo.*completo", "antes.*despu[eé]s"],
    minWords: 50,
    errorMsg: "Falta Lente D (contexto de embudo)",
  },
  {
    id: "LE",
    name: "Lente E — Sonido apagado",
    patterns: ["lente.*e", "sonido.*apagado", "sin.*sonido"],
    minWords: 50,
    errorMsg: "Falta Lente E (test sonido apagado)",
  },
  {
    id: "DIM",
    name: "Dimensiones (D1-D7 + extras)",
    patterns: ["dimensi[oó]n", "residuo.*emocional", "arquitectura.*autoridad", "d1.*residuo", "d2.*autoridad"],
    minWords: 100,
    errorMsg: "Faltan dimensiones de profundidad (D1-D7 + extras)",
  },
  {
    id: "PRED",
    name: "Predicciones",
    patterns: ["predicci[oó]n", "qu[eé].*pasar[ií]a.*si"],
    minWords: 100,
    minItems: 3, // exactamente 3 predicciones
    errorMsg: "Faltan predicciones (necesita exactamente 3 '¿Qué pasaría si...?')",
  },
  {
    id: "TRANS",
    name: "Transferencias",
    patterns: ["transferencia"],
    minWords: 200,
    minCodeBlocks: 5, // min 5 transferencias con formato completo
    errorMsg: "Faltan transferencias (necesita mín 5 con 7 campos cada una)",
  },
  {
    id: "AUTO",
    name: "Autocrítica",
    patterns: ["autocr[ií]tica"],
    minWords: 100,
    minItems: 5, // 5 preguntas respondidas
    errorMsg: "Falta autocrítica (necesita 5 preguntas con respuesta escrita)",
  },
  {
    id: "SINT",
    name: "Síntesis / FASE 8",
    patterns: ["s[ií]ntesis", "fase.*8", "hallazgos?.*rankeados?"],
    minWords: 100,
    errorMsg: "Falta síntesis / FASE 8 (hallazgos rankeados con prueba de eliminación)",
  },
];

// ── Find matching section for a requirement ──
function findSection(sections, patterns) {
  for (const section of sections) {
    const headerNorm = norm(section.header);
    const bodyNorm = norm(section.body);
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(headerNorm)) {
        return section;
      }
    }
  }
  // Fallback: check if any section BODY starts with text matching patterns
  // (for cases where the section is a subsection within a larger block)
  return null;
}

// ── Also check full text for sections that might be inline ──
function findInFullText(fullTextNorm, patterns) {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(fullTextNorm)) return true;
  }
  return false;
}

// ── Run validation ──
const sections = splitSections(content);
const fullTextNorm = norm(content);
const errors = [];
const warnings = [];

for (const req of REQUIRED_SECTIONS) {
  const section = findSection(sections, req.patterns);

  if (!section) {
    // Check if content exists inline (not as a separate ## header)
    const existsInline = findInFullText(fullTextNorm, req.patterns);
    if (existsInline) {
      // Content exists but not as a proper section - warn
      warnings.push(`⚠️ ${req.id}: "${req.name}" existe en el texto pero NO como sección ## separada. Debería tener su propio header.`);
    } else {
      errors.push(`❌ ${req.id}: ${req.errorMsg}`);
    }
    continue;
  }

  // Check minimum word count
  const wc = wordCount(section.body);
  if (req.minWords && wc < req.minWords) {
    errors.push(`❌ ${req.id}: "${req.name}" tiene ${wc} palabras (mín ${req.minWords}). Demasiado superficial.`);
  }

  // Check minimum items (bullets or numbered lists)
  if (req.minItems) {
    const items = countBullets(section.body);
    const tableRows = countTableRows(section.body);
    const totalItems = items + tableRows;
    if (totalItems < req.minItems) {
      errors.push(`❌ ${req.id}: "${req.name}" tiene ${totalItems} items (mín ${req.minItems}).`);
    }
  }

  // Check minimum table rows
  if (req.minTableRows) {
    const rows = countTableRows(section.body);
    if (rows < req.minTableRows) {
      errors.push(`❌ ${req.id}: "${req.name}" tiene ${rows} filas en tabla (mín ${req.minTableRows}).`);
    }
  }

  // Check needs table
  if (req.needsTable) {
    const rows = countTableRows(section.body);
    if (rows === 0) {
      errors.push(`❌ ${req.id}: "${req.name}" necesita una tabla de duraciones/ritmo.`);
    }
  }

  // Check minimum code blocks (for transferencias)
  if (req.minCodeBlocks) {
    const blocks = countCodeBlocks(section.body);
    if (blocks < req.minCodeBlocks) {
      errors.push(`❌ ${req.id}: "${req.name}" tiene ${blocks} bloques (mín ${req.minCodeBlocks} transferencias con formato completo).`);
    }
  }
}

// ── Output results ──
const totalChecks = REQUIRED_SECTIONS.length;
const passed = totalChecks - errors.length;

if (errors.length === 0) {
  const result = {
    decision: "allow",
    reason: `✅ Análisis COMPLETO: ${passed}/${totalChecks} secciones válidas.${warnings.length > 0 ? ` ${warnings.length} advertencias.` : ""}`,
  };
  if (warnings.length > 0) {
    result.reason += "\n" + warnings.join("\n");
  }
  console.log(JSON.stringify(result));
  process.exit(0);
} else {
  const result = {
    decision: "block",
    reason: [
      `🚫 Análisis INCOMPLETO: ${errors.length} secciones faltan o son insuficientes (${passed}/${totalChecks} válidas).`,
      "",
      "ERRORES (deben corregirse antes de guardar):",
      ...errors,
      "",
      ...(warnings.length > 0 ? ["ADVERTENCIAS:", ...warnings] : []),
      "",
      "Completá las secciones faltantes y volvé a guardar.",
    ].join("\n"),
  };
  console.log(JSON.stringify(result));
  process.exit(1);
}
