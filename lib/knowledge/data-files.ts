import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

// In-memory cache for markdown files (they change rarely)
const fileCache = new Map<string, { content: string; loadedAt: number }>();
const CACHE_TTL = 60_000; // 60 seconds — these files change rarely

// Critical files that MUST exist for quality generation
const CRITICAL_FILES = new Set([
  "angulos-expandidos.md",
  "tipos-cuerpo.md",
  "enciclopedia-127-ingredientes.md",
  "reglas-diversidad.md",
  "venta-modelo-negocio.md",
]);

async function loadFile(filename: string): Promise<string> {
  const cached = fileCache.get(filename);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
    return cached.content;
  }

  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, "utf-8");
    fileCache.set(filename, { content, loadedAt: Date.now() });
    return content;
  } catch {
    if (CRITICAL_FILES.has(filename)) {
      console.error(`[CRITICAL] Knowledge file missing: .data/${filename} — script quality will degrade`);
    }
    return "";
  }
}

/**
 * Load all knowledge files and return as a single context block.
 * These are cached system blocks that change only when files are edited.
 */
export async function getKnowledgeContext(): Promise<string> {
  const [
    angulos,
    tiposCuerpo,
    ingredientes,
    reglasDiversidad,
    ventaModelo,
    ctasBiblioteca,
    motorAudiencia,
    winnerPatterns,
    sessionInsights,
    avatares,
    inteligenciaCompradores,
    jerarquiaDecisiones,
    objeciones,
    frasesTextuales,
    cruceWinners,
  ] = await Promise.all([
    loadFile("angulos-expandidos.md"),
    loadFile("tipos-cuerpo.md"),
    loadFile("enciclopedia-127-ingredientes.md"),
    loadFile("reglas-diversidad.md"),
    loadFile("venta-modelo-negocio.md"),
    loadFile("ctas-biblioteca.md"),
    loadFile("motor-audiencia.md"),
    loadFile("winner-patterns.md"),
    loadFile("session-insights.md"),
    loadFile("avatares-adp.md"),
    loadFile("inteligencia-compradores.md"),
    loadFile("jerarquia-decisiones.md"),
    loadFile("objeciones-adp.md"),
    loadFile("frases-textuales-562-compradores.md"),
    loadFile("cruce-562-vs-winners.md"),
  ]);

  const sections: string[] = [];

  if (jerarquiaDecisiones) {
    sections.push(`## JERARQUÍA DE DECISIONES (leer PRIMERO — define qué sistema gana en conflictos)\n${jerarquiaDecisiones}`);
  }

  if (avatares) {
    sections.push(`## AVATARES FORMALES ADP (8 personas reales — escribirle A UNA)\n${avatares}`);
  }

  if (inteligenciaCompradores) {
    sections.push(`## INTELIGENCIA DE COMPRADORES (562 compradores reales — MÁS PESO que leads fríos)\n${inteligenciaCompradores}`);
  }

  if (angulos) {
    sections.push(`## ÁNGULOS EXPANDIDOS (5 familias × 30 ángulos específicos)\n${angulos}`);
  }

  if (tiposCuerpo) {
    sections.push(`## TIPOS DE CUERPO (8 vehículos narrativos)\n${tiposCuerpo}`);
  }

  if (ingredientes) {
    sections.push(`## ENCICLOPEDIA DE 127 INGREDIENTES\n${ingredientes}`);
  }

  if (reglasDiversidad) {
    sections.push(`## REGLAS DE DIVERSIDAD (P0 — anti-repetición)\n${reglasDiversidad}`);
  }

  if (ventaModelo) {
    sections.push(`## VENTA DEL MODELO DE NEGOCIO (10 tipos — rotar)\n${ventaModelo}`);
  }

  if (ctasBiblioteca) {
    sections.push(`## BIBLIOTECA DE CTAs (elegir de acá, no inventar)\n${ctasBiblioteca}`);
  }

  if (motorAudiencia) {
    sections.push(`## MOTOR DE AUDIENCIA (tensiones, vocabulario por segmento, objeciones)\n${motorAudiencia}`);
  }

  if (objeciones) {
    sections.push(`## OBJECIONES ADP (4 universales + respuestas)\n${objeciones}`);
  }

  if (winnerPatterns) {
    sections.push(`## WINNER PATTERNS (qué combinaciones funcionaron — sesgar hacia estas)\n${winnerPatterns}`);
  }

  if (sessionInsights) {
    sections.push(`## SESSION INSIGHTS (feedback de Jesús — evitar lo que no funcionó)\n${sessionInsights}`);
  }

  if (frasesTextuales) {
    sections.push(`## FRASES TEXTUALES DE 562 COMPRADORES (copy-paste directo para hooks, beats, CTAs)\n${frasesTextuales}`);
  }

  if (cruceWinners) {
    sections.push(`## CRUCE COMPRADORES × WINNERS (nichos validados, mecanismos confirmados, oportunidades)\n${cruceWinners}`);
  }

  // Warn about missing critical files so Claude knows its context is incomplete
  const loadedFiles = [angulos, tiposCuerpo, ingredientes, reglasDiversidad, ventaModelo, ctasBiblioteca, motorAudiencia, winnerPatterns, sessionInsights, avatares, inteligenciaCompradores, jerarquiaDecisiones, objeciones, frasesTextuales, cruceWinners];
  const fileNames = ["angulos-expandidos.md", "tipos-cuerpo.md", "enciclopedia-127-ingredientes.md", "reglas-diversidad.md", "venta-modelo-negocio.md", "ctas-biblioteca.md", "motor-audiencia.md", "winner-patterns.md", "session-insights.md", "avatares-adp.md", "inteligencia-compradores.md", "jerarquia-decisiones.md", "objeciones-adp.md", "frases-textuales-562-compradores.md", "cruce-562-vs-winners.md"];
  const missing = fileNames.filter((_, i) => !loadedFiles[i]);

  if (missing.length > 0) {
    sections.unshift(`⚠️ ARCHIVOS FALTANTES (${missing.length}/${fileNames.length}): ${missing.join(", ")}\nLos datos de estos archivos NO están disponibles. Aplicá reglas conservadoras para compensar.`);
  }

  return sections.join("\n\n---\n\n");
}

