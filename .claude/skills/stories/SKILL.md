---
name: stories
description: Genera secuencias de Instagram Stories para Jesús Tassarolo (ADP). Usar cuando el usuario pide stories, historias de Instagram, secuencias, calentamiento, o plan de stories.
argument-hint: [tipo de secuencia] [avatar] [tema/idea]
---

# Generador de Secuencias de Instagram Stories — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación a subagentes.** Generar siempre en el contexto principal.

**Diferencia clave con guiones de ads:** Un guion de ad es UNA pieza de 75-90 segundos. Una secuencia de stories es un ARCO NARRATIVO de 7-15 piezas conectadas que mezclan formatos (foto, video, texto, interacción). La estructura, los formatos y las reglas son completamente distintas.

**Principio fundacional (Nafé, StoryMakers):** Las stories representan el 80-90% de las ventas. Feed y Reels atraen; las Stories VENDEN. Pero la venta no ocurre en un story de "comprá acá" — ocurre a través de un calentamiento sistemático que construye confianza, autoridad y deseo ANTES de hacer cualquier CTA.

> "El 50% de una venta es confianza. La otra mitad es urgencia, prueba social y oferta."

---

## Paso 0: Pre-flight & Audit (OBLIGATORIO)

### Validación automática disponible
El script `scripts/stories-validate.mjs` valida automáticamente el JSON de una secuencia antes de guardar. Escanea: campos obligatorios, alternación de formatos, montaña rusa emocional, triggers por story, hooks prohibidos (SH1-SH6), patrones anti-IA (S-IA3/8/9/10), voseo, objeciones disueltas, micro-yes, y repetición contra últimas 10 secuencias.

**Si hay errores → CORREGIR antes de guardar. Warnings → presentar al usuario.**

### 0a. Leer reglas duras
Leer `.data/stories-reglas.md` — las 47 reglas no negociables (R1-R30 base + R31-R37 actuadas + R38-R42 explicativas/BTS + R43-R47 StoryMakers).
Si alguna no se puede cumplir por el brief del usuario, avisar ANTES de generar.

### 0b. Verificar historial
Revisar `.data/stories/` → qué se publicó las últimas 2 semanas:
- Tipos usados → no repetir 2 semanas seguidas (excepto CTA LM que va 1-2x/sem)
- Avatares usados → rotar
- Lead magnets usados → rotar (nunca repetir el mismo LM 2 semanas seguidas)
- Ángulos usados → diversificar familia

### 0c. Leer winner patterns
Leer `.data/winner-patterns.md` y `.data/session-insights.md` — sesgar decisiones hacia lo que funciona en ads (los ángulos/tonos exitosos en ads tienden a funcionar en stories también).

### 0d. Anti-repetición de hooks de stories

Revisar `.data/stories/` → extraer los hooks (story 1 de cada secuencia) de las últimas 10 secuencias. No repetir el mismo ESQUELETO estructural.

**6 esqueletos de hooks de stories prohibidos por sobreuso:**

| # | Patrón | Ejemplo | Por qué muere |
|---|--------|---------|---------------|
| SH1 | "Hoy me quedé pensando en..." | Cualquier reflexión genérica | Suena a template. 0 intriga |
| SH2 | "Me escribió alguien ayer..." | DM → respuesta → caso | Predecible: todos saben que viene venta |
| SH3 | "¿Sabés qué día es hoy?" | Martes → lifestyle → nicho | Usado en todos los cursos de stories |
| SH4 | "No vas a creer lo que pasó" | Promesa vacía sin payoff | Si el payoff no es WOW, destruye confianza |
| SH5 | "Tengo que contarte algo..." | Misterio sin ancla | Funciona la primera vez, no la quinta |
| SH6 | "Esto me cambió la vida" | Afirmación grandiosa + producto | Suena a infomercial |

**Regla (igual que guiones):** Si cambiando el tema/nicho el hook produce la MISMA secuencia → es repetición estructural → prohibido.

**Qué SÍ funciona para hooks de stories (probado en coaching):**
- Imagen/foto disruptiva que CONTRADICE expectativas (IA de Jesús calvo, vestido de Papá Noel)
- Juego interactivo donde la gente PARTICIPA ("adiviná", "sacá captura")
- Dato cotidiano con giro ("Hoy vuelvo a la universidad" → ¿le fue mal?)
- Acción visual inesperada (raparse, comprar algo, estar en un lugar raro)
- Humor puro sin contexto (genera curiosidad + views para el resto)

---

## Paso 1: Contexto — Leer archivos (en paralelo, NUNCA con agentes)

### Siempre leer:
1. `.data/stories-secuencias-tipo.md` — los 10 tipos de secuencia (7 originales + 3 nuevos: actuada, explicativa, BTS)
2. `.data/stories-formatos-22.md` — los 28 formatos visuales (22 originales + 3 actuados/narrativos + 6 premium estéticos P1-P6) + tabla de compatibilidad. Los P1-P6 vienen de análisis de 140 stories de 8 creadores (2026-03-29) — ver specs de reproducción en memoria `reference_estetica_stories_140.md`
3. `.data/stories-reglas.md` — reglas duras (si no se leyó en Paso 0)
4. `.data/stories-lead-magnets.md` — biblioteca de lead magnets (si es CTA)
5. `.data/motor-audiencia.md` — tensiones, vocabulario, objeciones, triggers
6. `.data/avatares-adp.md` — los 8 avatares con pesos
7. `.memory/jesus-tono-adp-nuevo.md` — calibración de tono (voseo argentino)
8. `.data/stories-constructor-jesus.md` — Constructor de Calentamiento adaptado a la vida REAL de Jesús (85+ ideas en 12 categorías A-L, con contenido necesario, citas reales, datos de 562 compradores). Cada idea tiene campo `Secuencias:` (tipos sugeridos) y tag `[ROTABLE]` (se puede repetir con variaciones). Cat. L = formatos disruptivos (humor, swipe-back, IA visual, arrepentimiento, Meli).
9. `.data/stories-data-audiencia.md` — Hooks de stories, DMs reales para efecto rebaño, triggers de compra, perfiles reales, micro-yes para encuestas (minado de 22,819 conversaciones + 562 compradores)
10. `.data/stories-persuasion-engine.md` — **Motor de Persuasión Invisible:** cómo disolver objeciones DENTRO de la narrativa (no como bloques), activar tensiones como ESCENAS, usar vocabulario por segmento, cadena de micro-yes visuales, triggers por avatar. Inspirado en David Turu: la persuasión más efectiva es la que no se nota.

### Opcional (si hay data reciente):
11. **Google Trends** — Si se corrió `node scripts/trends-scan.mjs` recientemente, usar nichos trending como topics para stories de tipo **Expertise** o **Nicho/Vida Soñada**. Los topics que están subiendo generan más engagement porque están en la conversación cultural del momento.

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

