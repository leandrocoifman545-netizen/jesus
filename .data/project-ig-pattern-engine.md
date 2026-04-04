---
name: IG Pattern Engine — Estado actual
description: Sistema de análisis de patrones IG completo: classifiers, beat mapping, caption intelligence, auto-brief integration. 517 videos, 6 perfiles, 0 neutros.
type: project
---

## IG Pattern Engine (actualizado 2026-03-25)

### Pipeline de scripts
| Script | Output | Qué hace |
|--------|--------|----------|
| `ig-pipeline.mjs @user --months 12` | Todo | Orquestador 7 fases (scrape→download→transcribe→analyze→patterns→cross-gen→INDEX) |
| `ig-patterns.mjs @user` | `{user}_patterns.json` | Disecciona videos en 3 zonas (apertura/cuerpo/cierre) + beat mapping + caption intelligence |
| `ig-patterns.mjs --all --export` | `pattern-library.json` + `.md` | Biblioteca cross-profile rankeada por weighted CLR |
| `ig-cross-generations.mjs` | `pattern-coverage.json` + `.md` | Cruza patrones IG × 36 generaciones ADP → encuentra UNTAPPED |
| `ig-micro-patterns.mjs @user` | `{user}_auto-patterns.md` + `.json` | Frases top/killer, ritmo, CTA, captions |

### Classifiers (`scripts/lib/classifiers.mjs`)
Fuente única de verdad. 4 funciones exportadas:
- **`classifyOpening()`** — 37 patrones de apertura (0 neutros en 180 hooks ADP). Incluye: pregunta, dato_numero, imperativo, historia, provocacion, hipotetico, identidad, credencial, lista_framework, exclusividad, incredulidad, ancla_precio_invertida, segunda_persona, condicion_edad, storytelling_personal, anti_guru, acumulacion, oportunidad_tendencia, negacion_en_serie, espejo_situacion, escena_cinematografica, herencia_emocional, paradoja, revelacion_personal, timeline_rapido, matematica_reveladora, injusticia, observacion_directa, confesion_temporal, contraste_juxtaposicion, dialogo_actuacion, promesa_directa, analogia_abierta, contraintuitivo_declarativo, cita_avatar, acusacion_directa, situacion_narrativa
- **`classifyBody()`** — 13 patrones de cuerpo
- **`classifyClosing()`** — 12 patrones de cierre
- **`classifyCaption()`** — 14+ categorías: longitud (corta/media/larga/muy_larga), cta_keyword, cta_generico, dm_cta, link_bio, segundo_hook, resumen, storytelling, pregunta, hashtag_heavy/light/sin, emoji_heavy, urgencia, prueba_social, promesa_gratis

### Beat mapping (nuevo 2026-03-25)
Body dividido en 4 cuartos temporales usando timestamps de Whisper:
- Q1_setup → Q2_develop → Q3_escalate → Q4_resolve
- Cada cuarto clasificado con `classifyBody()`
- Output: `beat_sequences` (secuencias completas × CLR) + `beat_position_stats` (qué funciona en cada posición)

### Auto-brief integration (nuevo 2026-03-25)
`lib/ai/auto-brief.ts` ahora carga `pattern-coverage.json`:
- Selecciona un patrón UNTAPPED de apertura con alta CLR (weighted random)
- Lo inyecta como restricción: "al menos 1 de los 5 leads DEBE usar este patrón"
- Campo nuevo en resultado: `suggested_hook_pattern`

### Caption intelligence (nuevo 2026-03-25)
Hallazgos cross-profile (517 videos, 6 perfiles):
- dm_cta: CLR 118% (el mejor)
- cta_keyword: CLR 107%
- cta_generico: CLR 54% (mucho peor)
- Captions media (10-30 palabras) > corta o larga
- sin_hashtags: CLR 74% > con hashtags

### Temporal decay
weighted_clr con half-life de 90 días. Prioriza patrones que funcionan AHORA.

### Andromeda convergence
Patrones orgánico IG aplican también a ads. Meta optimiza ambos con el mismo sistema de retención.
