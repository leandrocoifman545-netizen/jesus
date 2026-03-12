import { NextResponse } from "next/server";
import { listGenerations } from "@/lib/storage/local";

export async function GET() {
  const generations = await listGenerations();

  // Return lightweight search index
  const items = generations.map((g) => ({
    id: g.id,
    title: g.title || "Guion sin título",
    status: g.status || "draft",
    hookTexts: g.script.hooks?.map((h) => h.script_text.slice(0, 80)) || [],
    framework: g.script.development?.framework_used || "",
    batch: g.batch || null,
    createdAt: g.createdAt,
  }));

  return NextResponse.json(items);
}
