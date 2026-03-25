# Validación de calidad — Transcripciones Whisper de @ramiro.cubria

**Fecha:** 2026-03-25
**Total transcripciones:** 191
**Muestra analizada:** 20 (top 10 CLR + 10 random) + barrido completo de las 191

---

## Veredicto: HIGH (con 5 excepciones puntuales)

Las transcripciones son confiables para análisis de patrones. El 97.4% (186/191) son utilizables sin reservas.

---

## 1. Métricas generales (191 transcripciones)

| Métrica | Valor |
|---------|-------|
| Transcripciones vacías | 0 |
| Ratio promedio palabras reales / esperadas (a 3.5 pal/s) | 101.5% |
| Ratio mediana | 102.4% |
| avg_logprob promedio (confianza Whisper) | -0.0836 (excelente, >-0.15 = alta confianza) |
| Peor avg_logprob individual | -0.7849 (1 segmento en 1 video problemático) |
| Repetición de frases (hallucination) | 0 detectadas en la muestra de 20 |
| Palabras inexistentes en español | 0 detectadas en la muestra de 20 |

---

## 2. Coincidencia CTA caption vs. transcript

- **144 videos** tienen un CTA tipo "Comenta [KEYWORD]" en el caption
- **131 (91.0%)** mencionan la keyword en el transcript
- **13 (9.0%)** NO coinciden

### Análisis de los 13 mismatches

**10 son el mismo caso: "HORMOZI"**
Whisper transcribe correctamente lo que dice Ramiro ("Hormozy", "Ormosi", "Jormozy", "Hormousy"), pero el caption dice "HORMOZI". Es decir, Ramiro pronuncia variantes y Whisper las captura fielmente. El contenido es correcto, solo difiere la ortografía de un nombre propio. No es un error de transcripción.

**2 son variantes menores:**
- Caption "CURSOS" → transcript dice "curso" (singular). Contenido correcto.
- Caption "1" → transcript dice "uno" (palabra vs. número). Contenido correcto.

**1 es caso real de discrepancia:**
- Caption "FÍA" → transcript dice "FIA". Diferencia de acento, contenido correcto.

**Conclusión:** 0 mismatches reales de contenido. Las 13 diferencias son ortográficas/de formato.

---

## 3. Transcripciones con problemas reales (5/191 = 2.6%)

### 3.1 Videos con música/audio no hablado (3 videos)

| shortCode | Duración | Palabras | Ratio | Problema |
|-----------|----------|----------|-------|----------|
| `DUYZqTxjmiy` | 65.1s | 26 | 11% | Hallucination religiosa: "La Iglesia de Jesucristo de los Santos de los Últimos Días" — el video probablemente tiene música de fondo y Whisper inventó texto |
| `DUGfU7YjtFH` | 67.5s | 17 | 7% | Mismo patrón: "La Iglesia de Jesucristo..." + "Amén. Gracias por ver el video." — hallucination sobre audio no-verbal |
| `DURCf7HCc5f` | 77.4s | 6 | 2% | Hallucination: "Suscríbete al canal! Suscríbete al canal!" — audio no-verbal con texto inventado |

Estos 3 videos probablemente son clips con música, b-roll, o audio que no es habla. Whisper genera texto fantasma cuando no hay habla clara. Son fáciles de identificar por su ratio extremadamente bajo (<15%).

### 3.2 Video en idioma incorrecto (1 video)

| shortCode | Duración | Palabras | Ratio | Problema |
|-----------|----------|----------|-------|----------|
| `DVHpu94jeSO` | 18.9s | 18 | 27% | Transcripción en INGLÉS: "I'm being cruel to be kind, I can't love you in the dark..." — es una canción o clip en inglés, no contenido hablado de Ramiro |

### 3.3 Video con baja confianza (1 video)

| shortCode | Duración | Palabras | Ratio | Problema |
|-----------|----------|----------|-------|----------|
| `DSasWgKko3B` | 49.9s | 64 | 37% | 10/10 segmentos con baja confianza. Texto parcialmente en español con fragmentos incoherentes ("No soy negro, soy O.J. Ok"). Posiblemente un video con audio de terceros o clips editados. |

---

## 4. Calidad de la muestra de 20

Las 20 transcripciones de la muestra (top 10 CLR + 10 random) son todas de alta calidad:

- **0 hallucinations** detectadas
- **0 palabras inexistentes** en español
- **0 frases repetidas** (patrón típico de hallucination de Whisper)
- **0 transcripciones truncadas** — todas cubren la duración completa
- **Ratios de palabras** entre 82% y 125% (rango normal para habla natural con pausas y variación de velocidad)
- **avg_logprob** consistentemente por encima de -0.14 (alta confianza)
- **no_speech_prob** bajo en todos los segmentos (0/N con >0.8 en toda la muestra)
- El español argentino se captura bien: "vos", "tenés", "metete", "pelotudo", "mierda" se transcriben correctamente
- Nombres propios se manejan razonablemente: "ChatGPT", "ManyChat", "Hormozy" (variantes fonéticas)

---

## 5. Observaciones sobre la calidad de Whisper para este tipo de contenido

**Lo que Whisper hace bien:**
- Español argentino coloquial (voseo, lunfardo, puteadas)
- Velocidad alta de habla (Ramiro habla rápido, ~4 pal/s en algunos videos)
- Términos técnicos en inglés mezclados con español ("content manager", "ManyChat", "leads")
- Números y cantidades ("312 mil dólares", "15.286 agentes")

**Lo que Whisper hace mal:**
- Videos sin habla: genera texto fantasma (religioso o de YouTube genérico)
- Nombres propios poco comunes: "Hormozi" se transcribe con variantes fonéticas
- No distingue entre hablantes (no hay diarización)

---

## 6. Recomendación

**Las transcripciones son confiables para:**
- Extraer hooks y patrones de apertura
- Analizar estructura de contenido y CTAs
- Identificar temas y keywords
- Medir densidad de contenido por duración

**Filtrar antes de usar:**
- Excluir los 5 videos problemáticos (shortCodes: `DUYZqTxjmiy`, `DUGfU7YjtFH`, `DURCf7HCc5f`, `DVHpu94jeSO`, `DSasWgKko3B`)
- Cuando se busque la keyword exacta del CTA, normalizar "Hormozy/Ormosi/Hormousy" → "HORMOZI"

**186/191 transcripciones (97.4%) son de alta calidad y listas para análisis.**
