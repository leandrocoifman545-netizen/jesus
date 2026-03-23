import { NextRequest, NextResponse } from "next/server";
import { getStory, saveStory, deleteStory } from "@/lib/storage/local";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const story = await getStory(id);
    if (!story) {
      return NextResponse.json({ error: "Story no encontrada" }, { status: 404 });
    }
    return NextResponse.json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const story = await getStory(id);
    if (!story) {
      return NextResponse.json({ error: "Story no encontrada" }, { status: 404 });
    }

    const body = await req.json();

    if (body.title !== undefined) story.title = body.title;
    if (body.status !== undefined) story.status = body.status;
    if (body.notes !== undefined) story.notes = body.notes;
    if (body.slides !== undefined) {
      story.slides = body.slides;
      story.total_seconds = body.slides.reduce(
        (sum: number, s: { seconds: number }) => sum + s.seconds,
        0
      );
    }
    if (body.highlight_name !== undefined) story.highlight_name = body.highlight_name;

    await saveStory(story);
    return NextResponse.json(story);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteStory(id);
    if (!deleted) {
      return NextResponse.json({ error: "Story no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
