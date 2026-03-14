import { NextResponse } from "next/server";
import { getCoverage } from "@/lib/coverage";

export async function GET() {
  try {
    const coverage = await getCoverage();
    return NextResponse.json(coverage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
