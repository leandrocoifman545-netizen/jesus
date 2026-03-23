import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const OUTPUT_DIR = '/Users/lean/Documents/script-generator/.data/stories-course/youtube';
const TEMP_DIR = '/tmp/yt-transcribe';

// Read API key — use --paid flag for very long videos
const usePaid = process.argv.includes('--paid');
const envContent = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const freeKey = envContent.match(/GROQ_API_KEY_FREE=(.+)/)?.[1]?.trim();
const paidKey = envContent.match(/GROQ_API_KEY=(.+)/)?.[1]?.trim();
const apiKey = (usePaid && paidKey) ? paidKey : (freeKey || paidKey);
if (!apiKey) { console.error('GROQ_API_KEY not found'); process.exit(1); }
if (usePaid) console.log('💰 Using PAID Groq key (--paid flag)');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

const videos = [
  { id: 'GiHdmTg0y1Q', title: 'Analisis de las historias de un cliente' },
  { id: 'UuSlpGkftLw', title: 'Semana de contenido Nico' },
  { id: 'QF5n1L3E5QQ', title: 'Semana de contenido Stories - Nico' },
  { id: 'HOiVDj5XKgw', title: 'Semana de contenido Javier' },
  { id: 'rKxkz21F7Pw', title: 'Estrategia de contenido EndiKa' },
  { id: 'J84z4KgN56A', title: 'las 2 proximas semanas de contenido por stories Endika' },
  { id: 'hm6Cb6mr1LU', title: 'Estrategia del lanzamiento por stories - Endika' },
  { id: '7qXwYCBB9TM', title: 'Mes de contenido Endika Historias Nafe' },
  { id: '1f_iizXZoaE', title: 'Semana de contenido de Endika del 20 al 26 de octubre' },
  { id: 'AHh6OKnVpnY', title: 'Estrategia de contenido Nico' },
  { id: 'j2m1DAreBoo', title: 'Estrategia de historias - Nico x Nafe - 17-11-25' },
  { id: 'G6dBSnJhNbg', title: 'Estrategia de contenido Javier' },
  { id: 'NOsJ6FhYQ5E', title: 'semana de contenido Javier 24-11-25 - Nafe' },
  { id: 'GWVp4DOd42I', title: 'Semana de contenido Nico 30-12-25' },
  { id: 'sNmt-faV3zc', title: 'Semana de contenido 03-11-25 - Nico' },
  { id: 'y5__ctYSdik', title: 'Calendario de Nico segunda semana de octubre' },
  { id: 'zXdYZiyVFZs', title: 'Estrategia de historias - Javier x Nafe - 17-11-25' },
  { id: 'ohvQBhJ8_UQ', title: 'Semana de contenido 30-11-25' },
  { id: 'M6OFmENDTyA', title: 'Semana de contenido Javier x Nafe - 10-11-25' },
  { id: 'hslLNt8PB6M', title: 'Semana de historias - Javier 03-11-25' },
  { id: 'MAvpJoEX7Cc', title: '1 semana de contenido Javier' },
];

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

    if (response.ok) return await response.text();

    const errText = await response.text();
    const waitMatch = errText.match(/try again in (\d+)m([\d.]+)s/);
    if (waitMatch) {
      await sleep((parseInt(waitMatch[1]) * 60 + parseFloat(waitMatch[2])) * 1000 + 5000);
      continue;
    }
    const waitSecsMatch = errText.match(/try again in ([\d.]+)s/);
    if (waitSecsMatch) {
      await sleep(parseFloat(waitSecsMatch[1]) * 1000 + 5000);
      continue;
    }
    throw new Error(`Groq error: ${errText}`);
  }
  throw new Error('Max retries exceeded');
}

console.log(`Processing ${videos.length} YouTube videos\n`);

