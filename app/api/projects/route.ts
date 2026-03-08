import { NextRequest, NextResponse } from "next/server";
import { saveProject, listProjects, type BrandDoc } from "@/lib/storage/local";
import { extractPDFText } from "@/lib/ai/generate";
import crypto from "crypto";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json(projects);
}

async function extractFileContent(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return await extractPDFText(buffer);
  }
  return buffer.toString("utf-8").trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const clientName = formData.get("clientName") as string | null;
    const productDescription = formData.get("productDescription") as string | null;
    const targetAudience = formData.get("targetAudience") as string | null;
    const brandTone = formData.get("brandTone") as string | null;
    const files = formData.getAll("brandDocuments") as File[];

    if (!clientName || !productDescription || !targetAudience || !brandTone) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: clientName, productDescription, targetAudience, brandTone" },
        { status: 400 }
      );
    }

    const brandDocuments: BrandDoc[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const content = await extractFileContent(file);
        if (content) {
          brandDocuments.push({ name: file.name, content });
        }
      }
    }

    const project = {
      id: crypto.randomUUID(),
      clientName,
      productDescription,
      targetAudience,
      brandTone,
      brandDocuments: brandDocuments.length > 0 ? brandDocuments : undefined,
      createdAt: new Date().toISOString(),
    };

    await saveProject(project);
    return NextResponse.json(project);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error creating project:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
