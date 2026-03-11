---
name: guion
description: Genera guiones de ads para Jesús Tassarolo (ADP). Usar cuando el usuario pide crear un guión, script o ad.
argument-hint: [nicho] [ángulo] [segmento] [funnel] [formato]
---

# Generador de Guiones — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación de guiones a subagentes.** Los agentes no tienen el contexto completo y producen guiones genéricos. Siempre generar en el contexto principal.

## Paso 1: Leer TODOS estos archivos (NO OPCIONAL)

Antes de escribir una sola palabra, leer cada uno de estos archivos. Si no los leés, el guion va a salir genérico.

1. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-adp.md` — Producto, ángulos, segmentos, funnel, tracking
2. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/consejos-jesus.md` — Reglas duras, tipos de lead, estructura
3. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-tono-adp-nuevo.md` — Muletillas, vocabulario, tono
4. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/jesus-historia.md` — Historia real, citas quotables (NUNCA inventar)
5. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/avatar-frases-reales.md` — Verbatims reales de 8,074 leads
6. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/inteligencia-audiencia.md` — Dolores, deseos, miedos reales
7. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/tecnicas-retencion.md` — Micro-loops, especificidad, open loops
8. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/tecnicas-venta-emiliano.md` — 12 técnicas de venta
9. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/formatos-visuales.md` — Formatos y sus instrucciones de producción
10. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/script-generator-schema.md` — JSON schema para guardar

Si el cuerpo es analogía, leer también:
11. `!read /Users/lean/.claude/projects/-Users-lean-Documents/memory/tecnica-analogia-franco-piso.md`

## Paso 2: Chequear leads quemados

```bash
curl -s http://localhost:3000/api/burned-leads | python3 -c "import sys,json; [print(l['text'][:80]) for l in json.load(sys.stdin)['leads']]" 2>/dev/null || echo "No se pudieron obtener leads quemados"
```

No generar leads parecidos a los quemados (mismo ángulo + misma estructura = quemado).

## Paso 3: Definir QUÉ generar

Del argumento $ARGUMENTS o del contexto, definir:
- **Nicho específico** (cocina, crianza, fitness, etc.) — OBLIGATORIO, nunca genérico
- **Ángulo** (de los 11 disponibles en jesus-adp.md)
- **Segmento** (A/B/C/D)
- **Funnel** (TOFU/MOFU/BOFU/RETARGET/EVERGREEN)
- **Tipo de cuerpo** (mecanismo, idea de nicho, cambio de creencia, storytelling, analogía, comparación, anti-gurú)
- **Framework** (PAS, BAB, HSO, AIDA, 3_Acts, Analogía_Giro, Cambio de creencia)
- **Formato visual** (de formatos-visuales.md, con instrucciones de producción)
- **Cambio de creencia** (creencia vieja → mecanismo → creencia nueva)

Si no se especifica, consultar `matriz-cobertura.md` para elegir combinaciones sin cubrir.

## Paso 4: Escribir el CUERPO primero

Regla: el cuerpo funciona SOLO, sin leads. Primero el cuerpo, después los leads.

### Duración y word count:
- 15s = 30-40 palabras
- 30s = 65-85 palabras
- 45s = 95-115 palabras
- 60s = 125-150 palabras

### Checklist del cuerpo:
- [ ] Cambio de creencia EXPLÍCITO ligado al mecanismo (no motivacional)
- [ ] Secciones internas con función específica (no bloque monolítico)
- [ ] Micro-loops entre secciones ("Pero acá viene lo importante...", "Y lo que no sabía era...")
- [ ] Especificidad extrema (números concretos: "$25 dólares", "40 mil búsquedas", "en una tarde")
- [ ] Re-hook obligatorio entre segundo 10-15 si video > 20s
- [ ] Muletillas de Jesús rotadas (no repetir la misma en el mismo guion)
- [ ] Voseo argentino (NUNCA "tú")
- [ ] Frase fórmula al menos 1 ("Lo creás una vez y se vende solo", "Vos ponés las ideas, la IA pone el laburo")
- [ ] Show don't tell: escena visual o ejemplo concreto, no afirmaciones abstractas
- [ ] Open loop que se cierra más adelante
- [ ] NO referencia al taller ni a Instagram en el cuerpo (CTAs son genéricos y separados)
- [ ] El proceso de 3 pasos de Jesús mencionado (investigar, crear con IA, vender)
- [ ] Si usa historia de Jesús: SOLO citas reales de jesus-historia.md

### Técnicas de retención a aplicar (de tecnicas-retencion.md):
- Micro-loops como pegamento entre secciones
- Transiciones adversativas ("Pero...", "Lo que no sabía era...")
- NUNCA transiciones que anuncian ("Ahora voy a explicar...", "Bueno, la cosa es que...")
- Arranque sin fricción (cero pausa, cero "Hola", cero saludos)
- Densidad de valor (si podés decirlo en 5 palabras, no uses 10)