| Tipo | Frecuencia | Stories | CTA | Capa calentamiento |
|------|-----------|---------|-----|--------------------|
| 1. Personalidad | 1/sem | 7-10 | No (outbound) | Personalidad |
| 2. CTA Lead Magnet | 1-2/sem | 4-6 | Inbound (keyword) | Nicho/Producto |
| 3. CTA Volumen | 1/sem | 2-4 | Inbound (juego) | Nicho |
| 4. CTA Directo | 1 cada 2 sem | 7-10 | Inbound (keyword) | Venta |
| 5. Objeción | 1/sem | 7-10 | Soft | Producto |
| 6. Nicho / Vida Soñada | 1/sem | 7-10 | No (outbound) | Nicho |
| 7. Expertise | 1 cada 2 sem | 5-8 | Soft | Producto |
| 8. Actuada / Triángulo | 1 cada 2 sem | 7-10 | Inbound (keyword) | Nicho/Producto |
| 9. Explicativa de Servicio | 1 vez (highlight) | 7-10 | Inbound (LM/clase) | Producto |
| 10. Behind the Scenes | 1 cada 2 sem | 7-12 | Soft | Nicho/Producto |

### Cómo elegir:
1. Si el usuario pidió un tipo específico → usar ese
2. Si pidió "armame stories para esta semana" → armar 4 secuencias siguiendo la cadencia (ver MODO: Plan Semanal al final)
3. Revisar `.data/stories/` → qué se publicó esta semana → no repetir tipo

### Cadencia semanal base:
- Lunes: Personalidad o descanso
- Martes: CTA Lead Magnet #1 (el día más activo para CTAs)
- Miércoles: Descanso
- Jueves: CTA Lead Magnet #2 (otro ángulo) o Nicho/Vida Soñada o BTS
- Viernes: Descanso (**SIEMPRE** — patrón universal de las 21 sesiones de coaching)
- Sábado: Valores/reflexión/presentar a Meli
- Domingo: Hype o CTA Volumen (juego)

---

## Paso 3: Activar MOTOR DE AUDIENCIA (ANTES de escribir)

### 3a. Tensión emocional (T1-T13) — según el tipo de secuencia y avatar

| Tipo de secuencia | Tensiones recomendadas |
|-------------------|----------------------|
| Personalidad | T1 (desgaste silencioso), T6 (vulnerabilidad económica) |
| CTA Lead Magnet | T3 (brecha aspiracional), T8 (comparación social) |
| Objeción | T5 (parálisis por análisis), T7 (trampa del "todavía no") |
| Nicho/Vida Soñada | T3, T6 |
| CTA Directo | T12 (brecha acción-resultado), T13 (hartazgo acumulado) |
| Actuada/Triángulo | T1, T6, T13 |
| Explicativa de Servicio | T3, T4 (curiosidad insatisfecha) |
| Behind the Scenes | T4, T11 (orgullo latente) |

### 3b. Vocabulario del segmento
Las palabras EXACTAS del avatar, copiadas de `motor-audiencia.md`. Stories son AÚN MÁS INFORMALES que ads:
- Texto en pantalla = ultracorto → EXACTAMENTE como habla el avatar
- Texto hablado = conversacional → como si le contara a un amigo

**Por segmento (regla dura de vocabulario):**
| Segmento | USA | NUNCA usa |
|----------|-----|-----------|
| A (joven emprendedor) | "proyecto", "avanzar", "estancado" | "jubilarse", "ahorros" |
| B (intento y falló) | "otra vez no", "cursos", "esta vez" | promesas grandiosas |
| C (mamá/papá) | "hijos", "sin salir de casa", "mis tiempos" | "dejá todo", "metele 4 horas" |
| D (+50 escéptico) | "aprender", "paso a paso", "sin compromiso" | "fácil", "te vas a hacer rico" |

### 3c. Objeción central (si tipo = Objeción) → estructura completa del motor

### 3d. Trigger(s) del Constructor de Calentamiento
Elegir 1-3 ideas de `stories-constructor-jesus.md` que encajen con el tipo. **Filtrar por campo `Secuencias:`** — cada idea indica qué tipos de secuencia son sugeridos. Priorizar ideas `[ROTABLE]` si ya se usaron ideas one-shot en semanas anteriores. Anotar el trigger mental asociado.

---

## Paso 3b: Activar PERSUASIÓN INVISIBLE (OBLIGATORIO — de `stories-persuasion-engine.md`)

> "Si el viewer se da cuenta de que le están rebatiendo una objeción, fallaste."

Después de elegir tensión, vocabulario y triggers, definir ANTES de escribir:

### 1. Objeciones a disolver (2-3 máximo por secuencia)
Elegir de las 10 según avatar/segmento. Para cada una, anotar:
- ¿Qué ESCENA o DATO destruye la objeción sin nombrarla?
- ¿En qué story cae?

**Las 10 técnicas de disolución invisible (del curso + sesiones de coaching):**

| Objeción | Cómo disolverla en escena |
|----------|--------------------------|
| "No sé de tecnología" | Mostrar a alguien mayor usando el celular normalmente. Roberto (62) dicta un audio de WhatsApp |
| "No tengo seguidores" | Mencionar el número real bajo: "Patricia tiene 43 seguidores. Ni bio tiene" → 3 stories después → "Vendió $134.750" |
| "No tengo tiempo" | Mostrar el MOMENTO exacto: "Son las 10pm. Los chicos se durmieron. Patricia agarra el celular" |
| "Ya probé y no funcionó" | Nombrar lo que probó como parte de su historia: "Martín compró 3 cursos. No vendió nada. Hasta que..." |
| "Es una estafa" | Calculadora en pantalla con números reales, no promesas |
| "No sé qué vender" | Revelar el producto como algo que ya sabía hacer: "Héctor hacía asados. Nunca pensó que eso era un producto" |
| "Eso no funciona acá" | Mencionar ciudades de pasada: "Patricia vive en Salta. Roberto en Mendoza. Diego en Buenos Aires" |
| "Suena muy fácil" | Screen recording de 30s del proceso real. Se ve que hay trabajo, pero se ve que es posible |
| "No tengo plata" | El número aparece naturalmente: "Le costó lo mismo que un café. $5" |
| "Ya vi videos y no hice nada" | Contrastar: "No le mostré un video. Le dije: abrí el celular, dictá esto" |

### 2. Cadena de micro-yes visuales (mínimo 3)
Definir qué piensa el viewer en cada story clave:
1. "Eso me pasa" → story de identificación (escena del dolor)
2. "Ah, ¿eso existe?" → story de revelación (mecanismo)
3. "Es simple" → story de proceso visible
4. "Funciona" → story de resultado concreto
5. "Es para gente como yo" → story con personaje similar
6. "Quiero saber más" → story pre-CTA (open loop)

**Diferencia clave con ads:** En stories los micro-yes son VISUALES. La identificación es una ESCENA reconocible. La curiosidad es un CORTE a la siguiente story justo antes de revelar. El permiso es un PERSONAJE parecido logrando algo.

### 3. Señales de compra — diseño inverso desde el CTA
El CTA llega cuando el viewer YA piensa "¿cómo hago?":
- ¿En qué story sabe que EXISTE la oportunidad?
- ¿En qué story ve que FUNCIONA?
- ¿En qué story siente "ES PARA ALGUIEN COMO YO"?
- ¿En qué story piensa "YO PODRÍA"?
- ¿En qué story quiere SABER MÁS?
→ Recién ahí: CTA

