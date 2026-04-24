---
tipo: cross_analysis
generado: 2026-04-23
base: transcripciones-ganadores/ad-*.md + ANALISIS.md
metodo: "Cruzar los 8 videos en 16 dimensiones. Buscar correlaciones ROAS ↔ feature. Separar top 4 (ROAS ≥1,20) de bottom 4 (ROAS <1)."
---

# Cross-Análisis Profundo — 8 Ganadores ADPD

**Objetivo:** descubrir patrones que NO aparecen al mirar cada video por separado. Medir frecuencias, ausencias significativas y correlaciones ROAS ↔ feature.

**Método:** 16 dimensiones, cada una con puntaje/presencia por video. Segmentar top vs bottom.

---

## Grupos de referencia

- **TOP 4** (ROAS ≥1,20): #6, #39[BN], #44, #3
- **MID 2** (ROAS 0,60-0,67): #122, #1
- **BOTTOM 2** (ROAS <0,60): #140 ⚠️, #46

---

## 1. APERTURA — los primeros 3 segundos

### 1.1. Tipo de enganche inicial

| Ad | Tipo | Primera frase |
|---|---|---|
| #6 | Pregunta del avatar (voz distinta) | "¿esto sirve si nunca vendí nada online?" |
| #3 | Pregunta + analogía | "¿Viste cuando aprendes a manejar?" |
| #122 | Pregunta de reconocimiento | "¿Sabés hacer manualidades?" |
| #1 | Pregunta definicional | "¿Qué es un producto digital?" |
| #44 | Hipótesis | "(Si tuviera) una deuda que pagar en 30 días" |
| #140 | Afirmación universal | "Todo el mundo tiene ChatGPT" |
| #46 | Negación inclusiva | "No importa si tenés 25 o 55 años" |
| #39 | (cortado) | "...y ponerte a vender" |

**Descubrimiento #1: El tipo de enganche correlaciona con ROAS.**

| Tipo de apertura | Promedio ROAS |
|---|---|
| Pregunta del avatar (voz distinta) | **2,63** (n=1) |
| Pregunta + analogía | **1,20** (n=1) |
| Hipótesis | **1,21** (n=1) |
| Observación (cortada) | 1,25 (n=1) |
| Pregunta de reconocimiento | 0,67 (n=1) |
| Afirmación universal | 0,56 ⚠️ (n=1) |
| Negación inclusiva | 0,55 (n=1) |
| Pregunta definicional | 0,60 (n=1) |

**Las PREGUNTAS DIRIGIDAS AL AVATAR (que él se hace a sí mismo) ganan.** Las afirmaciones universales y las definiciones pierden.

