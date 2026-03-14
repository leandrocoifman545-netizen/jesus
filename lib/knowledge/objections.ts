import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// --- Types ---

interface Objection {
  id: number;
  label: string;
  response: string;
  primarySegment: string;
  secondarySegment: string;
}

// --- In-memory cache ---

let cached: Objection[] | null = null;

// --- Parser ---

function parseObjectionsFile(raw: string): Objection[] {
  const objections: Objection[] = [];

  // Extract from the mapping table at the bottom
  const tableMatch = raw.match(
    /\| Objeción \| Segmento principal \| Segmento secundario \|[\s\S]*?(?=\n\n|$)/,
  );
  if (!tableMatch) return objections;

  const rows = tableMatch[0].split("\n").filter((line) => line.startsWith("|"));
  // Skip header and separator rows
  const dataRows = rows.slice(2);

  // Also extract the response blocks
  const responseBlocks =
    raw.match(/### \d+\. "[^"]+"\n\n\*\*Respuesta de Jesús:\*\*\n>[^\n]+/g) || [];

  const responses: { label: string; response: string }[] = [];
  for (const block of responseBlocks) {
    const m = block.match(
      /### \d+\. "([^"]+)"\n\n\*\*Respuesta de Jesús:\*\*\n>\s*(.+)/,
    );
    if (m) {
      responses.push({ label: m[1].trim(), response: m[2].trim() });
    }
  }

  for (let i = 0; i < dataRows.length; i++) {
    const cols = dataRows[i].split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 3) continue;

    const primaryMatch = cols[1].match(/([A-D])/);
    const secondaryMatch = cols[2].match(/([A-D])/);

    objections.push({
      id: i + 1,
      label: cols[0],
      response: responses[i]?.response || "",
      primarySegment: primaryMatch ? primaryMatch[1] : "",
      secondarySegment: secondaryMatch ? secondaryMatch[1] : "",
    });
  }

  return objections;
}

async function loadObjections(): Promise<Objection[]> {
  if (cached) return cached;

  const filePath = join(process.cwd(), ".data", "objeciones-adp.md");
  if (!existsSync(filePath)) {
    cached = [];
    return cached;
  }

  const raw = await readFile(filePath, "utf-8");
  cached = parseObjectionsFile(raw);
  return cached;
}

// --- Public API ---

/**
 * Returns a concise objections context block (~100-150 words) for prompt injection.
 * If segment is provided, returns the 1-2 most relevant objections for that segment.
 * If no segment, returns a brief mention of all 4.
 */
export async function getObjectionsContext(segment?: string): Promise<string> {
  const objections = await loadObjections();
  if (objections.length === 0) return "";

  let block = `\n\n## OBJECIONES DEL AVATAR (anticipar y desarmar en el guion)`;

  if (segment) {
    const upper = segment.toUpperCase();
    // Primary matches first, then secondary
    const relevant = objections.filter(
      (o) => o.primarySegment === upper || o.secondarySegment === upper,
    );
    const sorted = relevant.sort((a, b) => {
      const aScore = a.primarySegment === upper ? 2 : 1;
      const bScore = b.primarySegment === upper ? 2 : 1;
      return bScore - aScore;
    });
    const top = sorted.slice(0, 2);

    block += `\n> Segmento ${upper}: estas son las objeciones que más frenan a este avatar.`;
    for (const o of top) {
      block += `\n\n**"${o.label}"**`;
      block += `\n→ Respuesta: ${o.response}`;
    }
    block += `\n\nIntegrá la respuesta a estas objeciones de forma natural en el cuerpo del guion. No las pongas como FAQ — que se sientan como parte de la conversación.`;
  } else {
    block += `\n> Las 4 objeciones universales que frenan a la audiencia:`;
    for (const o of objections) {
      block += `\n- "${o.label}"`;
    }
    block += `\n\nTené en cuenta estas objeciones al escribir. Si alguna es relevante al ángulo, desarmala naturalmente dentro del cuerpo.`;
  }

  return block;
}
