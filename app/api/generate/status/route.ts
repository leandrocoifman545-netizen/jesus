import { NextRequest, NextResponse } from "next/server";
import {
  updateGenerationStatus,
  getGeneration,
  saveGeneration,
  type GenerationStatus,
  type WinnerMetrics,
} from "@/lib/storage/local";

export async function PATCH(req: NextRequest) {
  try {
    const { generationId, status, metrics, sessionNotes, title } = await req.json();

    if (!generationId) {
      return NextResponse.json({ error: "Missing generationId" }, { status: 400 });
    }

    // If only updating metrics/notes/title (no status change)
    if (!status && (metrics || sessionNotes !== undefined || title !== undefined)) {
      const gen = await getGeneration(generationId);
      if (!gen) {
        return NextResponse.json({ error: "Generation not found" }, { status: 404 });
      }
      if (metrics) gen.metrics = { ...gen.metrics, ...metrics };
      if (sessionNotes !== undefined) gen.sessionNotes = sessionNotes;
      if (title !== undefined) gen.title = title;
      await saveGeneration(gen);
      return NextResponse.json({ success: true, status: gen.status, metrics: gen.metrics, sessionNotes: gen.sessionNotes, title: gen.title });
    }

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const validStatuses: GenerationStatus[] = ["draft", "recorded", "winner"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const gen = await updateGenerationStatus(generationId, status);
    if (!gen) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    // Also save metrics/notes/title if provided alongside status
    if (metrics) gen.metrics = { ...gen.metrics, ...metrics };
    if (sessionNotes !== undefined) gen.sessionNotes = sessionNotes;
    if (title !== undefined) gen.title = title;
    if (metrics || sessionNotes !== undefined || title !== undefined) {
      await saveGeneration(gen);
    }

    return NextResponse.json({ success: true, status: gen.status, metrics: gen.metrics, sessionNotes: gen.sessionNotes });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