**Si el CTA llega antes de que el viewer quiera inscribirse, no funciona.**

### 4. Test de invisibilidad
Leer el esqueleto completo. ¿En algún momento suena a "venta"? Si sí → rediseñar.

### 5. Densidad de persuasión por tipo

| Tipo | Qué activar | Densidad |
|------|------------|----------|
| 1. Personalidad | Tensiones + vocabulario + 1 objeción max | BAJA (prioridad = conexión) |
| 2. CTA Lead Magnet | Triggers + micro-yes + 2 objeciones | MEDIA |
| 3. CTA Volumen | Triggers solamente | MUY BAJA (prioridad = interacción) |
| 4. CTA Directo | TODOS los sistemas al máximo | ALTA |
| 5. Objeción | Objeciones disueltas en caso real | ALTA (pero invisible) |
| 6. Nicho/Vida Soñada | Tensiones + triggers + vocabulario | MEDIA (metacomunicación) |
| 7. Expertise | Micro-yes + 1 objeción disuelta | BAJA-MEDIA |
| 8. Actuada | TODOS los sistemas al máximo | ALTA (pero invisible, es mini-película) |
| 9. Explicativa | Triggers + objeciones + micro-yes | ALTA |
| 10. BTS | Objeciones disueltas en el proceso mostrado | MEDIA |

**Documentar todo esto ANTES del Paso 3c.** Es el brief invisible de la secuencia.

---

## Paso 3c: DECLARACIÓN OBLIGATORIA (mostrar al usuario ANTES de escribir)

> Equivalente al Paso 3b del skill de guiones. Fuerza decisiones intencionales y visibles.

**Presentar estas 3 tablas al usuario y esperar aprobación antes de pasar al Paso 4.**

### Tabla 1: Activación del Motor

| Elemento | Decisión | Justificación |
|----------|----------|---------------|
| Tipo de secuencia | [1-10] — nombre | Por qué este tipo esta semana |
| Tensión emocional | T# — nombre | Por qué esta tensión para este avatar |
| Avatar | [Nombre, edad] — segmento [A/B/C/D] | Peso real + rotación |
| Vocabulario (8 palabras exactas) | [copiadas de motor-audiencia, NO parafraseadas] | Estas palabras exactas en texto en pantalla y hablado |
| Objeciones a disolver | O1: [nombre] en story # via [ESCENA/DATO] | Cómo se disuelve sin nombrar |
| | O2: [nombre] en story # via [ESCENA/DATO] | |
| Capa de calentamiento | personalidad / nicho / producto / venta | Dónde cae en el ciclo eterno |
| Idea del Constructor | [nombre de la idea] — Trigger: [nombre] — [ROTABLE]/one-shot | De las 85+ ideas, filtrado por `Secuencias:` |
| Arco emocional | [emoción1 → emoción2 → ... → emociónN] | Mínimo 3 cambios |
| Big idea | [1 frase específica, no genérica] | De qué familia de ángulo viene |

### Tabla 2: Cadena de Micro-YES Visuales (mínimo 3)

| # | Story | Pensamiento del viewer | Tipo | Técnica visual |
|---|-------|----------------------|------|---------------|
| 1 | Story 2 | "Eso me pasa" | identificación | Escena reconocible del dolor |
| 2 | Story 4 | "Ah, ¿eso existe?" | curiosidad | Corte justo antes de revelar |
| 3 | Story 6 | "Si esa pudo, yo también" | permiso | Personaje similar al viewer |
| ... | ... | ... | ... | ... |

### Tabla 3: Mapa de Triggers por Story

| Story # | Función | Trigger mental (de los 18) | Formato visual | Emoción |
|---------|---------|---------------------------|----------------|---------|
| 0* | humor pre-secuencia | Simpatía | V1/F1 | humor |
| 1 | hook | Intriga | F1 (selfie) | curiosidad |
| 2 | desarrollo | Relevancia | V1 (video selfie) | nostalgia |
| ... | ... | ... | ... | ... |

*Story 0 solo si secuencia tiene CTA y se usa humor-primero

**Reglas de la declaración:**
- Si el arco emocional tiene menos de 3 cambios → rediseñar
- Si no hay al menos 2 objeciones disueltas (excepto CTA Volumen) → agregar
- Si el vocabulario es genérico y no del segmento específico → corregir
- Si la big idea es genérica ("productos digitales con IA") → repensar
- Si 2+ stories consecutivas tienen el mismo trigger → redistribuir
- Si algún trigger falta de justificación → revisar

**El usuario puede ajustar la declaración antes de que se escriba el guion.**

---

## Paso 4: IDEA CREATIVA + Avatar + Big Idea

> "El error universal: Idea → ChatGPT → Guion plano. El proceso correcto tiene un paso intermedio que nadie hace." — Nafé, lección 22

### 4a. LA IDEA CREATIVA (el paso que cambia todo)

> "El error universal: Idea → ChatGPT → Guion plano. El proceso correcto tiene un paso intermedio que nadie hace." — Nafé, lección 22

**ANTES de definir estructura o escribir una sola palabra, completar estos 5 campos obligatorios:**

| Campo | Qué completar | Ejemplo |
|-------|--------------|---------|
| **Idea base** | El mensaje/concepto a comunicar | "La competencia aumenta en productos digitales" |
| **Vehículo emocional** | Metáfora, juego, historia o imagen que baja la idea a tierra. Pensar: ¿cómo se lo explicarías a un nene de 5 años? | "Estrellas en el cielo — ¿podés encontrar una que destaque? Pero el sol SÍ destaca" |
| **Hook de arranque** | La primera frase/imagen que genera curiosidad o emoción (NUNCA dato frío ni estadística) | "¿Podés encontrar una estrella que destaque entre miles?" |
| **Giro/revelación** | El momento donde la metáfora conecta con la realidad del avatar | "Eso es lo que pasa con las marcas personales. Pero el sol SÍ destaca" |
| **Conexión con el avatar** | Cómo el viewer se ve reflejado al final | "¿Querés ser una estrella más o el sol?" |

**Test de validación (los 3 deben ser SÍ):**
1. ¿La secuencia empieza con algo que genera curiosidad o emoción? (Si empieza con dato frío → FALLÓ)
2. ¿Un amigo de Jesús entendería la idea sin saber de marketing? (Si necesita contexto → simplificar)
3. ¿La idea es DISTINTA a las últimas 5 secuencias? (Si se parece → buscar otro vehículo)

**Ejemplo estrella del curso:**
- Idea base: "La competencia aumenta en marcas personales"
- Vehículo: Estrellas vs Sol — algo visual e inmediato
- Hook: "Juguemos a un juego. ¿Sos capaz de encontrar una estrella que destaque?"
- Giro: "Obvio que no — son todas iguales. Eso pasa con las marcas personales."
- Conexión: "Cuando sos una marca personal de autoridad, las oportunidades vienen hacia vos, como los planetas al sol"
- Resultado: **duplicó las views ese día**

