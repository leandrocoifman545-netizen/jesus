import { NextRequest, NextResponse } from "next/server";
import { getPlan, getGeneration, type StoredGeneration } from "@/lib/storage/local";
import JSZip from "jszip";

function buildTeleprompterDoc(slots: { slot: { index: number }; gen: StoredGeneration }[]): string {
  let doc = "";

  // --- PART 1: All CTAs first (record once, reuse all week) ---
  doc += `========================================\n`;
  doc += `  CTAs — GRABAR PRIMERO\n`;
  doc += `  (se usan para todos los guiones)\n`;
  doc += `========================================\n\n`;
  for (let i = 0; i < slots.length; i++) {
    const { gen } = slots[i];
    doc += `CTA ${i + 1}:\n`;
    doc += `${gen.script.cta?.verbal_cta || "[CTA pendiente]"}\n\n`;
  }

  // --- PART 2: Each script = hooks + body (read straight through) ---
  doc += `\n========================================\n`;
  doc += `  GUIONES — LEER DE CORRIDO\n`;
  doc += `  (hooks + cuerpo por guion)\n`;
  doc += `========================================\n\n`;
  for (let i = 0; i < slots.length; i++) {
    const { gen } = slots[i];
    const vf = gen.script.visual_format;

    doc += `----------------------------------------\n`;
    doc += `  GUION ${i + 1}: ${gen.title || "Sin título"}\n`;
    if (vf) doc += `  Formato: ${vf.format_name}\n`;
    doc += `----------------------------------------\n\n`;

    // Hooks/leads for this script
    for (const hook of gen.script.hooks) {
      doc += `[Lead ${hook.variant_number}]\n`;
      doc += `${hook.script_text}\n\n`;
    }

    // Body for this script
    doc += `[CUERPO]\n`;
    for (const section of gen.script.development.sections) {
      doc += `${section.script_text}\n\n`;
    }
  }

  return doc;
}

function formatScriptDoc(gen: StoredGeneration, slotIndex: number): string {
  const s = gen.script;
  const vf = s.visual_format;

  let doc = `# Guion ${slotIndex + 1}: ${gen.title || "Sin título"}\n\n`;
  doc += `- **Formato:** ${s.platform_adaptation.platform}\n`;
  doc += `- **Framework:** ${s.development.framework_used}\n`;
  doc += `- **Duración:** ${s.total_duration_seconds}s | ${s.word_count} palabras\n`;

  if (vf) {
    doc += `\n## Formato Visual: ${vf.format_name}\n`;
    doc += `- **Dificultad:** ${vf.difficulty_level}/5\n`;
    doc += `- **Setup:** ${vf.setup_instructions}\n`;
    doc += `- **Notas de grabación:** ${vf.recording_notes}\n`;
  }

  doc += `\n## Leads (${s.hooks.length} variantes)\n`;
  for (const hook of s.hooks) {
    doc += `\n### Lead ${hook.variant_number} (${hook.hook_type})\n`;
    doc += `${hook.script_text}\n`;
  }

  doc += `\n## Cuerpo\n`;
  for (const section of s.development.sections) {
    const rehookTag = section.is_rehook ? " [RE-HOOK]" : "";
    doc += `\n### ${section.section_name}${rehookTag} (${section.timing_seconds}s)\n`;
    doc += `${section.script_text}\n`;
  }

  doc += `\n## CTA\n`;
  doc += `**${s.cta?.verbal_cta || "[CTA pendiente]"}**\n`;
  doc += `- Tipo: ${s.cta?.cta_type || "custom"}\n`;
  doc += `- Razón: ${s.cta?.reason_why || ""}\n`;

  if (gen.sessionNotes) {
    doc += `\n## Notas de Sesión\n${gen.sessionNotes}\n`;
  }

  return doc;
}

// GET /api/export/weekly?planId=xxx
export async function GET(req: NextRequest) {
  try {
    const planId = req.nextUrl.searchParams.get("planId");
    if (!planId) {
      return NextResponse.json({ error: "Falta planId" }, { status: 400 });
    }

    const plan = await getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const zip = new JSZip();

    // Load all generated scripts
    const generatedSlots: { slot: typeof plan.slots[0]; gen: StoredGeneration }[] = [];
    for (const slot of plan.slots) {
      if (slot.generationId) {
        const gen = await getGeneration(slot.generationId);
        if (gen) generatedSlots.push({ slot, gen });
      }
    }

    if (generatedSlots.length === 0) {
      return NextResponse.json(
        { error: "No hay guiones generados en este plan" },
        { status: 400 }
      );
    }

    // 1. Summary document
    let summary = `# ${plan.name}\n`;
    summary += `**Semana del:** ${plan.weekOf}\n`;
    summary += `**Formatos visuales:** ${plan.visualFormats.join(", ")}\n`;
    summary += `**Guiones generados:** ${generatedSlots.length}/${plan.slots.length}\n\n`;

    // Recording order
    const order = plan.recordingOrder || generatedSlots.map((_, i) => i);
    summary += `## Orden de Grabación\n\n`;
    for (let i = 0; i < order.length; i++) {
      const idx = order[i];
      const item = generatedSlots[idx];
      if (!item) continue;
      const { gen } = item;
      const vf = gen.script.visual_format;
      summary += `${i + 1}. **${gen.title || `Guion ${idx + 1}`}**`;
      if (vf) summary += ` — ${vf.format_name}`;
      summary += ` (${gen.script.total_duration_seconds}s)\n`;
    }

    summary += `\n## Detalle por Guion\n\n`;
    for (const { slot, gen } of generatedSlots) {
      summary += `### ${slot.index + 1}. ${gen.title || "Sin título"}\n`;
      summary += `- Ángulo: ${slot.angle} | Segmento: ${slot.segment} | Funnel: ${slot.funnel}\n`;
      summary += `- Cuerpo: ${slot.bodyType} | Formato: ${slot.visualFormat}\n`;
      if (slot.nicheIdea) summary += `- Idea de nicho: ${slot.nicheIdea}\n`;
      summary += `- Leads: ${slot.leadTypes.join(", ")}\n`;
      summary += `- CTA: ${gen.script.cta?.verbal_cta || "[CTA pendiente]"}\n\n`;
    }

    zip.file("00-RESUMEN.md", summary);

    // 2. Individual script files
    const scriptsFolder = zip.folder("guiones")!;
    for (let i = 0; i < generatedSlots.length; i++) {
      const { gen } = generatedSlots[i];
      const filename = `${String(i + 1).padStart(2, "0")}-${(gen.title || "guion").replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").replace(/\s+/g, "-").slice(0, 50)}.md`;
      scriptsFolder.file(filename, formatScriptDoc(gen, i));
    }

    // 3. Teleprompter — single file organized for recording session
    // Order: CTAs first → all hooks → all bodies
    zip.file("TELEPROMPTER.txt", buildTeleprompterDoc(generatedSlots));

    // Generate ZIP
    const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

    const safeName = plan.name.replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").replace(/\s+/g, "-");

    return new NextResponse(zipArrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}.zip"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
