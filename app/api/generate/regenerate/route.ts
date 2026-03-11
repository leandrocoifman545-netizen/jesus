import { NextRequest, NextResponse } from "next/server";
import { regenerateSection, regenerateCTA, regenerateHook } from "@/lib/ai/generate";
import { getGeneration, getBrief, saveGeneration, getProject } from "@/lib/storage/local";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId, target, index } = body as {
      generationId: string;
      target: "section" | "cta" | "hook";
      index?: number;
    };

    if (!generationId || !target) {
      return NextResponse.json(
        { error: "Faltan campos: generationId, target" },
        { status: 400 }
      );
    }

    const generation = await getGeneration(generationId);
    if (!generation) {
      return NextResponse.json({ error: "Generacion no encontrada" }, { status: 404 });
    }

    const brief = await getBrief(generation.briefId);
    if (!brief) {
      return NextResponse.json({ error: "Brief no encontrado" }, { status: 404 });
    }

    // Load project-specific generation rules
    let generationRules: string | undefined;
    if (generation.projectId) {
      const project = await getProject(generation.projectId);
      if (project?.generationRules) generationRules = project.generationRules;
    }

    const briefInput = { ...brief, hookCount: generation.script.hooks.length, generationRules };

    if (target === "section") {
      if (index === undefined || index < 0 || index >= generation.script.development.sections.length) {
        return NextResponse.json({ error: "Indice de seccion invalido" }, { status: 400 });
      }
      const newSection = await regenerateSection(briefInput, generation.script, index);
      generation.script.development.sections[index] = newSection;
      await saveGeneration(generation);
      return NextResponse.json({ target, index, data: newSection, script: generation.script });
    }

    if (target === "cta") {
      const newCTA = await regenerateCTA(briefInput, generation.script);
      generation.script.cta = newCTA;
      await saveGeneration(generation);
      return NextResponse.json({ target, data: newCTA, script: generation.script });
    }

    if (target === "hook") {
      if (index === undefined || index < 0 || index >= generation.script.hooks.length) {
        return NextResponse.json({ error: "Indice de hook invalido" }, { status: 400 });
      }
      const newHook = await regenerateHook(briefInput, generation.script, index);
      generation.script.hooks[index] = newHook;
      await saveGeneration(generation);
      return NextResponse.json({ target, index, data: newHook, script: generation.script });
    }

    return NextResponse.json({ error: "Target invalido. Usa: section, cta, hook" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error regenerating:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
