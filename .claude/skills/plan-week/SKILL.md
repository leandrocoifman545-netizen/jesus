---
name: plan-week
description: Arma la estrategia semanal de 10 guiones para Jesús (ADP). Usar cuando el usuario pide planificar la semana.
argument-hint: [fecha de la semana, ej. 2026-03-18]
---

# Plan Semanal — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación de guiones a subagentes.** Planificar la semana en el contexto principal, generar cada guion uno por uno con toda la información cargada.

## Paso 1: Leer contexto completo

Leer TODOS estos archivos antes de planificar:

1. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/estrategia-semanal.md` — Reglas de composición del plan
2. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/matriz-cobertura.md` — Qué combinaciones están cubiertas
3. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-adp.md` — Ángulos, segmentos, funnel, tracking
4. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/formatos-visuales.md` — Formatos y regla de selección
5. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/consejos-jesus.md` — Reglas duras
6. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/inteligencia-audiencia.md` — Data de audiencia

## Paso 2: Correr research (si hay script disponible)

```bash
node scripts/research-angles.mjs 2>/dev/null || echo "Research script no disponible, usar datos existentes"
```

## Paso 3: Detectar huecos

De la matriz de cobertura, identificar:
- **Ángulos sin usar o con < 2 guiones**
- **Segmentos subrepresentados** (A/B/C/D)
- **Tipos de funnel sin cubrir** (TOFU/MOFU/RETARGET/EVERGREEN)
- **Tipos de cuerpo sin cubrir** (mecanismo, idea de nicho, storytelling, analogía, comparación, anti-gurú)
- **Frameworks poco usados** (rotar, no repetir PAS en exceso)
- **Nichos nuevos** que nunca se usaron
- **Tipos de lead sin usar** (priorizar tipos frescos)

## Paso 4: Elegir 2 formatos visuales

De formatos-visuales.md:
- **2 formatos que NO se usaron en las últimas 4 semanas**
- Al menos 1 diferente de Talking Head
- 5 guiones en Formato A + 5 guiones en Formato B
- Incluir instrucciones de producción para cada formato

## Paso 5: Armar los 10 guiones (plan)

Para cada guion definir:
- **#** (1-10)
- **Título descriptivo**
- **Ángulo** (con justificación de gap)
- **Segmento** (A/B/C/D)
- **Funnel** (TOFU/MOFU/RETARGET/EVERGREEN)
- **Tipo de cuerpo**
- **Framework**
- **Nicho específico** (NO repetir nichos entre guiones)
- **Formato visual** (A o B)
- **Cambio de creencia** (creencia vieja → nueva)

### Reglas de composición:
- Mínimo 5 TOFU, 2 MOFU, 1 RETARGET o EVERGREEN
- Mínimo 3 segmentos distintos cubiertos
- No más de 2 guiones con el mismo ángulo
- No más de 2 guiones con el mismo framework
- Cada nicho debe ser ÚNICO (no repetir)
- Justificar cada elección con datos (keywords, scores, gaps)

## Paso 6: Definir CTAs de la semana

Los 3 CTAs genéricos (ver consejos-jesus.md) + excepciones por funnel si aplica.

## Paso 7: Programar tests

Definir 2-3 tests A/B:
- **Test de lead**: 1 guion con leads radicalmente distintos → subir como ads separados → medir CTR por lead
- **Test de ángulo**: 2 guiones con mismo segmento, ángulos distintos → medir hook rate
- **Test de funnel**: TOFU vs MOFU o RETARGET → medir CPA

## Paso 8: Orden de grabación

Sugerir orden de grabación basado en:
1. Arrancar con energía (TOFU fríos)
2. Escalar emoción gradualmente
3. Storytelling/personal cuando esté caliente
4. MOFU intensos en el medio-final
5. RETARGET/EVERGREEN al final (más cortos, menos presión)

## Paso 9: Presentar al usuario

Formato del plan:
1. **Resumen de datos** (research, generaciones previas, batch)
2. **Objetivos de la semana** (qué gaps se cubren y por qué)
3. **Formatos visuales** (2, con descripción)
4. **CTAs de la semana**
5. **Tabla de 10 guiones** (con todos los campos)
6. **Tests programados**
7. **Orden de grabación**
8. **Resumen ejecutivo para Jesús** (2-3 párrafos, directo)

## Paso 10: Guardar y generar

Guardar plan en `.data/plans/semana-FECHA.md`.

Cuando el usuario apruebe, generar los 10 guiones **UNO POR UNO** usando el skill `/guion` internamente (leer todos los archivos para CADA guion). Agruparlos en un batch con nombre "Semana DD Mmm YYYY".

**NUNCA generar los 10 guiones en paralelo con agentes.** Siempre secuencialmente, en el contexto principal, con toda la información cargada.
