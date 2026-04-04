# Cruce de 4 Winners ADP — Meta Ads 2026

> **Objetivo:** Extraer qué tienen en común los 4 ads que funcionan, qué los diferencia, y qué reglas accionables salen para el sistema de guiones.
> **Fuentes:** `analisis-winner-121-c9-h1-ctaventa.md`, `analisis-winner-46-hook16-cuerpo3-cta4.md`, `analisis-ads-ganadores-jesus-adp-2026.md`
> **Fecha:** 2026-04-01

---

## Los 4 ads ordenados por CPL

| # | Ad | CPL | Registros | Gasto | Duración | Hook type | Estado muestra |
|---|-----|-----|----------|-------|----------|-----------|---------------|
| 1 | **#121** [C9-H1-CTAventa] | **$0.38** | 54 | $52 | 67s | Hipernicho ("Si hacés manualidades") | Chica (freq 1) |
| 2 | **#46** [Hook_16 Cuerpo_3 CTA_4] | **$0.99** | 866 | $857 | 65s | Eliminación barreras ("No importa si") | Grande (freq 1.35) |
| 3 | **#39[BN]** | **$1.31** | 1,020 | $1,338 | 85s | Directo ("Vender productos con IA") | Grande (freq 1.51) |
| 4 | **#43[BN]** | **$1.46** | 465 | $680 | 91s | Analogía absurda ("ChatGPT psicólogo") | Media (freq 1.25) |

---

## 0. DESPIECE DE MECANISMOS: HOOK × BODY × CTA

> Antes de buscar patrones, hay que entender QUÉ hace cada pieza a nivel de CONTENIDO — no visual, no estético, sino qué DICE y qué EFECTO produce en la cabeza del viewer.

### HOOKS — Qué dice cada uno y por qué el viewer se queda

**#121 ($0.38): "Si hacés manualidades seguro ya te pasó"**
- **Mecanismo:** AUTO-SELECCIÓN POR IDENTIDAD + ACTIVACIÓN DE MEMORIA
- **Qué pasa en la cabeza del viewer:** "¿Yo hago manualidades? Sí" → "¿Qué me pasó?" → el cerebro BUSCA la experiencia → ya está enganchado ANTES de que el ad le diga qué pasó
- **Por qué funciona para Meta:** El scroll se detiene porque el viewer está PROCESANDO su propia memoria. No está evaluando si el ad le interesa — ya está adentro
- **Quién se queda:** SOLO quien hace manualidades. Filtra el 90% del tráfico → los que se quedan son 10x más propensos a convertir → CPL baja

**#46 ($0.99): "No importa si tenés entre 25 o 55 años. No importa si nunca vendiste nada online."**
- **Mecanismo:** ELIMINACIÓN DE BARRERAS × ANÁFORA ("no importa si..." × 2)
- **Qué pasa en la cabeza del viewer:** "Ah, tengo 48 y pensaba que no era para mí" → ALIVIO → "bueno, ¿qué es?" → retención por curiosidad
- **Por qué funciona para Meta:** El viewer que iba a scrollear por "esto no es para mí" se DETIENE porque le acaban de decir que SÍ es para él. Retención alta en los primeros 3s = Meta le da más impresiones
- **Quién se queda:** TODOS los que alguna vez pensaron "soy muy viejo/joven/inexperto". Es amplio pero no vacío — filtra por CREENCIA, no por nicho

**#39 ($1.31): "Ponerte a vender vos tus propios productos hechos con la IA y venderlos a través de anuncios"**
- **Mecanismo:** PROMESA DIRECTA
- **Qué pasa en la cabeza del viewer:** "¿Vender productos con IA? Hmm, puede ser interesante" → curiosidad LEVE
- **Por qué funciona MENOS:** No filtra (cualquiera puede estar interesado) ni activa emoción (no hay recuerdo personal ni alivio). Es información, no experiencia. El viewer EVALÚA si le interesa en vez de estar automáticamente adentro
- **Quién se queda:** Curiosos generales. Más volumen, menos calidad → CPL más alto

**#43 ($1.46): "¿Qué es mejor, preguntar a ChatGPT sobre tu amorío o ir al psicólogo?"**
- **Mecanismo:** ANALOGÍA ABSURDA / PATTERN INTERRUPT COGNITIVO
- **Qué pasa en la cabeza del viewer:** "¿Eh? ¿Psicólogo?" → confusión → curiosidad por ver adónde va
- **Por qué funciona MENOS:** La confusión retiene 3-5 segundos pero el viewer no sabe SI ES PARA ÉL. Tiene que esperar 15-20 segundos para entender la propuesta. Patricia (48) no usa ChatGPT de psicólogo → no se identifica → scroll. El hook ENTRETIENE pero no CALIFICA

### A QUIÉN ATRAE CADA HOOK vs QUIÉN COMPRA REALMENTE

> Data real: 562 compradores ADP. 57% mujeres, 79% tiene 35+, 87% Argentina, mediana $850/mes. Patricia(48)=26%, Roberto(62)=30%, Laura(38)=15%.

| Ad | A quién ATRAE el hook | Quién COMPRA (data real) | Match hook↔comprador | CPL |
|----|----------------------|------------------------|---------------------|-----|
| **#121** | Mujeres 35+ que hacen manualidades | Patricia(48)/Soledad(41)/Roberto(62) = 56%+ | **PERFECTO** — el hook filtra por actividad y la actividad correlaciona con el comprador real | **$0.38** |
| **#46** | Todos (25-55, sin experiencia) | Patricia/Roberto = 56%, pero también Martín/Valentina que NO compran tanto | **AMPLIO** — incluye al comprador pero también a mucho no-comprador | **$0.99** |
| **#39** | Cualquier interesado en IA/productos | Spread general — no filtra | **SIN FILTRO** — atrae curiosos generales, no compradores | **$1.31** |
| **#43** | Usuarios activos de ChatGPT (jóvenes digitales) | Martín(26)/Valentina(32) = 17% de compradores | **DESAJUSTE** — atrae al que MENOS compra. Patricia(48) no usa ChatGPT de psicólogo | **$1.46** |

