# Skill: Ad Copy — Generar Copy de Meta Ads

> Genera el texto completo para un anuncio de imagen en Meta Ads: headline + descripción + texto principal.
> Puede partir de un guion existente o generarse desde cero.

---

## Cuándo usar este skill

- Después de generar un guion con `/guion` → "generame el copy del ad"
- Cuando el usuario pide un copy de Meta Ads directamente
- Cuando hay que generar copies para un batch de guiones

---

## Archivos obligatorios a leer

1. `.data/copy-engine-ads.md` — EL CORAZÓN: 8 estructuras, scorecard, anti-patrones, mandamientos
2. `.data/copies-ejemplo-clase-mundial.md` — 5 copies de referencia (leer ANTES de escribir)
3. `.memory/jesus-tono-adp-nuevo.md` — Tono y voz de Jesús
4. `.memory/consejos-jesus.md` — Reglas duras
5. `.data/avatares-adp.md` — 8 avatares formales
6. `.data/inteligencia-compradores.md` — Frases reales de 562 compradores
7. `.data/venta-modelo-negocio.md` — 10 tipos de venta del modelo
8. `.data/reglas-diversidad.md` — Para no repetir patrones

---

## Proceso paso a paso

### Paso 0: Determinar el input
- **Si viene de un guion existente:** Leer el guion completo (lead, cuerpo, CTA, ángulo, avatar, Schwartz)
- **Si es desde cero:** Pedir al usuario: nicho/ángulo, avatar objetivo, nivel Schwartz

### Paso 1: Elegir estructura de copy
Consultar la Angle-to-Structure Matrix en `copy-engine-ads.md` sección 12.
- Mapear el ángulo del guion → estructura ideal
- Si hay batch, verificar que no se repita estructura dentro del mismo nicho

### Paso 2: Definir los 6 bloques
Para cada bloque, definir ANTES de escribir:

| Bloque | Qué va a decir | Palabras target |
|--------|----------------|-----------------|
| HOOK | [escena específica] | 15-25 |
| AGITACIÓN | [dolor con detalle sensorial] | 40-60 |
| PIVOTE | [momento de cambio] | 30-40 |
| PRUEBA | [resultado con números] | 40-60 |
| PUENTE | [universalización] | 20-30 |
| CTA | [acción suave] | 20-30 |

### Paso 3: Escribir el copy
Seguir las reglas de `copy-engine-ads.md`:
- Abrir SIEMPRE con escena, NUNCA con pregunta
- Anti-ficción obligatoria (detalles que nadie inventaría)
- Números impares y no-redondos
- El mecanismo tiene NOMBRE
- Español argentino SIEMPRE
- 200-250 palabras (cold), 180-230 (warm), 100-150 (hot)
- Párrafos de 1-3 líneas máximo
- AL MENOS 1 frase real del avatar (de inteligencia-compradores.md o avatar-frases-reales.md)

### Paso 4: Escribir headline + descripción
- **Headline:** máx 40 caracteres. NO resume el copy — es un SEGUNDO hook.
- **Descripción:** máx 125 caracteres. Qué es + para quién + CTA.

### Paso 5: Evaluar con Quality Scorecard
Aplicar los 6 criterios (hook power, especificidad, emoción visceral, prueba creíble, CTA baja fricción, voz argentina). Score ponderado.

**Mínimo 4.0 para presentar. Si < 4.0, reescribir antes de mostrar.**

### Paso 6: Verificar anti-patrones
Recorrer los 8 pares de anti-patrones de `copy-engine-ads.md` sección 5:
- [ ] ¿Abre con escena (no pregunta)?
- [ ] ¿Tiene especificidad (no genérico)?
- [ ] ¿Tono argentino (no formal)?
- [ ] ¿Beneficios en historia (no lista de features)?
- [ ] ¿CTA suave (no agresivo)?
- [ ] ¿Números no-redondos?
- [ ] ¿Prueba social con anti-ficción (no vaga)?
- [ ] ¿Copy respirado (no wall of text)?

---

## Formato de output

```
## Ad Copy — [Nombre del ángulo]

**Estructura:** [1-8, nombre]
**Schwartz:** [nivel]
**Avatar:** [nombre del avatar ADP]
**Score:** [promedio scorecard] ⭐

---

### HEADLINE (XX chars)
[headline]

### DESCRIPCIÓN (XX chars)
[descripción]

### TEXTO PRINCIPAL (XXX palabras)

[copy completo formateado para Meta Ads]

---

### Quality Scorecard
| Criterio | Score |
|----------|-------|
| Hook power | X/5 |
| Especificidad | X/5 |
| Emoción visceral | X/5 |
| Prueba creíble | X/5 |
| CTA baja fricción | X/5 |
| Voz argentina | X/5 |
| **PROMEDIO PONDERADO** | **X.X/5** |
```

---

## Si viene de un guion existente

Cuando el usuario genera un guion con `/guion` y luego pide el copy:

1. **NO copiar el guion literalmente** — el copy es otra pieza, más corta, para LECTURA (no video)
2. **Usar la misma big idea y ángulo** del guion
3. **Adaptar al formato escrito:** lo que en video son pausas dramáticas, en texto son líneas sueltas
4. **El copy puede usar una estructura diferente** al vehículo narrativo del guion
5. **Mantener coherencia:** mismo avatar, mismo nivel Schwartz, misma venta del modelo

---

## Reglas duras (heredadas de consejos-jesus.md + copy-engine)

- NUNCA "no te alcanza la plata"
- NUNCA datos inventados
- NUNCA inventar anécdotas de Jesús
- NUNCA mencionar taller ni Instagram en el copy
- SIEMPRE voseo argentino
- SIEMPRE cerrar con venta/CTA suave
- SIEMPRE anti-ficción en la prueba
- NUNCA abrir con pregunta
- NUNCA CTA más agresivo que la prueba
- NUNCA números redondos
