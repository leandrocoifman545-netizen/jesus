import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const SOURCE_DIR = '/Users/lean/Documents/Historias que venden';
const OUTPUT_DIR = '/Users/lean/Documents/script-generator/.data/stories-course';
const TEMP_DIR = '/tmp/stories-transcribe';

// Read API key — use --paid flag for very long videos
const usePaid = process.argv.includes('--paid');
const envContent = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const freeKey = envContent.match(/GROQ_API_KEY_FREE=(.+)/)?.[1]?.trim();
const paidKey = envContent.match(/GROQ_API_KEY=(.+)/)?.[1]?.trim();
const apiKey = (usePaid && paidKey) ? paidKey : (freeKey || paidKey);
if (!apiKey) { console.error('GROQ_API_KEY not found'); process.exit(1); }
if (usePaid) console.log('💰 Using PAID Groq key (--paid flag)');

// Create dirs
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

// Get all mp4 files sorted by module
const files = fs.readdirSync(SOURCE_DIR)
  .filter(f => f.endsWith('.mp4'))
  .sort((a, b) => {
    const modA = a.match(/MÓDULO - (\d+)/)?.[1] || '9';
    const modB = b.match(/MÓDULO - (\d+)/)?.[1] || '9';
    if (modA !== modB) return parseInt(modA) - parseInt(modB);
    return a.localeCompare(b);
  });

console.log(`Found ${files.length} videos to transcribe\n`);

async function sleep(ms) {
  console.log(`   ⏳ Waiting ${Math.round(ms / 1000)}s for rate limit...`);
  return new Promise(r => setTimeout(r, ms));
}

async function transcribeWithRetry(audioPath, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const audioBuffer = fs.readFileSync(audioPath);
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mpeg' });
    const formData = new FormData();
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'es');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (response.ok) {
      return await response.text();
    }

    const errText = await response.text();

    // Parse wait time from rate limit error
    const waitMatch = errText.match(/try again in (\d+)m([\d.]+)s/);
    if (waitMatch) {
      const waitMs = (parseInt(waitMatch[1]) * 60 + parseFloat(waitMatch[2])) * 1000 + 5000; // +5s buffer
      await sleep(waitMs);
      continue;
    }

    // Also handle seconds-only format
    const waitSecsMatch = errText.match(/try again in ([\d.]+)s/);
    if (waitSecsMatch) {
      const waitMs = parseFloat(waitSecsMatch[1]) * 1000 + 5000;
      await sleep(waitMs);
      continue;
    }

    throw new Error(`Groq error: ${errText}`);
  }
  throw new Error('Max retries exceeded');
}

async function processFile(filename, index) {
  const safeName = filename.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\-_ ]/g, '').replace(/\s+/g, '-').substring(0, 80);
  const outputFile = path.join(OUTPUT_DIR, `${String(index + 1).padStart(2, '0')}-${safeName}.txt`);

  // Skip if already transcribed with substantial content
  if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 500) {
    console.log(`⏭  [${index + 1}/${files.length}] Already done: ${filename.substring(0, 60)}`);
    return;
  }

  const inputPath = path.join(SOURCE_DIR, filename);
  const audioPath = path.join(TEMP_DIR, `${safeName}.mp3`);

  console.log(`🎬 [${index + 1}/${files.length}] ${filename.substring(0, 70)}`);

  // Extract audio as compressed mp3 (mono, speech-optimized)
  if (!fs.existsSync(audioPath)) {
    try {
      execSync(`ffmpeg -i "${inputPath}" -vn -ac 1 -ar 16000 -ab 32k -f mp3 "${audioPath}" -y 2>/dev/null`, { timeout: 120000 });
    } catch (e) {
      console.error(`   ❌ FFmpeg failed: ${e.message}`);
      return;
    }
  }

  const audioSize = fs.statSync(audioPath).size;
  const sizeMB = (audioSize / 1024 / 1024).toFixed(1);
  console.log(`   📦 Audio: ${sizeMB}MB`);

  // If under 24MB, transcribe directly
  if (audioSize < 24 * 1024 * 1024) {
    try {
      const text = await transcribeWithRetry(audioPath);
      fs.writeFileSync(outputFile, `# ${filename}\n\n${text.trim()}\n`);
      console.log(`   ✅ Done (${text.trim().split(/\s+/).length} words)`);
    } catch (e) {
      console.error(`   ❌ Transcription failed: ${e.message}`);
    }
  } else {
    // Split into chunks
    const durationStr = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioPath}" 2>/dev/null`).toString().trim();
    const duration = parseFloat(durationStr);
    const chunkDuration = 600; // 10 min chunks
    const numChunks = Math.ceil(duration / chunkDuration);
    console.log(`   🔀 Splitting into ${numChunks} chunks (${Math.round(duration / 60)} min total)`);

    let fullText = '';
    for (let i = 0; i < numChunks; i++) {
      const chunkPath = path.join(TEMP_DIR, `${safeName}_chunk${i}.mp3`);
      const startTime = i * chunkDuration;
      try {
        execSync(`ffmpeg -i "${audioPath}" -ss ${startTime} -t ${chunkDuration} -ac 1 -ar 16000 -ab 32k -f mp3 "${chunkPath}" -y 2>/dev/null`, { timeout: 60000 });
        const text = await transcribeWithRetry(chunkPath);
        fullText += text.trim() + ' ';
        console.log(`   ✅ Chunk ${i + 1}/${numChunks} done`);
        try { fs.unlinkSync(chunkPath); } catch {}
      } catch (e) {
        console.error(`   ❌ Chunk ${i + 1} failed: ${e.message}`);
      }
    }
    if (fullText.trim().length > 0) {
      fs.writeFileSync(outputFile, `# ${filename}\n\n${fullText.trim()}\n`);
      console.log(`   ✅ Complete (${fullText.trim().split(/\s+/).length} words)`);
    }
  }

  // Cleanup audio
  try { fs.unlinkSync(audioPath); } catch {}

  // Small pause between files
  await new Promise(r => setTimeout(r, 2000));
}

// Process all files sequentially
for (let i = 0; i < files.length; i++) {
  await processFile(files[i], i);
}

// Cleanup temp dir
try { fs.rmSync(TEMP_DIR, { recursive: true }); } catch {}

console.log('\n🎉 All done! Transcriptions saved to:', OUTPUT_DIR);
