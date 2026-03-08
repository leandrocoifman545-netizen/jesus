import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscript } from "@/lib/ai/generate";
import { saveReference, listReferences } from "@/lib/storage/local";
import crypto from "crypto";

export async function GET() {
  const refs = await listReferences();
  return NextResponse.json(refs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, transcript } = body;

    if (!transcript || !title) {
      return NextResponse.json(
        { error: "Faltan campos: title, transcript" },
        { status: 400 }
      );
    }

    const analysis = await analyzeTranscript(transcript);

    const ref = {
      id: crypto.randomUUID(),
      title,
      transcript,
      analysis,
      folder: "individuales",
      createdAt: new Date().toISOString(),
    };

    await saveReference(ref);

    return NextResponse.json(ref);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error analyzing reference:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
