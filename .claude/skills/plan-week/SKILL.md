---
name: plan-week
description: Arma la estrategia semanal de 10 guiones para Jesús (ADP). Usar cuando el usuario pide planificar la semana.
argument-hint: [fecha de la semana, ej. 2026-03-18]
---

# Plan Semanal — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación de guiones a subagentes.** Planificar la semana en el contexto principal, generar cada guion uno por uno con toda la información cargada.

## Paso 0: Pre-flight + Audit + Jerarquía (IGUAL que /guion)

### 0a. Extraer winner patterns + session insights:
```bash
node scripts/extract-winner-patterns.mjs
node scripts/extract-session-insights.mjs
```
Actualiza `.data/winner-patterns.md` y `.data/session-insights.md`.
**Los winner patterns informan QUÉ generar:** si un tipo de lead/ángulo/body type funciona, hacer más (sin repetir).
**Las session insights informan QUÉ evitar:** si Jesús dijo "esto no fluye", no planificar más de eso.

### 0b. Audit COMPLETO (todos los checks):
Correr `/audit` — los 12 checks. Si hay errores críticos → corregir antes de planificar.

### 0c. Jerarquía de decisiones:
Leer `.data/jerarquia-decisiones.md`:
- **Reglas duras > Diversidad > Motor audiencia > Estructura > Enriquecimiento**
- Frases reales del avatar: SIEMPRE usar, adaptar al segmento si es necesario
- En caso de duda: el camino más ESPECÍFICO gana

## Paso 1: Leer contexto completo

### Archivos de contexto (SIEMPRE):
1. `estrategia-semanal.md` — Reglas de composición del plan
2. `matriz-cobertura.md` — Qué combinaciones están cubiertas
3. `jesus-adp.md` — Producto, audiencia, tracking
4. `formatos-visuales.md` — Formatos y regla de selección
5. `consejos-jesus.md` — Reglas duras
6. `inteligencia-audiencia.md` — Data de audiencia
7. `avatar-frases-reales.md` — Verbatims reales del avatar
8. `jesus-tono-adp-nuevo.md` — Tono y muletillas de Jesús
9. `jesus-historia.md` — Historia real, citas (para planificar guiones de storytelling)
10. `tecnicas-retencion.md` — Para saber qué técnicas asignar a cada guion
11. `tecnicas-venta-emiliano.md` — Para elegir técnicas de venta por guion

### Archivos de SISTEMAS NUEVOS (OBLIGATORIOS):
12. `.data/angulos-expandidos.md` — 5 familias de ángulos con reglas de diversidad
13. `.data/tipos-cuerpo.md` — 8 vehículos narrativos con mapa de micro-creencias
14. `.data/venta-modelo-negocio.md` — 10 tipos de venta del modelo
15. `.data/ctas-biblioteca.md` — 3 bloques CTA de 6 capas
16. `.data/enciclopedia-127-ingredientes.md` — 127 ingredientes
17. `.data/reglas-diversidad.md` — **CRÍTICO:** 8 arcos narrativos, patrones prohibidos, checklist de diversidad
18. `.data/motor-audiencia.md` — **OBLIGATORIO:** Tensiones→arcos, objeciones→guiones, vocabulario por segmento, intentos fallidos→leads, señales de compra, micro-yes, triggers→ingredientes
19. `.data/jerarquia-decisiones.md` — 5 niveles de prioridad para resolver conflictos

### Archivos de DATA REAL (condicionales pero leer si existen):
20. `.data/winner-patterns.md` — Qué combinaciones funcionaron → sesgar el plan hacia ellas
21. `.data/session-insights.md` — Feedback de Jesús → evitar lo que no funcionó, repetir lo que sí

## Paso 2: Chequear leads quemados

```bash
node scripts/preflight-guion.mjs | python3 -c "import sys,json; d=json.load(sys.stdin); b=d['burned_leads']; print(f'Total quemados: {b[\"total\"]}'); [print(f'  {l[\"hookType\"]}: {l[\"text\"]}') for l in b['leads'][:20]]"
```
Usa el preflight (no depende de la web). Muestra los primeros 20 de los 50 quemados.

## Paso 3: Generar big ideas desde Trends + Research

**Google Trends es la fuente principal de big ideas nuevas.** No es para validar nichos — es para DESCUBRIR ángulos.

1. Correr `node scripts/trends-scan.mjs` → scan completo: base keywords + 15 nichos + rising queries
2. Correr `node scripts/preflight-guion.mjs` → quick scan: 3 nichos frescos + rising queries (complementa el scan completo con nichos que trends-scan no tiene)
3. Por cada dato interesante, generar big ideas cruzando con las 5 familias:
   - Un trending topic × F1/F2/F3/F4/F5 = 5 big ideas potenciales
3. Priorizar rising queries (están creciendo AHORA)
4. Cada big idea candidata se convierte en un guion potencial