**HALLAZGO:** La correlación entre "a quién atrae el hook" y "quién realmente compra" es casi lineal con el CPL:
- Match PERFECTO (hook atrae al comprador) → $0.38
- Match AMPLIO (hook incluye al comprador entre otros) → $0.99
- SIN FILTRO (hook no filtra) → $1.31
- DESAJUSTE (hook atrae al que NO compra) → $1.46

**Esto podría ser LA variable más importante que faltaba.** El hipernicho no solo funciona porque es "específico" — funciona porque ATRAE EXACTAMENTE al perfil que termina pagando. Es un filtro de CALIDAD DE LEAD en el hook mismo.

**Implicación directa:** Los nichos para las variantes del #121 deberían elegirse cruzando `inteligencia-compradores.md` (talentos que quieren monetizar) con los avatares que más compran (Patricia, Roberto, Laura). No elegir nichos "interesantes" sino nichos que COINCIDAN con los compradores reales:
- Patricia (48, empleada): ¿qué hobby/habilidad tiene? → repostería, manualidades, cuidado personal
- Roberto (62, jubilado): ¿qué sabe hacer? → oficios manuales, carpintería, jardinería, reparaciones
- Laura (38, mamá): ¿qué hace en sus fragmentos de tiempo? → cocina, organización, crianza
- Soledad (41, profesional): ¿qué expertise tiene? → enfermería, docencia, terapia, pastelería

Los nichos deben matchear con los HOBBIES/HABILIDADES de los COMPRADORES REALES, no con lo que suena bien.

**RANKING DE MECANISMOS DE HOOK (por CPL):**

| Ranking | Mecanismo | Ejemplo | CPL | Por qué gana |
|---------|-----------|---------|-----|-------------|
| 1 | **Auto-selección × memoria** | "Si hacés [X] seguro ya te pasó" | $0.38 | El viewer está ADENTRO antes de decidir si le interesa |
| 2 | **Eliminación de barreras × anáfora** | "No importa si [objeción 1]. No importa si [objeción 2]" | $0.99 | El viewer que iba a irse se DETIENE por alivio |
| 3 | **Promesa directa** | "[Beneficio] con [herramienta]" | $1.31 | El viewer EVALÚA — funciona pero no engancha emocionalmente |
| 4 | **Analogía absurda** | "¿[Cosa rara]? → Si puede X, puede Y" | $1.46 | ENTRETIENE pero no califica. El viewer no sabe si es para él |

---

### BODIES — Qué estructura usa cada uno y qué efecto produce

**#121 ($0.38): DOLOR SENSORIAL → PIVOTE DE IDENTIDAD → DEMO CONCRETA → ESPEJO INVERSO**
```
[0-10s]  DOLOR: "Llovió y no vendiste nada. Tu ingreso depende del clima, del lugar y de tu tiempo."
         → EFECTO: El viewer RE-VIVE su frustración. No le contás un problema — se lo hacés SENTIR.

[10-16s] DIAGNÓSTICO: "Si no vas, no vendés." + re-explicación de las 3 dependencias
         → EFECTO: El viewer pasa de SENTIR a ENTENDER. Ahora sabe por qué le pasa.

[16-24s] PIVOTE: "Tu conocimiento de cómo hacerlas vale MUCHO MÁS que la manualidad en sí."
         → EFECTO: CAMBIO DE IDENTIDAD. De "artesana que vende cosas" a "experta cuyo conocimiento vale". 
         Este es el momento más importante del ad — el viewer se ve DIFERENTE.

[24-40s] DEMO: "Le pedís a la IA que te arme una guía de 15 páginas de cómo hacer velas artesanales."
         → EFECTO: El viewer VISUALIZA el producto terminado. No es "podrías crear algo" — es "ASÍ se crea ESTO".
         16 segundos de demo = 24% del video. Es un MINI-TUTORIAL gratis.

[40-52s] ESPEJO INVERSO: "Sin hacer envíos, sin tener stock, sin depender de una feria."
         → EFECTO: Cada liberación CANCELA un dolor del inicio. El arco emocional SE CIERRA.
         "Tu conocimiento trabajando por vos las 24 horas" = la frase de residuo. Contrasta con "si no vas, no vendés" del s16.
```

**#46 ($0.99): CALIFICACIÓN → DEMOLICIÓN × 2 → CONSTRUCCIÓN HONESTA**
```
[7-14s]  CALIFICACIÓN: "Solo necesitás teléfono + internet + español. Yo hago el último."
         → EFECTO: El viewer SABE que tiene todo lo necesario + spoiler de cuál es "el bueno". 
         Ahora ve los 3 modelos sabiendo cuál va a ganar → anticipación.

[15-20s] DEMOLICIÓN 1: "Fiverr — si no laburás, no cobrás."
         → EFECTO: 1 frase, 5 segundos. Descarte RÁPIDO. El viewer no pierde tiempo en esto.

[20-31s] DEMOLICIÓN 2: "Digistore — no sos dueño de nada. Si te quitan el producto, adiós."
         → EFECTO: Más lento (11s) porque la objeción es más sutil (dependencia de tercero).
         El viewer siente MIEDO de algo que no había considerado → la tercera opción se vuelve necesaria.

[31-41s] CONSTRUCCIÓN HONESTA: "No te vas a hacer millonario, pero $50-60/día = $1500-2000/mes."
         → EFECTO: ANTI-HYPE. Después de 2 demoliciones (negativo), la honestidad (positivo moderado) 
         se siente como un OASIS. El viewer baja la guardia porque nadie que quiera estafar dice "no te vas a hacer millonario".
         Los números son ESPECÍFICOS y NO REDONDOS → más creíbles.
```

