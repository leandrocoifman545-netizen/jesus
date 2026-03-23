---
name: stories
description: Genera secuencias de Instagram Stories para Jesús Tassarolo (ADP). Usar cuando el usuario pide stories, historias de Instagram, secuencias, calentamiento, o plan de stories.
argument-hint: [tipo de secuencia] [avatar] [tema/idea]
---

# Generador de Secuencias de Instagram Stories — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación a subagentes.** Generar siempre en el contexto principal.

**Diferencia clave con guiones de ads:** Un guion de ad es UNA pieza de 75-90 segundos. Una secuencia de stories es un ARCO NARRATIVO de 7-15 piezas conectadas que mezclan formatos (foto, video, texto, interacción). La estructura, los formatos y las reglas son completamente distintas.

---

## Paso 0: Leer reglas duras (OBLIGATORIO)

Leer `.data/stories-reglas.md` — las 47 reglas no negociables (R1-R30 base + R31-R37 actuadas + R38-R42 explicativas/BTS + R43-R47 StoryMakers).
Si alguna no se puede cumplir por el brief del usuario, avisar ANTES de generar.

---

## Paso 1: Contexto — Leer archivos (en paralelo, NUNCA con agentes)

### Siempre leer:
1. `.data/stories-secuencias-tipo.md` — los 10 tipos de secuencia (7 originales + 3 nuevos: actuada, explicativa, BTS)
2. `.data/stories-formatos-22.md` — los 25 formatos visuales (22 originales + 3 actuados/narrativos) + tabla de compatibilidad
3. `.data/stories-reglas.md` — reglas duras (si no se leyó en Paso 0)
4. `.data/stories-lead-magnets.md` — biblioteca de lead magnets (si es CTA)
5. `.data/motor-audiencia.md` — tensiones, vocabulario, objeciones, triggers
6. `.data/avatares-adp.md` — los 7 avatares con pesos
7. `.memory/jesus-tono-adp-nuevo.md` — calibración de tono (voseo argentino)
8. `.data/stories-constructor-jesus.md` — Constructor de Calentamiento adaptado a la vida REAL de Jesús (70+ ideas con contenido necesario, citas reales, datos de 562 compradores)
9. `.data/stories-data-audiencia.md` — Hooks de stories, DMs reales para efecto rebaño, triggers de compra, perfiles reales, micro-yes para encuestas (minado de 22,819 conversaciones + 562 compradores)
10. `.data/stories-persuasion-engine.md` — **Motor de Persuasión Invisible:** cómo disolver objeciones DENTRO de la narrativa (no como bloques), activar tensiones como ESCENAS, usar vocabulario por segmento, cadena de micro-yes visuales, triggers por avatar. Inspirado en David Turu: la persuasión más efectiva es la que no se nota.

### Condicionales:
- Si secuencia de PERSONALIDAD → `.memory/jesus-historia.md` (historia de vida, citas)
- Si secuencia de OBJECIÓN → `.data/objeciones-adp.md` (4 objeciones + respuestas)
- Si CTA → `.data/stories-setter-scripts.md` (scripts del setter)
- Si CTA Lead Magnet → `.data/stories-lead-magnets-contenido.md` (contenido real de cada LM)
- Si secuencia ACTUADA (tipo 8) → `.data/references/ref-david-turu-que-hago-cocina.json` (benchmark score 9) + `.data/references/ref-xavi-esqueriguela-que-hago-agencia.json` (benchmark score 6, qué NO copiar)
- Si secuencia EXPLICATIVA DE SERVICIO (tipo 9) → `.data/references/ref-joaco-coronel-como-trabajo-posicionamiento.json` (benchmark pizarra + 3 enemigos) + `.data/references/ref-agus-nievas-que-hago-estructura-stories.json` (benchmark behind-the-scenes score 9)
- Si secuencia BEHIND THE SCENES (tipo 10) → `.data/references/ref-agus-nievas-que-hago-estructura-stories.json` (benchmark score 9)
- Si hay stories previas → `.data/stories/` (para no repetir tipo/avatar)

