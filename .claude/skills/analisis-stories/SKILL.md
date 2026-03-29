# Skill: Análisis de Stories de Instagram

> Analiza stories descargadas de cualquier creador. Extrae patrones visuales, de persuasión, de secuencia y de copy hablado. Output aplicable tanto a ADP como a cualquier cliente futuro.
> **Objetivo final:** Desarrollar CRITERIO real — no teoría genérica — basado exclusivamente en lo que se VE en el material. Todo patrón debe ser lo suficientemente concreto para convertirse en un template, una regla o un parámetro programático para el software de stories.

---

## HERRAMIENTAS DISPONIBLES (usar TODAS las relevantes)

| Herramienta | Qué hace | Cuándo usar |
|-------------|----------|-------------|
| `Read` (imágenes/video frames) | VER con tus propios ojos | SIEMPRE — primera pasada manual |
| `ffmpeg` (extracción) | Frames, audio, comprimir | SIEMPRE — datos crudos |
| `video-analyze.mjs --tipo stories` | Análisis Gemini 2.5 Flash del video completo | Complemento después de ver manualmente. Bueno para estructura narrativa, malo para atribución |
| `analyze-video-visual.mjs` | Frame-by-frame con Gemini (colores, tipografía, textos exactos, layouts) | Para los 3-5 videos más interesantes. Da paleta visual real, textos literales, posiciones |
| Groq Whisper | Transcripción de audio hablado | Solo si mean_volume > -20dB (ver filtrado abajo) |
| Referencias existentes | Cruzar con análisis previos | SIEMPRE — `.data/stories-patrones-*.md`, memoria de referencias |

**IMPORTANTE:** `analyze-video-visual.mjs` necesita `export $(grep GEMINI_API_KEY .env.local | xargs)` antes de correr (no usa dotenv). Modelo actualizado a `gemini-2.5-flash` (2026-03-28).

---

## CUÁNDO USAR

Cuando el usuario pasa una carpeta con stories descargadas (imágenes y/o videos) y pide analizarlas. Detectar: "analizá estas stories", "mirá estas historias", "extraé patrones", "qué hacen bien", carpeta con imágenes/videos de stories.

---

## ERRORES A EVITAR (aprendidos en sesión del 2026-03-28)

1. **NUNCA delegar la lectura visual a agentes.** Los agentes no tienen criterio visual. VER las imágenes directamente con Read. Siempre.
2. **NUNCA leer stories salteadas.** Leer TODAS las de una fecha EN ORDEN (1.jpg, 2.jpg, 3.jpg...) para entender el arco narrativo real.
3. **NUNCA analizar video sin extraer audio.** El copy hablado es tan valioso como lo visual. Siempre extraer audio + transcribir.
4. **NUNCA preguntar si usar ffmpeg o Whisper.** Las herramientas están disponibles, usarlas directamente.
5. **Filtrar alucinaciones de Whisper.** Si el audio es música/ambiente, Whisper genera texto fantasma ("Suscríbete al canal"). Filtrar por: si mean_volume > -20dB Y duración > 5s → probablemente habla. Si no, descartar. Post-transcripción: eliminar textos genéricos que no coinciden con el contexto.
6. **Si archivos de un creador están repartidos en varias carpetas**, reconstruir las secuencias cruzando por FECHA (los números de archivo dan el orden dentro de cada fecha).
7. **Separar DATOS de OPINIONES.** "El texto está en rojo" es dato. "Esto probablemente funciona bien" es opinión. Marcar la diferencia.
8. **No inventar métricas.** No tenemos views ni engagement. Solo analizamos lo que VEMOS.
9. **NUNCA delegar la síntesis final a un subagente.** En sesión 2026-03-28, delegué la síntesis consolidada y el agente no tenía contexto de ADP/avatares/tono → conclusiones superficiales. La síntesis SIEMPRE manual.
10. **Los scores de Gemini están inflados.** Gemini tiende a dar 8-9.5 a todo. NO presentar scores absolutos como data objetiva — solo sirve el ranking RELATIVO entre videos. No decir "score 9.5" sino "el más alto del lote".
11. **Screen recordings capturan MÚLTIPLES cuentas.** Gemini mezcla y atribuye mal. Siempre verificar creador real del primer frame ANTES de correr análisis automáticos. En 22 videos, 5 estaban mal atribuidos.
12. **Verificar modelos de Gemini antes de correr scripts.** `analyze-video-visual.mjs` usaba gemini-2.0-flash (deprecado). Ya actualizado a 2.5-flash. Si falla con 404, verificar modelo.

---

## PROCESO COMPLETO

### FASE 0: Contexto teórico (ANTES de ver una sola imagen)

**Leer primero para tener marco de referencia:**

