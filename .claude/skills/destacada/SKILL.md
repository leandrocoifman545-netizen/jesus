---
name: destacada
description: Crea o edita destacadas (highlights) de Instagram para Jesús Tassarolo (ADP). Usar cuando el usuario pide crear una destacada, highlight, "mi historia", embudo de stories fijas, o contenido evergreen de perfil.
argument-hint: [tipo de destacada] [tema/contexto]
---

# Generador de Destacadas de Instagram — ADP (Jesús Tassarolo)

**REGLA CARDINAL: NUNCA delegar la generación a subagentes.** Generar siempre en el contexto principal.

**Diferencia clave con stories diarias:** Las stories diarias son temporales, rotan, necesitan frescura. Las destacadas son PERMANENTES — forman el embudo evergreen del perfil. Tienen reglas OPUESTAS a las stories diarias (H37 confirmado): más producción, más estructura narrativa, más texto por slide, arcos emocionales completos.

> "Sin Acto 1, el 2 es 'otra persona presumiendo.' Sin Acto 2, el 3 es 'un vendedor más.'"

---

## Paso 0: Entender el sistema de 3 actos

Leer `.data/cadenas-confianza-destacadas.md` — las destacadas son un SISTEMA, no piezas sueltas.

| Acto | Función | CTA | Destacada de Jesús |
|------|---------|-----|-------------------|
| 1. Identificación | "Pasé por lo que vos pasás" | NINGUNO | "Mi Historia" |
| 2. Aspiración | "Mirá lo que es posible" | Suave (emoji/reacción) | "Resultados" / "Alumnos" |
| 3. Acción | "Esto es lo que hago y así empezás" | Fuerte (keyword) | "¿Cómo Funciona?" |

### Destacadas que el perfil de Jesús debe tener

| Destacada | Acto | Contenido | Archivo de referencia |
|-----------|------|-----------|----------------------|
| **Mi Historia** | 1 | Historia de vida (Hauge 6 etapas, doble W) | `framework-destacadas/destacada-jesus-v5.md` (CANÓNICA) |
| **Resultados** | 2 | Testimonios + capturas + casos de alumnos | `.data/inteligencia-compradores.md` |
| **¿Cómo Funciona?** | 3 | Explicativa del modelo (pizarra + enemigos + CTA) | `stories-secuencias-tipo.md` (Tipo 9) |
| **FAQ / Preguntas** | 3 | Objeciones respondidas + link agenda | `.data/objeciones-adp.md` |
| **Empezar Aquí** | — | Orientación para nuevos seguidores | — |

---

## Paso 1: Elegir tipo de destacada

Preguntarle al usuario qué destacada quiere crear o editar. Si no especifica, sugerir la que falta o la más urgente.

---

## Paso 2: Cargar archivos según tipo

### Siempre leer (para CUALQUIER destacada):
1. `.data/cadenas-confianza-destacadas.md` — sistema de 3 actos + cadenas de preguntas internas
2. `.data/arsenal-tecnicas-stories.md` — **sección A** (técnicas de origen) + **sección C** (CTAs)
3. `.data/patrones-universales-stories.md` — **solo AXIOMAS** (4+ confirmaciones). No hipótesis
4. `.data/sistema-stories-completo.md` — secciones 1 (7 axiomas), 0.5 (modelos mentales), 0.6 (jerarquía de confianza), 18 (estrategia highlights)
5. `.memory/jesus-tono-adp-nuevo.md` — tono argentino
6. `.data/avatares-adp.md` — Patricia(48) + Roberto(62) = 56% compradores → la destacada habla principalmente a ellos

### Si es "Mi Historia" (Acto 1):
7. `.data/framework-destacadas/framework-mi-historia.md` — meta-patrón + proporciones + 5 prácticas
8. `.data/framework-destacadas/destacada-jesus-v5.md` — versión aplicada (17 stories, 2 días). **ESTA ES LA CANÓNICA. No usar v3.**
9. `.data/destacadas-mi-historia-inventario.md` — benchmarks (Augus 9/10, Adrià 9/10, Sawyer 8/10, MAV 7/10, SEVER anti-patrón)
10. `.memory/jesus-historia.md` — historia real de Jesús (Hauge 6 etapas)

### Si es "¿Cómo Funciona?" (Acto 3):
7. `.data/stories-secuencias-tipo.md` — Tipo 9 (Explicativa de servicio)
8. `.data/venta-modelo-negocio.md` — las 10 ventas del modelo
9. Benchmarks: `ref-joaco-coronel-como-trabajo-posicionamiento.json` (pizarra + 3 enemigos)

