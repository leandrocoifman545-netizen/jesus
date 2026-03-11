import { NextRequest, NextResponse } from "next/server";
import { getPlan, savePlan, deletePlan, linkGenerationToPlan } from "@/lib/storage/local";

// Get a single plan
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Update a plan (partial update)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const body = await req.json();

    // Link a generation to a slot
    if (body.linkSlot !== undefined && body.generationId) {
      const updated = await linkGenerationToPlan(id, body.linkSlot, body.generationId);
      if (!updated) {
        return NextResponse.json({ error: "Slot inválido" }, { status: 400 });
      }
      return NextResponse.json(updated);
    }

    // General updates
    if (body.name) plan.name = body.name;
    if (body.notes !== undefined) plan.notes = body.notes;
    if (body.recordingOrder) plan.recordingOrder = body.recordingOrder;
    if (body.slots) plan.slots = body.slots;

    await savePlan(plan);
    return NextResponse.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Delete a plan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deletePlan(id);
    if (!deleted) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