### Reutilizar del sistema de ads (NO duplicar):
- **Ángulos expandidos** (`angulos-expandidos.md`) → la big idea de la secuencia
- **Motor de audiencia** (`motor-audiencia.md`) → tensión, vocabulario, objeciones
- **Avatares** (`avatares-adp.md`) → a quién le hablamos
- **Enciclopedia de ingredientes** (`enciclopedia-127-ingredientes.md`) → selectivo: A(hooks), D(quiebre), G(prueba social), I(CTA)
- **Winner patterns** (`winner-patterns.md`) → qué ángulos/tonos funcionaron en ads → sesgar stories

---

## Paso 2: Definir TIPO DE SECUENCIA

### Los 10 tipos (de `stories-secuencias-tipo.md`)

| Tipo | Frecuencia | Stories | CTA |
|------|-----------|---------|-----|
| 1. Personalidad | 1/sem | 7-10 | No (outbound) |
| 2. CTA Lead Magnet | 1-2/sem | 4-6 | Inbound (keyword) |
| 3. CTA Volumen | 1/sem | 2-4 | Inbound (juego) |
| 4. CTA Directo | 1 cada 2 sem | 7-10 | Inbound (keyword) |
| 5. Objeción | 1/sem | 7-10 | Soft |
| 6. Nicho / Vida Soñada | 1/sem | 7-10 | No (outbound) |
| 7. Expertise | 1 cada 2 sem | 5-8 | Soft |
| 8. Actuada / Triángulo | 1 cada 2 sem | 7-10 | Inbound (keyword) |
| 9. Explicativa de Servicio | 1 vez (highlight) | 7-10 | Inbound (LM/clase) |
| 10. Behind the Scenes | 1 cada 2 sem | 7-12 | Soft |

### Cómo elegir:
1. Si el usuario pidió un tipo específico → usar ese
2. Si pidió "armame stories para esta semana" → armar 4 secuencias siguiendo la cadencia:
   - Lunes: Personalidad o descanso
   - Martes: CTA Lead Magnet #1
   - Miércoles: Descanso
   - Jueves: CTA Lead Magnet #2 (otro ángulo) o Nicho
   - Viernes: Descanso (SIEMPRE)
   - Sábado: Valores/reflexión
   - Domingo: Hype o espontáneo
3. Revisar `.data/stories/` → qué se publicó esta semana → no repetir tipo

---

## Paso 3: Activar MOTOR DE AUDIENCIA (ANTES de escribir)

Mismo proceso que guiones pero adaptado:

1. **Tensión emocional (T1-T13)** — según el tipo de secuencia y avatar
   - Personalidad → T1 (desgaste silencioso), T6 (vulnerabilidad económica)
   - CTA Lead Magnet → T3 (brecha aspiracional), T8 (comparación social)
   - Objeción → T5 (parálisis por análisis), T7 (trampa del "todavía no")
   - Nicho/Vida Soñada → T3, T6
   - CTA Directo → T12 (brecha acción-resultado), T13 (hartazgo acumulado)
   - Actuada/Triángulo → T1 (desgaste silencioso), T6 (vulnerabilidad económica), T13 (hartazgo acumulado)
   - Explicativa de Servicio → T3 (brecha aspiracional), T4 (curiosidad insatisfecha)
   - Behind the Scenes → T4 (curiosidad insatisfecha), T11 (orgullo latente)

2. **Vocabulario del segmento** — las palabras EXACTAS del avatar. Stories son aún más informales que ads:
   - El texto en pantalla es ultracorto → debe ser EXACTAMENTE como habla el avatar
   - El texto hablado es conversacional → como si le contara a un amigo

3. **Objeción central** (si tipo = Objeción) → estructura completa del motor

4. **Trigger(s) del Constructor de Calentamiento** — elegir 1-3 ideas de la sección 19 del análisis que encajen con el tipo

---

## Paso 3b: Activar PERSUASIÓN INVISIBLE (OBLIGATORIO — de `stories-persuasion-engine.md`)

Después de elegir tensión, vocabulario y triggers, definir ANTES de escribir:

1. **2-3 objeciones a disolver** — elegir de las 10 según el avatar/segmento target. Anotar CÓMO se van a disolver dentro de la narrativa (no como bloque):
   - ¿Qué ESCENA o DATO destruye la objeción sin nombrarla?
   - ¿En qué story cae cada objeción disuelta?

