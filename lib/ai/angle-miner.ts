import { promises as fs } from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const DATA_DIR = path.join(process.cwd(), ".data");

export interface MinedCluster {
  id: string;
  tension_name: string;
  perspective: string;
  verbatims: string[];
  mapped_family: string;
  mapped_angle: string | null;
  proposed_angle: string | null;
  proposed_big_idea: string;
  segment_affinity: string[];
  confidence: "high" | "medium" | "low";
  score: number;
  is_new: boolean;
}

export interface MiningResult {
  generated_at: string;
  source: "whatsapp_mining";
  total_verbatims_analyzed: number;
  clusters: MinedCluster[];
}

/**
 * Extract all quoted verbatims from the audience intelligence markdown files.
 */
async function extractVerbatims(): Promise<string[]> {
  const files = [
    path.join(DATA_DIR, "downloads", "inteligencia-audiencia-2026-03-10.md"),
    path.join(DATA_DIR, "motor-audiencia.md"),
  ];

  const verbatims: string[] = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        // Quoted lines: > "text" or > text or "text"
        const quoteMatch = trimmed.match(/^>\s*"?(.{15,})"?\s*$/);
        if (quoteMatch) {
          verbatims.push(quoteMatch[1].replace(/^"|"$/g, "").trim());
          continue;
        }
        // Lines with quoted text inline
        const inlineMatch = trimmed.match(/"([^"]{15,})"/);
        if (inlineMatch && !trimmed.startsWith("#") && !trimmed.startsWith("|")) {
          verbatims.push(inlineMatch[1].trim());
        }
      }
    } catch {
      // File not found, skip
    }
  }

  // Deduplicate
  return [...new Set(verbatims)];
}

/**
 * Read existing angles from angulos-expandidos.md
 */
async function readExistingAngles(): Promise<string> {
  try {
    return await fs.readFile(path.join(DATA_DIR, "angulos-expandidos.md"), "utf-8");
  } catch {
    return "";
  }
}

/**
 * Read existing tensions from motor-audiencia.md
 */
async function readExistingTensions(): Promise<string> {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, "motor-audiencia.md"), "utf-8");
    // Extract just the tensions table section
    const tensionSection = content.match(new RegExp("## 1\\. TENSIONES[\\s\\S]*?(?=## 2\\.)", ""));
    return tensionSection ? tensionSection[0] : "";
  } catch {
    return "";
  }
}

/**
 * Run the mining pipeline using Claude API.
 */
export async function mineAngles(): Promise<MiningResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });

  const verbatims = await extractVerbatims();
  const existingAngles = await readExistingAngles();
  const existingTensions = await readExistingTensions();

  // Batch verbatims (send all — they fit in context)
  const verbatimBlock = verbatims.map((v, i) => `${i + 1}. "${v}"`).join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `Sos un analista de audiencia experto en copywriting y persuasión para anuncios.
Tu trabajo es analizar verbatims reales de una audiencia de WhatsApp y descubrir PERSPECTIVAS/TENSIONES que se pueden usar como ángulos para guiones de ads.

CONTEXTO:
- Producto: ADP (Academia de Productos Digitales) — enseña a crear y vender productos digitales con IA
- Audiencia: Hispanos LATAM, 22-55 años, distintos segmentos
- Segmentos: A (jóvenes 22-32), B (freelancers/emprendedores 28-45), C (mamás 30-50), D (todos/+50)

TENSIONES EXISTENTES (ya las usamos):
${existingTensions}

ÁNGULOS EXISTENTES (5 familias):
${existingAngles.slice(0, 3000)}

INSTRUCCIONES:
1. Agrupá los verbatims por TENSIÓN EMOCIONAL implícita (no por keywords superficiales)
2. Para cada cluster: nombrá la tensión, elegí 3-5 verbatims representativos
3. Evaluá si mapea a una tensión/ángulo EXISTENTE o si es NUEVO
4. Si es nuevo, proponé: nombre de ángulo, big idea, familia, segmentos
5. Calificá confianza: high (10+ verbatims claros), medium (5-9), low (2-4)

Respondé SOLO en JSON válido con este formato:
{
  "clusters": [
    {
      "tension_name": "nombre corto de la tensión",
      "perspective": "descripción de 1-2 oraciones de la perspectiva/ángulo",
      "verbatims": ["verbatim 1", "verbatim 2", "verbatim 3"],
      "mapped_family": "identidad|oportunidad|confrontacion|mecanismo|historia",
      "mapped_angle": "ID del ángulo existente (ej: 1.1) o null si es nuevo",
      "proposed_angle": "nombre del ángulo propuesto si es nuevo, o null",
      "proposed_big_idea": "la big idea para este ángulo en 1 oración",
      "segment_affinity": ["A", "B"],
      "confidence": "high|medium|low",
      "is_new": true
    }
  ]
}`,
    messages: [
      {
        role: "user",
        content: `Analizá estos ${verbatims.length} verbatims reales de la audiencia de WhatsApp y descubrí clusters de tensiones/perspectivas. Priorizá descubrir ángulos NUEVOS que no estén en las tensiones existentes.\n\n${verbatimBlock}`,
      },
    ],
  });

  // Parse response
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let parsed: { clusters: Array<Omit<MinedCluster, "id" | "score">> };

  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Failed to parse mining response: ${e}`);
  }

  // Score and enrich clusters
  const clusters: MinedCluster[] = parsed.clusters.map((c, i) => {
    const confidenceScore = c.confidence === "high" ? 3 : c.confidence === "medium" ? 2 : 1;
    const noveltyScore = c.is_new ? 3 : 1;
    const segmentScore = c.segment_affinity.length; // More segments = more useful
    const score = confidenceScore * 2 + noveltyScore * 3 + segmentScore;

    return {
      ...c,
      id: `cluster_${i + 1}`,
      score,
    };
  });

  // Sort by score descending
  clusters.sort((a, b) => b.score - a.score);

  const result: MiningResult = {
    generated_at: new Date().toISOString(),
    source: "whatsapp_mining",
    total_verbatims_analyzed: verbatims.length,
    clusters,
  };

  // Save to .data/research/
  const researchDir = path.join(DATA_DIR, "research");
  await fs.mkdir(researchDir, { recursive: true });
  const date = new Date().toISOString().split("T")[0];
  await fs.writeFile(
    path.join(researchDir, `mined-angles-${date}.json`),
    JSON.stringify(result, null, 2)
  );

  return result;
}

/**
 * Get the latest mining result from disk.
 */
export async function getLatestMining(): Promise<MiningResult | null> {
  const researchDir = path.join(DATA_DIR, "research");
  try {
    const files = await fs.readdir(researchDir);
    const mined = files.filter((f) => f.startsWith("mined-angles-")).sort().reverse();
    if (mined.length === 0) return null;
    const content = await fs.readFile(path.join(researchDir, mined[0]), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}
