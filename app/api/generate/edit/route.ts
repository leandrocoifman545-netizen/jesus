import { NextRequest, NextResponse } from "next/server";
import { getGeneration, saveGeneration } from "@/lib/storage/local";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId, path, value } = body as {
      generationId: string;
      path: string; // e.g. "hooks.0.script_text", "development.sections.1.script_text", "cta.verbal_cta"
      value: string;
    };

    if (!generationId || !path || value === undefined) {
      return NextResponse.json(
        { error: "Faltan campos: generationId, path, value" },
        { status: 400 }
      );
    }

    const generation = await getGeneration(generationId);
    if (!generation) {
      return NextResponse.json({ error: "Generacion no encontrada" }, { status: 404 });
    }

    // Navigate the path and set the value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const script = generation.script as any;
    const parts = path.split(".");
    let current = script;

    for (let i = 0; i < parts.length - 1; i++) {
      const key = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
      if (current[key] === undefined) {
        return NextResponse.json({ error: `Path invalido: ${path}` }, { status: 400 });
      }
      current = current[key];
    }

    const lastKey = isNaN(Number(parts[parts.length - 1]))
      ? parts[parts.length - 1]
      : Number(parts[parts.length - 1]);
    current[lastKey] = value;

    await saveGeneration(generation);

    return NextResponse.json({ success: true, script: generation.script });
  } catch (err) {
    console.error("Edit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error editando" },
      { status: 500 }
    );
  }
}
