import { NextRequest, NextResponse } from "next/server";
import { getProject, deleteProject, saveProject, type BrandDoc } from "@/lib/storage/local";
import { extractPDFText } from "@/lib/ai/generate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  return NextResponse.json(project);
}

async function extractFileContent(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return await extractPDFText(buffer);
  }
  return buffer.toString("utf-8").trim();
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  try {
    const formData = await req.formData();
    const clientName = formData.get("clientName") as string | null;
    const productDescription = formData.get("productDescription") as string | null;
    const targetAudience = formData.get("targetAudience") as string | null;
    const brandTone = formData.get("brandTone") as string | null;
    const newFiles = formData.getAll("brandDocuments") as File[];
    const removeDocsJson = formData.get("removeDocs") as string | null;

    if (clientName) project.clientName = clientName;
    if (productDescription) project.productDescription = productDescription;
    if (targetAudience) project.targetAudience = targetAudience;
    if (brandTone) project.brandTone = brandTone;

    // Migrate legacy single brandDocument to brandDocuments array
    if (project.brandDocument && !project.brandDocuments) {
      project.brandDocuments = [{ name: "Documento de marca", content: project.brandDocument }];
      delete project.brandDocument;
    }

    // Remove specific docs by name
    if (removeDocsJson) {
      try {
        const removeNames: string[] = JSON.parse(removeDocsJson);
        if (project.brandDocuments) {
          project.brandDocuments = project.brandDocuments.filter(
            (d) => !removeNames.includes(d.name)
          );
        }
      } catch {
        return NextResponse.json({ error: "JSON inválido en removeDocs" }, { status: 400 });
      }
    }

    // Add new files
    for (const file of newFiles) {
      if (file && file.size > 0) {
        const content = await extractFileContent(file);
        if (content) {
          if (!project.brandDocuments) project.brandDocuments = [];
          project.brandDocuments.push({ name: file.name, content });
        }
      }
    }

    // Clean up empty array
    if (project.brandDocuments && project.brandDocuments.length === 0) {
      project.brandDocuments = undefined;
    }

    await saveProject(project);
    return NextResponse.json(project);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await deleteProject(id);
  if (!deleted) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
