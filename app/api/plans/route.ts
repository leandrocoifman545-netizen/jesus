import { NextRequest, NextResponse } from "next/server";
import { savePlan, listPlans, type StoredPlan } from "@/lib/storage/local";
import { randomUUID } from "crypto";

// List all plans
export async function GET() {
  try {
    const plans = await listPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Create a new plan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, weekOf, slots, visualFormats, recordingOrder, notes, projectId } = body;

    if (!name || !weekOf || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: "Faltan campos: name, weekOf, slots" },
        { status: 400 }
      );
    }

    const plan: StoredPlan = {
      id: randomUUID(),
      projectId,
      name,
      weekOf,
      slots: slots.map((s: Partial<StoredPlan["slots"][0]>, i: number) => ({
        index: i,
        angle: s.angle || "",
        segment: s.segment || "",
        funnel: s.funnel || "",
        bodyType: s.bodyType || "",
        visualFormat: s.visualFormat || "",
        nicheIdea: s.nicheIdea,
        leadTypes: s.leadTypes || [],
        justification: s.justification || "",
        generationId: s.generationId,
        status: s.status || "pending",
      })),
      visualFormats: visualFormats || [],
      recordingOrder,
      notes,
      createdAt: new Date().toISOString(),
    };

    await savePlan(plan);
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
