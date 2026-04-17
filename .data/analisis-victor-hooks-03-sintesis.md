# Análisis Víctor Hooks — 03: Síntesis y propuestas accionables

> **Fecha:** 2026-04-16
> **Propósito:** Cruzar los tres insumos (análisis inicial conversacional + documento 01 cruce con datos reales + documento 02 palabra por palabra) en una síntesis decisional con propuestas priorizadas para el usuario.
> **Insumos cruzados:**
> - Análisis inicial del video (hecho en conversación, ~5 métodos analizados temáticamente con 6 propuestas)
> - Autocrítica del análisis inicial (hecha en conversación, 15 puntos de mejora identificados)
> - `analisis-victor-hooks-01-cruce-datos.md` (hallazgos del sistema real ADP)
> - `analisis-victor-hooks-02-palabra-por-palabra.md` (disección cronológica del video)

---

# PARTE 1 — Mapa del análisis inicial después de los 3 cruces

## Afirmaciones del análisis inicial — estado final

| # | Afirmación inicial | Estado tras cruces | Fuente del cambio |
|---|---|---|---|
| A1 | "Psicología > fórmula" es la tesis raíz de Víctor | ✅ Confirmado | Resiste los 3 cruces |
| A2 | Método 2 (contracorriente) es fortaleza del arsenal actual | ⚠️ Matizado: 31% del uso real, no "sobre-representado" | 01 hallazgo 6 |
| A3 | Sistema tiene gap total en dirección visual | ✅ Confirmado | 01 + 02 |
| A4 | Efecto cotilla choca con regla anti-gurú | ⚠️ Matizado: depende si gurú actúa como autoridad o como atención | 02 Bloque 4 |
| A5 | Personaje congruente no está articulado en hooks | ✅ Confirmado | 01 + 02 |
| A6 | Meta-patrón "disonancia cognitiva como motor común" | ⚠️ Parcial: no cubre congruencia directa M5 (que opera por heurística, no disonancia) | 02 Bloque 5 |
| A7 | F7/F19 tienen protocolo post-flip débil | ✅ Confirmado + ampliado: faltan 3 de 6 elementos | 02 Bloque 2 |
| A8 | Propuesta F21 "categoría sin contenido" | ❌ Probablemente redundante con F8 refinada | Autocrítica + 02 Bloque 1 |
| A9 | Propuesta F22 ancla coyuntural | ❌ El ejemplo viola regla dura "no te alcanza" | Autocrítica |
| A10 | "Sobre-representado en contracorriente" | ❌ Falso — inmersión 43% > contracorriente 31% | 01 hallazgo 6 |

## Qué emergió nuevo después del análisis inicial

Estos puntos no estaban en el análisis original. Aparecieron solo después del cruce con datos y palabra por palabra.

| # | Emergente | Fuente |
|---|---|---|
| E1 | Taxonomía dual: arsenal F1-F20 ≠ `hook_type` en JSON | 01 hallazgo 1 |
| E2 | Bug ortográfico con/sin acentos (5% hooks subcontados) | 01 hallazgo 4 |
| E3 | Regla "min 2 ○ por guion" declarada pero no ejecutada | 01 hallazgo 3 |
| E4 | Ningún JSON tiene CPL — sin vínculo generation↔performance | 01 hallazgo 2 |
| E5 | Choque regla "loop cerrado antes CTA" vs. método Víctor "payoff al final" | 02 Bloque 1 |
| E6 | F1 (auto-selección, mejor CPL $0.38) NO está en los 5 métodos de Víctor | 02 Cuestionamiento 6 |
| E7 | Víctor confunde deliberadamente atención (CTR) con intención (CPL) | 02 Bloque 6 + cuestionamiento 1 |
| E8 | Historia_mini (F11) tiene 50% supervivencia draft→recorded (mejor del dataset) | 01 hallazgo 5 |
| E9 | Provocacion y actuacion_dialogo sobre-producidos (78% descartados) | 01 hallazgo 5 |
| E10 | Método 2 de Víctor tiene 6 elementos, F7 actual cubre 3 | 02 Bloque 2 |

---

# PARTE 2 — Los 4 problemas estructurales (resolver ANTES de agregar cosas nuevas)

