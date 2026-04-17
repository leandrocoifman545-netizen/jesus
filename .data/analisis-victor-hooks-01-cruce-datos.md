# Análisis Víctor Hooks — 01: Cruce con datos reales del sistema ADP

> **Fecha:** 2026-04-16
> **Propósito:** Verificar afirmaciones del análisis inicial del video de Víctor contra el sistema real de ADP antes de proponer cambios al arsenal de hooks.
> **Método:** Inspección de `.data/generations/` (117 guiones, 526 hooks) + archivos de winners con CPL real + `arsenal-hooks.md` actual.
> **Relación con otros documentos:** Complementa el análisis palabra por palabra (02) y alimenta la síntesis final con propuestas (03).

---

## Hallazgo 1 — El sistema usa DOS taxonomías de hook que no se hablan

**Arsenal oficial (`arsenal-hooks.md`):** F1–F20 con nombres tipo "F16 Inmersión 2da persona", "F19 Anti-consejo", "F1 Auto-selección + memoria".

**Taxonomía real en los 526 hooks guardados (campo `hook_type` en el JSON):** ~30 etiquetas distintas, ninguna con prefijo F. Las 11 más usadas:

| Tipo en JSON | Apariciones totales | Equivalente F1–F20 probable |
|---|---|---|
| situacion_especifica | 81 (73 + 8 con acentos) | F16 (Inmersión 2da persona) |
| provocacion | 79 (71 + 8) | F15 (Provocación + dato) — aproximado |
| contraintuitivo | 66 | F7 (Flip contraintuitivo) |
| actuacion_dialogo | 64 | F12 (Voz de tercero) |
| pregunta_incomoda | 49 (42 + 7) | F4 (Pregunta espejo) — aproximado |
| confesion | 38 (34 + 4) | **Sin F asignada** |
| historia_mini | 32 | F11 (Historia dolor sensorial) |
| dato_concreto | 31 | **Sin F asignada** |
| negacion_directa | 17 | **Sin F asignada** |
| timeline_provocacion | 11 | F13 (Timeline proyección) — aproximado |
| analogia_cotidiana | 11 | **Sin F asignada** |

**4 tipos frecuentes sin equivalente en F1–F20:** confesion, dato_concreto, negacion_directa, analogia_cotidiana. Representan 97 hooks = 18% del dataset.

**Fórmulas F1–F20 casi no usadas en el dataset:**
- F2 (Eliminación de barreras): 3 apariciones (marcado ● frecuente en arsenal — contradicción)
- F4 (Pregunta espejo explícita): 1
- F12 (Voz tercero explícita): 2
- F18 (Desculpabilización): 1
- F19 (Anti-consejo): 0 (no aparece por nombre)
- F20 (Pregunta-trampa dual): 0

**Implicancia:** el arsenal escrito y el sistema ejecutado son documentos paralelos. Antes de tocar el arsenal, hay que unificar taxonomías — sin eso, cualquier edición es documentación decorativa.

---

## Hallazgo 2 — Ningún guion tiene CPL en el JSON de generations

De los 35 guiones con status `confirmed` o `recorded`, el campo `cpl` es `null` en **todos**. Igual `winner`, `performance`, `metrics`.

La data de performance real vive en archivos separados de la raíz `.data/`:
- `analisis-winner-121-c9-h1-ctaventa.md`
- `analisis-winner-122-c9-h2-ctaventa.md`
- `analisis-winner-34-c3-h4-ctaventa.md`
- `analisis-winner-39-bn-t4.md`
- `analisis-winner-43-bn-t4.md`
- `analisis-winner-46-hook16-cuerpo3-cta4.md`
- `cruce-winners-t4-t6-reporte-performance.md`

Solo hay CPL real cruzado para 4–6 ads analizados manualmente.

**Implicancia:** sin cruce automático generation ↔ performance, cualquier afirmación del tipo "esta fórmula convierte mejor" desde el dataset de generations es hipótesis sin respaldo. Esto afectó directamente a mi análisis inicial — varias afirmaciones mías eran intuición sin data que las soportara.

---

## Hallazgo 3 — Homogeneización de los 5 hooks por guion

Los guiones con status `confirmed` y `recorded` producen casi siempre la misma combinación de tipos:

```
situacion_especifica + contraintuitivo + provocacion + historia_mini + confesion (o dato_concreto)
```

Muestras reales de títulos confirmed con esa receta exacta:
- "7 horas de Uber para que te queden $15 — Saúl encontró otra forma"
- "¿Cuántas formaciones más necesitás antes de vender UNA cosa?" (contabilidad)
- "Las tapitas de gaseosa del lunes — la maestra que empaquetó 10 años de grado"
- "Tenés 2 comercios y no sabés vender por internet"
- "Cambio de época — o cambio o me cambian a la fuerza" (jubilados)
- "Amo coser pero no quiero mi futuro sentada en una silla"
- "Solo soy una mamá que cría a su hija y ordena la casa"