### Técnicas de venta a considerar (de tecnicas-venta-emiliano.md):
- Comparación de precio como ancla ("menos que una pizza", "un café")
- Anti-expertise como prueba social inversa
- Show don't tell con escena visual concreta
- Costo de la inacción (qué cuesta NO hacer nada)
- Anti-gurú como posicionamiento (si corresponde)
- Cierre "dos versiones" sin presión (si corresponde)

## Paso 5: Escribir los LEADS (5 variantes)

Cada lead = 2-3 oraciones que trabajan juntas:
1. Abrir gap de curiosidad
2. Negar la respuesta obvia
3. Puente al cuerpo

### Tipos de lead (usar 5 distintos, NUNCA repetir tipo):
1. Situación específica — Pintar momento concreto del avatar
2. Dato/hecho concreto — Algo verificable y sorprendente
3. Pregunta incómoda — Que el avatar no se animó a hacer
4. Confesión/vulnerabilidad — Arrancar desde la honestidad
5. Contraintuitivo — Contradice lo esperado
6. Provocación con especificidad — Atada al nicho
7. Historia mini (2 oraciones) — In media res
8. Analogía cotidiana — Objeto conocido como puerta
9. Negación directa — Lo que NO es
10. Observación de tendencia — Algo que pasa ahora
11. Simplificación + error en paso clave
12. Timeline + provocación
13. Error + categorización
14. Actuación/diálogo
15. Contrato/compromiso

### Enriquecimiento de leads:
- Usar verbatims reales de avatar-frases-reales.md (frases textuales como complemento, no como base)
- Usar datos de inteligencia-audiencia.md (dolores, deseos, miedos)
- Usar perfiles reales (mamá en casa, oficinista, jubilado, conductora Uber, inmigrante)

### Prohibiciones en leads:
- NUNCA "no te alcanza la plata" como gancho
- NUNCA porcentajes ("el 99% comete este error")
- NUNCA patrón "Todo el mundo dice X. No es así." (requemado)
- NUNCA "millones" (usar "miles" o "cientos")
- NUNCA leads motivacionales sin mecanismo

## Paso 6: Asignar CTA

Los CTAs son genéricos y separados del cuerpo. Hay 3 opciones fijas:

**CTA 1 — Directo:**
> Tocá el botón de acá abajo y registrate a la clase gratuita. Te muestro en vivo cómo crear tu primer producto digital con IA. Te veo adentro. Abrazo.

**CTA 2 — Con taller $5:**
> Tocá el botón de acá abajo y registrate. La clase es gratis. No te pido plata, no te pido experiencia. Solo una hora para que veas cómo funciona. Y si después querés crear tu producto conmigo, hay un taller de 3 días que vale menos que una pizza. Vos decidís. Te mando un abrazo y te veo adentro.

**CTA 3 — Instagram:**
> Comentá "CLASE" y andá al link de mi perfil porque ahí te podés registrar a la clase gratuita donde te enseño paso a paso crear tu primer producto digital con IA y cómo conseguir tus primeras ventas.

Excepciones por funnel:
- MOFU: puede apuntar al taller $5 directamente
- RETARGET: puede apuntar a entrar a la clase en vivo
- EVERGREEN: puede apuntar al low ticket $17

## Paso 7: Validar REGLAS DURAS (checklist final)

Antes de mostrar al usuario, verificar TODO:
- [ ] Leads son 2-3 oraciones (no hooks de 1 frase)
- [ ] Todos los leads conectan con el mismo cuerpo
- [ ] NUNCA "no te alcanza la plata" como hook
- [ ] "Negocios" no "trabajos"
- [ ] Sin porcentajes inventados
- [ ] Sin referencia al taller ni Instagram en el cuerpo
- [ ] Cambio de creencia explícito y construido (no solo "es fácil")
- [ ] Re-hook si video > 20s
- [ ] Word count dentro del rango
- [ ] Formato visual asignado con instrucciones de producción
- [ ] Muletillas de Jesús usadas y rotadas
- [ ] Voseo argentino en TODO
- [ ] Especificidad: hay al menos 3 números concretos en el guion
- [ ] Nicho específico, no genérico
- [ ] Si usa historia de Jesús: verificar que las citas están en jesus-historia.md

## Paso 8: Presentar al usuario

Mostrar en markdown:
1. **Metadata**: nicho, ángulo, segmento, funnel, formato, cambio de creencia
2. **LEADS** (5, numerados con tipo entre paréntesis)
3. **CUERPO** (con secciones internas nombradas)
4. **CTA** (indicar cuál de los 3 se sugiere)

## Paso 9: Guardar (solo si el usuario aprueba)

Usar schema de script-generator-schema.md. Guardar con:
```bash
echo '{"brief":{...},"script":{...},"title":"...","projectId":"cc4a21a0-fe0f-464e-9a91-ea0091b31ff2"}' | node scripts/save-generation.mjs
```

Si es parte de un batch, agregar `"batch":{"id":"...","name":"..."}`.

Dar URL: `http://localhost:3000/scripts/{generationId}`
