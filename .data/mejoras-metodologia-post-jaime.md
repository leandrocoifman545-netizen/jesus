# Mejoras a la Metodología de Análisis — Post Sesión Jaime Higuera

> Fecha: 2026-03-31
> Basado en: análisis Tier 1 de 9 videos (7 de venta + 2 de orgánico) + cross-profile validation
> Propósito: actualizar `metodologia-analisis-profundo.md` con lo que aprendimos

---

## Lo que funcionó bien de la metodología actual

1. **Los 7 axiomas como lente** — fueron la herramienta más útil del análisis. Cada decisión de cada video se pudo explicar con al menos 1 axioma. El descubrimiento de que los 3 orgánicos más virales satisfacen los 7 axiomas sin tensión es probablemente el hallazgo meta-metodológico más importante.

2. **Las 8 pasadas como estructura** — forzaron profundidad. Especialmente Pasada 3 (lo que FALTA) generó los insights más originales: descubrir que la AUSENCIA de CTA en orgánico puro es lo que protege el residuo emocional, o que la ausencia de credencial en #52 es una decisión de diseño.

3. **La Lente A (comparación con fracasos)** — fue la herramienta MÁS PODEROSA de toda la sesión. Las 4 versiones de "Ignora" como A/B test natural, y la comparación #52 vs #48, generaron los hallazgos más medibles y accionables.

---

## Lo que NO funcionó o faltó

### PROBLEMA 1: No había paso de EXTRACCIÓN VISUAL antes de Pasada 6

**Qué pasó:** Hice Pasada 6 (símbolos) escribiendo de memoria/imaginación porque no había extraído frames. Después tuve que rehacer todo cuando vi los frames reales. Los frames revelaron cosas que NUNCA habría descubierto sin verlos: el texto estático de #52, los subtítulos naranjas con comillas de "Maldición", los 4 sets DIFERENTES de "Ignora", la fuente serif de "Antes del mejor momento".

**Mejora propuesta:**
```
NUEVO PASO 0b: Extracción visual (ANTES de las 8 pasadas)
- Si el video está descargado: extraer 1 frame cada 10 segundos con ffmpeg
- Revisar los frames ANTES de escribir cualquier pasada
- Identificar: setting, ropa, props, texto overlay, tipo de subtítulos, expresiones faciales
- Anotar cambios visuales entre frames (¿hay cortes? ¿cambia el encuadre? ¿aparece/desaparece algo?)
```

### PROBLEMA 2: No había paso de CROSS-PROFILE VALIDATION

**Qué pasó:** Hice todo el análisis basado en un solo creador. Los patrones se sentían sólidos pero no sabía si eran universales o específicos de Jaime. Cuando finalmente corrí ig-search.mjs, descubrí que el anti-hype es Jaime-only (no un patrón universal) y que la desculpabilización aparece en 6 perfiles (sí es universal). Eso cambia completamente qué recomendar a Jesús.

**Mejora propuesta:**
```
NUEVA CAPA 2d: Cross-profile validation (DESPUÉS de las pasadas, ANTES de la transferencia)
Para cada hipótesis descubierta:
1. Buscar el patrón en ig-search.mjs (586 transcripciones, 8 perfiles)
2. Si aparece en 3+ perfiles → hipótesis fuerte (aplicar con confianza)
3. Si aparece en 1 perfil → hipótesis (aplicar con cuidado, puede ser idiosincrático)
4. Si no aparece → patrón EXCLUSIVO del creador (puede ser diferenciador O casualidad)

Un patrón exclusivo NO es necesariamente mejor ni peor. El anti-hype es exclusivo de Jaime Y es uno de sus patrones más efectivos. Pero saber que es exclusivo cambia cómo lo usamos: es un DIFERENCIADOR para Jesús, no una "best practice" universal.
```

### PROBLEMA 3: La comparación A/B natural no se buscaba activamente

**Qué pasó:** Las 4 versiones de "Ignora" fueron el análisis más valioso de toda la sesión. Pero las encontré por CASUALIDAD en el scrape — no las busqué activamente. Lo mismo con #52 vs #48 (mismo creador, mismo producto, diferente estructura).

**Mejora propuesta:**
```
NUEVO en Paso 1 (scrape): Buscar "experimentos naturales"
Después de scrapear un perfil, ANTES de elegir qué analizar:
1. Buscar videos con MISMO AUDIO/GUION y diferente producción/caption
2. Buscar videos con MISMO OBJETIVO/PRODUCTO y diferente estructura
3. Buscar videos REPETIDOS (misma temática, diferente ejecución)
Estos son A/B tests naturales que valen 10x más que un video aislado.
Priorizarlos para Tier 1 SIEMPRE.
```

### PROBLEMA 4: La tendencia a cortar camino en tandas posteriores