Estos 4 no salen del video de Víctor. Salen del estado actual del sistema ADP. Cualquier cambio que propongamos basado en Víctor se construye sobre estos. Si los ignoramos, las mejoras no tienen dónde apoyarse.

## P1 — Taxonomía dual desincronizada

**Problema:** 30 etiquetas `hook_type` en JSON reales vs. 20 fórmulas F en `arsenal-hooks.md`. No hay mapeo explícito.

**Mapeo propuesto (hipótesis, pendiente validación):**

| hook_type (JSON) | F (arsenal) | Notas |
|---|---|---|
| situacion_especifica | F16 (Inmersión 2da persona) | Match directo |
| contraintuitivo | F7 (Flip contraintuitivo) | Match directo |
| actuacion_dialogo | F12 (Voz de tercero) | Match directo |
| pregunta_incomoda | F4 (Pregunta espejo) | Aproximado |
| historia_mini | F11 (Historia dolor sensorial) | Match directo |
| provocacion | F15 (Provocación + dato) | Aproximado |
| timeline_provocacion | F13 (Timeline proyección) | Aproximado |
| eliminacion_barreras | F2 (Eliminación de barreras) | Match directo |
| pregunta_espejo | F4 | Match directo (nombre repetido) |
| desculpabilizacion | F18 (Desculpabilización) | Match directo |
| voz_tercero | F12 | Match directo |
| curiosity_gap | F8 (Nadie explica) + lo que proponga del M1 Víctor | Aproximado |
| hipernicho | F1 (Auto-selección + memoria) | Aproximado |
| future_pacing_sensorial | F14 (Nombrar innombrado) o nueva | Aproximado |
| identidad_dolor | F1 o F16 | Aproximado |
| eliminacion_barreras | F2 | Repetido |
| contrato_compromiso | **Sin F — crear nueva** | 3 apariciones en dataset |
| observacion_tendencia | **Sin F — crear nueva** | 9 apariciones |
| generacional | **Sin F — crear nueva** | 3 apariciones |
| flash_forward | F14 o crear nueva | Aproximado |
| sensorial | F16 o crear nueva | 3 apariciones |
| futuro_sensorial | F14 o F11 | 2 apariciones |
| dato_impacto | F15 o crear nueva | Aproximado |
| contrarian | F7 | Duplicado |
| anti_publico | F18 o crear | 1 aparición |
| pain_point | F11 | Aproximado |
| question | F4 | Duplicado |
| reveal_teaser | Crear nueva (M1 Víctor) | 2 apariciones |
| pregunta_trampa_dual | F20 | Aproximado |

**4 tipos frecuentes sin F directa (97 apariciones totales):**
- confesion (38)
- dato_concreto (31)
- negacion_directa (17)
- analogia_cotidiana (11)

**Decisión operativa:** no es solo mapear. Es decidir si cada tipo huérfano se mergea con una F existente o se crea F nueva. Los 4 frecuentes merecen F propia (son 18% del dataset).

**Costo estimado:** 2-3 horas de trabajo humano + validación. Principalmente es pensar, no codear.

## P2 — Bug ortográfico en `hook_type`

**Problema:** `situacion_especifica` (73) coexiste con `situación_específica` (8) — mismo tipo, dos nombres. Total: 27/526 hooks subcontados (5%).

**Fix técnico:** en `save-generation.mjs` línea donde se guarda cada hook, normalizar `hook_type` con:
```js
hook.hook_type = hook.hook_type
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\s+/g, "_");
```

**Migración de los 117 JSON existentes:** script único de barrido.

**Costo estimado:** 20-30 min.

## P3 — Regla `min 2 fórmulas ○ por guion` no se ejecuta

**Problema:** el arsenal declara que cada guion debe incluir al menos 2 fórmulas sub-usadas marcadas ○. En la práctica, los tipos ○ aparecen 0-3 veces en 526 hooks. La regla es decorativa.

**Fix:** validación automática en `save-generation.mjs` antes de guardar. Dos opciones de severidad:
- **Warning** (permitir guardar pero flaggear) — más conservador
- **Error** (bloquear guardado salvo `--force`) — más radical

Recomendación: warning primero durante 2 semanas para ver impacto, después escalar a error si se confirma necesario.

**Costo estimado:** 30-40 min.

