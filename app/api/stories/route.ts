import { NextResponse } from "next/server";
import { listStories } from "@/lib/storage/local";

export async function GET() {
  try {
    const stories = await listStories();
    return NextResponse.json({ stories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
