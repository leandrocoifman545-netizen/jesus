---
name: guion
description: Genera guiones de ads para Jesús Tassarolo (ADP). Usar cuando el usuario pide crear un guión, script o ad.
argument-hint: [nicho] [ángulo] [segmento] [funnel] [formato]
---

# Generador de Guiones — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación de guiones a subagentes.** Los agentes no tienen el contexto completo y producen guiones genéricos. Siempre generar en el contexto principal.

## Paso 0: Pre-flight + Audit rápido (OBLIGATORIO)

### 0a. Extraer winner patterns + session insights:
```bash
node scripts/extract-winner-patterns.mjs
node scripts/extract-session-insights.mjs
```
Esto actualiza `.data/winner-patterns.md` y `.data/session-insights.md` con data fresca de lo que funcionó y lo que Jesús dijo en sesiones.

### 0b. Correr pre-flight (con nicho si ya se sabe):
```bash
node scripts/preflight-guion.mjs [nicho-opcional]
```
Esto devuelve:
- Archivos faltantes
- 50 leads quemados
- Últimas 5 generaciones (para diversidad)
- Winner patterns y session insights
- **Google Trends AUTOMÁTICO**: escanea 3 nichos ADP frescos + rising queries + nicho específico si se pasa
- Template de decisiones obligatorio
- **NO necesita la web corriendo** — consulta Google Trends directamente

**Si hay archivos faltantes → PARAR y avisar al usuario.**

### 0c. Audit rápido (CHECK 3 + 4 + 10 + 11 de audit/SKILL.md):
- Verificar conteos (generaciones reales vs documentadas)
- Verificar archivos fantasma (todos los referenciados existen)
- Verificar motor-audiencia y jerarquía integrados
- Verificar que preflight y validación de guardado funcionan

**Si hay errores críticos → PARAR y correr `/audit fix`.**

### 0d. Leer winner patterns y session insights:
Si existen `.data/winner-patterns.md` y `.data/session-insights.md`, leerlos. Los winner patterns sesgan decisiones (no copiar, sesgar). Las session insights de Jesús tienen más peso que la teoría.

### 0e. Jerarquía de decisiones:
Leer `.data/jerarquia-decisiones.md`:
- **Nivel 1 (Reglas duras)** > **Nivel 2 (Estratégico)** > **Nivel 3 (Estructural)** > **Nivel 4 (Enriquecimiento)** > **Nivel 5 (Validación)**
- Dentro del nivel 2: **Diversidad > Motor audiencia > Ángulos**
- Frases reales del avatar: SIEMPRE usar cuando existan, adaptar al segmento si es necesario
- En caso de duda: el camino más ESPECÍFICO gana

## Paso 1: Contexto — qué es automático y qué leer manualmente

### Inyectado automáticamente por el pipeline (NO hace falta leerlos — ya van en el prompt de la API):
La web y el auto-brief inyectan estos archivos como system blocks + restricciones en cada generación:
- `.data/angulos-expandidos.md`, `.data/tipos-cuerpo.md`, `.data/enciclopedia-127-ingredientes.md`
- `.data/reglas-diversidad.md`, `.data/venta-modelo-negocio.md`, `.data/ctas-biblioteca.md`
- `.data/motor-audiencia.md`, `.data/winner-patterns.md`, `.data/session-insights.md`
- Audiencia real (avatar + inteligencia), tono de Jesús, técnicas de retención/venta
- CTAs activos (`ctas-activos.json`), leads quemados, objeciones por segmento
- Coverage gaps + auto-brief (ángulo, cuerpo, segmento, funnel, venta del modelo)
- Angle Discovery (nicho + big idea de Google Suggest × cobertura)

### Leer manualmente SOLO cuando se genera desde conversación (skill `/guion`):
Estos archivos dan contexto que necesitás para tomar decisiones creativas que el auto-brief no cubre:
1. `jesus-adp.md` — Producto, audiencia, tracking semanal
2. `consejos-jesus.md` — Reglas duras, tipos de lead, estructura
3. `jesus-historia.md` — Historia real, citas (si el guion usa storytelling de Jesús)
4. `formatos-visuales.md` — Para elegir formato visual (el pipeline no lo elige solo)
5. `matriz-cobertura.md` — Para visión macro de qué falta (el auto-brief lo usa, pero verlo ayuda)