1. **Análisis previos** (lo que ya sabemos):
   - `/Users/lean/Desktop/historias/ANALISIS-COMPLETO-STORIES.md` — análisis visual previo
   - `.data/stories-patrones-reales-3-creadores.md` — patrones ya extraídos
   - `.data/stories-secuencias-tipo.md` — tipos de secuencia existentes
   - `.data/stories-persuasion-engine.md` — motor de persuasión
   - `.data/stories-formatos-22.md` — formatos identificados
   - `.data/stories-reglas.md` — reglas existentes

2. **Curso StoryMakers** (la teoría del creador):
   - `.data/stories-course/` — 38 transcripciones del curso completo. Esto da el "por qué" detrás de los patrones.

3. **Referencias de memoria** (análisis de sesiones anteriores):
   - `reference_stories_patrones_21_analisis.md`, `reference_lanzamiento_stories_framework.md`, etc.

**Output de Fase 0:** Mapa mental de lo que ya sabemos → esto permite detectar qué CONFIRMA y qué es NUEVO en el análisis visual.

---

### FASE 1: Inventario + Pre-procesamiento (5 min)

1. Listar todos los archivos de la carpeta con `find`
2. Separar por creador (si hay subcarpetas)
3. Contar: imágenes vs videos, por fecha, total
4. Detectar si archivos están repartidos en múltiples carpetas (cruzar por fecha)
5. **Si hay SCREEN RECORDINGS (.MP4 grandes):** estos son grabaciones de pantalla que capturan MÚLTIPLES stories de MÚLTIPLES cuentas seguidas. Pre-procesar:
   - Extraer duración con `ffprobe`
   - Extraer primer frame de CADA video con ffmpeg → VER con Read para identificar creador real
   - **CRÍTICO:** Gemini confunde creadores dentro de screen recordings. En sesión 2026-03-28 atribuyó mal 5 de 22 videos. SIEMPRE verificar manualmente quién es quién.
   - Si un video es muy grande (>500MB), comprimir con: `ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset fast -vf "scale=720:-2" -acodec aac -b:a 128k output.mp4`
   - Descartar videos que NO son stories (Lives de IG, reels compartidos, etc.)
6. **Detectar carpetas "Editadas":** cuando una fecha tiene subcarpeta `Editadas/`, esas son las versiones PUBLICADAS. Priorizar SIEMPRE editadas para el análisis. Las raw son referencia para entender qué se agregó/quitó en edición (esto define qué debe hacer el software).
7. Output: tabla resumen

```
| Creador | Imágenes | Videos | Fechas | Editadas? | Total | Carpetas |
```

**Si son screen recordings, tabla adicional:**
```
| # | Archivo | Duración | Tamaño | Creador REAL (del frame) | Tipo (story/live/otro) |
```

### FASE 2: Extracción de datos (5-10 min)

**2a. Frames de video:**
```bash
# 1 frame cada 3 segundos, max 5 frames por video
ffmpeg -i "$video" -vf "fps=1/3" -q:v 2 -frames:v 5 "$outdir/${fname}_%02d.jpg" -y -loglevel error
```

**2b. Audio de videos:**
```bash
# Extraer audio WAV 16kHz mono para Whisper
ffmpeg -i "$video" -vn -acodec pcm_s16le -ar 16000 -ac 1 "$outdir/${fname}.wav" -y -loglevel error
```

**2c. Filtrar silencio:**
```bash
# Descartar si mean_volume < -50dB (silencio)
vol=$(ffmpeg -i "$wav" -af volumedetect -f null /dev/null 2>&1 | grep "mean_volume" | awk '{print $5}')
```

**2d. Identificar talking heads (habla real):**
- mean_volume > -20dB Y duración > 5s → probable habla → transcribir
- mean_volume entre -20dB y -40dB → probable música/ambiente → marcar como MÚSICA, no transcribir
- Esto evita alucinaciones de Whisper

**2e. Transcribir solo los talking heads con Groq Whisper:**
```bash
curl -s -X POST "https://api.groq.com/openai/v1/audio/transcriptions" \
  -H "Authorization: Bearer $GROQ_KEY" \
  -F "file=@$wav" \
  -F "model=whisper-large-v3" \
  -F "language=es" \
  -F "response_format=text"
```
- Usar la key de `.env.local` (`GROQ_API_KEY`)
- Rate limit: 1 segundo entre requests
- Post-filtro: descartar transcripciones genéricas ("Suscríbete al canal", "Gracias por ver el video") — son alucinaciones

### FASE 3: Lectura visual — Secuencias completas en orden (10-15 min)

**REGLA CRÍTICA:** Leer TODAS las stories de una fecha EN ORDEN. NO leer salteado.

**Reconstrucción cross-carpeta:** si los archivos de un creador están en HISTORIAS/, HISTORIAS 2/, etc., mapear por fecha y reconstruir la secuencia unificada.

#### Estrategia de sampling (OBLIGATORIO si hay 100+ imágenes)

