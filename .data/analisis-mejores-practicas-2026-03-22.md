# Análisis de Mejores Prácticas — Cruce Data Compradores × Sistema Actual
## 22 de marzo 2026

> **Objetivo:** Identificar gaps entre lo que el sistema asume y lo que la data de 562 compradores reales dice.
> **Resultado:** 10 hallazgos con acciones concretas.

---

## AUDITORÍA TÉCNICA — Estado del Sistema

| Check | Estado | Detalle |
|-------|--------|---------|
| Puertos | ✅ | Sin referencias a localhost:3000 |
| Referencias deprecadas | ✅ | Sin menciones a BOFU/11 ángulos activas |
| Conteos | ⚠️ | MEMORY dice 41 generaciones, hay 36. Dice 38 refs, hay 84 |
| Archivos fantasma | ✅ | Todos los archivos referenciados existen |
| Funnel stages | ✅ | Sin BOFU/EVERGREEN en código activo |
| Pre-flight/validación | ✅ | Todos los scripts existen |
| Modelos IA | ✅ | Sin modelos viejos |
| **Nuevo: inteligencia-compradores.md** | ✅ | Integrado y referenciado en MEMORY |

**Acción requerida:** Actualizar conteos en MEMORY.md (36 generaciones, 84 referencias).

---

## HALLAZGO 1: DESBALANCE DE AVATARES (CRÍTICO)

### Lo que el sistema asume:
- 7 avatares con distribución uniforme
- Martín (26, joven) como avatar frecuente
- "Emprendedores en crisis" = 30-40% del tráfico (basado en leads WhatsApp)

### Lo que dicen los 562 compradores:
- **79% tiene 35+** (solo 5% tiene 18-24 como Martín)
- **57% son mujeres**
- Top profesiones: empleados (16%), comercio (13%), docentes (11%)
- **30% tiene 55+** (Roberto es un segmento ENORME)

### Gap:
Los avatares jóvenes (Martín 26, Camila 29) representan al **22% de compradores**, pero tienen peso desproporcionado en los guiones. Los avatares de 35-55 (Laura, Valentina, Diego, Soledad) representan al **49%**. Roberto (55+) al **30%**.

### Acción:
**Recalibrar peso de avatares en auto-brief y plan semanal:**
- Martín: máx 1 de cada 10 guiones (ahora puede aparecer 2-3)
- Laura + Soledad + Valentina: deben ser 5 de cada 10
- Roberto: debe ser 2-3 de cada 10 (es el 30% de compradores)
- Camila: mantener 1 de cada 10 (nichos para inmigrantes)

### Impacto en avatares-adp.md:
- Agregar avatar **"Patricia" (48, empleada pública, argentina)** — el perfil MÁS COMÚN según la data: mujer, 45-54, empleada, gana $500-1000, frustrada con el estancamiento
- O ajustar edades: Laura → 42 (no 38), Roberto → 58 (ok), agregar peso a Soledad

---

## HALLAZGO 2: EL TRIGGER #1 ES HARTAZGO, NO AMBICIÓN

### Lo que el sistema asume:
- Motor de audiencia tiene 12 tensiones
- Las tensiones más usadas son T1-T3 (jóvenes) y T7 (mamás)

### Lo que dicen los compradores:
- **"Ya no puedo seguir así"** es el trigger dominante (≈40%)
- No es "quiero ser millonario" — es "estoy harto/a"
- La ambición aparece DESPUÉS de la compra, no antes

### Gap:
Los guiones que arrancan desde la promesa ("ganá $X/día") están en desventaja contra los que arrancan desde el hartazgo ("¿cuánto más vas a aguantar?"). El dolor es lo que empuja la decisión, no el deseo.

### Acción:
**Agregar T13 al motor de audiencia:**
| T13 | Hartazgo acumulado | "Ya no puedo seguir así" | #2 Dolor puro → esperanza | F1 Identidad | TODOS | "Algo va a cambiar solo" → "Nada cambia si no hacés algo distinto" |

**En reglas de diversidad:** El beat de Identificación debería priorizar dolores sobre promesas en 7 de cada 10 guiones.

---

## HALLAZGO 3: INSTAGRAM > YOUTUBE (CANAL #1 DE ADQUISICIÓN)

### Lo que el sistema asume:
- 3 CTAs: Clase Gratuita, Taller $5, Instagram Orgánico
- Instagram Orgánico como "uno más"

### Lo que dicen los compradores:
- **57% descubrió ADP por Instagram** (vs 9% YouTube)
- Instagram es el canal de PRIMER CONTACTO para la mayoría

