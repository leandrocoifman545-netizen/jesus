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
  ]);

  const sections: string[] = [];

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

  if (winnerPatterns) {
    sections.push(`## WINNER PATTERNS (qué combinaciones funcionaron — sesgar hacia estas)\n${winnerPatterns}`);
  }

  if (sessionInsights) {
    sections.push(`## SESSION INSIGHTS (feedback de Jesús — evitar lo que no funcionó)\n${sessionInsights}`);
  }

  if (avatares) {
    sections.push(`## AVATARES FORMALES ADP (6 personas reales — escribirle A UNA)\n${avatares}`);
  }

  // Warn about missing critical files so Claude knows its context is incomplete
  const loadedFiles = [angulos, tiposCuerpo, ingredientes, reglasDiversidad, ventaModelo, ctasBiblioteca, motorAudiencia, winnerPatterns, sessionInsights, avatares];
  const fileNames = ["angulos-expandidos.md", "tipos-cuerpo.md", "enciclopedia-127-ingredientes.md", "reglas-diversidad.md", "venta-modelo-negocio.md", "ctas-biblioteca.md", "motor-audiencia.md", "winner-patterns.md", "session-insights.md", "avatares-adp.md"];
  const missing = fileNames.filter((_, i) => !loadedFiles[i]);

  if (missing.length > 0) {
    sections.unshift(`⚠️ ARCHIVOS FALTANTES (${missing.length}/${fileNames.length}): ${missing.join(", ")}\nLos datos de estos archivos NO están disponibles. Aplicá reglas conservadoras para compensar.`);
  }

  return sections.join("\n\n---\n\n");
}