/**
 * Load knowledge files optimized for YouTube longform generation.
 * Includes resources that ads also needs but were missing, plus longform-specific files.
 */
export async function getKnowledgeContextLongform(): Promise<string> {
  const [
    jerarquiaDecisiones,
    avatares,
    inteligenciaCompradores,
    motorAudiencia,
    objeciones,
    angulos,
    tiposCuerpo,
    ingredientes,
    reglasDiversidad,
    ventaModelo,
    vslTaller,
    frasesTextuales,
  ] = await Promise.all([
    loadFile("jerarquia-decisiones.md"),
    loadFile("avatares-adp.md"),
    loadFile("inteligencia-compradores.md"),
    loadFile("motor-audiencia.md"),
    loadFile("objeciones-adp.md"),
    loadFile("angulos-expandidos.md"),
    loadFile("tipos-cuerpo.md"),
    loadFile("enciclopedia-127-ingredientes.md"),
    loadFile("reglas-diversidad.md"),
    loadFile("venta-modelo-negocio.md"),
    loadFile("vsl-taller-definitivo.md"),
    loadFile("frases-textuales-562-compradores.md"),
    // NOT loaded (ad-specific, would confuse longform):
    // - winner-patterns.md (CLR metrics, 60-90s duración, TikTok patterns — irrelevante para 10-20min)
    // - session-insights.md (modularidad hooks/body, sweet spot 55-65s, CLR de Ramiro — ads only)
    // - ctas-biblioteca.md (bloques CTA de 6 capas para ads — YouTube usa CTAs nativos)
    // - cruce-562-vs-winners.md (ad-specific niches and mechanisms)
  ]);

  const sections: string[] = [];

  if (jerarquiaDecisiones) {
    sections.push(`## JERARQUÍA DE DECISIONES (leer PRIMERO — define qué sistema gana en conflictos)\n${jerarquiaDecisiones}`);
  }

  if (avatares) {
    sections.push(`## AVATARES FORMALES ADP (8 personas reales — escribirle A UNA)\n${avatares}`);
  }

  if (inteligenciaCompradores) {
    sections.push(`## INTELIGENCIA DE COMPRADORES (562 compradores reales — MÁS PESO que leads fríos)\n${inteligenciaCompradores}`);
  }

  if (frasesTextuales) {
    sections.push(`## FRASES TEXTUALES DE 562 COMPRADORES (copy-paste directo para hooks, beats, CTAs — lenguaje REAL del comprador)\n${frasesTextuales}`);
  }

  if (motorAudiencia) {
    sections.push(`## MOTOR DE AUDIENCIA (tensiones, vocabulario por segmento, objeciones, triggers)\n${motorAudiencia}`);
  }

  if (objeciones) {
    sections.push(`## OBJECIONES ADP (4 universales + respuestas — para Acto 4 de VSL y contenido)\n${objeciones}`);
  }

  if (angulos) {
    sections.push(`## ÁNGULOS EXPANDIDOS (5 familias × 30 ángulos — elegir familia + ángulo específico)\n${angulos}`);
  }

  if (tiposCuerpo) {
    sections.push(`## VEHÍCULOS NARRATIVOS (11 tipos — el tono del video)\nEstos vehículos definen el TONO de los capítulos. En longform, un framework (educational, storytelling, etc.) es la ESTRUCTURA y el vehículo es el TONO. Ej: un "Educational" puede tener tono de "demolición de mito" o de "analogía cotidiana".\n${tiposCuerpo}`);
  }

  if (ingredientes) {
    sections.push(`## ENCICLOPEDIA DE 127+ INGREDIENTES (distribuir por capítulo)\n${ingredientes}`);
  }

  if (reglasDiversidad) {
    sections.push(`## REGLAS DE DIVERSIDAD (P0 — anti-repetición)\n${reglasDiversidad}`);
  }

  if (ventaModelo) {
    sections.push(`## VENTA DEL MODELO DE NEGOCIO (10 tipos — para contenido que vende)\n${ventaModelo}`);
  }

  if (vslTaller) {
    sections.push(`## VSL TALLER DEFINITIVO (referencia de estructura y tono real de Jesús, 9 actos Benson)\n${vslTaller}`);
  }

  const allFiles = [jerarquiaDecisiones, avatares, inteligenciaCompradores, motorAudiencia, objeciones, angulos, tiposCuerpo, ingredientes, reglasDiversidad, ventaModelo, vslTaller, frasesTextuales];
  const allNames = ["jerarquia-decisiones.md", "avatares-adp.md", "inteligencia-compradores.md", "motor-audiencia.md", "objeciones-adp.md", "angulos-expandidos.md", "tipos-cuerpo.md", "enciclopedia-127-ingredientes.md", "reglas-diversidad.md", "venta-modelo-negocio.md", "vsl-taller-definitivo.md", "frases-textuales-562-compradores.md"];
  const missing = allNames.filter((_, i) => !allFiles[i]);

  if (missing.length > 0) {
    sections.unshift(`⚠️ ARCHIVOS FALTANTES (${missing.length}/${allNames.length}): ${missing.join(", ")}\nLos datos de estos archivos NO están disponibles. Aplicá reglas conservadoras para compensar.`);
  }

  return sections.join("\n\n---\n\n");
}
