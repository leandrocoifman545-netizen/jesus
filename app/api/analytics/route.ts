import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const GENERATIONS_DIR = path.join(process.cwd(), ".data", "generations");
const BRIEFS_DIR = path.join(process.cwd(), ".data", "briefs");

interface GenData {
  id: string;
  title?: string;
  briefId: string;
  status?: string;
  metrics?: {
    ctr?: number;
    hookRate?: number;
    holdRate?: number;
    cpa?: number;
    roas?: number;
    bestLeadIndex?: number;
    notes?: string;
  };
  script: {
    platform_adaptation?: {
      platform?: string;
      content_style?: string;
      key_considerations?: string;
      recommended_duration_seconds?: number;
    };
    visual_format?: { format_name?: string };
    hooks?: Array<{ hook_type?: string; script_text?: string }>;
    development?: {
      framework_used?: string;
      sections?: Array<{ section_name?: string }>;
    };
    ingredients_used?: Array<{ category: string; ingredient_number: number; ingredient_name: string }>;
    model_sale_type?: string;
    body_type?: string;
    angle_family?: string;
    angle_specific?: string;
    total_duration_seconds?: number;
    word_count?: number;
  };
  createdAt: string;
}

function inferAngleFamily(gen: GenData, briefContent?: string): string {
  const style = gen.script.platform_adaptation?.content_style?.toLowerCase() || "";
  const considerations = gen.script.platform_adaptation?.key_considerations?.toLowerCase() || "";
  const hookText = gen.script.hooks?.[0]?.script_text?.toLowerCase() || "";
  const brief = briefContent?.toLowerCase() || "";
  const all = `${style} ${considerations} ${hookText} ${brief}`;

  if (gen.script.angle_family) return gen.script.angle_family;

  // Infer from content
  if (/storytelling|historia|origen|fracaso|alumno/.test(all)) return "historia";
  if (/demo|proceso|paso a paso|pantalla|matemát/.test(all)) return "mecanismo";
  if (/anti.?gur|desconfianza|ciclo roto|desperdici|consumidor/.test(all)) return "confrontacion";
  if (/ventana|tendencia|nicho|oportunidad|economía del conocimiento/.test(all)) return "oportunidad";
  if (/mamá|jubilad|oficin|freelanc|joven|desemplead|emprendedor quemado/.test(all)) return "identidad";

  return "sin_clasificar";
}

function inferBodyType(gen: GenData): string {
  if (gen.script.body_type) return gen.script.body_type;

  const framework = gen.script.development?.framework_used?.toLowerCase() || "";
  const sections = gen.script.development?.sections?.map(s => s.section_name?.toLowerCase() || "").join(" ") || "";
  const all = `${framework} ${sections}`;

  if (/analog/.test(all)) return "analogia_extendida";
  if (/compar|camino|versus|vs/.test(all)) return "comparacion_caminos";
  if (/demo|proceso|paso/.test(all)) return "demo_proceso";
  if (/mito|creencia|demolici/.test(all)) return "demolicion_mito";
  if (/historia|giro|story/.test(all)) return "historia_con_giro";
  if (/pregunta|respuesta|q&a|obje/.test(all)) return "pregunta_respuesta";
  if (/futuro|día en la vida|future/.test(all)) return "un_dia_en_la_vida";
  if (/contraste|emocional|dolor/.test(all)) return "contraste_emocional";

  return "sin_clasificar";
}