## P4 — Ningún JSON de generation tiene CPL

**Problema:** la data de performance vive en archivos `analisis-winner-XX.md` separados. No hay cruce automático generation↔performance. No podemos medir qué F convierte mejor.

**Fix mínimo:** agregar al schema de `script` en `save-generation.mjs`:
```js
script.performance = {
  cpl: null,            // USD, llenado post-testeo
  ctr: null,            // %
  status: "testing",    // testing | winner | loser | pending
  meta_ad_id: null,     // referencia externa
  notes: null
};
```

**Fix completo:** script externo que importe data de Meta Ads y actualice los JSON.

**Decisión:** por ahora solo agregar el schema. El pipeline de importación es proyecto aparte.

**Costo estimado schema:** 20 min. **Costo pipeline completo:** horas-días.

---

# PARTE 3 — Las 5 oportunidades del video de Víctor aplicables a ADP

Estas salen del análisis palabra por palabra (02). Son las que **sobreviven el filtro CPL-comprador** de ADP.

## O1 — Apertura visual (Método 3 de Víctor)

**Oportunidad:** el sistema produce solo texto. Los ads son video. El primer frame condiciona la retención antes de la primera palabra.

**Propuesta concreta:** agregar al output del `/guion` un campo opcional `apertura_visual` con 1-2 sub-campos:

```yaml
apertura_visual:
  opcion_A_movimiento: "Jesús cierra de golpe la computadora justo antes de la primera palabra"
  opcion_B_incongruencia: "Plano abre con Jesús sentado en el balcón, no en el escritorio"
  # o solo una de las dos, depende del hook
```

No reemplaza al director. Propone.

**Costo:** 1-2 horas (cambio en schema + lógica de generación + actualizar arsenal-hooks.md).

## O2 — Protocolo post-flip de 6 elementos (Método 2)

**Oportunidad:** F7/F19 actuales cubren 3 de 6 elementos del método de Víctor. Falta exigir:
- Dramatización del dogma en boca de alguien (no en narración abstracta)
- Contra-frontal extremo (no moderado)
- Beneficio concreto causal (no aspiracional genérico)
- Caso de éxito nombrable (alumno, número, escena verificable)

**Propuesta concreta:** agregar al `save-generation.mjs` un validador para hooks tipo `contraintuitivo` / `provocacion` / `negacion_directa` que chequee en el cuerpo del guion la presencia de al menos 3 de 4 elementos post-flip. Si no los tiene → warning.

También agregar al `arsenal-hooks.md` sub-sección "Protocolo post-flip" en F7 y F19.

**Costo:** 2-3 horas (decisión sobre qué es "elemento presente", implementación, documentación).

## O3 — Hook-congruencia articulada (Método 5)

**Oportunidad:** Jesús ya tiene personaje congruente pero el sistema no usa eso en el hook. El primer frame del video es prueba heurística silenciosa que el arsenal no captura.

**Propuesta concreta:** ampliar el `apertura_visual` (O1) con un tercer sub-campo:

```yaml
apertura_visual:
  ...
  congruencia_emisor: "Plano medio de Jesús, escritorio con notebook cerrada + café, sugiere autonomía sin lujo aspiracional"
```

No es obligatorio — es disponible cuando el hook lo requiere (ej: hooks que hablan de vivir de tu negocio → plano coherente; hooks que hablan de pasado dolor → plano neutro o contrario).

**Costo:** incluido en O1 (mismo cambio de schema).

## O4 — Ancla coyuntural con filtros ADP (Método 4 adaptado)

**Oportunidad:** el efecto cotilla puede funcionar en ADP si se evitan las violaciones obvias (figuras políticas, plata directa, gurúes como autoridad).

**Propuesta concreta:** agregar al arsenal una nueva fórmula **F_Coyuntural** con filtros explícitos:

```markdown
### F_Coyuntural — Ancla coyuntural
**Estructura:** [TEMA/FIGURA UNIVERSAL ARGENTINA] + [CONEXIÓN ORGÁNICA AL NICHO] + [PUENTE A ADP]

**Filtros OBLIGATORIOS:**
- Tema/figura debe ser universal en mapa mental de mujer 45+ argentina
- NO figuras políticas (polariza → haters suben CPL)
- NO referencia directa a "no te alcanza la plata" / subas económicas
- NO gurú como autoridad validadora

**Temas válidos:** Mundial, cambio de estación con resonancia afectiva (fin de año, día de la madre), Messi/Maradona, fecha del calendario popular (Reyes, Navidad, vacaciones de invierno)

**Cuándo:** campañas activas con tema reciente.
**Cuándo NO:** librería evergreen (envejece rápido).
```

