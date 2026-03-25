# Patrones de IG — Consolidado para ADP (Orgánico + Ads)

> Fuente: 1475 posts de 7 perfiles (@herasmedia, @tino.mossu, @niksetting, @faridieck, @hormozi, @ramiro.cubria, @jesustassarolo)
> Análisis: 7 dimensiones (hooks, captions, temporal, beats, cross-analysis, **patrones estructurales**, **pattern library**)
> Fecha: 2026-03-25
> **APLICA A ORGÁNICO Y ADS.** Con Andromeda, Meta optimiza orgánico y ads con el mismo sistema de distribución. Un video que retiene en IG retiene en un ad. Los patrones de apertura, cuerpo y cierre son transferibles.
> **Este archivo se consulta al generar guiones (orgánicos Y ads) y al planificar la semana.**
> **Para data machine-readable:** `pattern-library.json` + `metrics-summary.json` + `pattern-coverage.json`

---

## 1. Keyword Inbound: el sistema que funciona

**Data:** Los 2 perfiles que usan keyword inbound (Heras, Tino) tienen CLR 40%+ en videos de venta. Los que no lo usan (Nik, Faridieck) tienen CLR <6%.

**Multiplicador CTA:** 5.56x (10.30% vs 1.85% sin CTA — dato de cross_analysis.md, n=220 videos).

**Confirmado cross-profile (517 videos, 6 perfiles):**
- Con CTA en video: avg CLR 100.52% | Sin CTA: 9.69% → **10.4x multiplicador**
- CTA doble (video + caption) = 101.42% CLR → la combinación más poderosa
- DM como CTA = 127.29% CLR (dato de pattern-library.json, dominado por @ramiro.cubria)

### Reglas para ADP
- **SIEMPRE** poner CTA keyword en videos de venta
- Keywords candidatas por canal:
  - Clase gratuita: CLASE, GRATIS, ACCESO
  - Taller $5: TALLER, PLAN, PRODUCTO
  - Instagram orgánico: IA, PROMPT, NEGOCIO
- Formato: "Comentá [KEYWORD] y te mando [RECURSO específico]"

---

## 2. Keywords contextuales > genéricas (3-5x más CLR)

**Data:** Keywords contextuales al contenido del video (PIZZA, LADY, WHATSAPP en Tino; RETO en Heras) generan 3-5x más CLR que keywords genéricas (VIRAL, CLASE).

**Ejemplo:**
- Tino "LADY" → CLR 70.4% (contextual al caso de Lady, la mesera)
- Tino "CLASE" → CLR 39% promedio (genérica, siempre igual)
- Heras "RETO" → CLR 21.58% (activador FOMO + comunidad, n=36)

### Regla para ADP
Cada guion de venta debe tener una keyword **única al contenido**: si el caso es sobre un profesor, la keyword es PROFE. Si habla de ChatGPT, la keyword es PROMPT. NUNCA repetir la misma keyword 2 semanas seguidas.

---

## 3. Keyword Decay — Rotar agresivamente

**Data de temporal_analysis.md:**

| Keyword (Heras) | Usos | CLR 1ra mitad | CLR 2da mitad | Tendencia |
|------------------|------|--------------|--------------|-----------|
| VIRAL | 69 | 58.93 | 58.39 | DECAE (acumulativo) |
| CLASE | 41 | 67.05 | 67.12 | ESTABLE |
| ENVÍO | 41 | 71.91 | 69.06 | DECAE leve |
| COMENTARIOS | 24 | 67.70 | 53.26 | DECAE fuerte (-21%) |
| RETO | 22 | 60.33 | 69.04 | SUBE (FOMO+comunidad) |

**Insight clave:** Keywords de ACCIÓN ("comenta CLASE", "comenta RETO") resisten mejor que keywords de PROMESA ("te hago VIRAL", "te doy CONTENIDO").

