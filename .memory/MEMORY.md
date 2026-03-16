# Script Generator - Project Memory

## Project: Script Generator for Vertical Video Ads
- **Path:** `/Users/lean/Documents/script-generator`
- **Stack:** Next.js 15 (App Router) + Tailwind + Claude API (Sonnet 4.6 for generation, Haiku 4.5 for analysis)
- **Storage:** Local JSON files in `.data/` (briefs, generations, references, projects)
- **Port:** `localhost:3002`

## Cómo generar guiones

> **IMPORTANTE:** Siempre usar los skills. No improvisar el proceso.

- **Un guion:** Ejecutar skill `/guion` — tiene el proceso completo con todos los sistemas.
- **Plan semanal (10 guiones):** Ejecutar skill `/plan-week`
- **Post-sesión:** Ejecutar skill `/post-session`
- **Analizar referencia:** Ejecutar skill `/referencia`

Para guardar: `echo '{"brief":{...},"script":{...},"title":"..."}' | node scripts/save-generation.mjs`
URL: `http://localhost:3002/scripts/{generationId}`

## Sistemas vigentes

| Sistema | Archivo | Nota |
|---------|---------|------|
| 5 familias de ángulos | `.data/angulos-expandidos.md` | Reemplaza los 11 ángulos viejos |
| 8 tipos de cuerpo | `.data/tipos-cuerpo.md` | Con mapa de combos por familia |
| 10 ventas del modelo | `.data/venta-modelo-negocio.md` | Va después del mecanismo en el body |
| 3 bloques CTA × 6 capas | `.data/ctas-biblioteca.md` | Clase Gratuita / Taller $5 / Instagram |
| 127 ingredientes | `.data/enciclopedia-127-ingredientes.md` | Fórmula por duración |

## Estructura correcta de un guion

```
LEAD (2-3 oraciones) → CUERPO (estructura del tipo elegido) → VENTA DEL MODELO (1 de 10) → TRANSICION (Capa 1) → [CORTE] → BLOQUE CTA (capas 2-6)
```

- NO hay puente a la oferta separado — la capa OFERTA está dentro de los bloques CTA
- Los 3 bloques CTA se graban UNA vez por sesión
- Funnel: TOFU / MOFU / RETARGET (no BOFU)

## Key Architecture
- **AI Models:** Sonnet 4.6 (`claude-sonnet-4-6`) for script gen, Haiku 4.5 for reference analysis
- **Prompt caching:** System prompt + learned patterns as cached blocks (5-min TTL)
- **Streaming:** SSE via `/api/generate/stream`

## User Preferences
- Spanish (Argentine) for all UI and communication
- Prefers minimal cost, practical solutions
- Uses Claude Max plan ($100/mo) for Claude Code - no extra API cost for conversation
- API key is for the web app only
