import { NextResponse } from "next/server";
import { mineAngles, getLatestMining } from "@/lib/ai/angle-miner";

export async function GET() {
  try {
    const result = await getLatestMining();
    if (!result) {
      return NextResponse.json({ empty: true, message: "No hay resultados. Ejecutá un mining primero." });
    }

    // Check staleness (older than 7 days)
    const age = Date.now() - new Date(result.generated_at).getTime();
    const stale = age > 7 * 24 * 60 * 60 * 1000;

    return NextResponse.json({ ...result, stale });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await mineAngles();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