### Regla para ADP
- Rotar keyword del CTA **cada 5-8 guiones máximo**
- Preferir keywords de ACCIÓN sobre keywords de PROMESA
- Si una keyword pierde CLR 2 semanas seguidas → retirarla

---

## 4. Estructura completa del video: APERTURA × CUERPO × CIERRE (517 videos)

**Data de pattern-library.json — análisis por zonas usando timestamps de Whisper:**

### 4a. Aperturas (primeros 8 segundos) — NO es la primera frase, son las primeras 3

| Patrón de apertura | Usos | Avg CLR | Para qué |
|--------------------|-----:|--------:|----------|
| **ancla_precio_invertida** ("$10K debería cobrar... gratis") | 1 | 345.19% | **NUEVO — CLR récord.** Precio alto → gratis en 8s |
| **segunda_persona** ("Vos que estás...", "Te cuento") | 2 | 174.28% | **NUEVO.** Conexión directa, intimidad |
| **exclusividad** ("se filtró", "acaba de lanzar") | 15 | 186.62% | Escasez + novedad |
| **imperativo** ("mirá", "dejá de", "no vuelvas") | 11 | 99.48% | Comando directo, rompe scroll |
| **provocación** ("mentira", "nadie", "basura") | 90 | 86.27% | Volumen + engagement |
| **dato/número** ($, %, cifra concreta) | 178 | 79.47% | **El más usado.** Ancla credibilidad |
| **credencial** ("facturé X", "mis clientes") | 36 | 64.12% | Autoridad directa |
| **hipotético** ("si tuviera", "imaginá") | 23 | 49.84% | Empatía + conexión con avatar |
| **identidad** ("si sos X", "los que hacen Y") | 9 | 36.43% | Filtro de audiencia |

**Temporal decay (weighted CLR — half-life 90 días, posts recientes pesan más):**
- `imperativo` sube de 99% → **172% weighted** (+73) — **patrón fresco, priorizar**
- `segunda_persona` sube de 174% → **215% weighted** (+41) — trending up
- `dato_numero` baja de 79% → **57% weighted** (-23) — **saturándose**
- `pregunta` baja de 66% → **58% weighted** (-9) — decayendo

**Cross con 36 generaciones ADP (ver `pattern-coverage.md`):**
- ADP sobreusa: `acumulacion` (58x), `dato_numero` (34x), `pregunta` (34x)
- ADP NUNCA usó: `ancla_precio_invertida`, `exclusividad`, `segunda_persona`, `imperativo`, `credencial`, `lista_framework`
- ADP inventó (no existe en IG): `herencia_emocional`, `escena_cinematografica`, `espejo_situacion`, `revelacion_personal`, `anti_guru`

**Insight clave:** La apertura NO es la primera oración. Son las primeras 3 oraciones / 8 segundos. Ejemplo ganador de @ramiro.cubria (CLR 345%):
> "10.000 dólares te debería cobrar por estos tres prompts de ChatGPT. Pero hoy me agarraste de buen humor. Así que más te vale que me prestes atención porque te los voy a dar gratis."
→ Oración 1: ancla precio. Oración 2: exclusividad. Oración 3: imperativo + remoción de riesgo. **3 técnicas en 8 segundos.**

### 4b. Cuerpo (8s hasta -15s del final) — Qué estructuras generan más engagement

| Patrón de cuerpo | Usos | Avg CLR | Para qué |
|-------------------|-----:|--------:|----------|
| **caso_real** (alumno, cliente, caso concreto) | 24 | 91.97% | **Prueba > promesa** |
| **matemática** ($5→$27→$97, calculadora) | 130 | 83.56% | Credibilidad numérica |
| **agitación leve** (1 dolor mencionado) | 92 | 69.77% | Conexión emocional sin ser heavy |
| **future pacing** ("imaginá tu vida así") | 63 | 63.45% | Aspiración |
| **tensión** ("lo peor", "el error", "la trampa") | 39 | 58.54% | Mantiene atención |
| **comparación** ("en vez de X, hacé Y") | 31 | 54.98% | Claridad de decisión |

