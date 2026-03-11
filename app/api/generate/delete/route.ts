import { NextRequest, NextResponse } from "next/server";
import { deleteGeneration } from "@/lib/storage/local";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing ids array" }, { status: 400 });
    }

    let deleted = 0;
    for (const id of ids) {
      const ok = await deleteGeneration(id);
      if (ok) deleted++;
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
