import { NextRequest, NextResponse } from "next/server";
import { getGeneration, saveGeneration, listGenerations } from "@/lib/storage/local";
import { randomUUID } from "crypto";

// Assign generations to a batch (new or existing)
export async function PATCH(req: NextRequest) {
  try {
    const { generationIds, batchId, batchName } = await req.json();

    if (!generationIds || !Array.isArray(generationIds) || generationIds.length === 0) {
      return NextResponse.json({ error: "Missing generationIds" }, { status: 400 });
    }

    // Create new batch or use existing
    const batch = batchId
      ? { id: batchId, name: batchName || batchId }
      : { id: randomUUID(), name: batchName || `Batch ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short" })}` };

    // If renaming an existing batch, update all generations with that batchId
    if (batchId && batchName) {
      const all = await listGenerations();
      const toRename = all.filter((g) => g.batch?.id === batchId && !generationIds.includes(g.id));
      for (const gen of toRename) {
        gen.batch = { ...gen.batch!, name: batchName };
        await saveGeneration(gen);
      }
    }

    // Assign batch to specified generations
    for (const id of generationIds) {
      const gen = await getGeneration(id);
      if (gen) {
        gen.batch = batch;
        await saveGeneration(gen);
      }
    }

    return NextResponse.json({ success: true, batch });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Remove generations from their batch
export async function DELETE(req: NextRequest) {
  try {
    const { generationIds } = await req.json();

    if (!generationIds || !Array.isArray(generationIds)) {
      return NextResponse.json({ error: "Missing generationIds" }, { status: 400 });
    }

    for (const id of generationIds) {
      const gen = await getGeneration(id);
      if (gen) {
        delete gen.batch;
        await saveGeneration(gen);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
