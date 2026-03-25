---
name: analisis-ig
description: Scrapea, transcribe y analiza un perfil de Instagram completo. Genera documento de análisis con patrones de contenido, descripciones, CTAs y engagement.
argument-hint: @username
---

# Análisis de Perfil de Instagram — Pipeline Completo

Recibís un @username de Instagram. Tu trabajo es correr el pipeline completo de scraping + transcripción + análisis y generar un documento consolidado con todos los patrones encontrados.

## Paso 0: Pre-screening (ANTES de gastar créditos)

**El usuario debe dar un @username.** Si no lo da, pedirlo.

**Si el perfil es conocido** (creadores grandes, competidores obvios, o el usuario ya dio contexto como "vende cursos" o "tiene buen storytelling"), clasificar directamente sin preguntar.

**Solo preguntar si el perfil es ambiguo:**
1. ¿Sabés si vende algo o es creador de contenido puro?

**Clasificar el perfil en uno de estos tipos:**
- **TIPO A — Vendedor de info-productos/servicios:** Vende cursos, mentorías, coaching, SaaS. El análisis prioriza funnel de venta, estructura de videos de conversión, CTAs y mecánicas de captación de leads.
- **TIPO B — Creador de contenido/marca personal:** No vende directamente o monetiza con sponsors/audiencia. El análisis prioriza estructura narrativa y engagement. **ADVERTENCIA: la aplicabilidad para ADP va a ser limitada. Informar al usuario ANTES de scrapear** para que decida si vale la pena gastar créditos.
- **TIPO C — Competidor directo ADP:** Vende productos digitales, emprendimiento digital, IA para negocios. Análisis máximo: todo lo anterior + comparación directa de ofertas, avatares y ángulos.

**Si el perfil es Tipo B, preguntar:** "Este perfil no vende productos — el análisis va a ser más de storytelling/engagement que de mecánicas de venta. ¿Seguimos o preferís uno que venda?"

## Paso 1: Pipeline automatizado

**Usar el orquestador en vez de correr scripts sueltos:**

```bash
node scripts/ig-pipeline.mjs @USERNAME --months 12
```

Esto corre automáticamente (7 fases):
1. **Scrape** (Apify) → `{username}.json`
2. **Download + Transcribe** (Groq Whisper, con retry automático) → `{username}_videos/` + `{username}_transcripts.json`
3. **Análisis de métricas** → `{username}_metrics.json` + `{username}_tables.md`
4. **Análisis de patrones** → `{username}_patterns.json` (apertura×cuerpo×cierre por video)
5. **Cross patterns × ADP** → `pattern-coverage.json` + `pattern-coverage.md` (oportunidades no explotadas)
6. **Update INDEX** → `INDEX.md` regenerado

**Después del pipeline**, correr micro-patrones cuantitativos:
```bash
node scripts/ig-micro-patterns.mjs {username}
```
Esto genera `{username}_auto-patterns.md` + `{username}_auto-patterns.json` con:
- Frases top 25% vs bottom 25% CLR (diferenciadoras + killer)
- Ritmo (duración×CLR, WPS, oraciones/video, preguntas/video)
- CTA formulas × CLR, repetición keyword × CLR
- Captions: longitud × CLR, features × CLR, keywords ranking
- Carruseles vs videos engagement
- Revenue claims × CLR, scarcity/urgencia patterns

**Opciones útiles:**
- `--limit 50` → máximo 50 posts (perfiles muy grandes)
- `--top-performers` → solo descarga top CLR + views (ahorra créditos Groq)
- `--skip-download` → solo scrape + analyze (si ya tenés los videos)
- `--months 6` → filtrar solo últimos 6 meses
- `--lang en` → forzar idioma de transcripción (default: auto-detect). Usar para perfiles en inglés como @hormozi

**Si el pipeline falla**, informar al usuario (probablemente falta APIFY_TOKEN o GROQ_API_KEY en .env.local).

**El pipeline genera `{username}_tables.md` con tablas pre-calculadas** — NO calcular métricas manualmente. Leer ese archivo como base del análisis.

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
| `ig-pipeline.mjs @user` | Pipeline completo (scrape→download→transcribe→analyze) | Siempre al empezar |
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
