import { NextRequest, NextResponse } from "next/server";
import { regenerateSection, regenerateCTA, regenerateHook, regenerateLongformChapter } from "@/lib/ai/generate";
import type { BriefInput } from "@/lib/ai/generate";
import { getGeneration, getBrief, saveGeneration, getProject } from "@/lib/storage/local";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId, target, index } = body as {
      generationId: string;
      target: "section" | "cta" | "hook" | "chapter";
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

    // Load project-specific generation rules
    let generationRules: string | undefined;
    if (generation.projectId) {
      const project = await getProject(generation.projectId);
      if (project?.generationRules) generationRules = project.generationRules;
    }

    // Longform chapter regeneration doesn't need the original brief
    if (target === "chapter") {
      if (generation.contentType !== "longform" || !generation.longform) {
        return NextResponse.json(
          { error: "Solo se pueden regenerar capítulos en generaciones longform" },
          { status: 400 }
        );
      }
      if (index === undefined || index < 0 || index >= generation.longform.chapters.length) {
        return NextResponse.json({ error: "Indice de capitulo invalido" }, { status: 400 });
      }

      const longformBrief: BriefInput = {
        productDescription: "",
        targetAudience: "",
        hookCount: 1,
        contentType: "longform",
        outputMode: generation.longform.output_mode,
        generationRules,
      };

      const newChapter = await regenerateLongformChapter(longformBrief, generation.longform, index);
      generation.longform.chapters[index] = newChapter;

      // Update dummy script section for backward compat
      if (generation.script.development.sections[index]) {
        generation.script.development.sections[index] = {
          ...generation.script.development.sections[index],
          section_name: newChapter.title,
          script_text: newChapter.content,
        };
      }

      await saveGeneration(generation);
      return NextResponse.json({ target, index, data: newChapter, longform: generation.longform });
    }

    // For shortform targets, we need the brief
    const brief = await getBrief(generation.briefId);
    if (!brief) {
      return NextResponse.json({ error: "Brief no encontrado" }, { status: 404 });
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

    return NextResponse.json({ error: "Target invalido. Usa: section, cta, hook, chapter" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error regenerating:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
