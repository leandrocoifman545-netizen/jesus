import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// --- Types ---

interface AudienceData {
  painPoints: { text: string; count: number; quote?: string }[];
  desires: { text: string; count: number; quote?: string }[];
  fears: { text: string; count: number }[];
  triggers: { text: string; count: number }[];
  situations: string[];
}

// --- In-memory cache ---

let cached: AudienceData | null = null;

// --- Parser ---

function extractItems(section: string): { text: string; count: number }[] {
  const items: { text: string; count: number }[] = [];
  const regex = /^\s*-\s+\*\*(.+?)\*\*\s*\((\d+).*?\)/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(section)) !== null) {
    items.push({ text: m[1], count: parseInt(m[2], 10) });
  }
  return items.sort((a, b) => b.count - a.count);
}

function extractQuotes(section: string): string[] {
  const quotes: string[] = [];
  const regex = /^>\s*"(.+?)"/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(section)) !== null) {
    quotes.push(m[1]);
  }
  return quotes;
}

function splitSections(md: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = md.split(/\n## (\d+\..+)/);
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim().toLowerCase();
    const body = parts[i + 1] || "";
    sections[title] = body;
  }
  return sections;
}

async function parseAudienceFile(): Promise<AudienceData> {
  const dataDir = join(process.cwd(), ".data", "downloads");

  // Find the latest inteligencia-audiencia file
  let filePath = "";
  if (existsSync(dataDir)) {
    const { readdirSync } = await import("fs");
    const files = readdirSync(dataDir)
      .filter((f: string) => f.startsWith("inteligencia-audiencia") && f.endsWith(".md"))
      .sort()
      .reverse();
    if (files.length > 0) {
      filePath = join(dataDir, files[0]);
    }
  }

  if (!filePath) {
    return { painPoints: [], desires: [], fears: [], triggers: [], situations: [] };
  }

  const raw = await readFile(filePath, "utf-8");
  const sections = splitSections(raw);

  // --- Pain points (section 3) ---
  const frustrationSection =
    sections["3. frustraciones y problemas"] || "";
  const painItems = extractItems(frustrationSection);
  // Filter out WhatsApp/payment/tech-support noise
  const relevantPains = painItems.filter(
    (p) =>
      !p.text.toLowerCase().includes("whatsapp") &&
      !p.text.toLowerCase().includes("pago") &&
      !p.text.toLowerCase().includes("soporte") &&
      !p.text.toLowerCase().includes("enlace") &&
      !p.text.toLowerCase().includes("link") &&
      !p.text.toLowerCase().includes("confusión sobre la fecha"),
  );

  // --- Desires (section 2) ---
  const goalsSection = sections["2. metas y objetivos de la audiencia"] || "";
  const desireItems = extractItems(goalsSection);
  const desireQuotes = extractQuotes(goalsSection);

  // --- Fears (section 4) ---
  const fearSection = sections["4. miedos"] || "";
  const fearItems = extractItems(fearSection).filter(
    (f) =>
      !f.text.toLowerCase().includes("acceder al") &&
      !f.text.toLowerCase().includes("problemas técnicos"),
  );

  // --- Triggers (section 7) ---
  const triggerSection = sections["7. triggers emocionales"] || "";
  const triggerItems = extractItems(triggerSection).filter(
    (t) => !t.text.toLowerCase().includes("frustración"),
  );

  // --- Situations (section 10) ---
  const situationSection = sections["10. situación actual de los leads"] || "";
  const situations = extractQuotes(situationSection);

  // Attach quotes to desires
  const desiresWithQuotes = desireItems.map((d, i) => ({
    ...d,
    quote: desireQuotes[i] || undefined,
  }));

  return {
    painPoints: relevantPains,
    desires: desiresWithQuotes,
    fears: fearItems,
    triggers: triggerItems,
    situations,
  };
}

// --- Segment filtering ---

const SEGMENT_KEYWORDS: Record<string, string[]> = {
  A: ["ingresos extra", "casa", "hijos", "familia", "tiempo"],
  B: ["trabajo", "oficina", "dejar", "empleo", "sueldo"],
  C: ["emprender", "negocio", "vender", "clientes", "escalar"],
  D: ["tecnología", "ia", "aprender", "herramientas", "digital"],
};

function scoreForSegment(text: string, segment: string): number {
  const keywords = SEGMENT_KEYWORDS[segment.toUpperCase()] || [];
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => score + (lower.includes(kw) ? 1 : 0), 0);
}

function prioritize<T extends { text: string }>(items: T[], segment?: string): T[] {
  if (!segment) return items;
  return [...items].sort(
    (a, b) => scoreForSegment(b.text, segment) - scoreForSegment(a.text, segment),
  );
}

// --- Public API ---

/**
 * Returns a concise audience context block (~200-300 words) for prompt injection.
 * Optionally filters/prioritizes for a specific segment (A/B/C/D).
 */
export async function getAudienceContext(segment?: string): Promise<string> {
  if (!cached) {
    cached = await parseAudienceFile();
  }

  const data = cached;

  // If no data was loaded, return empty
  if (data.painPoints.length === 0 && data.desires.length === 0) {
    return "";
  }

  const pains = prioritize(data.painPoints, segment).slice(0, 5);
  const desires = prioritize(data.desires, segment).slice(0, 5);
  const fears = prioritize(data.fears, segment).slice(0, 3);
  const triggers = prioritize(data.triggers, segment).slice(0, 3);
  const situations = data.situations.slice(0, 4);

  let block = `\n\n## INTELIGENCIA DE AUDIENCIA REAL (8,074 leads, 22,819 conversaciones)`;

  if (segment) {
    block += `\n> Priorizado para Segmento ${segment.toUpperCase()}`;
  }

  block += `\n\n### Dolores principales:`;
  for (const p of pains) {
    block += `\n- ${p.text} (${p.count} personas)`;
  }

  block += `\n\n### Deseos principales:`;
  for (const d of desires) {
    const q = (d as { quote?: string }).quote;
    block += `\n- ${d.text} (${d.count} personas)`;
    if (q) block += `\n  > "${q}"`;
  }

  block += `\n\n### Miedos que los frenan:`;
  for (const f of fears) {
    block += `\n- ${f.text} (${f.count})`;
  }

  block += `\n\n### Triggers de engagement:`;
  for (const t of triggers) {
    block += `\n- ${t.text} (${t.count})`;
  }

  block += `\n\n### Situaciones reales del avatar:`;
  for (const s of situations) {
    block += `\n> "${s}"`;
  }

  block += `\n\nUsá estos datos para que el guion suene REAL. Que la persona sienta que le estás hablando a ella.`;

  return block;
}