### 4b. Avatar
Elegir 1 de los 8 avatares. **Mismas reglas de peso que ads:**
- Patricia (48) + Roberto (62) = 56% de las secuencias → deben dominar
- Martín (26) = 5% → máximo 1 de cada 10
- Usar el vocabulario ESPECÍFICO del avatar elegido

### 4c. Big Idea
La big idea de la secuencia viene de los ángulos expandidos:
- **F1 (Identidad)** para Personalidad → "Crecí en Sarandí con un kiosco que quebró"
- **F2 (Oportunidad)** para Nicho → "Miles buscan recetas saludables y nadie les vende una guía"
- **F3 (Confrontación)** para Objeción → "Tenés 55 y pensás que es tarde — mirá a Roberto"
- **F4 (Mecanismo)** para CTA LM → "5 prompts, 30 minutos, tu producto listo"
- **F5 (Historia)** para Personalidad → "Cuando dejé mi laburo de empleado aprendí algo"
- **F1 + F2** para Actuada/Triángulo → "Soledad es terapeuta 12 años y solo vende presencial"
- **F4 (Mecanismo)** para Explicativa → "Lo que sabés + IA → producto → WhatsApp → venta"
- **F4 + F5** para Behind the Scenes → "Así armamos un producto con IA en 30 minutos"

### 4d. Ideas del Constructor
Elegir 1-3 ideas de las 85+ del Constructor (`stories-constructor-jesus.md`):
- **Filtrar por `Secuencias:`** para encontrar ideas que matcheen con el tipo elegido
- Si la idea es `[ROTABLE]`, anotar qué variación se usará (distinta a la anterior)
- Priorizar **categoría L** (formatos disruptivos) para romper patrones — al menos 1 idea de L cada 2 semanas
- Anotar el trigger mental asociado
- La idea da la DIRECCIÓN, no el guion exacto

### 4e. Técnica Humor-Primero (si la secuencia tiene CTA)

**Comprobado en sesiones de coaching:** Subir una story de comedia/humor ANTES de la secuencia real. Esperar 30 minutos. Después subir el resto.

- La gente entra a Instagram para entretenerse, no para que le vendan
- Una story de humor es lo que cualquiera subiría → se ve NATURAL
- Si empezás directo con la trama, la gente dice "ya me está vendiendo" y sale
- Maximiza el volumen de views para cuando llegue el CTA

**Documentar la story de humor en la presentación como "Story 0 (pre-secuencia)".**

---

## Paso 5: Diseñar la ESTRUCTURA de la secuencia

### 5a. Montaña rusa emocional (principio organizador)

> "Las stories tienen que ser una montaña rusa constante: humor, intriga, tristeza, alegría, miedo. Cuantas más emociones, más fans se crean." — Nafé

Antes de definir el esqueleto, diseñar el **arco emocional** de la secuencia:
- ¿Qué emoción genera cada story?
- ¿Hay al menos 3 cambios de emoción?
- ¿Hay algún pico emocional (momento de máxima tensión)?

**Ejemplo de arco emocional (secuencia de personalidad):**
```
Curiosidad → Nostalgia → Tristeza → Esperanza → Humor → Reflexión → Conexión
```

### 5b. Definir el esqueleto
Para cada story, definir:
- **Número** (1 a N)
- **Función:** hook / desarrollo / interacción / resolución / CTA / prueba social
- **Formato visual:** de los 22+3 formatos, respetando reglas de alternación
- **Tipo de contenido:** texto en pantalla / texto hablado / ambos / solo visual
- **Emoción:** qué emoción genera esta story
- **Trigger mental** (de los 18): cuál se activa en esta story

### 5c. Alternación visual (la regla del cine)

> "En el cine se cambia de plano cada 3-5 segundos. En stories hay que hacer lo mismo. Cuando cambiamos de formato, el cerebro segrega dopamina."

- **Story 1 = SIEMPRE foto selfie** (R1). La gente pasa stories rápido — si no ven tu cara, no saben en qué cuenta están
- **Nunca 2 videos del mismo tipo seguidos** (V1→V1 prohibido, V1→V2 OK)
- **Nunca 2 fotos estáticas seguidas sin interacción** (si son 2 fotos, la segunda tiene encuesta/sticker)
- **Máximo 3 stories de texto hablado seguidas**, intercalar con fotos/capturas
- Secuencia ideal: foto → video → collage → story oscurecida → capturas → video editado
- Cada story = escenario visual distinto (regla Agus Nievas)

### 5d. Interacciones (mínimo 1 por secuencia)
- **Encuesta** (2 opciones, AMBAS POSITIVAS — NUNCA opción negativa, para que el setter pueda abrir a TODOS)
- **Caja de preguntas** ("¿Qué querés saber sobre X?")
- **Botón de reacción** (fueguito → setter contacta)
- **Slider emoji** (engagement rápido)

### 5e. Doble CTA con efecto rebaño (si tiene CTA)

**Siempre hacer DOS CTAs con prueba social en el medio:**
1. CTA → "Respondé [KEYWORD]"
2. Capturas de DMs/comentarios de gente respondiendo (efecto rebaño)
3. Segundo CTA → repite la keyword

El segundo CTA suele tener MÁS interacción que el primero. Mostrar capturas de DMs genera 40% más respuestas.

**Regla de timing:** Esperar 30-60 minutos entre la story 1 (hook de views) y el resto de la secuencia. La story 1 maximiza el reach para que más gente vea el CTA.

### 5f. Framework de Michael Hauge (solo para tipo 1: Personalidad — historia de vida)

Estructura de 6 etapas para la historia de vida (la secuencia más poderosa):

1. **Setup** — Presentar al protagonista, contexto. Hook intrigante (NUNCA "hola, me llamo X, esta es mi historia")
2. **Crisis** — El problema que inicia todo. POR QUÉ empezó a emprender. Atacar MIEDOS del avatar
3. **Búsqueda** — Busca solución, vive aventuras. Mostrar la SENCILLEZ del nicho
4. **Conflicto** — Las cosas se complican. Obstáculos. → ACA DIVIDIR en Parte 2: "2000 reacciones y mañana cuento qué pasó"
5. **Clímax** — Momento más emocional. Vender el VEHÍCULO (el nicho es lo que lo llevó del punto más bajo al más alto)
6. **Desenlace** — Situación ideal actual, atacando DESEOS del avatar

Tips de Hauge:
- Cuando se habla del pasado, MOSTRAR fotos del pasado
- "Mostrar, no decir" — siempre que digas algo, respaldalo con foto/captura/evidencia
- Al final, mostrar comentarios de personas que conectaron
- Fijar esta secuencia en Highlights

### 5g. Secuencias CORTAS para vender, LARGAS para conectar

**Patrón de las 21 sesiones de coaching:**

| Propósito | Stories | Por qué |
|-----------|---------|---------|
| CTA (lead magnet/volumen) | 4-6 | Si son 10, al CTA final llega muy poca gente |
| Valores/personalidad | 7-10 | Necesitás arco emocional completo |
| Historia de vida | 10-15 | Dividir en Parte 1 y 2 en el conflicto |
| CTA directo (venta) | 7-10 | Más desarrollo, pero solo 1 cada 2 semanas |
| Objeción | 7-10 | Caso real completo |

