---
name: analisis-ig
description: Scrapea, transcribe y analiza un perfil de Instagram completo. Genera documento de análisis con patrones de contenido, descripciones, CTAs y engagement.
argument-hint: @username
---

# Análisis de Perfil de Instagram — Pipeline Completo

Recibís un @username de Instagram. Tu trabajo es correr el pipeline completo de scraping + transcripción + análisis y generar un documento consolidado con todos los patrones encontrados.

## Paso 0a: Leer metodología de análisis profundo

**OBLIGATORIO:** Leer `.data/metodologia-analisis-profundo.md` ANTES de analizar.
Contiene: 7 axiomas + 8 pasadas de profundidad + 5 lentes + 7 dimensiones + transferencia sistemática + predicción + autocrítica de 24 preguntas.
Aplicar la metodología COMPLETA al analizar el contenido del perfil. No hacer análisis superficial.

## Paso 0b-preflight: Correr preflight (OBLIGATORIO)

```bash
node scripts/preflight-analisis-ig.mjs @USERNAME
```

El preflight:
- Verifica que la data necesaria exista
- Lista archivos que DEBEN leerse antes de escribir análisis (auto-patterns, análisis previo, cruzado, oportunidades)
- Establece el SCOPE MÍNIMO: cuántos videos deben tener transcripción completa en secciones 6 y 7
- Detecta gaps (mapa no generado, frames no extraídos, etc.)

**LEER TODOS los archivos listados en "LEER OBLIGATORIO" ANTES de escribir una sola línea del análisis.** No leerlos es el error más común y produce análisis que repiten lo que ya se sabe.

## Paso 0c: Crear process-log.json (OBLIGATORIO)

Crear `.data/ig-references/{username}_process-log.json` al EMPEZAR:

```json
{
  "username": "@USERNAME",
  "started_at": "ISO-DATE",
  "preflight_scope": { /* copiar del preflight */ },
  "steps_completed": {
    "paso_0a_metodologia_read": false,
    "paso_1_data_verified": false,
    "must_read_files_read": false,
    "frames_extracted": false,
    "cross_profile_validation": false,
    "lente_a_done": false
  }
}
```

Actualizar cada campo a `true` cuando se complete el paso. **El hook de validación BLOQUEARÁ el save del análisis final si el process-log no existe o tiene pasos incompletos.**

## Paso 0b: Pre-screening (ANTES de gastar créditos)

**El usuario debe dar un @username.** Si no lo da, pedirlo.

**Si el perfil es conocido** (creadores grandes, competidores obvios, o el usuario ya dio contexto como "vende cursos" o "tiene buen storytelling"), clasificar directamente sin preguntar.

**Solo preguntar si el perfil es ambiguo:**
1. ¿Sabés si vende algo o es creador de contenido puro?

**Clasificar el perfil en uno de estos tipos:**
- **TIPO A — Vendedor de info-productos/servicios:** Vende cursos, mentorías, coaching, SaaS. El análisis prioriza funnel de venta, estructura de videos de conversión, CTAs y mecánicas de captación de leads.
- **TIPO B — Creador de contenido/marca personal:** No vende directamente o monetiza con sponsors/audiencia. El análisis prioriza estructura narrativa y engagement. **ADVERTENCIA: la aplicabilidad para ADP va a ser limitada. Informar al usuario ANTES de scrapear** para que decida si vale la pena gastar créditos.
- **TIPO C — Competidor directo ADP:** Vende productos digitales, emprendimiento digital, IA para negocios. Análisis máximo: todo lo anterior + comparación directa de ofertas, avatares y ángulos.

**Si el perfil es Tipo B, preguntar:** "Este perfil no vende productos — el análisis va a ser más de storytelling/engagement que de mecánicas de venta. ¿Seguimos o preferís uno que venda?"

## Paso 1: Scrape de métricas (SIN descargar videos)

```bash
node scripts/ig-pipeline.mjs @USERNAME --skip-download --months 12
```

