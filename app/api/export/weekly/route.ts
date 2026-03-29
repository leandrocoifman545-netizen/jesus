import { NextRequest, NextResponse } from "next/server";
import { getPlan, getGeneration, type StoredGeneration } from "@/lib/storage/local";
import JSZip from "jszip";

function buildTeleprompterDoc(slots: { slot: { index: number }; gen: StoredGeneration }[]): string {
  let doc = "";

  // --- PART 1: All CTA blocks first (record once, reuse all week) ---
  doc += `========================================\n`;
  doc += `  CTAs — GRABAR PRIMERO\n`;
  doc += `  (se usan para todos los guiones)\n`;
  doc += `========================================\n\n`;

  // Collect unique CTA blocks across all generations
  const seenBlocks = new Set<string>();
  for (const { gen } of slots) {
    const blocks = (gen.script as unknown as Record<string, unknown>).cta_blocks as Array<{ channel: string; channel_label?: string; variant?: string; layers?: Record<string, string>; text?: string }> | undefined;
    if (blocks && blocks.length > 0) {
      for (const block of blocks) {
        const blockKey = `${block.channel}_${block.variant}`;
        if (seenBlocks.has(blockKey)) continue;
        seenBlocks.add(blockKey);

        const label = block.channel_label || block.channel || "CTA";
        doc += `--- ${label.toUpperCase()} (Variante ${block.variant || "?"}) ---\n\n`;

        if (block.layers) {
          const LAYER_LABELS: Record<string, string> = {
            oferta: "OFERTA", prueba: "PRUEBA", riesgo_cero: "RIESGO CERO",
            urgencia: "URGENCIA", orden_nlp: "ORDEN + NLP",
            orden_1: "ORDEN 1", orden_2: "CIERRE", cierre: "CIERRE",
          };
          for (const [key, val] of Object.entries(block.layers)) {
            if (!val) continue;
            doc += `[${LAYER_LABELS[key] || key.toUpperCase()}]\n`;
            doc += `${val}\n\n`;
          }
        } else if (block.text) {
          doc += `${block.text}\n\n`;
        }

        doc += `--- CORTE ---\n\n\n`;
      }
    } else if (gen.script.cta?.verbal_cta) {
      // Fallback for legacy scripts without cta_blocks
      const ctaKey = gen.script.cta.verbal_cta;
      if (!seenBlocks.has(ctaKey)) {
        seenBlocks.add(ctaKey);
        doc += `CTA:\n`;
        doc += `${gen.script.cta.verbal_cta}\n\n`;
        doc += `--- CORTE ---\n\n\n`;
      }
    }
  }

  // --- PART 2: Each script = hooks + body (read straight through) ---
  doc += `\n========================================\n`;
  doc += `  GUIONES — LEER DE CORRIDO\n`;
  doc += `  (leads + cuerpo por guion)\n`;
  doc += `========================================\n\n`;
  for (let i = 0; i < slots.length; i++) {
    const { gen } = slots[i];
    const vf = gen.script.visual_format;

    doc += `\n----------------------------------------\n`;
    doc += `  GUION ${i + 1}: ${gen.title || "Sin título"}\n`;
    if (vf) doc += `  Formato: ${typeof vf === 'string' ? vf : vf.format_name}\n`;
    doc += `----------------------------------------\n\n`;

    // Hooks/leads for this script
    for (const hook of gen.script.hooks) {
      doc += `[Lead ${hook.variant_number}]\n`;
      doc += `${hook.script_text}\n`;
      doc += `\n--- CORTE ---\n\n`;
    }

    // Body for this script - each section separated
    doc += `[CUERPO]\n`;
    for (const section of gen.script.development.sections) {
      doc += `${section.script_text}\n\n`;
    }

    // Offer bridge: solo en guiones legacy sin cta_blocks
    const hasBlocks = (gen.script as unknown as Record<string, unknown>).cta_blocks as unknown[] | undefined;
    if (gen.script.offer_bridge && (!hasBlocks || hasBlocks.length === 0)) {
      doc += `[PUENTE A LA OFERTA]\n`;
      doc += `${gen.script.offer_bridge.script_text}\n\n`;
    }

    // Transition
    const transText = (gen.script as unknown as Record<string, unknown>).transition_text;
    if (transText) {
      doc += `[TRANSICION]\n`;
      doc += `${transText}\n\n`;
    }

    doc += `--- CORTE ---\n\n`;
  }

  return doc;
}