**Costo:** 1 hora (documentación).

**Pendiente:** ejemplos validados para el arsenal. Mi propuesta inicial (luz 38%) violaba regla. Ejemplos correctos necesitan construirse con cuidado.

## O5 — Distinción atención vs. intención como lente operativa

**Oportunidad:** Víctor mezcla deliberadamente CTR con CPL. ADP ya sabe que son cosas distintas (ver `cruce-winners-t4-t6`) pero no tiene esa distinción como lente de validación de hooks.

**Propuesta concreta:** agregar al `arsenal-hooks.md` como 4ª lente de validación (junto a las 3 existentes: especificidad, te pone adentro, tensión entre dos cosas):

```markdown
4. **ATENCIÓN vs. INTENCIÓN:** ¿Este hook filtra al comprador real o solo capta atención amplia?
   - Si filtra comprador: CPL tiende bajo, CTR puede ser medio.
   - Si solo capta atención: CTR alto, CPL alto.
   - Señal de filtro: identidad + memoria concreta del avatar (F1 vive acá).
   - Señal de atención sin filtro: curiosidad genérica aplicable a cualquier audiencia.
```

**Reformulación de la 4ª lente que propuse originalmente ("disonancia"):** la propuesta inicial fallaba porque la congruencia directa M5 no opera por disonancia. La nueva lente es más operativa y conecta con data real (H1 vs H4).

**Costo:** 30 min (documentación).

---

# PARTE 4 — El choque que necesita decisión del usuario

Solo una decisión en este análisis requiere al usuario explícitamente. El resto son cambios conservadores que se pueden implementar con OK estándar.

## Choque: Loop cerrado antes del CTA vs. Payoff al final del video

**Regla actual en `reglas-duras.md §2`:**
> "Loop cerrado del hook (obligatorio). Si el hook abre una promesa, intriga o pregunta, el cuerpo la cierra explícitamente antes del CTA. NUNCA dejar promesas abiertas que no se respondan dentro del guion."

**Método 1 de Víctor (Bloque 1 del doc 02):**
> "en la mayoría del vídeo no doy la estructura directamente al principio, sino que doy contexto sobre lo que luego voy a explicar más adelante"
> → Víctor cierra el loop AL FINAL del video completo (que es el CTA mismo o el bloque justo anterior).

**Por qué choca:** si adoptamos el Método 1 en su forma completa (curiosity gap con payoff diferido), el payoff **va a caer en el offer_bridge** o justo antes, no en el body. La regla actual lo prohíbe.

**3 opciones para resolver:**

**Opción A — Mantener la regla como está.**
- Aceptamos que no podemos hacer curiosity gap completo Víctor-style.
- F8 (nadie explica) sigue siendo nuestro acercamiento parcial (promete "3 pasos" pero los da en el body).
- Ventaja: coherencia con el sistema actual.
- Desventaja: perdemos una técnica comprobada en long-form.

**Opción B — Afinar la regla.**
- "El loop puede cerrarse EN el offer_bridge si la transferencia al CTA es coherente (el CTA es la resolución misma del loop)."
- Ejemplo: hook "hay 3 pasos para empezar a vender sin seguidores" → body da contexto y los 2 primeros pasos → CTA ofrece "el tercero te lo explico en la clase gratuita".
- Ventaja: ganamos técnica nueva.
- Desventaja: puede degenerar en "clickbait con upsell". Requiere criterio fino.

**Opción C — Crear excepción tipada.**
- Solo los hooks etiquetados `curiosity_gap_puro` pueden cerrar loop en el CTA.
- Hooks de cualquier otro tipo siguen la regla actual.
- Ventaja: acotada.
- Desventaja: taxonomía más compleja.

**Mi voto:** Opción B con guardrail. El guardrail podría ser: el "payoff" que se transfiere al CTA debe ser **coherente con lo que el CTA efectivamente entrega** (si prometo "el paso 3", el CTA tiene que dar realmente ese paso, no solo una clase genérica). Esto evita la degeneración.

