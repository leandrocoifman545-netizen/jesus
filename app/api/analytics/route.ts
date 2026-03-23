import { NextResponse } from "next/server";
import { listGenerations, type StoredGeneration } from "@/lib/storage/local";
import { inferAngleFamily, inferBodyType } from "@/lib/utils/classification";
import { ALL_ANGLE_FAMILIES, ALL_BODY_TYPES, ALL_AVATARS, AVATAR_BUYER_WEIGHTS } from "@/lib/constants/hook-types";

export async function GET() {
  try {
    const generations = await listGenerations();

    // --- Stats ---
    const total = generations.length;
    const byStatus: Record<string, number> = {};
    const byAngleFamily: Record<string, number> = {};
    const byBodyType: Record<string, number> = {};
    const byModelSale: Record<string, number> = {};
    const byHookType: Record<string, number> = {};
    const byFramework: Record<string, number> = {};
    const byVisualFormat: Record<string, number> = {};
    const byAvatar: Record<string, number> = {};
    const byAwareness: Record<string, number> = {};
    const byNiche: Record<string, number> = {};
    const angleFamilyDetail: Record<string, string[]> = {};

    // Performance tracking
    const withMetrics: Array<{
      id: string;
      title?: string;
      status?: string;
      metrics: StoredGeneration["metrics"];
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

      const script = gen.script as any;
      const angleSpecific = script.angle_specific || script.platform_adaptation?.content_style || "N/A";
      if (!angleFamilyDetail[angleFamily]) angleFamilyDetail[angleFamily] = [];
      angleFamilyDetail[angleFamily].push(angleSpecific);

      const bodyType = inferBodyType(gen);
      byBodyType[bodyType] = (byBodyType[bodyType] || 0) + 1;

      const modelSale = script.model_sale_type || "sin_venta_modelo";
      byModelSale[modelSale] = (byModelSale[modelSale] || 0) + 1;

      const hookType = gen.script.hooks?.[0]?.hook_type || "unknown";
      byHookType[hookType] = (byHookType[hookType] || 0) + 1;

      const framework = gen.script.development?.framework_used || "unknown";
      byFramework[framework] = (byFramework[framework] || 0) + 1;

      const vf = gen.script.visual_format?.format_name || "sin_formato";
      byVisualFormat[vf] = (byVisualFormat[vf] || 0) + 1;

      // Avatar tracking
      const avatar = script.avatar || "sin_avatar";
      byAvatar[avatar] = (byAvatar[avatar] || 0) + 1;

      // Awareness level tracking
      if (script.awareness_level) {
        const aw = String(script.awareness_level);
        byAwareness[aw] = (byAwareness[aw] || 0) + 1;
      }

      // Niche tracking
      if (script.niche) {
        const niche = script.niche.toLowerCase();
        byNiche[niche] = (byNiche[niche] || 0) + 1;
      }

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
      bodyTypesMax: 10,
      score: Math.round(((last10Families.size / 5) + (last10BodyTypes.size / 10)) / 2 * 100),
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
    // Niche saturation
    for (const [niche, count] of Object.entries(byNiche)) {
      if (count >= 4) {
        saturationAlerts.push(`Nicho "${niche}" usado ${count} veces — considerar nuevos nichos`);
      }
    }

    // --- Avatar weight comparison (actual vs target from buyer data) ---
    const avatarWeightComparison = ALL_AVATARS.map((a) => {
      const actual = total > 0 ? Math.round(((byAvatar[a] || 0) / total) * 100) : 0;
      const target = Math.round((AVATAR_BUYER_WEIGHTS[a] || 0) * 100);
      const diff = actual - target;
      if (Math.abs(diff) > 15) {
        saturationAlerts.push(`Avatar "${a}": ${actual}% actual vs ${target}% target (${diff > 0 ? "sobre" : "sub"}-representado)`);
      }
      return { avatar: a, actual, target, count: byAvatar[a] || 0 };
    });

    // --- Winners analysis ---
    const winners = generations.filter(g => g.status === "winner");
    const recorded = generations.filter(g => g.status === "recorded" || g.status === "winner");

    // --- Unused combos ---
    const usedCombos = new Set(generations.map(g => `${inferAngleFamily(g)}|${inferBodyType(g)}`));
    const unusedCombos: string[] = [];
    for (const f of ALL_ANGLE_FAMILIES) {
      for (const b of ALL_BODY_TYPES) {
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
      byAvatar,
      byAwareness,
      byNiche,
      avatarWeightComparison,
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
        modelSale: (g.script as any).model_sale_type || null,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