**La regla del arsenal `cada guion debe incluir min 2 fórmulas ○ sub-usadas` no se ejecuta en la práctica.** Los tipos ○ (F4, F12, F18, F19, F20) aparecen 0–3 veces en 526 hooks.

**Implicancia:** la diversidad entre guiones está en nicho/ángulo/vehículo, no en tipo de hook. El sistema rota mucho menos de lo que el arsenal declara rotar. Para que la regla ○ tenga efecto real hay que meterla en `save-generation.mjs` como validación automática, no solo como documento.

---

## Hallazgo 4 — Bug ortográfico en la taxonomía

Mismo tipo guardado con dos nombres distintos:
- situacion_especifica (73) vs situación_específica (8)
- provocacion (71) vs provocación (8)
- pregunta_incomoda (42) vs pregunta_incómoda (7)
- confesion (34) vs confesión (4)

**Total hooks subcontados por este bug:** 27 de 526 = 5%.

**Fix:** en `save-generation.mjs` o en `validate-hooks.mjs`, normalizar `hook_type` al guardar — snake_case sin acentos, siempre. Migración: barrido único sobre los 117 JSON existentes para unificar.

Es trabajo menor (~10–15 min) pero impacta todos los analytics futuros.

---

## Hallazgo 5 — Tasas de supervivencia draft → confirmed/recorded

Porcentaje de hooks de cada tipo que llegan a status de grabación:

| Tipo | Grabados | Total | Ratio |
|---|---|---|---|
| historia_mini | 16 | 32 | **50%** |
| confesion | 13 | 38 | 34% |
| negacion_directa | 5 | 17 | 29% |
| contraintuitivo | 18 | 66 | 27% |
| situacion_especifica | 22 | 81 | 27% |
| dato_concreto | 8 | 31 | 26% |
| pregunta_incomoda | 12 | 49 | 24% |
| provocacion | 17 | 79 | 22% |
| actuacion_dialogo | 14 | 64 | 22% |

**No es CPL** — es preferencia humana (Jesús + equipo eligió para grabar). Señales:

- **historia_mini tiene el mejor ratio (50%).** El arsenal lo marca ○ sub-usado pero en la práctica es el que más convence al criterio humano.
- **provocacion y actuacion_dialogo se descartan más (78% nunca sale de draft).** Están sobre-producidos por el generador.

Aviso metodológico: con 5–22 grabados por tipo, la diferencia entre 22% y 34% no es estadísticamente fuerte. Solo la brecha de historia_mini (50%) se destaca claramente.

---

## Hallazgo 6 — Corrección al análisis inicial: "sobre-representado en contracorriente" fue falso

Agrupación por método de Víctor:

| Agrupación | Total | % de 526 |
|---|---|---|
| Contracorriente (M2 de Víctor): contraintuitivo + provocacion + negacion_directa | 162 | **31%** |
| Inmersión/escena (parcial M1 de Víctor): situacion_especifica + historia_mini + actuacion_dialogo + pregunta_incomoda | 226 | **43%** |

La fortaleza real del sistema es **inmersión/escena**, no contracorriente. Contracorriente es fuerte pero queda en segundo lugar.

En el análisis inicial afirmé "probablemente sobre-representado en contracorriente". Basé esa afirmación solo en el arsenal escrito (5 de 20 fórmulas son flip-like) y proyecté sobre el uso real. La proyección fue incorrecta.

**Lección metodológica:** contar fórmulas en el documento no dice nada sobre cuánto se usan en producción. Hay que mirar siempre el JSON real.

---

## Hallazgo 7 — La data CPL real confirma tensión Víctor vs. ADP

De `cruce-winners-t4-t6-reporte-performance.md`, cita literal:

> "H4 tiene el MEJOR CTR (4.46%) pero NO el mejor CPL ($0.78). CTR alto = mucha gente hace click. CPL bajo = mucha gente que hace click CONVIERTE. Son cosas distintas. H4 genera curiosidad (nostalgia) pero H1 genera intención (auto-selección directa)."

Tabla de CPL por hook del mismo archivo:

| Hook | CPL | Leads | CTR |
|---|---|---|---|
| H1 (auto-selección) | $0.69 | 908 | 3.89% |
| H2 | $0.79 | 408 | 3.71% |
| H4 (nostalgia) | $0.78 | 337 | **4.46%** (mejor CTR) |
| H3 | $0.86 | 118 | 3.01% |
| H5 | $1.38 | 42 | 2.44% |

Mapeo al marco de Víctor:
- H4 (nostalgia) ≈ Método 1 de Víctor (curiosity gap / pattern interrupt emocional). Mejor CTR, peor CPL relativo.
- H1 (auto-selección "Si sabés hacer X") ≈ F1 del arsenal. Peor CTR que H4, pero **mejor CPL**.

