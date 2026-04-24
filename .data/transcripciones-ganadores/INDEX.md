---
tipo: index
generado: 2026-04-23
fuente_videos: "/Users/lean/Desktop/ganadores 2"
fuente_reporte: "reporte_adpd_cpl_revenue.pdf"
periodo_reporte: "YTD 01-ene-2026 a 20-abr-2026"
cuenta: "act_1503734619973938"
atribucion: "Hyros ADPD — Academia + Taller 3 días"
umbral_roas_positivo: 0.50
---

# Transcripciones — Ganadores Meta Ads ADPD

8 videos del top 10 del reporte. Transcripciones hechas con whisper medium (español).

## Tabla maestra (ordenada por ROAS descendente)

| # | Archivo | Hook | ROAS | CPL | Ventas | Rev | Status | Conv |
|---|---|---|---|---|---|---|---|---|
| 1 | [ad-6.md](ad-6.md) | "¿Sirve si nunca vendí online?" | **2,63** | $0,85 | 108 | $1.438 | CAMPAIGN_PAUSED | 16,85% |
| 2 | [ad-39bn.md](ad-39bn.md) | "IAs gratuitas vs pagas + 3 pasos" | **1,25** | $1,37 | 167 | $3.371 | ACTIVE | 8,43% |
| 3 | [ad-44-c1.md](ad-44-c1.md) | "Deuda en 30 días" | **1,21** | $1,19 | 161 | $3.308 | DISAPPROVE | 6,99% |
| 4 | [ad-3.md](ad-3.md) | "Aprender a manejar = emprender" | **1,20** | $1,32 | 424 | $7.139 | WITH_ISSUE | 9,40% |
| 5 | [ad-122-c9h2.md](ad-122-c9h2.md) | "Manualidades sin ferias" | 0,67 | $0,88 | 32 | $501 | ACTIVE | 3,77% |
| 6 | [ad-1.md](ad-1.md) | "¿Qué es un producto digital?" | 0,60 | $0,98 | 39 | $366 | PAUSED | 6,31% |
| 7 | [ad-140-c10h5.md](ad-140-c10h5.md) | "Ferrari para ir a la esquina" | 0,56 ⚠️ | $0,93 | 8 | $442 | ACTIVE | 0,93% |
| 8 | [ad-46.md](ad-46.md) | "3 modelos para arrancar" | 0,55 | $1,02 | 95 | $1.621 | PAUSED | 3,29% |

⚠️ = mis-tracking sospechado en Hyros (conversión anómala vs gemelos).

## Agregado del top 10

- Spend: $19.352
- Leads: 17.289
- Ventas: 1.182
- Revenue: $19.228
- CPL: $1,12
- ROAS: 0,99 (positivo con umbral 0,50)

## Lecturas rápidas

### Mejor ROAS (#6, 2,63)
Formato entrevista / objection-buster. Admite limitantes explícitamente ("no te vas a hacer millonario"). CTA implícito. **Pausado.**

### Top revenue (#3, $7.139)
Analogía de aprender a manejar. Conversacional argentino. Resubido 3 veces (la original es la que mejor funcionó — reuploads perdieron ROAS). **WITH_ISSUE — destrabar es la prioridad #1.**

### Mejor ACTIVE (#39[BN], 1,25)
Contraste IAs gratuitas vs pagas + paso-a-paso en 3 + anti-pitch explícito ("no te voy a vender nada de $500"). Parece cortado al inicio del audio.

### Rechazado con ROAS positivo (#44 [C1], 1,21)
Hook hipotético de deuda + mención de alquiler/auto/pagos. **Meta probablemente lo rechazó por promesa de ingresos** — apelar o reformular.

### Sospecha de mis-tracking (#140)
Convierte 4x menos que su gemelo #122 pese a métricas idénticas. ROAS real proyectado ~2,25.

## Estructura de archivos

```
transcripciones-ganadores/
├── INDEX.md                     (este archivo)
├── ANALISIS.md                  (análisis individual + cross básico)
├── CROSS_ANALYSIS.md            (16 dimensiones cruzadas + score ponderado por spend)
├── ad-1.md
├── ad-3.md
├── ad-6.md
├── ad-39bn.md
├── ad-44-c1.md
├── ad-46.md
├── ad-122-c9h2.md
├── ad-140-c10h5.md
├── audios/                      (mp3 extraídos de los mp4)
└── raw/                         (srt originales de whisper)
```

Cada `ad-*.md` tiene frontmatter YAML con todas las métricas + transcripción limpia + notas de contexto.

## Cadena con análisis vigente del repo

Esta carpeta alimenta a `.data/winner-patterns.md`, que consolida patrones accionables para el sistema de guiones.

**Documento rector vigente:**
- [`../winner-patterns.md`](../winner-patterns.md) — DNA accionable actualizado con los winners de hoy.

**Análisis vigentes (complementarios):**
- [`../analisis-winner-39-bn-t4.md`](../analisis-winner-39-bn-t4.md) — frame-by-frame de #39 (sigue ACTIVE, único deep-dive vigente).

## Resumen del contexto del repo (actualizado 2026-04-24)

1. El análisis de esta carpeta (YTD 2026) es la **fuente de verdad actual** para winners.
2. Los principios generales (match con comprador, anti-hype, voseo) siguen vigentes.
3. Patrones accionables del top actual: analogía cotidiana con bracket narrativo (#3), formato actuación/diálogo (#6), listicle 3 pasos + anti-pitch (#39), hipótesis del autor + demolición × 3 (#44).
4. Anti-patrón documentado: hook demográfico + competidores con nombre + IA ausente (#46 fatigó a escala con esa combinación).
5. **Los 4 winners de hoy: #3, #6, #39, #44.** Todos los demás (#121, #34, #43, etc.) fueron borrados el 2026-04-24 por no pasar el umbral de 100 ventas o estar sobre producto anterior (Academia de Publicistas).