**#39 ($1.31): VALIDACIÓN → DESCARTE → PASOS × 2 → ESCALERA DE PRECIO**
```
[5-15s]  VALIDACIÓN: "Hay mil IAs y no sabés qué hacer."
         → EFECTO: "Alguien entiende mi confusión." Empatía, no información.

[15-25s] DESCARTE: "Las gratuitas tienen la inteligencia limitada."
         → EFECTO: Resuelve una duda que el viewer tenía: "¿puedo hacerlo gratis?" → NO → acepta que necesita guía.

[25-40s] 3 PASOS (primera vez): Investigar → crear → vender.
         → EFECTO: Estructura mental. El viewer organiza la idea en 3 cajones.

[40-52s] RE-EXPLICACIÓN: "Te lo voy a explicar de nuevo para que sea más fácil." + 3 pasos simplificados.
         → EFECTO: "Este tipo se preocupa de que YO entienda." Empatía activa. 
         EXCLUSIVO — 0/586 transcripciones. Nadie hace esto.

[65-78s] ESCALERA DE PRECIO: "$500 → $200 → vale menos que una pizza."
         → EFECTO: Secuencia de ALIVIO descendente. Cada número que baja es un suspiro.
         "Pizza" = ancla cotidiana que TODOS entienden. EXCLUSIVO — 0/586.
```

**#43 ($1.46): ANALOGÍA → LÓGICA TRANSITIVA → STACK DE OBJECIONES**
```
[8-18s]  ANALOGÍA: "Si ChatGPT puede ser tu psicólogo..."
         → EFECTO: INTELECTUAL — el viewer piensa "tiene sentido" pero no SIENTE nada.

[18-25s] LÓGICA TRANSITIVA: "...entonces puede ayudarte a ganar plata."
         → EFECTO: El viewer RAZONA pero no se EMOCIONA. El puente lógico funciona solo para 
         quienes YA usan ChatGPT (Valentina/Martín, ~17% de compradores).

[55-82s] 4 OBJECIONES: sin experiencia, sin tiempo, sin cara, desde cero.
         → EFECTO: PLANTA objeciones en viewers que no las tenían.
         27 segundos (30% del video) dedicados a TRANQUILIZAR en vez de DAR VALOR.
```

**RANKING DE MECANISMOS DE BODY (por CPL):**

| Ranking | Mecanismo | Tiempo en valor | CPL | Por qué gana |
|---------|-----------|----------------|-----|-------------|
| 1 | **Dolor sensorial → pivote identidad → demo → espejo** | 42% | $0.38 | El viewer SIENTE, se RE-DEFINE, VISUALIZA el producto, y siente que el arco se CIERRA |
| 2 | **Calificación → demolición × 2 → anti-hype** | 15% (valor) + 25% (demolición) | $0.99 | El viewer DESCARTA alternativas por lógica y confía por honestidad |
| 3 | **Validación → descarte → pasos × 2 → escalera precio** | 43% | $1.31 | El viewer ENTIENDE y se siente SEGURO, pero no se RE-DEFINE ni VISUALIZA |
| 4 | **Analogía → lógica → stack objeciones** | 19% | $1.46 | El viewer RAZONA pero no SIENTE. Las objeciones RESTAN en vez de sumar |

**La diferencia central:** #121 y #46 hacen que el viewer SIENTA algo diferente sobre sí mismo (identidad, posibilidad). #39 y #43 hacen que el viewer ENTIENDA algo (pasos, lógica). **Sentir > entender para conversión en Meta Ads.**

---

### CTAs — Qué pide cada uno y cómo reduce la fricción

**#121 ($0.38): CTA = 22% (15s)**
```
"En la clase te voy a mostrar cómo hacerlo paso a paso."
"Preparé una clase la próxima semana donde te voy a explicar exactamente 
cómo agarrar tu conocimiento y crear un producto digital y generar ventas 
todos los días a través de WhatsApp."
"Son solamente dos horas y para registrarte tenés que tocar el botón de aquí debajo."
```
- **Mecanismos del CTA:**
  1. "paso a paso" → cross-profile CLR 83.24% (59 usos, 6 perfiles). Promesa de PROCESO
  2. "exactamente cómo" → ESPECIFICIDAD. No "te voy a ayudar" sino "te voy a explicar exactamente cómo"
  3. "a través de WhatsApp" → CANAL FAMILIAR. El 100% del target usa WhatsApp todos los días
  4. "solamente dos horas" → BAJO COMPROMISO. 2 horas vs "cambiarte la vida" = trade-off absurdo
  5. "tocar el botón" → INSTRUCCIÓN SIMPLE + dedo apuntando abajo (visual)
- **Fricción:** MÍNIMA. Es gratis, son 2 horas, es WhatsApp (conocido), y le señala el botón

**#46 ($0.99): CTA = 37% (24s)**
```
"Para registrarte a esta clase gratuita que voy a dar esta próxima semana, 
lo único que tenés que hacer es tocar el botón de aquí debajo."
"Te voy a mostrar absolutamente todo lo que necesitás para empezar desde cero. 
Cómo encontrar el producto, cómo crearlo y cómo venderlo."
"No te preocupes, no tenés que tener 21 años. Podés ser joven, jubilado..."
"Te voy a regalar un curso de preparación para nivelarte."
"Solamente toca el botón de aquí debajo."
```
- **Mecanismos del CTA:**
  1. "absolutamente todo" → COMPLETITUD prometida. El viewer siente que no se va a perder nada
  2. "Cómo encontrar, cómo crearlo, cómo venderlo" → OPEN LOOP TRIPLE. Nombra los 3 pasos pero no los explica → la curiosidad se resuelve registrándose
  3. "curso de preparación para nivelarte" → VALUE STACK. Elimina el miedo de "llegar sin saber nada"
  4. "está pensado para vos" → PERSONALIZACIÓN en video masivo
  5. RE-ELIMINACIÓN de barreras en el CTA (joven/jubilado) → cierra el círculo con el hook
  6. "solamente toca" × 2 → repetición del CTA = recordatorio sin presión
