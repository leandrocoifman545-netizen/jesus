import { NextRequest } from "next/server";
import { generateScriptStream, type BriefInput } from "@/lib/ai/generate";
import { saveBrief, saveGeneration, getProject, getProjectBrandText } from "@/lib/storage/local";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let productDescription = body.productDescription;
  let targetAudience = body.targetAudience;
  let brandTone = body.brandTone;
  let brandDocument: string | undefined;
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
  }

  const brief: BriefInput = {
    productDescription,
    targetAudience,
    brandTone: brandTone || undefined,
    platform: body.platform || undefined,
    hookCount: Math.min(Math.max(body.hookCount || 5, 1), 20),
    additionalNotes: body.additionalNotes,
    references: body.references,
    brandDocument,
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
        const briefId = crypto.randomUUID();
        await saveBrief({
          id: briefId,
          projectId,
          ...brief,
          createdAt: new Date().toISOString(),
        });

        send({ type: "start" });

        const script = await generateScriptStream(brief, (chunk) => {
          send({ type: "chunk", text: chunk });
        });

        const generationId = crypto.randomUUID();
        await saveGeneration({
          id: generationId,
          briefId,
          projectId,
          script,
          createdAt: new Date().toISOString(),
        });

        send({ type: "done", generationId, script });
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
