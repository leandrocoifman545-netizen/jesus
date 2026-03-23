import { NextRequest, NextResponse } from "next/server";
import { buildAutoBrief } from "@/lib/ai/auto-brief";
import { getCoverage } from "@/lib/coverage";
import { getBurnedLeads } from "@/lib/storage/local";
import { isResearchStale } from "@/lib/ai/angle-discovery";
import { extractBriefOverrides } from "@/lib/ai/generate";
import { AVATAR_LABELS, AWARENESS_LABELS } from "@/lib/constants/hook-types";

/**
 * Dry-run endpoint: preview what auto-brief would select WITHOUT calling Claude.
 * Free, fast, no API usage. Shows: selected parameters, coverage state, research freshness.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Reuse the same override parser as the real generation pipeline
    const rawOverrides = extractBriefOverrides({
      productDescription: "",
      targetAudience: "",
      hookCount: 5,
      additionalNotes: body.additionalNotes,
    });
    const overrides = {
      ...rawOverrides,
      awareness_level: rawOverrides.awareness_level ? parseInt(rawOverrides.awareness_level, 10) : undefined,
    };

    // Build auto-brief (no Claude call)
    const brief = await buildAutoBrief(overrides);

    // Get supporting data (coverage is already cached from buildAutoBrief)
    const [coverage, burnedLeads, research] = await Promise.all([
      getCoverage(),
      getBurnedLeads(),
      isResearchStale(),
    ]);

    return NextResponse.json({
      auto_brief: {
        angle_family: brief.angle_family,
        body_type: brief.body_type,
        segment: brief.segment,
        funnel_stage: brief.funnel_stage,
        model_sale_type: brief.model_sale_type,
        emotion: brief.emotion,
        avatar: brief.avatar,
        avatar_label: AVATAR_LABELS[brief.avatar] || brief.avatar,
        awareness_level: brief.awareness_level,
        awareness_label: AWARENESS_LABELS[brief.awareness_level] || `Nivel ${brief.awareness_level}`,
        discovered_angle: brief.discovered_angle
          ? {
              niche: brief.discovered_angle.niche,
              big_idea: brief.discovered_angle.big_idea,
              keyword: brief.discovered_angle.keyword,
              score: brief.discovered_angle.score,
              source: brief.discovered_angle.source,
            }
          : null,
      },
      coverage_summary: {
        total_generations: coverage.totalGenerations,
        gaps: coverage.gaps.slice(0, 10),
        by_angle: coverage.byAngle,
        by_body_type: coverage.byBodyType,
        by_avatar: coverage.byAvatar,
        by_awareness: coverage.byAwareness,
      },
      burned_leads_count: burnedLeads.length,
      research: {
        stale: research.stale,
        days_old: research.daysOld,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error en dry-run" },
      { status: 500 },
    );
  }
}