NO intentar ver todas las imágenes de golpe — cada imagen consume ~1000-2000 tokens de contexto. Para carpetas grandes, hacer **sampling estratégico**:

**Por cada creador, elegir 5-7 DÍAS completos que cubran:**
1. **Un día temprano** (primera fecha disponible) → ver punto de partida
2. **Un día tardío** (última fecha disponible) → ver hacia dónde EVOLUCIONÓ
3. **Un día con muchas stories** (10+) → ver arco narrativo completo
4. **Un día con pocas stories** (3-5) → ver qué hace cuando es conciso
5. **Un día con subcarpeta "Editadas"** → comparar raw vs publicado
6. (Opcional) **Un día con CTA visible** → mecánica de venta
7. (Opcional) **Un día atípico** (formato distinto al resto) → diversidad

Para cada día: abrir TODAS las imágenes en orden numérico (1.jpg, 2.jpg...) + los frames correspondientes de `_frames/` si hay videos. **Cada día = UNA SECUENCIA = la unidad mínima de análisis.**

**Si hay pocos días (<15 por creador), leerlos TODOS.**

#### Videos: frames + transcripts como proxy

Claude NO puede reproducir .mov/.mp4. Para analizar videos:
1. Usar frames extraídos en `_frames/` (organizados por creador/fecha)
2. Cruzar con transcripciones en `_transcripts.md`
3. Preguntar: ¿qué agrega el video que una imagen no puede? ¿Cuándo eligen video vs imagen?

**Para cada story anotar:**

| Campo | Qué registrar |
|-------|--------------|
| **Layout** | Cuál de los 10 layouts base |
| **Texto H1** | Transcripción exacta del texto principal |
| **Texto H2/H3** | Textos secundarios |
| **Palabra acento** | Qué palabra está en color diferente y en qué color |
| **Color acento** | Hex aproximado |
| **Posición texto** | Tercio superior / centro / inferior |
| **Tipo de foto** | Selfie, tercera persona, screenshot, fondo sólido, IA, antigua |
| **Overlay %** | Oscurecimiento (0%, 20%, 40%, 60%, 80%) |
| **Stickers** | Poll, countdown, caja de preguntas, mención @, emoji |
| **Función** | Gancho / Desarrollo / Prueba / Pre-CTA / CTA |
| **Emoción disparada** | ¿Qué siente el viewer? (curiosidad, envidia, culpa, esperanza, urgencia, ternura, admiración, identificación, etc.) |
| **Técnica estética** | Progressive reveal / film grain / blur bokeh / screenshot embebido / foto antigua rounded / roadmap / arte clásico / collage pruebas / texto manifiesto / ninguna especial |
| **Composición espacial** | Texto en tercio superior+overlay centro / texto centrado vertical / texto izquierda alineado / distribuido full |
| **Si hay video** | ¿Es talking head, música, o ambiente? + transcripción si aplica |

**16 layouts base (10 originales + 6 de análisis 140 stories 2026-03-29):**
1. Foto fullbleed + texto overlay centrado
2. Foto mitad superior + texto mitad inferior
3. Collage / split screen (2-4 fotos)
4. Fondo sólido + texto puro
5. Screenshot embebido + texto contexto
6. Sticker de IG como elemento central
7. Foto + emoji/sticker decorativo + texto
8. Imagen generada por IA como metáfora
9. Foto antigua con estética degradada + fecha
10. Perfil de IG como prueba social
11. **Fondo blur/bokeh + texto centrado en foco** — foto lifestyle desenfocada, solo texto nítido (ref: Ivory Coast origin story)
12. **Progressive reveal** — MISMA foto en 2-4 slides, cada slide agrega 1 elemento nuevo (badge, flecha, card). El ojo detecta cambio = retención forzada (ref: Nicolas Clay Pre-Suasion)
13. **Film grain nocturno** — foto con grano analógico + baja exposición + accent naranja/dorado + espacio negativo 40%+ (ref: Only Earned Club)
14. **Arte/pintura clásica + texto moderno** — Sócrates, Steve Jobs, figuras espirituales. Elevación intelectual (ref: Consciencia MCE)
15. **Foto antigua con bordes redondeados flotante** — foto real de infancia/pasado con border-radius 16px + sombra, sobre fondo blur o negro (ref: Ivory Coast)
16. **Roadmap serpentina con badges de color** — path SVG curvo + badges numerados (verde/amarillo/rojo) + texto explicativo por paso (ref: Content Project)

### FASE 4: Análisis por creador (5 min cada uno)

#### 4.1 Identidad Visual
- Paleta (3-4 colores con hex aproximado)
- Tipografía (nativa IG: Classic/Strong/Modern)
- Nivel de producción (bajo/medio/alto)
- Tratamiento fotográfico (saturación, oscurecimiento, filtro)
- Branding (logo, marca de agua, elementos recurrentes)

