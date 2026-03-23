import { NextRequest, NextResponse } from "next/server";
import { getGeneration, saveGeneration } from "@/lib/storage/local";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId, path, value } = body as {
      generationId: string;
      path: string; // e.g. "hooks.0.script_text", "development.sections.1.script_text", "development.sections.0.ipad_directions"
      value: string | string[];
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

    // Sanitize path to prevent prototype pollution
    const FORBIDDEN_KEYS = ["__proto__", "constructor", "prototype"];
    const parts = path.split(".");
    if (parts.some((p) => FORBIDDEN_KEYS.includes(p))) {
      return NextResponse.json({ error: "Path no permitido" }, { status: 400 });
    }

    // Determine target object: longform paths navigate generation.longform,
    // all other paths navigate generation.script
    const isLongform = path.startsWith("longform.");
    const navigablePath = isLongform ? path.slice("longform.".length) : path;
    const navParts = navigablePath.split(".");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = isLongform ? (generation as any).longform : (generation.script as any);

    if (!target) {
      return NextResponse.json(
        { error: isLongform ? "No hay longform en esta generacion" : "No hay script en esta generacion" },
        { status: 400 }
      );
    }

    let current = target;

    for (let i = 0; i < navParts.length - 1; i++) {
      const key = isNaN(Number(navParts[i])) ? navParts[i] : Number(navParts[i]);
      if (current[key] === undefined) {
        return NextResponse.json({ error: `Path invalido: ${path}` }, { status: 400 });
      }
      current = current[key];
    }

    const lastKey = isNaN(Number(navParts[navParts.length - 1]))
      ? navParts[navParts.length - 1]
      : Number(navParts[navParts.length - 1]);
    // Empty string on status fields means "remove"
    if (value === "" && String(lastKey).endsWith("status")) {
      delete current[lastKey];
    } else {
      current[lastKey] = value;
    }

    await saveGeneration(generation);

    return NextResponse.json({
      success: true,
      script: generation.script,
      longform: (generation as any).longform,
    });
  } catch (err) {
    console.error("Edit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error editando" },
      { status: 500 }
    );
  }
}
