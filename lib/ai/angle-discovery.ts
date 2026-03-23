/**
 * Angle Discovery — Automatic generation of fresh angles from multiple data sources.
 *
 * Sources:
 * 1. Research data (Google Suggest × 5 countries) → niches + keywords with real volume
 * 2. Coverage gaps → what angle families / body types / segments are underrepresented
 * 3. Existing generations → what niches/angles were already used (avoid repetition)
 * 4. Winner patterns → what worked (bias toward similar, not identical)
 *
 * Output: A ranked list of "angle candidates" ready to be used by auto-brief.
 * Each candidate = { niche, angle_family, angle_specific, big_idea, source, score }
 */

import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { getCoverage } from "../coverage";
import { ALL_ANGLE_FAMILIES } from "../constants/hook-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const RESEARCH_FILE = path.join(DATA_DIR, "research", "latest.json");
const ANGLES_CACHE_FILE = path.join(DATA_DIR, "discovered-angles.json");

// Cache: discovered angles refresh at most once per hour
let anglesCache: AngleCandidate[] | null = null;
let anglesCacheTime = 0;
const ANGLES_CACHE_TTL = 3600_000; // 1 hour

export interface AngleCandidate {
  niche: string;           // e.g. "rutinas de sueño para bebés"
  angle_family: string;    // e.g. "oportunidad"
  angle_specific: string;  // e.g. "2.3_nicho_invisible"
  big_idea: string;        // 1 sentence that's the THEME of the script
  source: string;          // where this came from: "research", "trends", "coverage_gap"
  score: number;           // higher = better candidate
  keyword?: string;        // original search keyword (if from research)
  keyword_score?: number;  // Google Suggest relevance score
}

interface ResearchData {
  generated_at: string;
  summary: {
    total_suggestions: number;
    by_niche: Record<string, { total: number; top3: string[] }>;
    by_angle: Record<string, { total: number; top3: string[] }>;
  };
  top_100: Array<{
    keyword: string;
    total_score: number;
    classification: {
      type: string;
      angles: string[];
      niche: string | null;
    };
  }>;
  by_niche: Record<string, Array<{ keyword: string; total_score: number }>>;
}

// Map research angle tags to our 5 families
const RESEARCH_ANGLE_TO_FAMILY: Record<string, string> = {
  dolor_economico: "identidad",
  mama_tiempo: "identidad",
  edad_reinvencion: "identidad",
  libertad_sueno: "identidad",
  barrera_tecnologica: "confrontacion",
  desconfianza: "confrontacion",
  proceso_demo: "mecanismo",
  ia: "mecanismo",
  latam_regional: "oportunidad",
};

// Map niches to specific angle codes
const NICHE_TO_ANGLE: Record<string, string> = {
  cocina: "2.3_nicho_invisible",
  mascotas: "2.3_nicho_invisible",
  fitness: "2.3_nicho_invisible",
  finanzas: "2.3_nicho_invisible",
  crianza: "2.3_nicho_invisible",
  belleza: "2.3_nicho_invisible",
  manualidades: "2.3_nicho_invisible",
  escritura: "2.3_nicho_invisible",
  diseno: "2.6_profesion_ia",
  programacion: "2.6_profesion_ia",
  marketing: "2.6_profesion_ia",
  psicologia_coaching: "2.6_profesion_ia",
  fotografia_video: "2.6_profesion_ia",
  musica: "2.3_nicho_invisible",
  jardineria: "2.3_nicho_invisible",
  salud_nutricion: "2.3_nicho_invisible",
  tarot_astrologia: "2.3_nicho_invisible",
  inmobiliaria: "2.6_profesion_ia",
  ecommerce: "4.2_proceso_3_pasos",
  freelance: "1.6_freelancer",
  whatsapp: "4.2_proceso_3_pasos",
};

// Prevent multiple concurrent refreshes
let refreshInProgress = false;

/**
 * Trigger research refresh in the background.
 * Non-blocking — fires and forgets. Safe to call multiple times
 * (deduplicates via refreshInProgress flag).
 */
