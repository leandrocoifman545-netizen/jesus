import { NextRequest, NextResponse } from "next/server";
import { generateScript, type BriefInput } from "@/lib/ai/generate";
import { saveBrief, saveGeneration, getProject, getProjectBrandText } from "@/lib/storage/local";
import { generateAutoTitle } from "@/lib/auto-title";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let productDescription = body.productDescription;
    let targetAudience = body.targetAudience;
    let brandTone = body.brandTone;
    let brandDocument: string | undefined;
    let generationRules: string | undefined;
    const projectId: string | undefined = body.projectId;

    // If projectId provided, load project data as defaults
    if (projectId) {
      const project = await getProject(projectId);
      if (!project) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
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
      platform: body.platform || undefined,
      hookCount: Math.min(Math.max(body.hookCount || 5, 1), 20),
      additionalNotes: body.additionalNotes,
      references: body.references,
      brandDocument,
      generationRules,
    };

    if (!brief.productDescription || !brief.targetAudience) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: productDescription, targetAudience" },
        { status: 400 }
      );
    }

    const briefId = crypto.randomUUID();
    const { generationRules: _rules, ...briefForStorage } = brief;
    await saveBrief({
      id: briefId,
      projectId,
      ...briefForStorage,
      createdAt: new Date().toISOString(),
    });

    const script = await generateScript(brief);

    const generationId = crypto.randomUUID();
    const title = generateAutoTitle(script, brief.additionalNotes);
    await saveGeneration({
      id: generationId,
      briefId,
      projectId,
      title,
      script,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: generationId,
      briefId,
      projectId,
      title,
      script,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating script:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