---

## Paso 6: Escribir el GUIÓN DE 5 COLUMNAS

### El formato de salida:
```
| # | Texto en pantalla | Texto hablado | Otros | Cómo (formato visual) |
```

### Reglas de escritura:

**La regla #1 del curso (y la corrección más repetida en 21 sesiones de coaching):**

> MENOS TEXTO = MÁS VIEWS. 70% de la story es imagen, 30% texto. La gente entra a Instagram "con media neurona". Cada vez que un cliente puso mucho texto, las views bajaron visiblemente.

**Columna "Texto en pantalla":**
- Máximo 2-3 líneas cortas (no párrafos)
- Frases de impacto, no explicaciones
- Voseo argentino siempre
- Si hay keyword CTA → MAYÚSCULAS y color diferente
- Un mini texto que resuma lo que se dice en video > subtítulos completos (Nafé dejó de usar subtítulos porque saturaban)
- Emojis solo funcionales: dan contexto visual instantáneo (la gente "escanea")
- **Anti-ficción:** si un texto puede existir en CUALQUIER story de CUALQUIER cuenta → es genérico → reescribir con detalle específico de Jesús/ADP
- **Números no-redondos:** $35.000 (no $30.000), 9 días (no "una semana"), 53 audios (no "muchos")

**Columna "Texto hablado":**
- Solo si es video con voz
- Conversacional, como si Jesús hablara con un amigo
- NO "marketer speak" → si suena a curso de marketing, reescribir
- 15-20 segundos máximo por story hablada
- SIEMPRE anotar "subtítulos" en la columna "Otros"
- **Anti-ChatGPT:** ChatGPT genera frases bonitas pero incomprensibles. Si una frase "suena bien" pero no la diría un amigo en un bar → cortarla

**Columna "Otros":**
- Encuesta (con las 2 opciones, ambas positivas)
- Botón de reacción
- Caja de preguntas
- Música (nombre/estilo)
- Subtítulos
- Stickers (flechas, LetoFonts)
- Keyword (cuál)
- **Trigger mental activado** (de los 18) — documentar cuál

**Columna "Cómo":**
- Formato visual (V1-V7, F1-F9, C1-C3, A1-A3, E1-E3)
- Descripción de la imagen/video ("selfie en la cama, relajado, luz natural")
- Ángulo de cámara si es video
- Notas de edición si aplican

### Transiciones invisibles entre stories
El espectador fluye de una a la otra como si fuera una sola conversación:
- Story de DOLOR → Story de PIVOTE: línea de quiebre de 1 sola frase ("Eso fue un martes.")
- Story de PIVOTE → Story de PRUEBA: continuación natural
- Story de PRUEBA → Story de PUENTE: cambio de persona (de "ella" a "vos")
- Story de PUENTE → Story de CTA: separada, el CTA es su propio mundo
- NUNCA usar "Pero eso no es todo..." ni transiciones genéricas

### Reglas de CTA en stories (del curso + sesiones de coaching):

**CTA Lead Magnet:**
- El lead magnet tiene que ser FÁCIL DE CONSUMIR Y APLICAR. NO una clase de 1 hora. SÍ: "copiá y pegá estos 5 prompts"
- SIEMPRE mostrar el documento POR DENTRO (no solo la tapa) → más gente responde
- Si se puede imprimir y mostrar la foto sujetándolo → tangibiliza aún más
- Esperar 30-60 min entre story 1 y el resto

**CTA Volumen:**
- Juegos de entretenimiento puro: "Sacá captura justo cuando aparece el número", "Adiviná qué iPhone es"
- Un cliente generó 19 agendas con solo 2 stories usando CTA volumen
- Funciona porque la gente entra a Instagram para ENTRETENERSE

**CTA Directo:**
- Estructura: hook disruptivo → setup → posicionamiento → "sueño húmedo" del avatar (todo lo que incluye el servicio) → resultados → CTA
- Máximo 1 cada 2 semanas. Vender de más = quemás la audiencia

**Regla del setter (NUNCA saltear):**
- NUNCA enviar el recurso directo sin antes cualificar
- El recurso gratuito es una EXCUSA para iniciar conversación
- Si le mandás el PDF directo, te clavan el visto

### Técnica: Efecto Arrepentimiento post-CTA (del curso, probada en lanzamientos)

**Después de cerrar un CTA directo o período de venta**, generar arrepentimiento para que la próxima vez conviertan más rápido:

**Secuencia post-cierre (2-4 stories):**
1. Capturas de DMs de gente preguntando si puede entrar después del cierre
2. Video de Jesús: "Podría abrir más plazas y meter más gente para ganar más plata, pero no lo voy a hacer porque cumplo mi palabra"
3. (Opcional) Captura de alguien con mensaje emocional ("vendí mi PlayStation para comprar tu curso")
4. (Opcional) Texto reflexivo: "Si te interesa, estate atento la próxima vez"

**Por qué funciona:** La gente que no compró siente arrepentimiento. En el próximo CTA directo, actúan más rápido porque no quieren perdérselo de nuevo.

**Si no hay DMs reales pidiendo entrar:** Crear comentarios desde cuenta secundaria (técnica de Nafé — poner en "Mejores amigos" sin nadie, responder desde otra cuenta, hacer captura). Esperar 10-15 min antes de subir para que parezca orgánico.

**Frecuencia:** Solo después de CTA directos (1 cada 2 semanas máximo), NO después de lead magnets.

### Evidencia siempre (regla de las sesiones de coaching):
> "Siempre que hables de algo, SIEMPRE mostrar evidencia. Capturas de pago, capturas de ventas. La gente en Instagram no se cree nada."

- Si decís "genero miles de conversaciones" → mostrar capturas de mensajes
- Si decís "mis alumnos facturan X" → capturas de pagos
- Si decís que un lead magnet es bueno → mostrarlo por dentro

---

## Paso 7: Validar REGLAS DURAS

### Checklist obligatorio (TODOS los tipos):

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
- [ ] **Anti-ficción en texto en pantalla:** si puede existir en CUALQUIER story → reescribir
- [ ] **Números no-redondos** en cualquier dato
- [ ] **Idea creativa definida ANTES de armar estructura** (R43) — documentar en presentación
- [ ] **Triggers elegidos intencionalmente por slide** (R44) — documentar en columna "Otros"
- [ ] **Frases del avatar son TEXTUALES** (R46) — de `stories-data-audiencia.md`, no inventadas
- [ ] **Montaña rusa emocional:** al menos 3 cambios de emoción en la secuencia
- [ ] **Efecto rebaño:** si hay CTA, incluir capturas de DMs/comentarios entre los 2 CTAs
- [ ] **Anti-repetición hook:** story 1 no usa ninguno de los 6 esqueletos prohibidos (SH1-SH6)
- [ ] **Anti-repetición hook:** hook es distinto a las últimas 10 secuencias (revisar `.data/stories/`)

### Checklist de persuasión invisible (TODOS los tipos excepto CTA Volumen):