### Gap:
El CTA de Instagram Orgánico debería tener la misma prioridad estratégica que los otros dos. Actualmente se graba UNA variante C — debería tener más variantes activas o rotar más frecuentemente.

### Acción:
- En plan semanal: considerar que los guiones de Instagram Orgánico llegan al 57% del funnel
- Los guiones que se suben a Instagram como contenido orgánico (no ads) deberían recibir más atención en creativos
- El CTA de Instagram tiene "Comentá CLASE" — verificar que funciona con el volumen

---

## HALLAZGO 4: "$850 → $3000" = PROMESAS REALISTAS VERIFICADAS

### Lo que el sistema asume:
- Se menciona "50, 60 dólares por día" en CTAs
- $50-60/día = $1500-1800/mes

### Lo que dicen los compradores:
- Ingreso actual mediana: **$850/mes**
- Ingreso deseado mediana: **$3000/mes**
- El rango $1500-2000/mes es el sweet spot (3.5x del actual)

### Verificación:
✅ **Los CTAs actuales están bien calibrados.** "50, 60 dólares por día" = $1500-1800/mes, que está DENTRO del rango deseado por los compradores. No promete millones, promete un cambio real.

### Refinamiento posible:
- En beats de Prueba: usar "$1500 a $2000 al mes" como rango (ya se usa en guion #7)
- Evitar promesas de "$5000/mes" — solo el 4% gana eso hoy, y la mediana deseada es $3000

---

## HALLAZGO 5: LOS MIEDOS PRE-COMPRA VALIDAN LOS CTAs

### Lo que el sistema tiene:
- Riesgo cero en CTA: "Es gratis / Son $5"
- Prueba social: "17 mil personas"
- Urgencia: "cupos limitados"

### Lo que dicen los compradores:
- Miedo #1: "Que sea estafa" (30%) → El riesgo cero es ESENCIAL
- Miedo #2: "No sé de tecnología" (25%) → "Lo único que necesitás es saber usar WhatsApp" ✅
- Miedo #3: "Perder la plata" (20%) → "$5 = menos que un café" ✅
- Miedo #4: "Mi edad" (10%) → "jubilados que solo sabían usar WhatsApp" ✅

### Verificación:
✅ **Los 3 CTAs v2.0 atacan EXACTAMENTE los miedos reales de los compradores.** El CTA de Clase Gratuita tiene la frase "Lo hicieron mamás que nunca habían vendido nada, jubilados que solo sabían usar WhatsApp, pibes de 20 que vivían del sueldo mínimo" — eso cubre los 3 grupos demográficos principales.

---

## HALLAZGO 6: NICHOS DE EJEMPLO DEBEN REFLEJAR A LOS COMPRADORES

### Lo que el sistema asume:
- Ejemplos de nichos variados (crochet, guías de viaje, etc.)
- Selección por Google Trends

### Lo que dicen los compradores sobre sus talentos:
- Ventas/Marketing (14%), Educación (14%), Diseño/Arte (11%), Salud/Fitness (9%), Cocina (6%)
- Profesiones: docentes (11%), coaching/consultoría (2%), salud (6%)

### Gap:
Los nichos de ejemplo deberían incluir MÁS casos de las profesiones reales de los compradores:
- "Una profesora de yoga armó una guía de rutinas con IA"
- "Un contador creó un kit de plantillas de Excel para emprendedores"
- "Una docente empaquetó sus clases en un curso digital"
- "Una diseñadora gráfica vende templates en Hotmart"

### Acción:
**En `.data/reglas-diversidad.md`:** agregar lista de "nichos validados por compradores" que se prioricen como ejemplos en beats de Prueba y Mecanismo.

---

## HALLAZGO 7: LA CONFIANZA EN JESÚS ES EL FACTOR #1

### Lo que el sistema tiene:
- Guiones de historia de Jesús (familia F5)
- Tono calibrado con jesus-tono-adp-nuevo.md

### Lo que dicen los compradores:
- **60% compró porque confía en Jesús como persona**
- "La simpleza y sinceridad de Jesús es terrible"
- "Jesús me parece una persona confiable a diferencia de otros que son vende humo"
- "Lo que dice lo hace"

### Verificación:
✅ **El guion #5 (Historia de Jesús) tiene respaldo masivo.** La historia personal de Jesús no es solo un guion más — es LA herramienta de conversión.

### Acción:
- En plan semanal: SIEMPRE incluir mínimo 1 guion de historia/autenticidad de Jesús (F5)
- Los guiones F3 (Confrontación) deberían incluir momentos de transparencia radical ("Te voy a ser honesto")

---

## HALLAZGO 8: EL TALLER DE $5 ES LA MÁQUINA DE CONVERSIÓN

### Lo que dicen los compradores:
- Múltiples mencionan que el taller de 3 días fue lo que los convenció
- "Las clases de 3 días fueron clave"
- "Cuando participé del taller me decidí por entrar"
- El precio de $5 elimina el miedo de "perder la plata"

### Implicación:
El CTA del Taller $5 debería tener prioridad estratégica en campañas MOFU. No es solo "otro CTA" — es el mecanismo de conversión más efectivo según los propios compradores.

### Acción:
- En guiones dirigidos a Diego (escéptico): priorizar CTA Taller $5 sobre Clase Gratuita
- En retargeting: el Taller $5 es el argumento definitivo ("son 5 dólares, menos que un café")

---

## HALLAZGO 9: FRASES REALES DE COMPRADORES > FRASES DE LEADS

### Lo que el sistema tiene:
- `avatar-frases-reales.md` con frases de leads WhatsApp (gente que NO compró necesariamente)
- `motor-audiencia.md` basado en 8,074 leads

### Lo que ahora tenemos:
- `inteligencia-compradores.md` con frases de 562 personas que SÍ COMPRARON

### Jerarquía de uso:
1. **Frases de compradores** (más peso — estas personas convirtieron)
2. **Frases de leads** (complementarias — volumen más alto)
3. **Frases inventadas** (NUNCA)

### Acción:
**En jerarquía de decisiones:** agregar que frases de compradores tienen prioridad sobre frases de leads cuando hay conflicto. Ambas son reales, pero las de compradores son de gente que YA PAGÓ.

---

## HALLAZGO 10: AVATAR FALTANTE — LA EMPLEADA DE 48

### El perfil más común en los 562 compradores NO tiene avatar:
- **Mujer, 45-54 años, empleada, argentina, gana $500-1000/mes**
- No es mamá full-time (Laura), no es freelancer (Valentina), no es jubilada (Roberto)
- Es una empleada estable que siente que "ya no puede seguir así"
- Lleva 15-20 años en el mismo trabajo, quiere un cambio pero no sabe cómo

### Esta persona hoy se divide entre Laura (más joven, mamá), Soledad (profesional), y Diego (escéptico). Pero NO es ninguno de ellos.

### Acción sugerida:
Considerar agregar **Avatar 8: "Patricia"** (48, empleada administrativa en una universidad/empresa, 18+ años en el mismo puesto, gana $800/mes, divorciada, un hijo adolescente, sabe que tiene que hacer algo diferente pero le da miedo el cambio, consume contenido de desarrollo personal en Instagram).

---

## RESUMEN DE ACCIONES PRIORITARIAS

### P0 (hacer YA):
1. ✅ Integrar `inteligencia-compradores.md` en `.data/` — **HECHO**
2. ⚠️ Corregir conteos en MEMORY.md (36 gen, 84 refs)
3. ⚠️ Agregar T13 "Hartazgo acumulado" a motor-audiencia.md

### P1 (hacer esta semana):
4. Recalibrar pesos de avatares en criterios de auto-brief
5. Agregar "nichos validados por compradores" a reglas-diversidad.md
6. Actualizar jerarquía de decisiones: frases compradores > frases leads

### P2 (considerar):
7. Evaluar avatar "Patricia" (48, empleada) como avatar #8
8. Aumentar peso del CTA Taller $5 en estrategia de retargeting
9. Incluir siempre 1 guion F5 (historia Jesús) en cada plan semanal

---

## COSAS QUE YA ESTAMOS HACIENDO BIEN ✅

1. **CTAs calibrados a la realidad.** "$50-60/día" coincide con el rango deseado real ($1500-3000/mes)
2. **Prueba social diversa.** "Mamás, jubilados, pibes de 20" cubre los 3 rangos de edad principales
3. **Riesgo cero concreto.** Ataca el miedo #1 (estafa) y #3 (perder plata)
4. **"Solo necesitás saber usar WhatsApp"** en CTA Instagram — destruye miedo #2 (tecnología)
5. **Cupos limitados** en urgencia — crea presión sin mentir
6. **Taller de $5 como CTA MOFU** — los propios compradores dicen que fue lo que los convenció
7. **Transparencia de Jesús como eje** — el factor #1 de conversión está bien reflejado
8. **Motor de audiencia con tensiones reales** — las 12 tensiones cubren la mayoría de los dolores
9. **5 familias de ángulos** — permiten diversidad real en cada plan semanal
10. **Anti-repetición de hooks** — 7 patrones prohibidos + validación automática