### Condicionales:
- Si el cuerpo es analogía: `tecnica-analogia-franco-piso.md`
- Si se necesitan objeciones específicas: `.data/objeciones-adp.md`

## Paso 2: Chequear leads quemados

```bash
curl -s http://localhost:3002/api/burned-leads | python3 -c "import sys,json; [print(l['text'][:80]) for l in json.load(sys.stdin)['leads']]" 2>/dev/null || echo "No se pudieron obtener leads quemados"
```

No generar leads parecidos a los quemados (mismo ángulo + misma estructura = quemado).

## Paso 3: Activar el MOTOR DE AUDIENCIA (ANTES de escribir nada)

Consultar `.data/motor-audiencia.md` y definir:
1. **Tensión emocional** (T1-T12) — según segmento. La tensión te da el arco, la familia y las micro-creencias listas.
2. **Vocabulario del segmento** — usar las palabras EXACTAS que usa el avatar de ese segmento. NUNCA vocabulario genérico.
3. **Objeción central** (si aplica) — si el guion ataca una objeción, usar la estructura completa del motor.
4. **Intento fallido** (para leads) — al menos 1 lead debe venir de la tabla de intentos fallidos.
5. **Triggers de engagement** — elegir ingredientes que coincidan con los triggers del segmento.

## Paso 4: Definir la BIG IDEA y la cadena de creencias

### 4a. Big idea (lo más importante del guion)
UNA idea específica, no genérica, que es el TEMA de todo el guion. Viene del ángulo elegido:
- **F1:** big idea sobre QUIÉN SOS → "Sos freelancer y cada mes arrancás de cero"
- **F2:** big idea sobre UN NICHO/TENDENCIA → "Miles buscan crochet y nadie les vende una guía"
- **F3:** big idea sobre QUÉ ESTÁS HACIENDO MAL → "Usás IA 4 horas y no generás un peso"
- **F4:** big idea sobre CÓMO FUNCIONA → "3 pasos, 1 celular, tu primer producto"
- **F5:** big idea ES UNA HISTORIA → "Cuando perdí $150K aprendí algo"

**Si la big idea es "productos digitales con IA", es genérica y NO SIRVE.** Todo el guion gira alrededor de la big idea.

Para encontrar big ideas nuevas: usar Google Trends (`trends-scan.mjs` o `curl http://localhost:3002/api/trends`). Un dato de Trends × 5 familias = 5+ big ideas distintas. Ver `reglas-diversidad.md` para el proceso completo.

### 4b. Creencia central
La UNA cosa que, si el viewer la acepta, la venta es inevitable. Se deriva de la big idea.
**Si elegiste una tensión en el Paso 3**, la micro-creencia que destruye ya está definida en la tabla — usala como base.

### 4c. Definir los 5 beats del micro-VSL
Cada beat tiene una FUNCIÓN PERSUASIVA distinta y una micro-creencia que instala:

| Beat | Función (persuasion_function) | Qué instala |
|------|------|------|
| **1. Identificación** | `identificacion` | "Este problema es MÍO y es urgente" |
| **2. Quiebre** | `quiebre` | "Lo que creía está mal" |
| **3. Mecanismo** | `mecanismo` | "Existe un camino nuevo y simple" |
| **4. Demolición** | `demolicion` | "Mi excusa principal no aplica" |
| **5. Prueba** | `prueba` | "Gente como yo ya lo hizo" |

**Por duración:**
- **45-60s:** 3 beats (quiebre + mecanismo + prueba)
- **60-75s:** 4 beats (identificación + quiebre + mecanismo + prueba)
- **75-90s:** 5 beats (todos) — estructura completa de micro-VSL

**NUNCA dos beats con la misma función persuasiva.** Si los beats dicen lo mismo con distintas palabras, el guion informa pero no persuade.

### 4d. Elegir el vehículo narrativo
Consultar `tipos-cuerpo.md` → el vehículo da el TONO a los 5 beats. La estructura es fija (los beats), el tono es variable (el vehículo).

### 4e. Completar los demás campos

**NOTA: El sistema auto-brief (`lib/ai/auto-brief.ts`) elige automáticamente ángulo, cuerpo, segmento, funnel y venta del modelo** basándose en la cobertura (lo menos usado). Si el usuario los especificó en el brief, se respetan. Si no, el auto-brief los inyecta como restricción obligatoria.