- [ ] **Al menos 2 objeciones DISUELTAS** en la secuencia (no nombradas, no como bloque)
- [ ] **Tensión emocional MOSTRADA en escena**, no dicha en texto
- [ ] **Vocabulario del segmento** en texto en pantalla Y texto hablado
- [ ] **Mínimo 3 micro-yes visuales** distribuidos en la secuencia
- [ ] **CTA llega DESPUÉS de que el viewer ya quiere saber más** (señales de compra activadas)
- [ ] **Al menos 1 dato de inteligencia de compradores** usado naturalmente
- [ ] **Test final:** ¿la secuencia se siente como historia o como venta? Si venta → reescribir

### Checklist adicional para tipo 8 (Actuada):
- [ ] Ejemplo tangible y universal, no abstracto — cocina, terapia, fitness, costura, NUNCA agencia ni dropshipping (R31)
- [ ] Se muestra resultado del CLIENTE FINAL, no solo plata del protagonista (R32)
- [ ] Números realistas para LATAM — $400, no €10.000. Mediana ingreso compradores = $850/mes (R33)
- [ ] Calculadora visible en pantalla (R34)
- [ ] Personajes ACTÚAN en su escena, no son fotos con texto (R35)
- [ ] Tono accesible, ropa simple, locaciones normales, sin lujo (R36)
- [ ] Máximo 3 personajes, 2 es ideal (R37)

### Checklist adicional para tipo 9 (Explicativa) y 10 (BTS):
- [ ] Pizarra dibujada a MANO, no Canva, no PowerPoint (R38)
- [ ] 3 enemigos con nombres específicos, no genéricos (R39)
- [ ] Variedad visual por slide — cada slide = escenario distinto (R42)
- [ ] BTS se siente crudo/real, no producido, sin filtros ni música épica (R41)

---

## Paso 8: Check de NATURALIDAD

> "La gente ya sabe que alguien maneja las historias de los influencers para venderles más. Huelen la venta." — Nafé

Stories tienen un estándar de naturalidad AÚN MÁS ALTO que ads. Es la regla más importante de todo el curso.

### 8a. Preguntas de control:
1. **N1:** ¿Suena como Jesús hablando con un amigo o como un curso de marketing?
2. **N2:** ¿Esta secuencia se sentiría forzada entre stories de lifestyle?
3. **N3:** ¿El CTA (si hay) es orgánico o se nota que es un ad metido en stories?
4. **N4:** ¿Hay demasiadas stories "enseñando" vs "mostrando"?
5. **N5:** ¿Las frases son cosas que Jesús diría o frases de ChatGPT?

### 8b. Señales de alerta (reescribir si se encuentra alguna):
- Frases largas con subordinadas → acortar
- Palabras como "impactante", "revolucionario", "increíble" → sacar
- Más de 3 stories seguidas de texto hablado → intercalar con fotos
- CTA con urgencia artificial → suavizar
- Texto que "suena bien" pero que nadie diría en una conversación → simplificar
- Frases de ChatGPT que son bonitas pero incomprensibles → cortar

### 8c. Reglas adicionales por tipo:

**Para tipo 8 (Actuada):**
- **N6:** ¿Los personajes se sienten reales o parecen actores de publicidad?
- **N7:** ¿El ejemplo es tangible (cocina, terapia) o abstracto (agencia, dropshipping)?
- **N8:** ¿Los números son realistas para LATAM ($400) o inflados (€10.000)?
- **N9:** ¿Se muestra resultado del CLIENTE FINAL o solo la plata del protagonista?
- **N10:** ¿Fluye como mini-historia o como PowerPoint?

**Para tipo 9 (Explicativa):**
- **N11:** ¿La pizarra hace tangible lo intangible o es solo texto dibujado?
- **N12:** ¿Los "3 enemigos" son reales para el avatar o genéricos?
- **N13:** ¿El CTA es natural ("te mando un PDF") o forzado ("comprá ahora")?

### 8d. Diferencias TEORÍA vs PRÁCTICA (de 21 sesiones de coaching real)

Estas diferencias surgieron de ver qué REALMENTE funciona vs lo que la teoría dice:

| Lo que dice la teoría | Lo que funciona en la práctica |
|----------------------|------------------------------|
| Subtítulos siempre en videos | Un mini texto claro es mejor que subtítulos que saturan |
| Secuencias largas = más valor | Secuencias CORTAS para CTAs — la gente no llega al final |
| Ganchos probados garantizan resultados | "No porque sigas una fórmula se te va a servir. A veces es suerte" |
| Crear todo original cada semana | Si algo funciona, REPETIRLO con variaciones |
| Capturas de WhatsApp = prueba social | "Un mensaje se lo puede inventar cualquiera. Video > audio > texto" |
| La imagen tiene que ser perfecta | "Da igual un poco la foto. Lo importante es el mensaje" |
| Más producción = más profesional | A veces la mejor story es la más simple (caso Agus Nievas: una sola story con una app de países visitados) |

### 8e. Principios transversales del curso StoryMakers:
- **Idea creativa ANTES de estructura** (R43): ¿se pensó 5-10 min cómo comunicar emocionalmente?
- **18 triggers intencionales** (R44): ¿cada slide tiene trigger documentado en la Tabla 3?
- **Naturalidad > todo** (R45): si suena a curso → reescribir
- **Avatar al lado** (R46): frases TEXTUALES de `stories-data-audiencia.md`
- **Variedad visual por slide** (Agus Nievas): cada slide = escenario distinto
- **Video ya comunica** (R47): el texto overlay es mínimo o nulo en muchas slides

### 8f. Check anti-IA (adaptado de `/humanizer`)

Revisar TODO el texto generado (en pantalla + hablado) contra estos patrones. **3+ problemas detectados = REESCRIBIR antes de presentar. 1-2 = presentar con ⚠️.**

**10 patrones anti-IA a escanear en stories:**

| # | Patrón | Qué buscar | Corrección |
|---|--------|-----------|------------|
| S-IA1 | Regla de tres | "No necesitás X. No necesitás Y. No necesitás Z." | Romper la simetría, dejar 2 o cambiar ritmo |
| S-IA2 | Frases bonitas vacías | Texto que "suena bien" pero no dice nada concreto | Reemplazar con detalle específico anti-ficción |
| S-IA3 | Vocabulario elevado | "impactante", "revolucionario", "transformador", "increíble" | Usar palabras de Jesús: "loco", "una locura", "mirá esto" |
| S-IA4 | Paralelismo perfecto | Estructuras simétricas en stories consecutivas | Romper la estructura, variar largo de frases |
| S-IA5 | Cierre motivacional | "Tu momento es ahora", "El cambio empieza hoy" | Cerrar con dato concreto o pregunta real |
| S-IA6 | Transiciones genéricas | "Pero eso no es todo", "Y hay más" | Transiciones invisibles (ver Paso 6) o corte directo |
| S-IA7 | Preguntas predecibles | "¿Te gustaría saber cómo?", "¿Y si te dijera que...?" | Reemplazar con afirmación disruptiva |
| S-IA8 | Datos internos filtrados | Porcentajes de sistema, "562 compradores", "22,819 conversaciones" | NUNCA exponer data interna en copy |
| S-IA9 | Jerga de marketing | "funnel", "leads", "engagement", "conversión", "monetizar" | Usar lenguaje del avatar: "clientes", "gente que compra", "seguidores" |
| S-IA10 | Exceso de texto | Más de 3 líneas de texto en pantalla en una sola story | Cortar a 1-2 líneas de impacto |