export async function GET() {
  try {
    const files = await fs.readdir(GENERATIONS_DIR);
    const jsonFiles = files.filter(f => f.endsWith(".json"));

    const generations: GenData[] = [];
    for (const file of jsonFiles) {
      const raw = await fs.readFile(path.join(GENERATIONS_DIR, file), "utf-8");
      generations.push(JSON.parse(raw));
    }

    // Sort by date
    generations.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // --- Stats ---
    const total = generations.length;
    const byStatus: Record<string, number> = {};
    const byAngleFamily: Record<string, number> = {};
    const byBodyType: Record<string, number> = {};
    const byModelSale: Record<string, number> = {};
    const byHookType: Record<string, number> = {};
    const byFramework: Record<string, number> = {};
    const byVisualFormat: Record<string, number> = {};
    const angleFamilyDetail: Record<string, string[]> = {};

    // Performance tracking
    const withMetrics: Array<{
      id: string;
      title?: string;
      status?: string;
      metrics: GenData["metrics"];
      angleFamily: string;
      bodyType: string;
      modelSale: string;
      hookType: string;
      framework: string;
    }> = [];

    for (const gen of generations) {
      const status = gen.status || "draft";
      byStatus[status] = (byStatus[status] || 0) + 1;

      const angleFamily = inferAngleFamily(gen);
      byAngleFamily[angleFamily] = (byAngleFamily[angleFamily] || 0) + 1;

      const angleSpecific = gen.script.angle_specific || gen.script.platform_adaptation?.content_style || "N/A";
      if (!angleFamilyDetail[angleFamily]) angleFamilyDetail[angleFamily] = [];
      angleFamilyDetail[angleFamily].push(angleSpecific);

      const bodyType = inferBodyType(gen);
      byBodyType[bodyType] = (byBodyType[bodyType] || 0) + 1;

      const modelSale = gen.script.model_sale_type || "sin_venta_modelo";
      byModelSale[modelSale] = (byModelSale[modelSale] || 0) + 1;

      const hookType = gen.script.hooks?.[0]?.hook_type || "unknown";
      byHookType[hookType] = (byHookType[hookType] || 0) + 1;

      const framework = gen.script.development?.framework_used || "unknown";
      byFramework[framework] = (byFramework[framework] || 0) + 1;

      const vf = gen.script.visual_format?.format_name || "sin_formato";
      byVisualFormat[vf] = (byVisualFormat[vf] || 0) + 1;

      if (gen.metrics && Object.keys(gen.metrics).length > 0) {
        withMetrics.push({
          id: gen.id,
          title: gen.title,
          status: gen.status,
          metrics: gen.metrics,
          angleFamily,
          bodyType,
          modelSale,
          hookType,
          framework,
        });
      }
    }

    // --- Diversity score (last 10 scripts) ---
    const last10 = generations.slice(-10);
    const last10Families = new Set(last10.map(g => inferAngleFamily(g)));
    const last10BodyTypes = new Set(last10.map(g => inferBodyType(g)));
    const diversityScore = {
      angleFamilies: last10Families.size,
      angleFamiliesMax: 5,
      bodyTypes: last10BodyTypes.size,
      bodyTypesMax: 8,
      score: Math.round(((last10Families.size / 5) + (last10BodyTypes.size / 8)) / 2 * 100),
    };

    // --- Saturation alerts ---
    const saturationAlerts: string[] = [];
    for (const [family, count] of Object.entries(byAngleFamily)) {
      const pct = Math.round((count / total) * 100);
      if (pct > 30) {
        saturationAlerts.push(`Familia "${family}" tiene ${pct}% de los guiones (${count}/${total})`);
      }
    }
    for (const [type, count] of Object.entries(byBodyType)) {
      const pct = Math.round((count / total) * 100);
      if (pct > 35) {
        saturationAlerts.push(`Tipo de cuerpo "${type}" tiene ${pct}% (${count}/${total})`);
      }
    }

    // --- Winners analysis ---
    const winners = generations.filter(g => g.status === "winner");
    const recorded = generations.filter(g => g.status === "recorded" || g.status === "winner");

    // --- Unused combos ---
    const allFamilies = ["identidad", "oportunidad", "confrontacion", "mecanismo", "historia"];
    const allBodyTypes = ["demolicion_mito", "historia_con_giro", "demo_proceso", "comparacion_caminos", "un_dia_en_la_vida", "pregunta_respuesta", "analogia_extendida", "contraste_emocional"];
    const usedCombos = new Set(generations.map(g => `${inferAngleFamily(g)}|${inferBodyType(g)}`));
    const unusedCombos: string[] = [];
    for (const f of allFamilies) {
      for (const b of allBodyTypes) {
        if (!usedCombos.has(`${f}|${b}`)) {
          unusedCombos.push(`${f} × ${b}`);
        }
      }
    }

    return NextResponse.json({
      total,
      byStatus,
      byAngleFamily,
      angleFamilyDetail,
      byBodyType,
      byModelSale,
      byHookType,
      byFramework,
      byVisualFormat,
      diversityScore,
      saturationAlerts,
      winners: winners.length,
      recorded: recorded.length,
      withMetrics,
      unusedCombos,
      // Timeline data for chart
      timeline: generations.map(g => ({
        id: g.id,
        title: g.title,
        date: g.createdAt,
        status: g.status || "draft",
        angleFamily: inferAngleFamily(g),
        bodyType: inferBodyType(g),
        modelSale: g.script.model_sale_type || null,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
