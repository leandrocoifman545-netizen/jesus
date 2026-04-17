# stories-core/ — Núcleo activo del sistema de Stories

**Creado:** 2026-04-15 | **Propósito:** aislar el sistema de stories del resto del ecosistema.

---

## Qué es este directorio

Este es el **núcleo activo único** que consumen las skills `/stories` y `/estrategia-stories`. Contiene 6 archivos destilados que consolidan la información crítica de ~20-30 archivos dispersos en `/Users/lean/Documents/script-generator/.data/`.

**Por qué existe:** antes había 40+ archivos superpuestos (200K de contenido duplicado entre versiones, síntesis, y overlaps de avatar/audiencia). El modelo no podía cargar todo y saltaba pasos → generaba stories genéricas con invenciones. Con 6 archivos limpios, cada skill lee TODO lo relevante en un turn.

**Por qué NO se tocaron los originales:** otros proyectos (ads, bot WhatsApp, sistemas derivados) pueden depender de los archivos originales en `.data/`. Mover o modificar romperia esas integraciones. Los originales quedan intactos como respaldo.

---

## Los 6 archivos núcleo

| # | Archivo | Qué contiene | Leer cuándo |
|---|---------|--------------|-------------|
| 01 | `01-estrategia-avatar.md` | Las 5 creencias que las stories construyen. Qué ES y qué NO ES una story de Jesús. | Siempre, como filtro conceptual antes de generar |
| 02 | `02-sistema-reglas.md` | 7 axiomas + 47 reglas R1-R47 + 28 formatos + 6 premium P1-P6 + 18 triggers + 8 etapas de calentamiento | Siempre, es el manual operativo |
| 03 | `03-inteligencia-compradores.md` | 562 compradores reales con demografía, triggers, dolores, frases textuales + DMs reales + micro-yes para encuestas | Para extraer E1 (frases reales), E2 (DMs), triggers de CTA |
| 04 | `04-avatares.md` | 8 personas reales con nombre/edad/lenguaje exacto | Para elegir avatar y vocabulario específico |
| 05 | `05-motor-audiencia.md` | 13 tensiones → arcos + vocabulario por segmento + 10 objeciones como guiones + persuasión invisible (cómo disolver objeciones con escena) | Para decidir ángulo emocional y arco narrativo |
| 06 | `06-constructor-ideas.md` | 85+ ideas rotables por categoría A-L de la vida real de Jesús | Para cada secuencia, elegir 1-3 ideas con trigger mental asociado |

Además se lee:
- `.memory/jesus-historia.md` — fuente primaria E3 (anécdotas textuales). NO se copia acá, queda en .memory/.
- `.memory/jesus-tono-adp-nuevo.md` — voseo y muletillas. NO se copia.

---

## Mapa "fuente original → destilado"

Si necesitás saber de dónde salió cada sección de los archivos núcleo, este es el mapa:

### 01-estrategia-avatar.md
- **Copia directa de:** `/Users/lean/Documents/script-generator/.data/estrategia-stories-jesus-final.md`

### 02-sistema-reglas.md
- **Base:** `sistema-stories-completo.md` (contenido principal)
- **Apéndice A (47 reglas):** `stories-reglas.md`
- **Apéndice B (formatos):** `stories-formatos-22.md`
- **Apéndice C (P1-P6):** `estetica-stories-140-referencia.md`

### 03-inteligencia-compradores.md
- **Base:** `inteligencia-compradores.md`
- **Apéndice A (DMs + triggers + micro-yes):** `stories-data-audiencia.md`

### 04-avatares.md
- **Copia directa de:** `avatares-adp.md`
- Perfiles reales adicionales están en `03-inteligencia-compradores.md` Apéndice A §4

### 05-motor-audiencia.md
- **Base:** `motor-audiencia.md`
- **Apéndice A (persuasión invisible):** `stories-persuasion-engine.md`

### 06-constructor-ideas.md
- **Copia directa de:** `stories-constructor-jesus.md` (ya bien destilado en origen)

---

## Cuándo actualizar

**Los archivos originales en `.data/` son fuentes de verdad.** Si alguien actualiza `inteligencia-compradores.md` original (ej: nueva encuesta con 200 compradores más), hay que re-destilar a `03-inteligencia-compradores.md`.

**Proceso de re-destilación (manual, por ahora):**
1. Identificar qué archivo fuente cambió.
2. Mirar el mapa de arriba: ¿qué archivo núcleo lo destila?
3. Abrir el archivo núcleo, actualizar la sección correspondiente.
4. Actualizar fecha de destilación en el header (`> **Destilación:** YYYY-MM-DD`).

**Cuándo re-destilar:**
- Cuando un archivo fuente cambia sustancialmente (nueva encuesta, nuevo análisis de creador, etc.).
- Cuando se detecta un desfase entre lo que dicen las skills y lo que hay en los núcleo.
- Al menos 1 vez al mes como mantenimiento preventivo.

**Futuro:** considerar `sync-stories-core.mjs` que detecte cambios en fuentes y re-genere núcleo. Si el mantenimiento manual se vuelve pesado (>30 min/mes), escribir el script.

---

## Qué NO va acá

- **Archivos de ads/guiones:** quedan en `.data/` (no son stories).
- **Análisis de creadores externos** (`analisis-*.md`): quedan en `.data/` como referencias. Si un análisis tiene info aplicable a stories, se destila al archivo núcleo correspondiente.
- **Planes semanales de stories** (`plans-stories/semana-YYYY-MM-DD/plan.md`): son outputs de `/estrategia-stories`, no referencia. Quedan donde están.
- **Outputs de stories** (`stories/semana-*.json`): son las secuencias generadas. Quedan donde están.

---

## Skills que leen de acá

- `/stories` (proyecto `adp-stories`): lee los 6 núcleo en Paso 1 + `.memory/jesus-historia.md` y `.memory/jesus-tono-adp-nuevo.md` condicionalmente.
- `/estrategia-stories` (proyecto `Estrategia-Historias-ADP`): lee los 6 núcleo para generar el plan semanal + menú de ingredientes (Fase 2 del plan de mejora — pendiente).