**6 checks de voz de Jesús (V1-V6):**
- **V1:** ¿Hay al menos 1 pregunta filosa o provocativa? (no retórica vacía)
- **V2:** ¿El ritmo alterna frases cortas con una más larga? (no todo igual)
- **V3:** ¿Aparece al menos 1 muletilla de Jesús? ("mirá", "fijate", "la realidad es que", "posta")
- **V4:** ¿Cada story hablada cierra con acción o dato, nunca con frase motivacional?
- **V5:** ¿Se lee como monólogo hablado, no como texto escrito?
- **V6:** ¿El tono es "amigo que te dice la posta" y no "profesor que te explica"?

**Incluir al final de la presentación:**
```
## Check anti-IA stories
- S-IA detectados (1-10): [lista o "ninguno"]
- Checks de voz: V1 ✅/❌ | V2 ✅/❌ | V3 ✅/❌ | V4 ✅/❌ | V5 ✅/❌ | V6 ✅/❌
- Ajustes hechos: [lista o "ninguno"]
```

---

## Paso 9: Presentar al usuario

### Formato de presentación:

```markdown
## Secuencia: [Tipo] — [Big Idea en 1 frase]

**Avatar:** [Nombre, edad] | **Tensión:** [T#] | **Triggers:** [nombres]
**Capa:** [personalidad/nicho/producto/venta] | **Día sugerido:** [día]
**Idea creativa:** [la metáfora/juego/historia que baja la idea a tierra]
**Ideas del Constructor:** [nombre de la(s) idea(s)]

### Brief de persuasión invisible
- **Objeciones a disolver:** [O1 en story X via ESCENA, O2 en story Y via DATO]
- **Micro-yes planificados:** [story 2: "eso me pasa", story 5: "funciona", story 7: "es para mí"]
- **Señales de compra:** [revelación en story 3, prueba en story 5, permiso en story 7]

### Secuencia (N stories)

| # | Texto en pantalla | Texto hablado | Otros | Cómo |
|---|---|---|---|---|
| 0* | [humor pre-secuencia, si aplica] | ... | Subir 30 min antes | ... |
| 1 | ... | ... | Trigger: [nombre] | ... |
| ... | ... | ... | ... | ... |

*Story 0 solo si la secuencia tiene CTA y se usa la técnica humor-primero

### Instrucciones para setter
[Si es CTA — qué dice el setter cuando responden, cómo cualifica, cuándo envía el recurso]

### Banco de contenido necesario
- [ ] Foto selfie en [contexto]
- [ ] Video de [qué] (15-20s)
- [ ] Captura de [qué]
- [ ] [Otros recursos necesarios]

### Notas de grabación
[Tips para Jesús al grabar: tono, energía, dónde hacerlo, qué ropa, qué NO hacer]
[Regla: si graba todos los guiones de la semana en UN solo día, anotar variaciones de ropa/locación]

### Arco emocional
[Curiosidad → Nostalgia → Tristeza → Esperanza → Conexión]

### Check anti-IA stories
- S-IA detectados (1-10): [lista o "ninguno"]
- Checks de voz: V1 ✅/❌ | V2 ✅/❌ | V3 ✅/❌ | V4 ✅/❌ | V5 ✅/❌ | V6 ✅/❌
- Ajustes hechos: [lista o "ninguno"]
```

---

## Paso 10: Validar y Guardar

### 10a. Correr validación automática
```bash
echo '<JSON de la secuencia>' | node scripts/stories-validate.mjs
```

**Si hay errores → corregir y re-validar. Si hay warnings → presentar al usuario.**

El script valida automáticamente:
- Campos obligatorios (tipo, avatar, big idea, idea creativa, tensión, arco emocional)
- Cantidad de stories por tipo (R2)
- Story 1 = selfie (R1)
- No 2 videos iguales seguidos (R3)
- Interacciones presentes (R7)
- Montaña rusa emocional (mínimo 3 emociones distintas)
- Triggers asignados y distribuidos
- Objeciones disueltas (mínimo 2, excepto CTA Volumen)
- Micro-yes visuales (mínimo 3)
- Hooks prohibidos (SH1-SH6)
- Patrones anti-IA (S-IA3 vocabulario elevado, S-IA8 data interna, S-IA9 jerga marketing, S-IA10 exceso texto)
- Voseo argentino (no tú/tienes/puedes)
- Repetición contra últimas 10 secuencias

### 10b. Guardar en `.data/stories/` como JSON