### 4c. Cierre (últimos 15 segundos) — El buildup al CTA importa más que el CTA

| Patrón de cierre | Usos | Avg CLR | Nota |
|-------------------|-----:|--------:|------|
| **DM** | 169 | 127.29% | Máximo CLR de cierre |
| **desafío** ("te reto", "probá") | 4 | 106.14% | Poco usado, muy potente |
| **CTA doble** (video + caption) | 270 | 101.42% | La combinación estándar |
| **open loop** ("pero eso te lo cuento...") | 9 | 97.50% | Retiene para siguiente video |
| **sin CTA** | 89 | 9.69% | 10x menos comments |

### 4d. Buildup al CTA — Qué hay ANTES de "comentá X"

| Tipo de buildup | Usos | Avg CLR | Duración prom |
|-----------------|-----:|--------:|--------------:|
| **simplificación** ("es fácil", "solo tenés que") | 16 | 112.12% | 6.8s |
| **promesa de valor** ("te mando", "te voy a dar") | 67 | 105.97% | 8.3s |
| **directo** (sin transición, va al CTA) | 240 | 95.09% | 5.0s |
| **remoción de riesgo** ("gratis", "sin costo") | 11 | 72.80% | 9.5s |

**Insight clave:** El buildup de **simplificación** antes del CTA genera más CLR que el buildup directo. No es "comentá X" solo — es "Es muy fácil. Solo tenés que hacer esto. Comentá X y te lo mando."

### 4e. Combos ganadores (apertura → cierre, 2+ usos)

Los combos con mejor CLR promedio across all profiles:

| Combo | Usos | Avg CLR |
|-------|-----:|--------:|
| exclusividad → cta_video | 14 | 189.90% |
| dato_número → cta_video | 78 | 125.32% |
| imperativo → cta_video | 4 | 120.22% |
| provocación → cta_video | 16 | 115.78% |

**Regla para ADP:** El combo dominante es **dato/exclusividad → buildup de simplificación → CTA doble (video+caption)**. Esto no es opinión — es el patrón que aparece en el top 10 CLR de los 3 perfiles más exitosos.

### 4f. Densidad (palabras por segundo) × Performance

| Velocidad | Videos | Avg CLR |
|-----------|-------:|--------:|
| Rápido (>3 wps) | 458 | 79.83% |
| Normal (2-3 wps) | 38 | 36.03% |
| Lento (<2 wps) | 21 | 15.13% |

**Hablar rápido = más engagement.** Consistente across 6 perfiles. Ramiro, Heras y Tino hablan a >3 wps en sus mejores videos.

---

## 5. Tipos de Hook detallados (Heras, 167 hooks)

**Data de herasmedia_hooks_bank.md (167 hooks):**

| Tipo de hook | Cantidad | CLR promedio | Views promedio | Para qué usarlo |
|-------------|----------|-------------|---------------|----------------|
| dato/número | 42 (25%) | **73.13** | 39.6K | **ENGAGEMENT** — cuando querés comentarios |
| afirmación contrarian | 36 (22%) | 59.77 | 44.8K | Engagement + opinión |
| pregunta directa | 49 (29%) | 54.07 | **103K** | **REACH** — cuando querés views |
| imperativo/orden | 15 (9%) | 52.54 | 38K | CTA directo |
| pattern interrupt | 11 (7%) | 52.09 | 60.7K | Novelty |
| caso real con nombre | 5 (3%) | 49.11 | 57.6K | Social proof |

### Regla para ADP
- **Para guiones de venta (CLR importa):** arrancar con dato/número. Ej: "Este pibe facturó 3.200 dólares el mes pasado con IA."
- **Para guiones de contenido (reach importa):** arrancar con pregunta directa. Ej: "¿Cuántas horas perdés por día haciendo cosas que una IA podría hacer por vos?"
- **Nunca usar el mismo tipo de hook 2 guiones seguidos** — alternar entre los 4 principales.

