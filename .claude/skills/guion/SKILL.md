---
name: guion
description: Genera guiones de ads para Jesús Tassarolo (ADP). Usar cuando el usuario pide crear un guión, script o ad.
argument-hint: [nicho] [segmento]
---

# Generador de Guiones — ADP (Jesús Tassarolo)

Generá un guión de ad para Jesús siguiendo TODAS estas reglas. El argumento indica el nicho y/o segmento. Si no se especifica, elegí uno nuevo que no se haya usado recientemente.

## Paso 1: Leer contexto

Leé estos archivos antes de generar:
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-adp.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/consejos-jesus.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-tono-adp-nuevo.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/tecnicas-retencion.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/tecnica-analogia-franco-piso.md`
- `!cat /Users/lean/.claude/projects/-Users-lean-Documents/memory/tecnicas-venta-emiliano.md`

## Paso 2: Elegir Big Idea de nicho

Cada guión gira alrededor de UNA idea de nicho específica, NO del concepto genérico "productos digitales con IA".
- MAL: "Podés crear productos digitales con IA"
- BIEN: "Si sabés cocinar, la IA te arma un recetario y lo vendés"

El nicho viene del argumento $ARGUMENTS. Si no se especifica, elegí uno nuevo.

## Paso 3: Generar el guión

### Estructura OBLIGATORIA (en este orden):

**LEADS (5 variantes)**
- Cada lead: 2-3 oraciones que trabajan juntas
- Estructura: [Abrir gap] + [Negar respuesta obvia] + [Puente al cuerpo]
- Cada lead DEBE ser genuinamente diferente y original
- NUNCA usar fórmulas quemadas ("Todo el mundo dice X. No es así.")
- Cada lead debe conectar naturalmente con el mismo cuerpo
- El último movimiento del lead debe servir como puente natural al cuerpo

**CUERPO (1 solo, universal)**
- Funciona solo, sin depender de ningún lead específico
- Primero se piensa el cuerpo, después los leads
- Debe cambiar una creencia LIGADA AL MECANISMO (no motivacional)
- Secciones internas con función específica, no un bloque monolítico
- Usar micro-loops entre secciones ("Y acá es donde se pone interesante...")
- Cada frase justificada, todo conectado narrativamente
- Especificidad extrema (números concretos, no generalidades)
- Cuando mencione los pasos, que quede claro que la IA hace el trabajo

**CTAs (4 variantes, cada uno diferente)**
1. Clase gratuita
2. Taller $5 (con ancla de precio: "menos que un café")
3. Comentar palabra clave
4. Link en bio

### Tono de Jesús (OBLIGATORIO):
- Voseo argentino ("tenés", "podés", NUNCA "tú")
- Muletillas: "La realidad es que...", "¿Me explico?", "Básicamente"
- Ultra informal, como hablando con un amigo
- Cierre cálido: "Te mando un abrazo"
- Posicionamiento: "ingreso extra" (NUNCA "hacete rico")
- Frases fórmula: "Lo creás una sola vez y lo vendés infinitas veces"

### Errores PROHIBIDOS:
- NUNCA "no te alcanza la plata" como hook
- NUNCA porcentajes en hooks
- NUNCA inventar anécdotas de Jesús
- NUNCA "trabajos", siempre "negocios"
- NUNCA "millones", usar "miles" o "cientos"
- NUNCA leads motivacionales que alejen de la compra
- NUNCA prometer más de "$2000-3000 dólares por mes"

## Paso 4: Presentar al usuario

Mostrar el guión completo en formato markdown:
- ## LEADS (numerados con tipo entre paréntesis)
- ## CUERPO
- ## CTAs (numerados con tipo entre paréntesis)

## Paso 5: Guardar (solo si el usuario aprueba)

Cuando el usuario diga que lo guarde, usar el schema de `script-generator-schema.md` y guardar con:
```bash
echo '{"brief":{...},"script":{...}}' | node scripts/save-generation.mjs
```
Dar la URL al usuario: `http://localhost:3000/scripts/{generationId}`