```json
{
  "id": "uuid",
  "type": "story_sequence",
  "sequence_type": "personalidad|cta_lead_magnet|cta_volumen|cta_directo|objecion|nicho_vida_sonada|expertise|actuada_triangulo|explicativa_servicio|behind_the_scenes",
  "avatar": "nombre_del_avatar",
  "big_idea": "...",
  "creative_idea": "la metáfora/juego/historia que baja la idea a tierra",
  "calentamiento_layer": "personalidad|nicho|producto|venta",
  "trigger_names": ["Vida soñada", "Facilidad"],
  "constructor_ideas": ["Mostrar cómo disfrutás del nicho"],
  "tension_id": "T3",
  "angle_family": "oportunidad",
  "emotional_arc": "curiosidad→nostalgia→tristeza→esperanza→conexión",
  "objections_dissolved": [
    { "objection": "No tengo seguidores", "story_number": 4, "technique": "Mencionar número bajo naturalmente" }
  ],
  "micro_yes_chain": [
    { "story_number": 2, "thought": "Eso me pasa", "type": "identificacion" }
  ],
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
      "emotion": "curiosidad",
      "trigger": "Intriga",
      "notes": null
    }
  ],
  "cta": {
    "type": "inbound|outbound|none",
    "keyword": "CLASE",
    "lead_magnet_id": "LM-5",
    "setter_script": "...",
    "humor_first": true,
    "humor_story": "Story 0: [descripción]"
  },
  "content_bank_needed": ["selfie cama", "captura ventas"],
  "planned_day": "martes",
  "week": "2026-W13",
  "status": "borrador",
  "createdAt": "2026-03-27T...",
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

### 1. Revisar qué se publicó las últimas 2 semanas
Leer `.data/stories/` → filtrar por semanas anteriores → anotar tipos, avatares, lead magnets, ángulos usados

### 2. Armar 4 secuencias siguiendo la cadencia

| Día | Tipo | Avatar | Lead Magnet | Notas |
|-----|------|--------|-------------|-------|
| Martes | CTA Lead Magnet #1 | [rotar] | [rotar] | El día más activo para CTAs |
| Jueves | CTA LM #2 (otro ángulo) O Nicho/Vida Soñada O BTS | [rotar] | [otro] | Alternar ángulos |
| Sábado | Personalidad O Objeción O Actuada/Triángulo | [rotar] | — | Contenido emocional para el finde |
| Domingo | Expertise O CTA Volumen | [rotar] | — | Contenido que se queda destacado o engagement masivo |

**Rotación quincenal:**
- Tipo 8 (Actuada) y Tipo 10 (BTS) entran 1 cada 2 semanas
- Tipo 9 (Explicativa de Servicio) se hace UNA vez y va a Highlights — no entra en cadencia semanal

### 3. Reglas del plan (de 21 sesiones de coaching):
- Nunca más de 3 secuencias seguidas sin descanso
- 2 CTAs lead magnet por semana, cada uno con ángulo distinto
- 1 secuencia de valores/personalidad por semana
- Viernes SIEMPRE descanso
- Después de vender mucho, bajar intensidad la semana siguiente
- Descanso ANTES de CTA importante (acumula views)
- Nunca CTA dos días seguidos
- **Si algo funcionó, repetirlo con variaciones** (no reinventar la rueda)

### 4. Mix de contenido semanal:
- **50-60%** entretenimiento/lifestyle/personalidad
- **30-40%** contenido útil/nicho
- **10-20%** venta/CTAs

### 5. Para cada secuencia, seguir Pasos 3-10

### 6. Presentar el plan completo con las 4 secuencias

---

## MODO: Highlights (Estrategia Evergreen)

Destacados que se mantienen actualizados:

| Destacado | Contenido | Función |
|-----------|-----------|---------|
| **Mi historia** | Secuencia historia de vida (Hauge 6 etapas) | Confianza, identificación |
| **¿CÓMO FUNCIONA?** | Secuencia explicativa tipo 9 | Nuevos seguidores entienden el modelo |
| **Testimonios** | 3-5 testimonios con antes/después + datos | Prueba social permanente |
| **FAQ / Preguntas** | Objeciones respondidas + link agenda | Venta evergreen automática |
| **Resultados** | Capturas de ventas, métricas, logros | Autoridad |

Testimonios y FAQ se quedan SIEMPRE. Se actualizan cuando hay nuevos. El link de agenda en FAQ genera agendas en automático.

### Formato de testimonio obligatorio (de sesiones de coaching):
Cada testimonio DEBE tener:
1. **Nombre** (real)
2. **Edad**
3. **De dónde es** (ciudad/país)
4. **Situación anterior** (el dolor, punto A)
5. **Logros** (punto B, con números)
6. **Foto y/o video** (video >> audio >> texto en credibilidad)

> "Las personas de 29 años conectan con él. Las de Chile también. Las del nicho fitness también." — Cada dato es un punto de identificación.

---

## CROSS-REFERENCE: Cómo Stories usa los sistemas de Ads

| Sistema de Ads | Cómo se usa en Stories |
|----------------|----------------------|
| Motor de Audiencia (tensiones T1-T13) | Elegir arco emocional de la secuencia |
| Motor de Audiencia (vocabulario) | Texto en pantalla + texto hablado |
| Motor de Audiencia (objeciones) | Secuencias tipo "Objeción" + disolución invisible |
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

---

## 21 TÁCTICAS PARA DISEÑAR STORIES QUE SUBAN VIEWS

Usar como referencia al diseñar secuencias. No hace falta incluir todas, pero elegir 3-5 por secuencia:

1. Temas resonantes/controversiales (plata, relaciones, eventos actuales)
2. Intriga (que vuelvan cada hora)
3. Mostrar problemas y fracasos (humanizar)
4. Algo impactante (mudarse, comprarse algo)
5. Objetivo global visible (proceso largo)
6. Una historia impactante sola (construir al clímax)
7. Conversación sincera (estado emocional real)
8. Cambio de look (nuevo corte, before/after → swipe-backs)
9. Cambio de locación (viajar genera "¿qué hace ahí?")
10. Swipe-backs con juegos (Instagram lo premia)
11. Desaparecer a veces (crear "efecto wow" al volver)
12. Análisis de hate (genera debate)
13. Hype/anticipación (teasear > soltar sorpresa)
14. Test de datos curiosos ("3 cosas que no sabías de mí")
15. Flood de DMs + efecto rebaño (mostrar muchos DMs genera más)
16. Acción inusual
17. Humor (sin pasarse)
18. Contenido visualmente raro (videos IA, Gemini)
19. Final interesante (frase reflexiva)
20. Estética bella (fotos visualmente agradables)
21. Interacción con otros ("necesitás más de un personaje en la película")

### Lo que BAJA views (evitar siempre):
- Mucho video cara-a-cámara del mismo ángulo sin texto
- Demasiado texto
- Contenido complejo/intelectual
- Mismo ángulo de cámara siempre
- Narrar con voz en off en vez de mostrar
- Stories sin valor
- Falta de emociones
- Contenido repetitivo
- Venta directa constante
- Exceso de reposts

---

## LOS 18 TRIGGERS MENTALES (elegir 1-3 por slide)

> "Si tengo que elegir una clase de todo el curso, sería esta." — Nafé

1. **Prueba social** — testimonios, DMs, tamaño del grupo
2. **Coherencia** — hacer que participen → actúan coherente al comprar
3. **Escasez** — plazas limitadas, "no acepto a todos"
4. **Simpatía** — valores, humor, problemas, regalos
5. **Autoridad** — premios, logos, "trabajé con X"
6. **Reciprocidad** — dar valor gratis → después piden comprar
7. **Realismo** — no mostrar todo perfecto, "es un 8 de 9, no 10 de 10"
8. **Facilidad** — simple, rápido, cualquiera puede
9. **Claridad** — explicar como para un nene de 5 años
10. **Relevancia** — avatar específico con nombre, edad, situación
11. **Vida soñada** — viajes, sin jefe, ayudando a familia
12. **Experiencia** — analizar otros, Q&A, proceso de trabajo
13. **Garantía** — anti-garantía (por qué NO das garantía) > garantía clásica
14. **Transformación personal** — cambio como persona, no solo de cuenta
15. **Acontecimientos** — anunciar eventos de forma épica
16. **Participación** — que voten diseños, features
17. **Comunidad** — grupo, reuniones, pertenencia
18. **Enemigo común** — criticar algo públicamente

---

## BANCO DE CONTENIDO NECESARIO (pedir a Jesús)

| Categoría | Ejemplos | Para qué |
|-----------|----------|---------|
| Fotos selfie | Variedad de expresiones, locaciones, ropa | Primera story SIEMPRE |
| Fotos en tercera persona | Trabajando, caminando, pensando | Contextualizar |
| Fotos familia/Meli | Momentos reales, no posados | Secuencias de personalidad |
| Fotos lifestyle | Viajes, restaurantes, auto, casa | Vender el nicho |
| Videos hablando (selfie) | 15-30 segundos | Desarrollo de ideas |
| Videos en tercera persona | Trabajando, reuniones | Contexto profesional |
| Capturas pantalla | Ventas, plataformas, testimonios, DMs | Prueba social |
| Fotos antiguas | Infancia, Sarandí, antes del éxito | Historia de vida |
| Fotos profesionales | Premios Hotmart, Russell Brunson | Autoridad |

> "Las fotos las saco de capturas de video porque no tengo fotos en tercera persona." — esto baja la calidad. Tener fotos REALES en una carpeta de Drive organizada.