Esto scrapea + genera métricas + patrones SIN gastar en transcripción. Output: `{username}.json`, `{username}_metrics.json`, `{username}_tables.md`.

**Si el pipeline falla**, informar al usuario (probablemente falta APIFY_TOKEN o GROQ_API_KEY en .env.local).

## Paso 1b: Generar MAPA ESTRATÉGICO (ANTES de bajar videos)

```bash
node scripts/ig-map.mjs @USERNAME --months 12
```

El mapa analiza la distribución de calidad del perfil y recomienda qué videos bajar. Output: `{username}_map.md` + `{username}_map.json`.

**Qué genera:**
- Separación orgánico vs venta (por CTA en caption)
- Distribución de calidad: unimodal o bimodal
- Clusters temáticos (por keywords en captions)
- A/B tests probables (captions similares)
- Outliers estadísticos (z-score ≥ |2|)
- **Recomendación de descarga con umbral dinámico** — adaptativo al perfil (no número fijo ni porcentaje fijo)

**PRESENTAR el mapa al usuario** y preguntar si la selección es correcta antes de descargar. El usuario puede ajustar: "bajá también los de este cluster" o "esos A/B tests no me interesan".

## Paso 1c: Buscar A/B tests naturales

**Los A/B tests naturales valen 10x más que videos individuales.** El mapa los detecta por caption, pero la confirmación viene con transcripciones (mismo audio = confirmado).

Priorizar SIEMPRE para Tier 1 los A/B tests confirmados.

> Fuente: 4 versiones de "Ignora a quien te ignora" de @jaimehigueraes (mismo guion, 4 producciones, 575K→122K) generaron los hallazgos más medibles de 9 análisis Tier 1.

## Paso 2: Download selectivo + transcripción

**Usar los IDs recomendados por el mapa:**

```bash
node scripts/ig-download-videos.mjs @USERNAME --only-ids-file .data/ig-references/{username}_map.json
```

Esto baja SOLO los videos que el mapa recomienda (no todos). Después corre transcripción con Groq automáticamente.

**Opciones útiles:**
- `--only-ids "ID1,ID2,..."` → IDs manuales (si ajustaste la selección)
- `--only-ids-file path/to/map.json` → IDs desde el mapa
- `--skip-transcribe` → solo descarga sin transcribir
- `--lang en` → forzar idioma (default: auto-detect)
- `--top-performers` → selección automática por CLR+views (alternativa al mapa)

**Después del download**, correr análisis de patrones + micro-patrones:
```bash
node scripts/ig-patterns.mjs @USERNAME
node scripts/ig-micro-patterns.mjs {username}
```

**El pipeline genera `{username}_tables.md` con tablas pre-calculadas** — NO calcular métricas manualmente. Leer ese archivo como base del análisis.

## Paso 1b: Buscar A/B tests naturales (ANTES de elegir qué analizar en profundidad)

**Los A/B tests naturales valen 10x más que videos individuales.** Antes de elegir qué videos analizar con la metodología profunda, buscar en la data scrapeada:

1. **Videos con MISMO GUION y diferente producción/caption.** Creadores que republican el mismo contenido con variaciones. Se detectan comparando transcripciones con alta similitud textual.
2. **Videos con MISMO OBJETIVO/PRODUCTO y diferente estructura.** Ej: dos videos que venden lo mismo pero uno da toda la info y otro la retiene.
3. **Videos REPETIDOS temáticamente** con resultados muy diferentes.

**Cómo detectarlos rápido:**
- En `{username}_tables.md`, buscar captions similares o idénticas
- En las transcripciones, buscar frases textuales repetidas entre videos diferentes
- Comparar los top CLR con los bottom CLR del mismo tema

**Si hay A/B tests naturales → priorizarlos para Tier 1 SIEMPRE.** La capacidad de aislar variables (misma audio, diferente caption = medimos impacto de caption) es más valiosa que cualquier análisis de video individual.

