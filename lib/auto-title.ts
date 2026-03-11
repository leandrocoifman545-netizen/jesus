import type { ScriptOutput } from "./ai/schemas/script-output";

/**
 * Genera un título automático para un guion basándose en el contenido.
 * Extrae la idea principal del primer hook o del cuerpo.
 */
export function generateAutoTitle(script: ScriptOutput, additionalNotes?: string): string {
  const fw = script.development.framework_used;
  const dur = script.total_duration_seconds;
  const platform = script.platform_adaptation.platform;

  // Try to extract the core topic from the first body section
  const bodyText = script.development.sections
    .map((s) => s.script_text)
    .join(" ");

  // Extract a short subject from the body (first meaningful sentence fragment)
  const topic = extractTopic(bodyText, additionalNotes);

  const parts: string[] = [];
  if (topic) parts.push(topic);
  parts.push(`${fw} ${dur}s`);
  if (script.visual_format) parts.push(script.visual_format.format_name);
  else parts.push(platform);

  return parts.join(" | ");
}

function extractTopic(bodyText: string, notes?: string): string {
  // If there are additional notes, they usually describe the topic best
  if (notes) {
    const cleaned = notes.trim().split("\n")[0].trim();
    if (cleaned.length > 3 && cleaned.length <= 60) return capitalize(cleaned);
    if (cleaned.length > 60) return capitalize(cleaned.slice(0, 57)) + "...";
  }

  // Otherwise extract from body text
  // Look for key phrases that indicate the topic
  const text = bodyText.replace(/[""]/g, '"').replace(/['']/g, "'");

  // Try to find a "with AI you can..." or "using AI..." pattern
  const patterns = [
    /(?:con IA|con inteligencia artificial)\s+(.{10,50}?)(?:\.|,|\n)/i,
    /(?:podés|puedas|pueden)\s+(.{10,50}?)(?:\.|,|\n)/i,
    /(?:negocio de|vender|crear|armar)\s+(.{8,40}?)(?:\.|,|\n)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return capitalize(match[1].trim());
  }

  // Fallback: first sentence, truncated
  const firstSentence = text.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 5) {
    const truncated = firstSentence.length > 50
      ? firstSentence.slice(0, 47) + "..."
      : firstSentence;
    return capitalize(truncated);
  }

  return "";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
