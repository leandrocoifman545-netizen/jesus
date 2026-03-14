import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const RESEARCH_FILE = path.join(process.cwd(), ".data", "research", "latest.json");

interface KeywordEntry {
  keyword: string;
  source_keyword?: string;
  total_score: number;
  score_by_country: Record<string, number> | null;
  classification?: {
    type: string;
    angles: string[];
    niche: string | null;
  };
}

interface ResearchData {
  generated_at: string;
  summary: {
    total_suggestions: number;
    ranked_count: number;
    by_angle: Record<string, { total: number; top3: string[] }>;
    by_niche: Record<string, { total: number; top3: string[] }>;
  };
  top_100: KeywordEntry[];
  by_angle: Record<string, Array<{ keyword: string; total_score: number; score_by_country: Record<string, number> | null }>>;
  by_niche: Record<string, Array<{ keyword: string; total_score: number; score_by_country: Record<string, number> | null }>>;
  all_results: KeywordEntry[];
}

export async function GET(request: NextRequest) {
  try {
    const raw = await fs.readFile(RESEARCH_FILE, "utf-8");
    const data: ResearchData = JSON.parse(raw);

    const { searchParams } = request.nextUrl;
    const angleFilter = searchParams.get("angle");
    const countryFilter = searchParams.get("country");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 500);

    // If a specific angle is requested, return keywords for that angle
    if (angleFilter) {
      const angleData = data.by_angle[angleFilter];
      if (!angleData) {
        return NextResponse.json(
          { error: `Angle "${angleFilter}" not found. Available: ${Object.keys(data.by_angle).join(", ")}` },
          { status: 404 }
        );
      }

      let results = [...angleData];

      // Filter by country if specified
      if (countryFilter) {
        results = results
          .filter((k) => k.score_by_country?.[countryFilter] != null)
          .sort((a, b) => (b.score_by_country?.[countryFilter] ?? 0) - (a.score_by_country?.[countryFilter] ?? 0));
      } else {
        results.sort((a, b) => b.total_score - a.total_score);
      }

      return NextResponse.json({
        generated_at: data.generated_at,
        angle: angleFilter,
        country: countryFilter || null,
        total: results.length,
        keywords: results.slice(0, limit),
      });
    }

    // No angle filter: return top keywords grouped by angle
    if (countryFilter) {
      // Filter all_results by country and return top N
      const filtered = data.all_results
        .filter((k) => k.score_by_country?.[countryFilter] != null)
        .sort((a, b) => (b.score_by_country?.[countryFilter] ?? 0) - (a.score_by_country?.[countryFilter] ?? 0))
        .slice(0, limit)
        .map((k) => ({
          keyword: k.keyword,
          total_score: k.total_score,
          country_score: k.score_by_country?.[countryFilter] ?? 0,
          angles: k.classification?.angles || [],
          niche: k.classification?.niche || null,
        }));

      return NextResponse.json({
        generated_at: data.generated_at,
        country: countryFilter,
        total: filtered.length,
        keywords: filtered,
      });
    }

    // Default: return summary + top keywords grouped by angle
    const byAngle: Record<string, Array<{ keyword: string; total_score: number }>> = {};
    for (const [angle, entries] of Object.entries(data.by_angle)) {
      byAngle[angle] = entries
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, limit)
        .map((k) => ({ keyword: k.keyword, total_score: k.total_score }));
    }

    return NextResponse.json({
      generated_at: data.generated_at,
      total_suggestions: data.summary.total_suggestions,
      ranked_count: data.summary.ranked_count,
      available_angles: Object.keys(data.by_angle),
      available_countries: ["Argentina", "México", "Colombia", "Venezuela", "Perú"],
      top_keywords: data.top_100.slice(0, limit).map((k) => ({
        keyword: k.keyword,
        total_score: k.total_score,
        score_by_country: k.score_by_country,
        angles: k.classification?.angles || [],
        niche: k.classification?.niche || null,
      })),
      by_angle: byAngle,
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json(
        { error: "Research file not found. Run research first: node scripts/research-angles.mjs" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
