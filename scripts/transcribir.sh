#!/bin/bash
# Transcribe video/audio files or social media URLs using Whisper (Spanish)
# Usage: ./transcribir.sh archivo.mp4 [archivo2.mp4 ...]
#        ./transcribir.sh https://www.instagram.com/reel/xxx
# Output: .txt file with transcription + prints path for further processing

export PATH="/Users/lean/Library/Python/3.9/bin:/opt/homebrew/bin:$PATH"

DOWNLOAD_DIR="/Users/lean/Documents/script-generator/.data/downloads"
mkdir -p "$DOWNLOAD_DIR"

if [ $# -eq 0 ]; then
    echo "Uso: ./transcribir.sh archivo.mp4 [url ...]"
    echo "Acepta: archivos locales, links de Instagram, TikTok, YouTube, etc."
    exit 1
fi

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

    echo "🎙️ Transcribiendo: $(basename "$file")..." >&2

    output_dir="$(dirname "$file")"

    whisper "$file" \
        --model small \
        --language Spanish \
        --output_format txt \
        --output_dir "$output_dir" \
        --fp16 False \
        2>/dev/null

    if [ $? -eq 0 ]; then
        txt_file="${file%.*}.txt"
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