#### 4.2 Tipos de Contenido (% estimado)
- Talking head / selfie video
- Foto lifestyle + texto
- Screenshot (WhatsApp, Stripe, perfil IG, plataforma)
- Texto sobre fondo sólido
- Collage / comparativa
- Sticker interactivo (poll, pregunta, countdown)
- Behind the scenes
- Contenido educativo / framework
- Prueba social / testimonio
- Video con música (mood setter, sin habla)

#### 4.3 Técnicas de Persuasión
- Gatillos emocionales dominantes
- Tipo de prueba social: objetos tangibles (Xavi) vs screens/comprobantes (NicoFast) vs testimonios contextualizados (CreatorFound)
- Manejo de objeciones (¿las nombra o las disuelve en la narrativa?)
- Nivel Schwartz que ataca (1-5)

#### 4.4 Secuencias
- Arquetipos de secuencia usados (de los 9 catalogados — ver abajo)
- Stories por secuencia (mín/promedio/máx)
- Cómo abre y cómo cierra
- Ratio contenido/venta por posición (CTA nunca antes de story 4)
- ¿Usa doble CTA? (hablado + texto — patrón Xavi)
- ¿Usa secuencias multi-día? (open loops entre días — patrón CreatorFound)

**9 arquetipos de secuencia catalogados:**
1. Bait → Reveal → Prueba → CTA (5-7 stories)
2. Historia personal extendida (10-16 stories)
3. Analogía educativa → Lead magnet (4-6 stories)
4. Caso de alumno (4-6 stories)
5. Misterio con open loops de 1 día (6-8 stories)
6. Sueños cumplidos / gratitud (5-8 stories)
7. Q&A como contenido (4-5 stories)
8. Evento temporal / fecha especial (4-6 stories)
9. Misterio multi-día (3-4 días × 2-3 stories)

#### 4.5 Arco Emocional por Secuencia (NUEVO — análisis 140 stories 2026-03-29)

Para CADA secuencia completa, mapear la emoción que dispara cada slide:

```
Slide 1: Curiosidad → Slide 2: Intriga → Slide 3: Culpa → Slide 4: Envidia → ...
```

**Emociones base a detectar (las más frecuentes en 140 stories analizadas):**
- **Curiosidad** — open loop, pregunta, teaser
- **Intriga** — "pero algo pasó...", cliffhanger
- **Culpa leve** — "saved it and did nothing", confrontación
- **Envidia** — resultados de otros, lifestyle aspiracional
- **Identificación** — "me pasa lo mismo", dolor compartido
- **Ternura** — fotos de infancia, familia, vulnerabilidad
- **Admiración** — resultados heroicos, sacrificio
- **Urgencia** — escasez real, "5 spots only"
- **Esperanza** — "es posible", mecanismo revelado
- **Provocación** — opinión fuerte, confrontación directa

**Patrones de arco validados:**
1. **Curiosidad → Prueba apilada → Urgencia** (venta directa — Clay, Selective Exposure)
2. **Vulnerabilidad → Proceso → Resultado → Motivación** (origin story — Ivory Coast, MCE)
3. **Problema → Ejemplos → Solución → CTA** (lanzamiento producto — Only Earned)
4. **Claridad → Comprensión → Acción** (embudo educativo — Content Project)

#### 4.5b DNA Visual (firma reconocible en 0.5s)

Para cada creador, identificar las 3 decisiones de diseño que lo hacen INSTANTÁNEAMENTE reconocible:
- **Firma #1:** El elemento más repetido (color accent? tipo de foto? filtro?)
- **Firma #2:** El layout signature (blur? film grain? fondo negro?)
- **Firma #3:** El tratamiento de overlays (bordes redondeados? flechas? badges?)

Esto es lo que el software necesita: templates basados en DNA visual, no en técnicas sueltas.

**Ejemplo de DNA visual bien documentado:**
```
Only Earned Club:
  Firma 1: Film grain nocturno (grano 25-40, exposición -0.5 a -1.0 EV)
  Firma 2: Naranja/dorado (#FF8C00) accent con subrayado ondulado en 1 keyword/slide
  Firma 3: Espacio negativo 40%+ del frame, texto en tercio superior
  → En 0.5s sabés que es Only Earned por: oscuridad + grano + naranja
```

#### 4.6 CTAs
- Mecánica: keyword DM, poll pre-CTA, emoji interactivo, countdown, flecha a destacada, temporalidad ("solo mientras esta historia esté publicada")
- Keywords usadas y si las ROTA (keywords repetidas sufren decay)
- Frecuencia de CTA por secuencia
- Tono del CTA: venta directa / regalo ("te voy a regalar") / urgencia negativa ("te arrepentirás si no")
- ¿Usa doble CTA? (video hablado en story ~4 + texto keyword en story final)

