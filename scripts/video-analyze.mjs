#!/usr/bin/env node

/**
 * Analiza videos (reels, stories, ads) usando Gemini Vision.
 *
 * Uso:
 *   node scripts/video-analyze.mjs <video_path_or_url> [--raw] [--tipo ads|reels|stories]
 *
 * Ejemplos:
 *   node scripts/video-analyze.mjs ./mi-reel.mp4
 *   node scripts/video-analyze.mjs ./mi-reel.mp4 --tipo ads
 *   node scripts/video-analyze.mjs https://example.com/video.mp4
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ Falta GEMINI_API_KEY en .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

// --- Args ---
const args = process.argv.slice(2);
const rawFlag = args.includes('--raw');
const tipoIdx = args.indexOf('--tipo');
const tipo = tipoIdx !== -1 ? args[tipoIdx + 1] : 'reels';
const input = args.find(a => !a.startsWith('--') && a !== tipo);

if (!input) {
  console.error('Uso: node scripts/video-analyze.mjs <video_path_or_url> [--raw] [--tipo ads|reels|stories]');
  process.exit(1);
}

// --- Download if URL ---
async function resolveVideoPath(input) {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const tmpDir = path.resolve(process.cwd(), '.data', 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpPath = path.join(tmpDir, `video_${Date.now()}.mp4`);
    console.log(`⬇️  Descargando video...`);
    try {
      execSync(`curl -L -o "${tmpPath}" "${input}"`, { stdio: 'pipe', timeout: 120000 });
    } catch {
      console.error('❌ No se pudo descargar el video. Intentá descargarlo manualmente.');
      process.exit(1);
    }
    return { path: tmpPath, cleanup: true };
  }
  const resolved = path.resolve(input);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Archivo no encontrado: ${resolved}`);
    process.exit(1);
  }
  return { path: resolved, cleanup: false };
}

// --- Upload to Gemini ---
async function uploadVideo(filePath) {
  const mimeType = filePath.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
  const displayName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
  console.log(`📤 Subiendo ${displayName} (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

  const uploadResponse = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName,
  });

  let file = uploadResponse.file;
  let attempts = 0;
  while (file.state === FileState.PROCESSING && attempts < 60) {
    await new Promise(r => setTimeout(r, 2000));
    file = await fileManager.getFile(file.name);
    attempts++;
    if (attempts % 5 === 0) console.log(`⏳ Procesando... (${attempts * 2}s)`);
  }

  if (file.state === FileState.FAILED) {
    throw new Error(`Gemini no pudo procesar el video: ${JSON.stringify(file.error)}`);
  }
  if (file.state !== FileState.ACTIVE) {
    throw new Error(`Timeout esperando procesamiento del video (state: ${file.state})`);
  }

  console.log(`✅ Video listo (${file.videoMetadata?.videoDuration || 'duración desconocida'})`);
  return file;
}

// --- Prompts por tipo ---
const PROMPTS = {
  reels: `Sos un analista experto de video ads y reels virales. Analizá este video en detalle.

Respondé en español argentino con esta estructura:

## 1. HOOK VISUAL (primeros 1-3 segundos)
- Qué se ve exactamente en el primer frame
- Texto en pantalla (si hay)
- Movimiento de cámara
- Por qué detiene el scroll (o por qué no)

## 2. ESTRUCTURA NARRATIVA
- Cuántos "actos" o bloques tiene el video
- Transiciones entre bloques (corte seco, zoom, texto, etc)
- Ritmo de corte (rápido/lento, cada cuántos segundos cambia)

## 3. TEXTO EN PANTALLA
- Todo texto que aparece (transcribilo textual)
- Tipografía y estilo (bold, colores, posición)
- Sincronización texto-audio

## 4. ELEMENTOS VISUALES
- Escenario / setting
- Iluminación y color grading
- Props o elementos destacados
- Persona en cámara: qué hace, gestos, energía

## 5. AUDIO Y VOZ
- Tono de voz (energía, velocidad, emoción)
- Música de fondo (si hay)
- Efectos de sonido
- Lo que dice (transcripción resumida)

## 6. CTA Y CIERRE
- Cómo cierra el video
- Call to action (visual y verbal)
- Últimos frames

## 7. VEREDICTO
- Qué funciona bien y por qué
- Qué se podría mejorar
- Nivel de producción (1-10)
- Estimación de retención (alta/media/baja) y por qué`,

  ads: `Sos un media buyer y creativo de Meta Ads con 10 años de experiencia. Analizá este ad en video.

Respondé en español argentino con esta estructura:

## 1. HOOK (primeros 3 segundos)
- Visual: qué se ve, por qué frena el scroll
- Texto en pantalla (textual)
- Audio: qué se dice
- Clasificación del hook: curiosity / shock / pattern-interrupt / social-proof / question

## 2. ESTRUCTURA DE VENTA
- Qué framework usa (PAS, AIDA, micro-VSL, testimonial, demo, etc)
- Beats narrativos (listá cada bloque con duración aproximada)
- Transiciones entre bloques

## 3. COPY VISUAL (todo texto en pantalla)
- Transcribí todo el texto que aparece, en orden
- Tamaño, color, posición, duración de cada texto
- ¿El texto refuerza o reemplaza al audio?

## 4. PRODUCCIÓN
- Setting / escenario
- Cámara (estática, movimiento, selfie, profesional)
- Iluminación y color
- Nivel de producción (1-10)

## 5. PERSUASIÓN
- Objeciones que maneja
- Prueba social (si hay)
- Urgencia/escasez (si hay)
- Nivel de awareness del público target (Schwartz 1-5)

## 6. CTA
- CTA verbal (qué dice)
- CTA visual (qué se ve)
- Fricción percibida del CTA

## 7. VEREDICTO PARA REPLICAR
- Los 3 elementos más fuertes para copiar
- Los 2 errores más claros
- Score general (1-10)
- ¿Para qué tipo de producto/nicho funciona?`,

  stories: `Sos un experto en Instagram Stories de alto engagement. Analizá esta story/secuencia de stories.

Respondé en español argentino con esta estructura:

## 1. PRIMERA STORY (hook)
- Qué se ve en el primer frame
- Texto en pantalla
- ¿Genera curiosidad para pasar a la siguiente?

## 2. SECUENCIA NARRATIVA
- Cuántas stories tiene la secuencia (si podés detectar)
- Estructura: ¿educativa, storytelling, testimonial, behind-the-scenes, encuesta?
- Ritmo: duración de cada story, velocidad de la secuencia

## 3. ELEMENTOS INTERACTIVOS
- Stickers (encuesta, quiz, slider, preguntas, cuenta regresiva)
- Links / swipe up / botones
- Menciones, hashtags, ubicación

## 4. VISUAL Y PRODUCCIÓN
- ¿Grabado con cámara frontal o producido?
- Texto: tipografía, tamaño, posición, colores
- Fondos, overlays, transiciones
- Nivel de producción (1-10)

## 5. AUDIO
- ¿Habla a cámara? ¿Voiceover? ¿Solo texto?
- Música (si hay)
- Tono y energía

## 6. ENGAGEMENT Y PERSUASIÓN
- Qué acción busca (reply, swipe, tap, share)
- Técnica de retención entre stories
- CTA (si hay)

## 7. VEREDICTO
- Qué funciona y qué no
- Patrones replicables
- Score (1-10)`
};

// --- Main ---
async function main() {
  const { path: videoPath, cleanup } = await resolveVideoPath(input);

  try {
    const file = await uploadVideo(videoPath);

    const prompt = PROMPTS[tipo] || PROMPTS.reels;
    console.log(`\n🔍 Analizando como "${tipo}"...\n`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      prompt,
    ]);

    const text = result.response.text();

    if (rawFlag) {
      console.log(text);
    } else {
      console.log('═'.repeat(60));
      console.log(text);
      console.log('═'.repeat(60));
    }

    // Save analysis
    const outDir = path.resolve(process.cwd(), '.data', 'video-analyses');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseName = path.basename(videoPath, path.extname(videoPath));
    const outPath = path.join(outDir, `${timestamp}_${baseName}.md`);

    const header = `---
source: ${input}
tipo: ${tipo}
fecha: ${new Date().toISOString().slice(0, 10)}
model: gemini-2.5-flash
---

`;
    fs.writeFileSync(outPath, header + text);
    console.log(`\n💾 Guardado en ${path.relative(process.cwd(), outPath)}`);

    // Cleanup uploaded file from Gemini
    try {
      await fileManager.deleteFile(file.name);
    } catch { /* ignore */ }

  } finally {
    if (cleanup && fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