**Conclusión empírica:** los métodos de Víctor optimizan atención (CTR/visitas/seguidores). ADP optimiza intención del comprador (CPL). Pueden ir en direcciones opuestas.

La tabla del arsenal coincide:
- F1 auto-selección: $0.38 CPL (único con dato real — ★)
- F2 barreras: $0.99 CPL
- F3 promesa directa: $1.31 CPL

**F1 — el mejor hook de ADP por data real — no está en los 5 métodos de Víctor.** Víctor no enseña la auto-selección por identidad con memoria concreta. Es un hueco en su metodología que ADP ya cubrió empíricamente.

Otra cita del archivo de cruce:
> "Especificidad × Nicho × Verificación visual = CPL bajo."

Faltando cualquiera de las tres, el CPL sube. El video de Víctor cubre bien "verificación visual" (parte del Método 5) pero cubre mal "nicho como filtro de comprador" — Víctor habla de nicho-de-interés (trading, impuestos) no de nicho-de-avatar (mamá 45+ con skill manual). Son diferentes.

---

## Decisiones pendientes (input para síntesis 03)

1. **Unificar taxonomías.** Mapear `situacion_especifica → F16`, `contraintuitivo → F7`, `actuacion_dialogo → F12`, `historia_mini → F11`, `pregunta_incomoda → F4`, `provocacion → F15`, `timeline_provocacion → F13`. Asignar F nuevas (o subtipos) a los 4 huérfanos: confesion, dato_concreto, negacion_directa, analogia_cotidiana.

2. **Arreglar bug de acentos** en `save-generation.mjs` (normalizar `hook_type` al guardar). Migrar los 117 JSON existentes.

3. **Enforcement de la regla de rotación ○**. Validación automática en `save-generation.mjs` o `validate-hooks.mjs`: si el guion no incluye min 2 tipos marcados ○ → warning o bloqueo (decidir severidad).

4. **Vincular generations con CPL real.** Agregar campo `cpl`, `winner_tag`, o `performance` en el JSON de generation. Permite analytics automático de qué F convierte mejor.

5. **Decidir qué del análisis de Víctor sobrevive el filtro CPL vs. solo sirve para atención.** Este punto se resuelve en el análisis palabra por palabra (02) y la síntesis (03).

6. **Revisar el protocolo post-flip de F7/F19.** Víctor exige 4 elementos tras el flip: dramatización del dogma en boca de alguien, contra-frontal extremo, justificación irrefutable, caso de éxito. F7 actual solo cubre 3/6 elementos. Ver detalle en 02.

---

## Referencias cruzadas dentro del sistema

- `/Users/lean/Documents/script-generator/.data/v2/arsenal-hooks.md` — arsenal oficial F1–F20
- `/Users/lean/Documents/script-generator/.data/v2/reglas-duras.md` — §1 prohibiciones, §2 obligaciones, §3 parámetros fijos
- `/Users/lean/Documents/script-generator/scripts/save-generation.mjs` — pipeline de validación y guardado
- `/Users/lean/Documents/script-generator/scripts/validate-hooks.mjs` — detección de patrones prohibidos y similitud
- `/Users/lean/Documents/script-generator/.data/generations/` — 117 guiones guardados (526 hooks)
- `/Users/lean/Documents/script-generator/.data/cruce-winners-t4-t6-reporte-performance.md` — data CPL real (4–6 ads)
- `/Users/lean/Documents/script-generator/.data/cruce-562-vs-winners.md` — cruce data compradores

---

## Cambios al análisis inicial (autocrítica registrada)

Afirmaciones del análisis inicial que **no se sostuvieron** tras el cruce:

| Afirmación inicial | Estado tras cruce |
|---|---|
| "Sobre-representado en contracorriente" | **Falso.** Inmersión 43% > Contracorriente 31%. |
| "El ejemplo F22 de ancla coyuntural sirve" | **Falso.** El ejemplo violaba regla dura "no te alcanza la plata". |
| "La regla anti-gurú se puede separar en autoridad vs. atención" | **Interpretación mía, no la regla.** Requiere edición explícita. |
| "Propondría F21 (categoría sin contenido)" | **Probablemente redundante con F8.** F8 ya hace curiosity gap diferido. |
| "El meta-patrón disonancia es la lente faltante" | **Parcialmente válido.** Pero congruencia directa (M5) no opera por disonancia — opera por heurística de representatividad. La 4ª lente debe llamarse "mecanismo cognitivo activado", no "disonancia" específicamente. |

Afirmaciones que **sí se sostuvieron**:

| Afirmación inicial | Estado tras cruce |
|---|---|
| "Gap total en dirección visual" | **Confirmado.** El sistema produce solo texto. |
| "Protocolo post-flip débil en F7/F19" | **Confirmado.** F7 cubre 3/6 elementos de Víctor. |
| "Método 5 (personaje congruente) implícito en Jesús pero no articulado en hooks" | **Confirmado.** Ningún campo en JSON vincula hook con prueba visual de congruencia. |
