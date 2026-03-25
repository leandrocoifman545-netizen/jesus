---
name: analisis-ig
description: Scrapea, transcribe y analiza un perfil de Instagram completo. Genera documento de análisis con patrones de contenido, descripciones, CTAs y engagement.
argument-hint: @username
---

# Análisis de Perfil de Instagram — Pipeline Completo

Recibís un @username de Instagram. Tu trabajo es correr el pipeline completo de scraping + transcripción + análisis y generar un documento consolidado con todos los patrones encontrados.

## Paso 0: Pre-screening (ANTES de gastar créditos)

**El usuario debe dar un @username.** Si no lo da, pedirlo.

**Antes de scrapear, preguntarle al usuario:**
1. ¿Qué te llamó la atención de este perfil? ¿Un video puntual, el formato, el tono?
2. ¿Sabés si vende algo o es creador de contenido puro?

**Si el usuario ya dio contexto** (ej: "tiene buen storytelling", "vende productos digitales"), usar eso para calibrar.

**Clasificar el perfil en uno de estos tipos:**
- **TIPO A — Vendedor de info-productos/servicios:** Vende cursos, mentorías, coaching, SaaS. El análisis prioriza funnel de venta, estructura de videos de conversión, CTAs y mecánicas de captación de leads.
- **TIPO B — Creador de contenido/marca personal:** No vende directamente o monetiza con sponsors/audiencia. El análisis prioriza estructura narrativa y engagement. **ADVERTENCIA: la aplicabilidad para ADP va a ser limitada. Informar al usuario ANTES de scrapear** para que decida si vale la pena gastar créditos.
- **TIPO C — Competidor directo ADP:** Vende productos digitales, emprendimiento digital, IA para negocios. Análisis máximo: todo lo anterior + comparación directa de ofertas, avatares y ángulos.

**Si el perfil es Tipo B, preguntar:** "Este perfil no vende productos — el análisis va a ser más de storytelling/engagement que de mecánicas de venta. ¿Seguimos o preferís uno que venda?"

## Paso 1: Scraping del perfil

```bash
node scripts/scrape-ig.mjs @USERNAME
```

Esto genera `.data/ig-references/{username}.json` con todos los posts, captions, engagement y URLs de video.

**Verificar que el archivo se creó y tiene posts.** Si falla, informar al usuario (probablemente falta APIFY_TOKEN en .env.local).

### Filtro temporal y de calidad

**Descartar TODOS los posts anteriores a enero 2025.** El contenido viejo no es relevante — algoritmos, formatos y tendencias cambian demasiado rápido.

**Después del filtro temporal, solo analizar en profundidad los top performers:**

| Posts después del filtro | Análisis profundo (transcripción + visual) |
|---|---|
| < 30 | Todos |
| 30-80 | Top 40% CLR + top 15% views |
| 80-200 | Top 25% CLR + top 10% views |
| 200+ | Top 15% CLR + top 10% views |

El resto de posts se incluye solo en las métricas globales (3.1) y en la tabla final de CLR, pero NO se transcriben ni se analizan palabra por palabra. No gastar créditos de Groq/Gemini en contenido mediocre.

**Informar al usuario ANTES de scrapear:** "Este perfil tiene ~X posts. Después de filtrar (solo 2025+), quedan ~Y. Voy a analizar en profundidad los top Z. ¿Sigo?"

## Paso 2: Descarga y transcripción de videos

```bash
node scripts/ig-download-videos.mjs @USERNAME
```

Esto descarga todos los videos y los transcribe con Groq Whisper. Genera:
- `.data/ig-references/{username}_videos/` (archivos .mp4)
- `.data/ig-references/{username}_transcripts.json` (transcripciones)

**Si hay rate limit de Groq**, correr el script de pendientes:
```bash
node scripts/ig-transcribe-remaining.mjs @USERNAME
```

Repetir hasta que no queden pendientes.

## Paso 2.5: Análisis visual con Gemini Flash (opcional pero recomendado)

**Si los videos fueron descargados**, correr análisis visual proporcional a la cantidad de videos:

| Videos totales | Analizar visualmente |
|---|---|
| < 20 | 100% |
| 20-50 | Top 30% CLR + top 10% views |
| 50-100 | Top 20% CLR + top 10% views |
| 100+ | Top 15% CLR + top 10% views |

Para cada video seleccionado:
```bash
node scripts/analyze-video-visual.mjs ".data/ig-references/{username}_videos/{video}.mp4"
```

Esto genera un análisis visual por frame: formatos, encuadres, textos en pantalla, transiciones, movimientos de cámara, iluminación. Los resultados se guardan en `.data/video-analysis/`.