**Ejemplo:** "jardinería urbana" está subiendo →
- F2: "Miles buscan cómo armar un huerto en un balcón y nadie vende una guía"
- F3: "Gastás en plantitas que se te mueren. ¿Y si alguien te pagara por enseñarle a que no se le mueran?"
- F1: "Sos de las que tiene 40 plantas en el departamento. Eso que hacés por hobby vale plata"

**Objetivo:** Generar 20-30 big ideas candidatas, elegir las 10 mejores para la semana.

## Paso 4: Activar motor de audiencia

Consultar `.data/motor-audiencia.md` para:
1. **Asignar tensiones emocionales** — cada guion debe tener una tensión distinta (12 disponibles, usar mín 6 de 12 en 10 guiones)
2. **Distribuir segmentos con vocabulario real** — usar las palabras EXACTAS de cada segmento
3. **Incorporar objeciones** — al menos 2 de 10 guiones atacan una objeción (de las 6 del motor)
4. **Leads de intentos fallidos** — al menos 3 de 50 leads totales (5×10) vienen de la tabla de intentos fallidos
5. **Triggers de engagement** — variar triggers entre guiones, no siempre los mismos

## Paso 5: Detectar huecos

**NOTA: El sistema auto-brief (`lib/ai/auto-brief.ts`) ya hace esta detección automáticamente** al generar cada guion. Elige lo menos usado de cada dimensión (ángulo, cuerpo, segmento, funnel, venta del modelo). Para el plan semanal, igualmente conviene hacer la detección manual para tener una visión de alto nivel y asignar combinaciones estratégicamente en vez de dejar que el auto-brief elija una por una.

De la matriz de cobertura + ángulos expandidos, identificar:
- **Familias de ángulo** sin cubrir o con < 2 guiones
- **Ángulos específicos** saturados (1.1 Mamá 5+, 3.1 IA desperdiciada 8+)
- **Ángulos frescos** a priorizar (2.2, 2.4, 3.2, 3.4, 4.5, 4.6)
- **Tipos de cuerpo** sin usar (mín 5 de 8 en 10 guiones)
- **Ventas del modelo** sin usar (nunca repetir consecutiva)
- **Segmentos** subrepresentados (A/B/C/D)
- **Funnels** sin cubrir (TOFU/MOFU/RETARGET)
- **Nichos** nuevos que nunca se usaron
- **Tipos de lead** sin usar

## Paso 6: Elegir 2 formatos visuales

De formatos-visuales.md:
- **2 formatos que NO se usaron en las últimas 4 semanas**
- 5 guiones en Formato A + 5 guiones en Formato B
- Incluir instrucciones de producción

## Paso 7: Armar los 10 guiones (matriz)

### Reglas de diversidad OBLIGATORIAS (ver `reglas-diversidad.md` para detalle completo):

**Dimensiones estructurales:**
| Regla | Requisito |
|-------|-----------|
| **5 familias** | Todas representadas (2 por familia) |
| **Ángulos** | NUNCA repetir el mismo ángulo específico |
| **Consecutivos** | NUNCA 2 guiones seguidos de la misma familia |
| **Vehículos** | Mínimo 5 distintos de 8 |
| **Venta del modelo** | Mín 6 distintos, matemática simple máx 2, ventana oportunidad máx 1 |
| **Segmentos** | Mín 3 de 4 cubiertos |
| **Funnels** | Mín 5 TOFU + 2 MOFU + 1 RETARGET |
| **Nichos** | Todos distintos, NUNCA repetir |

**Dimensiones de diversidad (NUEVAS — anti-repetición):**
| Regla | Requisito |
|-------|-----------|
| **Arcos narrativos** | Mínimo 5 arcos distintos de 8. Arco demo máximo 2. |
| **Guiones sin demo** | Mínimo 3 de 10 sin ninguna demo/proceso |
| **Ingredientes** | Combinación B+D+F+G diferente en cada guion. F#73/F#74/G#90 máx 3 de 10. |
| **Ingredientes frescos** | Mínimo 3 guiones con ingredientes nunca usados |
| **Frases muleta** | Cada frase de la lista prohibida → máx 1 uso en todo el batch |
| **Ventana de IA** | Máximo 2 de 10 como contexto central |
| **Energía/tono** | Mezclar: confrontativo (mín 2), empático, curioso, urgente. Mín 1 vulnerable. |
| **Ritmo** | Mín 2 con ritmo rápido (Q&A, lista) vs lento (historia, analogía) |

### Sesgar con winner patterns (si existen):
- Si `.data/winner-patterns.md` muestra que un tipo de lead tiene más winners → incluir 2-3 guiones con ese tipo (sin exceder diversidad)
- Si un body type o ángulo nunca fue recorded/winner → no descartar, pero priorizarlo menos que uno validado
- Si session insights dicen "X no fluye" → evitar esa combinación
- **Winner patterns INFORMAN, no MANDAN** — diversidad sigue siendo la regla #1

