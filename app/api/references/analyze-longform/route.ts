import { NextRequest, NextResponse } from "next/server";
import { analyzeLongformReference } from "@/lib/ai/generate";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Se requiere una transcripción" },
        { status: 400 }
      );
    }

    const analysis = await analyzeLongformReference(transcript);
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
