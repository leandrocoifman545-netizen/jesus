#!/usr/bin/env python3
"""
Ad Factory — Generación masiva de imágenes con GPT-Image-1.

Uso:
  python3 generate_images.py specs.json --output ./output --creds credentials/openai.json

specs.json debe tener esta estructura:
[
  {
    "nicho": "nicho_01_oportunidad_negocio",
    "angulo": "ia_atajo",
    "filename": "img_01.png",
    "spec": {
      "escena": {"fondo": "...", "iluminacion": "...", "angulo": "..."},
      "elemento_central": {"tipo": "...", "descripcion": "..."},
      "texto_en_escena": {"objeto": "...", "texto": "...", "escritura": "..."},
      "contexto": "...",
      "estilo": "foto casual tipo iPhone, no producida"
    }
  }
]
"""
import argparse, requests, json, base64, os, time, sys

def load_key(creds_path):
    with open(creds_path) as f:
        return json.load(f).get("api_key")

def generate_one(spec_json, output_path, api_key, retries=3):
    """Genera una imagen con GPT-Image-1. Retorna True si OK."""
    if os.path.exists(output_path):
        print(f"  SKIP (exists): {output_path}")
        return True

    prompt = (
        "Generate a photorealistic image following EXACTLY these JSON specs. "
        "All text must be in SPANISH and EXACTLY as specified, written on a REAL "
        "object in the scene (NOT floating overlay). The image must look like a "
        "casual iPhone photo — NOT produced, NOT stock, NOT AI-looking:\n\n"
        f"{json.dumps(spec_json, ensure_ascii=False, indent=2)}"
    )

    for attempt in range(retries):
        try:
            r = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-image-1",
                    "prompt": prompt,
                    "n": 1,
                    "size": "1024x1536",
                    "quality": "high"
                },
                timeout=180
            )

            if r.status_code == 200:
                data = r.json().get("data", [])
                if data and data[0].get("b64_json"):
                    img = base64.b64decode(data[0]["b64_json"])
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(img)
                    print(f"  OK ({len(img)//1024}KB): {output_path}")
                    return True

            if r.status_code == 429:
                wait = 60 * (attempt + 1)
                print(f"  RATE LIMIT — waiting {wait}s (attempt {attempt+1}/{retries})")
                time.sleep(wait)
                continue

            print(f"  ERROR {r.status_code}: {r.text[:200]}")
            if attempt < retries - 1:
                time.sleep(10)

        except Exception as e:
            print(f"  EXCEPTION: {e}")
            if attempt < retries - 1:
                time.sleep(10)

    return False

def main():
    parser = argparse.ArgumentParser(description="Generate images with GPT-Image-1")
    parser.add_argument("specs", help="JSON file with image specs")
    parser.add_argument("--output", default="./output", help="Output directory")
    parser.add_argument("--creds", default="credentials/openai.json", help="OpenAI credentials JSON")
    parser.add_argument("--delay", type=int, default=5, help="Delay between images (seconds)")
    parser.add_argument("--start", type=int, default=0, help="Start from index N (skip first N)")
    args = parser.parse_args()

    api_key = load_key(args.creds)
    with open(args.specs) as f:
        specs = json.load(f)

    total = len(specs)
    ok = 0
    failed = []

    print(f"=== GENERATING {total} IMAGES WITH GPT-IMAGE-1 HIGH ===\n")

    for i, item in enumerate(specs):
        if i < args.start:
            continue

        nicho = item["nicho"]
        filename = item["filename"]
        output_path = os.path.join(args.output, nicho, filename)

        print(f"[{i+1}/{total}] {nicho}/{filename}...", flush=True)
        if generate_one(item["spec"], output_path, api_key):
            ok += 1
        else:
            failed.append(f"{nicho}/{filename}")

        if i < total - 1:
            time.sleep(args.delay)

    print(f"\n=== RESULT: {ok}/{total} generated ===")
    if failed:
        print(f"\nFAILED ({len(failed)}):")
        for f in failed:
            print(f"  - {f}")

if __name__ == "__main__":
    main()