### Para cada guion definir:
- # | Título | Familia | Ángulo | Vehículo | **Arco** | Venta modelo | Segmento | Funnel | Nicho | Formato | **Tensión**
- **Creencia central** y **5 beats con funciones persuasivas** (identificación, quiebre, mecanismo, demolición, prueba)
- **Micro-creencia por beat** — cada beat instala 1 MC con función distinta
- **Ingredientes clave** (con números específicos — NO siempre los mismos)
- El vehículo se elige DESPUÉS de los beats, usando la tabla de `tipos-cuerpo.md`
- **Duración objetivo: 75-90 segundos** (mínimo 75s para micro-VSL completo de 5 beats)

### Checklist de diversidad (correr ANTES de generar)
```
□ ¿Hay al menos 5 arcos narrativos distintos?
□ ¿Máximo 2 usan el "arco demo"?
□ ¿Mínimo 3 guiones NO tienen demo/proceso?
□ ¿Cada guion tiene combinación de ingredientes diferente?
□ ¿Se usan al menos 3 ingredientes NUNCA usados antes?
□ ¿Las frases muleta aparecen máximo 1 vez cada una?
□ ¿La "ventana de IA" aparece en máximo 2?
□ ¿Hay mínimo 6 ventas del modelo distintas?
□ ¿Hay variedad de energía y tono?
□ ¿Al menos 1 guion es puro storytelling (sin demo)?
□ ¿Al menos 1 guion es pura emoción (sin datos)?
□ ¿Al menos 1 guion tiene ritmo rápido?
□ ¿Se usan mín 6 tensiones emocionales distintas (de 12)?
□ ¿Al menos 2 guiones atacan una objeción del motor?
□ ¿Al menos 3 leads totales vienen de intentos fallidos?
□ ¿El vocabulario de cada guion corresponde a su segmento?
```

#### Planificación de copies (Ad Factory)
Para cada guion del plan, pre-asignar la estructura de copy ideal usando la Angle-to-Structure Matrix (`.data/copy-engine-ads.md` sección 12):
- Verificar que los 10 guiones resulten en al menos 5 estructuras de copy DIFERENTES
- Priorizar: Storytelling (3-4), Testimonio (1-2), Math-based (1), Contrarian (1), Listicle (1), otros (1-2)
- Anotar en la tabla del plan: columna "Copy Structure" con la estructura sugerida
- Después de grabar cada guion, ofrecer generar el ad copy con `/ad-copy`

## Paso 8: Elegir 3 bloques CTA para la sesión

De `ctas-biblioteca.md`, elegir 1 variante por canal:
1. **Clase Gratuita** — Variante A/B/C/D (distintas a la semana anterior)
2. **Taller $5** — Variante A/B/C/D
3. **Instagram** — Variante A/B/C/D

NUNCA repetir misma variante 2 semanas seguidas.

## Paso 9: Orden de grabación

Sugerir orden basado en:
1. Arrancar con energía (TOFU confrontativos)
2. Formato A agrupado, Formato B agrupado (no mezclar)
3. Storytelling/personal cuando esté caliente
4. Cerrar con tono más calmo
5. 3 bloques CTA al final (se graban 1 vez)

Total grabaciones: 10 bodies con transición + 3 bloques CTA = 13

## Paso 10: Presentar al usuario

1. **Trends usados** — qué nichos estaban subiendo, qué rising queries se aprovecharon
2. **Winner patterns aplicados** — qué decisiones se sesgaron por data real
3. **Tabla de 10 guiones** (todos los campos incluyendo tensión emocional)
4. **Cobertura lograda** (familias, body types, ventas, segmentos, funnels, tensiones, arcos)
5. **3 bloques CTA** elegidos
6. **Orden de grabación**
7. **Huecos cubiertos** vs semana anterior

**Nota:** Cada guion incluye estructura de copy sugerida (Angle-to-Structure Matrix) para generar el ad copy después de grabar.

## Paso 11: Generar los guiones

Cuando el usuario apruebe, generar **UNO POR UNO** usando el proceso completo del skill `/guion`.

Cada guion debe tener: 5 beats micro-VSL (con persuasion_function + micro_belief) + venta del modelo + transición + 5 leads + 3 bloques CTA. Duración mínima: 75 segundos.

**Cada guion pasa por el humanizer (paso 9b de /guion)** antes de presentar. Los 10 patrones anti-IA + 6 checks de voz de Jesús se corren en CADA guion, no solo en el primero.

Guardar cada uno y dar URL. Mostrar al usuario para aprobación ANTES de pasar al siguiente.

**NUNCA generar los 10 en paralelo.** Siempre secuencialmente.

## Paso 12: Guardar plan

Guardar en `.data/plans/semana-FECHA/plan.md` con la matriz completa.
