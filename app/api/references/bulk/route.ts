import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscript } from "@/lib/ai/generate";
import { saveReference } from "@/lib/storage/local";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, folder, folderLabel } = body as {
      items: { title: string; transcript: string }[];
      folder?: string;
      folderLabel?: string;
    };

    // Generate a folder ID for this bulk upload
    const bulkFolder = folder || `masiva-${Date.now()}`;
    const bulkFolderLabel = folderLabel || `Carga ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de items con title y transcript" },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        { error: "Maximo 100 referencias a la vez" },
        { status: 400 }
      );
    }

    const results: { title: string; ok: boolean; error?: string }[] = [];

    // Process in parallel batches of 5
    const BATCH_SIZE = 5;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (item) => {
          if (!item.title || !item.transcript) {
            return { title: item.title || "(sin titulo)", ok: false, error: "Falta titulo o transcripcion" } as const;
          }

          try {
            const analysis = await analyzeTranscript(item.transcript);
            const ref = {
              id: crypto.randomUUID(),
              title: item.title,
              transcript: item.transcript,
              analysis,
              folder: bulkFolder,
              folderLabel: bulkFolderLabel,
              createdAt: new Date().toISOString(),
            };
            await saveReference(ref);
            return { title: item.title, ok: true } as const;
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Error desconocido";
            return { title: item.title, ok: false, error: msg } as const;
          }
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          results.push({ title: "(error)", ok: false, error: "Error inesperado en batch" });
        }
      }
    }

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    return NextResponse.json({ succeeded, failed, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
