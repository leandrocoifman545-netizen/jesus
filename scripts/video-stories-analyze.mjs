#!/usr/bin/env node

/**
 * Analiza grabaciones de pantalla de Instagram Stories con Gemini.
 * Detecta cada story individual, transiciones, tipo (foto/video), contenido.
 *
 * Uso:
 *   node scripts/video-stories-analyze.mjs <carpeta_de_parts> [--output archivo.md]
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ Falta GEMINI_API_KEY en .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const args = process.argv.slice(2);
const outputIdx = args.indexOf('--output');
const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;
const inputDir = args.find(a => !a.startsWith('--') && a !== outputFile);

if (!inputDir) {
  console.error('Uso: node scripts/video-stories-analyze.mjs <carpeta_de_parts> [--output archivo.md]');
  process.exit(1);
}

const resolvedDir = path.resolve(inputDir);
if (!fs.existsSync(resolvedDir)) {
  console.error(`❌ Carpeta no encontrada: ${resolvedDir}`);
  process.exit(1);
}

// Get all mp4 files sorted
const files = fs.readdirSync(resolvedDir)
  .filter(f => f.endsWith('.mp4'))
  .sort()
  .map(f => path.join(resolvedDir, f));

if (files.length === 0) {
  console.error('❌ No hay archivos .mp4 en la carpeta');
  process.exit(1);
}

console.log(`📂 ${files.length} partes encontradas\n`);

// --- Upload ---
async function uploadVideo(filePath) {
  const mimeType = 'video/mp4';
  const displayName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
  console.log(`📤 Subiendo ${displayName} (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

  const uploadResponse = await fileManager.uploadFile(filePath, { mimeType, displayName });

  let file = uploadResponse.file;
  let attempts = 0;
  while (file.state === FileState.PROCESSING && attempts < 120) {
    await new Promise(r => setTimeout(r, 2000));
    file = await fileManager.getFile(file.name);
    attempts++;
    if (attempts % 10 === 0) console.log(`  ⏳ Procesando... (${attempts * 2}s)`);
  }

  if (file.state !== FileState.ACTIVE) {
    throw new Error(`Error procesando ${displayName}: state=${file.state}`);
  }

  console.log(`  ✅ Listo`);
  return file;
}

const PROMPT = `Estás analizando una GRABACIÓN DE PANTALLA de un celular que muestra Instagram Stories de un lanzamiento digital (David Turu).

Tu trabajo es identificar CADA STORY INDIVIDUAL dentro de esta grabación. Prestá mucha atención a:

## CÓMO DETECTAR TRANSICIONES ENTRE STORIES:
- La barra de progreso arriba cambia de segmento
- Hay un flash o transición breve entre stories
- El contenido cambia abruptamente (de video a foto, o de un fondo a otro)
- Aparece una nueva fecha/hora
- Cambia el tipo de contenido (de texto a video, de foto a sticker, etc)

## PARA CADA STORY DETECTADA, REPORTÁ:

**Story N** (timestamp aprox en el video: MM:SS - MM:SS)
- **Tipo:** Foto / Video / Texto sobre fondo / Repost / Encuesta / etc
- **Duración estimada:** Xs
- **Fecha visible:** (si se ve alguna fecha o indicador temporal)
- **Texto en pantalla:** (transcribí TODO el texto que aparece, textual)
- **Descripción visual:** Qué se ve exactamente (persona hablando, captura de pantalla, gráfico, foto, etc)
- **Stickers/Elementos interactivos:** (encuesta, slider, pregunta, countdown, link, mención, hashtag, música)
- **Audio:** Si hay audio, qué se dice (resumen)
- **Intención:** ¿Qué busca esta story? (generar curiosidad, dar prueba social, crear urgencia, educar, entretener, vender, etc)

## IMPORTANTE:
- NO te saltees ninguna story, aunque sea corta o parezca insignificante
- Si no estás seguro de si es una transición o no, mencionalo
- Anotá CUÁNTAS stories detectás en total en esta parte
- Si ves fechas, anotá el día para mapear la secuencia del lanzamiento
- Diferenciá claramente entre contenido estático (foto) y dinámico (video donde la persona habla/se mueve)

## AL FINAL DE TU ANÁLISIS:
- Total de stories detectadas en esta parte
- Proporción fotos vs videos
- Elementos interactivos usados
- Temas/bloques temáticos que detectás`;

async function analyzePart(file, partName, partIndex, totalParts) {
  console.log(`\n🔍 Analizando ${partName} (parte ${partIndex + 1}/${totalParts})...\n`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: file.mimeType,
        fileUri: file.uri,
      },
    },
    `${PROMPT}\n\nEsta es la PARTE ${partIndex + 1} de ${totalParts} de la grabación. El archivo se llama "${partName}".`,
  ]);

  return result.response.text();
}

async function main() {
  const results = [];

  // Group files by video number
  const groups = {};
  for (const f of files) {
    const name = path.basename(f);
    const match = name.match(/video(\d+)/);
    const group = match ? `Video ${match[1]}` : 'Video';
    if (!groups[group]) groups[group] = [];
    groups[group].push(f);
  }

  for (const [groupName, groupFiles] of Object.entries(groups)) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📹 ${groupName} (${groupFiles.length} partes)`);
    console.log(`${'═'.repeat(60)}\n`);

    const groupResults = [];

    for (let i = 0; i < groupFiles.length; i++) {
      const filePath = groupFiles[i];
      const partName = path.basename(filePath);

      try {
        const uploaded = await uploadVideo(filePath);
        const analysis = await analyzePart(uploaded, partName, i, groupFiles.length);

        console.log(analysis);
        groupResults.push({ part: partName, analysis });

        // Cleanup
        try { await fileManager.deleteFile(uploaded.name); } catch {}
      } catch (err) {
        console.error(`❌ Error en ${partName}: ${err.message}`);
        groupResults.push({ part: partName, analysis: `ERROR: ${err.message}` });
      }
    }

    results.push({ group: groupName, parts: groupResults });
  }

  // Save consolidated output
  const outDir = path.resolve(process.cwd(), '.data', 'video-analyses');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outPath = outputFile
    ? path.resolve(outputFile)
    : path.join(outDir, `${timestamp}_stories-analysis.md`);

  let md = `---
source: ${resolvedDir}
fecha: ${new Date().toISOString().slice(0, 10)}
model: gemini-2.5-flash
tipo: stories-launch-analysis
---

# Análisis de Stories — David Turu (Primer Lanzamiento)

`;

  for (const { group, parts } of results) {
    md += `\n## ${group}\n\n`;
    for (const { part, analysis } of parts) {
      md += `### ${part}\n\n${analysis}\n\n---\n\n`;
    }
  }

  fs.writeFileSync(outPath, md);
  console.log(`\n💾 Análisis completo guardado en ${path.relative(process.cwd(), outPath)}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