#### 4.6 Copy hablado (de las transcripciones)
- Frases textuales del creador (transcribir tal cual)
- Tono de voz (formal/casual/energético/reflexivo)
- Estructura del pitch hablado (ej: [saludo] → [para quién es] → [keyword] → [clase gratuita])
- Muletillas o patrones repetidos
- ¿Compila testimonios? (patrón Xavi: 5-6 testimonios de 10s en 1 video de 60s, escalando números)

#### 4.7 Evolución temporal (OBLIGATORIO si hay 3+ meses de data)

Comparar las fechas más tempranas vs las más tardías del creador:
- **¿Cómo cambió su estilo visual?** (colores, layouts, producción)
- **¿Cómo cambió su mecánica de venta?** (CTAs más sutiles? más directos?)
- **¿Hacia qué formato optimizó?** (si dejó de usar algo → no funcionaba. Si empezó a usar algo → funciona)
- **¿Cambió la extensión de sus secuencias?** (más cortas? más largas?)
- **Lo que DEJÓ de hacer es tan informativo como lo que EMPEZÓ a hacer.**

Output: línea de evolución por creador (fecha inicio → fecha fin, qué cambió)

#### 4.8 Editado vs Raw (si hay carpetas "Editadas")

Comparar las mismas stories raw vs editadas:
- **¿Qué AGREGAN en edición?** (overlays, texto, stickers, recorte, filtros)
- **¿Qué QUITAN?** (ruido visual, fondos distractores)
- **¿Cambian el orden?** (reordenan stories para mejorar arco)
- **Esto define qué debe hacer el SOFTWARE automáticamente.**

Output: tabla de transformaciones raw→editado con frecuencia

#### 4.9 Fortalezas y Debilidades
- Qué hace bien (ser específico con ejemplos visuales concretos)
- Qué hace mal o qué falta
- NO incluir insights "obvios" — solo lo que sorprende o contradice lo esperado

### FASE 4b: Análisis visual con herramientas Gemini (5-10 min)

Para los 3-5 videos/creadores más interesantes, correr `analyze-video-visual.mjs`:

```bash
cd /Users/lean/Documents/script-generator
export $(grep GEMINI_API_KEY .env.local | xargs)
node scripts/analyze-video-visual.mjs "$VIDEO_PATH" --frames N
```

Donde N = duración en segundos / 5 (un frame cada 5 segundos aprox).

**Esto da datos que Read no da:** paleta de colores exacta, textos literales en pantalla con posición, tipografía, overlays, transiciones frame a frame.

**Output esperado:** tabla de paleta visual por creador:
```
| Creador | Fondo | Acento 1 (uso) | Acento 2 (uso) | Tipografía |
```

**Complementar con `video-analyze.mjs --tipo stories`** para análisis narrativo general. Pero NUNCA confiar en la atribución de creador de Gemini para screen recordings — siempre verificar con los frames que viste manualmente.

### FASE 4c: Análisis de música/audio más allá de la transcripción

La música NO es decorativa — es ~30% de la experiencia en stories de alta calidad.

Para cada video, registrar:
- ¿Tiene música? (nombre del track si visible en el UI de IG)
- Género: lo-fi/chill, dramática/orquestal, hip-hop/trap, R&B/melódico, sin música
- ¿Cambia la música entre stories? (modulación emocional)
- ¿La música acompaña o ES el formato? (texto+música sin habla vs música de fondo mientras habla)

**Mapa de música por tipo de secuencia (aprendido de 21 análisis, sesión 2026-03-28):**
| Tipo de secuencia | Género que funciona |
|---|---|
| Educativa/framework | Lo-fi, chill-hop |
| Teaser/anticipación | Dramática, orquestal, suspense |
| Caso de estudio/prueba social | Hip-hop, trap instrumental |
| Reflexión/personalidad | R&B melódico |
| Reto/concurso | Beat electrónico, energía alta |
| Sin música | Solo funciona si el creador tiene energía vocal ALTÍSIMA |

### FASE 5: Análisis comparativo (si hay 2+ creadores)

Tabla comparativa con todas las dimensiones del 4.1-4.7. Incluir:
- Filosofía de prueba social (objetos vs screens vs testimonios)
- Nivel Schwartz dominante
- Proporción texto/foto (varía por Schwartz: más awareness = más tolerancia a texto denso)

### FASE 5b: Cruce con referencias existentes (OBLIGATORIO)

**NUNCA analizar en el vacío.** Siempre cruzar hallazgos con lo que ya sabemos:

1. Leer las referencias relevantes de memoria:
   - `reference_lanzamiento_stories_framework.md` — Framework 7 fases (Turu + StoryMakers)
   - `reference_stories_patrones_21_analisis.md` — 21 stories analizadas (sesión 2026-03-28)
   - `reference_decime_ego_lanzamiento.md` — Reto 7 días @decime.ego
   - `reference_turu_lanzamiento.md` — Lanzamiento Turu

