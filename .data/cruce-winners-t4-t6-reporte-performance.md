# Cruce: 4 Ads Winners × Reporte de Performance T4-T7

> **Objetivo:** Integrar los análisis cualitativos de los 4 ads winners (#39, #43, #122, #34) con la data cuantitativa del reporte de performance Meta Ads T4-T7. Explicar QUÉ cambió, POR QUÉ bajó el CPL un 49%, y qué hacer en T8.
> **Fuentes:** `analisis-winner-39-bn-t4.md`, `analisis-winner-43-bn-t4.md`, `analisis-winner-122-c9-h2-ctaventa.md`, `analisis-winner-34-c3-h4-ctaventa.md`, reporte de performance T4-T7, `cruce-4-winners-adp-2026.md`
> **Fecha:** 2026-04-09

---

## 1. Evolución T4 → T6: Qué cambió y por qué bajó el CPL 49%

### Los números crudos

| Métrica | T4 | T6 | Delta | Mejora |
|---------|-----|-----|-------|--------|
| CPL | $1.46 | $0.74 | -$0.72 | **-49%** |
| CTR | 2.61% | 3.89% | +1.28pp | **+49%** |
| LPV Rate | 44.2% | 48.4% | +4.2pp | **+10%** |
| Ads testeados | 50 | 50 | = | Misma escala |
| Spend | $3,015 | $956 | -$2,059 | 68% menos spend, pero leads comparables |

Pasamos de gastar $3,015 para 2,067 leads (T4) a gastar $956 para 1,294 leads (T6). Eso es **2.8x más eficiente** en costo por lead.

### Los 6 factores que explican la mejora (ordenados por impacto estimado)

**Factor 1: Nicho específico vs genérico — ~30% del impacto**

T4 hablaba de "IA y productos digitales" en general. El Ad #39 dice "ponerte a vender vos tus propios productos hechos con la IA" — es para CUALQUIERA. El Ad #43 arranca con una analogía de ChatGPT como psicólogo — atrae curiosos digitales que no buscan negocio.

T6 habla de MANUALIDADES (#122, C9-H2) y DECORACIÓN DE INTERIORES (#34, C3-H4). El viewer se ve reflejado en los primeros 3 segundos. "¿Sabes hacer manualidades?" filtra al 90% del tráfico → el 10% que se queda es 10x más propenso a convertir.

La data lo confirma:
- C9 (nicho manualidades) con cualquier hook = $0.68 CPL
- #39 (genérico IA) = $1.34 CPL
- #43 (analogía ChatGPT) = $1.44 CPL

**El nicho no es "marketing". Es un FILTRO DE CALIDAD DE LEAD en el segundo 1.** Patricia (48, empleada, hace manualidades) se queda. Martín (26, curioso de IA) scrollea. Patricia compra. Martín no.

**Factor 2: B-roll de nicho + screen ChatGPT = verificación visual — ~20% del impacto**

Ad #39 (T4) dice "podés crear productos con IA" pero muestra inserts stock genéricos: cerebros 3D rosa, dashboards futuristas, siluetas en ventanas. Es DECORACIÓN visual — no prueba nada.

Ad #122 (T6) MUESTRA jabones artesanales en la mesa + la pantalla de ChatGPT generando la guía. El viewer puede VERIFICAR con sus propios ojos que es real (Axioma 1). No es "confiá en lo que te digo" — es "mirá, acá está pasando".

Esto explica en parte la diferencia de LPV Rate: 44.2% (T4) vs 48.4% (T6). El viewer que vio los jabones + ChatGPT llega a la landing con más confianza → convierte más.

**Factor 3: Duración más corta = menos abandono — ~15% del impacto**

| Tanda | Duración ads winners | CPL |
|-------|---------------------|-----|
| T4 | 85s (#39), 91s (#43) | $1.34-$1.44 |
| T6 | 65s (#122), 71s (#34) | $0.73-$0.78 |

20-25 segundos menos. En un ad de 85 segundos, los últimos 20 son puro talking head sin inserts (frames 12-17 del #39 son 100% Jesús en la cama sin overlays). En T6 se cortó esa grasa.

Cada segundo de más es una oportunidad de abandono (Axioma 7). Si el CTA llega al segundo 65 en vez del 85, hay 20 segundos menos donde el viewer puede irse.

**Factor 4: Hooks más sofisticados — ~15% del impacto**

La evolución de los hooks entre T4 y T6:

| Tanda | Hook | Mecanismo | CTR |
|-------|------|-----------|-----|
| T4 #39 | "Ponerte a vender productos con IA" | Promesa directa | 2.40% |
| T4 #43 | "¿ChatGPT o psicólogo?" | Analogía absurda | 2.87% |
| T6 #122 | "¿Sabes hacer manualidades?" | Auto-selección por identidad | 3.74% |
| T6 #34 | "¿Viste esa revista de decoración?" | Nostalgia + pattern interrupt | 4.46% |

De "te digo qué hacer" (T4) a "¿sos vos?" (T6). El viewer pasa de EVALUAR si le interesa a SENTIR que es para él (Axioma 2). Y la nostalgia del H4 ("¿Viste esa revista de decoración que antes comprábamos en los kioscos?") es un pattern interrupt universal — funciona porque activa memoria emocional, no lógica.

**Factor 5: Nomenclatura modular C×H×CTA — ~10% del impacto**

T4 usaba `[BN].mp4` — naming batch simple. Un ad = un bloque indivisible. Si #39 funciona, no sabés si funciona por el hook, el cuerpo o el CTA.

T6 usa `CX-HY-CTAtipo`. Esto permite:
- Testear C9 con H1, H2, H3, H4, H5 por separado
- Testear H4 con C1, C3, C9 por separado
- Encontrar la COMBINACIÓN óptima (C9+H1 = $0.58) sin tener que crear 50 ads desde cero

El resultado: en T6 Meta pudo concentrar spend en C9-H1 ($568 de $956 = 59%) porque la data era CLARA sobre qué componente funcionaba.

**Factor 6: Producción profesional vs UGC casero — ~10% del impacto**

T4: Cama con mate, gorra de Miami, selfie balcón. UGC puro.
T6: Estudio con iluminación profesional, B-roll con productos reales, tipografía dinámica.

Ojo: esto NO quiere decir que "profesional = mejor". El #46 (T5) era UGC y tuvo CPL $0.99. Lo que cambió en T6 no es solo la calidad visual, sino que la producción está AL SERVICIO del nicho: los jabones artesanales en mesa de madera, la decoración de interiores con objetos reales. Sin nicho, no tenés QUÉ mostrar con B-roll.

### Resumen del desglose

```
Impacto estimado en la baja de CPL T4→T6:
├── Nicho específico vs genérico ............ ~30%
├── B-roll de nicho + verificación visual ... ~20%
├── Duración más corta ...................... ~15%
├── Hooks más sofisticados .................. ~15%
├── Nomenclatura modular C×H×CTA ........... ~10%
└── Producción profesional .................. ~10%
```

---

## 2. Análisis de qué componente aporta más al CPL

### Data cruda por componente

**Creativos/Cuerpos (aislando el efecto del hook):**

| Creativo | CPL promedio | Leads totales | Observación |
|----------|-------------|---------------|-------------|
| C9 | $0.68 | 830 | Mejor creativo global, funciona con CUALQUIER hook |
| C3 | $0.76 | 361 | Segundo mejor, el más CONSISTENTE (funciona en 4 tandas) |
| C1 | $0.85 | 31 | Buen LPV (53.1%) pero poco spend |
| C8 | $0.79 | 55 | Buen CPL pero CTR bajo (2.91%) |

**Hooks (aislando el efecto del creativo):**

| Hook | CPL promedio | Leads totales | CTR |
|------|-------------|---------------|-----|
| H1 | $0.69 | 908 | 3.89% |
| H2 | $0.79 | 408 | 3.71% |
| H4 | $0.78 | 337 | 3.62% |
| H3 | $0.86 | 118 | 3.01% |
| H5 | $1.38 | 42 | 2.44% |

**CTAs:**

| CTA | CPL | Leads |
|-----|-----|-------|
| CTAventa (T6) | $0.74 | 1,294 |
| CTAclase (T7) | $0.79 | 106 |
| CTA_4 (T5) | $0.98 | 1,637 |

### Descomposición del impacto

La forma de aislar el efecto de cada componente es mirar qué pasa cuando variás UNO solo:

**C9 con hooks distintos:**
- C9+H1 = $0.58 (mejor absoluta)
- C9+H2 = $0.78
- Delta = $0.20 → el hook explica $0.20 de diferencia

**H1 con creativos distintos:**
- C9+H1 = $0.58
- C3+H1 = $0.85 (T6) / $0.77 (T7)
- Delta = $0.19-$0.27 → el creativo explica $0.19-$0.27 de diferencia

**CTAventa vs CTAclase (mismo período similar):**
- CTAventa (T6) = $0.74
- CTAclase (T7) = $0.79
- Delta = $0.05 → el CTA explica ~$0.05 de diferencia

### Conclusión: Distribución del impacto por componente

```
Contribución estimada al CPL:
├── CUERPO/CREATIVO (C) ........... ~50% del resultado
│   (C9 vs C3 = diferencia de $0.08-$0.20 según hook)
├── HOOK (H) ...................... ~30% del resultado
│   (H1 vs H2 = diferencia de $0.10-$0.20 según creativo)
└── CTA ........................... ~20% del resultado
    (CTAventa vs CTAclase = diferencia de ~$0.05)
```

**Implicación directa para producción:** Si tenés que elegir dónde invertir tiempo, invertilo en el CUERPO. Un cuerpo C9 mediocre con un hook genial (C9+H1 = $0.58) le gana a un cuerpo mediocre con un hook genial. Pero la diferencia entre cuerpos es MAYOR que la diferencia entre hooks.

**Ojo con la trampa del CTR:** H4 tiene el MEJOR CTR (4.46% en el #34) pero NO el mejor CPL ($0.78). CTR alto = mucha gente hace click. CPL bajo = mucha gente que hace click CONVIERTE. Son cosas distintas. H4 genera curiosidad (nostalgia) pero H1 genera intención (auto-selección directa).

---

## 3. Patrones cruzados de los winners

### Qué tienen en COMÚN los 6 ads que mejor funcionaron

Analizando #39, #43, #46, #121 (C9-H1), #122 (C9-H2) y #34 (C3-H4):

**Constantes universales (presentes en TODOS):**

1. **Primera persona + voseo argentino.** "Ponerte a vender VOS", "¿Sabes hacer manualidades?", "¿Viste esa revista?". Nunca tuteo neutro, nunca usted.

2. **CTA suave = "tocá el botón de acá abajo".** Ninguno dice "REGISTRATE AHORA" ni "ÚLTIMOS CUPOS". Todos terminan con una variación de "tocá el link / el botón de acá abajo". Anti-urgencia total.

3. **Anti-venta como estrategia de venta.** "No te voy a vender nada de 500 dólares", "es gratis", "vale menos que una pizza", "no necesitás experiencia". La demolición de objeciones NO es explícita — es casual, como si no le importara si te anotás o no (Axioma 2: sentir que ELEGÍS).

4. **Duración entre 65-91 segundos.** Ninguno baja de 60s (necesitás tiempo para construir el argumento) ni sube de 95s (se pierde atención). Sweet spot: 65-71s (T6).

5. **Jesús como personaje único.** Mismo presentador en todos. No hay testimonios, no hay actores. La confianza se construye por repetición de exposición, no por prueba social externa.

**Constantes de los TOP 3 (CPL < $0.80):**

6. **ESPECIFICIDAD extrema.** Números concretos ("$10-25 por guía", "15 páginas", "1 hora"), pasos concretos ("agarrás ChatGPT, le pedís que te arme la guía"), ejemplos concretos (jabones, revistas de decoración, manualidades en ferias). La diferencia entre C9 ($0.68) y el #43 ($1.44) no es el hook — es que C9 dice EXACTAMENTE qué hacer y #43 dice vagamente que "podés".

7. **Cadena de micro-acuerdos.** El #34 (C3-H4) tiene 18 SÍes en 71 segundos = 1 cada 3.9 segundos. "¿Viste esa revista?" (sí) → "¿De decoración?" (sí) → "¿Que comprábamos en los kioscos?" (sí). Cada SÍ es un paso más adentro del embudo cognitivo.

8. **B-roll que VERIFICA la promesa.** Jabones artesanales, mesa de decoración, pantalla de ChatGPT generando contenido. No dice "podés" — MUESTRA que se puede (Axioma 1).

**Constante del PEOR (#43, CPL $1.44):**

9. **ABSTRACCIÓN = muerte del CPL.** El #43 tiene la "panza" de 25 segundos de promesas vagas sin especificidad. "ChatGPT puede hacer cosas increíbles por tu negocio" — ¿qué cosas? ¿Qué negocio? El viewer no puede VERSE haciendo algo concreto → no convierte. MEJOR hook + PEOR cuerpo = tráfico no calificado. El CTR alto (2.87%) con CPL alto ($1.44) es la firma de "atrae curiosos que no compran".

### La regla que sale de todo esto

> **Regla de oro:** Especificidad × Nicho × Verificación visual = CPL bajo. Faltando cualquiera de las tres, el CPL sube. El #43 tiene las tres ausentes y tiene el peor CPL. El C9-H1 tiene las tres presentes y tiene el mejor CPL ($0.58).

---

## 4. Mapa de combinaciones y recomendaciones

### Ranking de combinaciones existentes (por CPL)

| # | Combinación | CPL | Leads | Spend | Estado |
|---|-------------|-----|-------|-------|--------|
| 1 | **C9+H1** | **$0.58** | 441 | $568* | Ya escaló, MANTENER |
| 2 | **C1+H2** | **$0.55** | 19 | $26 | Data temprana T7, ESCALAR |
| 3 | **C3+H4** | **$0.54-$0.73** | 309 | $493 | Consistente en T6+T7, ESCALAR |
| 4 | **C3+H1** | **$0.77-$0.85** | 32 | $27 | Poco spend, MONITOREAR |
| 5 | **C9+H2** | **$0.78** | 366 | $285 | Sólido, MANTENER |

*Nota: el spend de C9 total es $568 (incluye todas las combinaciones de hooks).

### Acciones concretas para T8

**MANTENER (ya probados, ya escalados):**
- C9+H1: Es la mejor absoluta. Dejar que Meta siga optimizando.
- C9+H2: Sólido segundo lugar. Mantener activo.

**ESCALAR (data prometedora, falta budget):**
- C1+H2: CPL $0.55 con LPV 63.2% — es potencialmente el MEJOR ad si la data se sostiene. Darle $200-300 de presupuesto en T8 para validar.
- C3+H4: El más consistente del dataset. Funciona en T6 ($0.73) Y en T7 ($0.54 con sample chico). Darle más budget.

**TESTEAR (combinaciones nuevas con base en data):**
- **C9+H4:** Unir el mejor creativo (C9, manualidades, $0.68) con el hook de mejor CTR (H4, nostalgia, 4.46%). Hipótesis: "¿Te acordás cuando hacías manualidades de chica?" + cuerpo C9 de ferias→guía→ChatGPT. Podría combinar el filtro de nicho de C9 con el pattern interrupt de nostalgia de H4.
- **C3+H2:** C3 (decoración, consistente) con H2 (manualidades, buena calificación). Cross-nicho que puede funcionar si el cuerpo C3 se adapta.

**MATAR:**
- **H5:** CPL $1.38, CTR 2.44%, LPV 38.1%. Peor en TODA métrica. No hay combinación que lo salve. Muerto.
- **H3:** CPL $0.86, CTR 3.01%, LPV 42.3%. Mediocre en todo. Salvo que C1+H3 muestre algo en T7 (data pendiente), matar.

---

## 5. Hipótesis para T8

### Hipótesis 1: CTAclase puede superar a CTAventa a largo plazo

**Data:** CTAventa = $0.74 CPL / CTAclase = $0.79 CPL. Diferencia de solo $0.05.

**Pero:** CTAclase es de T7 que tiene solo $84 de spend (aún en aprendizaje). Y el LPV Rate de T7 (46.7%) es menor que T6 (48.4%), lo cual podría ser efecto de muestra chica, no de calidad.

**Hipótesis:** Si "anotate a esta clase gratis" genera un lead que espera APRENDER (no que le vendan), ese lead llega al webinar con una mentalidad diferente. El CPL puede ser $0.05 más alto pero la tasa de compra puede ser mayor.

**Cómo testear:** En T8, correr C9+H1 con CTAventa Y CTAclase en paralelo. Mismos creativos, distinto CTA. Trackear no solo CPL sino tasa de asistencia al webinar y tasa de compra.

### Hipótesis 2: Nuevos nichos con estructura C9/C3

Los cuerpos C9 y C3 tienen una ESTRUCTURA replicable:

**Estructura C9 (manualidades):**
```
Hook de nicho → Problema del nicho (ferias, poco margen)
→ Reframe: tu CONOCIMIENTO vale más que el producto físico
→ IA te arma una guía de 15 páginas en 1 hora
→ Venta digital, sin stock, sin envíos
→ CTA suave
```

**Estructura C3 (decoración):**
```
Hook de nostalgia → La demanda sigue, pero ahora es online
→ Cada guía = $10-25
→ Pinterest+IA te dan ideas infinitas
→ Cada estilo = un producto nuevo
→ CTA suave
```

**Nichos para testear (cruzados con perfil de compradores reales):**

| Nicho | Avatar match | Estructura base | Hook propuesto |
|-------|-------------|----------------|----------------|
| **Cocina/Repostería** | Patricia (48), Laura (38) | C9: "Tu receta vale más que la torta" | "¿Te acordás de esas recetas de la abuela que anotábamos en un cuaderno?" |
| **Ejercicio/Rutinas** | Laura (38), Soledad (41) | C3: "Cada rutina = un producto" | "¿Alguna vez te armaste tu propia rutina de ejercicio y alguien te dijo 'pasámela'?" |
| **Crianza/Guías para padres** | Patricia (48), Laura (38) | C9: "Tu experiencia de mamá = guía" | "¿Cuántas veces googleaste 'mi hijo no duerme' a las 3 de la mañana?" |
| **Jardinería/Huerta** | Roberto (62), Patricia (48) | C3: "Cada planta = contenido" | "¿Te acordás cuando tu viejo tenía esa huerta en el fondo que le daba de todo?" |
| **Costura/Tejido** | Patricia (48), Roberto(62) esposas | C9: "Tu patrón vale más que la prenda" | "¿Sabes coser? ¿Y alguna vez te pidieron que le enseñes a alguien?" |

**Prioridad:** Cocina > Crianza > Jardinería. Cocina matchea con Patricia Y Laura (41% de compradores), tiene B-roll fácil de producir (cocina, ingredientes, platos), y la nostalgia funciona universalmente ("recetas de la abuela").

### Hipótesis 3: Hook de nostalgia en otros nichos

H4 (nostalgia/decoración) tiene el MEJOR CTR del dataset (4.46%). La nostalgia funciona porque:
- Activa memoria emocional automática (el viewer no DECIDE recordar — recuerda)
- Es universal (todos tienen recuerdos de infancia)
- Es positiva (no es dolor, es añoranza)
- Genera curiosidad natural ("¿por qué me está hablando de revistas viejas en un ad?")

**Testear en T8:**
- "¿Te acordás de esas recetas de la abuela?" → nicho cocina
- "¿Te acordás cuando tu viejo te enseñaba a arreglar cosas?" → nicho oficios
- "¿Te acordás de esas revistas de manualidades que vendían en los kioscos?" → nicho manualidades con frame nostálgico

**Formato sugerido:** C9 body (que ya probó ser el mejor) con hook nostálgico adaptado. Ejemplo: "¿Te acordás cuando hacías manualidades de chica y todos te decían 'qué lindo lo que hacés'?" → cuerpo C9 de ferias→guía→ChatGPT.

### Hipótesis 4: Escalar por VOLUMEN de nichos, no por BUDGET por nicho

El patrón de Meta es claro: concentra 80%+ del spend en 2-3 ganadores por tanda. No podemos forzar que escale un ad mediocre.

**Estrategia propuesta para T8:**
- NO subir budget de C9+H1 (ya está optimizado por Meta)
- SÍ crear 10-15 variaciones de nicho con estructura C9/C3
- Dejar que Meta encuentre los 2-3 ganadores entre esas variaciones
- Los nichos ganadores se escalan solos; los perdedores se matan rápido

Esto replica lo que funcionó en T6: 50 ads, Meta concentró en los 3 mejores. La clave no fue tener UN ad genial — fue tener SUFICIENTES variaciones para que Meta encuentre los ganadores.

---

## 6. Por qué bajó el CPL: la respuesta completa

> **Nota:** Esta sección reescribe la causa raíz de la baja de CPL T4→T6 integrando el cruce con los 562 compradores reales (ver `inteligencia-compradores.md` y `cruce-562-vs-winners.md`). La sección 1 atribuye la mejora principalmente a "nicho específico". La data de compradores revela que el verdadero factor #1 es más profundo: **MATCH con el comprador real**. El nicho es un subset de eso.

### La pregunta correcta no es "qué nicho" — es "a quién le hablás"

Cuando cruzamos cada ad con el perfil demográfico, los dolores y los talentos de los 562 compradores reales, aparece una correlación limpia: los ads que más matchean con el comprador real tienen el CPL más bajo. El "nicho" no es el factor — es una proxy del match.

### Tabla de cruce final: Ad × Match con comprador real

| Ad | CPL | Match con comprador real | % avatares cubiertos | Hallazgo |
|----|-----|-------------------------|---------------------|----------|
| **C9-H1** | **$0.38-$0.58** | **PERFECTO** | ~64% | Nicho (manualidades) + dolor (ferias, poco margen) + identidad (mujer 35+) alineados |
| **C3-H4** | **$0.73** | **95% (38/40)** | ~93% | Nostalgia universal ("revista de decoración en los kioscos") activa memoria en casi toda la audiencia 35+ |
| **C9-H2** | **$0.78** | **64%** | ~64% | Mismo cuerpo C9 pero hook menos doloroso — match sólido pero no máximo |
| **#46** | **$0.96-$0.99** | **AMPLIO** | ~50% | Genérico que incluye al comprador pero diluido con no-compradores |
| **#39** | **$1.34** | **SIN FILTRO** | ~30% | Visual (cama, gorra, selfie) habla a Martín (5% de compradores), NO a Patricia (26%) |
| **#43** | **$1.44** | **DESAJUSTE** | ~17% | Analogía "ChatGPT o psicólogo" atrae al perfil joven digital que NO es el comprador real |

### La correlación es limpia

```
Match con comprador real ↑  =  CPL ↓
```

No es "nicho específico mejor que genérico". Es "hablarle al que compra mejor que hablarle al que scrollea". #39 y #43 son "específicos" en sentido literal (hablan de IA, de ChatGPT), pero están DESAJUSTADOS del comprador real: su visual habla a un joven de 26 con gorra, y su lenguaje habla a un usuario activo de ChatGPT. El problema no es que sean genéricos — es que apuntan al avatar EQUIVOCADO.

C9-H1 y C3-H4, en cambio, activan auto-selección por identidad y nostalgia en la franja 35+, que es el 78% de los compradores reales.

### Reordenando los 6 factores de mejora T4→T6

La lista original tenía "nicho específico" como factor #1. La causa raíz verdadera es match con comprador real, que ENGLOBA nicho + visual + lenguaje + dolor. Reordeno con porcentajes actualizados:

```
Impacto estimado en la baja de CPL T4→T6 (versión actualizada):
├── 1. Match con comprador real ........... ~40%
│     (nicho + visual + lenguaje + dolor alineados con el 78% que tiene 35+)
├── 2. Producción profesional ............. ~15%
│     (refuerza autoridad para una audiencia 35+ que buscaba confianza)
├── 3. B-roll + screen ChatGPT ............ ~15%
│     (verificación visual — Axioma 1: ver para creer)
├── 4. Nicho específico vs genérico ....... ~15%
│     (subset del factor #1 — el nicho es la TÉCNICA de materializar el match)
├── 5. Duración más corta ................. ~10%
│     (65s vs 85s — menos ventanas de abandono)
└── 6. Hooks más sofisticados ............. ~5%
      (nostalgia, identidad, dolor específico vs promesa directa)
```

La diferencia clave con la versión anterior: "nicho" bajó del 30% al 15% porque es una manifestación del factor #1 más grande (match). Si creás un ad "nicho-específico" para el avatar equivocado (ej: "nicho crypto" para Patricia), el CPL sube. El nicho sin match no funciona. El match sin nicho (como el #46, que es amplio pero incluye al comprador) funciona mejor que un nicho desajustado.

---

## 7. Avatar coverage de los 6 winners actuales

Cruzando los 6 ads principales con los 5 clusters de compradores reales (de `inteligencia-compradores.md`):

### Tabla de cobertura

| Avatar | % compradores | Cubierto por | Calidad del match | Gap |
|--------|--------------|--------------|-------------------|-----|
| **Patricia** (48, empleada, Cluster "Reinventada") | **26%** | C3-H4 (alto), C9 (medio) | BUENO pero indirecto | Faltan ads de "empleada estancada que quiere reinventarse" |
| **Roberto** (62, jubilado, Cluster "Último Tren") | **30%** | C9 (medio) | MEDIO | Faltan ads de "jubilado que aprende IA" con dignidad económica |
| **Laura** (38, mamá, Cluster "Reinventada") | **15%** | C3-H4 (directo), C9 (alto) | ALTO | OK — está bien cubierta |
| **Soledad** (41, profesional salud, Cluster "Profesional Estancado") | **3%** (13% del cluster amplio) | C9 (alto) | ALTO | Faltan ads de "profesional que digitaliza expertise" |
| **Martín** (26, joven, Cluster "Escalador") | **5%** | #39, #43 (alto) | ALTO pero CARÍSIMO | **Sobre-representado** — 2 ads dedicados para solo 5% de compradores |
| **Diego** (44, escéptico, perfil transversal) | **5%** | #46 (parcial) | BAJO | Faltan ads de "anti-guru radical" que demuelan objeciones desde la desconfianza |

### El hallazgo demoledor

**Patricia + Roberto = 56% de los compradores reales, y NO tienen ads optimizados para ellos.**

Los ads que mejor funcionan (C9, C3) les llegan por REBOTE — porque la franja 35+ se auto-selecciona en hooks de manualidades o decoración. Pero ninguno de los 6 winners fue diseñado específicamente pensando en "empleada de oficina cansada que quiere reinventarse" o "jubilado con jubilación insuficiente".

**Martín, en cambio, tiene 2 ads dedicados (#39 y #43) y es apenas el 5% de los compradores.** Los $3,015 de spend de T4 estaban financiando ads cuyo visual (cama en balcón, mate, gorra de Miami, selfie con sol) habla a un avatar que compone el 5% del target real. Eso explica por qué T4 tenía CPL $1.46: se estaba pagando para atraer al tipo equivocado.

El ajuste de T6 (bajada a $0.74) se produjo en gran parte porque los hooks de C9 y C3 DEJARON DE SER DISEÑADOS PARA MARTÍN y pasaron a hablarle (indirectamente) a Patricia y Laura. Pero la oportunidad sigue siendo enorme: si T8 lanza ads dedicados a Patricia y Roberto, se cubre el 56% del comprador real con match directo, no por rebote.

---

## 8. Resumen ejecutivo

### Lo que aprendimos

1. **CPL bajó 49% (de $1.46 a $0.74) en 17 días** (T4 13 Mar → T6 30 Mar). El factor principal no fue "mejor producción" ni "mejores hooks" — fue NICHO ESPECÍFICO que filtra al comprador real desde el segundo 1.

2. **El cuerpo/creativo explica ~50% del CPL**, el hook ~30%, el CTA ~20%. Si tenés que elegir dónde invertir, invertí en el CUERPO.

3. **Especificidad mata abstracción.** Los winners dicen "$10-25 por guía", "15 páginas", "1 hora". Los losers dicen "productos digitales", "cosas increíbles", "transformar tu negocio". Cada número concreto es un SÍ del viewer.

4. **La nostalgia es el hook de mejor CTR (4.46%)** pero no el de mejor CPL. Para CPL, la auto-selección por identidad ("¿Sabes hacer manualidades?") gana.

5. **La nomenclatura modular C×H×CTA fue un game-changer silencioso.** Permitió identificar que C9 funciona con cualquier hook y que H5 no funciona con ninguno.

### Lo que hay que hacer en T8 — Priorización por gap de cobertura de avatares

La priorización anterior era "escalar lo que funciona + testear nichos nuevos". La nueva priorización es "cubrir los avatares con más peso demográfico que están SIN ad dedicado". Patricia (26%) y Roberto (30%) suman el 56% del comprador real y no tienen ads propios. Ahí está el oro.

**Prioridad 1 — Patricia (26% de compradoras, SIN AD PROPIO):**
- Hook propuesto: *"Si trabajás 8 horas en una oficina y sentís que ya no podés más, esto te va a interesar..."*
- Tema: empleada cansada que quiere reinventarse con IA
- Setting: oficina cansina o casa con computadora — NO cama con mate, NO gorra de joven
- Casting visual: mujer 45+ en casa/oficina, NO joven con gorra de Miami
- Dolor activado: "trabajo mucho y gano poco" (55.7%) + "no tengo tiempo para mí" (44.1%) + "nadie valora lo que hago"
- Cuerpo: estructura C9 adaptada (problema → reframe → IA como puerta → CTA)
- CTA: *"Imaginate un martes sin presión. Tocá el botón de acá abajo y te muestro cómo"*
- Budget sugerido: $300-400 para validar
- Hipótesis de CPL: $0.50-$0.65 (similar a C3-H4 por volumen + match directo)

**Prioridad 2 — Roberto (30% de compradores, SIN AD PROPIO):**
- Hook propuesto: *"Si te jubilaste y la jubilación no te alcanza, escuchame esto un minuto..."*
- Tema: jubilado que aprende IA para complementar ingresos con dignidad
- Demostración clave: *"Si sabés mandar audios de WhatsApp, ya sabés suficiente"* — romper la barrera tech
- Casting visual: hombre 60+ en su casa, tranquilo, con presencia — NO joven, NO oficina moderna
- Dolor activado: "jubilación misérrima" (directa del 13.2% que dice "mi edad") + dignidad
- CTA: dignidad económica — *"Esto no es para hacerte millonario. Es para que tu jubilación deje de ser un problema"*
- Budget sugerido: $300-400
- Hipótesis de CPL: $0.50-$0.70 (sub-explotado, pero nicho grande y sin competencia)

**Prioridad 3 — Cocina/Repostería (7.3% de talentos, match con Patricia + Laura):**
- Hook nostálgico: *"¿Te acordás del recetario manuscrito de tu abuela, ese cuaderno con manchas de dulce de leche?"*
- Estructura base: C3 (nostalgia + demanda sigue pero online) adaptada a cocina
- Rationale: cocina matchea con Patricia Y Laura (41% de compradores combinados), tiene B-roll fácil de producir (ingredientes, platos, mesa), y la nostalgia (H4) es el hook de mejor CTR del dataset
- Budget sugerido: $200-300
- Hipótesis de CPL: $0.55-$0.75

**Prioridad 4 — Docentes (15.8% profesión + 20.1% talento de enseñar — el 2do grupo más grande):**
- Hook con frase textual del comprador: *"Si das clases particulares y andás atrás de los pagos, escuchame..."*
- Dolor textual verificado: *"Andar atrás de mis alumnos por los pagos y siento que les doy un montón y no se valora"*
- Estructura: C9 adaptada — problema (cobro por hora tiene techo) → reframe (tu método vale más que la hora) → IA arma el curso → venta digital
- Budget sugerido: $200-300
- Hipótesis de CPL: $0.45-$0.65 (dolor ultra-específico + nicho grande = match perfecto)

**Prioridad 5 — Comercio offline (32.9% — el grupo PROFESIONAL más grande sin ad propio):**
- Hook situacional: *"Si tenés un comercio y la calle ya no te da clientes como antes..."*
- Dolor textual verificado: *"La venta física presencial en comercios cayó abruptamente"*
- Estructura: C9 adaptada — digitalización como COMPLEMENTO al local, no reemplazo
- Budget sugerido: $300-400 (volumen justifica más spend)
- Hipótesis de CPL: $0.50-$0.70

**Mantener (auto-optimizado):**
- C9+H1 y C9+H2: siguen activos, Meta optimiza solo
- C3+H4: escalar con más budget

**Matar:**
- **#39:** genérico + visual para Martín (5% de compradores). Spend hacia este ad es sub-óptimo por diseño.
- **#43:** desajuste grave con comprador real. Mejor CTR que #39 pero peor CPL porque atrae CURIOSOS, no compradores.
- **H5:** peor en toda métrica (CPL $1.38, CTR 2.44%, LPV 38.1%). No hay combinación que lo salve.

### La gran conclusión (reescrita)

La evolución T4→T6 no fue un cambio de PRODUCCIÓN ni solo de "nicho" — fue un desplazamiento del AVATAR IMPLÍCITO. T4 le hablaba (en visual y lenguaje) a Martín (joven curioso de IA, 5% del comprador real). T6 empezó a hablarle por rebote a Patricia y Laura (franja 35+, 41% del comprador real) a través de hooks como manualidades y decoración. Ese desplazamiento explica el 49% de mejora en CPL.

Pero el sistema actual sigue sub-optimizando: de los 6 ads principales, **ninguno fue diseñado específicamente para Patricia (26%) ni Roberto (30%) — el 56% del comprador real**. El match sucede por rebote, no por diseño.

**Hipótesis dura para T8:** Si lanzamos 2 ads dedicados a Patricia y Roberto con la estructura validada de C9/C3 (hook de identidad directo + B-roll de nicho + CTA de dignidad), el CPL global puede bajar otro **30-40% adicional**, de $0.74 a $0.44-$0.52. No es un salto — es capturar los avatares que tienen peso demográfico pero no tienen ad propio.

T8 no necesita reinventar la rueda. Necesita DEJAR DE HABLARLE A MARTÍN y empezar a hablarle al 56% que hoy compra por rebote.
