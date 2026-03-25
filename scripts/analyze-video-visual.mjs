#!/usr/bin/env node

/**
 * Análisis visual de videos con Gemini Flash (gratis).
 *
 * Uso:
 *   node scripts/analyze-video-visual.mjs <video_path_or_url> [--frames N]
 *
 * Pipeline:
 *   1. Si es URL → descarga con yt-dlp
 *   2. Extrae N frames con ffmpeg (default: 1 cada 3 segundos)
 *   3. Envía frames a Gemini Flash → descripción visual
 *   4. Guarda análisis en .data/video-analysis/
 *
 * Solo analiza lo VISUAL: formatos, encuadres, textos en pantalla,
 * transiciones, colores, movimientos de cámara.
 * Audio se maneja aparte con Whisper.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY no está en .env.local");
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const OUTPUT_DIR = path.join(process.cwd(), ".data", "video-analysis");
const TEMP_DIR = path.join(process.cwd(), ".data", "video-analysis", "temp");

// Ensure directories exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith("--"));
const framesPerSec = args.includes("--frames")
  ? parseFloat(args[args.indexOf("--frames") + 1])
  : null; // null = auto (1 every 3 seconds)

if (!input) {
  console.log("Uso: node scripts/analyze-video-visual.mjs <video_o_url> [--frames N]");
  console.log("  --frames N  Extraer N frames por segundo (default: 1 cada 3s)");
  process.exit(1);
}

async function main() {
  const sessionId = randomUUID().slice(0, 8);
  const framesDir = path.join(TEMP_DIR, sessionId);
  fs.mkdirSync(framesDir, { recursive: true });

  let videoPath = input;
  let videoTitle = path.basename(input, path.extname(input));

  // Step 1: Download if URL
  if (input.startsWith("http")) {
    console.log("📥 Descargando video...");
    const downloadPath = path.join(TEMP_DIR, `${sessionId}.mp4`);
    try {
      // Try yt-dlp first
      execSync(`yt-dlp -f "best[height<=720]" -o "${downloadPath}" "${input}" 2>&1`, { stdio: "pipe" });
    } catch {
      // Fallback to direct download
      execSync(`curl -L -o "${downloadPath}" "${input}" 2>&1`, { stdio: "pipe" });
    }
    videoPath = downloadPath;

    // Get title from yt-dlp
    try {
      videoTitle = execSync(`yt-dlp --get-title "${input}" 2>/dev/null`, { encoding: "utf-8" }).trim();
    } catch {
      videoTitle = sessionId;
    }
    console.log(`  → ${videoTitle}`);
  }

  // Step 2: Get video duration
  const durationStr = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}" 2>/dev/null`,
    { encoding: "utf-8" }
  ).trim();
  const duration = parseFloat(durationStr);
  console.log(`⏱️  Duración: ${Math.round(duration)}s`);

  // Step 3: Extract frames
  const fps = framesPerSec || 1; // 1 frame per second by default
  console.log(`🎞️  Extrayendo frames (1 cada ${Math.round(1/fps)}s)...`);
  execSync(
    `ffmpeg -i "${videoPath}" -vf "fps=${fps}" -q:v 2 -f image2 "${framesDir}/frame_%04d.jpg" 2>/dev/null`,
    { stdio: "pipe" }
  );

  const frameFiles = fs.readdirSync(framesDir)
    .filter(f => f.endsWith(".jpg"))
    .sort();

  console.log(`  → ${frameFiles.length} frames extraídos`);

  if (frameFiles.length === 0) {
    console.error("❌ No se extrajeron frames");
    process.exit(1);
  }

  // Step 4: Send to Gemini Flash in batches
  // Gemini can handle multiple images. We send in batches of ~15 frames
  const BATCH_SIZE = 15;
  const batches = [];
  for (let i = 0; i < frameFiles.length; i += BATCH_SIZE) {
    batches.push(frameFiles.slice(i, i + BATCH_SIZE));
  }

  console.log(`🤖 Analizando con Gemini Flash (${batches.length} batch${batches.length > 1 ? "es" : ""})...`);

  const allAnalysis = [];

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const startFrame = batchIdx * BATCH_SIZE;
    const startTime = Math.round(startFrame * (1 / fps));
    const endTime = Math.round((startFrame + batch.length) * (1 / fps));

    // Build parts: images + prompt
    const parts = [];

    for (const frameFile of batch) {
      const framePath = path.join(framesDir, frameFile);
      const imageData = fs.readFileSync(framePath).toString("base64");
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageData,
        },
      });
    }

    parts.push({
      text: `Estás analizando ${batch.length} frames consecutivos (cada ~${Math.round(1/fps)}s) de un video de ads/contenido para Instagram/TikTok.
Timestamps aproximados: ${startTime}s a ${endTime}s.

Analizá SOLO lo VISUAL de cada frame. Para cada grupo de frames similares, describí:

1. **Formato visual**: Talking head / pantalla grabada / B-roll / texto sobre fondo / split screen / greenscreen / etc.
2. **Encuadre**: Primer plano / medio / general / cenital / etc.
3. **Textos en pantalla**: Qué dice exactamente el texto superpuesto (si hay).
4. **Elementos visuales**: Props, fondos, colores dominantes, overlays, stickers, emojis.
5. **Transiciones**: Corte seco / fade / zoom / swipe / etc.
6. **Movimiento de cámara**: Estática / paneo / seguimiento / etc.
7. **Iluminación**: Natural / ring light / dramática / etc.

Respondé en español. Sé específico y conciso. Agrupá frames similares.
Formato: lista de segmentos con timestamp aproximado.`,
    });

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`  ❌ Batch ${batchIdx + 1} falló: ${res.status} ${err.slice(0, 200)}`);
      continue;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    allAnalysis.push({ startTime, endTime, analysis: text });
    console.log(`  ✅ Batch ${batchIdx + 1}/${batches.length} (${startTime}s-${endTime}s)`);

    // Rate limit: small delay between batches
    if (batchIdx < batches.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Step 5: Save result
  const result = {
    id: sessionId,
    title: videoTitle,
    source: input,
    duration_seconds: Math.round(duration),
    total_frames: frameFiles.length,
    frame_interval_seconds: Math.round(1 / fps),
    analyzed_at: new Date().toISOString(),
    visual_analysis: allAnalysis,
  };

  const outputPath = path.join(OUTPUT_DIR, `${sessionId}-visual.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n💾 Guardado en: ${outputPath}`);

  // Cleanup temp frames
  fs.rmSync(framesDir, { recursive: true, force: true });
  if (input.startsWith("http")) {
    try { fs.unlinkSync(path.join(TEMP_DIR, `${sessionId}.mp4`)); } catch {}
  }

  // Print summary
  console.log(`\n📊 Resumen:`);
  console.log(`  Video: ${videoTitle}`);
  console.log(`  Duración: ${Math.round(duration)}s`);
  console.log(`  Frames analizados: ${frameFiles.length}`);
  console.log(`  Segmentos: ${allAnalysis.length}`);
  console.log(`\nPróximo paso: pasame el archivo ${outputPath} y lo analizo estratégicamente.`);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
