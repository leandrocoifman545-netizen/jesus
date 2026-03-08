import { NextRequest, NextResponse } from "next/server";
import { deleteReference, getReference } from "@/lib/storage/local";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = await getReference(id);
  if (!ref) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(ref);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await deleteReference(id);
  if (!deleted) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