export function triggerResearchRefresh(): void {
  if (refreshInProgress) return;
  refreshInProgress = true;

  console.log("[angle-discovery] Research stale — refreshing in background...");
  const child = exec(
    "node scripts/research-angles.mjs",
    { cwd: process.cwd(), timeout: 600_000 },
    (err) => {
      refreshInProgress = false;
      // Invalidate angle cache so next generation picks up fresh data
      anglesCache = null;
      anglesCacheTime = 0;
      if (err) {
        console.error("[angle-discovery] Research refresh failed:", err.message);
      } else {
        console.log("[angle-discovery] Research refresh completed.");
      }
    },
  );
  child.unref();
}

/**
 * Check if research data is stale (older than 3 days).
 */
export async function isResearchStale(): Promise<{ stale: boolean; daysOld: number }> {
  try {
    const raw = await fs.readFile(RESEARCH_FILE, "utf-8");
    const data = JSON.parse(raw);
    const generatedAt = new Date(data.generated_at);
    const daysOld = Math.floor((Date.now() - generatedAt.getTime()) / 86400_000);
    return { stale: daysOld >= 3, daysOld };
  } catch {
    return { stale: true, daysOld: 999 };
  }
}

/**
 * Generate a concrete big idea from a keyword + family combination.
 */
function generateBigIdea(keyword: string, family: string, niche: string | null): string {
  const nicheLabel = niche || keyword.split(" ").slice(0, 3).join(" ");

  switch (family) {
    case "identidad":
      return `Hay personas que saben de ${nicheLabel} pero no saben que eso vale plata`;
    case "oportunidad":
      return `Miles buscan "${keyword}" y casi nadie les vende una solución digital`;
    case "confrontacion":
      return `Usás tu conocimiento de ${nicheLabel} gratis todos los días — otros lo están cobrando`;
    case "mecanismo":
      return `Con IA + lo que sabés de ${nicheLabel}, en una tarde tenés un producto digital vendible`;
    case "historia":
      return `Alguien que sabe de ${nicheLabel} creó un producto digital y cambió su situación`;
    default:
      return `${nicheLabel} es una oportunidad que la mayoría no ve`;
  }
}

/**
 * Load research data and convert top keywords into angle candidates.
 */
async function anglesFromResearch(): Promise<AngleCandidate[]> {
  try {
    const raw = await fs.readFile(RESEARCH_FILE, "utf-8");
    const data: ResearchData = JSON.parse(raw);
    const candidates: AngleCandidate[] = [];

    // Process top 100 keywords
    for (const item of data.top_100) {
      if (item.total_score <= 0) continue;

      const niche = item.classification.niche;
      const researchAngles = item.classification.angles;

      // Determine best family for this keyword
      let family = "oportunidad"; // default for niche-based angles
      for (const ra of researchAngles) {
        if (RESEARCH_ANGLE_TO_FAMILY[ra]) {
          family = RESEARCH_ANGLE_TO_FAMILY[ra];
          break;
        }
      }

      const angleSpecific = niche
        ? (NICHE_TO_ANGLE[niche] || "2.3_nicho_invisible")
        : "2.2_tendencia_mercado";

      // Make the niche label specific (not just "cocina" → "recetas para X")
      const nicheLabel = item.keyword.length > 15
        ? item.keyword
        : (niche || item.keyword);

      candidates.push({
        niche: nicheLabel,
        angle_family: family,
        angle_specific: angleSpecific,
        big_idea: generateBigIdea(item.keyword, family, niche),
        source: "research",
        score: item.total_score,
        keyword: item.keyword,
        keyword_score: item.total_score,
      });

      // Cross with other families for the same keyword (multiplier)
      // Each keyword × 5 families = 5 angle candidates
      for (const otherFamily of ALL_ANGLE_FAMILIES) {
        if (otherFamily === family) continue;
        candidates.push({
          niche: nicheLabel,
          angle_family: otherFamily,
          angle_specific: `${ALL_ANGLE_FAMILIES.indexOf(otherFamily) + 1}.x_${niche || "general"}`,
          big_idea: generateBigIdea(item.keyword, otherFamily, niche),
          source: "research_cross",
          score: Math.round(item.total_score * 0.6), // Lower score for cross-family
          keyword: item.keyword,
          keyword_score: item.total_score,
        });
      }
    }

    return candidates;
  } catch {
    return [];
  }
}