**Lo que SÍ hay que definir manualmente** (el auto-brief no los cubre):

| Campo | Fuente | Obligatorio |
|-------|--------|-------------|
| **Creencia central** | Definir | SI |
| **Micro-creencias** (2-3) | Definir | SI |
| **Ángulo específico** (ej: 1.6, 3.5) | `angulos-expandidos.md` | SI — dentro de la familia auto-elegida |
| **Nicho específico** | Creatividad + research + Trends | SI |
| **Formato visual** | `formatos-visuales.md` | SI |
| **Ingredientes** (por duración) | `enciclopedia-127-ingredientes.md` | SI |
| **Cambio de creencia** (old→mechanism→new) | Definir | SI |

**Lo que el auto-brief ya resuelve** (solo overridear si el usuario lo pidió):

| Campo | Auto-selección | Override con |
|-------|---------------|-------------|
| **Familia de ángulo** | La menos usada en cobertura | `[ÁNGULO: confrontacion]` |
| **Segmento** | El menos cubierto | `[SEGMENTO: C]` |
| **Funnel** | El menos cubierto | `[FUNNEL: RETARGET]` |
| **Vehículo narrativo** | El menos usado | `[CUERPO: demolicion_mito]` |
| **Venta del modelo** | La menos usada | `[VENTA: matematica_simple]` |
| **Emoción** | Rotación aleatoria entre 8 arcos | `[EMOCIÓN: miedo → alivio]` |

### Fórmula de ingredientes por duración (PISO, no receta fija):
- **45-60s:** A(hook) + B(problema) + F(mecanismo) + I(CTA) — 3 beats
- **60-75s:** A + B + D(quiebre) + F + G(prueba) + I — 4 beats
- **75-90s:** A + B + C(agitación) + D + F + G + I — 5 beats (micro-VSL completo)
- **90-180s:** A + B + C + E(autoridad) + F + G + H(oferta) + I + J(urgencia)

**IMPORTANTE:** La fórmula es el MÍNIMO, no la ESTRUCTURA. Podés saltarte categorías enteras si el arco lo pide. Un guion de pura emoción no necesita demo (F). Un guion de storytelling no necesita agitación (C). La diversidad viene de combinar DIFERENTE cada vez.

### 4f. Elegir el ARCO NARRATIVO (de `reglas-diversidad.md`)
Hay 8 arcos distintos. NO caer siempre en el "arco demo" (dato→demo→prueba→matemática).
Si estás en un batch, verificar que el arco sea distinto al del guion anterior.

### 4g. Verificar diversidad de ingredientes
Consultar `reglas-diversidad.md` → sección "Ingredientes gastados". Si vas a usar F#73, F#74, G#90 o B#29, preguntarte: ¿hay un ingrediente FRESCO de la misma categoría que funcione? Si sí, usá el fresco.

**Ingredientes frescos a priorizar:** D#49 (redefinición del juego), E#67 (vulnerabilidad estratégica), F#75 (mecanismo con nombre), F#76 (metáfora), F#82 (atajo legítimo), G#94 (meta-proof), K#125-127 (cierre NLP).

## Paso 5: Escribir el CUERPO como micro-VSL de 5 beats

**Regla cardinal: el cuerpo funciona SOLO, sin leads.** Primero el cuerpo, después los leads.

### Estructura del guion completo (en este orden):
```
LEAD (5-8s) → Beat 1: Identificación → Beat 2: Quiebre → Beat 3: Mecanismo → Beat 4: Demolición → Beat 5: Prueba → VENTA DEL MODELO → TRANSICION (Capa 1) → [CORTE] → BLOQUE CTA (capas 2-6)
```

### Cómo escribir cada beat:
1. **Tomar los 5 beats** definidos en el Paso 4c, cada uno con su función persuasiva y micro-creencia
2. **Escribir cada beat como una sección corta (12-20s, 30-45 palabras)**
3. **Cada beat tiene 1 función = 1 micro-creencia** — nada se mezcla, nada se diluye
4. **Los beats se apilan**: al final del beat 5, la creencia central tiene que sentirse inevitable
5. **El vehículo elegido da el TONO** — un guion de "historia con giro" cuenta los 5 beats como historia; uno de "demolición" los cuenta con tono confrontativo

