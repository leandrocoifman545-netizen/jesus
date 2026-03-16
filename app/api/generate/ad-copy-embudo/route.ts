import { NextRequest, NextResponse } from "next/server";
import { generateAdCopyEmbudo } from "@/lib/ai/generate";
import { getGeneration } from "@/lib/storage/local";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId } = body;

    if (!generationId) {
      return NextResponse.json(
        { error: "Falta campo: generationId" },
        { status: 400 }
      );
    }

    const generation = await getGeneration(generationId);
    if (!generation) {
      return NextResponse.json({ error: "Generacion no encontrada" }, { status: 404 });
    }

    const adCopy = await generateAdCopyEmbudo(generation.script);

    return NextResponse.json({ adCopy });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating ad copy embudo:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
