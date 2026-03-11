#!/bin/bash
# Transcribe video/audio files or social media URLs
# Uses Groq API (fast) with fallback to local Whisper
# Usage: ./transcribir.sh archivo.mp4 [archivo2.mp4 ...]
#        ./transcribir.sh https://www.instagram.com/reel/xxx

export PATH="/Users/lean/Library/Python/3.9/bin:/opt/homebrew/bin:$PATH"

DOWNLOAD_DIR="/Users/lean/Documents/script-generator/.data/downloads"
ENV_FILE="/Users/lean/Documents/script-generator/.env.local"
mkdir -p "$DOWNLOAD_DIR"

# Load GROQ_API_KEY from .env.local
if [ -f "$ENV_FILE" ]; then
    GROQ_API_KEY=$(grep '^GROQ_API_KEY=' "$ENV_FILE" | cut -d'=' -f2)
fi

if [ $# -eq 0 ]; then
    echo "Uso: ./transcribir.sh archivo.mp4 [url ...]"
    echo "Acepta: archivos locales, links de Instagram, TikTok, YouTube, etc."
    exit 1
fi

# Transcribe using Groq API (returns 0 on success, 1 on failure)
transcribe_groq() {
    local file="$1"
    local txt_file="$2"

    # Groq accepts max 25MB
    local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$file_size" -gt 26214400 ]; then
        echo "⚠️  Archivo >25MB, Groq no lo acepta" >&2
        return 1
    fi

    local response
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "https://api.groq.com/openai/v1/audio/transcriptions" \
        -H "Authorization: Bearer $GROQ_API_KEY" \
        -F "file=@$file" \
        -F "model=whisper-large-v3" \
        -F "language=es" \
        -F "response_format=text" \
        2>/dev/null)

    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ] && [ -n "$body" ]; then
        echo "$body" > "$txt_file"
        return 0
    else
        return 1
    fi
}

# Transcribe using local Whisper (fallback)
transcribe_whisper() {
    local file="$1"
    local output_dir="$2"

    whisper "$file" \
        --model small \
        --language Spanish \
        --output_format txt \
        --output_dir "$output_dir" \
        --fp16 False \
        2>/dev/null
    return $?
}

# Collect all transcript paths for output
TRANSCRIPTS=()

for input in "$@"; do
    # Check if it's a URL
    if [[ "$input" == http* ]]; then
        echo "📥 Descargando: $input..." >&2

        downloaded_file=$(yt-dlp \
            --extract-audio \
            --audio-format mp3 \
            --output "$DOWNLOAD_DIR/%(title)s.%(ext)s" \
            --print after_move:filepath \
            "$input" 2>/dev/null)

        if [ $? -ne 0 ] || [ -z "$downloaded_file" ]; then
            echo "❌ No pude descargar: $input" >&2
            continue
        fi

        file="$downloaded_file"
        echo "✅ Descargado: $(basename "$file")" >&2
    else
        file="$input"
        if [ ! -f "$file" ]; then
            echo "❌ No encontré: $file" >&2
            continue
        fi
    fi

    txt_file="${file%.*}.txt"
    output_dir="$(dirname "$file")"

    # Try Groq first, fallback to local Whisper
    if [ -n "$GROQ_API_KEY" ]; then
        echo "🎙️ Transcribiendo (Groq): $(basename "$file")..." >&2
        if transcribe_groq "$file" "$txt_file"; then
            echo "✅ Listo: $txt_file" >&2
            TRANSCRIPTS+=("$txt_file")
            continue
        fi
        echo "⚠️  Groq falló, usando Whisper local..." >&2
    fi

    echo "🎙️ Transcribiendo (Whisper local): $(basename "$file")..." >&2
    if transcribe_whisper "$file" "$output_dir"; then
        echo "✅ Listo: $txt_file" >&2
        TRANSCRIPTS+=("$txt_file")
    else
        echo "❌ Error transcribiendo: $(basename "$file")" >&2
    fi
done

echo "" >&2
echo "🏁 Terminado." >&2

# Output transcript paths (one per line) for piping to other tools
for t in "${TRANSCRIPTS[@]}"; do
    echo "$t"
done
