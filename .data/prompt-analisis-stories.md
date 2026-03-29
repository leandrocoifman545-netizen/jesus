# Prompt: Análisis de Stories de Instagram

> Copiar y pegar al iniciar una conversación nueva de análisis de stories.
> Fase 1 (inventario + extracción) → Sonnet o agentes
> Fase 2 (lectura visual + análisis) → Opus en conversación nueva

---

## PROMPT FASE 1 (Sonnet — mecánico)

```
Necesito que prepares los datos de una carpeta de stories de Instagram para análisis.

Carpeta: [RUTA]

Ejecutá en este orden:

1. INVENTARIO: `find "[RUTA]" -type f ! -name ".DS_Store" | sort` — contame cuántas imágenes, cuántos videos, cuántos creadores, cuántas fechas.

2. FRAMES: Extraé 1 frame cada 3 segundos de cada video (max 5 frames):
```bash
ffmpeg -i "$video" -vf "fps=1/3" -q:v 2 -frames:v 5 "$outdir/${fname}_%02d.jpg" -y -loglevel error
```
Guardar en `[RUTA]/_frames/{creador}/{fecha}/`

3. AUDIO: Extraé audio WAV 16kHz mono de cada video:
```bash
ffmpeg -i "$video" -vn -acodec pcm_s16le -ar 16000 -ac 1 "$outdir/${fname}.wav" -y -loglevel error
```
Guardar en `[RUTA]/_audio/{creador}/{fecha}/`

4. FILTRAR SILENCIO: Descartá audios con mean_volume < -50dB.

5. IDENTIFICAR TALKING HEADS: Los que tienen mean_volume > -20dB Y duración > 5s son probablemente habla. Listalos.

6. TRANSCRIBIR con Groq Whisper (key en .env.local, GROQ_API_KEY):
```bash
curl -s -X POST "https://api.groq.com/openai/v1/audio/transcriptions" \
  -H "Authorization: Bearer $GROQ_KEY" \
  -F "file=@$wav" \
  -F "model=whisper-large-v3" \
  -F "language=es" \
  -F "response_format=text"
```
Solo los talking heads. Rate limit 1s entre requests.

7. LIMPIAR TRANSCRIPCIONES: Eliminar alucinaciones de Whisper — textos genéricos tipo "Suscríbete al canal", "Gracias por ver el video" sobre audio que claramente es música.

8. GUARDAR: `[RUTA]/_transcripts.md` con las transcripciones limpias.

9. RESUMEN FINAL: Dame una tabla con todo listo para la Fase 2:
- Total imágenes, frames extraídos, audios con habla, transcripciones
- Lista de fechas por creador
- Si archivos de un creador están repartidos en múltiples carpetas, decímelo

No analices nada todavía. Solo prepará los datos.
```

---

## PROMPT FASE 2 (Opus — conversación nueva)

```
Voy a pedirte que analices stories de Instagram de [CANTIDAD] creadores. Los datos ya están preparados.

Ejecutá el skill `/analisis-stories` que está en `.claude/skills/analisis-stories/SKILL.md`. Leé ese archivo PRIMERO.

Carpeta: [RUTA]
- _frames/ tiene los frames de video
- _audio/ tiene los audios
- _transcripts.md tiene las transcripciones limpias de los talking heads
- [CANTIDAD] creadores: [NOMBRES]
- [CANTIDAD] fechas, [CANTIDAD] piezas totales

IMPORTANTE:
- VER las imágenes vos directamente con Read. No delegar a agentes.
- Leer secuencias COMPLETAS en orden (1.jpg, 2.jpg, 3.jpg...) — mínimo 3 fechas por creador.
- Leer las transcripciones de _transcripts.md.
- Si archivos están repartidos en múltiples carpetas, reconstruir por fecha.

[SI ES PARA ADP]:
- Cruzar contra nuestro sistema de stories: stories-secuencias-tipo.md, stories-formatos-22.md, stories-persuasion-engine.md, stories-constructor-jesus.md
- Cruzar contra avatares-adp.md, motor-audiencia.md, inteligencia-compradores.md
- Scripts adaptados al tono de Jesús (verificar con jesus-tono-adp-nuevo.md en memoria)
- Clasificar cada secuencia por: tipo nuestro + capa de calentamiento + qué nos sirve

[SI ES GENERAL]:
- Patrones visuales con parámetros replicables (px, %, hex, posición)
- Arquetipos de secuencia con estructura story-by-story
- Reglas de diseño universales

Output en:
- `[RUTA]/ANALISIS-COMPLETO-STORIES.md` (general)
- `.data/stories-patrones-{nombre}.md` (si es para ADP)
```

---

## VARIANTE: Todo en 1 conversación (si no querés partir)

```
Necesito analizar stories de Instagram de [RUTA].

1. PRIMERO: Hacé el inventario, extraé frames y audio, transcribí los talking heads con Whisper. No analices nada todavía, solo prepará los datos.

2. DESPUÉS: Ejecutá el skill `/analisis-stories`. Leé las imágenes vos directamente, en orden, mínimo 3 fechas completas por creador. Cruzá con [nuestro sistema ADP / patrones generales].

3. REGLAS: No delegar a agentes. No leer salteado. No preguntar si usar ffmpeg — usarlo. Filtrar alucinaciones de Whisper.
```
