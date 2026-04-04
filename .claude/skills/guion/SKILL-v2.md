---
name: guion
description: Genera guiones de ads para Jesús Tassarolo (ADP). Usar cuando el usuario pide crear un guión, script o ad.
argument-hint: [nicho] [ángulo] [segmento] [funnel] [formato]
---

# Generador de Guiones — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación de guiones a subagentes.**

## Paso 0: Pre-flight (OBLIGATORIO)

```bash
node scripts/post-gen.mjs
node scripts/preflight-guion.mjs [nicho-opcional]
```

Si hay archivos faltantes → PARAR. Si hay errores críticos → correr `/audit fix`.

Leer los resultados del preflight (trends, leads quemados, últimas generaciones, winner patterns).

## Paso 1: Cargar contexto

**Leer estos archivos (en este orden):**
1. `.data/jerarquia-decisiones.md` — prioridad: reglas duras > diversidad > motor > estructura > enriquecimiento
2. `.data/winner-patterns-auto.md` — win rates reales (sesgar hacia lo que gana, no copiar)
3. `.memory/jesus-adp.md` — producto, audiencia, tracking
4. `.memory/consejos-jesus.md` — reglas duras, tipos de lead
5. `.memory/formatos-visuales.md` — para elegir formato visual

**Condicionales:**
- Si storytelling de Jesús: `.memory/jesus-historia.md`
- Si analogía: `.data/tecnica-analogia-franco-piso.md`
- Si objeciones: `.data/objeciones-adp.md`

**Siempre consultar para hooks/inspiración:**
- `ig-references/pattern-library.md` — top 30 hooks reales por CLR
- `ig-references/herasmedia_hooks_bank.md` — 167 hooks con métricas
- `ig-references/tino_beat_mapping.md` — 28 videos con templates de beats

## Paso 2: Motor de audiencia

Leer `.data/motor-audiencia.md` y definir:
1. **Tensión emocional** (T1-T12) según segmento
2. **Vocabulario del segmento** — palabras EXACTAS del avatar
3. **Objeción central** (si aplica)
4. **Intento fallido** para al menos 1 lead
5. **Triggers de engagement** → elegir ingredientes que coincidan

## Paso 3: Big idea (el 80% del resultado se decide ACÁ)

### 3a. Generar 3 candidatas (NUNCA usar la primera)

Cada candidata se evalúa con 4 criterios:
- **Especificidad** — ¿solo funciona para ESTE nicho? Si es intercambiable → descartarla
- **Resonancia** — ¿toca una tensión real del motor de audiencia?
- **Novedad** — ¿se dijo antes en los últimos 10 guiones?
- **Demostrabilidad** — ¿se puede MOSTRAR en 75 segundos?

Presentar las 3 al usuario con recomendación.

### 3b. Elegir nicho por POTENCIAL DE VENTA (no solo cobertura)

Cruzar datos de Trends (del preflight) con:
- Búsqueda activa (subiendo > estable > bajando)
- Dolor urgente (necesita solución ahora, no hobby)
- Capacidad de pago

### 3c. Creencia central + 5 beats

Definir la creencia central (la UNA cosa que hace la venta inevitable).

Definir 5 beats, cada uno con función persuasiva DISTINTA y micro-creencia:

| Beat | Función | Instala |
|------|---------|---------|
| 1. Identificación | `identificacion` | "Este problema es MÍO" |
| 2. Quiebre | `quiebre` | "Lo que creía está mal" |
| 3. Mecanismo | `mecanismo` | "Existe un camino nuevo" |
| 4. Demolición | `demolicion` | "Mi excusa no aplica" |
| 5. Prueba | `prueba` | "Gente como yo lo hizo" |

Por duración: 45-60s = 3 beats, 60-75s = 4, 75-90s = 5.

### 3d. Definir vehículo, arco, ingredientes, formato visual

Consultar: `tipos-cuerpo.md` (vehículo), `reglas-diversidad.md` (arco), `enciclopedia-127-ingredientes.md` (ingredientes por duración), `formatos-visuales.md` (formato).

El auto-brief ya eligió ángulo, cuerpo, segmento, funnel, venta del modelo y emoción. Solo overridear si el usuario lo pidió.