2. Para cada patrón nuevo, preguntar:
   - ¿Esto ya lo sabíamos? → si sí, CONFIRMA (dato más robusto)
   - ¿Esto contradice algo? → si sí, INVESTIGAR cuál es correcto
   - ¿Esto es genuinamente nuevo? → si sí, DOCUMENTAR con evidencia

3. Verificar si algún creador analizado ya tiene referencia guardada en `.data/references/ref-*.json`. Si sí, comparar el análisis nuevo con el existente. En sesión 2026-03-28, descubrimos que el pizarrón de Joaco Coronel ERA el mismo video que la referencia existente.

**Hallazgos consolidados que ya están validados (no re-descubrir):**
- CTA por DM con 1 palabra en MAYÚSCULAS es el estándar dominante (11/21 stories analizadas)
- Keywords comunes: "YO", "RETO", "LOBO", "DIEGO", "AI", "ARRANCAR", "SPRINT", "quiero"
- Refuerzo: escasez ("solo 22 accesos"), urgencia ("antes de que la borre"), cualificación inversa ("vemos si estás apto")
- Stickers interactivos: NO se usan en contenido diario. SÍ se usan en lanzamientos (@decime.ego los usa en su reto)
- Texto+foto+música SIN hablar a cámara funciona igual o mejor que hablar a cámara sin edición
- Cada creador top mantiene UNA identidad visual consistente (paleta, tipografía, tono)
- Dividir stories siempre — 1 story larga sin dividir penaliza mucho
- Cliffhanger entre días construye hábito de viewer ("mañana explico el paso a paso")
- El pizarrón es un formato validado por 2 creadores independientes (Joaco + Agus Nievas)
- La misma persona con el mismo contenido saca 6 en selfie cruda y 9+ en formato producido (texto+foto+música)

**Hallazgos consolidados de análisis de 140 stories estéticas (2026-03-29):**
- Progressive reveal (misma foto en 3-4 slides agregando 1 elemento) es la técnica de retención más poderosa — fuerza al cerebro a buscar qué cambió
- 8/8 creadores usan CTA por keyword DM, 0/8 usan link en bio
- Screenshots embebidos con bordes redondeados + sombra aparecen en 5/8 creadores — es estándar, no diferenciador
- Film grain nocturno transforma fotos casuales en contenido luxury (Only Earned)
- Subrayado ondulado de color (no highlight rectangular) bajo 1 keyword/slide es signature de los 2 creadores más premium
- Fotos de infancia con bordes redondeados sobre fondo blur = vulnerabilidad máxima instantánea
- El arco emocional universal de venta es: Hook emocional (1-2) → Desarrollo con pruebas (60-70%) → Puente a solución (1-2) → CTA keyword (1-2)
- Cada creador top tiene un "DNA visual" de 3 elementos reconocible en 0.5 segundos
- Las cifras grandes ($23k, $2M, 10K/mes) siempre van en color accent y tamaño grande — son anclas visuales
- Espacio negativo mínimo 30% del frame en los creadores más premium (Only Earned llega a 40%+)
- Secuencias de origin story pueden ser 14-40 slides si la progresión visual compensa (de fotos humildes a lifestyle)
- Los creadores más estéticos NO usan stickers nativos de IG (encuestas, countdown) en secuencias de venta — solo texto+foto producido

### FASE 6: Patrones robables (5 min)

**Regla de evidencia:** 1 vez = anécdota. 3+ veces = patrón. Solo reportar patrones. Cada patrón necesita mínimo 1 ejemplo concreto (creador/fecha/número de story).

**Tres outputs obligatorios:**

**6a. Patrones GENERALES (para cualquier cliente/software):**
- Templates visuales replicables con parámetros (layout, posición, colores, overlay)
- Técnicas de persuasión universales
- Arquetipos de secuencia con estructura story-by-story
- Reglas de diseño:
  - Safe zones: 140px top, 200px bottom
  - Máximo 3 colores por paleta
  - 1-2 palabras en color acento por story
  - Jerarquía tipográfica H1 (48-72px), H2 (28-36px), H3 (18-24px)
  - 1 punto focal por story (texto O foto, nunca compiten)
  - Switch de pronombre yo→tú en la story previa al CTA
- Copy hablado: estructura de pitch, compilaciones de testimonios, CTAs hablados

**6a-bis. Specs de reproducción para software (NUEVO — 2026-03-29):**
Para cada técnica visual identificada, documentar los parámetros exactos necesarios para reproducirla programáticamente:
- Filtros: grain amount, blur radius, exposure, contrast, saturation (números, no adjetivos)
- Tipografía: font family, weight, size en px, color hex, line-height
- Layout: posición en px desde edges, % del frame, safe zones (80px top, 200px bottom)
- Overlays: border-radius, shadow params, max-width %, opacity
- Color: hex exacto del accent, hex del texto, hex del fondo

