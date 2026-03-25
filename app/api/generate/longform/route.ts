import { NextRequest, NextResponse } from "next/server";
import { generateLongformStream, type BriefInput } from "@/lib/ai/generate";
import { saveGeneration, getGeneration, getProject, getProjectBrandText } from "@/lib/storage/local";
import crypto from "crypto";

// PUT: Duplicate a longform generation
export async function PUT(req: NextRequest) {
  try {
    const { sourceGenerationId } = await req.json();
    if (!sourceGenerationId) {
      return NextResponse.json({ error: "Falta sourceGenerationId" }, { status: 400 });
    }
    const source = await getGeneration(sourceGenerationId);
    if (!source || source.contentType !== "longform") {
      return NextResponse.json({ error: "Generación no encontrada" }, { status: 404 });
    }
    const newId = crypto.randomUUID();
    await saveGeneration({
      ...source,
      id: newId,
      briefId: newId,
      title: `${source.title || "Video"} (copia)`,
      status: "draft",
      metrics: undefined,
      sessionNotes: undefined,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ generationId: newId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error duplicando" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let productDescription = body.productDescription;
  let targetAudience = body.targetAudience;
  let brandTone = body.brandTone;
  let brandDocument: string | undefined;
  let generationRules: string | undefined;
  const projectId: string | undefined = body.projectId;

  if (projectId) {
    const project = await getProject(projectId);
    if (!project) {
      return new Response(
        `data: ${JSON.stringify({ type: "error", error: "Proyecto no encontrado" })}\n\n`,
        { status: 404, headers: { "Content-Type": "text/event-stream" } }
      );
    }
    productDescription = productDescription || project.productDescription;
    targetAudience = targetAudience || project.targetAudience;
    brandTone = brandTone || project.brandTone;
    brandDocument = getProjectBrandText(project);
    generationRules = project.generationRules;
  }

  const brief: BriefInput = {
    productDescription,
    targetAudience,
    brandTone: brandTone || undefined,
    hookCount: 1, // long-form uses single hook
    additionalNotes: body.additionalNotes,
    brandDocument,
    generationRules,
    projectId,
    contentType: "longform",
    outputMode: body.outputMode || "full_script",
    targetDurationMinutes: Math.min(Math.max(body.targetDurationMinutes || 10, 5), 30),
    youtubeReferences: body.youtubeReferences,
  };

  if (!brief.productDescription || !brief.targetAudience) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", error: "Faltan campos requeridos" })}\n\n`,
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: "start" });

        const result = await generateLongformStream(brief, (chunk) => {
          send({ type: "chunk", text: chunk });
        });

        const { longform, validation } = result;

        // Log validation issues (non-blocking — we still save and return)
        if (validation.issues.length > 0) {
          console.log(`[longform-validate] ${validation.issues.length} issues:`, validation.issues);
        }

        const generationId = crypto.randomUUID();
        await saveGeneration({
          id: generationId,
          briefId: generationId, // longform doesn't use separate brief
          projectId,
          title: longform.title || body.additionalNotes?.slice(0, 60) || "Video YouTube",
          contentType: "longform",
          longform,
          script: {
            platform_adaptation: {
              platform: "YouTube",
              recommended_duration_seconds: longform.total_duration_seconds,
              content_style: longform.framework,
              key_considerations: longform.production_notes,
            },
            hooks: [{
              variant_number: 1,
              hook_type: "situacion_especifica" as const,
              script_text: longform.hook.script_text,
              timing_seconds: longform.hook.estimated_duration_seconds,
            }],
            development: {
              framework_used: longform.framework,
              emotional_arc: longform.emotional_arc,
              sections: longform.chapters.map((ch) => ({
                section_name: `Cap ${ch.number}: ${ch.title}`,
                is_rehook: false,
                script_text: ch.content,
                timing_seconds: ch.estimated_duration_seconds,
              })),
            },
            cta: {
              verbal_cta: longform.cta.primary_text,
              reason_why: longform.cta.end_screen_notes || "",
              timing_seconds: 15,
              cta_type: "custom" as const,
            },
            ingredients_used: (longform.ingredients_used || []).map((ing) => ({
              category: ing.category,
              ingredient_number: ing.ingredient_number,
              ingredient_name: ing.ingredient_name,
            })),
            model_sale_type: "custom",
            body_type: longform.framework || "longform",
            angle_family: longform.angle_family || "contenido",
            avatar: longform.avatar,
            awareness_level: longform.awareness_level,
            niche: longform.niche,
            total_duration_seconds: longform.total_duration_seconds,
            word_count: longform.word_count,
          },
          createdAt: new Date().toISOString(),
        });

        send({
          type: "done",
          generationId,
          title: longform.title,
          longform,
          validation: validation.issues.length > 0 ? validation : undefined,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