- **Fricción:** MÍNIMA + el CTA largo (37%) funciona porque los 13 SÍes previos construyeron suficiente confianza. El CTA no es "venta" — es la continuación natural de la conversación

**#39 ($1.31): CTA = 8% (7s)**
```
"Vos, entrá al taller, miralo y vas a ver que vas a encontrar la mejor forma 
de utilizar las inteligencias artificiales para generar money. Abrazo."
```
- **Mecanismos del CTA:**
  1. "entrá al taller, miralo" → INVITACIÓN CASUAL, no instrucción
  2. "generar money" → keyword naranja, la promesa final
  3. "Abrazo" → CIERRE AMIGABLE. Axioma 4 puro — se despide como amigo
- **Problema:** Es CORTO (7s). No tiene: open loop, value stack, eliminación de objeciones, "paso a paso". El viewer tiene que DECIDIR con poca información sobre qué va a recibir
- **Por qué funciona igual:** La escalera de precio ($500→pizza) ya resolvió la objeción #1 ANTES del CTA. El CTA no necesita convencer — solo indicar dónde clickear

**#43 ($1.46): CTA = 10% (9s)**
```
"Para poder registrarte a la clase que está muy buena, lo único que tenés 
que hacer es tocar el botón de aquí debajo y nos vemos en la próxima página 
donde te explico todos los detalles de la clase."
```
- **Mecanismos del CTA:**
  1. "que está muy buena" → AUTOELOGIO débil. El creador diciendo "está muy buena" ≠ el viewer sintiendo que está buena
  2. "tocar el botón" → instrucción simple
  3. "próxima página donde te explico" → promesa de más información
- **Problema:** "está muy buena" es la frase más débil de todo el ad. H-21 (frases derrotistas): no es exactamente derrotista pero tampoco es convincente. Sin "paso a paso", sin value stack, sin re-eliminación. El viewer tiene que CONFIAR sin más promesas concretas

---

### POR QUÉ META LE PONE PLATA A ESTOS Y NO A OTROS

Meta optimiza por: **retención temprana (3s) × CTR × conversión post-click**

| Señal de Meta | #121 ($0.38) | #46 ($0.99) | #39 ($1.31) | #43 ($1.46) |
|---------------|-------------|-------------|-------------|-------------|
| **Retención 3s** | ALTA — el viewer está procesando su memoria | ALTA — alivio + curiosidad | MEDIA — evalúa si le interesa | MEDIA — confusión → curiosidad |
| **Retención 15s** | ALTA — dolor sensorial lo enganchó | ALTA — quiere ver los 3 modelos | MEDIA — información, no emoción | MEDIA — todavía no sabe si es para él |
| **CTR** | ALTO — solo se quedó quien le aplica → mayor % clickea | ALTO — las barreras se eliminaron → se siente incluido | MEDIO — audiencia general | MEDIO — no calificó al viewer |
| **Conversión post-click** | ALTA — ya visualizó el producto | ALTA — 13 SÍes → confianza | MEDIA — seguridad pero no visualización | BAJA — lógica no activa acción |

**El ciclo virtuoso:** Mejor retención → Meta muestra a más gente → mejor CTR → Meta baja el costo → mejor CPL → más presupuesto → más escala.

**Lo que ACTIVA este ciclo:**
1. Un hook que haga que el viewer esté ADENTRO antes de decidir (memoria personal > evaluación racional)
2. Un body que haga que el viewer se SIENTA DIFERENTE (pivote de identidad > información lógica)
3. Un CTA que sea la CONTINUACIÓN NATURAL de lo que acaba de sentir (no una venta nueva)

---

## 1. QUÉ COMPARTEN LOS 4 (constantes)

### C-1: Densidad de SÍes ~1 cada 5-7 segundos
| Ad | SÍes | Duración | Densidad |
|----|------|----------|----------|
| #121 | ~13 | 67s | 1/5.2s |
| #46 | 13 | 65s | 1/5.0s |
| #39 | 8 | 85s | 1/10.6s |
| #43 | 8 | 91s | 1/11.4s |

