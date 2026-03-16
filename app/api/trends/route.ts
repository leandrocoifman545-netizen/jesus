import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require("google-trends-api");

/**
 * Google Trends integration.
 *
 * GET /api/trends?q=productos+digitales         → Interest over time (Argentina, weekly)
 * GET /api/trends?q=productos+digitales&geo=MX  → Interest by country
 * GET /api/trends?related=productos+digitales    → Related queries (top + rising)
 * GET /api/trends?compare=a,b,c                 → Compare multiple keywords
 */

const GEO_MAP: Record<string, string> = {
  argentina: "AR",
  mexico: "MX",
  colombia: "CO",
  chile: "CL",
  peru: "PE",
  espana: "ES",
  eeuu: "US",
};

function resolveGeo(input: string): string {
  return GEO_MAP[input.toLowerCase()] || input.toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const related = searchParams.get("related");
    const compare = searchParams.get("compare");
    const geoInput = searchParams.get("geo") || "argentina";
    const geo = resolveGeo(geoInput);

    // Mode 1: Related queries (top + rising)
    if (related) {
      const raw = await googleTrends.relatedQueries({ keyword: related, geo, hl: "es" });
      const data = typeof raw === "string" ? typeof raw === "string" ? JSON.parse(raw) : raw : raw;
      const rankedList = data?.default?.rankedList || [];

      const top = (rankedList[0]?.rankedKeyword || []).map(
        (item: { query: string; value: number }) => ({ query: item.query, value: item.value })
      ).slice(0, 20);

      const rising = (rankedList[1]?.rankedKeyword || []).map(
        (item: { query: string; value: number }) => ({ query: item.query, value: item.value })
      ).slice(0, 20);

      return NextResponse.json({ query: related, geo, type: "related_queries", data: { top, rising } });
    }

    // Mode 2: Compare multiple keywords
    if (compare) {
      const keywords = compare.split(",").map(k => k.trim()).filter(Boolean).slice(0, 5);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const raw = await googleTrends.interestOverTime({
        keyword: keywords,
        startTime: sixMonthsAgo,
        geo,
        hl: "es",
      });
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      const timeline = (data?.default?.timelineData || []).map(
        (point: { formattedAxisTime: string; value: number[] }) => ({
          date: point.formattedAxisTime,
          values: Object.fromEntries(keywords.map((k, i) => [k, point.value[i]])),
        })
      );

      // Average of last 4 weeks for each keyword
      const lastWeeks = timeline.slice(-4);
      const averages = Object.fromEntries(
        keywords.map((k, i) => [
          k,
          Math.round(lastWeeks.reduce((sum: number, p: { values: Record<string, number> }) => sum + (p.values[k] || 0), 0) / lastWeeks.length),
        ])
      );

      return NextResponse.json({
        keywords,
        geo,
        type: "comparison",
        averages,
        data: timeline,
      });
    }

    // Mode 3: Interest over time for a single keyword
    if (query) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const raw = await googleTrends.interestOverTime({
        keyword: query,
        startTime: sixMonthsAgo,
        geo,
        hl: "es",
      });
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      const timeline = (data?.default?.timelineData || []).map(
        (point: { formattedAxisTime: string; value: number[] }) => ({
          date: point.formattedAxisTime,
          value: point.value[0],
        })
      );

      const latest = timeline[timeline.length - 1]?.value || 0;
      const peak = Math.max(...timeline.map((t: { value: number }) => t.value), 1);
      const avg = Math.round(timeline.reduce((s: number, t: { value: number }) => s + t.value, 0) / (timeline.length || 1));
      const trend = latest >= peak * 0.8 ? "subiendo" : latest >= peak * 0.5 ? "estable" : "bajando";

      return NextResponse.json({
        query,
        geo,
        type: "interest_over_time",
        trend,
        currentInterest: latest,
        peakInterest: peak,
        averageInterest: avg,
        data: timeline,
      });
    }

    // No params — return help
    return NextResponse.json({
      endpoints: {
        "?q=keyword": "Interest over time (6 meses)",
        "?related=keyword": "Queries relacionadas (top + rising)",
        "?compare=kw1,kw2,kw3": "Comparar keywords (max 5)",
        "?geo=mexico": "Cambiar pais (argentina, mexico, colombia, chile, peru)",
      },
      example: "/api/trends?q=productos+digitales+con+ia",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error fetching Google Trends" },
      { status: 500 }
    );
  }
}
