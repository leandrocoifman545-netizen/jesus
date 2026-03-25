#!/usr/bin/env node
/**
 * Transcribe videos que quedaron pendientes por rate limit.
 * Lee las transcripciones existentes, encuentra los faltantes, y los transcribe.
 *
 * Uso: node scripts/ig-transcribe-remaining.mjs @username
 *       node scripts/ig-transcribe-remaining.mjs @username --lang es  (forzar idioma, default: auto-detect)
 */

import fs from "fs";
import path from "path";

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
if (!GROQ_KEY) {
  console.error("Falta GROQ_API_KEY en .env.local");
  process.exit(1);
}

// Parse args
const cliArgs = process.argv.slice(2);
let username = "";
let forceLang = null; // null = auto-detect, "es"/"en"/etc = forzar

for (let i = 0; i < cliArgs.length; i++) {
  if (cliArgs[i] === "--lang" && cliArgs[i + 1]) {
    forceLang = cliArgs[i + 1];
    i++;
  } else {
    username = cliArgs[i].replace(/^@/, "");
  }
}

if (!username) {
  console.error("Uso: node scripts/ig-transcribe-remaining.mjs @username [--lang es]");
  process.exit(1);
}

const REF_DIR = path.join(process.cwd(), ".data", "ig-references");
const tFile = path.join(REF_DIR, `${username}_transcripts.json`);
const profileFile = path.join(REF_DIR, `${username}.json`);
const videoDir = path.join(REF_DIR, `${username}_videos`);

if (!fs.existsSync(tFile) || !fs.existsSync(profileFile)) {
  console.error("Primero corré scrape-ig.mjs y ig-download-videos.mjs");
  process.exit(1);
}

const existing = JSON.parse(fs.readFileSync(tFile, "utf8"));
const doneSet = new Set(existing.transcripts.map((t) => t.shortCode));

const profile = JSON.parse(fs.readFileSync(profileFile, "utf8"));
const allVideos = (profile._raw_posts || [])
  .filter((p) => (p.type || "").toLowerCase() === "video")
  .sort((a, b) => (b.views || 0) - (a.views || 0));

const missing = allVideos.filter((v) => {
  const notDone = !doneSet.has(v.shortCode);
  const hasFile = fs.existsSync(path.join(videoDir, `${v.shortCode}.mp4`));
  return notDone && hasFile;
});

console.log(`@${username}: ${existing.transcripts.length} ya transcritos, ${missing.length} pendientes\n`);

if (missing.length === 0) {
  console.log("Nada pendiente.");
  process.exit(0);
}

async function transcribeWithGroq(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);

  const parts = [];
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: video/mp4\r\n\r\n`
  ));
  parts.push(fileBuffer);
  parts.push(Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n`));
  if (forceLang) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\n${forceLang}\r\n`));
  }
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\nverbose_json\r\n`));
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

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

let newCount = 0;

for (let i = 0; i < missing.length; i++) {
  const video = missing[i];
  const code = video.shortCode;
  const videoPath = path.join(videoDir, `${code}.mp4`);

  console.log(`[${i + 1}/${missing.length}] ${(video.views || 0).toLocaleString()} vistas | ${video.url}`);

  try {
    const stats = fs.statSync(videoPath);
    if (stats.size > 25 * 1024 * 1024) {
      console.log(`  Muy grande (${(stats.size / 1024 / 1024).toFixed(1)} MB). Saltando.`);
      continue;
    }

    console.log(`  Transcribiendo (${(stats.size / 1024 / 1024).toFixed(1)} MB)...`);
    const result = await transcribeWithGroq(videoPath);

    existing.transcripts.push({
      shortCode: code,
      url: video.url,
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      duration: video.videoDuration || result.duration || 0,
      caption: (video.caption || "").slice(0, 200),
      transcript: result.text,
      segments: result.segments || [],
    });
    newCount++;
    console.log(`  OK: "${result.text.slice(0, 80)}..."`);

    // Rate limit: Groq = 7200s audio/hour (120min/hour).
    // With ~76s avg videos, need ~38s wait between calls to stay safe.
    const dur = video.videoDuration || result.duration || 60;
    const waitMs = Math.max(5000, Math.ceil(dur * 550));
    if (i < missing.length - 1) {
      console.log(`  ⏳ Wait ${Math.round(waitMs/1000)}s (rate limit)...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }

    // Save progress every 10 transcriptions
    if (newCount % 10 === 0 && newCount > 0) {
      existing.transcripts.sort((a, b) => (b.views || 0) - (a.views || 0));
      existing.total_transcribed = existing.transcripts.length;
      existing.transcribed_at = new Date().toISOString();
      fs.writeFileSync(tFile, JSON.stringify(existing, null, 2));
      console.log(`  💾 Progreso guardado: ${existing.transcripts.length} transcripciones`);
    }
  } catch (err) {
    if (err.message.includes("no audio track")) {
      console.log(`  Sin audio. Marcado.`);
      existing.transcripts.push({
        shortCode: code,
        url: video.url,
        views: video.views || 0,
        likes: video.likes || 0,
        comments: video.comments || 0,
        duration: video.videoDuration || 0,
        caption: (video.caption || "").slice(0, 200),
        transcript: "[SIN AUDIO - Video con texto en pantalla o música]",
        segments: [],
        no_audio: true,
      });
      newCount++;
    } else if (err.message.includes("429") || err.message.includes("rate_limit")) {
      console.log(`  Rate limit. Esperando 30s...`);
      await new Promise((r) => setTimeout(r, 30000));
      i--; // retry
    } else {
      console.error(`  Error: ${err.message}`);
    }
  }
}

// Sort by views and save
existing.transcripts.sort((a, b) => (b.views || 0) - (a.views || 0));
existing.total_transcribed = existing.transcripts.length;
existing.transcribed_at = new Date().toISOString();
fs.writeFileSync(tFile, JSON.stringify(existing, null, 2));

console.log(`\nListo. ${newCount} nuevas transcripciones. Total: ${existing.transcripts.length}`);
