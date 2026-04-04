# Skill: Análisis de Stories de Instagram

> Analiza stories/destacadas descargadas. Extrae patrones visuales, de persuasión, de secuencia y de copy.
> **Un análisis de 1 referencia al nivel completo vale más que 20 superficiales.**

---

## HERRAMIENTAS

| Herramienta | Cuándo usar |
|---|---|
| `Read` (imágenes) | SIEMPRE — primera pasada manual, VER con tus propios ojos |
| `ffmpeg` | SIEMPRE — frames cada 3-5s, audio WAV 16kHz mono |
| Groq Whisper (pago) | Solo si mean_volume > -20dB Y duración > 5s |
| `analyze-video-visual.mjs` | Para los 3-5 videos más interesantes. Necesita `export $(grep GEMINI_API_KEY .env.local | xargs)` |
| Referencias existentes | SIEMPRE — `.data/stories-patrones-*.md`, memoria, inventario |

---

## ANTES DE ANALIZAR — Leer estos archivos (OBLIGATORIO)

1. **`.data/metodologia-analisis-profundo.md`** — 7 axiomas + 8 pasadas + 5 lentes + 7 dimensiones + transferencia + predicción + autocrítica
2. **`.claude/skills/analisis-stories/metodologia-stories.md`** — 6 dimensiones extra (#22-#27) + 5 esqueletos de destacada + 10 tipos autoridad + 9 arquetipos + 16 layouts
3. **`.data/patrones-universales-stories.md`** — biblioteca de patrones acumulados

**Si no leíste estos 3 archivos, el análisis va a ser superficial. No empezar sin leerlos.**

---

## TRIAGE OBLIGATORIO (antes de analizar)

Asignar Tier ANTES de empezar. Decirle al usuario:

| Tier | Qué es | Tiempo | Cuándo |
|---|---|---|---|
| **Tier 1: Benchmark** | 8 pasadas + 5 lentes + 13 dimensiones + transferencia completa | 30-45 min | Algo que vuela la cabeza. 1 de cada 10 |
| **Tier 2: Técnica** | Enfocado en 1-2 cosas que hace bien. Qué robar | 5-10 min | Hace algo específico nuevo |
| **Tier 3: Catálogo** | 1 línea: quién, qué, qué tiene de interesante | 1 min | No agrega nada nuevo |

**NUNCA más de 3 Tier 1 por conversación.** Si hay más, hacer en tandas.

---

## FORMATO DE OUTPUT OBLIGATORIO (el linter valida esto)

El análisis se guarda como markdown. **Cada sección DEBE ser un `##` header separado.** El linter `validate-analysis.mjs` chequea presencia y profundidad mínima de cada sección. Si falta algo, bloquea el guardado.

### Secciones requeridas (Tier 1):

```
## FASE -1: Cruce con referencias
(qué ya se sabe de este creador/formato, qué buscar de nuevo. Mín 50 palabras)

## Inventario de stories
(story por story: #, formato, texto exacto, función. Mín 100 palabras)

## Pasada 2 — Decisiones y por qué
(por qué cada decisión está donde está. Mín 50 palabras)

## Pasada 3 — Ausencias
(lo que NO hay y por qué es deliberado. Mín 5 ausencias listadas, mín 80 palabras)

## Pasada 4 — Modelos mentales
(cómo PIENSA el creador. Mín 3 modelos, mín 100 palabras)

## Pasada 5 — Cadena de confianza
(SÍes internos del viewer en orden. Mín 50 palabras)

## Pasada 6 — Mapa de símbolos
(qué comunica cada objeto/elemento. Mín 8 filas en tabla, mín 100 palabras)

## Pasada 7 — Mapa de ritmo
(duración por sección + por qué lento/rápido. DEBE tener tabla)

## Pasada 8 — Incompletitud estratégica
(qué da gratis 70% y qué retiene 30%. Mín 80 palabras)

## Lente A — Comparación con fracasos
## Lente B — Audiencia
## Lente C — Producibilidad
## Lente D — Embudo
## Lente E — Sonido apagado

## Dimensiones
(D1-D7 + D22-D27. Mín 100 palabras total)

## Predicciones
(3 "¿Qué pasaría si...?" respondidas. Mín 3 items, mín 100 palabras)

## Transferencias
(mín 5 con formato: PRINCIPIO / EN LA REFERENCIA / EN JESÚS / QUÉ CAMBIA / QUÉ SE MANTIENE / RESTRICCIONES / OPORTUNIDADES. Mín 5 code blocks)

## Autocrítica
(5 preguntas con respuesta escrita >1 línea. Mín 5 items, mín 100 palabras)

## Síntesis — FASE 8
(máx 3 hallazgos rankeados con prueba de eliminación. Mín 100 palabras)
```

**Para Tier 2:** Solo las secciones relevantes, pero FASE -1, inventario, y transferencias son SIEMPRE obligatorias.

### REGLA DE GUARDADO (enforcement)

**SIEMPRE guardar el análisis en archivo ANTES de presentar al usuario.**
- Nombre: `.data/analisis-{creador}-{tipo}.md` (ej: `analisis-augus-nievas-mi-historia.md`)
- Si no se sabe el creador: `.data/analisis-desconocido-mi-historia.md`
- El hook `validate-analysis.mjs` se ejecuta al guardar. Si falta alguna sección → bloquea y dice qué falta.
- Completar lo que falta → volver a guardar → cuando pase, presentar al usuario.
- **NUNCA presentar el análisis en conversación sin haberlo guardado primero.** Si sale en conversación pero no en archivo, el linter no validó nada.

---

## PROCESO COMPLETO

### FASE -1: Cruce con referencias existentes (PASO CERO)

**ANTES de ver un solo frame:**
1. Identificar el CREADOR (del primer frame o nombre de archivo)
2. Buscar si ya fue analizado:
   - `reference_stories_highlights_10_creadores.md`
   - `reference_stories_patrones_21_analisis.md`
   - `reference_estetica_stories_140.md`
   - `.data/stories-inteligencia-8-analisis.md`
   - `.data/destacadas-mi-historia-inventario.md`
3. Si ya tiene referencia → leerla COMPLETA
4. Escribir output: "Lo que ya sé" + "Qué buscar de nuevo"

### FASE 0: Contexto teórico

Leer para tener marco de referencia:
- `.data/stories-patrones-reales-3-creadores.md`
- `.data/stories-secuencias-tipo.md`
- `.data/stories-cruce-descubrimientos-finales.md` (si existe)
- Referencias de memoria relevantes

### FASE 1: Inventario + Pre-procesamiento (5 min)

1. Listar archivos con `find`
2. Separar por creador si hay subcarpetas
3. Si hay SCREEN RECORDINGS: extraer primer frame → VER con Read → identificar creador real
4. Si hay carpetas "Editadas": priorizar editadas para análisis
5. Output: tabla resumen (creador, imágenes, videos, fechas, total)

### FASE 2: Extracción de datos (5-10 min)

```bash
# Frames cada 3-5 segundos
ffmpeg -i "$video" -vf "fps=1/3" -q:v 2 -frames:v 5 "$outdir/${fname}_%02d.jpg" -y -loglevel error

# Audio WAV 16kHz mono
ffmpeg -i "$video" -vn -acodec pcm_s16le -ar 16000 -ac 1 "$outdir/${fname}.wav" -y -loglevel error

# Filtrar silencio
vol=$(ffmpeg -i "$wav" -af volumedetect -f null /dev/null 2>&1 | grep "mean_volume" | awk '{print $5}')
# > -20dB = habla probable → transcribir con Groq
# < -20dB = música/ambiente → NO transcribir

# Transcribir con Groq (pago)
curl -s -X POST "https://api.groq.com/openai/v1/audio/transcriptions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F "file=@$wav" -F "model=whisper-large-v3" -F "language=es" -F "response_format=text"
```

### FASE 3: Lectura visual — EN ORDEN (10-15 min)

**REGLA:** Leer TODAS las stories de una fecha EN ORDEN. NO saltear.

**Sampling si hay 100+ imágenes:** Elegir 5-7 días que cubran: día temprano, día tardío, día con muchas stories, día con pocas, día con editadas.

Para cada story registrar campos de la tabla en `metodologia-stories.md`.

### FASE 4: Análisis por creador (las 8 pasadas + lentes + dimensiones)

Seguir la metodología de `.data/metodologia-analisis-profundo.md`:
- **8 pasadas** (superficie → decisiones → ausencias → modelos mentales → cadena confianza → símbolos → ritmo → incompletitud)
- **5 lentes** (fracasos → audiencia → producibilidad → embudo → sonido apagado)
- **7+6 dimensiones** (D1-D7 + D22-D27 de `metodologia-stories.md`)
- **3 predicciones** ("¿Qué pasaría si...?")
- **Transferencias** (mín 5 con 7 campos)
- **Autocrítica** (5 preguntas con respuesta escrita)

### FASE 5: Cruce con referencias + patrones

1. Para cada hallazgo: ¿CONFIRMA algo existente o es NUEVO?
2. Actualizar `.data/patrones-universales-stories.md` con confirmaciones/nuevos patrones

### FASE 8: Síntesis (DESPUÉS de todo lo anterior)

1. **CONTRASTAR:** ¿Qué hace el creador fuerte que el débil NO hace?
2. **CONECTAR:** ¿Qué puede usar Jesús MAÑANA? ¿Qué CAMBIA cómo pensamos?
3. **COMPRIMIR + RANKEAR:** Máx 3 hallazgos. Prueba de eliminación: "si saco esto, ¿se pierde algo?"
4. **VALIDAR:** Para el #1: "¿Si Jesús NO supiera esto, qué cambiaría?"

---

## ERRORES A EVITAR

1. **NUNCA delegar lectura visual a agentes.** VER las imágenes con Read. Siempre.
2. **NUNCA leer stories salteadas.** Todas en orden, fecha por fecha.
3. **NUNCA analizar video sin extraer audio.** Copy hablado = tan valioso como visual.
4. **NUNCA preguntar si usar ffmpeg o Whisper.** Usarlas directamente.
5. **Filtrar alucinaciones de Whisper.** mean_volume > -20dB Y duración > 5s → habla. Si no → descartar.
6. **Separar DATOS de OPINIONES.** Marcar explícitamente.
7. **No inventar métricas.** Sin views/engagement, no asumir performance.
8. **NUNCA delegar síntesis a subagentes.** SIEMPRE manual.
9. **NUNCA +5 videos Tier 1 por vez.** Tandas de 3. Mejor 3 perfectos que 50 basura.
10. **Screen recordings mezclan cuentas.** Verificar creador del primer frame ANTES de analizar.
11. **Los scores de Gemini están inflados.** Solo ranking relativo, no absoluto.
12. **El benchmark es el análisis de Joaco Coronel** (`.data/analisis-joaco-coronel-benchmark.md`).
13. **Las 6 dimensiones extra (#22-#27) son OBLIGATORIAS**, no opcionales.
14. **Cuando el volumen > profundidad, DECIRLO.** No intentar cubrir todo → mediocridad.

---

## REGLAS

1. VER con Read, NUNCA delegar a agentes.
2. Secuencias completas en orden.
3. Audio siempre. ffmpeg + Whisper + filtrar alucinaciones.
4. No preguntar, hacer.
5. Datos vs opiniones. Marcar explícitamente.
6. No inventar métricas.
7. Pensar en software (px, %, hex, posición).
8. Pensar en general (patrones para cualquier cliente).
9. Cross-carpeta (reconstruir por fecha).
10. Tono verificado con `jesus-tono-adp-nuevo.md` si se adapta a Jesús.
11. Editadas primero. Raw solo para comparar.
12. Sampling obligatorio con carpetas grandes.
13. Evolución temporal si hay 3+ meses.
14. Brutalmente específico. "Texto blanco bold 48px centrado overlay negro 50%" > "usan texto sobre fotos".
15. 3+ = patrón. 1 vez = anécdota.

---

## ARCHIVOS DE REFERENCIA

### Siempre:
- `/Users/lean/Desktop/historias/ANALISIS-COMPLETO-STORIES.md`
- `.data/stories-patrones-reales-3-creadores.md`

### Análisis previos:
- `.data/stories-inteligencia-8-analisis.md` — 38+ modelos mentales, 80 símbolos, cadenas confianza
- `.data/stories-cruce-descubrimientos-finales.md` — destacadas=lanzamiento permanente, keywords segmentación
- `.data/stories-hallazgos-49-videos.md` — 5 esqueletos, 7 técnicas, sistema dual
- `.data/destacadas-mi-historia-inventario.md` — 6 benchmarks "Mi Historia" comparados

### Si es para ADP:
- `.data/avatares-adp.md` — 8 avatares con pesos
- `.data/motor-audiencia.md` — tensiones, objeciones, vocabulario
- `.data/inteligencia-compradores.md` — 562 compradores reales
- Memoria: `jesus-tono-adp-nuevo.md` — tono, muletillas, frases fórmula

### Estética (si aplica):
- Memoria: `reference_estetica_stories_140.md` — 6 specs de reproducción para software
