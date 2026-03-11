import { NextRequest, NextResponse } from "next/server";
import { generateMoreHooks } from "@/lib/ai/generate";
import { getGeneration, getBrief, saveGeneration, getProject } from "@/lib/storage/local";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId, count } = body;

    if (!generationId || !count) {
      return NextResponse.json(
        { error: "Faltan campos: generationId, count" },
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

    const newHooks = await generateMoreHooks(
      { ...brief, hookCount: count, generationRules },
      generation.script.hooks,
      count,
    );

    generation.script.hooks = [...generation.script.hooks, ...newHooks];
    await saveGeneration(generation);

    return NextResponse.json({
      newHooks,
      totalHooks: generation.script.hooks.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating more hooks:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