### Cómo el vehículo tiñe los beats (guía, no camisa de fuerza):
- **Demolición de mito:** El quiebre es el beat estrella. La identificación arranca con "vos creés que..."
- **Historia con giro:** La identificación es la situación del personaje. El quiebre es el giro.
- **Demo/Proceso:** El mecanismo es el beat estrella. Se muestra paso a paso.
- **Comparación de caminos:** La identificación muestra camino A. El quiebre muestra por qué falla.
- **Un día en la vida:** La prueba es future pacing sensorial. La identificación contrasta con el "hoy".
- **Pregunta y respuesta:** La demolición es el beat estrella. Ritmo ráfaga.
- **Analogía extendida:** Todo se cuenta VIA la analogía. El quiebre conecta lo familiar con lo nuevo.
- **Contraste emocional:** La identificación es visceral (detalles sensoriales). El pivote es el quiebre.

### Word count por duración:
- 15s=30-40 | 30s=65-85 | 45s=95-115 | 60s=125-150 | 75s=155-185 | 90s=190-220

### Duración objetivo: 75-90 segundos (mínimo 75s para micro-VSL completo de 5 beats)

### La venta del modelo (VA DENTRO del cuerpo, después del mecanismo):
Elegir 1 de los 10 tipos de `venta-modelo-negocio.md`. 2-3 oraciones que cierran la lógica de POR QUÉ productos digitales con IA es el camino. NO mencionar precio, NO mencionar riesgo cero — eso va en los bloques CTA.