**Pero esto es decisión tuya, no mía.** Implica cambio a una regla dura.

---

# PARTE 5 — Matriz de propuestas priorizadas

Agrupación por impacto vs. costo. El orden dentro de cada celda es de más a menos urgente.

## ALTO impacto + BAJO costo (hacer primero)

| Propuesta | Costo | Reversibilidad | OK requerido |
|---|---|---|---|
| P2 — Bug acentos fix | 20-30 min | Total | Estándar |
| O5 — 4ª lente atención/intención | 30 min | Total | Estándar |
| P4 — Schema CPL en JSON | 20 min | Total | Estándar |

**Combinado:** ~1.5 horas de trabajo. Todos independientes entre sí. Se pueden hacer en paralelo.

## ALTO impacto + COSTO MEDIO (hacer segundo)

| Propuesta | Costo | Reversibilidad | OK requerido |
|---|---|---|---|
| P1 — Unificar taxonomías | 2-3 horas | Media (migración de 117 JSON) | Estándar + validación de mapeos |
| O1+O3 — Apertura visual + congruencia | 1-2 horas | Total | Estándar |
| O2 — Protocolo post-flip | 2-3 horas | Total | Estándar |

**Combinado:** 5-8 horas. Hay dependencia: P1 debería ir antes de O2 (el validador de post-flip necesita saber qué tipos son flip-tipo).

## ALTO impacto + ALTO costo (decisión explícita)

| Propuesta | Costo | Reversibilidad | OK requerido |
|---|---|---|---|
| Resolución del choque loop-CTA (Opción A/B/C) | Variable según opción | Baja | **OK explícito + discusión** |

## MEDIO impacto + BAJO costo (hacer si hay tiempo)

| Propuesta | Costo | Reversibilidad | OK requerido |
|---|---|---|---|
| O4 — F_Coyuntural documentada | 1 hora | Total | Estándar |
| P3 — Enforcement regla ○ (warning-level) | 30-40 min | Total | Estándar |

## DESCARTAR de la lista original

| Propuesta descartada | Razón |
|---|---|
| F21 "categoría sin contenido" (original) | Redundante con F8 refinada — mejor ampliar F8 |
| F22 ancla coyuntural (ejemplo original) | Violaba regla dura "no te alcanza" — reemplazada por O4 con filtros |
| 4ª lente "disonancia cognitiva" (original) | Reemplazada por O5 (atención/intención) — la disonancia no cubre M5 congruencia directa |

---

# PARTE 6 — Plan de ejecución sugerido

Para no marear con 8 cambios en paralelo. Orden recomendado:

## Fase 1 — Fundaciones (1.5 horas, paralelizable)
1. P2 — Fix bug acentos
2. P4 — Schema `performance` en JSON
3. O5 — 4ª lente en `arsenal-hooks.md`

Estos tres son independientes entre sí y todos son reversibles. Pueden hacerse sin aprobación adicional más allá de "sí, hacelos".

## Fase 2 — Taxonomía (3-4 horas)
4. P1 — Unificar taxonomías F1-F20 ↔ hook_type
   - Sub-paso 1: validar el mapeo propuesto con el usuario (quizás hay mapeos mejores que no vi)
   - Sub-paso 2: decidir F nuevas para tipos huérfanos frecuentes
   - Sub-paso 3: actualizar `arsenal-hooks.md`
   - Sub-paso 4: actualizar `validate-hooks.mjs` para que use el mapeo
   - Sub-paso 5: migración de JSON existentes (barrido)

Esta fase abre camino para las siguientes porque cualquier validador nuevo necesita taxonomía limpia.

## Fase 3 — Visual (1-2 horas)
5. O1 + O3 — Campo `apertura_visual` con sub-campos movimiento/incongruencia/congruencia

Independiente de P1 pero mejor después para evitar retrabajo de schema.

## Fase 4 — Flip robusto (2-3 horas)
6. O2 — Protocolo post-flip en F7/F19

Depende de P1 (el validador necesita saber qué tipos son flip-tipo).

## Fase 5 — Decisión del usuario
7. Choque loop-CTA — A/B/C

