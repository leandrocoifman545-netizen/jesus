import { listGenerations, type StoredGeneration } from "./storage/local";

// Module-level cache for coverage data
let coverageCache: CoverageData | null = null;

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
  byStatus: Record<string, number>;
  gaps: string[];
  lastUpdated: string;
}

// Extract metadata from generation title/notes/script
function extractTags(gen: StoredGeneration): {
  angle?: string;
  segment?: string;
  funnel?: string;
  bodyType?: string;
  niche?: string;
} {
  const text = [gen.title, gen.sessionNotes, gen.script.development.emotional_arc].filter(Boolean).join(" ").toLowerCase();

  // Angles (from jesus-adp.md)
  const angles = [
    "latam", "consumidor ia", "mamá", "crianza", "ventas visibles",
    "storytelling", "edad", "anti-gurú", "ia desperdiciada",
    "colombia", "anti-estafa", "fitness", "skincare", "fotografía",
    "manualidades", "educación", "jardinería", "nutrición",
  ];
  const angle = angles.find((a) => text.includes(a));

  // Segments
  const segmentMatch = text.match(/seg(?:mento)?\s*([abcd])/i);
  const segment = segmentMatch ? segmentMatch[1].toUpperCase() : undefined;

  // Funnel
  const funnels = ["tofu", "mofu", "bofu", "retarget", "evergreen"];
  const funnel = funnels.find((f) => text.includes(f));

  // Body types
  const bodyTypes = [
    "mecanismo", "idea de nicho", "cambio de creencia",
    "storytelling", "analogía", "comparación", "anti-gurú",
  ];
  const bodyType = bodyTypes.find((b) => text.includes(b));

  // Niche (from title usually)
  const nicheMatch = gen.title?.match(/(?:nicho|idea):\s*(.+?)(?:\s*[-—|]|$)/i);
  const niche = nicheMatch ? nicheMatch[1].trim() : undefined;

  return { angle, segment, funnel, bodyType, niche };
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
    byStatus: {},
    gaps: [],
    lastUpdated: new Date().toISOString(),
  };

  for (const gen of generations) {
    // Framework (always available from script)
    const fw = gen.script.development.framework_used;
    data.byFramework[fw] = (data.byFramework[fw] || 0) + 1;

    // Visual format
    if (gen.script.visual_format) {
      const fmt = gen.script.visual_format.format_name;
      data.byVisualFormat[fmt] = (data.byVisualFormat[fmt] || 0) + 1;
    }

    // Lead types from hooks
    for (const hook of gen.script.hooks) {
      data.byLeadType[hook.hook_type] = (data.byLeadType[hook.hook_type] || 0) + 1;
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
  }

  // Detect gaps
  const allSegments = ["A", "B", "C", "D"];
  const allFunnels = ["TOFU", "MOFU", "BOFU", "RETARGET", "EVERGREEN"];
  const allHookTypes = [
    "situacion_especifica", "dato_concreto", "pregunta_incomoda", "confesion",
    "contraintuitivo", "provocacion", "historia_mini", "analogia",
    "negacion_directa", "observacion_tendencia", "timeline_provocacion",
    "contrato_compromiso", "actuacion_dialogo", "anti_publico",
  ];

  for (const s of allSegments) {
    if (!data.bySegment[s]) data.gaps.push(`Segmento ${s} sin cobertura`);
  }
  for (const f of allFunnels) {
    if (!data.byFunnel[f] && !data.byFunnel[f.toLowerCase()]) data.gaps.push(`Funnel ${f} sin cobertura`);
  }
  for (const h of allHookTypes) {
    if (!data.byLeadType[h]) data.gaps.push(`Lead type "${h}" sin usar`);
  }

  return data;
}

/**
 * Recompute coverage and update the module-level cache.
 * Call this after saving a generation to keep cache fresh.
 */
export async function refreshCoverageCache(): Promise<CoverageData> {
  const fresh = await computeCoverage();
  coverageCache = fresh;
  return fresh;
}

/**
 * Get cached coverage data, or compute if cache is empty.
 */
export async function getCoverage(): Promise<CoverageData> {
  if (coverageCache) return coverageCache;
  return refreshCoverageCache();
}