### Si es "Resultados" (Acto 2):
7. `.data/inteligencia-compradores.md` — 562 compradores reales
8. `.data/stories-data-audiencia.md` — DMs reales, testimonios
9. Cadena tipo RESULTADOS de `cadenas-confianza-destacadas.md`

### Si es "FAQ":
7. `.data/objeciones-adp.md` — todas las objeciones mapeadas
8. `.data/stories-setter-scripts.md` — scripts de setters para integrar con link de agenda

---

## Paso 3: Diseñar arco narrativo

### Para "Mi Historia" — aplicar el META-PATRÓN obligatorio:

```
RESULTADO → ORIGEN → SUBIDA → FALSO PICO → CAÍDA → RESURGIMIENTO → CIERRE HUMANO
```

**Proporciones obligatorias:**
| Sección | % del total | En 15-17 stories | Ritmo |
|---------|------------|------------------|-------|
| Hook / flash-forward | 5-10% | 1-2 stories | RÁPIDO |
| Origen | 15-20% | 2-3 stories | MEDIO |
| Subida + falso clímax | 10-15% | 2-3 stories | ACELERANDO |
| **CAÍDA + DOLOR** | **35-45%** | **5-7 stories** | **LENTO — el corazón** |
| Resurgimiento + pruebas | 15-20% | 2-3 stories | RÁPIDO |
| Cierre emocional | 5-10% | 1-2 stories | MUY LENTO |

**5 prácticas obligatorias (rankeadas por impacto):**
1. **Doble caída** — no 1 fracaso, sino 2 ciclos (intentar→lograr→caer→intentar→lograr→caer→ENTENDER). 4 confirmaciones independientes
2. **Momento de corazón** — UN momento que se clava (Jesús: la abuela, la muerte del padre, o el momento "trabajaba 10hs y no alcanzaba")
3. **Dolor al 35-45%** — si es menos, la audiencia 35+ no se identifica. Error más común: dolor al 20%
4. **Cierre familiar** — familia > dinero. Siempre. El cierre es emocional, no financiero
5. **Zero CTA** — AXIOMA con 8 confirmaciones. La historia se cierra sola. La AUSENCIA de venta es lo que hace creíble la historia

### Para "¿Cómo Funciona?" — aplicar cadena tipo LÓGICA:

| # | Pregunta interna del viewer | Responde SÍ con |
|---|---------------------------|-----------------|
| 1 | "¿Entiende MI problema?" | Hook de dolor ESPECÍFICO (no genérico) |
| 2 | "¿Tiene un sistema?" | Pasos numerados con nombres propios (pizarra/diagrama) |
| 3 | "¿Funciona para gente como yo?" | Casos por categoría con métricas verificables |
| 4 | "¿Qué incluye exactamente?" | Bullets concretos con números específicos |
| 5 | "¿Cuándo actúo?" | Urgencia anclada en contexto real (no falsa escasez) |

### Para "Resultados" — aplicar cadena tipo RESULTADOS:

| # | Pregunta interna del viewer | Responde SÍ con |
|---|---------------------------|-----------------|
| 1 | "¿Esto es real o humo?" | Dashboard/screenshot con número NO redondo ($35.876, no $36.000) |
| 2 | "¿Solo funciona para él?" | Nombres de segmentos + rango de resultado por alumno |
| 3 | "¿Es de una vez o constante?" | ABUNDANCIA de pruebas apiladas |
| 4 | "¿Es un posero?" | Metacomentario que reconoce la objeción ANTES de que aparezca |
| 5 | "¿Alguien más lo validó?" | Tercero verificable (plataforma, premio) |
| 6 | "¿Quiero esto para mí?" | Visual aspiracional + CTA suave (reacción emoji) |

---

## Paso 4: Presentar estructura al usuario ANTES de escribir

Mostrar tabla con:
- Story #, función narrativa, formato visual, emoción del viewer, pregunta interna que responde
- Proporciones calculadas (dolor debe ser 35-45%)
- Axiomas que se van a aplicar
- Momento de corazón elegido

**El usuario debe aprobar la estructura antes de pasar al Paso 5.**

---

## Paso 5: Escribir guión de 5 columnas

Formato: `| # | Texto en pantalla | Texto hablado | Otros | Cómo (formato visual) |`

### Reglas de escritura para destacadas:

1. **Voseo argentino SIEMPRE** — como habla Jesús con un amigo
2. **Anti-ficción** — solo usar datos, fechas, montos y anécdotas que existan en `jesus-historia.md`. NUNCA inventar
3. **Números NO redondos** — $35.000, no $30.000. 9 días, no "una semana"
4. **70% imagen, 30% texto** por slide
5. **Subtítulos en TODOS los videos** (CapCut)
6. **Alternar formatos** — nunca 2 videos iguales seguidos
7. **Formatos premium permitidos** — P1 (progressive reveal), P3 (blur+texto), P4 (foto antigua rounded) son ideales para destacadas
8. **Sin-audio obligatorio para origin stories** — la destacada debe funcionar SIN sonido (Sawyer: 100% foto, Augus: 78% sin audio). Texto+fotos > video hablando

### Principio F1 (del framework):
> "Lo bueno se MUESTRA (rápido), lo malo se CUENTA (lento)."
> Los logros van en fotos rápidas con poco texto. El dolor va en texto pausado con fotos vulnerables.

---

## Paso 6: Validar contra checklist de axiomas

### Checklist obligatorio antes de presentar:

**Los 7 axiomas del sistema (de `sistema-stories-completo.md`):**
- [ ] "La gente confía en lo que puede VERIFICAR" → ¿hay screenshots, números reales, documentos?
- [ ] "La gente actúa cuando siente que ELIGIÓ" → ¿hay preguntas, no órdenes?
- [ ] "La gente se queda cuando lo SIGUIENTE es más interesante que IRSE" → ¿hay open loops entre slides?
- [ ] "La gente le compra a gente con la que sería AMIGA" → ¿tono casual, humor, vulnerabilidad?
- [ ] "La gente recuerda SENTIMIENTOS, no información" → ¿hay residuo emocional claro?
- [ ] "El mejor contenido cambia cómo el viewer SE VE A SÍ MISMO" → ¿hay transformación identitaria?
- [ ] "Cada segundo de atención es una TRANSACCIÓN" → ¿cada slide da valor antes de pedir algo?

**Axiomas de `patrones-universales-stories.md` que aplican a destacadas:**
- [ ] P1: CTA por keyword DM (en Acto 3, no en Acto 1)
- [ ] P2: Cara visible desde la primera story
- [ ] P4: Momento vulnerable = máxima identificación
- [ ] P9: Viewer pide, creador cede (nunca "comprá")
- [ ] P10: Keyword-identidad > keyword-información (INICIO > INFO)
- [ ] P13: Apertura con collage/foto emocional > selfie (para destacadas)

**Para "Mi Historia" específicamente:**
- [ ] ¿Dolor al 35-45%? (no 20%)
- [ ] ¿Doble caída? (no lineal)
- [ ] ¿Momento de corazón definido?
- [ ] ¿Cierre familiar/emocional? (no financiero)
- [ ] ¿Zero CTA? (AXIOMA 8 confirmaciones)
- [ ] ¿Funciona sin audio?

### Score comparativo
Después de generar, autoevaluar vs benchmarks:
- Augus Nievas: 9/10 (25 stories, 5:47, falso clímax + abrazo abuelo)
- Adrià Solà: 9/10 (40 stories, doble arco, plot twist)
- Sawyer Fast: 8/10 (20 stories, 100% foto, doble falso clímax)
- MAV: 7/10 (éxito→vacío×2, dashboard + despertar)
- SEVER: 4/10 (anti-patrón — estructura sin sustancia)

**Si el score estimado es < 7/10 → revisar antes de presentar.**

---

## Paso 7: Guardar

Guardar en `.data/stories/{id}.json` con `highlight_name` = nombre de la destacada.

Si es "Mi Historia", la versión canónica se mantiene en `.data/framework-destacadas/destacada-jesus-v5.md` y se actualiza ahí.

---

## Notas de producción

- **Destacada viva:** Cada 3-6 meses, agregar testimonios nuevos o actualizar datos. La destacada NO es estática
- **Orden en el perfil:** De izquierda a derecha = Acto 1 → Acto 2 → Acto 3. El nuevo seguidor las recorre en ese orden
- **Serialización:** Si la destacada tiene +15 stories, dividir en 2 días (subir Parte 1, esperar 2000 reacciones, subir Parte 2)
- **Banco de contenido:** Verificar en `.data/destacada-mi-historia/` que existen los assets necesarios (fotos de Sarandí, Mañanísima, avión, etc.)
