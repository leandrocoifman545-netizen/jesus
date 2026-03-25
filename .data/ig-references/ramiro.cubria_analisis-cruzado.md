# Análisis Cruzado: @ramiro.cubria × Sistema ADP

> **Propósito:** Extraer patrones operativos de 191 transcripciones de Ramiro que muten directamente los archivos del sistema ADP (winner-patterns, hooks, ingredientes, vehículos, patrones prohibidos).
> **Fecha:** 2026-03-25

---

## 1. LO QUE RAMIRO HACE QUE NOSOTROS NO HACEMOS (Y DEBERÍAMOS)

### 1.1 Apilamiento de value props con micro-resultado individual

**El patrón:** Los 10 videos con más CLR de Ramiro apilan entre 3 y 7 propuestas de valor ANTES del CTA. Cada prop tiene su propio resultado en 1 oración. No es una idea expandida durante 70 segundos — son 3-7 ideas de 10 segundos cada una.

**Ejemplo textual (CLR 3.45, su #1):**
- Prop 1: "Con esta bestia de dos páginas vas a optimizar tu perfil de Instagram para atraer seguidores y clientes calificados"
- [Credencial intercalada: "Hago 10.000 dólares por día con esta cuenta"]
- Prop 2: "Con este mega prompt vas a poder armar tu propio calendario de historias"
- [Credencial intercalada: "El 80% de mis ventas vienen de historias. De 300 mil dólares por mes"]
- Prop 3: "Con este prompt vas a armar una estrategia de contenido de nicho"
- CTA

**Por qué importa para ADP:** Nuestros micro-VSL de 5 beats tienen UNA cadena de creencias lineal. El beat 3 (mecanismo) explica UNA cosa. Ramiro demuestra que comprimir 3-4 mini-mecanismos en ráfaga, cada uno con resultado propio de 1 oración, genera más urgencia de acción.

**Implementación concreta en nuestro sistema:**

Para **orgánico** (no ads), probar una variante del vehículo #3 (Demo/Proceso) donde el beat de mecanismo se fragmenta en 3-4 sub-props:

```
LEAD (5s) → Beat 1: Identificación (10s) → Beat 2: Quiebre corto (8s) → Beat 3: RÁFAGA DE 3 PROPS (30s, ~10s c/u) → CTA con keyword (10s)
```

Total: ~63s. Encaja en el sweet spot de CLR de Ramiro (55-65s).

**No aplica para ads** donde la estructura micro-VSL de 5 beats completa con CTA de 6 capas es la que convierte. Esto es ORGÁNICO puro.

---

### 1.2 Credencial TEJIDA vs credencial BLOQUEADA

**El patrón:** En los top 10 CLR de Ramiro, la credencial NUNCA es un bloque separado. Aparece como 1 oración entre dos value props. En sus bottom 30 CLR, la credencial es un bloque de 15-30 segundos que se siente como alardeo.

**Top CLR — credencial tejida:**
> "¿Y quién soy yo para decirte que este prompt funciona? Hago 10.000 dólares por día con esta cuenta de Instagram. Así que, de nuevo, más te vale que me escuches." (CLR 3.45)

Es una pregunta retórica + dato + mandato. 3 oraciones. Después sigue con la próxima prop. No hay pausa para lifestyle.

**Bottom CLR — credencial bloqueada:**
> "250 mil dólares hice con este Instagram en los últimos 15 días. [20 segundos explicando el embudo y cómo funciona]" (CLR 0.05)

**Mapeo a nuestro sistema:** En `winner-patterns.md` ya tenemos: "Tono consejero (5/5)" y "Números concretos y creíbles (4/5)". Pero NO tenemos una regla sobre POSICIÓN de la credencial. Jesús dice "yo facturo más de 100 mil dólares" — pero ¿dónde lo dice? Si es un bloque al principio, funciona como barrera. Si es una oración entre dos beats, funciona como aceite.

**Regla nueva para el sistema:**
> La credencial de Jesús NUNCA debe ser un beat propio. Debe ser 1 oración intercalada entre el beat 2 (quiebre) y el beat 3 (mecanismo), o entre el beat 3 (mecanismo) y el beat 4 (demolición). Formato: pregunta retórica + dato + continuar.
> Ejemplo: "¿Y cómo sé que funciona? Yo facturo más de 100 mil dólares al año con productos digitales. Entonces, lo que hacés es..."

---

### 1.3 El recurso NOMBRABLE como motor de CTA

**El patrón:** En el 100% de los top 30 CLR de Ramiro, el CTA ofrece un OBJETO tangible: "PDF de 20 páginas", "mega prompt de 2 páginas", "repositorio de 15.286 agentes", "plantilla de Notion". En los bottom, ofrece conceptos difusos: "te explico", "te cuento mi sistema", "tomá nota".

**Mapeo a ADP:** Nuestros CTAs de orgánico son de 3 canales: Clase Gratuita (TOFU), Taller $5 (MOFU), Instagram Orgánico. Los 3 son conceptos, no objetos. "Mirá la clase" no es lo mismo que "te mando el PDF de 12 páginas con los 5 nichos más rentables".

**Implementación:** Crear 3-5 lead magnets NOMBRABLE para orgánico:
1. **"El checklist de 1 página"** — checklist de cómo elegir tu nicho digital (PDF)
2. **"Las 10 preguntas"** — 10 preguntas para saber si tu conocimiento se puede vender (PDF)
3. **"La plantilla de producto"** — template para armar tu primer producto digital (Notion/PDF)
4. **"Los 5 nichos"** — documento con los 5 nichos más rentables del mes (PDF)
5. **"El prompt"** — mega prompt de ChatGPT para descubrir tu producto digital (texto)

Cada uno se conecta a ManyChat con una keyword contextual. El Reel se diseña alrededor del lead magnet — el video es un TRAILER del recurso, no un sustituto.

---

### 1.4 Promesas de velocidad/facilidad como acelerador de CTA

**El patrón (dato duro):** Los top 25% CLR de Ramiro tienen 2.4 promesas de velocidad por video vs 1.1 en los bottom 25%. La frase "en menos de un minuto por mensaje privado" aparece en 25 de sus 30 top CLR.

**Mapeo a nuestro sistema:** Nuestras transiciones (Capa 1 del CTA) son específicas al nicho, pero NO tienen promesa de velocidad. Dicen QUÉ van a recibir, no QUÉ TAN RÁPIDO.

**Ejemplo actual ADP (Transición Capa 1):**
> "Si tenés un conocimiento y querés convertirlo en un negocio digital..."

**Ejemplo post-Ramiro:**
> "Si querés el checklist, lo único que tenés que hacer es comentar NICHO y te llega en menos de un minuto."

La velocidad de entrega ("menos de un minuto") reduce la fricción percibida a cero. El CTA no es "hacé un cambio en tu vida" sino "escribí una palabra y recibí algo ya".

---

## 2. HOOKS DE RAMIRO MAPEADOS AL SISTEMA ADP

### 2.1 Hooks estructuralmente NUEVOS (no están en `patrones-prohibidos-leads.md` ni en nuestros tipos)

Crucé los 7 hooks más noveles de Ramiro contra nuestros 7 patrones prohibidos y los tipos de lead que ya usamos. Estos son GENUINAMENTE nuevos:

#### HOOK NUEVO A: "Ancla de precio invertida"
**Estructura:** `$[precio alto] te debería cobrar por [recurso]. Pero hoy [razón emocional], así que te lo doy gratis.`
**Ejemplo Ramiro:** "10.000 dólares te debería cobrar por estos tres prompts de ChatGPT. Pero hoy me agarraste de buen humor."
**CLR:** 3.45 (su #1 absoluto)

**Adaptación ADP:**
> "Si te dijera que este checklist de nichos rentables vale más que cualquier curso de $500 que compraste... ¿me creerías? Bueno, te lo voy a dar gratis."

**Mapeo:** No es P1-P7 (ningún patrón prohibido). Es un nuevo tipo de lead: `ancla_precio_invertida`. Funciona porque establece valor ANTES de revelar que es gratis. El orden precio→gratis es clave.

**Para qué sirve:** Orgánico con lead magnet. NO para ads de venta directa.

---

#### HOOK NUEVO B: "Incredulidad posesiva"
**Estructura:** `No entiendo cómo todavía no tenés [recurso/conocimiento].`
**Ejemplo Ramiro:** "No entiendo cómo todavía no tenés acceso a este documento."
**CLR:** 3.14

**Adaptación ADP:**
> "No entiendo cómo todavía no sabés cuánto vale lo que ya sabés."

**Mapeo:** Pariente de `provocacion` pero NO es agresivo contra el espectador. Es agresivo contra la SITUACIÓN. La presión social es "todos lo tienen menos vos" — no "sos un boludo".

---

#### HOOK NUEVO C: "Condición invertida de identidad"
**Estructura:** `No soy [referente aspiracional], pero [resultado comparable].`
**Ejemplo Ramiro:** "No soy Alex Hormozi, pero esta cuenta de Instagram hace 10 mil dólares por día."
**CLR:** 3.14 + 247K views

**Adaptación ADP:**
> "No soy un gurú de Silicon Valley, pero facturo más de 100 mil dólares al año vendiendo lo que sé."

**Mapeo:** Mezcla humildad + credencial. Se descalifica y RE-califica en la misma oración. Es anti-hype natural — coincide con nuestro patrón winner #1 ("Anti-hype obligatorio, 4/5 winners").

---

#### HOOK NUEVO D: "Ataque a la herramienta"
**Estructura:** `No vuelvas a [acción común] con [herramienta popular] porque [es horrible].`
**Ejemplo Ramiro:** "No vuelvas a escribir tus guiones con ChatGPT porque son una mierda."
**CLR:** 2.55 + 13K views

**Adaptación ADP (para orgánico):**
> "No busques más 'cómo ganar plata online' en Google. Todo lo que vas a encontrar es basura."
> "Dejá de mirar videos de gurús en YouTube. Te están vendiendo un mundo que no existe."

**Mapeo:** NO ataca al espectador (no activa defensa). NO ataca a una persona (no es drama). Ataca la HERRAMIENTA que el avatar usa → genera curiosidad por la alternativa. Es un tipo de `provocacion` más seguro.

---

#### HOOK NUEVO E: "Reframe de costo (enemigo-recurso)"
**Estructura:** `¿Para qué vas a gastar [plata/esfuerzo] en [X] si podés [aprovecharte de/usar] [Y]?`
**Ejemplo Ramiro:** "¿Para qué mierda vas a gastarte toda tu plata en anuncios si podés aprovecharte de la billetera gorda de tus competidores?"
**CLR:** 2.38

**Adaptación ADP:**
> "¿Para qué vas a invertir meses aprendiendo de cero si podés empaquetar algo que ya sabés y venderlo esta semana?"

**Mapeo:** Reframe conceptual. Convierte el obstáculo en recurso. Alineado con nuestra Familia 3 (Confrontación/Quiebre) y el vehículo #4 (Comparación de caminos).

---

#### HOOK NUEVO F: "Prueba viva imposible"
**Estructura:** `Lo que estás viendo ahora mismo [ES el producto/resultado].`
**Ejemplo Ramiro:** "Nadie me cree que mis videos son 100% hechos con inteligencia artificial, pero en este momento lo estás viendo."
**CLR:** 2.17

**Adaptación ADP (limitada):** Difícil de aplicar directamente a ADP porque Jesús no vende IA de clonación. Pero el PRINCIPIO (el contenido mismo demuestra la tesis) aplica:
> "Este video lo hice en 15 minutos con IA. Si yo puedo hacer un Reel en 15 minutos, vos podés armar un producto digital en un fin de semana."

---

### 2.2 Hooks de Ramiro que CAEN en nuestros patrones prohibidos

- **P2 aplica:** Muchos videos de Ramiro usan "persona + IA = resultado" (P2). Pero en su caso el CLR es alto porque hay DEMO (muestra la pantalla), no solo storytelling. La demo salva el patrón. Sin demo, P2 sigue prohibido para ADP.
- **P4 aplica parcialmente:** "Hago 10K/día con esta cuenta" es una versión de "sabés más que la mayoría" pero aplicado a sí mismo, no al espectador. No es flattery — es credencial. Permitido.

---

## 3. VEHÍCULOS NARRATIVOS: ¿QUÉ USA RAMIRO QUE NO TENEMOS?

### 3.1 Vehículo nuevo: "Trailer de recurso" (para orgánico)

Ramiro tiene un vehículo que NO está en nuestros 12. Lo llamo **"Trailer de recurso"**:

**Estructura:**
1. Hook con valor del recurso (ancla de precio o exclusividad)
2. 3-5 features/props del recurso en ráfaga (10s c/u), cada una con resultado de 1 oración
3. Credencial tejida (1 oración entre props)
4. CTA keyword contextual

**Diferencia con Demo/Proceso (#3):** El #3 ENSEÑA un proceso paso a paso. El Trailer de recurso NO enseña — MUESTRA el recurso sin entregarlo. El video genera HAMBRE, no satisfacción.

**Diferencia con Demolición de alternativas (#9):** El #9 compara y destruye opciones. El Trailer no compara — solo apila valor de UN recurso.

**Duración óptima:** 50-65s (más corto que nuestros micro-VSL de 75-90s).

**Sería nuestro vehículo #13 — solo para orgánico con lead magnet + ManyChat.**

---

### 3.2 Mapeo de los top 10 CLR de Ramiro a nuestros vehículos existentes

| # | CLR | Vehículo ADP equivalente | Beat dominante |
|---|-----|------------------------|----------------|
| 1 | 3.45 | **NUEVO: Trailer de recurso** | Ráfaga de props |
| 2 | 3.30 | Demo/Proceso (#3) variante "demo en vivo" | Mecanismo (demo) |
| 3 | 3.17 | Historia con giro (#2) + escasez | Prueba (exclusividad) |
| 4 | 3.14 | **NUEVO: Trailer de recurso** | Ráfaga de props |
| 5 | 3.14 | Demo/Proceso (#3) variante "tutorial rápido" | Mecanismo |
| 6 | 2.93 | **NUEVO: Trailer de recurso** | Ráfaga de features |
| 7 | 2.89 | Demo/Proceso (#3) | Mecanismo |
| 8 | 2.86 | Demo/Proceso (#3) variante "prueba viva" | Mecanismo + Prueba |
| 9 | 2.77 | **NUEVO: Trailer de recurso** | Ráfaga de props |
| 10 | 2.76 | **NUEVO: Trailer de recurso** | Ráfaga de props |

**Hallazgo:** 5 de los 10 top CLR usan el vehículo "Trailer de recurso" que NO tenemos catalogado. Los otros 5 son variantes de Demo/Proceso (#3) e Historia (#2).

---

## 4. TRANSICIONES A CTA: FÓRMULAS EXTRAÍDAS

### 4.1 Transiciones que funcionan (top CLR)

**Fórmula 1: Pregunta retórica de deseo asumido**
> "Y si querés los tres prompts, ¿qué tenés que hacer?" (CLR 3.45)

Asume que el deseo YA EXISTE. Solo falta la mecánica. No persuade — ejecuta.

**Fórmula 2: Condicional + "solamente"**
> "Si lo querés probar por tu cuenta, solamente comenta 100M" (CLR 3.30)

"Solamente" minimiza la acción. El "si querés" da control al espectador (reduce resistencia).

**Fórmula 3: Resumen de valor condensado + CTA**
> "Si querés todo el documento con los cuatro prompts, solamente comenta cuatro y te envío el documento entero en menos de un minuto" (CLR 3.14)

Reformula TODO el valor en 1 oración justo antes del CTA. Es un micro-cierre.

### 4.2 Transiciones que NO funcionan (bottom CLR)

**Anti-fórmula: "Pero bueno"**
> "Pero bueno, si querés este Loom en donde te muestro todo lo que aprendí..." (CLR 0.53)

"Pero bueno" = rendición narrativa. El creador se desconecta emocionalmente del CTA. El espectador siente que el CTA es un afterthought, no la culminación.

**Anti-fórmula: "De todos modos"**
> "De todos modos, si querés que te mande..." (CLR 0.50)

Misma energía de rendición. "De todos modos" = "ya terminé de decir lo importante, esto es un bonus."

**Regla nueva para ADP:** La transición al CTA NUNCA debe empezar con "pero bueno", "de todos modos", "en fin", "como sea". Estas frases señalan desconexión. La transición debe empezar con "Si querés" o reformular el valor.

---

## 5. INGREDIENTES: CRUCE CON ENCICLOPEDIA DE 128

### 5.1 Ingredientes que Ramiro usa y nosotros tenemos pero subutilizamos

| Ingrediente nuestro | Cómo lo usa Ramiro | Frecuencia Ramiro | Uso ADP actual |
|--------------------|--------------------|-------------------|----------------|
| **F#72 New Opportunity** | "Este sistema/prompt/repositorio que acaba de salir" | Altísima (~60% de top CLR) | Medio — lo usamos pero sin urgencia temporal |
| **D#54 Quiebre con dato** | "El 80% de mis ventas vienen de historias" | Alta (~40% top CLR) | Medio — pero como bloque, no tejido |
| **E#66 Autoridad prestada** | "Alex Hormozi", "Iman Gadzhi" — nombra referentes | Alta (~30% top CLR) | Bajo — Jesús rara vez nombra a referentes |
| **#71 Proceso de N Pasos** | "Paso 1: sacá captura. Paso 2: arrastrala a ChatGPT" | Alta en top CLR | Medio |

### 5.2 Ingredientes que Ramiro usa y nosotros NO tenemos catalogados

| Ingrediente nuevo | Definición | Ejemplo Ramiro | Categoría sugerida |
|------------------|-----------|----------------|-------------------|
| **Ancla de precio invertida** | Declarar precio alto del recurso ANTES de darlo gratis | "$10K te debería cobrar" / "vale $3K, te lo doy gratis" | F (Mecanismo) — nuevo #129 |
| **Promesa de velocidad de entrega** | Cuantificar la velocidad del siguiente paso | "en menos de un minuto", "en 5 segundos" | K (CTA) — nuevo #130 |
| **Filtrado por exclusividad temporal** | Limitar acceso con deadline | "este video lo borro en 24 horas" | C (Agitación) — nuevo #131 |
| **Credencial como pregunta retórica** | Formular la credencial como pregunta + respuesta | "¿Y quién soy yo para decirte que funciona? Hago 10K/día" | E (Autoridad) — nuevo #132 |
| **Analogía de empleados** | Comparar herramienta con tener N empleados | "es lo mismo que tener 1.500 empleados trabajando 24/7 gratis" | F (Mecanismo) — nuevo #133 |

---

## 6. TEMAS × CLR: QUÉ CONTENIDO GENERA MÁS ACCIÓN

| Tema Ramiro | CLR promedio | Equivalente ADP | Acción |
|-------------|-------------|-----------------|--------|
| Agentes IA | 2.54 | "Herramientas de IA para tu negocio" | Crear contenido orgánico mostrando herramientas de IA aplicadas a nichos de nuestros avatares |
| Mega Prompts | 2.02 | "Templates/Prompts para [avatar]" | Crear lead magnets de prompts específicos por nicho |
| Optimizar perfil | 1.86 | "Auditoría de tu negocio digital" | Reel de "auditá tu idea de negocio en 30 segundos" con prompt |
| Guiones | 1.60 | "Contenido que vende" | Reel mostrando cómo se arma contenido con IA |
| Clonación IA | 1.54 | — | No aplica directamente |
| ManyChat | 1.19 | ManyChat para ADP | Relevante para implementación interna, no contenido |
| Anti-lanzamientos | 1.01 | — | No aplica (Jesús no vende contra lanzamientos) |
| Caso de cliente | 0.88 | Resultados de alumnos | **Alerta:** los casos de cliente de Ramiro tienen CLR BAJO. No son lo que genera acción. |
| Anti-BCL Funnel | 0.88 | — | No aplica |

**Hallazgo clave:** Los videos de HERRAMIENTA/RECURSO generan 2.5× más CLR que los videos de CASO DE CLIENTE. La gente comenta para RECIBIR algo, no para validar al creador. Esto no significa que los casos no sirvan (sirven para credibilidad en retargeting), pero para orgánico con CTA de acción, la herramienta gana.

---

## 7. REGLAS NUEVAS DERIVADAS (para agregar al sistema)

### Para `reglas-diversidad.md`:
> **Regla orgánico #6:** Para Reels con CTA de keyword inbound, el video debe ser un TRAILER del recurso (mostrar sin entregar). Si el video entrega el contenido completo, no hay razón para comentar.

### Para `patrones-prohibidos-leads.md` (sección "Qué SÍ funciona"):
> - **Ancla precio invertida** ("$X te debería cobrar por esto. Pero hoy te lo doy gratis.") — establece valor antes de revelar gratuidad. CLR top de @ramiro.cubria. Ideal para orgánico con lead magnet.
> - **Incredulidad posesiva** ("No entiendo cómo todavía no tenés [recurso].") — presión social sin agresión. CLR 3.14 en Ramiro.
> - **Condición invertida de identidad** ("No soy [referente], pero [resultado comparable].") — anti-hype + credencial en una oración. Alineado con winner pattern #1.
> - **Ataque a la herramienta** ("No vuelvas a usar [herramienta popular] para [acción].") — genera curiosidad sin atacar a la persona.

### Para `winner-patterns.md`:
> **Patrón de @ramiro.cubria (191 videos, top 30 CLR):**
> 1. Apilamiento de 3-7 value props con resultado individual de 1 oración c/u (top CLR = 3+ props, bottom = 1 idea expandida)
> 2. Credencial tejida, NUNCA bloqueada (1 oración entre props, no bloque de 15s)
> 3. Recurso NOMBRABLE y tangible en el CTA (PDF, prompt, sistema — no "te explico")
> 4. Promesas de velocidad (2.4/video en top vs 1.1 en bottom — "en menos de un minuto")
> 5. Transición al CTA = reformulación del valor ("si querés los 3 prompts"), NUNCA rendición ("pero bueno, si te interesa")
> 6. Duración 55-65s para máximo CLR (20s más corto que sus videos promedio)
> 7. El video muestra pero NO entrega el recurso — genera hambre, no satisfacción

### Para `session-insights.md`:
> **Insight de @ramiro.cubria:** Los videos de HERRAMIENTA (prompt, template, repositorio) tienen 2.5× más CLR que los de CASO DE CLIENTE. Para orgánico con CTA de acción, el recurso tangible gana. Los testimonios funcionan mejor para retargeting.

### Para `tipos-cuerpo.md`:
> **Vehículo #13: Trailer de recurso (SOLO ORGÁNICO)** 🆕
> Tono: Entusiasta, demostrativo, generoso. "Mirá lo que te voy a dar."
> - NO sigue los 5 beats. Estructura propia: Hook (ancla precio o exclusividad) → 3-5 props del recurso en ráfaga (10s c/u con resultado individual) → Credencial tejida (1 oración) → CTA keyword.
> - Mejor para: Generar pipeline por DM con lead magnets específicos.
> - Duración óptima: 50-65s.
> - CTA: Keyword contextual → ManyChat → recurso por DM.
> - El video MUESTRA el recurso pero NO lo entrega. Genera hambre.
> - Validado: 5 de 10 top CLR de @ramiro.cubria (CLR promedio 2.9).
> - Límite: Máximo 2 de 10 en plan semanal (el resto debe ser micro-VSL para ads o formatos orgánicos variados).

---

## 8. ANTI-PATRONES DE RAMIRO (LO QUE NO COPIAR)

1. **Escasez falsa.** "Borro en 24 horas" y nunca borra. Jesús tiene credibilidad que perder. Si usa escasez, que sea REAL (oferta que realmente termina, cupos limitados reales).

2. **Claims de revenue inflados.** Ramiro escala de "$100K/mes" a "$300K/mes" a "$343K/mes" en videos sucesivos. No importa si es real — el patrón de escalamiento genera escepticismo. Jesús debe mantener su número estable y creíble ("más de 100 mil dólares al año").

3. **Mismo video publicado 2-3 veces.** Ramiro publica scripts casi idénticos en distintas fechas (ej: "Arreglá tu Instagram en 30 segundos" aparece 2 veces en el top 25 CLR). Para ads esto es testing normal, pero en orgánico de Jesús la audiencia se superpondría y lo notaría.

4. **Volumen > calidad.** 93 Reels en marzo = 3/día. Esto se sostiene con clonación IA + reciclaje de scripts. La calidad individual es baja — muchos videos son reformulaciones del mismo contenido. ADP debe priorizar calidad (1/día máximo).

5. **Contraste con BCL/lanzamientos.** Ramiro se posiciona CONTRA los funnels de ads. Jesús VENDE con funnels de ads. Copiar este ángulo sería contradictorio.

---

## 9. PLAN DE ACCIÓN CONCRETO

### Inmediato (esta semana):
1. ~~Crear 3 lead magnets PDF simples~~ → para probar con ManyChat en orgánico
2. Agregar vehículo #13 (Trailer de recurso) a `tipos-cuerpo.md`
3. Agregar 6 hooks nuevos a `patrones-prohibidos-leads.md` (sección "Qué SÍ funciona")
4. Agregar patrones de Ramiro a `winner-patterns.md`

### Para el próximo plan semanal:
5. Incluir 2-3 Reels orgánicos con estructura "Trailer de recurso" + keyword CTA
6. Probar hooks de ancla de precio invertida e incredulidad posesiva adaptados a tono Jesús
7. En los Reels orgánicos con CTA, usar caption de 11-20 palabras (solo instrucción de CTA)

### Para validar:
8. Medir CLR de los Reels con estructura Ramiro vs Reels actuales de Jesús
9. Si CLR > 1.0, escalar el formato. Si < 0.5, revisar adaptación.
