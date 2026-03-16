# Jerarquía de Decisiones para Generación de Guiones

Cuando múltiples sistemas dan indicaciones contradictorias, esta jerarquía define qué gana.

---

## Nivel 1 — REGLAS DURAS (nunca se violan)

**Fuentes:** `consejos-jesus.md`, `jesus-tono-adp-nuevo.md`

Estas son prohibiciones absolutas. Si algo del nivel 2, 3 o 4 las contradice, la regla dura gana siempre.

- NUNCA "no te alcanza la plata"
- NUNCA porcentajes o datos inventados
- NUNCA inventar anécdotas de Jesús (solo `jesus-historia.md`)
- NUNCA mencionar taller ni Instagram en el cuerpo
- SIEMPRE voseo argentino
- SIEMPRE cerrar mecanismo con VENDERLO
- SIEMPRE leads de 2-3 oraciones (no hooks sueltos)
- SIEMPRE "negocios" no "trabajos"
- Lead ≠ primera sección del body

**Ejemplo de conflicto:** El motor de audiencia sugiere un lead basado en un intento fallido que dice "probé trabajos online". Se usa la frase real pero se cambia "trabajos" → "negocios".

---

## Nivel 2 — ESTRATÉGICO (define QUÉ se dice)

**Fuentes:** `motor-audiencia.md`, `angulos-expandidos.md`, `reglas-diversidad.md`

Este nivel da la **dirección** del guion. Se resuelve ANTES de escribir una sola palabra.

### Orden de resolución dentro del nivel:
1. **Reglas de diversidad** → ¿qué arcos/ingredientes/familias están prohibidos por repetición?
2. **Motor de audiencia** → de lo que queda disponible, ¿qué tensión, vocabulario y objeción usar?
3. **Ángulos expandidos** → ¿qué familia y ángulo específico encaja con la tensión elegida?

### Regla de resolución de conflictos:
- **Diversidad > Motor > Ángulo.** Si diversidad prohíbe un arco, el motor elige otro. Si el motor pide una tensión que no encaja con ningún ángulo fresco, se elige otra tensión.
- **Nunca sacrificar diversidad por "la tensión perfecta".** Hay 12 tensiones — siempre hay alternativa.

**Ejemplo de conflicto:** Motor dice "tensión T3 → arco contraste emocional", pero diversidad dice "ya usaste contraste emocional en el guion anterior". → Elegir otra tensión que permita un arco fresco (T5 → historia con giro, por ejemplo).

---

## Nivel 3 — ESTRUCTURAL (define CÓMO se dice)

**Fuentes:** `tipos-cuerpo.md`, `enciclopedia-127-ingredientes.md`, `venta-modelo-negocio.md`, `tecnicas-retencion.md`, `tecnicas-venta-emiliano.md`

Una vez que el nivel 2 definió QUÉ decir, este nivel define la forma.

### Regla de resolución:
- El **vehículo narrativo** (tipo de cuerpo) da el flujo general, pero es GUÍA, no camisa de fuerza.
- Las **técnicas de retención** (micro-loops, open loops, etc.) se inyectan DENTRO del flujo del vehículo, no lo reemplazan.
- Los **ingredientes** se eligen por duración (fórmula de piso), pero se pueden saltear categorías si el arco lo pide.
- La **venta del modelo** va DESPUÉS del mecanismo, siempre.

### Regla de resolución de conflictos:
- Si el vehículo dice "flujo: dato→evidencia→creencia nueva" pero una técnica de retención dice "meté un micro-loop acá" → el micro-loop se inyecta entre bloques del flujo.
- Si un ingrediente no encaja con el arco narrativo → se reemplaza por otro de la misma categoría. El arco manda sobre el ingrediente específico.

---

## Nivel 4 — ENRIQUECIMIENTO (agrega sabor real)

**Fuentes:** `avatar-frases-reales.md`, `inteligencia-audiencia.md`, `jesus-historia.md`, `formatos-visuales.md`

Este nivel NUNCA define la dirección ni la estructura. Enriquece lo que los niveles 2 y 3 ya decidieron.

### Regla sobre frases reales:
- **SIEMPRE usar frases reales del avatar** cuando existan para el contexto.
- Si la frase real es de un segmento distinto al elegido → **adaptar la frase al tono del segmento correcto**, manteniendo la esencia y las palabras clave.
- Si no hay frase real que encaje → escribir una nueva usando el VOCABULARIO del segmento (de `motor-audiencia.md` sección 3).
- Las frases reales son COMPLEMENTO que da autenticidad, no la base de todo lead o sección.

### Regla sobre historia de Jesús:
- SOLO citas textuales de `jesus-historia.md`. NUNCA parafrasear ni inventar.
- Si el guion no necesita historia personal de Jesús → no forzarla.

### Regla sobre formato visual:
- Se asigna al final. No afecta el texto del guion, solo las instrucciones de producción.

---

## Nivel 5 — VALIDACIÓN (filtro final)

**Fuentes:** API burned-leads, `matriz-cobertura.md`, word count targets, checklist completo

Se corre DESPUÉS de escribir. Si algo no pasa validación:
- Lead parecido a quemado → reescribir ese lead, no el guion entero.
- Word count fuera de rango → comprimir o expandir, no cambiar la estructura.
- Combinación ya cubierta en matriz → flag pero no bloquear (puede ser intencional).

---

## Flujo completo en práctica

```
1. NIVEL 2 decide dirección:
   → Diversidad dice: "no arco demo, no F#73, no familia 1"
   → Motor dice: "tensión T7 (segmento B), vocabulario B, objeción 'no tengo tiempo'"
   → Ángulos dice: "familia 3, ángulo 3.4 (comparar con empleo)"

2. NIVEL 3 estructura:
   → Vehículo: comparación de caminos (mejor para micro-creencia "camino A falla")
   → Ingredientes: A#8 + B#31 + D#49 + F#76 + G#94 + I#108
   → Venta modelo: tipo 6 (independencia geográfica)
   → Técnicas: micro-loop entre camino A y camino B

3. NIVEL 4 enriquece:
   → Avatar dice: "Laburo 10 horas y no me queda tiempo para nada"
   → Adaptar al segmento B: "Laburás todo el día y cuando llegás a tu casa..."
   → Jesus-historia: no aplica para este guion

4. NIVEL 1 filtra:
   → ¿Dice "trabajos"? → Cambiar a "negocios"
   → ¿Dato inventado? → No
   → ¿Voseo? → Sí
   → ✅ Pasa

5. NIVEL 5 valida:
   → ¿Lead quemado? → No
   → ¿Word count 125-150? → 142 ✅
   → ¿Arco distinto al anterior? → Sí ✅
```

---

## Regla meta: en caso de duda

Si dos niveles dan indicaciones contradictorias y no está claro cuál aplica:
1. **¿Viola una regla dura?** → La regla dura gana.
2. **¿Hace que el guion suene igual a otro?** → Diversidad gana.
3. **¿Ninguno de los dos?** → El que produzca un guion más ESPECÍFICO y menos genérico gana.

La especificidad siempre es la meta. Un guion específico con un arco "imperfecto" es mejor que un guion genérico con el arco "correcto".
