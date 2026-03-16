# Script Generator — Instrucciones Automáticas

## Detección automática de intención

Cuando el usuario pida algo relacionado con guiones o estrategia, **ejecutar el skill correspondiente**. No improvisar el proceso — usar siempre el skill.

### Si pide un GUION (detectar: "guion", "script", "ad", "haceme uno de...", "armame un guion", "uno de fitness", "probemos con...", cualquier mención de nicho + generación)
→ **Ejecutar skill `/guion`** — tiene el proceso completo con TODOS los sistemas nuevos.

### Si pide una ESTRATEGIA SEMANAL (detectar: "estrategia", "plan de la semana", "qué grabamos", "armame 10", "qué hacemos esta semana", "siguiente semana")
→ **Ejecutar skill `/plan-week`** — tiene la matriz de diversidad y todos los sistemas nuevos.

### Si pide POST-SESIÓN (detectar: "grabamos", "ya grabé", "sesión", "marcar grabados", "métricas", "post-sesión")
→ **Ejecutar skill `/post-session`**

### Si pasa un video/link/texto para analizar (detectar: "mirá este video", "analizá esto", archivo .mp4, URL)
→ **Ejecutar skill `/referencia`**

### Si pide revisar errores o consistencia (detectar: "audit", "errores", "revisá", "algo roto", "inconsistencias")
→ **Ejecutar skill `/audit`**

### ANTES de ejecutar `/guion`
→ Correr `node scripts/preflight-guion.mjs` + audit rápido (CHECK 3+4+10+11). Si falla → PARAR.

### ANTES de ejecutar `/plan-week`
→ Correr `/audit` completo para asegurar que todo el sistema está consistente.

## Reglas permanentes

- **NUNCA delegar generación de guiones a subagentes.** Los agentes no tienen el contexto y producen guiones genéricos.
- **NUNCA generar guiones sin ejecutar el skill `/guion`.** El skill tiene el proceso completo. Si no lo seguís, el guion sale genérico.
- **NUNCA inventar datos, números o historias de Jesús.** Solo usar datos verificables y citas de jesus-historia.md.
- **Idioma:** Español argentino para todo (respuestas, guiones, planes).
- **Si el usuario dice algo ambiguo pero está en contexto de ADP**, asumir que se refiere a guiones/estrategia y actuar.

## Sistemas vigentes (NO usar versiones anteriores)

| Sistema | Archivo | Reemplaza |
|---------|---------|-----------|
| 5 familias de ángulos | `.data/angulos-expandidos.md` | Los 11 ángulos viejos |
| 5 beats micro-VSL + 8 vehículos narrativos | `.data/tipos-cuerpo.md` | Micro-creencias sueltas + tipos de cuerpo como estructura |
| 10 ventas del modelo | `.data/venta-modelo-negocio.md` | No existía |
| 3 bloques CTA (6 capas) | `.data/ctas-biblioteca.md` | Los 3 CTAs genéricos de 1 frase |
| 127 ingredientes | `.data/enciclopedia-127-ingredientes.md` | No existía |
| **Reglas de diversidad** | **`.data/reglas-diversidad.md`** | **Guiones que sonaban todos iguales** |
| **Motor de audiencia** | **`.data/motor-audiencia.md`** | **Data de WhatsApp sin activar** |
| **Jerarquía de decisiones** | **`.data/jerarquia-decisiones.md`** | **No había regla de qué sistema gana en conflictos** |
| **Auto-brief (anti-genérico)** | **`lib/ai/auto-brief.ts`** | **Claude elegía defaults genéricos cuando no había brief detallado** |
| **Angle Discovery** | **`lib/ai/angle-discovery.ts`** | **Ángulos se elegían a mano — ahora se descubren de Google Suggest × cobertura** |

## Sistema auto-brief (anti-genérico)

Cuando el usuario no especifica ángulo, cuerpo, segmento, funnel o venta del modelo, el sistema los elige AUTOMÁTICAMENTE basándose en la matriz de cobertura (lo menos usado gana). Esto está en `lib/ai/auto-brief.ts` y se inyecta como restricción dura en el prompt.

**El auto-brief ahora usa Angle Discovery** (`lib/ai/angle-discovery.ts`) para enriquecer cada generación con un nicho + big idea basado en búsquedas reales de Google Suggest. Los ángulos se rankean por: volumen de búsqueda × gaps de cobertura × novedad. El research se puede refrescar con `POST /api/research/refresh` o `node scripts/research-angles.mjs`.

**Lo único que NO se auto-selecciona es la emoción dominante** — se rota aleatoriamente entre 8 arcos emocionales. El usuario puede forzarla con `[EMOCIÓN: miedo → alivio]` en las notas.

**El usuario puede overridear cualquier campo** con tags en additionalNotes:
- `[ÁNGULO: confrontacion]`, `[CUERPO: demolicion_mito]`, `[SEGMENTO: C]`
- `[FUNNEL: RETARGET]`, `[VENTA: matematica_simple]`, `[EMOCIÓN: indignación → determinación]`

**6 validaciones post-generación** aseguran que el output no sea genérico:
1. Ingredientes prohibidos (máx 1 de F#73/F#74/G#90/B#29)
2. Hooks saturados bloqueados (>25% = prohibido)
3. Nichos de 1 palabra prohibidos
4. Anti-decay (últimos hooks = misma calidad que los primeros)
5. CTAs forzados desde `ctas-activos.json`
6. Body type validado determinísticamente (estructura debe matchear el tipo)

## Regla anti-repetición (P0)

**Si 2 guiones suenan igual, el sistema falló.** Consultar `.data/reglas-diversidad.md` SIEMPRE al generar.
- 8 arcos narrativos distintos — rotar obligatoriamente
- Patrones prohibidos como default (arco demo, frases muleta, ingredientes gastados)
- Ingredientes frescos a priorizar
- Categorías opcionales (se pueden saltear según el arco)

## Estructura correcta de un guion (micro-VSL de 5 beats)

```
LEAD (5-8s) → Beat 1: Identificación (12-18s) → Beat 2: Quiebre (12-18s) → Beat 3: Mecanismo (15-20s) → Beat 4: Demolición (10-15s) → Beat 5: Prueba (10-15s) → VENTA DEL MODELO (2-3 oraciones) → TRANSICION (Capa 1) → [CORTE] → BLOQUE CTA (capas 2-6)
```

### Arquitectura micro-VSL (principio organizador)
1. Definir la **creencia central** (la UNA cosa que hace la venta inevitable)
2. Definir **5 beats**, cada uno con una **función persuasiva** distinta y una **micro-creencia**:
   - **Identificación** → "Este problema es MÍO" (Acto 2 Benson)
   - **Quiebre** → "Lo que creía está mal" (Acto 3a)
   - **Mecanismo** → "Existe un camino nuevo" (Acto 3b)
   - **Demolición** → "Mi excusa no aplica" (Acto 4)
   - **Prueba** → "Gente como yo ya lo hizo" (Acto 3 casos)
3. Elegir el **vehículo narrativo** que da el TONO a los beats (la estructura es fija, el tono es variable)
4. **Duración mínima: 75 segundos** (para que entren los 5 beats cómodamente)
5. Por duración: 45-60s = 3 beats, 60-75s = 4 beats, 75-90s = 5 beats

- NO hay "puente a la oferta" separado — la capa OFERTA ya está dentro de los bloques CTA
- Los 3 bloques CTA se graban UNA vez por sesión y se combinan con cualquier body
- La transición (Capa 1) se graba con el body
