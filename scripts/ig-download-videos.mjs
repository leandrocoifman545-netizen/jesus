#!/usr/bin/env node
/**
 * Descarga los top videos de un perfil scrapeado y los transcribe con Groq Whisper.
 *
 * Uso:
 *   node scripts/ig-download-videos.mjs @username
 *   node scripts/ig-download-videos.mjs @username --top 5    (solo top 5 por vistas)
 *   node scripts/ig-download-videos.mjs @username --top-performers  (top CLR + views proporcional)
 *   node scripts/ig-download-videos.mjs @username --skip-transcribe  (solo descarga)
 *
 * Requiere:
 *   - Perfil ya scrapeado en .data/ig-references/{username}.json
 *   - GROQ_API_KEY o GROQ_API_KEY_FREE en .env.local (para transcripción)
 *
 * Guarda:
 *   - Videos en .data/ig-references/{username}_videos/
 *   - Transcripciones en .data/ig-references/{username}_transcripts.json
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Load env
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const GROQ_KEY = process.env.GROQ_API_KEY_FREE || process.env.GROQ_API_KEY;

// Parse args
const args = process.argv.slice(2);
let topN = 0; // 0 = todos los videos
let skipTranscribe = false;
let topPerformers = false;
const usernames = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--top" && args[i + 1]) {
    topN = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--top-performers") {
    topPerformers = true;
  } else if (args[i] === "--skip-transcribe") {
    skipTranscribe = true;
  } else {
    usernames.push(args[i].replace(/^@/, ""));
  }
}

/**
 * Selecciona los top performers por CLR + views según reglas proporcionales:
 *   < 30 videos: 100%
 *   30-80: top 40% CLR + top 15% views
 *   80-200: top 25% CLR + top 10% views
 *   200+: top 15% CLR + top 10% views
 */
function selectTopPerformers(videos) {
  const total = videos.length;
  if (total < 30) return videos; // todos

  let clrPct, viewsPct;
  if (total <= 80) { clrPct = 0.40; viewsPct = 0.15; }
  else if (total <= 200) { clrPct = 0.25; viewsPct = 0.10; }
  else { clrPct = 0.15; viewsPct = 0.10; }

  const withEngagement = videos.filter(v => (v.likes || 0) > 0);
  const byCLR = [...withEngagement].sort((a, b) => {
    const clrA = (a.comments || 0) / (a.likes || 1);
    const clrB = (b.comments || 0) / (b.likes || 1);
    return clrB - clrA;
  });
  const byViews = [...withEngagement].sort((a, b) => (b.views || 0) - (a.views || 0));

  const topCLR = new Set(byCLR.slice(0, Math.ceil(withEngagement.length * clrPct)).map(v => v.shortCode));
  const topViews = new Set(byViews.slice(0, Math.ceil(withEngagement.length * viewsPct)).map(v => v.shortCode));
  const selected = new Set([...topCLR, ...topViews]);

  console.log(`📊 Selección proporcional: ${total} videos totales`);
  console.log(`   Top ${Math.round(clrPct*100)}% CLR: ${topCLR.size} | Top ${Math.round(viewsPct*100)}% views: ${topViews.size}`);
  console.log(`   Overlap: ${topCLR.size + topViews.size - selected.size} | Únicos: ${selected.size}`);

  return videos.filter(v => selected.has(v.shortCode));
}

if (usernames.length === 0) {
  console.error("Uso: node scripts/ig-download-videos.mjs @username [--top 5]  (sin --top = TODOS)");
  process.exit(1);
}

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");