/**
 * Generate angle candidates from coverage gaps.
 */
async function anglesFromCoverageGaps(): Promise<AngleCandidate[]> {
  const coverage = await getCoverage();
  const candidates: AngleCandidate[] = [];

  // Find underrepresented families
  for (const family of ALL_ANGLE_FAMILIES) {
    const count = coverage.byAngle[family] || 0;
    if (count < coverage.totalGenerations / ALL_ANGLE_FAMILIES.length) {
      // This family is underrepresented
      candidates.push({
        niche: "auto-seleccionar",
        angle_family: family,
        angle_specific: `${ALL_ANGLE_FAMILIES.indexOf(family) + 1}.x_gap`,
        big_idea: `Familia "${family}" tiene solo ${count}/${coverage.totalGenerations} guiones — necesita más cobertura`,
        source: "coverage_gap",
        score: 5000 + (coverage.totalGenerations - count) * 100, // Higher score = bigger gap
      });
    }
  }

  return candidates;
}

/**
 * Deduplicate and rank all candidates. Filter out already-used niches.
 */
async function rankAndFilter(candidates: AngleCandidate[]): Promise<AngleCandidate[]> {
  const coverage = await getCoverage();
  const usedNiches = new Set(
    Object.keys(coverage.byNiche).map((n) => n.toLowerCase().trim())
  );

  // Boost candidates whose niche is NEW (never used)
  for (const c of candidates) {
    const isNew = !usedNiches.has(c.niche.toLowerCase().trim());
    if (isNew) c.score += 2000; // Significant boost for novelty
  }

  // Deduplicate by niche + family (keep highest score)
  const seen = new Map<string, AngleCandidate>();
  for (const c of candidates) {
    const key = `${c.niche.toLowerCase()}|${c.angle_family}`;
    const existing = seen.get(key);
    if (!existing || c.score > existing.score) {
      seen.set(key, c);
    }
  }

  // Sort by score descending
  const ranked = Array.from(seen.values()).sort((a, b) => b.score - a.score);

  return ranked;
}

/**
 * Main entry point: get ranked angle candidates.
 * Results are cached for 1 hour.
 */
export async function getDiscoveredAngles(): Promise<AngleCandidate[]> {
  if (anglesCache && Date.now() - anglesCacheTime < ANGLES_CACHE_TTL) {
    return anglesCache;
  }

  const [researchAngles, gapAngles] = await Promise.all([
    anglesFromResearch(),
    anglesFromCoverageGaps(),
  ]);

  const all = [...researchAngles, ...gapAngles];
  const ranked = await rankAndFilter(all);

  // Cache in memory
  anglesCache = ranked;
  anglesCacheTime = Date.now();

  // Persist summary to disk for inspection (full list lives in memory cache)
  try {
    await fs.writeFile(
      ANGLES_CACHE_FILE,
      JSON.stringify({
        generated_at: new Date().toISOString(),
        total_candidates: ranked.length,
        top_20: ranked.slice(0, 20),
      }, null, 2),
    );
  } catch {
    // Non-critical — disk write failure shouldn't block generation
  }

  return ranked;
}

/**
 * Pick the best angle candidate that matches the given family.
 * Used by auto-brief to select a concrete niche + big idea.
 */
export async function pickAngleForFamily(family: string): Promise<AngleCandidate | null> {
  const angles = await getDiscoveredAngles();
  const matching = angles.filter((a) => a.angle_family === family);
  if (matching.length === 0) return null;

  // Pick from top 5 with some randomness (not always #1)
  const topN = matching.slice(0, 5);
  return topN[Math.floor(Math.random() * topN.length)];
}
