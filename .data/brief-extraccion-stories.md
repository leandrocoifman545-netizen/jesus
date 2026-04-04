# Brief de Extracción — Stories de Creador (Dubai/España)

> **INSTRUCCIÓN:** Este brief es para EXTRAER datos de archivos visuales. NO analizar, NO interpretar, NO buscar patrones. Solo describir lo que ves con precisión.

---

## TU TAREA

Vas a recibir carpetas con fotos y videos de stories de Instagram de un creador. Tu trabajo es abrir CADA archivo en orden cronológico y llenar una tabla con lo que ves. Nada más.

**REGLAS:**
1. Abrir CADA imagen con Read. No saltear ninguna.
2. Los archivos están numerados (1.jpg, 2.jpg...) o con IMG_XXXX. Leerlos en orden.
3. Para VIDEOS (.mov, .mp4): extraer 3 frames con ffmpeg + extraer audio + transcribir con Groq si hay habla.
4. NO interpretar. NO decir "esto genera confianza" o "esto es un falso clímax". Solo describir.
5. Guardar el output en el archivo indicado.

---

## PROCESO PARA CADA CARPETA DE FECHA

### Fotos (.jpg, .png, .heic)
```
Abrir con Read → registrar en la tabla
```

### Videos (.mov, .mp4)
```bash
# 1. Extraer 3 frames
ffmpeg -i "$VIDEO" -vf "fps=1/3" -q:v 2 -frames:v 3 "/tmp/frames_$(basename "$VIDEO" .MOV)_%02d.jpg" -y -loglevel error

# 2. Extraer audio
ffmpeg -i "$VIDEO" -vn -acodec pcm_s16le -ar 16000 -ac 1 "/tmp/audio_$(basename "$VIDEO" .MOV).wav" -y -loglevel error

# 3. Verificar si hay habla (volumen > -20dB)
ffmpeg -i "/tmp/audio_XXXX.wav" -af volumedetect -f null /dev/null 2>&1 | grep "mean_volume"

# 4. Si mean_volume > -20dB Y duración > 5s → transcribir con Groq
# PREGUNTAR AL USUARIO POR LA GROQ_API_KEY si no la tenés
curl -s -X POST "https://api.groq.com/openai/v1/audio/transcriptions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F "file=@/tmp/audio_XXXX.wav" \
  -F "model=whisper-large-v3" \
  -F "language=es" \
  -F "response_format=text"
```

Ver los frames extraídos con Read.

---

## TABLA DE REGISTRO (llenar para CADA story)

```markdown
| # | Archivo | Tipo | Layout | Texto principal | Texto secundario | Palabra acento | Color acento | Posición texto | Tipo foto/video | Overlay % | Stickers | Si video: hablado/música/ambiente | Transcripción | Duración estimada |
```

### Qué poner en cada campo:

- **#**: Número secuencial dentro de la fecha
- **Archivo**: Nombre del archivo (1.jpg, IMG_2042.MOV)
- **Tipo**: foto / video-TH (talking head) / video-lifestyle / video-montaje / video-screenrec
- **Layout**: Cuál de estos: (1) foto fullbleed + texto overlay, (2) foto arriba + texto abajo, (3) collage/split, (4) fondo sólido + texto, (5) screenshot embebido + contexto, (6) sticker IG central, (7) foto + emoji/sticker + texto, (8) otro (describir)
- **Texto principal**: Transcripción EXACTA del texto más grande/prominente
- **Texto secundario**: Otros textos visibles
- **Palabra acento**: Qué palabra está en color diferente (si hay)
- **Color acento**: Color aproximado (rojo, azul, naranja, blanco, etc.)
- **Posición texto**: superior / centro / inferior
- **Tipo foto/video**: selfie, tercera persona, espejo, screenshot, fondo sólido, lifestyle, con otras personas, antigua, producto
- **Overlay %**: Cuánto del frame cubre un overlay oscuro (0%, 20%, 40%, 60%)
- **Stickers**: Poll, countdown, pregunta, mención, emoji, ubicación, música, ninguno
- **Si video**: TH hablando / música de fondo / ambiente / combinación
- **Transcripción**: Lo que dice hablando (de Groq o manual si es corto)
- **Duración estimada**: Solo para videos

---

## NOTAS ADICIONALES A REGISTRAR POR FECHA

Después de la tabla de cada fecha, agregar una sección breve:

```markdown
### Notas [FECHA]
- **Secuencia aparente:** ¿Las stories de esta fecha parecen contar algo juntas o son sueltas?
- **Persona visible:** ¿Se ve la cara del creador? ¿Hay otras personas?
- **Idioma:** ¿Español de España? ¿Otro?
- **Locación visible:** ¿Dónde parece estar? (gym, restaurante, Dubai, avión, etc.)
- **CTA:** ¿Hay algún call to action? ¿Keyword? ¿Link?
```

---

## FORMATO DE ENTREGA

Guardar TODO en UN archivo markdown:

```
/Users/lean/Documents/script-generator/.data/extraccion-stories-chunk-[N].md
```

Donde [N] es el número de tu chunk (1, 2, 3, o 4).

El archivo debe tener:
1. Header con las fechas que cubriste
2. Una sección `## [FECHA]` por cada carpeta
3. La tabla completa de esa fecha
4. Las notas de esa fecha

---

## IMPORTANTE

- Si un archivo .heic no se puede abrir con Read, intentar con ffmpeg para convertirlo: `ffmpeg -i archivo.heic archivo.jpg`
- Si un video es muy largo (>60s), extraer más frames: `fps=1/5` y `-frames:v 8`
- NO omitir archivos. Si hay 64 archivos en una carpeta, los 64 se registran.
- La calidad de este inventario determina la calidad del análisis posterior. Ser PRECISO.
