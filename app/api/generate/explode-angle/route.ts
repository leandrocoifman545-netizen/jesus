import { NextRequest, NextResponse } from "next/server";
import { explodeAngle } from "@/lib/ai/generate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { angleFamily, angleSpecific, niche, avatar } = body;

    if (!angleFamily || !niche) {
      return NextResponse.json(
        { error: "Faltan campos: angleFamily, niche" },
        { status: 400 }
      );
    }

    const result = await explodeAngle(
      angleFamily,
      angleSpecific || "",
      niche,
      avatar || "martin",
    );

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error exploding angle:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
