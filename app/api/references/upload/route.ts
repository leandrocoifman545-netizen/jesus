import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, analyzeTranscript } from "@/lib/ai/generate";
import { saveReference } from "@/lib/storage/local";
import crypto from "crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "audio/mpeg": "audio/mpeg",
  "audio/mp3": "audio/mpeg",
  "audio/mp4": "audio/mp4",
  "audio/m4a": "audio/mp4",
  "audio/x-m4a": "audio/mp4",
  "audio/wav": "audio/wav",
  "audio/webm": "audio/webm",
  "audio/ogg": "audio/ogg",
};

const MAX_SIZE = 200 * 1024 * 1024; // 200MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibio ningun archivo" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Falta el titulo" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo supera los 200MB" }, { status: 400 });
    }

    const mimeType = ALLOWED_TYPES[file.type];
    if (!mimeType) {
      return NextResponse.json(
        { error: `Formato no soportado: ${file.type}. Usa MP3, M4A, WAV, WebM u OGG.` },
        { status: 400 }
      );
    }

    const groqTier = formData.get("groqTier") as string | null;
    const forcePaid = groqTier === "paid";

    const buffer = Buffer.from(await file.arrayBuffer());

    const transcript = await transcribeAudio(buffer, mimeType, forcePaid);

    if (!transcript || transcript.length < 10) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del audio. Asegurate de que el archivo tiene voz clara." },
        { status: 422 }
      );
    }

    const analysis = await analyzeTranscript(transcript);

    const folder = (formData.get("folder") as string) || "individuales";
    const folderLabel = formData.get("folderLabel") as string | undefined;

    const ref = {
      id: crypto.randomUUID(),
      title,
      transcript,
      analysis,
      folder,
      folderLabel: folderLabel || undefined,
      createdAt: new Date().toISOString(),
    };

    await saveReference(ref);

    return NextResponse.json(ref);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error processing audio upload:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