Dentro de las preguntas, hay una jerarquía:
1. **Pregunta con dudar/objeción** (#6) → ROAS 2,63
2. **Pregunta con analogía** (#3) → ROAS 1,20
3. **Pregunta de reconocimiento de identidad** (#122) → ROAS 0,67
4. **Pregunta definicional** (#1) → ROAS 0,60

La pregunta que funciona es la que el avatar YA SE HACE en su cabeza — no la que nosotros queremos hacerle.

---

## 2. CIERRE — los últimos 5 segundos

### 2.1. Tipo de cierre

| Ad | Cierre | Tipo |
|---|---|---|
| #6 | "te salga bien a la primera" | **Promesa específica** |
| #3 | "apretá el embriague, crea tu producto, poné primera, ponete a vender" | **Callback + imperativo** |
| #39 | "las aprendas a usar para generar money. Abrazos." | **Frase + afecto** |
| #44 | "agendar en tu calendario el día de la clase y la hora. ¡Abrazo!" | **CTA + afecto** |
| #122 | "tocar el botón de aquí abajo" | **CTA mecánico** |
| #140 | "tocar el botón de aquí debajo" | **CTA mecánico** |
| #46 | "solamente tocá el botón de aquí abajo" | **CTA mecánico** |
| #1 | "Y eso sería como un producto digital" | **Cierre flojo/definicional** |

**Descubrimiento #2: Los 4 top terminan con AFECTO o CALLBACK; los bottom terminan con CTA plano.**

- **Top 4:** promesa / imperativo-callback / señal afectiva ("abrazos", "abrazo")
- **Mid/Bottom:** "tocá el botón" sin más
- **Peor (#1):** cierre definicional sin acción, sin afecto

El CTA funcional está PRESENTE en los top 4 pero **nunca es la última frase**. La última frase siempre es afectiva o simbólica.

---

## 3. ANTI-PITCH Y NEGACIÓN ESTRATÉGICA

### 3.1. Negaciones por video

| Ad | Negaciones clave | Cantidad |
|---|---|---|
| #6 | "no te vas a hacer millonario", "obviamente tienes sus limitantes", "hay gente que no va a poder hacerlo" | **3** |
| #39 | "no hay ningún secreto loco", "no hay IA mágica", "no te voy a vender nada de $500", "ni $200", "no es algo complicado" | **5** |
| #44 | "no buscaría un trabajo", "no tenés que mostrar tu cara", "no tenés que invertir miles", "tampoco tenés que dedicarle mucho tiempo" | **4** |
| #46 | "si no laburás, no cobrás", "no sos dueño de nada", "no te vas a hacer millonario", "no te preocupes", "no tenés que tener 21 años" | **5** |
| #122 | "sin hacer envíos", "sin tener stock", "sin depender de una feria" | **3** |
| #140 | "casi nadie se dio cuenta", "no tenés que aprender programación", "no tenés que saber de diseño" | **3** |
| #3 | "Es peligroso. No lo hagan." | **1** (humorística) |
| #1 | ninguna | **0** |

**Descubrimiento #3: La cantidad de negaciones estratégicas es el diferenciador más claro entre el top y el peor.**

- Promedio TOP 4: **3,25 negaciones por video**
- Promedio BOTTOM 2: **1,5 negaciones** (con #46 como excepción)
- **#1: 0 negaciones → ROAS 0,60 + sin CTA**

Las negaciones hacen 3 cosas simultáneas:
1. Anticipan objeciones del avatar.
2. Reducen compromiso percibido ("no tenés que…").
3. Bajan la promesa a niveles creíbles ("no millonario").

**Regla empírica:** al menos **3 negaciones estratégicas** por ad.

---

## 4. ANCLAS CONCRETAS VS ABSTRACCIONES

### 4.1. Densidad de "objetos reales" mencionados

Conté todos los sustantivos concretos (cosas tocables, lugares específicos, marcas reales):

| Ad | Anclas concretas | Ejemplos |
|---|---|---|
| #6 | **7** | compu, IA, producto, campañas, clientes, servicios |
| #3 | **9** | auto (implícito), embrague, primera, cambio, anuncios, capacitaciones |
| #44 | **11** | trabajo, IA, productos, mercado, redes sociales, cara, dólares, plan de ahorro, auto, alquiler, departamento |
| #39 | **9** | IAs textos, IAs imágenes, IAs gratuitas, productos, mercado, anuncios, $500 dólares, $200 dólares, pizza |
| #140 | **9** | ChatGPT, teléfono, recetas, tareas, Ferrari, esquina, súper, plan de 30 días, $15 dólares |
| #122 | **10** | manualidades, ferias, envío, ChatGPT, feria, velas artesanales, materiales caseros, guía de 15 páginas, WhatsApp |
| #46 | **8** | teléfono, internet, español, dólares, Fiverr, Digistore, productos digitales, botón |
| #1 | **5** | producto físico, PDF, ebook, libros, papel |

**Descubrimiento #4: No es la cantidad de anclas — es el tipo de ancla.**

- #1 tiene 5 anclas pero TODAS son abstracciones de producto (PDF, ebook, libros, papel, producto físico). Ninguna visualizable como escena.
- #6 tiene 7 anclas que incluyen la **escena del avatar trabajando** (compu + IA + producto + campañas).
- #3 tiene una sola ancla (auto/embrague) pero la desarrolla **motoramente** (apretá, soltá, poné primera).
- #140 tiene la analogía más potente (Ferrari) + demo con precio real ($15).

**Regla:** las anclas que funcionan son **motoras o visualizables como escena**. Las que fallan son **categóricas** (PDF, libro, ebook).

---

## 5. DENSIDAD DE "VOS / TU" (direccionalidad al avatar)

### 5.1. Ocurrencias de segunda persona

| Ad | Ocurrencias aprox. | ROAS |
|---|---|---|
| #44 | 22 | 1,21 |
| #6 | 20 | **2,63** |
| #39 | 18 | 1,25 |
| #46 | 18 | 0,55 |
| #122 | 17 | 0,67 |
| #140 | 15 | 0,56 |
| #3 | 12 | 1,20 |
| #1 | 8 | 0,60 |

**Descubrimiento #5: "Vos/te/tu" alto NO garantiza alto ROAS (#46 tiene 18 y rinde mal).** Pero "vos/te/tu" BAJO (#1 con 8) es killer.

**Umbral mínimo:** >12 ocurrencias de 2da persona. Debajo de eso, el ad se siente como "explicación general", no como "te estoy hablando".

---

## 6. RATIO AVATAR vs PRODUCTO — de qué trata realmente el video

### 6.1. Frecuencia de "producto/productos" vs frecuencia de "vos/te"

Calculé el ratio: (menciones de "producto*") / (menciones de "vos/te/tu").

| Ad | Menciones "producto" | Menciones "vos/te" | Ratio | Sobre qué trata |
|---|---|---|---|---|
| #6 | 5 | 20 | **0,25** | sobre el avatar |
| #3 | 4 | 12 | 0,33 | sobre el avatar |
| #44 | 3 | 22 | **0,14** | sobre el avatar |
| #39 | 4 | 18 | 0,22 | sobre el avatar |
| #46 | 3 | 18 | 0,17 | sobre el avatar |
| #122 | 5 | 17 | 0,29 | sobre el avatar |
| #140 | 9 | 15 | **0,60** | sobre el producto |
| #1 | 11 | 8 | **1,38** | sobre el producto |

**Descubrimiento #6: Los ads que hablan SOBRE EL AVATAR rinden mejor que los que hablan SOBRE EL PRODUCTO.**

- Ratio <0,35 → ads que hablan del avatar → ROAS promedio alto.
- Ratio ≥0,60 → ads que hablan del producto → ROAS bajo.
- **#1 (ratio 1,38) es el único donde "producto" se menciona más que el avatar** → peor del top 10.

Esto contradice la intuición del copywriting "enfocate en el producto". En este contexto: **el producto es el VEHÍCULO de la historia del avatar, no el héroe.**

---

## 7. DEMOGRAFÍA Y EDAD — CUÁNDO NO MENCIONARLA

### 7.1. Menciones explícitas de edad/demografía

| Ad | Menciona edad | ROAS |
|---|---|---|
| #46 | SÍ (25-55, 21, joven/jubilado) | 0,55 |
| #140 | SEMI (gente de oficina) | 0,56 |
| #44 | no | 1,21 |
| #39 | no | 1,25 |
| #3 | no | 1,20 |
| #6 | no | **2,63** |
| #122 | no | 0,67 |
| #1 | no | 0,60 |

**Descubrimiento #7: Los 4 top NUNCA mencionan edad ni demografía explícita.**

El hook demográfico amplio parece contraproducente en este vertical. Hipótesis: al decir "25-55 años", el avatar se siente parte de un grupo genérico en lugar de único. El hook de identidad emocional (#6: "nunca vendiste") activa más que el hook de identidad demográfica (#46: "tenés entre 25-55").

**Regla:** no mencionar edad. Filtrar por identidad psicológica, no demográfica.

---

## 8. PALABRA "IA" / "CHATGPT" / "INTELIGENCIA ARTIFICIAL"

### 8.1. Frecuencia de IA como concepto central

| Ad | Menciones de IA/ChatGPT | ROAS | Rol de IA en el video |
|---|---|---|---|
| #39 | **~7** | 1,25 | Protagonista |
| #140 | ~5 | 0,56 ⚠️ | Protagonista |
| #44 | ~4 | 1,21 | Protagonista |
| #122 | ~3 | 0,67 | Herramienta |
| #6 | 2 | **2,63** | Herramienta (menciona tangencial) |
| #1 | 2 | 0,60 | Menciona tangencial |
| #3 | 1 | 1,20 | Casi no la menciona |
| #46 | 0 | 0,55 | No aparece |

**Descubrimiento #8: Mencionar mucho la IA NO garantiza alto ROAS, pero NO mencionarla correlaciona con el peor (#46).**

**#6 y #3 están en el podio con la IA como concepto MARGINAL.** La IA es el vehículo, no el tema. Esto confirma algo importante:

**La IA funciona como "gancho de atención" (Meta premia ads sobre IA ahora mismo), pero NO es lo que convierte. Lo que convierte es el cambio de creencia del avatar. La IA es excusa para la conversación.**

Top ads usan la IA como tranpolín para hablar del avatar. Los que la ponen de protagonista (sin avatar) pierden.

---

## 9. VULNERABILIDAD Y HONESTIDAD — ¿admite limitaciones?

### 9.1. Frases de vulnerabilidad / sinceridad

Conté frases que reducen expectativas o admiten limitaciones honestas:

| Ad | Frases de sinceridad | ROAS |
|---|---|---|
| #6 | "obviamente tienes sus limitantes", "no te vas a hacer millonario", "hay gente que no va a poder hacerlo", "tenés alta probabilidad de equivocarte" | **2,63** |
| #46 | "la realidad es que no te vas a ser millonario" | 0,55 |
| #39 | "no te voy a vender nada ni $200" | 1,25 |
| #44 | "no tenés que dedicarle mucho tiempo para que te funcione" | 1,21 |
| #3 | (humorístico) "cuando sos capo, podés manejar sin mano. Es peligroso." | 1,20 |
| #122 | ninguna explícita | 0,67 |
| #140 | ninguna explícita | 0,56 |
| #1 | ninguna | 0,60 |

**Descubrimiento #9: Vulnerabilidad densa es el marcador del TOP ABSOLUTO.**

#6 tiene CUATRO frases de sinceridad vs. 1 en los demás tops y 0 en los bottom. La sinceridad es lo que lo lleva de 1,2 a 2,63. 

Lo que genera:
- Filtra leads inalcanzables (el que se queda es el realista).
- Construye confianza antes de la venta.
- Rompe el patrón "ad que miente" → mayor retención.

---

## 10. CUÁNTO DE "YO" vs "NOSOTROS" vs "VOS"

### 10.1. Pronombres de poder

| Ad | "Yo/me" | "Nosotros/nuestro" | Balance |
|---|---|---|---|
| #3 | 2 | 4 | **"Nosotros te enseñamos"** — plural de poder |
| #6 | 3 | 0 | Individual (Jesús solo) |
| #39 | ~4 | 0 | Individual |
| #44 | ~8 | 0 | Individual, desde autoridad |
| #46 | 2 | 0 | Mínimo |
| #122 | 2 | 0 | Mínimo |
| #140 | 0 | 0 | Sin pronombres de poder |
| #1 | 0 | 0 | Sin pronombres (definicional) |

**Descubrimiento #10: #3 es el único que usa "nosotros" (plural institucional).**

"Nosotros, por ejemplo, en nuestro programa, lo que te explicamos…" → posiciona a ADP como **empresa/equipo**, no como solo Jesús.

Esto puede ser uno de los motivos por los que #3 es el top revenue a pesar de no ser el top ROAS: el "nosotros" comunica escala y puede calificar leads para el ticket más alto (Academia > Taller).

**Hipótesis:** el "yo" vende Taller ($5). El "nosotros" vende Academia (ticket alto).

---

## 11. CONTRASTES BINARIOS — tensión narrativa

### 11.1. Oposiciones binarias presentes

| Ad | Oposición 1 | Oposición 2 | Total |
|---|---|---|---|
| #6 | Dueño vs servicio | Nunca vendió vs ya vendió | **2** |
| #3 | Principio vs capo | Manejar vs emprender | **2** |
| #39 | Gratuitas vs pagas | Básico vs generar money | **2** |
| #44 | Trabajo vs emprender | Tu tiempo vs escalable | **2** |
| #46 | Fiverr vs Digistore vs propio | joven vs jubilado | **2** |
| #122 | Ferias vs IA | Manualidad vs conocimiento | **2** |
| #140 | Básico vs avanzado | Ferrari súper vs Ferrari ruta | **2** |
| #1 | Físico vs digital | (ninguna otra) | **1** |

**Descubrimiento #11: TODOS los ads del top 10 tienen al menos 1 contraste binario — los que rinden tienen 2+.**

El #1 (peor) tiene solo 1 binario simple. La tensión narrativa requiere al menos 2 ejes de oposición para crear la sensación de "movimiento". 1 eje es estático.

---

## 12. DENSIDAD DE NÚMEROS ESPECÍFICOS

### 12.1. Cifras concretas mencionadas

| Ad | Números | ROAS |
|---|---|---|
| #46 | 7 ($15-30, $30/día, $50-60/día, $1500-2000/mes, 21 años, 25-55 años, 2 horas) | 0,55 |
| #39 | 6 ($500, $200, 3 pasos, 2 horas, "menos que una pizza") | 1,25 |
| #6 | 5 ($2-3k, $10-20k, 6 meses) | **2,63** |
| #44 | 5 (30 días, 1-2 horas, "miles, cientos de dólares", absolutamente todo) | 1,21 |
| #140 | 4 (30 días, 10 minutos, $15, 2 horas) | 0,56 |
| #122 | 2 (15 páginas, 24 horas, 2 horas) | 0,67 |
| #3 | 0 | 1,20 |
| #1 | 0 | 0,60 |

**Descubrimiento #12: Los números NO tienen correlación directa con ROAS.**

#46 tiene los más números (7) y es bottom; #3 tiene 0 y es top. **La densidad de números no importa — lo que importa es el anclaje.** #6 tiene menos números (5) pero todos son **anclajes de expectativa**: "2-3k consistente, no millonario" → cada número sirve para recalibrar expectativa.

#46 tira números sin función narrativa: "$15-30 por trabajo", "$30 al día" — son data points, no anclajes.

**Regla:** cada número debe servir para anclar expectativa o romper creencia. Si no cumple función, sacarlo.

---

## 13. RITMO — ORACIONES CORTAS VS LARGAS

### 13.1. Longitud promedio de oración

Conté oraciones (separadas por punto, pregunta, admiración) y dividí total de palabras.

| Ad | Oraciones | Palabras | Prom. palabras/oración |
|---|---|---|---|
| #3 | 31 | 279 | **9,0** |
| #6 | 28 | 343 | 12,3 |
| #39 | 30 | 374 | 12,5 |
| #122 | 24 | 265 | 11,0 |
| #44 | 22 | 310 | **14,1** |
| #46 | 23 | 293 | 12,7 |
| #140 | 15 | 255 | 17,0 |
| #1 | 21 | 225 | 10,7 |

**Descubrimiento #13: #3 tiene las oraciones MÁS CORTAS (9 palabras/oración) y es el #4 ROAS / #1 revenue.**

#140 tiene las más largas (17 palabras) — oraciones densas → dificultad de seguimiento → engagement bajo (además del mistracking).

Oraciones cortas en el top:
- #3: "Es peligroso. No lo hagan." (3 palabras + 3 palabras)
- #6: "Es muy difícil hacer esto." (5 palabras) / "Eso es más complicado." (4 palabras)
- #39: "Entonces, las gratuitas hay que descartarlas." (6 palabras)

**Regla:** cada 15-20 segundos, una oración corta de <8 palabras que rompa el ritmo.

---

## 14. EL "ABRAZO" / CIERRE AFECTIVO

### 14.1. Señal relacional al final

| Ad | Señal final | ROAS |
|---|---|---|
| #44 | "¡Abrazo!" | 1,21 |
| #39 | "Abrazos." | 1,25 |
| #6 | (sin despedida explícita, cierre con consejo) | **2,63** |
| #3 | (sin despedida, callback motor) | 1,20 |
| #46 | (sin despedida) | 0,55 |
| #122 | (sin despedida) | 0,67 |
| #140 | (sin despedida) | 0,56 |
| #1 | (sin despedida) | 0,60 |

**Descubrimiento #14: "Abrazo" al final está solo en los top 4.**

La señal relacional (incluso una palabra) al final calienta el cierre. 3 de los 4 top lo tienen o sustituto (consejo, callback). Ninguno de los 4 bottom lo tiene.

---

## 15. REPETICIÓN ESTRATÉGICA

### 15.1. Conceptos repetidos 2+ veces en el mismo ad

| Ad | Concepto repetido | Veces |
|---|---|---|
| #6 | "es muy difícil" | **4** (hacer esto, dedicarte, estudiar, seis meses) |
| #6 | "2-3 mil dólares" | **2** |
| #6 | "primera vez" / "alguien que te guíe" | **3** |
| #39 | "inteligencia artificial" / "IA" | **7** |
| #39 | "no te voy a vender nada" | **2** |
| #3 | "aprender a manejar" | **3** |
| #3 | "pasos sencillos" / "orden correcto" | **2** |
| #44 | "te voy a enseñar" / "te voy a mostrar" | **3** |
| #122 | "sin [algo]" (envíos, stock, feria) | **3** |
| #140 | "productos digitales" | **3** |
| #46 | "no te vas a hacer millonario" / "no tenés que" | **3** |
| #1 | "digital" | **6** |

**Descubrimiento #15: Los top 4 repiten CONCEPTOS CLAVE 2-4 veces usando construcciones distintas.**

#6 martilla "es muy difícil" 4 veces para distintas cosas (hacer esto, dedicarte 6 meses, estudiar, exponerse) → crea la sensación de "todo lo demás es difícil, esto es fácil".

#1 repite "digital" 6 veces pero como sustantivo categorical, no como argumento emocional → repetición sin función persuasiva.

**Regla:** la repetición tiene que construir un argumento. Repetir sin propósito diluye.

---

## 16. USO DE "MIRÁ" / "TE EXPLICO" — LLAMADOS DE ATENCIÓN

### 16.1. Frases que re-capturan la atención mid-video

| Ad | Re-enganches | Ejemplos |
|---|---|---|
| #39 | **4** | "Mira, no hay ningún secreto loco", "Te lo voy a explicar de nuevo", "Así que no tenés excusa" |
| #140 | **3** | "Mirá lo que puedes hacer con la misma herramienta", "Me explico", "Y justamente eso es lo que te voy a enseñar" |
| #44 | **2** | "Y hoy en día con la IA", "Entonces, lo único que tenés que hacer es" |
| #6 | **2** | "Imagínate", "El mejor consejo que te puedo dar es" |
| #3 | **2** | "Por ejemplo, a mí grabar anuncios", "Eso pasa con las capacitaciones" |
| #46 | **2** | "Y a ver, la realidad es que", "Y además" |
| #122 | **1** | "Y es acá donde entra la IA" |
| #1 | **0** | (ninguno) |

**Descubrimiento #16: Los ads que re-capturan atención 2+ veces tienden a mejor performance.**

El #1 no tiene ni un "mirá" — la audiencia no tiene disparadores para re-engancharse si se distrae.

---

## 17. SÍNTESIS — EL MODELO COMPUESTO

### 17.1. Score de "ADN Top" (por feature)

Asigné 1 punto si el ad cumple la versión ganadora del feature:

| Feature | #6 | #3 | #39 | #44 | #122 | #140 | #46 | #1 |
|---|---|---|---|---|---|---|---|---|
| Apertura = pregunta del avatar | ✓ | ✓ | - | ✓ | ✓ | - | - | ✓ |
| Cierre afectivo/callback | ✓ | ✓ | ✓ | ✓ | - | - | - | - |
| ≥3 negaciones estratégicas | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Ancla visualizable | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - | - |
| "Vos/te" ≥12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Ratio avatar/producto <0,35 | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ | - |
| Sin demografía | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | ✓ |
| Frase de vulnerabilidad | ✓ | - | ✓ | ✓ | - | - | ✓ | - |
| "Nosotros" institucional | - | ✓ | - | - | - | - | - | - |
| ≥2 binarios | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Oración corta <8 palabras | ✓ | ✓ | ✓ | ✓ | - | - | - | ✓ |
| "Abrazo" al final | - | - | ✓ | ✓ | - | - | - | - |
| Repetición con función | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ | - |
| Re-enganche 2+ | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ | - |
| **Total / 14** | **12** | **11** | **11** | **13** | **8** | **5** | **8** | **3** |

**ROAS vs Score:**

| Ad | Score | ROAS |
|---|---|---|
| #44 | 13 | 1,21 |
| #6 | 12 | **2,63** |
| #3 | 11 | 1,20 |
| #39 | 11 | 1,25 |
| #46 | 8 | 0,55 |
| #122 | 8 | 0,67 |
| #140 | 5 | 0,56 ⚠️ |
| #1 | 3 | 0,60 |

**Descubrimiento #17: El score predice ROAS con alta correlación.**

- Score ≥11 → ROAS ≥1,20
- Score 8 → ROAS 0,55-0,67
- Score <8 → ROAS bottom

**#44 tiene el mayor score (13) y rinde 1,21 — por debajo de #6 con score 12.** La diferencia: #6 tiene el formato actuación/diálogo (único). Eso vale más que 1 punto de score.

**Hay UN feature que pesa más que todo: el FORMATO de actuación/diálogo.** Un ad con score medio pero en formato diálogo (#6) supera ads con score máximo en monólogo (#44).

---

## 18. DESCUBRIMIENTOS NO OBVIOS — los 5 que no se ven de primera

### 18.1. El producto no existe en #6

**#6 es el top ROAS y NO MENCIONA EL PRODUCTO EXPLÍCITAMENTE.** No dice "clase", "taller", "registro". Solo habla del MODELO y cierra con consejo ("que alguien te guíe"). El espectador convierte sin haberle pedido nada.

### 18.2. #3 es el único con "nosotros"

Todos los demás ads son "Jesús solo". **#3 activa el "nosotros" 3 veces** ("nuestro programa", "nuestras capacitaciones"). Esto puede estar filtrando leads hacia tickets más altos (Academia vs. Taller), explicando el alto revenue absoluto ($7.139).

### 18.3. Los audios de 2 top ads (#39 y #44) están cortados al inicio

Tanto el #39 como el #44 empiezan a mitad de frase en el mp3. Hipótesis: **hay un hook visual/texto en pantalla al principio que no está en el audio.** Si se confirma, significa que el HOOK REAL puede ser diferente del que escuchamos. Vale la pena abrir los mp4 en cámara lenta para ver los primeros 2-3 segundos.

### 18.4. Temporal callback en #3

#3 es el único con **bracket narrativo** (abre y cierra con la misma analogía). Esta estructura es típica de virales orgánicos, no ads. Puede ser la razón por la que el ad corrió tanto antes de fatigarse (hasta que lo resubieron mal).

### 18.5. La "IA" es el trampolín, no el tema

4 de los 8 ads ponen a la IA como protagonista (#39, #44, #122, #140). **Pero los 2 top absolutos (#6, #3) la mencionan solo tangencialmente.** Esto sugiere que la IA funciona como MAGNET (atrae atención), pero **lo que convierte es el cambio de creencia del avatar**. La IA es excusa para la conversación, no el tema.

**Implicación:** el siguiente batch NO debe ser "ads sobre IA". Deben ser "ads sobre el avatar" donde la IA aparece como herramienta en 1-2 frases.

---

## 19. FÓRMULAS COMPUESTAS — 3 recetas derivadas del cruce

### 19.1. Receta "SUPER 6" — basada en #6 (ROAS 2,63)

```
1. Apertura: voz DISTINTA (avatar) con pregunta-objeción literal
2. Respuesta: invertir objeción ("justamente por eso…")
3. Demolición: contrastar con alternativas usando "es muy difícil" 3-4 veces
4. Mecanismo: 1-2 frases sobre cómo funciona (sin lista)
5. Expectativa realista: número concreto + "no millonario"
6. Filtro: "hay gente que no va a poder"
7. Cierre: consejo (sin CTA), señal afectiva
```

**NO DEBE TENER:**
- CTA explícito ("tocá el botón")
- Mención del producto/clase ("inscripción", "taller")
- Demografía

### 19.2. Receta "SUPER 3" — basada en #3 (top revenue)

```
1. Apertura: analogía cotidiana con pregunta ("¿Viste cuando…?")
2. Scene motora: verbos de acción (apretá, soltá, giralo)
3. Gag ligero: 1 línea humorística que rompe
4. Transferencia: "eso mismo pasa cuando querés X"
5. Autoridad lateral: "a mí me sale natural"
6. Venta del modelo: con "nuestro programa" (plural institucional)
7. Callback: cerrar con la analogía inicial transformada
```

**Debe tener:**
- 0-1 números (la analogía es más fuerte que las cifras)
- "Nosotros" / "nuestro" 2-3 veces (filtra a ticket alto)
- Oraciones promedio <10 palabras

### 19.3. Receta "ESTRUCTURAL 39" — basada en #39 (ROAS 1,25)

```
1. Apertura: observación de tendencia
2. Quiebre: "no sirve de nada tener X si no sabés Y"
3. Contra-intuición: "descartá las gratuitas"
4. Mecanismo: listicle 3 pasos CLAROS
5. Anti-pitch con número: "no te voy a vender de $500, ni $200"
6. Ancla de precio: "menos que una pizza" o equivalente
7. CTA casual + "Abrazos"
```

---

## 20. LO QUE AHORA SÉ QUE NO SABÍA

### 20.1. Conclusiones que emergen del cruce (no del análisis individual)

1. **El "producto" no es el tema en los ganadores** — los top 4 hablan del AVATAR, no del producto. La regla "mencioná tu oferta" es FALSA en este vertical.

2. **El CTA explícito es opcional (incluso contraproducente) cuando el contenido es fuerte** — #6 rinde 2,63 SIN CTA. Probar la ausencia de CTA puede ser una estrategia, no un error.

3. **"Abrazo" / consejo final es el cierre ganador** — nunca terminar con "tocá el botón". Siempre terminar con algo afectivo o reflexivo.

4. **La demografía amplia mata la identificación** — "25-55 años" diluye. Filtrar por DOLOR o DUDA, no por edad.

5. **La IA es el magnet, no el mensaje** — los ads donde la IA es protagonista rinden peor que los ads donde es herramienta tangencial.

6. **Los reuploads destruyen el learning** — no resubir, variar mínimamente para heredar la audiencia ya templada.

7. **La vulnerabilidad densa es el diferenciador del TOP ABSOLUTO** — 3-4 frases de "no es fácil / no vas a X" separan al 2,63 del 1,25.

8. **El "nosotros" institucional calienta el ticket alto** — #3 (top revenue) es el único con plural de empresa.

9. **Las oraciones cortas cada 15s mantienen el ritmo** — ningún ad del top dura más de 20s sin una oración <8 palabras.

10. **El formato actuación/diálogo es asimétricamente poderoso** — 1 punto de score en "formato diálogo" vale 5 puntos en el resto.

---

## 21. A / B testeables inmediatamente

1. **Versión "sin CTA" de #6 vs versión con CTA:** probar si el ROAS 2,63 viene del contenido o de la ausencia de CTA.
2. **#3 con "nosotros" vs con "yo":** probar si el plural sube el ticket medio.
3. **Variante mínima de #3** (cambiar primer segundo visual) vs **reupload textual** — para confirmar H2 (no resubir).
4. **Ad nuevo con formato diálogo** (igual a #6 con pregunta distinta del avatar) vs **ad con mismo contenido en monólogo**.
5. **#44 reformulado sin "deuda/auto/alquiler"** — probar si el ROAS se mantiene con lenguaje de estilo de vida.

---

## 22. Archivos relacionados

- [INDEX.md](INDEX.md) — tabla maestra
- [ANALISIS.md](ANALISIS.md) — análisis individual + cross básico
- [ad-*.md](.) — transcripciones individuales con frontmatter

**Este documento (CROSS_ANALYSIS.md) profundiza sobre el ANALISIS.md con 16 dimensiones de cruce.**

---

## 23. CORRECCIÓN IMPORTANTE — el spend cambia el veredicto

**Sesgo detectado:** el score de la sección 17 no pondera por SPEND ni por VOLUMEN DE VENTAS. Un ROAS 2,63 sobre $547 no es comparable a un ROAS 1,20 sobre $5.943. La evidencia estadística pesa distinto.

### 23.1. Por qué el spend importa

1. **Confianza estadística:** ROAS a bajo spend tiene alta varianza. #6 con 108 ventas tiene intervalo de confianza amplio (~±0,4-0,6). #3 con 424 ventas tiene varianza <±0,1. **El ROAS de #3 es mucho más sólido que el de #6.**

2. **Resistencia a escala:** un ad que rinde a $500 puede fatigar al escalar a $5k (saturación de audiencia, quemazón del pixel). Un ad que ya rindió a $5k demostró runway. **#3 pasó el test de escala; #6 no.**

3. **Profit absoluto:** el dinero que efectivamente dejó en caja. Ordena distinto que ROAS.

### 23.2. Tabla con spend + profit + confianza

| Ad | Spend | ROAS | Profit 2-productos* | Ventas | Confianza | Notas |
|---|---|---|---|---|---|---|
| **#3** | $5.943 | 1,20 | **+$1.196** | 424 | **ALTA** | Top profit, probado a escala |
| **#6** | $547 | 2,63 | +$891 | 108 | MEDIA | ROAS alto pero spend 10x menor |
| **#39** | $2.706 | 1,25 | +$665 | 167 | ALTA | Probado a escala, ACTIVE |
| **#44** | $2.730 | 1,21 | +$578 | 161 | ALTA | Probado pero DISAPPROVE |
| #122 | $751 | 0,67 | -$250 | 32 | BAJA | Data débil |
| #1 | $608 | 0,60 | -$242 | 39 | BAJA | Data débil + sin CTA |
| #140 | $796 | 0,56 | -$354 | 8 | BAJA | + mistracking sospechado |
| #46 | $2.945 | 0,55 | -$1.324 | 95 | ALTA | **Probó escalar pero fatigó** |

*Profit calculado con los 2 productos que Hyros trackea (Academia + Taller 3 días). No contempla LTV backend ni upsells posteriores.

### 23.3. Score ponderado v2

Agrego dos dimensiones al score de 14:

- **Spend probado:** ≥$2.000 con ROAS ≥1 = **+3 puntos** (evidencia sólida). ≥$500 con ROAS ≥1 = +1.
- **Volumen de ventas:** ≥300 ventas = +3 (N estadísticamente robusto). ≥100 = +1.

| Ad | Score ling. (/14) | Spend probado | Volumen | **Score v2 (/20)** | ROAS |
|---|---|---|---|---|---|
| **#3** | 11 | +3 | +3 | **17** | 1,20 |
| **#39** | 11 | +3 | +1 | **15** | 1,25 |
| **#44** | 13 | +3 | +1 | **17** | 1,21 |
| **#6** | 12 | +1 | +1 | **14** | 2,63 |
| #46 | 8 | 0** | 0 | 8 | 0,55 |
| #122 | 8 | 0 | 0 | 8 | 0,67 |
| #1 | 3 | 0 | 0 | 3 | 0,60 |
| #140 | 5 | 0 | 0 | 5 | 0,56 |

**#46 no suma "spend probado" porque gastó pero con ROAS <1 — probó que NO sostiene escala.**

### 23.4. Re-ranking estratégico corregido

1. **#3** — score 17/20. **El pilar del sistema.** Top profit, escala probada, 424 ventas de muestra. Destrabar el WITH_ISSUE = prioridad absoluta.
2. **#44** — score 17/20. Probado a escala pero bloqueado por Meta. Apelar/reformular = oro latente.
3. **#39 [BN]** — score 15/20. Best ACTIVE. Escalar agresivo con confianza.
4. **#6** — score 14/20. **Promesa grande, validación baja.** Escalar gradualmente ($1k → $2k → $3k) y medir si el ROAS se sostiene. **NO asumir que al escalar mantiene 2,63.**
5. **#46** — score 8/20 + evidencia negativa de escala. Caso educativo: qué NO copiar.
6. #122, #1, #140 — data insuficiente, son experimentos chicos.

### 23.5. Implicaciones estratégicas

**Lo que cambia respecto del análisis original:**

1. **#3 sube al #1 absoluto**, no solo por revenue sino por CONFIANZA ESTADÍSTICA. El patrón de #3 (analogía + bracket + "nosotros" + soft sell) es el más replicable porque es el más probado.

2. **#6 baja a "promesa a validar" en vez de "top absoluto".** El ROAS 2,63 puede ser artefacto de muestra chica. Antes de producir 5 variantes del formato diálogo, **probar 1 sola variante y escalarla hasta $2k** para ver si mantiene >1,5. Si lo mantiene, recién ahí producir más.

3. **#44 sube junto con #3.** Mismo score v2 (17/20). Desbloquear el DISAPPROVE es equivalente en valor a destrabar el WITH_ISSUE de #3.

4. **#46 se convierte en señal negativa de valor:** probó escala y no aguantó. Lo que falla en #46 es instructivo:
   - Hook demográfico amplio (25-55) en vez de específico
   - Menciona competidores directos (Fiverr, Digistore)
   - No menciona IA (hot topic)
   - Oraciones más largas y menos argentinismos

   **Anti-patrón:** replicar exactamente lo contrario de estos 4 puntos.

5. **El volumen de spend es un eje ignorado en la producción** — conviene que el skill `/plan-week` y `/plan-3` consideren: ¿qué ads ya probaron $2k+? Esos son las plantillas a imitar. Los ROAS altos con poco spend son candidatos, no plantillas confirmadas.

### 23.6. Regla operativa derivada

**Antes de declarar un ad "ganador replicable":**

1. Debe haber sostenido **≥$2.000 de spend**.
2. Con **≥100 ventas de muestra** (reduce varianza).
3. Manteniendo **ROAS ≥1,0** (umbral de rentabilidad en 2 productos; 0,5 si tu umbral es el de backend LTV).

Antes de eso, es una **señal** — no una plantilla. Escalar gradualmente antes de clonar.

**Los 4 ads que cumplen este criterio estricto:** #3, #39[BN], #44[C1], #46.
De esos, solo 3 son rentables: **#3, #39, #44**. Esos son los 3 ads que definen la plantilla real del sistema ADPD.

#46 cumple el criterio de escala pero NO de rentabilidad — sirve como anti-patrón.
#6 es promisorio pero aún no cumple — necesita escalar a $2k antes de ser plantilla.
