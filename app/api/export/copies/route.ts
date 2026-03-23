import { NextRequest, NextResponse } from "next/server";
import { getGeneration } from "@/lib/storage/local";
import type { AdCopiesMatrix } from "@/lib/ai/generate";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// GET /api/export/copies?generationId=xxx
export async function GET(req: NextRequest) {
  try {
    const generationId = req.nextUrl.searchParams.get("generationId");
    if (!generationId) {
      return NextResponse.json({ error: "Falta generationId" }, { status: 400 });
    }

    const gen = await getGeneration(generationId);
    if (!gen) {
      return NextResponse.json({ error: "Generación no encontrada" }, { status: 404 });
    }

    const matrix = (gen as unknown as Record<string, unknown>).ad_copies_matrix as AdCopiesMatrix | undefined;
    if (!matrix || !matrix.versions.length) {
      return NextResponse.json({ error: "No hay copies generados. Generá primero." }, { status: 400 });
    }

    // Build CSV
    const headers = [
      "Version",
      "Hook #",
      "Hook Type",
      "CTA Canal",
      "Headline",
      "Descripcion",
      "Texto Principal",
      "Palabras",
      "Estructura",
    ];

    const rows = matrix.versions.map((v) => [
      v.version_name,
      String(v.hook_index + 1),
      v.hook_type,
      v.cta_label,
      v.headline,
      v.description,
      v.primary_text,
      String(v.word_count),
      v.structure_used,
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // BOM for Excel compatibility
    const bom = "\uFEFF";
    const safeName = (gen.title || "copies").replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);

    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}-15-copies.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