**El análisis visual se cruza después con la transcripción y la descripción** para entender el sistema completo: qué se VE + qué se DICE + qué se ESCRIBE funcionan en conjunto.

**Si no hay GEMINI_API_KEY en .env.local**, saltar este paso e informar al usuario que puede agregarlo para análisis visual en el futuro.

## Paso 3: Análisis de datos

Leer los archivos generados:
- `.data/ig-references/{username}.json` — posts completos con _raw_posts
- `.data/ig-references/{username}_transcripts.json` — transcripciones
- `.data/video-analysis/*-visual.json` — análisis visual (si existe)

### 3.1 Métricas globales

Calcular:
- Total posts, videos, otros tipos
- Promedio views, likes, comments
- **CLR global** (Comment-to-Like Ratio = comments ÷ likes × 100)
- **LVR global** (Like-to-View Ratio = likes ÷ views × 100)
- Frecuencia de publicación (promedio días entre posts)
- Hashtags más usados

### 3.2 Duración × engagement

Agrupar videos por duración en buckets:
- 0-20s, 20-45s, 45-60s, 60-75s, 75-100s, 100s+

Para cada bucket: cantidad, views promedio, likes promedio, comments promedio.
Identificar el sweet spot de duración.

### 3.3 Estructura narrativa de los videos

Analizar las transcripciones para encontrar:

**Estructura base (beats):**
- ¿Cómo abren los videos? (pregunta, afirmación, pattern interrupt, etc.)
- ¿Hay un patrón de credibilidad? (números, casos, etc.)
- ¿Usan frameworks con nombre propio?
- ¿Cómo integran el CTA? (pegado al final vs dentro de la narrativa)

**Estructuras narrativas recurrentes:**
- Categorizar los videos por tipo de narrativa (anti-consejo, caso de cliente, Q&A, analogía, listicle, etc.)
- Contar cuántos videos usan cada estructura
- Promediar engagement por estructura

**Fórmulas verbales:**
- Extraer frases que se repiten textualmente o con variaciones mínimas
- Agrupar por categoría (credenciales, anti-gurú, pattern interrupts, escasez, modelado de acción, cierres)
- Incluir citas textuales exactas de las transcripciones

### 3.4 Sistema de CTA

**Palabras clave de comentario:**
- Identificar todas las palabras que el creador pide que comenten
- Clasificar como: contextual (vinculada al contenido del video), semi-contextual, o genérica
- Para cada palabra: cantidad de usos, views promedio, comments promedio
- Ordenar por performance

**Estructura del CTA en el video:**
- ¿Cuántas capas tiene? (transición narrativa → modelado de acción → segunda persona modela)
- ¿El CTA está dentro de la narrativa o pegado al final?

**Otros tipos de CTA:**
- ¿Usa "comentame tu nicho"?
- ¿Usa DM / link in bio?
- ¿Hay posts sin CTA?

### 3.5 Descripciones (captions)

**Largo × engagement:**
- Agrupar por largo (sin hashtags): 4-10 palabras, 11-20, 21-35, 36-60, 60+
- Para cada grupo: cantidad, views promedio, comments promedio
- Identificar sweet spot

**Frases recurrentes:**
- Extraer frases que aparecen en múltiples descripciones
- Para cada frase: cantidad de usos, views promedio

**Estructuras de descripción:**
- Categorizar las descripciones por estructura (escasez+recompensa, promesa+CTA, hook contrarian+CTA, caso real+CTA, etc.)
- Para cada estructura: CLR promedio, ejemplos textuales

**Reglas de las descripciones:**
- ¿Resume el video o es un segundo hook?
- ¿Qué elementos NUNCA aparecen?
- ¿Cómo se relaciona con el video?

### 3.6 Top posts por CLR (proporcional)

Ordenar TODOS los posts por CLR (comments ÷ likes × 100), de mayor a menor.

**La cantidad de posts a analizar en profundidad es PROPORCIONAL al total de videos:**

| Videos totales | Top CLR a analizar | Top views a analizar |
|---|---|---|
| < 20 | 100% | 100% |
| 20-50 | Top 30% | Top 10% |
| 50-100 | Top 20% | Top 10% |
| 100+ | Top 15% | Top 10% |

Para CADA post del top CLR, incluir **PALABRA POR PALABRA, sin truncar**:

1. **Métricas:** CLR%, views, likes, comments, duración
2. **Descripción COMPLETA** — cada palabra, sin omitir hashtags ni emojis
3. **Transcripción COMPLETA** — cada palabra del audio, sin resumir
4. **Análisis visual** (si hay datos de Gemini): formato, encuadre, textos en pantalla, transiciones
5. **Análisis guión ↔ descripción:** Cómo se potencian mutuamente:
   - ¿La descripción repite algo del video o agrega un ángulo nuevo?
   - ¿Hay refuerzo doble (misma frase/concepto en ambos)?
   - ¿La descripción funciona como segundo hook o como resumen?
   - ¿El CTA está en el video, en la descripción, o en ambos?
   - ¿Qué aporta cada uno que el otro no tiene?
6. **Veredicto:** POR QUÉ este post genera tantos comentarios — ¿es el video, la descripción, o la combinación?

### 3.7 Top posts por views (proporcional, contraste)

Misma proporción que CLR (ver tabla arriba). Para cada post:
- Views, likes, comments, CLR
- **Descripción COMPLETA** (palabra por palabra)
- **Transcripción COMPLETA** (palabra por palabra)
- **Análisis guión ↔ descripción** (mismo formato que 3.6)
- Nota: ¿por qué tiene muchas views pero CLR distinto? ¿Se viralizó por el video o por la descripción?

### 3.8 Formatos visuales (solo si hay datos de Gemini)

**Si se corrió el Paso 2.5**, analizar los datos de `.data/video-analysis/`:

**Categorizar cada video analizado por formato principal:**
- Talking head (cámara fija)
- Talking head + texto superpuesto
- Pantalla grabada / demo
- B-roll con voz en off
- Split screen
- Greenscreen
- Texto sobre fondo (sin persona)
- Mix (varios formatos en un video)

**Análisis por formato:**
- Contar cuántos videos usan cada formato
- Promediar CLR y views por formato → ¿cuál performa mejor?
- ¿Cambia el formato según el tipo de video (venta vs contenido)?

**Detalles visuales recurrentes:**
- Textos en pantalla: ¿qué tipografía/color/posición usan más?
- Transiciones más comunes
- ¿Usa cortes rápidos o planos largos?
- Iluminación dominante
- Props o elementos recurrentes

**Cruce formato × guión × descripción:**
- ¿Los videos con texto superpuesto tienen descripciones más cortas?
- ¿Los talking head puros necesitan descripciones más largas para compensar?
- ¿Qué combinación formato + sistema de descripción tiene mejor CLR?

### 3.9 Aperturas y cierres

**Aperturas (primera frase de la transcripción):**
- Las 10-15 aperturas con más views
- ¿Hay aperturas repetidas? ¿Cuántas son únicas?

**Cierres (última frase de la transcripción):**
- Patrones de cierre (corte en seco, palabra clave sola, despedida, etc.)

### 3.10 Sistema guión ↔ descripción (análisis cruzado)

**Esta sección analiza CÓMO el video y la descripción trabajan en conjunto.** Son dos piezas de un mismo sistema — uno potencia al otro.

**No imponer categorías predefinidas.** Cada creador tiene su propio sistema. El trabajo es DESCUBRIRLO observando la data:

1. **Leer los top CLR y top views lado a lado** (transcripción + descripción) y observar: ¿qué relación hay entre lo que se dice y lo que se escribe?
2. **Describir los patrones que emerjan** — ponerles nombre propio del creador, no categorías genéricas
3. **Contrastar con los posts de peor CLR** — ¿la relación guión-descripción es distinta en los que no funcionan?
4. **Cuantificar:** ¿cuántos posts usan cada patrón que identificaste? ¿Cuál tiene mejor CLR/views?

**Preguntas guía (no forzar respuesta si no aplica):**
- ¿La descripción aporta algo que el video no tiene, o repite?
- ¿El CTA vive en el video, en la descripción, o en ambos?
- ¿Hay posts donde la descripción claramente ayudó al engagement? ¿Cómo se nota?
- ¿Los posts de mejor performance comparten algo en cómo combinan video + descripción?

**Conclusión:** Describir en 2-3 oraciones el sistema propio de este creador para combinar guión y descripción.

### 3.10 Funnel de venta (solo Tipo A y C)

**¿Qué vende?**
- Producto/servicio concreto, precio si es visible, nivel de awareness del avatar

**Estructura del funnel observable:**
- ¿Cómo capta leads? (keyword inbound, DM, link in bio, landing)
- ¿Qué porcentaje de sus videos son de venta vs contenido puro?
- ¿Hay una secuencia? (contenido → autoridad → venta)
- ¿Usa lead magnets? ¿Cuáles?

**Videos de conversión vs videos de alcance:**
- Separar los videos en dos grupos: los que tienen CTA de venta y los que no
- Comparar métricas entre ambos grupos (views, CLR, engagement)
- ¿Los videos de venta tienen estructura distinta? ¿Cuál?