**Hallazgo:** Los 2 mejores CPL (#121 y #46) tienen densidad de SÍes 2x mayor que #39 y #43. **La densidad de SÍes es el mejor predictor de CPL.** Cada SÍ que falta por segundo es CPL que sube.

**Regla para guiones:** Mínimo 10 SÍes en un ad de 60-75s. Si tiene menos de 8, reescribir.

### C-2: CERO testimonios, CERO screenshots, CERO "yo facturé X"
Ninguno de los 4 usa prueba social explícita. La autoridad es 100% DEMOSTRATIVA (el ad mismo como ejemplo) o POSICIONAL (Jesús muestra su lifestyle sin decir cuánto gana). 

**Regla:** No incluir testimonios en ads TOFU de Meta. Reservar para retargeting.

### C-3: Clase gratuita como CTA final
Los 4 llevan al mismo lugar: registrarte a una clase gratuita. Ninguno vende directo. Ninguno pide pago. La fricción del CTA es mínima.

### C-4: Sin música de fondo
Los 4 son solo voz + subtítulos. Cero música. Concentración total en las palabras.

### C-5: Subtítulos palabra por palabra con keywords en naranja/negrita
Todos usan el mismo sistema de subtítulos: palabras sueltas que aparecen sincronizadas + keywords destacadas (naranja o negrita grande).

### C-6: Empieza en B&N → pasa a color (#39 y #43) o con text card (#46) o directo (#121)
3 de 4 tienen algún tipo de pattern interrupt visual en los primeros 3 segundos. Solo #121 arranca directo sin truco visual — el hook verbal es tan fuerte que no necesita apoyo visual.

### C-7: Auto-referencia
3 de 4 dicen alguna variante de "venderlos con anuncios como este" o "campañas de publicidad como esta". Solo #121 no lo dice (porque el producto del nicho no son ads).

---

## 2. QUÉ LOS DIFERENCIA (variables que correlacionan con CPL)

### V-1: Especificidad del nicho (la variable MÁS fuerte)

| Ad | Nicho | CPL |
|----|-------|-----|
| #121 | **Manualidades/ferias** (hipernicho) | $0.38 |
| #46 | "3 modelos de negocio" (genérico con estructura) | $0.99 |
| #39 | "Productos con IA" (genérico directo) | $1.31 |
| #43 | "Ganar dinero con ChatGPT" (genérico con analogía) | $1.46 |

**Hallazgo:** A mayor especificidad del nicho → menor CPL. La diferencia entre genérico ($0.99-$1.46) e hipernicho ($0.38) es de 2.6-3.8x.

**Por qué funciona:** El hipernicho FILTRA en el hook. Solo se queda quien hace manualidades. Eso significa:
- Menos impresiones "desperdiciadas" en gente que no le aplica
- Mayor relevancia → mayor CTR → menor CPL
- El viewer siente "me hablan A MÍ" desde el segundo 1 (A2)

**Regla para guiones:** Priorizar hooks hiper-nicheados. "Si hacés [actividad específica]" > "No importa si tenés 25 o 55" > "Productos con IA". Crear variantes del mismo cuerpo para 10-15 nichos.

### V-2: Demo concreta vs promesa abstracta

| Ad | Demo | CPL |
|----|------|-----|
| #121 | "Guía de 15 páginas de velas artesanales" + insert de vela real | $0.38 |
| #46 | Nombra Fiverr/Digistore pero no muestra producto | $0.99 |
| #39 | "3 pasos: investigar, crear, vender" (nombra pero no muestra) | $1.31 |
| #43 | Solo analogía (no muestra nada concreto) | $1.46 |

**Hallazgo:** A mayor concreción de la demo → menor CPL. #121 dice "guía de 15 páginas de velas" Y muestra la vela. #43 no muestra nada concreto.

**Regla:** Cada guion debe tener AL MENOS 1 ejemplo concreto con número ("15 páginas", "$50-60 por día", "2 horas de clase"). Los números no redondos son más creíbles.

### V-3: Tipo de inserts (educativos/probatorios vs decorativos)

| Ad | Inserts | Tipo | CPL |
|----|---------|------|-----|
| #121 | 30% B-roll (feria, velas, jabones, sellado) | **PROBATORIO** — productos reales del nicho | $0.38 |
| #46 | 25% text cards + B-roll (s0-25) | **EDUCATIVO** — ilustran opciones | $0.99 |
| #39 | 4 inserts stock (cerebro, futurista, escritorio, dashboards) | **EDUCATIVO** — ilustran pasos, pero stock genérico | $1.31 |
| #43 | 2 inserts stock (silueta, laptop) | **DECORATIVO** — crean mood, no enseñan | $1.46 |

**Hallazgo:** Probatorio > educativo > decorativo. Los inserts que muestran COSAS REALES del nicho (#121: vela, jabón, feria) convierten mejor que stock genérico (#39: cerebro 3D) que a su vez convierte mejor que inserts de mood (#43: silueta triste).

**Regla:** Cada insert debe mostrar algo REAL o ilustrar un PASO. Prohibir inserts decorativos/mood en TOFU.

### V-4: % de CTA vs % de valor

| Ad | % CTA | % Valor/mecanismo | CPL |
|----|-------|-------------------|-----|
| #121 | 22% | 42% (mecanismo+beneficios) | $0.38 |
| #39 | 8% | 43% (solución+re-explicación) | $1.31 |
| #46 | 37% | 15% (mecanismo) | $0.99 |
| #43 | 10% | 19% (lógica+oportunidad) | $1.46 |

**Hallazgo SORPRENDENTE:** No hay correlación lineal entre % CTA y CPL. #46 tiene 37% CTA y $0.99. #121 tiene 22% CTA y $0.38. Lo que SÍ correlaciona es el % de VALOR (mecanismo + beneficios + demo): #121 (42%) y #39 (43%) tienen los % de valor más altos.

**Matiz:** #46 funciona con 37% CTA porque los primeros 40s son TAN densos en SÍes que la confianza ya está construida cuando arranca el CTA. El CTA largo NO daña si la densidad de SÍes previa es alta.

**Regla:** Priorizar % de valor alto (>40%). El CTA puede ser largo si la densidad de SÍes previa es 1/5s o más.

### V-5: Setting de fondo

| Ad | Setting talking head | CPL |
|----|---------------------|-----|
| #121 | Estudio/oficina con monitor + lámpara | $0.38 |
| #46 | Planta de fondo, pared clara. Lacoste verde menta | $0.99 |
| #39 | **Cama con mate** | $1.31 |
| #43 | **Ventanales con vista ciudad** | $1.46 |

**Hallazgo:** Los 2 mejores (#121 y #46) tienen settings NEUTROS — ni domésticos ni aspiracionales. Son fondos que no comunican nada en particular. La diferencia doméstico vs aspiracional solo aplica entre #39 y #43.

**Corrección a análisis previo:** La tesis "setting doméstico > aspiracional" solo se confirmó entre #39 y #43. No es universal. El setting NEUTRO de #121 y #46 funciona mejor que ambos. El setting ideal es uno que NO DISTRAIGA del mensaje — ni "qué lindo depto" ni "qué cama desordenada".

**Regla REFINADA:** Setting neutro > doméstico > aspiracional. El fondo no debería comunicar NADA que compita con el audio.

### V-6: Re-explicación (exclusiva de #39)

Solo #39 tiene "te lo explico de nuevo para que sea más fácil". Los otros 3 no re-explican. Pero #39 tiene peor CPL que #121 y #46.

**Implicación:** La re-explicación puede ser valiosa pero NO es la variable que más mueve CPL. La densidad de SÍes y la especificidad del nicho pesan más. Sin embargo, como H-26 es EXCLUSIVO (0/586 transcripciones), sigue siendo un diferenciador disponible para combinarse con las variables más fuertes.

**Regla:** Usar re-explicación en ads de 75-90s cuando hay 3+ conceptos. NO la usar en ads de 60-65s (no hay tiempo).

### V-7: Anti-hype

| Ad | Anti-hype | CPL |
|----|-----------|-----|
| #121 | NO (nicho no quemado) | $0.38 |
| #46 | SÍ ("no te vas a hacer millonario") | $0.99 |
| #39 | Parcial ("no $500, no $200") | $1.31 |
| #43 | NO | $1.46 |

**Hallazgo:** El anti-hype es CONTEXTUAL. En nichos no quemados (manualidades), no lo necesitás. En mercados quemados (ganar dinero online), es esencial.

**Regla:** Anti-hype SIEMPRE en hooks genéricos de emprendimiento/dinero. NUNCA en hooks hiper-nicheados donde la audiencia no está quemada.

---

## 3. RANKING DE VARIABLES POR IMPACTO EN CPL

Ordenadas por efecto estimado en el CPL basado en los 4 ads:

| Ranking | Variable | Efecto en CPL | Evidencia |
|---------|----------|--------------|-----------|
| **1** | **Especificidad del nicho** | **2.6-3.8x** | #121 hipernicho ($0.38) vs #46 genérico ($0.99) |
| **2** | **Densidad de SÍes** | **~2x** | #121/#46 (1/5s) vs #39/#43 (1/10s) |
| **3** | **Demo concreta con número** | **~1.5-2x** | #121 "15 páginas de velas" vs #43 sin demo |
| **4** | **Tipo de inserts** | **~1.3x** | Probatorio (#121) > educativo (#39) > decorativo (#43) |
| **5** | **% de valor vs % CTA** | **~1.2x** | >40% valor + alta densidad SÍes = sweet spot |
| **6** | **Setting de fondo** | **~1.1x** | Neutro > doméstico > aspiracional (solo entre #39 vs #43) |
| **7** | **Anti-hype** | **contextual** | Necesario en mercados quemados, innecesario en nichos frescos |
| **8** | **Re-explicación** | **diferenciador** | Exclusivo (0/586) pero no es la variable que más mueve CPL |

---

## 4. REGLAS ACCIONABLES PARA EL SISTEMA DE GUIONES

### REGLA 1: Hooks hiper-nicheados como default (V-1)
**Qué:** Cada guion debe abrir con un nicho específico: "Si hacés [X] seguro ya te pasó" o "Si sos [profesión] y querés [deseo]".
**Por qué:** 2.6-3.8x diferencia en CPL.
**Cómo:** Crear variantes del mismo cuerpo para 10-15 nichos. El cuerpo es reusable; el hook + dolor del nicho cambia.
**Excepción:** 1-2 guiones genéricos por semana para escala (tipo #46).

### REGLA 2: Mínimo 10 SÍes por guion de 60-75s (C-1 + V-2)
**Qué:** Contar los SÍes internos del viewer en cada guion. Si tiene menos de 10, agregar.
**Por qué:** Los 2 mejores ads tienen 13 SÍes en ~66s. Los 2 peores tienen 8 en ~88s.
**Cómo:** Después de escribir el guion, mapear la cadena de confianza. Cada pregunta interna que el viewer se hace debe tener respuesta en los siguientes 5-7 segundos.

### REGLA 3: Demo concreta con número específico (V-2)
**Qué:** Cada guion debe tener al menos 1 ejemplo con número: "guía de 15 páginas", "$50-60 por día", "2 horas de clase".
**Por qué:** La concreción baja CPL. Los números no redondos son más creíbles.
**Cómo:** Identificar el PRODUCTO EJEMPLO del nicho y cuantificarlo.

### REGLA 4: Inserts probatorios > educativos > decorativos (V-3)
**Qué:** Cada insert debe mostrar algo REAL del nicho o ilustrar un paso del proceso.
**Por qué:** #121 (probatorio, $0.38) > #39 (educativo, $1.31) > #43 (decorativo, $1.46).
**Briefear al editor:** Foto real del producto del nicho > stock que ilustra concepto > stock genérico de mood.

### REGLA 5: ≥40% del guion es valor (mecanismo + demo + beneficios) (V-4)
**Qué:** El valor (enseñar, demostrar, beneficiar) debe ocupar al menos 40% de la duración.
**Por qué:** #121 (42%) y #39 (43%) tienen los % de valor más altos y son winners.
**Cómo:** Si el guion es 70% setup + CTA y 30% valor → reescribir. El viewer tiene que sentir que APRENDIÓ algo.

### REGLA 6: Anti-hype según mercado (V-7)
**Qué:** Anti-hype ("no te vas a hacer millonario") en hooks genéricos. Sin anti-hype en hooks hiper-nicheados.
**Por qué:** El mercado de "ganar dinero online" está quemado. El de "vender manualidades online" no.
**Cómo:** Si el hook menciona dinero/negocio/emprender → incluir anti-hype. Si menciona un oficio específico → no.

---

## 5. OPORTUNIDAD #1: Máquina de variantes por nicho

El hallazgo más accionable de todo el cruce: **el nicho del hook es 2.6-3.8x más importante que cualquier otra variable.**

**Plan concreto:**
1. Tomar la estructura del #121 (dolor nicho → pivote conocimiento → demo IA → espejo inverso → CTA)
2. Crear 10-15 variantes cambiando SOLO: el nicho del hook + el dolor específico + el ejemplo de producto + 1 insert probatorio
3. Nichos candidatos (de `inteligencia-compradores.md` — talentos que quieren monetizar):
   - Cocina/Gastronomía (6%): "Si vendés tortas por encargo..."
   - Diseño/Arte/Foto (11%): "Si hacés trabajos de diseño freelance..."
   - Salud/Fitness (9%): "Si das clases de yoga presenciales..."
   - Educación/Enseñanza (14%): "Si das clases particulares..."
   - Coaching/Terapia (4%): "Si sos terapeuta y dependés de turnos..."
   - Manualidades/Artesanía (1%): Ya hecho (#121)
   - Ventas/Marketing (14%): "Si hacés community management..."
   - Escritura (1%): "Si escribís y no sabés cómo monetizar..."

4. Cada variante = misma duración (~67s), misma estructura, distinto nicho
5. Testear en Meta con $50 cada uno → en 1 semana tenés data de 15 nichos
6. Los 3-5 mejores se escalan

**Producción:** 1 sesión de grabación. Jesús graba 15 intros de 10s (una por nicho) + 1 cuerpo genérico de 40s + 1 CTA de 15s. El editor combina.

---

## 6. HALLAZGOS QUE SALIERON DE RELEER EN PROFUNDIDAD

> Estos salieron de las secciones que no leí la primera vez (Pasadas 3-8, Lentes, Dimensiones de cada análisis)

### H-1: Los mecanismos del #121 son CASI TODOS EXCLUSIVOS del dataset
Cross-profile validation (ig-search.mjs, 586 transcripciones):
- "seguro ya te pasó" = **0/586** (nadie abre así)
- "si haces [X]" como HOOK de apertura = **0/586** (existe mid-sentence en 12 resultados, pero nadie ABRE con esto)
- Triple negación espejo ("sin envíos, sin stock, sin depender") = **0/586**
- "vale más que [producto físico]" = **0/586** (en ese uso)
- "tu conocimiento" = solo **3/586** (CLR 70.8% — potente y sub-explotado)

**Implicación:** El #121 es un ad hecho de mecanismos que NADIE usa. No son variaciones de lo que hace el mercado — son invenciones. Esto explica parcialmente el CPL de $0.38: no compite con nada parecido en el feed.

### H-2: Los 2 lenguajes visuales del #46 (descubierto solo con 65 frames)
El #46 tiene una estructura de "2 actos visuales" que Gemini no detectó:
- **Acto 1 (0-25s) = "reel mode":** Text cards + inserts + texto bold + cambios cada 5 segundos. Diseñado para retener al scroller.
- **Acto 2 (25-65s) = "conversación mode":** Talking head puro + subtítulos discretos. Diseñado para construir confianza.
- **La transición** (frame 7, s35): Jesús aparece DENTRO de un frame con esquinas redondeadas = puente visual entre los 2 modos.

**El viewer entra por el reel y se queda por la persona.** Este patrón NO estaba en el cruce original.

**Se replica en #121 pero invertido:** #121 tiene 59% talking head + 30% B-roll distribuida. No tiene "2 actos" sino alternancia constante. El #46 es "2 bloques", el #121 es "montaña rusa". Ambos funcionan.

### H-3: Los SÍes del #121 son emocionales, los del #46 son lógicos
A IGUAL densidad (13 SÍes, 1/5s), el tipo de SÍ difiere:
- **#121:** "llovió y no vendiste nada" → SÍ VIVENCIAL (el viewer recuerda su experiencia)
- **#46:** "Fiverr: si no laburás, no cobrás" → SÍ LÓGICO (el viewer razona)

Los SÍes vivenciales (#121, $0.38) generaron 2.6x mejor CPL que los lógicos (#46, $0.99). **PERO:** esta diferencia puede ser por el nicho, no por el tipo de SÍ. No separable con la data actual. Hipótesis débil, no regla.

### H-4: La B-roll del #121 amplía el target por canal VISUAL
El audio dice "velas artesanales" (1 nicho) pero el B-roll muestra macramé, crochet, velas, sellado, jabones (5 nichos). El audio FILTRA, el visual AMPLÍA. La artesana de bijouterie no escucha "bijouterie" pero VE manualidades similares.

**Implicación para producción:** En las variantes por nicho, el B-roll puede mostrar 3-4 actividades RELACIONADAS al nicho del hook, no solo la que se nombra. Esto amplía el target sin diluir el hook.

### H-5: El residuo emocional difiere entre los 4 ads

| Ad | Residuo dominante | Tipo |
|----|-------------------|------|
| #121 | "Lo que sé vale mucho. Puedo vender sin depender." | **VALIDACIÓN + LIBERTAD** (A5+A6) |
| #46 | "Esto es honesto, real, y yo puedo hacerlo." | **ALIVIO + POSIBILIDAD** (A1+A2) |
| #39 | "Es fácil, son 3 pasos, y no me van a cagar." | **SEGURIDAD + SIMPLICIDAD** (A4+A7) |
| #43 | "Tiene lógica, cubre mis excusas." | **LÓGICA + PERMISO** |

**Los 2 mejores residuos (#121 y #46) tienen en común: POSIBILIDAD.** El viewer sale pensando "yo puedo". Los 2 peores tienen: SEGURIDAD (#39) o LÓGICA (#43). Seguridad y lógica no ACTIVAN — posibilidad sí.

**Regla para guiones:** El residuo target debe ser POSIBILIDAD, no seguridad ni lógica. El viewer tiene que salir pensando "yo puedo hacer esto" — no "esto parece seguro" ni "tiene sentido".

### H-6: Autoridad ANTI-convencional en ambos winners
Ni #121 ni #46 usan autoridad convencional (testimonios, screenshots, "yo facturé X"). Ambos usan:
- **Definicional** (nombrar cosas reales: Fiverr, Digistore, "guía de 15 páginas")
- **Demostrativa** (mostrar el mecanismo/producto)
- **Anti-autoridad** (#46: "no te vas a hacer millonario")

**La autoridad que funciona en Meta Ads TOFU es la que el viewer puede VERIFICAR (A1), no la que tiene que CREER.**

### H-7: La desaceleración visual genera intimidad
En #46: el ritmo visual pasa de 1 cambio/segundo (Acto 1, s0-25) a 1 cambio cada 3s (Acto 2, s25-65). La DESACELERACIÓN genera sensación de intimidad — "ya no es un reel, ahora es Jesús hablándote".

En #121: hay una pausa intencional s34-39 (6s sin cambio visual, "producto digital terminado") después de 14 segundos de B-roll constante. Mismo efecto: el cambio a estabilidad genera respiro e intimidad.

**Regla:** Diseñar la primera mitad del ad con ritmo visual alto (1 cambio/3-5s) y la segunda mitad con ritmo bajo (talking head). La transición rápido→lento = el viewer se siente más cerca.

### H-8: 5 niveles tipográficos en #46 (no 2-3 como se asumía)
El #46 tiene una jerarquía de texto mucho más sofisticada de lo que el cruce capturó:
1. Subtítulo chico blanco (información base)
2. Overlay mediano blanco bold (refuerzo sin-sonido)
3. Overlay grande blanco bold (impacto — los números)
4. Text card negro bold (pausa visual + remate)
5. Overlay de COLOR (turquesa/naranja/rojo — ancla emocional)

**El viewer procesa inconscientemente la IMPORTANCIA de cada frase por el nivel tipográfico.** Esto no es "subtítulos" — es un sistema de DISEÑO DE INFORMACIÓN visual.

---

## 7. REGLAS ACCIONABLES ACTUALIZADAS (post-relectura profunda)

Se agregan 4 reglas nuevas a las 6 originales:

### REGLA 7: Residuo target = POSIBILIDAD ("yo puedo") (H-5)
**Qué:** El viewer debe salir pensando "yo puedo hacer esto", no "esto parece seguro" ni "tiene lógica".
**Cómo:** Incluir al menos 1 momento A6 (cambia cómo se ve el viewer) — ej: "tu conocimiento vale más que tu producto".

### REGLA 8: B-roll diversa amplía target sin diluir hook (H-4)
**Qué:** El visual puede mostrar 3-5 actividades relacionadas al nicho aunque el audio solo nombre 1.
**Cómo:** Briefear al editor: "si el hook dice 'manualidades', el B-roll muestra macramé + crochet + velas + bijouterie".

### REGLA 9: Desaceleración visual en la segunda mitad (H-7)
**Qué:** Primera mitad = ritmo visual alto (1 cambio cada 3-5s). Segunda mitad = talking head predominante.
**Cómo:** Los inserts y B-roll van en la primera mitad. El CTA y el cierre emocional van en talking head puro.

### REGLA 10: Jerarquía tipográfica de 3-5 niveles (H-8)
**Qué:** No usar solo subtítulos. Usar al menos 3 niveles de texto: subtítulo (base) + keyword bold (énfasis) + color (ancla emocional).
**Cómo:** Briefear al editor con el mapa de niveles por sección del guion.

---

---

## 8. CRUCE CON ADS DE YOUTUBE (Academia de Publicistas, ~2022-23)

> Cruce ligero — no hay CPL comparable. Solo observaciones sobre constantes de Jesús como creador.

**2 ads adicionales:** "¿Cómo trabajar desde el living de tu casa?" (193s) y "Existen decenas de formas de ganar dinero" (100s). Producto: Academia de Publicistas. Plataforma: YouTube. Análisis en `.data/analisis-ads-ganadores-jesus.md`.

### H-35: La autocorrección mid-sentence es marca personal de Jesús
- YT2: "de práctica, no de estudios" — se corrige EN VIVO
- #39: "Te lo voy a explicar de nuevo" — reconoce que no fue claro
- #121: re-explica el problema (s11-16 repite s6-10 en formato diagnóstico)
- Aparece en 3 de 6 ads a lo largo de 3+ años. Es estilo natural, no técnica. Genera A1+A4.

### H-36: El embudo de Jesús nunca cambia
En 6 ads, de 2022 a 2026, de YouTube a Meta, de Academia de Publicistas a ADP: siempre clase/taller gratuito como CTA. El embudo es constante (ad → clase gratis → oferta). Lo que se optimiza es cómo el viewer LLEGA al embudo.

### Constantes de Jesús en los 6 ads (independiente de producto/plataforma/época)
- Sin testimonios de alumnos
- CTA = clase gratuita
- Tono casual/amigo ("abrazo", "chau chau", mate)
- Sin música de fondo
- Autocorrección/re-explicación como señal de autenticidad

### Lo que EVOLUCIONÓ de YouTube a Meta
- Duración: 193s/100s → 65-91s (compresión)
- Historia personal: SÍ → NO (Meta no tiene tiempo)
- Densidad SÍes: 1/17s → 1/5s (3.5x más denso)
- Hook: future pacing / premisa honesta → eliminación barreras / hipernicho
- Anti-guru "depende de cada persona" → anti-hype "no te vas a hacer millonario" (refinamiento)

---

*Última actualización: 2026-04-01 (v3 — agregado cruce con YouTube)*