async function downloadVideo(url, outPath, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      return buffer.length;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function transcribeWithGroq(filePath) {
  if (!GROQ_KEY) {
    throw new Error("Falta GROQ_API_KEY o GROQ_API_KEY_FREE en .env.local");
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  // Build multipart form data manually
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const parts = [];

  // File part
  parts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: video/mp4\r\n\r\n`
  );
  parts.push(fileBuffer);
  parts.push(`\r\n`);

  // Model part
  parts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="model"\r\n\r\n` +
    `whisper-large-v3\r\n`
  );

  // Language part
  parts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="language"\r\n\r\n` +
    `es\r\n`
  );

  // Response format
  parts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
    `verbose_json\r\n`
  );

  parts.push(`--${boundary}--\r\n`);

  // Combine parts
  const bodyParts = [];
  for (const part of parts) {
    if (Buffer.isBuffer(part)) {
      bodyParts.push(part);
    } else {
      bodyParts.push(Buffer.from(part, "utf8"));
    }
  }
  const body = Buffer.concat(bodyParts);

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_KEY}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  return await res.json();
}

async function processProfile(username) {
  const dataFile = path.join(REF_DIR, `${username}.json`);
  if (!fs.existsSync(dataFile)) {
    console.error(`No encontré datos de @${username}. Primero corré: node scripts/scrape-ig.mjs @${username}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  // Get ALL videos from raw data, sorted by views
  const allVideos = (data._raw_posts || [])
    .filter((p) => (p.type || "").toLowerCase() === "video")
    .sort((a, b) => (b.views || 0) - (a.views || 0));

  let videos;
  if (topPerformers) {
    videos = selectTopPerformers(allVideos);
  } else if (topN > 0) {
    videos = allVideos.slice(0, topN);
  } else {
    videos = allVideos;
  }

  if (videos.length === 0) {
    console.log(`@${username}: No hay videos para descargar.`);
    return;
  }

  console.log(`\n=== @${username}: ${videos.length} videos para procesar ===\n`);

  const videoDir = path.join(REF_DIR, `${username}_videos`);
  fs.mkdirSync(videoDir, { recursive: true });

  const transcripts = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const code = video.shortCode || `video_${i}`;
    const videoPath = path.join(videoDir, `${code}.mp4`);

    console.log(`[${i + 1}/${videos.length}] ${video.views?.toLocaleString() || "?"} vistas | ${video.url}`);

    // Download
    if (fs.existsSync(videoPath)) {
      console.log(`  Ya descargado: ${videoPath}`);
    } else if (video.videoUrl) {
      try {
        const size = await downloadVideo(video.videoUrl, videoPath);
        console.log(`  Descargado: ${(size / 1024 / 1024).toFixed(1)} MB`);
      } catch (err) {
        console.error(`  Error descargando: ${err.message}`);
        // Try with yt-dlp as fallback
        try {
          console.log(`  Intentando con yt-dlp...`);
          execSync(`yt-dlp -o "${videoPath}" "${video.url}" 2>/dev/null`, { timeout: 60000 });
          console.log(`  Descargado con yt-dlp`);
        } catch {
          console.error(`  No se pudo descargar. Saltando.`);
          continue;
        }
      }
    } else {
      // No direct URL, try yt-dlp
      try {
        console.log(`  Sin URL directa, usando yt-dlp...`);
        execSync(`yt-dlp -o "${videoPath}" "${video.url}" 2>/dev/null`, { timeout: 60000 });
        console.log(`  Descargado con yt-dlp`);
      } catch {
        console.error(`  No se pudo descargar. Saltando.`);
        continue;
      }
    }

    // Transcribe
    if (!skipTranscribe && fs.existsSync(videoPath)) {
      try {
        // Check file size (Groq limit: 25MB)
        const stats = fs.statSync(videoPath);
        if (stats.size > 25 * 1024 * 1024) {
          console.log(`  Archivo muy grande (${(stats.size / 1024 / 1024).toFixed(1)} MB). Extrayendo audio...`);
          const audioPath = videoPath.replace(".mp4", ".mp3");
          try {
            execSync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 4 "${audioPath}" -y 2>/dev/null`, { timeout: 30000 });
            // Use audio file instead
            if (fs.existsSync(audioPath) && fs.statSync(audioPath).size < 25 * 1024 * 1024) {
              console.log(`  Transcribiendo audio...`);
              const result = await transcribeWithGroq(audioPath);
              transcripts.push({
                shortCode: code,
                url: video.url,
                views: video.views,
                likes: video.likes,
                comments: video.comments,
                duration: video.duration || result.duration || 0,
                caption: video.caption,
                transcript: result.text,
                segments: result.segments || [],
              });
              console.log(`  Transcrito: "${result.text.slice(0, 80)}..."`);
              fs.unlinkSync(audioPath); // cleanup
            } else {
              console.log(`  Audio sigue siendo muy grande. Saltando transcripción.`);
            }
          } catch {
            console.log(`  ffmpeg no disponible. Saltando transcripción de este video.`);
          }
        } else {
          console.log(`  Transcribiendo (${(stats.size / 1024 / 1024).toFixed(1)} MB)...`);
          const result = await transcribeWithGroq(videoPath);
          transcripts.push({
            shortCode: code,
            url: video.url,
            views: video.views,
            likes: video.likes,
            comments: video.comments,
            duration: video.duration || result.duration || 0,
            caption: video.caption,
            transcript: result.text,
            segments: result.segments || [],
          });
          console.log(`  Transcrito: "${result.text.slice(0, 80)}..."`);
        }

        // Rate limit: Groq free tier = 7200s audio/hour
        // Wait proportional to video duration to avoid hitting limits
        const videoDur = video.videoDuration || result.duration || 60;
        const waitMs = Math.max(3000, Math.ceil(videoDur * 500)); // ~half real-time
        if (i < videos.length - 1) {
          console.log(`  ⏳ Esperando ${Math.round(waitMs/1000)}s (rate limit)...`);
          await new Promise((r) => setTimeout(r, waitMs));
        }
      } catch (err) {
        if (err.message.includes("no audio track")) {
          console.log(`  Sin audio (video con texto/música). Marcado.`);
          transcripts.push({
            shortCode: code,
            url: video.url,
            views: video.views,
            likes: video.likes,
            comments: video.comments,
            duration: video.duration || 0,
            caption: video.caption,
            transcript: "[SIN AUDIO - Video con texto en pantalla o música]",
            segments: [],
            no_audio: true,
          });
        } else {
          console.error(`  Error transcribiendo: ${err.message}`);
        }
      }
    }
  }

  // Save transcripts
  if (transcripts.length > 0) {
    const transcriptFile = path.join(REF_DIR, `${username}_transcripts.json`);
    const transcriptOutput = {
      username,
      transcribed_at: new Date().toISOString(),
      total_transcribed: transcripts.length,
      transcripts: transcripts.sort((a, b) => (b.views || 0) - (a.views || 0)),
    };
    fs.writeFileSync(transcriptFile, JSON.stringify(transcriptOutput, null, 2));
    console.log(`\n  Transcripciones guardadas: ${transcriptFile}`);
  }

  // Update main profile with transcript references
  if (transcripts.length > 0) {
    data.transcripts_available = true;
    data.transcripts_count = transcripts.length;
    data.transcripts_file = `${username}_transcripts.json`;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  }

  // Print summary
  console.log(`\n  === Resumen @${username} ===`);
  console.log(`  Videos descargados: ${fs.readdirSync(videoDir).filter((f) => f.endsWith(".mp4")).length}`);
  console.log(`  Transcripciones: ${transcripts.length}`);

  if (transcripts.length > 0) {
    console.log(`\n  Top 3 videos transcritos (por vistas):`);
    for (const t of transcripts.slice(0, 3)) {
      console.log(`\n    ${t.views?.toLocaleString() || "?"} vistas | ${t.url}`);
      console.log(`    Duración: ${Math.round(t.duration || 0)}s`);
      console.log(`    Dice: "${t.transcript.slice(0, 120)}..."`);
    }
  }
}

// Run
for (const username of usernames) {
  try {
    await processProfile(username);
  } catch (err) {
    console.error(`Error con @${username}: ${err.message}`);
  }
}

console.log("\n\nSiguiente paso: usá estos datos en la conversación con Claude para analizar patrones.");