**Qué pasó:** El primer video analizado (#52) tuvo el tratamiento completo. Cada video posterior fue MENOS profundo. Tuve que rehacer Tanda 2, Tanda 3, y los orgánicos porque la profundidad caía con cada iteración.

**Mejora propuesta:**
```
NUEVA regla: CHECKPOINT de profundidad entre tandas
Antes de empezar la Tanda N+1, responder:
- "¿La Tanda N tiene las 8 pasadas COMPLETAS con la misma profundidad que la Tanda 1?"
- "¿Cada lente tiene tabla/análisis, no solo mención?"
- "¿Cada dimensión tiene más de 2 oraciones?"
Si la respuesta a cualquiera es NO → completar antes de seguir.

El principio: 3 videos analizados en profundidad real > 7 videos analizados con profundidad decreciente.
```

### PROBLEMA 5: La caption no tenía herramienta formal de análisis

**Qué pasó:** Descubrimos que la caption explica 4.7x de diferencia en views (4 versiones de "Ignora") y que funciona como argumento PARALELO al video (#52). Pero la metodología no tiene ninguna herramienta específica para analizar captions. La caption se mencionaba de pasada en Pasada 1 y D5 pero sin estructura.

**Mejora propuesta:**
```
NUEVA Lente F: Análisis de Caption
Para cada video analizado:
1. ¿La caption COMPLEMENTA o REPITE el video?
2. ¿Spoilea el hook o el remate?
3. ¿Funciona como hook visual para sin-sonido?
4. ¿Tiene argumento paralelo (objeciones diferentes al video)?
5. ¿Longitud vs engagement? (sweet spot: 6-15 palabras para orgánico)
6. ¿Es un TÍTULO (enigmático) o una DESCRIPCIÓN (informativa)?

Reglas descubiertas:
- Complementar > repetir (4.7x diferencia)
- Título enigmático > descripción informativa para orgánico
- Caption como segundo argumento > caption como resumen para venta
```

### PROBLEMA 6: "Nombrar lo innombrado" no estaba en la metodología

**Qué pasó:** Descubrimos que el video más viral del dataset (1.1M) funciona porque le da NOMBRE a un sentimiento difuso. Pero la metodología no tenía ninguna herramienta para detectar este mecanismo. No está en los 7 axiomas, no está en las 8 pasadas, no está en las dimensiones. Lo descubrimos por observación directa, no por el framework.

**Mejora propuesta:**
```
NUEVA pregunta en Pasada 4 (Modelos Mentales):
"¿El creador le da NOMBRE a algo que no tenía nombre?"
Si SÍ: analizar el nombre:
- ¿Es memorizable? (2-4 palabras)
- ¿Es emocionalmente cargado? (negativo > neutro)
- ¿Es paradójico? (elemento bueno + malo)
- ¿Nombra un sentimiento, un concepto, o un producto?
- ¿El viewer puede usar el nombre como BADGE de identidad?

Nombrar sentimientos > nombrar conceptos > nombrar productos (en viralidad orgánica)
```

### PROBLEMA 7: No se distinguía entre orgánico de alcance y orgánico de venta

**Qué pasó:** La metodología trata todo el contenido orgánico igual. Pero descubrimos que Jaime tiene DOS tipos de orgánico completamente diferentes con reglas OPUESTAS:
- Orgánico de ALCANCE: 0% CTA, carga cognitiva 0, dar 100%, objetivo = shares
- Orgánico de VENTA: CTA keyword, carga media, dar 70%, objetivo = comments/leads

Mezclar las reglas DESTRUYE ambos (agregar CTA al de alcance reduce 65% las views).

**Mejora propuesta:**
```
NUEVA clasificación en Lente B (Audiencia):
Antes de analizar, clasificar el video en:
1. ALCANCE PURO — sin CTA, sin mención de producto, 100% valor emocional
2. ORGÁNICO DE VENTA — con CTA keyword, orientado a leads
3. AD/PAGO — contenido pago, orientado a conversión

Las reglas son DIFERENTES para cada tipo:
- ALCANCE: dar todo, 0 CTA, carga 0, identidad > información
- VENTA ORGÁNICA: retener 30%, CTA keyword, carga media
- AD: optimizar por CPL, estructura micro-VSL

La confusión entre tipos es uno de los errores más comunes.
```

---

## Resumen: 7 mejoras concretas

| # | Mejora | Dónde va en la metodología | Por qué |
|---|--------|---------------------------|---------|
| 1 | Extracción visual ANTES de Pasada 6 | Nuevo Paso 0b | Los frames revelan cosas que el texto no puede |
| 2 | Cross-profile validation | Nueva Capa 2d | Distinguir patrón universal de idiosincrasia |
| 3 | Buscar A/B tests naturales al scrapear | Mejora de Paso 1 | Valen 10x más que videos aislados |
| 4 | Checkpoint de profundidad entre tandas | Nueva regla operativa | Evitar la degradación progresiva de calidad |
| 5 | Lente F: Análisis de Caption | Nueva lente | La caption explica hasta 4.7x de diferencia |
| 6 | "¿Nombra algo?" en Pasada 4 | Nueva pregunta | El mecanismo de viralización más potente encontrado |
| 7 | Clasificar tipo de contenido (alcance/venta/ad) | Mejora de Lente B | Reglas opuestas para tipos opuestos |

---

## Meta-reflexión: por qué este análisis fue el mejor

No es por las mejoras a la metodología. Es por 3 cosas externas a la metodología:

1. **Data de A/B test natural.** Las 4 versiones de "Ignora" y la comparación #52 vs #48 son EXPERIMENTOS CONTROLADOS. En todos los análisis anteriores, cada video era diferente en todo — no podíamos aislar variables. Acá sí. → **La calidad del análisis depende de la calidad de la data, no solo del framework.**

2. **Iteración forzada.** El análisis fue rehecho 4 veces. Cada iteración fue significativamente mejor. La primera versión era Tier 3 disfrazado. La cuarta es Tier 1 real. → **La profundidad no se logra en una pasada. Se logra rehaciendo hasta que no quede nada superficial.** La metodología debería ESPERAR la necesidad de rehacer, no asumir que sale bien a la primera.

3. **Cross-profile validation al final.** Buscar los patrones en 586 transcripciones reveló qué es universal y qué es idiosincrático. Sin eso, todo era "hipótesis de Jaime". Con eso, la desculpabilización es casi un axioma. → **Validar cross-profile debería ser OBLIGATORIO, no opcional.**

Las mejoras 1-7 codifican estas 3 lecciones en el framework para que la próxima vez no dependan de ser "forzadas" por el usuario.
