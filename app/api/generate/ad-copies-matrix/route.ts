import { NextRequest, NextResponse } from "next/server";
import { getGeneration, saveGeneration } from "@/lib/storage/local";
import { generateAdCopiesMatrix } from "@/lib/ai/generate";
import type { AdCopiesMatrix } from "@/lib/ai/generate";

// GET /api/generate/ad-copies-matrix?generationId=xxx — read existing copies
export async function GET(req: NextRequest) {
  try {
    const generationId = req.nextUrl.searchParams.get("generationId");
    if (!generationId) {
      return NextResponse.json({ error: "Falta generationId" }, { status: 400 });
    }
    const gen = await getGeneration(generationId);
    if (!gen) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    const matrix = (gen as unknown as Record<string, unknown>).ad_copies_matrix as AdCopiesMatrix | undefined;
    if (!matrix) {
      return NextResponse.json({ error: "Sin copies" }, { status: 404 });
    }
    return NextResponse.json(matrix);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { generationId } = await req.json();

    if (!generationId) {
      return NextResponse.json({ error: "Falta generationId" }, { status: 400 });
    }

    const gen = await getGeneration(generationId);
    if (!gen) {
      return NextResponse.json({ error: "Generación no encontrada" }, { status: 404 });
    }

    const matrix = await generateAdCopiesMatrix(gen.script, generationId);

    // Save to generation
    const genWithCopies = gen as unknown as Record<string, unknown>;
    genWithCopies.ad_copies_matrix = matrix;
    await saveGeneration(gen);

    return NextResponse.json(matrix);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