---

## 5. Duración Sweet Spot

**Data de cross_analysis.md (220 videos, 3 perfiles):**

| Duración | Con CTA: CLR | Sin CTA: CLR | Delta |
|----------|-------------|-------------|-------|
| 30-45s | **14.46%** | 1.08% | +13.38pp |
| 60-90s | **11.59%** (n=96) | 2.65% | +8.95pp |
| 45-60s | 8.32% | 1.97% | +6.34pp |
| 90-120s | 7.04% | 2.60% | +4.44pp |

### Regla para ADP
- **Sweet spot por CLR:** 30-45s + CTA (14.46%)
- **Sweet spot por robustez estadística:** 60-90s + CTA (11.59%, n=96)
- **Recomendación:** Apuntar a 60-75s con CTA para guiones orgánicos. Los 5 beats del micro-VSL caben cómodos.

---

## 6. Formato FAQ: "3 objeciones en 25 segundos" (CLR 91%)

**Data:** Tino VIDEO 25 (DSBEuY1jpzB) — 3 preguntas frecuentes demolidas en 46s → CLR 91%.

**Estructura:**
1. Hook: "Las 3 preguntas más frecuentes sobre [X]"
2. Pregunta 1 → respuesta en 1 oración (8s)
3. Pregunta 2 → respuesta en 1 oración (8s)
4. Pregunta 3 → respuesta en 1 oración (8s)
5. CTA: "Si tenés otra pregunta, comentá [KEYWORD]"

### 4 sets para ADP
- **Set IA:** "¿Necesito saber programar? No. ¿Necesito invertir? No. ¿Cuánto tardo en aprender? Una semana."
- **Set Dinero:** "¿Cuánto puedo ganar? Depende, pero 500-3000 USD/mes es normal. ¿Es rápido? No. ¿Es real? Sí, tengo 200+ alumnos para probarlo."
- **Set Producto:** "¿Qué vendo? Un producto digital. ¿Quién lo compra? Gente que busca solucionar un problema específico. ¿Necesito stock? No."
- **Set Confianza:** "¿Es una estafa? Mostrá una estafa que te enseñe gratis primero. ¿Funciona en Argentina? Ganás en dólares. ¿Y si no me funciona? ¿Y si sí?"

---

## 7. Pregunta-Trampa: micro-commitment antes del CTA (CLR 43.9%)

**Data:** Tino usa en 5+ videos. Formato: preguntar algo que el avatar dice "sí" → contrastar con lo que NO hace → ofrecer la solución.

**Ejemplo Tino:** "¿Usás WhatsApp? Sí. ¿Ganás plata con WhatsApp? No. Bueno..."

### 3 variantes para ADP
1. "¿Usás ChatGPT? Sí. ¿Ganás plata con ChatGPT? No. Bueno, dejame mostrarte cómo."
2. "¿Tenés internet? Sí. ¿Tenés un celular? Sí. ¿Estás ganando plata con eso? No. Entonces estás sentado arriba de una mina de oro sin saber."
3. "¿Cuántas horas por día pasás en el teléfono? 4, 5, 6. ¿Y cuántas de esas horas te generan plata? Cero. Perfecto, mirá lo que te voy a mostrar."

---

## 8. Second Person Models Action (CLR 87%)

**Data:** Tino VIDEO 22 (DWKZA78gAqR) — alguien dice "Dale, ¿qué tengo que hacer?" y sigue instrucciones en vivo → CLR 87%.

### Para ADP
Grabar con alguien real que haga las preguntas del avatar:
- Un familiar: "Ma, mirá lo que hace mi alumno con ChatGPT..."
- Un amigo escéptico: "Explicame eso de los productos digitales, suena a pirámide"
- Un alumno real: "Jesús, mostrale a la gente cómo arranqué"

El interlocutor real > monólogo a cámara. Siempre.