**Comparación con ADP (solo Tipo C):**
- ¿Su avatar se superpone con el de Jesús? ¿En qué segmentos?
- ¿Su oferta compite o complementa?
- ¿Qué hace que su audiencia NO sea idéntica a la de ADP?

### 3.11 Aplicabilidad para ADP

**IMPORTANTE: Esta sección NO es un listado genérico de "esto aplica, esto no". Tiene que ser específica y accionable.**

Dividir los hallazgos en:
- **Lo que aplica directamente** para ADP — con ejemplo concreto de CÓMO implementarlo (qué video de Jesús cambiaría, qué beat del micro-VSL, qué tipo de reel orgánico)
- **Lo que requiere adaptación** — mismo principio, mecánica distinta. Explicar QUÉ adaptar y POR QUÉ (diferencia de avatar, tono, producto)
- **Lo que NO aplica** — específico del nicho/producto del creador. Explicar brevemente por qué para no caer en la tentación de copiarlo
- **Priorización:** De todo lo que aplica, ¿qué tiene mayor impacto potencial? Ordenar por impacto estimado

### 3.12 Tabla completa por CLR

Tabla con TODOS los posts ordenados por CLR descendente:
- Rank, shortCode, CLR%, comments, likes, views, primeros 30 chars de la descripción

## Paso 4: Generar documento

Escribir el análisis completo en `.data/ig-references/{username}_analisis.md` con esta estructura:

```markdown
# Análisis Completo: @{username}

> **Fuente:** {N} posts scrapeados + {N} transcripciones de video
> **Fecha de scrape:** {fecha}
> **Tipo de perfil:** {A/B/C} — {descripción}
> **Propósito:** Extraer patrones de contenido orgánico IG para aplicar a ADP

---

## 1. PERFIL GENERAL
## 2. DURACIÓN × ENGAGEMENT
## 3. ESTRUCTURA NARRATIVA DE LOS VIDEOS
## 4. SISTEMA DE CTA
## 5. DESCRIPCIONES: ANÁLISIS PALABRA POR PALABRA
## 6. TOP POSTS POR CLR (proporcional, palabra por palabra)
## 7. TOP POSTS POR VIEWS (proporcional, palabra por palabra)
## 8. FORMATOS VISUALES (si hay datos de Gemini)
## 9. APERTURAS Y CIERRES
## 10. SISTEMA GUIÓN ↔ DESCRIPCIÓN (análisis cruzado)
## 11. FUNNEL DE VENTA (solo Tipo A/C)
## 12. APLICABILIDAD PARA ADP
## 13. TABLA COMPLETA POR CLR
```

## Paso 5: Presentar al usuario

Mostrar un resumen ejecutivo:
- Stats principales (posts, videos, engagement promedio)
- Top 3 hallazgos más interesantes
- Top 3 cosas aplicables a ADP
- Link al archivo generado

## REGLAS IMPORTANTES

1. **NUNCA inventar data visual.** Si no corriste el análisis visual con Gemini (Paso 2.5), no clasificar formatos visuales, no describir escenarios, no asumir qué se ve en pantalla. Si SÍ hay datos de Gemini, usarlos libremente.
2. **NUNCA delegar el análisis a subagentes.** El análisis requiere cruzar TODA la data en conjunto. Leer TODO en el contexto principal.
3. **NUNCA truncar transcripciones o descripciones** en la sección de top 10 CLR. Palabra por palabra, completas.
4. **CLR = Comment-to-Like Ratio** (comments ÷ likes × 100). Es la métrica principal para encontrar posts donde el CTA/descripción están trabajando fuerte.
5. **El análisis es para extraer patrones, no para copiar.** Siempre contextualizar qué aplica y qué no para ADP.
6. **Si el scraping o transcripción falla**, informar al usuario y dar instrucciones para solucionarlo (tokens, rate limits, etc.)
7. **Español argentino** para el documento de análisis y la comunicación con el usuario.
8. **NUNCA sacar conclusiones sin haber leído TODA la data.** Leer TODOS los posts (no solo las transcripciones) antes de categorizar o recomendar. Los carousels/sidecars también cuentan.
9. **NUNCA saltar de observación a recomendación sin data.** Si decís "este formato funciona", tenés que mostrar los números que lo respaldan. Sin números = opinión, no análisis.
10. **Separar videos de venta de videos de contenido.** Son dos juegos distintos. Analizarlos por separado y comparar métricas entre ambos grupos.
11. **Pre-screening es obligatorio.** No scrapear sin antes clasificar el perfil (Tipo A/B/C) y confirmar con el usuario que vale la pena gastar créditos de Apify + Groq.