for (let i = 0; i < videos.length; i++) {
  const { id, title } = videos[i];
  const safeName = title.replace(/[^a-zA-Z0-9áéíóúñ\-_ ]/g, '').replace(/\s+/g, '-').substring(0, 60);
  const outputFile = path.join(OUTPUT_DIR, `${String(i + 1).padStart(2, '0')}-${safeName}.txt`);

  if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 500) {
    console.log(`⏭  [${i + 1}/${videos.length}] Already done: ${title}`);
    continue;
  }

  console.log(`🎬 [${i + 1}/${videos.length}] ${title}`);

  const audioPath = path.join(TEMP_DIR, `${id}.mp3`);

  // Download audio with yt-dlp
  if (!fs.existsSync(audioPath)) {
    try {
      execSync(`yt-dlp -x --audio-format mp3 --audio-quality 9 -o "${path.join(TEMP_DIR, id)}.%(ext)s" "https://youtu.be/${id}" 2>/dev/null`, { timeout: 120000 });
      // yt-dlp might save as .mp3 directly or we need to find it
      if (!fs.existsSync(audioPath)) {
        // Try to find the downloaded file
        const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(id));
        if (files.length > 0) {
          const downloaded = path.join(TEMP_DIR, files[0]);
          // Convert to mp3 if needed
          execSync(`ffmpeg -i "${downloaded}" -ac 1 -ar 16000 -ab 32k -f mp3 "${audioPath}" -y 2>/dev/null`, { timeout: 60000 });
          if (downloaded !== audioPath) try { fs.unlinkSync(downloaded); } catch {}
        }
      }
    } catch (e) {
      console.error(`   ❌ Download failed: ${e.message.substring(0, 100)}`);
      continue;
    }
  }

  if (!fs.existsSync(audioPath)) {
    console.error(`   ❌ Audio file not found after download`);
    continue;
  }

  const audioSize = fs.statSync(audioPath).size;
  const sizeMB = (audioSize / 1024 / 1024).toFixed(1);
  console.log(`   📦 Audio: ${sizeMB}MB`);

  if (audioSize < 24 * 1024 * 1024) {
    try {
      const text = await transcribeWithRetry(audioPath);
      fs.writeFileSync(outputFile, `# ${title}\n\n${text.trim()}\n`);
      console.log(`   ✅ Done (${text.trim().split(/\s+/).length} words)`);
    } catch (e) {
      console.error(`   ❌ Transcription failed: ${e.message.substring(0, 100)}`);
    }
  } else {
    // Split into chunks
    const durationStr = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioPath}" 2>/dev/null`).toString().trim();
    const duration = parseFloat(durationStr);
    const chunkDuration = 600;
    const numChunks = Math.ceil(duration / chunkDuration);
    console.log(`   🔀 Splitting into ${numChunks} chunks (${Math.round(duration / 60)} min total)`);

    let fullText = '';
    for (let c = 0; c < numChunks; c++) {
      const chunkPath = path.join(TEMP_DIR, `${id}_chunk${c}.mp3`);
      try {
        execSync(`ffmpeg -i "${audioPath}" -ss ${c * chunkDuration} -t ${chunkDuration} -ac 1 -ar 16000 -ab 32k -f mp3 "${chunkPath}" -y 2>/dev/null`, { timeout: 60000 });
        const text = await transcribeWithRetry(chunkPath);
        fullText += text.trim() + ' ';
        console.log(`   ✅ Chunk ${c + 1}/${numChunks} done`);
        try { fs.unlinkSync(chunkPath); } catch {}
      } catch (e) {
        console.error(`   ❌ Chunk ${c + 1} failed: ${e.message.substring(0, 100)}`);
      }
    }
    if (fullText.trim().length > 0) {
      fs.writeFileSync(outputFile, `# ${title}\n\n${fullText.trim()}\n`);
      console.log(`   ✅ Complete (${fullText.trim().split(/\s+/).length} words)`);
    }
  }

  try { fs.unlinkSync(audioPath); } catch {}
  await new Promise(r => setTimeout(r, 2000));
}

try { fs.rmSync(TEMP_DIR, { recursive: true }); } catch {}
console.log('\n🎉 All YouTube videos done!');
