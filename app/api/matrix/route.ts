import { NextResponse } from "next/server";
import { listGenerations } from "@/lib/storage/local";
import { inferAngleFamily, inferBodyType, inferEmotionalArc, inferSegment } from "@/lib/utils/classification";
import { ALL_ANGLE_FAMILIES, ALL_EMOTIONAL_ARCS, ALL_SEGMENTS } from "@/lib/constants/hook-types";

export async function GET() {
  try {
    const generations = await listGenerations();

    // Build 3D matrix: family -> arc -> segment -> generation ids
    const matrix: Record<string, Record<string, Record<string, string[]>>> = {};
    const genSummaries: Record<string, { title?: string; status?: string }> = {};

    for (const fam of ALL_ANGLE_FAMILIES) {
      matrix[fam] = {};
      for (const arc of ALL_EMOTIONAL_ARCS) {
        matrix[fam][arc] = {};
        for (const seg of ALL_SEGMENTS) {
          matrix[fam][arc][seg] = [];
        }
      }
    }

    for (const gen of generations) {
      const family = inferAngleFamily(gen);
      const arc = inferEmotionalArc(gen);
      const segment = inferSegment(gen);

      if (matrix[family]?.[arc]?.[segment]) {
        matrix[family][arc][segment].push(gen.id);
      }

      genSummaries[gen.id] = { title: gen.title, status: gen.status || "draft" };
    }

    // Stats
    const totalCells = ALL_ANGLE_FAMILIES.length * ALL_EMOTIONAL_ARCS.length * ALL_SEGMENTS.length;
    let filledCells = 0;
    let emptyCells = 0;
    let saturatedCells = 0;
    const gaps: Array<{ family: string; arc: string; segment: string }> = [];
    const hotspots: Array<{ family: string; arc: string; segment: string; count: number }> = [];

    for (const fam of ALL_ANGLE_FAMILIES) {
      for (const arc of ALL_EMOTIONAL_ARCS) {
        for (const seg of ALL_SEGMENTS) {
          const count = matrix[fam][arc][seg].length;
          if (count === 0) {
            emptyCells++;
            gaps.push({ family: fam, arc, segment: seg });
          } else {
            filledCells++;
            if (count >= 3) {
              saturatedCells++;
              hotspots.push({ family: fam, arc, segment: seg, count });
            }
          }
        }
      }
    }

    // 2D aggregations for the flat view (family x arc, ignoring segment)
    const flatMatrix: Record<string, Record<string, { total: number; bySegment: Record<string, number> }>> = {};
    for (const fam of ALL_ANGLE_FAMILIES) {
      flatMatrix[fam] = {};
      for (const arc of ALL_EMOTIONAL_ARCS) {
        const bySegment: Record<string, number> = {};
        let total = 0;
        for (const seg of ALL_SEGMENTS) {
          const c = matrix[fam][arc][seg].length;
          bySegment[seg] = c;
          total += c;
        }
        flatMatrix[fam][arc] = { total, bySegment };
      }
    }

    return NextResponse.json({
      matrix,
      flatMatrix,
      genSummaries,
      stats: {
        totalGenerations: generations.length,
        totalCells,
        filledCells,
        emptyCells,
        saturatedCells,
        coveragePercent: Math.round((filledCells / totalCells) * 100),
      },
      gaps: gaps.slice(0, 20), // top 20 gaps
      hotspots: hotspots.sort((a, b) => b.count - a.count).slice(0, 10),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