### 3e. Diseñar VIAJE EMOCIONAL antes de escribir

Para cada beat, definir: ¿qué SIENTE el espectador después? Identificar el TURNING POINT (el beat donde pasa de pasivo a activo) — dedicarle la MEJOR frase.

## Paso 4: Calibrar voz ANTES de escribir

1. Leer `.memory/jesus-tono-adp-nuevo.md` — buscar 3-5 frases del MISMO tono que el vehículo
2. Leer 2-3 verbatims del avatar del segmento (de `motor-audiencia.md`)
3. **Ancla:** antes de cada beat, preguntarse "¿Jesús diría esto frente a cámara, tal cual?"

## Paso 5: Escribir cuerpo (micro-VSL)

Estructura: `LEAD → Beat 1-5 → VENTA DEL MODELO → TRANSICION → [CORTE] → BLOQUES CTA`

**Reglas de escritura:**
- El cuerpo funciona SOLO, sin leads. Escribir cuerpo primero.
- Cada beat = 12-20s, 30-45 palabras. Una función, una micro-creencia.
- Los beats se apilan → creencia central inevitable al final.
- El vehículo da el TONO (ver `tipos-cuerpo.md`), la estructura de beats es fija.
- Anti-ficción: cada beat tiene al menos 1 detalle tan específico que nadie lo inventaría.
- Mecanismo con NOMBRE PROPIETARIO (no "mi curso", "el programa").
- Persuasión invisible: elegir 1-2 objeciones y disolverlas DENTRO de la narrativa sin nombrarlas (ver `stories-persuasion-engine.md`).
- Venta del modelo: 2-3 oraciones después del beat 5 (elegir 1 de 10 de `venta-modelo-negocio.md`). NO mencionar precio ni riesgo cero (eso va en CTA).
- TONO según funnel: TOFU = curiosidad, cero presión, más contexto. MOFU = profundización, nombrar "el taller". RETARGET = directo a objeción, sin intro.
- Word count: 15s=35 | 30s=75 | 45s=105 | 60s=140 | 75s=170 | 90s=205
- Duración objetivo: 75-90s (mínimo 75s para 5 beats completos)

## Paso 6: Transición (Capa 1)

1-2 oraciones que conectan el ejemplo del body con los CTAs. Se graba con el body.
SIEMPRE mencionar el ejemplo específico. NUNCA empezar con "Pero bueno", "En fin", "De todos modos".
La energía de la transición ≥ la del cuerpo.

## Paso 7: 5 leads como EXPERIMENTOS

Cada lead testea una HIPÓTESIS distinta sobre qué palanca emocional funciona.
Formato: 2-3 oraciones = [Abrir gap] + [Negar respuesta obvia] + [Puente al cuerpo]

**5 palancas emocionales DISTINTAS** (mínimo 4 de 5 diferentes):
- Reconocimiento (situación exacta del avatar)
- Curiosidad (dato sorprendente)
- Confrontación (señalar lo que hace mal)
- Prueba social (alguien como él lo logró)
- Esperanza concreta (proceso simple)

**Tipos disponibles:** situacion_especifica | dato_concreto | pregunta_incomoda | confesion | contraintuitivo | provocacion | historia_mini | analogia | negacion_directa | observacion_tendencia | timeline_provocacion | contrato_compromiso | actuacion_dialogo | anti_publico

**Anti-repetición:** ver `.data/patrones-prohibidos-leads.md` (7 esqueletos prohibidos). Si cambiar el nicho produce el mismo lead = prohibido. El script `validate-hooks.mjs` bloquea >55% similitud automáticamente.

**Prohibiciones:** no "no te alcanza la plata", no porcentajes inventados, no apertura con "Mi/Mis..." (CLR 0.95), no motivacional sin mecanismo.

**Hooks reales para inspiración:** consultar `ig-references/herasmedia_hooks_bank.md`.

### 7b. Coherencia lead → body

Para cada lead: ¿qué promete? ¿en qué beat se cumple? Si no se cumple → reescribir.

## Paso 8: 3 bloques CTA

Copiar de `ctas-biblioteca.md` (NO inventar):
1. Clase Gratuita (TOFU) — elegir variante
2. Taller $5 (MOFU) — elegir variante
3. Instagram Orgánico — elegir variante

