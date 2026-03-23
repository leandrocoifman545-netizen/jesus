import { NextRequest, NextResponse } from "next/server";
import { getGeneration } from "@/lib/storage/local";
import type { AdCopiesMatrix } from "@/lib/ai/generate";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// GET /api/export/copies-batch?ids=id1,id2,id3
export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ error: "Falta ids" }, { status: 400 });
    }

    const ids = idsParam.split(",").filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: "No hay IDs" }, { status: 400 });
    }

    const headers = [
      "Guion",
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

    const allRows: string[][] = [];
    let skipped = 0;

    for (const id of ids) {
      const gen = await getGeneration(id);
      if (!gen) { skipped++; continue; }

      const matrix = (gen as unknown as Record<string, unknown>).ad_copies_matrix as AdCopiesMatrix | undefined;
      if (!matrix || !matrix.versions.length) { skipped++; continue; }

      const shortTitle = (gen.title || "Sin titulo").slice(0, 40);

      for (const v of matrix.versions) {
        allRows.push([
          shortTitle,
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
      }
    }

    if (allRows.length === 0) {
      return NextResponse.json({ error: "Ningún guion tiene copies generados" }, { status: 400 });
    }

    const csv = [
      headers.map(escapeCSV).join(","),
      ...allRows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const bom = "\uFEFF";
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="copies-${ids.length}guiones-${date}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