2. **Cadena de micro-yes visuales** (mínimo 3) — definir qué piensa el viewer en cada story:
   - Story X: "Eso me pasa" (identificación)
   - Story Y: "Ah, ¿eso existe?" (curiosidad)
   - Story Z: "Si esa pudo, yo también" (permiso)

3. **Señales de compra** — diseñar la secuencia para que el viewer piense "¿cómo hago?" ANTES del CTA:
   - ¿En qué story sabe que EXISTE la oportunidad?
   - ¿En qué story ve que FUNCIONA?
   - ¿En qué story siente que ES PARA ALGUIEN COMO ÉL?

4. **Test de invisibilidad:** ¿si alguien lee el esqueleto, en algún momento suena a "venta"? Si sí → reescribir.

**Documentar todo esto ANTES de pasar al Paso 4.** Es el brief invisible de la secuencia.

---

## Paso 4: Elegir AVATAR + BIG IDEA + IDEAS DEL CONSTRUCTOR

### 4a. Avatar
Elegir 1 de los 7 avatares. **Mismas reglas de peso que ads:**
- Patricia (48) + Roberto (62) = 56% de las secuencias → deben dominar
- Martín (26) = 5% → máximo 1 de cada 10
- Usar el vocabulario ESPECÍFICO del avatar elegido

### 4b. Big Idea
La big idea de la secuencia viene de los ángulos expandidos:
- **F1 (Identidad)** para Personalidad → "Crecí en Sarandí con un kiosco que quebró"
- **F2 (Oportunidad)** para Nicho → "Miles buscan recetas saludables y nadie les vende una guía"
- **F3 (Confrontación)** para Objeción → "Tenés 55 y pensás que es tarde — mirá a Roberto"
- **F4 (Mecanismo)** para CTA LM → "5 prompts, 30 minutos, tu producto listo"
- **F5 (Historia)** para Personalidad → "Cuando dejé mi laburo de empleado aprendí algo"
- **F1 + F2** para Actuada/Triángulo → "Soledad es terapeuta 12 años y solo vende presencial" (identidad + oportunidad)
- **F4 (Mecanismo)** para Explicativa → "Lo que sabés + IA → producto → WhatsApp → venta"
- **F4 + F5** para Behind the Scenes → "Así armamos un producto con IA en 30 minutos" (mecanismo + historia)

### 4c. Ideas del Constructor
Elegir 1-3 ideas de las 70+ del Constructor (sección 19 del análisis) que encajen:
- Anotar el trigger mental asociado
- La idea da la DIRECCIÓN del contenido, no el guion exacto

---

## Paso 5: Diseñar la ESTRUCTURA de la secuencia

### 5a. Definir el esqueleto
Para cada story, definir:
- **Número** (1 a N)
- **Función:** hook / desarrollo / interacción / resolución / CTA / prueba social
- **Formato visual:** de los 22 formatos, respetando reglas de alternación
- **Tipo de contenido:** texto en pantalla / texto hablado / ambos / solo visual

### 5b. Verificar reglas de alternación
- Story 1 = foto selfie (R1)
- No 2 videos iguales seguidos (R3)
- Al menos 1 interacción (R7)
- Si CTA: doble CTA con prueba social entre medio (R14)
- Si CTA: keyword grande y en color diferente (R15)

### 5c. Definir interacciones
Colocar al menos 1 elemento interactivo:
- **Encuesta** (2 opciones, ambas positivas para que el setter pueda abrir con las dos)
- **Caja de preguntas** ("¿Qué querés saber sobre X?")
- **Botón de reacción** (el fueguito → setter contacta)
- **Slider emoji** (engagement rápido)

---

## Paso 6: Escribir el GUIÓN DE 5 COLUMNAS

### El formato de salida:

```
| # | Texto en pantalla | Texto hablado | Otros | Cómo (formato visual) |
```

### Reglas de escritura:

**Columna "Texto en pantalla":**
- Máximo 2-3 líneas cortas
- 70% de la story es imagen, 30% texto
- Frases de impacto, no explicaciones
- Voseo argentino siempre
- Si hay keyword CTA → MAYÚSCULAS y color diferente