## Paso 9: Auto-revisión (OBLIGATORIO ANTES de presentar)

### 9a. Humanizar

Escanear contra 13 patrones anti-IA (P-IA1 a P-IA13) y 8 checks de voz de Jesús (V1-V8).
3+ problemas → reescribir. 1-2 → presentar con ⚠️.

### 9b. Revisión como director creativo (OBLIGATORIO)

1. Releer el guion completo en voz alta mental
2. Marcar 3 cosas que podrías mejorar
3. Mejorar al menos 2 de esas 3
4. Verificar: ¿cada beat genera la emoción declarada? ¿El turning point tiene la mejor frase?
5. Recién entonces presentar

**Las validaciones de estructura, diversidad, anti-ficción y anti-IA las hace `save-generation.mjs` automáticamente al guardar. Si algo viola una regla, el guardado se bloquea — no hace falta checkear manualmente.**

## Paso 10: Presentar

1. **Metadata**: familia, ángulo, segmento, funnel, vehículo, venta del modelo, nicho, formato visual, cambio de creencia, micro-creencias, ingredientes, tensión emocional
2. **LEADS** (5, numerados con tipo e hipótesis)
3. **CUERPO** (secciones con nombre + venta del modelo)
4. **TRANSICION** (Capa 1)
5. **3 BLOQUES CTA**
6. **CHECK DE HUMANIDAD** (P-IA + V1-V8)

## Paso 11: Guardar (solo si el usuario aprueba)

JSON con esta estructura (campos críticos que NO pueden faltar):

```json
{
  "title": "Título corto",
  "batch": "nombre-batch (OBLIGATORIO si es parte de plan/batch)",
  "script": {
    "angle_family": "identidad|oportunidad|confrontacion|mecanismo|historia",
    "angle_specific": "1.2_oficinista_atrapado",
    "body_type": "demolicion_mito|historia_con_giro|demo_proceso|comparacion_caminos|un_dia_en_la_vida|pregunta_respuesta|analogia_extendida|contraste_emocional",
    "segment": "A|B|C|D",
    "funnel_stage": "TOFU|MOFU|RETARGET",
    "niche": "nicho específico",
    "model_sale_type": "tipo_de_venta",
    "transition_text": "texto transición",
    "total_duration_seconds": 80,
    "word_count": 180,
    "belief_change": { "old_belief": "", "mechanism": "", "new_belief": "" },
    "micro_beliefs": [{ "belief": "", "installed_via": "", "persuasion_function": "", "section_name": "" }],
    "hooks": [{ "variant_number": 1, "hook_type": "", "hypothesis": "", "emotional_lever": "", "script_text": "", "timing_seconds": 7 }],
    "development": {
      "framework_used": "micro_vsl_5_beats",
      "emotional_arc": "",
      "sections": [{ "section_name": "", "persuasion_function": "", "micro_belief": "", "viewer_emotion_after": "", "is_turning_point": false, "script_text": "", "timing_seconds": 15 }]
    },
    "micro_yes_chain": [{ "location": "lead|beat_1|...", "technique": "afirmación|pregunta_retórica|dato_anclado|future_pacing", "phrase": "frase EXACTA del guion" }],
    "ingredients_used": [{ "category": "A", "ingredient_number": 1, "ingredient_name": "" }],
    "cta_blocks": [
      { "channel": "clase_gratuita", "variant": "A" },
      { "channel": "taller_5", "variant": "A" },
      { "channel": "instagram", "variant": "A" }
    ]
  }
}
```

```bash
echo '{ JSON }' | node scripts/save-generation.mjs
```

El script valida automáticamente. Si falla → corregir y reintentar. NUNCA `--force`.

### Post-guardado (OBLIGATORIO, no preguntar):

```bash
node scripts/post-gen.mjs
```

Formatear para teleprompter y guardar en `.data/teleprompter-v2.0/{slug}.txt`.

## Paso 12: Ofrecer Ad Copy

Preguntar: "¿Generamos el copy del ad para este guion?"
Si sí → ejecutar `/ad-copy` con mismo ángulo, avatar, Schwartz y venta del modelo.