---

## 9. Prueba Visual > Verbal (CLR 70.4%)

**Data:** Los videos donde Tino MUESTRA (pantalla de WhatsApp, transferencia, factura, joyería) tienen CLR 30-70% más alto que los que solo DICEN resultados.

### Para ADP
- Mostrar pantalla de ChatGPT generando contenido EN VIVO
- Mostrar el WhatsApp con mensaje de alumno (censurar nombre)
- Mostrar la transferencia/factura (censurar montos si quiere)
- Mostrar la landing page del producto digital del alumno

**Regla:** Si podés mostrarlo, no lo digas. Si lo decís, mostralo después.

---

## 10. Caption: Palabras que multiplican CLR

**Data de caption_analysis.md (266 posts, 3 perfiles):**

### Top palabras por CLR
| Palabra | CLR promedio | Delta vs promedio | Acción |
|---------|-------------|-------------------|--------|
| "lista" | +60 delta | USAR en CTAs de lead magnet |
| "guión" | +51 delta | USAR en contenido de autoridad |
| "puede" | +49 delta | USAR en promesas |
| "comenta" | +46 delta | USAR siempre en CTA keyword |

### Peores palabras (evitar)
| Palabra | CLR promedio | Delta vs promedio | Acción |
|---------|-------------|-------------------|--------|
| "directo" | -44 delta | NO USAR — suena a spam |
| "millonario" | -15 delta | NO USAR — suena a guru falso |
| "familia" | -14 delta | EVITAR en CTAs |

### Caption length
- **21-40 palabras = sweet spot** (CLR 51.81%)
- Captions largos (+80 palabras) bajan el CLR
- **1-3 hashtags = óptimo** (CLR 65.31%)

### Regla para ADP
Caption corto (20-40 palabras) + CTA keyword + máximo 3 hashtags. No resumir el video en el caption — usar el caption para amplificar la curiosidad.

---

## 11. Frecuencia y Timing

**Data de temporal_analysis.md:**

### Frecuencia
| Gap entre posts | CLR Heras | Views Heras |
|----------------|-----------|-------------|
| 1-3 días | 55.85 | 55K |
| **4-7 días** | **61.88** | **69K** |
| 8-14 días | 60.48 | 61K |
| 15-30 días | 43.00 | 25K |

### Mejor día
- **Engagement (CLR):** Martes (68.28) o Lunes (65.44)
- **Reach (views):** Miércoles (140K promedio)

### Regla para ADP
- Publicar cada **4-7 días** (ni diario ni quincenal)
- Guiones de venta → Martes (máx CLR)
- Guiones de contenido viral → Miércoles (máx reach)

---

## 12. 8 Templates Narrativos de Tino → ADP

**Data de tino_beat_mapping.md (28 videos mapeados):**