**Referencia de specs ya documentadas:** `reference_estetica_stories_140.md` (memoria) tiene 6 specs completas:
1. Progressive Reveal (layers acumulativos sobre base image)
2. Film Grain Nocturno (grain 25-40, exposure -0.5 a -1.0 EV, saturation -15 a -25%)
3. Fondo Blur con Texto (gaussian blur radius 15-25px)
4. Screenshot Embebido (border-radius 12-16px, shadow, max 2/slide)
5. Foto con Bordes Redondeados (border-radius 16-20px, shadow, 50-70% ancho)
6. Roadmap Serpentina (SVG bezier + badges verde/amarillo/rojo)

**6b. Anti-patrones (lo que NINGÚN creador hace):**
Igual de importante que los patrones: ¿qué cosas NO aparecen nunca en el material? Eso = qué evitar.
- Formatos que nadie usa
- Posiciones de texto que nadie elige
- Tipos de CTA ausentes
- Estructuras de secuencia que no existen
- Si algo está en "la teoría" pero nadie lo hace en la práctica → documentar la brecha

**6c. Reglas de secuenciación (cómo armar un día completo):**
Extraer de las secuencias analizadas las reglas para armar un día de stories de principio a fin:
- ¿Cómo abren TODOS? (primera story del día = ¿siempre selfie? ¿siempre texto?)
- ¿Cuántas stories suben por día? (rango y promedio)
- ¿Dónde cae el CTA en la secuencia? (posición relativa, no absoluta)
- ¿Cuál es el ratio contenido/venta por día?
- ¿Cómo manejan el "puente" entre contenido de valor y CTA?
- ¿Cuáles son las transiciones más comunes entre stories?

**6d. Patrones APLICADOS A ADP (si el contexto es ADP):**
- Cruzar con nuestro sistema existente (ver archivos de referencia abajo)
- Clasificar cada secuencia por: tipo nuestro + capa de calentamiento + qué nos sirve
- Qué NO copiar y por qué (audiencia de Jesús ≠ audiencia del creador)
- Scripts adaptados al tono de Jesús (verificar con `jesus-tono-adp-nuevo.md`):
  - Voseo argentino, NUNCA "tú"
  - Muletillas: "La realidad es que...", "Básicamente", "Me explico?", "Entonces..."
  - Cierre: "Abrazo", "Te mando un abrazo", "Cuidate"
  - Frases fórmula: "Lo creás una sola vez y lo vendés infinitas veces", "Sin mostrar tu cara", "cero absoluto"
  - Comparaciones cotidianas para precio: "menos que una pizza", "lo que sale cargar nafta"
- Secuencias concretas con texto en tono Jesús, story por story

### FASE 7: Output

**Formato del documento principal (`ANALISIS-COMPLETO-STORIES.md`):**

```markdown
# Criterio de Producción de Stories

## 1. Lo que ya sabíamos vs lo nuevo
(Qué CONFIRMA el análisis visual de los archivos previos, y qué es genuinamente NUEVO)

## 2. Análisis por creador
### [Creador] ([fecha inicio] → [fecha fin])
- Firma visual (lo reconocible en 0.5s)
- Secuencia default (su "día típico")
- Evolución temporal (qué cambió entre primera y última fecha)
- Mecánica de venta (cómo vende sin que parezca venta)
- [tabla de días analizados con observaciones clave]

## 3. Patrones universales
(solo lo que aparece en 3+ instancias, con ejemplo concreto cada uno)

## 4. Anti-patrones
(lo que NINGÚN creador hace — y la brecha teoría vs práctica si existe)

## 5. Taxonomía de tipos de story
| Tipo | Propósito | Composición visual exacta | Cuándo usarla en la secuencia | Ejemplo (creador/fecha/nro) |

## 6. Reglas de secuenciación
(cómo armar un día de stories de principio a fin, basado en lo observado)

## 7. Diferencias editado vs raw
(qué se agrega/quita en edición — esto define qué debe hacer el software)

## 8. Templates programáticos
(cada patrón visual convertido en spec: dimensiones, posiciones, colores, tipografía, overlays, overlay %)

## 9. Checklist de calidad por story individual
(para evaluar si una story está bien antes de publicar — extraído de los patrones de los mejores)
```

**Archivos de output:**

En la carpeta de origen del usuario:
- `ANALISIS-COMPLETO-STORIES.md` — documento con formato de arriba
- `_transcripts.md` — transcripciones de audio limpias (sin alucinaciones de Whisper)
- `_frames/` — frames extraídos organizados por creador/fecha
- `_audio/` — audio extraído

En `.data/` del proyecto:
- `stories-patrones-{nombre-creador}.md` — análisis por creador (si es análisis individual)
- `stories-patrones-comparativo.md` — si hay 2+ creadores
- Actualizar `stories-patrones-reales-3-creadores.md` si corresponde agregar data nueva