No puedo avanzar sin decisión. La abro y espero.

## Fase 6 — Nice-to-have
8. O4 — F_Coyuntural documentada
9. P3 — Warning de regla ○

---

# PARTE 7 — Preguntas abiertas que este análisis no resuelve

Honestidad: no todo se cierra en 03. Quedan preguntas que necesitan más data o más tiempo.

1. **¿Cuál es el CPL real de cada `hook_type`?** Sin vínculo generation↔performance automático, no sabemos qué F convierte mejor dentro de ADP. P4 (schema) es primer paso. Segundo paso (pipeline de importación desde Meta) es proyecto separado.

2. **¿El "payoff diferido al CTA" degrada la calidad del CTA?** Opción B del choque tiene este riesgo. Solo testeo real lo valida.

3. **¿Qué tan fuerte es la señal de historia_mini (50% supervivencia)?** Con 16 grabados el número es señal, no evidencia fuerte. Próximos batches deberían confirmarlo.

4. **¿Cuántas Fs faltan realmente?** El dataset actual tiene 4 tipos frecuentes huérfanos. Más uso del sistema puede revelar más.

5. **¿El avatar 45+ argentino responde a qué famosos/temas?** La lista que propuse es hipótesis. Testeo real lo valida.

6. **¿Hay otros archivos (fuera de `.data/generations/`) con información que cambie conclusiones?** Este análisis inspeccionó `.data/generations/`, `arsenal-hooks.md`, `reglas-duras.md`, `cruce-winners-t4-t6`. No inspeccioné `.memory/`, `batch3-guiones/`, ni la mayoría de los `analisis-*.md`. Posible sesgo por muestreo incompleto.

---

# PARTE 8 — Resumen ejecutivo (para decisión rápida)

**Lo que proponés hacer cuando quieras implementar:**

1. **Fase 1** (1.5 h, sin riesgo): fix acentos + schema CPL + 4ª lente. Arrancar acá.
2. **Fase 2** (3-4 h, requiere validación de mapeos): unificar taxonomías.
3. **Fase 3** (1-2 h): apertura visual.
4. **Fase 4** (2-3 h): protocolo post-flip.
5. **Decisión tuya** (discusión): choque loop-CTA.
6. **Nice-to-have** (tiempo extra): F_Coyuntural + warning ○.

**Total trabajo técnico:** ~8-11 horas netas de implementación, paralelizable en parte.

**Lo que NO hacemos basado en este análisis:**
- Crear F21 nueva (redundante con F8)
- Crear F22 con ejemplos que rompen reglas
- Adoptar "disonancia" como lente única
- Adoptar Método 4 sin filtros (chocaría con anti-gurú)
- Prometer visitas/seguidores como proxy de CPL (confusión deliberada de Víctor)

**Filosofía que emerge del análisis:**
- Víctor optimiza atención. ADP optimiza intención del comprador.
- Son juegos relacionados pero no idénticos.
- Lo útil de Víctor para ADP son los mecanismos psicológicos (curiosity gap, disonancia, heurística de representatividad), no las fórmulas específicas.
- Lo nuestro, que Víctor no tiene, es F1 (auto-selección por identidad) — el mejor hook de ADP por data real.

---

## Referencias cruzadas

- Documento 01: `/Users/lean/Documents/script-generator/.data/analisis-victor-hooks-01-cruce-datos.md`
- Documento 02: `/Users/lean/Documents/script-generator/.data/analisis-victor-hooks-02-palabra-por-palabra.md`
- Arsenal actual: `/Users/lean/Documents/script-generator/.data/v2/arsenal-hooks.md`
- Reglas duras actuales: `/Users/lean/Documents/script-generator/.data/v2/reglas-duras.md`
- Pipeline de guardado: `/Users/lean/Documents/script-generator/scripts/save-generation.mjs`
- Validación de hooks: `/Users/lean/Documents/script-generator/scripts/validate-hooks.mjs`
- Data de winners reales: `/Users/lean/Documents/script-generator/.data/cruce-winners-t4-t6-reporte-performance.md`

---

## Cierre del documento 03

Síntesis completa. La decisión concreta pendiente para el usuario es **el choque loop-CTA** (Opción A/B/C). El resto de las propuestas son técnicas estándar que se pueden implementar con OK normal.