function formatScriptDoc(gen: StoredGeneration, slotIndex: number): string {
  const s = gen.script;
  const vf = s.visual_format;
  const sc = s as unknown as Record<string, unknown>;

  let doc = `# Guion ${slotIndex + 1}: ${gen.title || "Sin título"}\n\n`;
  doc += `- **Formato:** ${s.platform_adaptation.platform}\n`;
  doc += `- **Framework:** ${s.development.framework_used}\n`;
  doc += `- **Duración:** ${s.total_duration_seconds}s | ${s.word_count} palabras\n`;
  doc += `- **Arco emocional:** ${s.development.emotional_arc}\n`;

  // Classification
  if (sc.angle_family || sc.body_type || sc.segment || sc.funnel_stage || sc.niche) {
    doc += `\n## Clasificacion\n`;
    if (sc.angle_family) doc += `- **Familia:** ${String(sc.angle_family).replace(/_/g, ' ')}\n`;
    if (sc.angle_specific) doc += `- **Angulo:** ${String(sc.angle_specific).replace(/_/g, ' ')}\n`;
    if (sc.body_type) doc += `- **Tipo de cuerpo:** ${String(sc.body_type).replace(/_/g, ' ')}\n`;
    if (sc.segment) doc += `- **Segmento:** ${sc.segment}\n`;
    if (sc.funnel_stage) doc += `- **Funnel:** ${sc.funnel_stage}\n`;
    if (sc.niche) doc += `- **Nicho:** ${sc.niche}\n`;
  }

  // Belief change
  const bc = sc.belief_change as { old_belief?: string; mechanism?: string; new_belief?: string } | undefined;
  if (bc) {
    doc += `\n## Cambio de Creencia\n`;
    if (bc.old_belief) doc += `- **Antes:** ${bc.old_belief}\n`;
    if (bc.mechanism) doc += `- **Mecanismo:** ${bc.mechanism}\n`;
    if (bc.new_belief) doc += `- **Después:** ${bc.new_belief}\n`;
  }

  if (vf) {
    doc += `\n## Formato Visual: ${vf.format_name}\n`;
    doc += `- **Dificultad:** ${vf.difficulty_level}/5\n`;
    doc += `- **Setup:** ${vf.setup_instructions}\n`;
    doc += `- **Notas de grabación:** ${vf.recording_notes}\n`;
  }

  // Ingredients
  const ingredients = sc.ingredients_used as Array<{ category: string; ingredient_number: number; ingredient_name: string }> | undefined;
  if (ingredients && ingredients.length > 0) {
    doc += `\n## Ingredientes Usados\n`;
    for (const ing of ingredients) {
      doc += `- ${ing.category}#${ing.ingredient_number} ${ing.ingredient_name}\n`;
    }
  }

  // Venta del modelo
  if (sc.model_sale_type) {
    doc += `\n## Venta del Modelo\n${String(sc.model_sale_type).replace(/_/g, ' ')}\n`;
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

  // Offer bridge: solo en guiones legacy sin cta_blocks
  const ctaBlocksForBridge = sc.cta_blocks as unknown[] | undefined;
  const bridge = s.offer_bridge;
  if (bridge && (!ctaBlocksForBridge || ctaBlocksForBridge.length === 0)) {
    const productLabel = bridge.product_type === "webinar_gratis" ? "Webinar Gratis" : bridge.product_type === "taller_5" ? "Taller $5" : "Custom";
    doc += `\n## Puente a la Oferta (${productLabel})\n`;
    doc += `${bridge.script_text}\n`;
  }

  // Transition text
  if (sc.transition_text) {
    doc += `\n## Transicion (Capa 1)\n`;
    doc += `${sc.transition_text}\n`;
  }

  doc += `\n## CTA\n`;
  doc += `**${s.cta?.verbal_cta || "[CTA pendiente]"}**\n`;
  doc += `- Tipo: ${s.cta?.cta_type || "custom"}\n`;
  doc += `- Razón: ${s.cta?.reason_why || ""}\n`;

  // 3 CTA Blocks (6 capas × 3 canales)
  const ctaBlocks = sc.cta_blocks as Array<{ channel_label: string; variant: string; layers: { oferta: string; prueba: string; riesgo_cero: string; urgencia: string; orden_nlp: string }; timing_seconds: number }> | undefined;
  if (ctaBlocks && ctaBlocks.length > 0) {
    doc += `\n## 3 Bloques CTA (Capas 2-6)\n`;
    doc += `*Se graban UNA vez por sesión y se combinan con cualquier body en edición.*\n`;
    for (const block of ctaBlocks) {
      doc += `\n### ${block.channel_label} (${block.variant}) — ~${block.timing_seconds}s\n`;
      doc += `- **[OFERTA]** ${block.layers.oferta}\n`;
      doc += `- **[PRUEBA]** ${block.layers.prueba}\n`;
      doc += `- **[RIESGO CERO]** ${block.layers.riesgo_cero}\n`;
      doc += `- **[URGENCIA]** ${block.layers.urgencia}\n`;
      doc += `- **[ORDEN+NLP]** ${block.layers.orden_nlp}\n`;
    }
  }

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