---

## REGLAS

1. **VER con Read, NUNCA delegar a agentes.** Primera pasada siempre manual.
2. **Secuencias completas en orden.** Una fecha entera, después otra.
3. **Audio siempre.** ffmpeg para extraer, Whisper para transcribir, filtrar alucinaciones.
4. **No preguntar, hacer.** Si la herramienta está disponible, usarla.
5. **Datos vs opiniones.** Marcar explícitamente qué es observación y qué es inferencia.
6. **No inventar métricas.** Sin views/engagement, no asumir performance.
7. **Pensar en software.** Parámetros replicables (px, %, hex, posición).
8. **Pensar en general.** Patrones aplicables a cualquier cliente, no solo ADP.
9. **Cross-carpeta.** Si los archivos están repartidos, reconstruir por fecha.
10. **Tono verificado.** Si se adaptan scripts a Jesús, pasar por `jesus-tono-adp-nuevo.md`.
11. **Editadas primero.** Cuando hay raw + editadas de la misma fecha, analizar las editadas (=publicadas). Las raw solo para comparar qué cambió.
12. **Sampling obligatorio con carpetas grandes.** Si hay 100+ imágenes, seguir la estrategia de sampling de FASE 3 (5-7 días por creador). No intentar ver todo.
13. **Evolución temporal.** Si hay 3+ meses de data de un creador, SIEMPRE comparar inicio vs final. Lo que dejó de hacer y lo que empezó a hacer es oro.
14. **Brutalmente específico.** "Texto blanco bold 48px centrado sobre foto con overlay negro 50% opacity" > "usan texto sobre fotos". Si no es específico, no sirve para software.
15. **3+ = patrón.** 1 vez es anécdota. Solo reportar patrones con 3+ instancias. Cada patrón con ejemplo concreto (creador/fecha/nro).
16. **Contradecir está bien.** Si el análisis visual contradice los archivos previos, marcarlo explícitamente. El análisis directo de imágenes tiene más peso que lo que ya estaba escrito.
17. **Contexto teórico primero.** Leer Fase 0 ANTES de ver imágenes. Esto permite separar "confirma" de "nuevo" en el output.
18. **Videos via frames.** Claude no reproduce .mov/.mp4. Siempre usar `_frames/` + `_transcripts.md` como proxy.

---

## ARCHIVOS DE REFERENCIA

### Siempre (análisis previo como base):
- `/Users/lean/Desktop/historias/ANALISIS-COMPLETO-STORIES.md` — 690 líneas, 3 creadores, 472 piezas
- `.data/stories-patrones-reales-3-creadores.md` — patrones aplicados a ADP

### Análisis de estética visual (sesión 2026-03-29):
- Memoria: `reference_estetica_stories_140.md` — **140 stories de 8 creadores:** índice slide-by-slide con emoción, técnica y composición por slide. Arcos emocionales comparados. Frecuencia cruzada de técnicas. DNA visual por creador. 6 specs de reproducción para software. 15 reglas de diseño. Fuente: `/Users/lean/Downloads/Estica para historias/`

### Análisis previos de stories (sesión 2026-03-28):
- `.data/analisis-stories-referencia-2026-03-29-v2.md` — **Síntesis v2 corregida:** 21 videos, 11 creadores, cruce con Turu/Agus/Ego, paleta visual por creador, hallazgos de CTAs/música/stickers
- `.data/analisis-stories-referencia-2026-03-29.md` — v1 automática (errores de atribución, usar solo como complemento)
- `.data/video-analyses/2026-03-29*.md` — 21 análisis individuales de Gemini (video-analyze.mjs --tipo stories)
- `.data/video-analysis/*-visual.json` — Análisis frame-by-frame de 4 videos clave (analyze-video-visual.mjs)
- Memoria: `reference_stories_patrones_21_analisis.md` — resumen ejecutivo con hallazgos clave

### Contexto teórico (curso completo):
- `.data/stories-course/` — 38 transcripciones del curso StoryMakers (teoría completa del creador, incluye triggers, secuencias, formatos, reglas). Leer en Fase 0 para tener marco de referencia.

### Si el análisis es para ADP:
- `.data/stories-secuencias-tipo.md` — 7 tipos de secuencia + 2 nuevos (misterio multi-día, behind the scenes numerado)
- `.data/stories-formatos-22.md` — 22 formatos visuales
- `.data/stories-persuasion-engine.md` — persuasión invisible
- `.data/stories-constructor-jesus.md` — 85+ ideas de calentamiento
- `.data/avatares-adp.md` — 8 avatares con pesos
- `.data/motor-audiencia.md` — tensiones, objeciones, vocabulario por segmento
- `.data/inteligencia-compradores.md` — 562 compradores reales
- Memoria: `jesus-tono-adp-nuevo.md` — tono, muletillas, frases fórmula