**Columna "Texto hablado":**
- Solo si es video con voz
- Conversacional, como si Jesús hablara con un amigo
- No "marketer speak" → si suena a curso, reescribir
- 15-20 segundos máximo por story hablada
- SIEMPRE anotar "subtítulos" en la columna "Otros"

**Columna "Otros":**
- Encuesta (con las 2 opciones)
- Botón de reacción
- Caja de preguntas
- Música (nombre/estilo)
- Subtítulos
- Stickers (flechas, LetoFonts)
- Keyword (cuál)

**Columna "Cómo":**
- Formato visual (V1-V7, F1-F9, C1-C3, E1-E3)
- Descripción de la imagen/video ("selfie en la cama, relajado, luz natural")
- Ángulo de cámara si es video
- Notas de edición si aplican

#### Transiciones invisibles entre stories (del Copy Engine)
Las transiciones entre stories deben ser INVISIBLES — el espectador fluye de una a la otra como si fuera una sola conversación:
- Story de DOLOR → Story de PIVOTE: línea de quiebre de 1 sola frase ("Eso fue un martes.")
- Story de PIVOTE → Story de PRUEBA: continuación natural de la historia
- Story de PRUEBA → Story de PUENTE: cambio de persona (de "ella" a "vos")
- Story de PUENTE → Story de CTA: separada, el CTA es su propio mundo
- NUNCA usar "Pero eso no es todo..." ni transiciones genéricas entre stories

---

## Paso 7: Validar REGLAS DURAS

Checklist obligatorio (TODOS los tipos):

- [ ] Story 1 = foto selfie mostrando cara (R1) — excepto tipo 8 (Actuada) donde story 1 muestra al Personaje A
- [ ] Total stories entre 7 y 15 (R2) — excepto CTA Volumen (2-4)
- [ ] No 2 videos del mismo formato seguidos (R3)
- [ ] Texto en pantalla corto, 70% imagen (R4)
- [ ] Subtítulos anotados en todos los videos hablados (R5)
- [ ] Cada story conecta lógicamente con la siguiente (R6)
- [ ] Al menos 1 interacción (R7)
- [ ] Si CTA: doble CTA con prueba social en el medio (R14)
- [ ] Keyword grande y color diferente (R15)
- [ ] Voseo argentino en todo el texto (tono Jesús)
- [ ] Tono natural — ¿lo diría Jesús a un amigo? (R21)
- [ ] Formatos alternados según tabla de compatibilidad
- [ ] Lead magnet no repetido vs semana anterior (si CTA LM)
- [ ] **Anti-ficción en texto en pantalla:** Si un texto puede existir en CUALQUIER story de CUALQUIER cuenta → es genérico → reescribir con detalle específico
- [ ] **Números no-redondos** en cualquier dato mencionado (preferir $35.000 sobre $30.000, 9 días sobre "una semana")
- [ ] **Idea creativa definida ANTES de armar estructura** (R43) — documentar en presentación
- [ ] **Triggers elegidos intencionalmente por slide** (R44) — documentar en columna "Otros"
- [ ] **Frases del avatar son TEXTUALES** (R46) — de `stories-data-audiencia.md`, no inventadas

Checklist de persuasión invisible (TODOS los tipos excepto CTA Volumen):

- [ ] **Al menos 2 objeciones DISUELTAS** en la secuencia (no nombradas, no como bloque)
- [ ] **Tensión emocional MOSTRADA en escena**, no dicha en texto
- [ ] **Vocabulario del segmento** en texto en pantalla Y texto hablado
- [ ] **Mínimo 3 micro-yes visuales** distribuidos en la secuencia
- [ ] **CTA llega DESPUÉS de que el viewer ya quiere saber más** (señales de compra activadas)
- [ ] **Al menos 1 dato de inteligencia de compradores** usado naturalmente
- [ ] **Test final:** ¿la secuencia se siente como historia o como venta? Si venta → reescribir

Checklist adicional para tipo 8 (Actuada):

- [ ] Ejemplo tangible y universal, no abstracto (R31)
- [ ] Se muestra resultado del cliente final, no solo plata (R32)
- [ ] Números realistas para LATAM (R33)
- [ ] Calculadora visible en pantalla (R34)
- [ ] Personajes ACTÚAN, no solo fotos con texto (R35)
- [ ] Tono accesible, sin lujo (R36)
- [ ] Máximo 3 personajes (R37)

