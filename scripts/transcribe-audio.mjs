import fs from 'fs';

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node scripts/transcribe-audio.mjs <audio-file>'); process.exit(1); }

// Read .env.local — prefer free key, fallback to paid
const envContent = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const apiKey = envContent.match(/GROQ_API_KEY_FREE=(.+)/)?.[1]?.trim()
  || envContent.match(/GROQ_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('GROQ_API_KEY not found in .env.local'); process.exit(1); }

const audioBuffer = fs.readFileSync(filePath);

const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg' });
const formData = new FormData();
formData.append('file', blob, 'audio.ogg');
formData.append('model', 'whisper-large-v3');
formData.append('language', 'es');
formData.append('response_format', 'text');

const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
  body: formData,
});

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

console.log(await response.text());