| # | Template | Duración | Vehículo ADP | Cuándo usarlo |
|---|---------|----------|-------------|--------------|
| 1 | Interacción callejera con escéptico | 50-80s | Demo en vivo (#3) | Cuando hay un "otro" que pregunta |
| 2 | Caso real con progresión numérica | 70-90s | Historia con giro (#2) | Cuando hay caso de alumno |
| 3 | Hot take polémica en ráfaga | 19-35s | Demolición de mito (#1) | Para reach viral |
| 4 | Demolición de alternativas con nombres | 90-130s | Demolición alternativas (#9) | Para audiencia que comparó opciones |
| 5 | Escalera de sueldos por profesión | 50-60s | Comparación de caminos (#4) | Para contraste aspiracional |
| 6 | Q&A lista rápida (3 items) | 30-40s | Pregunta y respuesta (#6) | Para contenido de autoridad |
| 7 | Reacción a hater/video | 120-210s | Demolición de mito (#1) | Para destruir objeciones |
| 8 | Contexto doméstico + pitch casual | 50-70s | Demo en vivo (#3) | Para naturalidad/confianza |

Cada template tiene adaptación ADP completa en `tino_beat_mapping.md` sección "8 Templates estructurales reutilizables".

---

## 13. Ratio Contenido:Venta

**Data cruzada:**
- **Heras:** Casi todo es CTA → CLR global 45% pero en DECLIVE (views -19%, comments -33%)
- **Tino:** 4:1 contenido:venta → en EXPLOSIÓN (views +912%, CLR +75%)
- **Nik:** Mayormente contenido → crecimiento sólido (views +97%)

### Regla para ADP
- **Mínimo 3:1 contenido:venta** en orgánico
- Los reels de contenido alimentan el funnel de los de venta
- Opiniones polémicas (IA y empleo, educación vs internet, generación Z) = viralidad sin CTA
- **El decline de Heras es la prueba:** repetir la fórmula CTA sin contenido cansa a la audiencia

---

## 14. Anti-patrones (qué NO hacer)

1. **NO usar la misma keyword más de 8 veces** → decae (dato: VIRAL en Heras, 69 usos)
2. **NO hacer todos los reels con CTA** → fatiga (dato: Heras en declive)
3. **NO poner captions largos (+80 palabras)** → baja CLR
4. **NO usar "millonario" o "directo" en captions** → correlación negativa con CLR
5. **NO publicar más de cada 3 días** → baja CLR de 61.88 a 55.85
6. **NO hacer solo monólogos a cámara** → los diálogos reales tienen 2-4x más CLR
7. **NO prometer sin mostrar** → prueba visual > prueba verbal siempre

---

## Tabla resumen: Esfuerzo × Impacto × Timing

| Patrón | Esfuerzo | Impacto | Cuándo |
|--------|----------|---------|--------|
| Keyword inbound (CTA) | Bajo | Alto | Desde ya |
| Keywords contextuales | Bajo | Alto | Desde ya |
| Formato FAQ 3 objeciones | Bajo | Alto | Próxima sesión |
| Pregunta-trampa | Bajo | Alto | Próxima sesión |
| Hooks dato/número para CLR | Bajo | Alto | Desde ya |
| Caption corto + 3 hashtags | Bajo | Medio | Desde ya |
| Publicar martes/miércoles | Bajo | Medio | Desde ya |
| Cada 4-7 días | Bajo | Medio | Desde ya |
| Prueba visual | Medio | Alto | Próxima sesión |
| Second person (interlocutor) | Medio | Alto | Planificar |
| Templates de Tino | Medio | Alto | Ir incorporando |
| Ratio 3:1 contenido:venta | Medio | Alto | Planificar |
| Rotar keywords cada 5-8 usos | Bajo | Medio | Monitorear |
| Frameworks con nombre propio | Alto | Alto | Largo plazo |

---

## Relación con el sistema ADP existente

Este documento **complementa** (no reemplaza) los archivos existentes:

- **Para hooks:** Consultar `herasmedia_hooks_bank.md` (167 hooks reales con métricas)
- **Para beats:** Consultar `tino_beat_mapping.md` (28 videos mapeados + 8 templates)
- **Para captions:** Consultar `caption_analysis.md` (correlación palabras × CLR)
- **Para timing:** Consultar `temporal_analysis.md` (decay, frecuencia, día de semana)
- **Para duración/CTA:** Consultar `cross_analysis.md` (sweet spots por duración × CTA)
- **Para patrones estructurales cross-profile:** Consultar `pattern-library.md` (517 videos, apertura×cuerpo×cierre × performance)
- **Para búsqueda temática:** `node scripts/ig-search.mjs "término"` (busca en 526 transcripciones + 1475 captions)
- **Para top hooks:** `node scripts/ig-search.mjs --top-hooks 30 --min-views 10000`
- **Para estructura de 5 beats:** Seguir usando `tipos-cuerpo.md` (los templates de Tino son variantes del mismo sistema)
- **Para ingredientes:** Seguir usando `enciclopedia-127-ingredientes.md`