Checklist adicional para tipo 9 (Explicativa) y 10 (BTS):

- [ ] Pizarra dibujada a mano, no Canva (R38) — si aplica
- [ ] 3 enemigos con nombres específicos (R39) — si aplica
- [ ] Variedad visual por slide (R42)
- [ ] Behind the scenes se siente crudo/real, no producido (R41) — si tipo 10

---

## Paso 8: Check de NATURALIDAD

Stories tienen un estándar de naturalidad AÚN MÁS ALTO que ads. La gente huele la venta.

### Preguntas de control:
1. **N1:** ¿Suena como Jesús hablando con un amigo o como un curso de marketing?
2. **N2:** ¿Esta secuencia se sentiría forzada entre stories de lifestyle?
3. **N3:** ¿El CTA (si hay) es orgánico o se nota que es un ad metido en stories?
4. **N4:** ¿Hay demasiadas stories "enseñando" vs "mostrando"?
5. **N5:** ¿Las frases del texto en pantalla son cosas que Jesús diría o frases de ChatGPT?

### Señales de alerta:
- Frases largas con subordinadas → acortar
- Palabras como "impactante", "revolucionario", "increíble" → sacar
- Más de 3 stories seguidas de texto hablado → intercalar con fotos
- CTA con urgencia artificial → suavizar

### Reglas adicionales para secuencias ACTUADAS (tipo 8):
- **N6:** ¿Los personajes se sienten reales o parecen actores de publicidad?
- **N7:** ¿El ejemplo es tangible (cocina, terapia) o abstracto (agencia, dropshipping)?
- **N8:** ¿Los números son realistas para LATAM ($400) o inflados (€10.000)?
- **N9:** ¿Se muestra el resultado del CLIENTE FINAL o solo la plata del protagonista?
- **N10:** ¿La secuencia fluye como una mini-historia o como un PowerPoint?

### Reglas adicionales para secuencias EXPLICATIVAS (tipo 9):
- **N11:** ¿La pizarra hace tangible lo intangible o es solo texto dibujado?
- **N12:** ¿Los "3 enemigos" son reales para el avatar o genéricos?
- **N13:** ¿El CTA es natural ("te mando un PDF") o forzado ("comprá ahora")?

### Curso StoryMakers — Principios transversales (aplican a TODOS los tipos):
- **Idea creativa ANTES de estructura** (lección 22): pensar 5-10 min cómo comunicar emocionalmente la idea, como explicándosela a un nene de 5 años. DESPUÉS armar la estructura
- **18 triggers intencionales** (lección 9): elegir 1-3 triggers POR SLIDE, no al azar. Documentar en columna "Otros"
- **Naturalidad > todo** (lección 30): "la gente ya lo huele". Pensar cómo Jesús le contaría esto a un amigo SIN saber de marketing. Si suena a curso → reescribir
- **Tener el documento del avatar al lado** (Agus Nievas): no improvisar, usar frases TEXTUALES de `stories-data-audiencia.md`
- **Variedad visual por slide** (Agus Nievas): cada slide = escenario distinto. No todo sentado hablando

---

## Paso 9: Presentar al usuario

### Formato de presentación:

```markdown
## Secuencia: [Tipo] — [Big Idea en 1 frase]

**Avatar:** [Nombre, edad] | **Tensión:** [T#] | **Trigger:** [nombre]
**Capa:** [personalidad/nicho/producto/venta] | **Día sugerido:** [día]
**Idea del Constructor:** [nombre de la idea]

### Secuencia (N stories)

| # | Texto en pantalla | Texto hablado | Otros | Cómo |
|---|---|---|---|---|
| 1 | ... | ... | ... | ... |

### Instrucciones para setter
[Si es CTA — qué dice el setter cuando responden]

### Banco de contenido necesario
- [ ] Foto selfie en [contexto]
- [ ] Video de [qué]
- [ ] Captura de [qué]

### Notas de grabación
[Tips para Jesús al grabar: tono, energía, dónde hacerlo]
```

---

## Paso 10: Guardar

Guardar en `.data/stories/` como JSON:

```json
{
  "id": "uuid",
  "type": "story_sequence",
  "sequence_type": "personalidad|cta_lead_magnet|cta_volumen|cta_directo|objecion|nicho_vida_sonada|expertise|actuada_triangulo|explicativa_servicio|behind_the_scenes",
  "avatar": "nombre_del_avatar",
  "big_idea": "...",
  "calentamiento_layer": "personalidad|nicho|producto|venta",
  "trigger_names": ["Vida soñada", "Facilidad"],
  "constructor_ideas": ["Mostrar cómo disfrutás del nicho"],
  "tension_id": "T3",
  "angle_family": "oportunidad",
  "total_stories": 8,
  "stories": [
    {
      "number": 1,
      "function": "hook",
      "text_on_screen": "Hoy me quedé pensando en algo...",
      "text_spoken": null,
      "interaction": null,
      "visual_format": "F1",
      "format_description": "Foto selfie en la cama, relajado, luz natural",
      "notes": null
    }
  ],
  "cta": {
    "type": "inbound|outbound|none",
    "keyword": "CLASE",
    "lead_magnet_id": "LM-5",
    "setter_script": "..."
  },
  "content_bank_needed": ["selfie cama", "captura ventas"],
  "planned_day": "martes",
  "week": "2026-W13",
  "status": "borrador",
  "createdAt": "2026-03-22T...",
  "metrics": {
    "views_first_story": null,
    "views_last_story": null,
    "retention_pct": null,
    "dms_generated": null,
    "reactions": null
  }
}
```

---

## MODO: Plan Semanal de Stories

Cuando el usuario pide "armame las stories de la semana" o "plan de stories":

### 1. Revisar qué se publicó la semana pasada
Leer `.data/stories/` → filtrar por semana anterior → anotar tipos, avatares, lead magnets usados

### 2. Armar 4 secuencias siguiendo la cadencia
| Día | Tipo | Avatar | Lead Magnet |
|-----|------|--------|-------------|
| Lunes o Martes | CTA Lead Magnet #1 | [rotar] | [rotar] |
| Jueves | CTA Lead Magnet #2 (otro ángulo) O Nicho/Vida Soñada O Behind the Scenes | [rotar] | [otro] |
| Sábado | Personalidad O Objeción O Actuada/Triángulo | [rotar] | — |
| Domingo | Expertise O CTA Volumen | [rotar] | — |

**Nota:** Tipo 8 (Actuada) y Tipo 10 (BTS) entran 1 cada 2 semanas en rotación.
**Nota:** Tipo 9 (Explicativa de Servicio) se hace UNA vez y va a Highlights — no entra en la cadencia semanal.

### 3. Para cada secuencia, seguir Pasos 3-10

### 4. Presentar el plan completo con las 4 secuencias

---

## CROSS-REFERENCE: Cómo Stories usa los sistemas de Ads

| Sistema de Ads | Cómo se usa en Stories |
|----------------|----------------------|
| Motor de Audiencia (tensiones T1-T13) | Elegir arco emocional de la secuencia |
| Motor de Audiencia (vocabulario) | Texto en pantalla + texto hablado |
| Motor de Audiencia (objeciones) | Secuencias tipo "Objeción" |
| Motor de Audiencia (intentos fallidos) | Hook de resultado en CTA LM |
| Motor de Audiencia (micro-yes) | Las interacciones (encuestas, reacciones) SON micro-yes |
| Avatares (7 con pesos) | A quién va cada secuencia. Mismos pesos |
| Ángulos Expandidos (5 familias) | Big idea de cada secuencia |
| Ingredientes A (hooks) | Hook de la primera story |
| Ingredientes D (quiebre) | Stories de desarrollo en objeciones |
| Ingredientes G (prueba social) | Stories de testimonios/resultados |
| Ingredientes I (CTA) | Keywords, comandos embebidos |
| Winner Patterns | Sesgar hacia ángulos/tonos que funcionaron |
| CTA Biblioteca | El setter usa la info de CTA para guiar conversación |
| Objeciones ADP | Contenido de secuencias de objeción |
| Historia de Jesús | Secuencias de personalidad |
| Tono de Jesús | Calibración de todo el texto |