> Fuente: 4 versiones de "Ignora a quien te ignora" de @jaimehigueraes (mismo guion, 4 producciones, 575K→122K) generaron los hallazgos más medibles de 9 análisis Tier 1.

## Paso 2: Análisis visual con Gemini Flash (si hay GEMINI_API_KEY)

**Verificar si hay GEMINI_API_KEY en .env.local ANTES de mencionar este paso.** Si no hay, saltarlo silenciosamente — no decirle al usuario que "podría agregarlo".

**Si hay key**, correr análisis visual proporcional:

| Videos totales | Analizar visualmente |
|---|---|
| < 20 | 100% |
| 20-50 | Top 30% CLR + top 10% views |
| 50-100 | Top 20% CLR + top 10% views |
| 100+ | Top 15% CLR + top 10% views |

```bash
node scripts/analyze-video-visual.mjs ".data/ig-references/{username}_videos/{video}.mp4"
```

## Paso 3: Análisis narrativo (lo que los scripts NO pueden hacer)

**Los scripts ya calcularon todas las métricas.** Leer:
- `{username}_metrics.json` — data machine-readable (CLR, keywords, hooks, etc.)
- `{username}_tables.md` — tablas formateadas (copiar directo al análisis)
- `{username}_transcripts.json` — transcripciones completas (para análisis narrativo)

**Tu trabajo ahora es SOLO lo que requiere inteligencia narrativa:**

### 3.1 Métricas globales
**Copiar de `_tables.md` sección 1.** No recalcular.

### 3.2 Duración × engagement
**Copiar de `_tables.md` sección 2.** Agregar solo la interpretación del sweet spot.

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
**Copiar keywords de `_tables.md` sección 3.** Agregar análisis cualitativo:
- Clasificar keywords como: contextual, semi-contextual, o genérica
- Estructura del CTA en el video: ¿cuántas capas? ¿dentro de la narrativa o pegado?
- ¿Usa DM / link in bio? ¿Hay posts sin CTA?

### 3.5 Descripciones (captions)
**Copiar de `_tables.md` sección 4.** Agregar:
- Frases recurrentes
- Estructuras de descripción (escasez+recompensa, promesa+CTA, etc.)
- ¿Resume el video o es un segundo hook?

### 3.6 Top posts por CLR
**Base: `_tables.md` sección 6.** Para los top 10-15 CLR, incluir **PALABRA POR PALABRA, sin truncar**:
1. **Métricas** (ya calculadas en _tables.md)
2. **Descripción COMPLETA** — cada palabra
3. **Transcripción COMPLETA** — cada palabra del audio
4. **Análisis visual** (si hay datos de Gemini)
5. **Análisis guión ↔ descripción**
6. **Veredicto:** POR QUÉ este post genera tantos comentarios

### 3.7 Top posts por views
**Base: `_tables.md` sección 7.** Mismo formato que 3.6 para los top 10-15.

### 3.8 Formatos visuales
**Solo si se corrió Paso 2 (Gemini).** Si no hay datos visuales, OMITIR esta sección entera.

### 3.9 Aperturas y cierres
**Copiar hooks de `_metrics.json` campo `top_hooks`.** Agregar análisis cualitativo de patrones.

### 3.10 Sistema guión ↔ descripción (análisis cruzado)

**No imponer categorías predefinidas.** Descubrir el sistema propio del creador:

1. Leer top CLR y top views lado a lado (transcripción + descripción)
2. Describir los patrones que emerjan — nombres propios del creador
3. Contrastar con posts de peor CLR
4. Cuantificar: ¿cuántos posts usan cada patrón?

### 3.11 Funnel de venta (solo Tipo A y C)

- ¿Qué vende? Precio, awareness level
- ¿Cómo capta leads? (keyword inbound, DM, link in bio, landing)
- Videos de conversión vs alcance: separar y comparar métricas
- **Comparación con ADP** (solo Tipo C): avatar, oferta, diferenciadores

