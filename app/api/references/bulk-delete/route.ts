import { NextRequest, NextResponse } from "next/server";
import { deleteReference } from "@/lib/storage/local";

export async function POST(req: NextRequest) {
  try {
    const { ids } = (await req.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de ids" }, { status: 400 });
    }

    let deleted = 0;
    for (const id of ids) {
      const ok = await deleteReference(id);
      if (ok) deleted++;
    }

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