### Checklist del cuerpo (micro-VSL):
- [ ] **5 beats** si 75-90s / **4 beats** si 60-75s / **3 beats** si 45-60s
- [ ] Cada beat tiene una **función persuasiva DISTINTA** (identificacion, quiebre, mecanismo, demolicion, prueba)
- [ ] Cada beat instala **1 micro-creencia** que se REFLEJA en el texto (no solo en metadata)
- [ ] Las micro-creencias se apilan → la creencia central es inevitable al final
- [ ] Beat de **demolición** incluido en guiones de 75s+ (anticipar la objeción #1)
- [ ] El vehículo da el TONO, no cambia la estructura de beats
- [ ] Cambio de creencia EXPLÍCITO ligado al mecanismo (no motivacional)
- [ ] Venta del modelo incluida después del beat 5 (1 de 10 tipos)
- [ ] Re-hook obligatorio entre segundo 10-15 si video > 20s
- [ ] Cada ingrediente elegido se REFLEJA en el texto (no solo en metadata)
- [ ] Especificidad extrema (números concretos verificables)
- [ ] Micro-loops entre beats
- [ ] Voseo argentino permanente
- [ ] Muletillas de Jesús rotadas
- [ ] Show don't tell
- [ ] NO referencia al taller ni a Instagram en el cuerpo
- [ ] El mecanismo cierra con VENDERLO ("y lo vendés")
- [ ] Si usa historia de Jesús: SOLO citas de jesus-historia.md
- [ ] Punchy y compacto — cada beat es 12-20s, no más

## Paso 6: Escribir la TRANSICION (Capa 1)

1-2 oraciones que conectan el ejemplo del body con los bloques CTA genéricos.
Se graba de corrido después de la última sección del body.

Templates:
- "Y [EJEMPLO DEL BODY] es solo UNO de los productos que podés crear."
- "Eso que te acabo de mostrar con [EJEMPLO] es solo el principio."
- "Todo lo que te acabo de contar lo enseño paso a paso."

SIEMPRE mencionar el ejemplo específico del body.

## Paso 7: Escribir los LEADS (5 variantes)

Cada lead = 2-3 oraciones: [Abrir gap] + [Negar respuesta obvia] + [Puente al cuerpo]

### 5 leads, cada uno con tipo DISTINTO. Tipos disponibles:
situacion_especifica | dato_concreto | pregunta_incomoda | confesion | contraintuitivo | provocacion | historia_mini | analogia | negacion_directa | observacion_tendencia | timeline_provocacion | contrato_compromiso | actuacion_dialogo | anti_publico

### REGLA ANTI-REPETICIÓN DE LEADS (P0 — validación automática)

**El sistema valida automáticamente** (`scripts/validate-hooks.mjs` integrado en `save-generation.mjs`).
Si un lead matchea un patrón prohibido o es >55% similar a un hook existente, **BLOQUEA el guardado**.

**7 patrones estructurales PROHIBIDOS** (ver `.data/patrones-prohibidos-leads.md` para detalle):
- **P1:** "¿Cuántas veces te dijeron/preguntaron [elogio]?" — halago → vale plata
- **P2:** "[Persona] le pidió a la IA... armó guía... vende" — arco predecible
- **P3:** "Son las [hora]. Los chicos durmieron. Tenés una hora..." — escena doméstica
- **P4:** "Sabés más de X que la mayoría" — flattery + guilt
- **P5:** "No necesitás X. No necesitás Y. No necesitás Z." — triple negación
- **P6:** "¿Cuántos cursos compraste que no terminaste?" — quemado en RETARGET
- **P7:** "Cada vez más gente busca [X] en Google" — tendencia genérica

**Regla clave:** Si cambiar el sustantivo/nicho produce el mismo lead, es repetición estructural y está prohibido.

**Qué SÍ funciona (mecanismos frescos):**
- Historia personal con fracaso concreto y dato verificable
- Voz de un tercero / diálogo inesperado (hijo, cliente, vecino)
- Curiosidad geográfica o temporal específica
- Flip contraintuitivo genuino (contradecir la expectativa real, no la obvia)
- Timeline con proyección a futuro concreta
- Analogía no-digital / mundo real
- Provocación con dato específico anclado

### Prohibiciones en leads:
- NUNCA "no te alcanza la plata"
- NUNCA porcentajes inventados
- NUNCA "Todo el mundo dice X. No es así." (requemado)
- NUNCA leads motivacionales sin mecanismo
- Lead ≠ primera sección del body (no repetir la misma revelación)
- NUNCA los 7 patrones estructurales de arriba (validación automática los bloquea)

## Paso 8: Asignar 3 BLOQUES CTA (de ctas-biblioteca.md)

Los 3 bloques CTA son de 6 capas cada uno y se graban UNA vez por sesión:

1. **Clase Gratuita (TOFU)** — elegir variante A/B/C/D
2. **Taller $5 (MOFU)** — elegir variante A/B/C/D
3. **Instagram Orgánico** — elegir variante A/B/C/D

Cada bloque tiene: OFERTA → PRUEBA → RIESGO CERO → URGENCIA → ORDEN+NLP

Copiar las capas textuales de `ctas-biblioteca.md`. NO inventar. NO meter precio ni riesgo cero en el body ni en la transición — eso va SOLO en los bloques CTA.

## Paso 9: Validar REGLAS DURAS (checklist final)

- [ ] Leads son 2-3 oraciones (no hooks de 1 frase)
- [ ] Todos los leads conectan con el mismo cuerpo
- [ ] Lead ≠ primera sección del body
- [ ] NUNCA "no te alcanza la plata"
- [ ] "Negocios" no "trabajos"
- [ ] Sin porcentajes inventados
- [ ] Sin datos que no se puedan verificar
- [ ] Sin referencia al taller ni Instagram en el body
- [ ] Cambio de creencia explícito y construido
- [ ] Micro-creencias definidas (1 por beat) y reflejadas en el texto
- [ ] Cada beat tiene persuasion_function DISTINTA
- [ ] 5 beats en 75-90s / 4 en 60-75s / 3 en 45-60s
- [ ] Beat de demolición incluido si 75s+
- [ ] Re-hook si video > 20s
- [ ] Word count dentro del rango
- [ ] Formato visual asignado
- [ ] Ingredientes registrados (categoría + número + nombre)
- [ ] Venta del modelo incluida (1 de 10)
- [ ] Transición (Capa 1) incluida
- [ ] 3 bloques CTA incluidos (de ctas-biblioteca.md)
- [ ] Voseo argentino en TODO
- [ ] Nicho específico, nunca genérico
- [ ] **Diversidad:** arco narrativo distinto al guion anterior (si es batch)
- [ ] **Diversidad:** NO caer en "arco demo" por default (dato→demo→prueba→matemática)
- [ ] **Diversidad:** frases muleta de `reglas-diversidad.md` no repetidas en el batch
- [ ] **Diversidad:** ingredientes NO son siempre F#73+F#74+G#90+B#29
- [ ] **Motor audiencia:** tensión emocional elegida y reflejada en el arco
- [ ] **Motor audiencia:** vocabulario del segmento usado (palabras EXACTAS del avatar, no genéricas)
- [ ] **Motor audiencia:** al menos 1 lead viene de intentos fallidos (tabla motor)
- [ ] **Motor audiencia:** triggers de engagement coinciden con ingredientes elegidos
- [ ] **Motor audiencia:** cadena micro-yes presente si duración > 60s

## Paso 10: Presentar al usuario

Mostrar en markdown:
1. **Metadata**: familia, ángulo, segmento, funnel, vehículo narrativo, venta del modelo, nicho, formato visual, cambio de creencia, micro-creencias, ingredientes, tensión emocional
2. **LEADS** (5, numerados con tipo entre paréntesis)
3. **CUERPO** (secciones internas con nombre + venta del modelo)
4. **TRANSICION** (Capa 1)
5. **3 BLOQUES CTA** (con las 5 capas cada uno)

## Paso 11: Guardar (solo si el usuario aprueba)

### JSON exacto para guardar (RESPETAR ESTA ESTRUCTURA):
```json
{
  "title": "Título corto del guion",
  "script": {
    "angle_family": "identidad|oportunidad|confrontacion|mecanismo|historia",
    "angle_specific": "1.2_oficinista_atrapado",
    "body_type": "demolicion_mito|historia_con_giro|demo_proceso|comparacion_caminos|un_dia_en_la_vida|pregunta_respuesta|analogia_extendida|contraste_emocional",
    "segment": "A|B|C|D",
    "funnel_stage": "TOFU|MOFU|RETARGET",
    "niche": "nicho específico",
    "model_sale_type": "cementerio_de_modelos|transparencia_total|ventana_oportunidad|contraste_fisico|eliminacion_barreras|matematica_simple|lean_anti_riesgo|tiempo_vs_dinero|democratizacion_ia|prueba_diversidad",
    "transition_text": "Eso que te acabo de mostrar con [EJEMPLO] es solo el principio.",
    "total_duration_seconds": 80,
    "word_count": 180,
    "belief_change": {
      "old_belief": "creencia vieja",
      "mechanism": "mecanismo que la refuta",
      "new_belief": "creencia nueva"
    },
    "micro_beliefs": [
      { "belief": "micro-creencia 1", "installed_via": "técnica usada", "persuasion_function": "identificacion", "section_name": "Nombre sección" }
    ],
    "hooks": [
      { "variant_number": 1, "hook_type": "situacion_especifica", "script_text": "texto del lead", "timing_seconds": 7 }
    ],
    "development": {
      "framework_used": "micro_vsl_5_beats",
      "emotional_arc": "revelacion_oportunidad",
      "sections": [
        { "section_name": "Identificación", "persuasion_function": "identificacion", "micro_belief": "Este problema es mío", "script_text": "texto", "timing_seconds": 15 }
      ]
    },
    "ingredients_used": [
      { "category": "A", "ingredient_number": 1, "ingredient_name": "nombre" }
    ],
    "cta_blocks": [
      { "channel": "clase_gratuita", "channel_label": "Clase Gratuita", "variant": "A" },
      { "channel": "taller_5", "channel_label": "Taller $5", "variant": "A" },
      { "channel": "instagram", "channel_label": "Instagram", "variant": "A" }
    ]
  }
}
```

**CAMPOS CRÍTICOS que NO pueden faltar ni tener otro nombre:**
- `section_name` (NO `title`) en cada sección
- `timing_seconds` en cada sección y cada hook
- `belief_change.mechanism` (los 3 campos: old_belief, mechanism, new_belief)
- `micro_beliefs` como array de OBJETOS (no strings)

```bash
echo '{ JSON }' | node scripts/save-generation.mjs
```

**El script valida automáticamente antes de guardar.** Si faltan campos obligatorios, RECHAZA el guardado. Campos validados:
- `angle_family`, `angle_specific`, `body_type`, `segment`, `funnel_stage`, `niche`, `model_sale_type`, `transition_text`
- hooks con 2+ oraciones
- cuerpo (development.sections con `persuasion_function` + `micro_belief` en cada sección)
- `belief_change`, `micro_beliefs` (1 por beat), `ingredients_used`
- funciones persuasivas DISTINTAS entre beats (sin duplicados)
- `cta_blocks` (3 bloques)
- Voseo argentino (no tú/tienes/puedes en el cuerpo)

**Si falla la validación:** corregir y volver a intentar. NUNCA usar `--force` para saltear errores.

Dar URL: `http://localhost:3002/scripts/{generationId}`