### 3.12 Aplicabilidad para ADP

**IMPORTANTE: Esta sección NO es un listado genérico. Tiene que ser específica y accionable.**

Dividir en:
- **Lo que aplica directamente** — con ejemplo concreto de CÓMO implementarlo
- **Lo que requiere adaptación** — qué adaptar y por qué
- **Lo que NO aplica** — por qué, para no caer en la tentación de copiarlo
- **Priorización:** Ordenar por impacto estimado (top 3 destacados)

### 3.13 Tabla completa por CLR
**Top 30 en el análisis.** Tabla completa → `_tables.md` sección 8 (ya generada).

## Paso 4: Generar documento

Escribir el análisis en `.data/ig-references/{username}_analisis.md`:

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
## 6. TOP POSTS POR CLR (top 10-15, palabra por palabra)
## 7. TOP POSTS POR VIEWS (top 10-15, palabra por palabra)
## 8. FORMATOS VISUALES (solo si hay datos de Gemini)
## 9. APERTURAS Y CIERRES
## 10. SISTEMA GUIÓN ↔ DESCRIPCIÓN
## 11. FUNNEL DE VENTA (solo Tipo A/C)
## 12. APLICABILIDAD PARA ADP
## 13. TOP 30 CLR (tabla completa en _tables.md)
```

## Paso 5: Implementar hallazgos accionables

**ANTES de presentar al usuario**, evaluar qué hallazgos merecen ser implementados en los sistemas existentes:

### Checklist de implementación

| ¿El hallazgo...? | Acción |
|---|---|
| Introduce un **vehículo narrativo nuevo** | Agregar en `tipos-cuerpo.md` |
| Cambia **reglas de diversidad** | Actualizar `reglas-diversidad.md` |
| Introduce un **patrón de lead/hook** | Agregar en `patrones-prohibidos-leads.md` (frescos) o en `hook-types.ts` |
| Cambia **reglas de CTA** | Actualizar `ctas-biblioteca.md` |
| Introduce un **patrón orgánico IG** | Actualizar `patrones-organico-ig.md` |
| Introduce un **ingrediente nuevo** | Evaluar para `enciclopedia-127-ingredientes.md` |
| Cambia algo del **motor de audiencia** | Actualizar `motor-audiencia.md` |

**Preguntarle al usuario:** "Encontré N hallazgos implementables. ¿Los integro al sistema?" con lista breve de qué cambiaría.

### Actualizar INDEX.md
Agregar el perfil a la tabla comparativa en `.data/ig-references/INDEX.md`.

### Actualizar mapa de competencia
Agregar/actualizar el perfil en `.data/mapa-competencia.md`:
- Clasificar en Anillo 1, 2 o 3
- Agregar hallazgos a la tabla de "Hallazgos cross-competencia"
- Actualizar la pregunta estratégica activa si corresponde

### Actualizar metrics-summary.json
```bash
node scripts/ig-analyze.mjs --all
```
Esto regenera la comparativa cross-profile con el nuevo perfil incluido.

## Paso 6: Presentar al usuario

Mostrar un resumen ejecutivo:
- Stats principales (posts, videos, engagement promedio)
- Top 3 hallazgos más interesantes (con números)
- Top 3 cosas aplicables a ADP (con acción concreta)
- Hallazgos pendientes de implementar
- Link al archivo generado

## Paso 7: Validación del output

**Antes de dar por terminado, verificar:**

```
□ ¿Las métricas del análisis coinciden con _tables.md? (no recalculé a mano)
□ ¿Todas las 13 secciones están presentes?
□ ¿Los top CLR tienen transcripción COMPLETA (no truncada)?
□ ¿La sección de aplicabilidad tiene acciones CONCRETAS (no genéricas)?
□ ¿Se actualizó INDEX.md con el nuevo perfil?
□ ¿Se corrió ig-analyze.mjs --all para actualizar metrics-summary.json?
□ ¿Los hallazgos implementables se discutieron con el usuario?
□ ¿Se omitió la sección de formatos visuales si no hay datos de Gemini?
□ ¿Cada conclusión está respaldada por números?
```

Si falla alguno, corregir ANTES de presentar.

## REGLAS IMPORTANTES

1. **NUNCA inventar data visual.** Sin datos de Gemini → sin sección de formatos. No asumir lo que se ve.
2. **NUNCA delegar el análisis narrativo a subagentes.** Las métricas las calcula `ig-analyze.mjs`, pero el análisis cualitativo requiere leer TODO en contexto.
3. **NUNCA truncar transcripciones o descripciones** en los top CLR/views.
4. **CLR = Comment-to-Like Ratio** (comments ÷ likes × 100). Métrica principal.
5. **Usar las tablas pre-calculadas.** No recalcular lo que `ig-analyze.mjs` ya hizo.
6. **Español argentino** para todo.
7. **NUNCA sacar conclusiones sin data.** Sin números = opinión, no análisis.
8. **Separar videos de venta de videos de contenido.** Son dos juegos distintos.
9. **Pre-screening es obligatorio** pero puede ser automático si el perfil es conocido.
10. **SIEMPRE implementar hallazgos** (Paso 5). Un análisis que no cambia nada en el sistema es trabajo desperdiciado.

## Scripts disponibles

| Script | Qué hace | Cuándo usarlo |
|--------|----------|---------------|
| `ig-pipeline.mjs @user --skip-download` | Scrape + métricas sin descargar | Siempre al empezar (fase 1) |
| `ig-map.mjs @user` | Mapa estratégico: clusters, A/B tests, umbral dinámico, recomendación de descarga | Después del scrape, ANTES de bajar (fase 1b) |
| `ig-pipeline.mjs @user` | Pipeline completo (scrape→download→transcribe→analyze) | Si no necesitás el mapa |
| `ig-pipeline.mjs @user --only-ids-file .data/ig-references/user_map.json` | Pipeline con descarga selectiva desde mapa | Después de revisar el mapa |
| `ig-pipeline.mjs @user --since-last-scrape` | Solo posts nuevos, merge con existentes | Monitoreo periódico |
| `ig-analyze.mjs @user` | Solo métricas (sin scrape/download) | Re-analizar con otros params |
| `ig-analyze.mjs --all` | Métricas de TODOS los perfiles + comparativa | Después de agregar perfil nuevo |
| `ig-search.mjs "término"` | Busca en transcripciones + captions cross-profile | Para encontrar patrones temáticos |
| `ig-search.mjs --top-hooks 30` | Top 30 hooks por CLR cross-profile | Para inspiración de hooks |
| `ig-patterns.mjs @user` | Análisis apertura×cuerpo×cierre por video | Para entender POR QUÉ funciona |
| `ig-patterns.mjs --all --export` | Pattern library cross-profile + markdown | Para actualizar reglas |
| `ig-micro-patterns.mjs @user` | Análisis exhaustivo: frases top/killer, ritmo, CTA, duración×CLR, captions, carruseles | Máquina de patrones cuantitativos — genera `_auto-patterns.md` + `.json` |
| `ig-update-index.mjs` | Regenera INDEX.md desde métricas | Después de agregar perfil |
| `ig-search.mjs "X" --min-clr 5` | Buscar con filtro de performance | Para encontrar solo lo que funciona |
| `ig-cross-generations.mjs` | Cruza patterns IG × generaciones ADP | Para encontrar oportunidades no explotadas |
| `scrape-ig.mjs @user` | Solo scrape | Si solo necesitás los datos crudos |
| `ig-download-videos.mjs @user` | Solo download + transcribe | Si el scrape ya existe |
| `ig-transcribe-remaining.mjs @user` | Retry transcripciones | Si Groq tiró rate limit |
| `analyze-video-visual.mjs video.mp4` | Análisis visual (Gemini) | Si hay GEMINI_API_KEY |
