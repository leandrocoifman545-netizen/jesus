import { NextRequest, NextResponse } from "next/server";
import { deleteReferencesByFolder } from "@/lib/storage/local";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params;
  const decodedFolder = decodeURIComponent(folder);
  const count = await deleteReferencesByFolder(decodedFolder);
  return NextResponse.json({ ok: true, deleted: count });
}
