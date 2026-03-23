import { listGenerations, type StoredGeneration } from "./storage/local";
import { extractTags } from "./utils/classification";
import { ALL_SEGMENTS, ALL_FUNNELS, ALL_HOOK_TYPES, ALL_AVATARS, ALL_AWARENESS_LEVELS } from "./constants/hook-types";

// Module-level cache for coverage data
let coverageCache: CoverageData | null = null;
let lastRefreshTime = 0;

export interface CoverageData {
  totalGenerations: number;
  byAngle: Record<string, number>;
  bySegment: Record<string, number>;
  byFunnel: Record<string, number>;
  byFramework: Record<string, number>;
  byBodyType: Record<string, number>;
  byVisualFormat: Record<string, number>;
  byNiche: Record<string, number>;
  byLeadType: Record<string, number>;
  byModelSaleType: Record<string, number>;
  byAvatar: Record<string, number>;
  byAwareness: Record<string, number>;
  byStatus: Record<string, number>;
  gaps: string[];
  lastUpdated: string;
}

export async function computeCoverage(): Promise<CoverageData> {
  const generations = await listGenerations();

  const data: CoverageData = {
    totalGenerations: generations.length,
    byAngle: {},
    bySegment: {},
    byFunnel: {},
    byFramework: {},
    byBodyType: {},
    byVisualFormat: {},
    byNiche: {},
    byLeadType: {},
    byModelSaleType: {},
    byAvatar: {},
    byAwareness: {},
    byStatus: {},
    gaps: [],
    lastUpdated: new Date().toISOString(),
  };

  for (const gen of generations) {
    // Skip corrupt/incomplete generations
    if (!gen.script?.development?.framework_used) continue;

    // Framework (always available from script)
    const fw = gen.script.development.framework_used;
    data.byFramework[fw] = (data.byFramework[fw] || 0) + 1;

    // Visual format
    if (gen.script.visual_format) {
      const fmt = gen.script.visual_format.format_name;
      data.byVisualFormat[fmt] = (data.byVisualFormat[fmt] || 0) + 1;
    }

    // Lead types from hooks
    for (const hook of gen.script.hooks || []) {
      if (hook.hook_type) data.byLeadType[hook.hook_type] = (data.byLeadType[hook.hook_type] || 0) + 1;
    }

    // Status
    const status = gen.status || "draft";
    data.byStatus[status] = (data.byStatus[status] || 0) + 1;

    // Extract tags from title/notes
    const tags = extractTags(gen);

    // Prefer structured fields from schema, fall back to text extraction
    const script = gen.script as any;

    // Angle family (structured field)
    if (script.angle_family) {
      data.byAngle[script.angle_family] = (data.byAngle[script.angle_family] || 0) + 1;
    } else if (tags.angle) {
      data.byAngle[tags.angle] = (data.byAngle[tags.angle] || 0) + 1;
    }

    // Segment (structured field)
    if (script.segment) {
      data.bySegment[script.segment] = (data.bySegment[script.segment] || 0) + 1;
    } else if (tags.segment) {
      data.bySegment[tags.segment] = (data.bySegment[tags.segment] || 0) + 1;
    }

    // Body type (structured field)
    if (script.body_type) {
      data.byBodyType[script.body_type] = (data.byBodyType[script.body_type] || 0) + 1;
    } else if (tags.bodyType) {
      data.byBodyType[tags.bodyType] = (data.byBodyType[tags.bodyType] || 0) + 1;
    }

    // Funnel stage (structured field)
    if (script.funnel_stage) {
      data.byFunnel[script.funnel_stage] = (data.byFunnel[script.funnel_stage] || 0) + 1;
    } else if (tags.funnel) {
      data.byFunnel[tags.funnel] = (data.byFunnel[tags.funnel] || 0) + 1;
    }

    // Niche (structured field)
    if (script.niche) {
      data.byNiche[script.niche] = (data.byNiche[script.niche] || 0) + 1;
    } else if (tags.niche) {
      data.byNiche[tags.niche] = (data.byNiche[tags.niche] || 0) + 1;
    }

    // Model sale type
    if (script.model_sale_type) {
      data.byModelSaleType[script.model_sale_type] = (data.byModelSaleType[script.model_sale_type] || 0) + 1;
    }

    // Avatar
    if (script.avatar) {
      data.byAvatar[script.avatar] = (data.byAvatar[script.avatar] || 0) + 1;
    }

    // Awareness level (Schwartz)
    if (script.awareness_level) {
      const key = String(script.awareness_level);
      data.byAwareness[key] = (data.byAwareness[key] || 0) + 1;
    }
  }

  // Detect gaps
  for (const s of ALL_SEGMENTS) {
    if (!data.bySegment[s]) data.gaps.push(`Segmento ${s} sin cobertura`);
  }
  for (const f of ALL_FUNNELS) {
    if (!data.byFunnel[f] && !data.byFunnel[f.toLowerCase()]) data.gaps.push(`Funnel ${f} sin cobertura`);
  }
  for (const h of ALL_HOOK_TYPES) {
    if (!data.byLeadType[h]) data.gaps.push(`Lead type "${h}" sin usar`);
  }
  for (const a of ALL_AVATARS) {
    if (!data.byAvatar[a]) data.gaps.push(`Avatar "${a}" sin cobertura`);
  }
  for (const level of ALL_AWARENESS_LEVELS) {
    if (!data.byAwareness[String(level)]) data.gaps.push(`Awareness nivel ${level} sin cobertura`);
  }

  return data;
}

/**
 * Recompute coverage and update the module-level cache.
 * Debounced: skips recompute if called within 5 seconds of last refresh.
 */
const REFRESH_DEBOUNCE_MS = 5_000;

export async function refreshCoverageCache(): Promise<CoverageData> {
  const now = Date.now();
  if (coverageCache && now - lastRefreshTime < REFRESH_DEBOUNCE_MS) {
    return coverageCache;
  }
  const fresh = await computeCoverage();
  coverageCache = fresh;
  lastRefreshTime = now;
  return fresh;
}

/**
 * Get cached coverage data, or compute if cache is empty/stale.
 * Cache has a 5-minute TTL — auto-brief always gets reasonably fresh data.
 */
const COVERAGE_CACHE_TTL = 300_000; // 5 minutes

export async function getCoverage(): Promise<CoverageData> {
  if (coverageCache && Date.now() - lastRefreshTime < COVERAGE_CACHE_TTL) {
    return coverageCache;
  }
  return refreshCoverageCache();
}

/**
 * Force-invalidate the coverage cache (e.g. after saving a generation).
 */
export function invalidateCoverageCache(): void {
  coverageCache = null;
  lastRefreshTime = 0;
}
