---
name: audit
description: Auditoría automática de consistencia del sistema. Detecta errores, contradicciones y referencias rotas entre archivos.
argument-hint: [opcional: "fix" para corregir automáticamente]
---

# Auditoría de Consistencia — Script Generator

Correr este skill para detectar errores ANTES de que el usuario los encuentre.

## Cuándo correr automáticamente

- **ANTES de generar un guion individual** (`/guion`) — correr CHECK 3, 4, 7, 8
- **ANTES de generar un plan semanal** (`/plan-week`) — correr TODOS los checks
- **DESPUÉS de cambiar cualquier archivo de sistema** (skills, schemas, prompts)
- **Cuando el usuario pide revisar errores**

## Checks obligatorios

### CHECK 1: Puertos
Buscar `localhost:3000` en TODO el proyecto. El puerto correcto es `3002`.
```bash
grep -r "localhost:3000" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.mjs" . | grep -v node_modules | grep -v .next
```
**Si encuentra:** Listar archivos y ofrecer corregir.

### CHECK 2: Referencias deprecadas
Buscar estos patrones que NO deberían existir como activos:
- `"11 ángulos"` o `"8 ángulos"` (correcto: 5 familias)
- `"BOFU"` en código/prompts (correcto: RETARGET)
- `"puente a la oferta"` como instrucción activa (deprecado)
- `"offer_bridge"` en prompts/instrucciones como obligatorio (solo backward-compat en código)
- `"Máx 4 CTAs"` o CTAs de 1 frase (correcto: 3 bloques × 6 capas)

```bash
grep -rn "11 ángulos\|8 ángulos\|8 Ángulos\|BOFU" --include="*.md" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next | grep -v "angulos-expandidos.md" | grep -v "DEPRECADO\|deprecad\|viejo\|reemplaz\|old\|originales"
```

### CHECK 3: Conteos stale
Contar archivos reales y comparar con lo documentado:
```bash
echo "=== Generaciones ==="
ls .data/generations/*.json 2>/dev/null | wc -l
echo "=== Referencias ==="
ls .data/references/*.json 2>/dev/null | wc -l
```
Comparar contra lo que dicen MEMORY.md y matriz-cobertura.md. Si difieren > 2, avisar.

### CHECK 4: Archivos fantasma
Verificar que TODOS los archivos referenciados en skills existen:
```bash
# Archivos que los skills esperan en .memory/
for f in jesus-adp.md consejos-jesus.md jesus-tono-adp-nuevo.md jesus-historia.md avatar-frases-reales.md inteligencia-audiencia.md tecnicas-retencion.md tecnicas-venta-emiliano.md formatos-visuales.md tecnica-analogia-franco-piso.md estrategia-semanal.md matriz-cobertura.md; do
  [ ! -f ".memory/$f" ] && echo "FALTA: .memory/$f"
done

# Archivos que los skills esperan en .data/
for f in angulos-expandidos.md tipos-cuerpo.md venta-modelo-negocio.md ctas-biblioteca.md enciclopedia-127-ingredientes.md objeciones-adp.md; do
  [ ! -f ".data/$f" ] && echo "FALTA: .data/$f"
done

echo "OK si no hay líneas FALTA"
```

### CHECK 5: Schema vs código
Verificar que los campos del schema TypeScript coincidan con lo que el prompt del sistema pide:
1. Leer `lib/ai/schemas/script-output.ts` → extraer campos
2. Leer `lib/ai/prompts/system.ts` → extraer campos mencionados
3. Leer `lib/ai/generate.ts` → extraer campos del schema inline
4. Comparar: si un campo existe en uno pero no en los otros → ERROR

### CHECK 6: Funnel stages consistentes
```bash
grep -rn "TOFU\|MOFU\|BOFU\|RETARGET\|EVERGREEN" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v .next
```
Solo TOFU/MOFU/RETARGET deberían estar activos en código.

### CHECK 7: Hook types consistentes
1. Leer `lib/ai/schemas/script-output.ts` → tipos de HookType
2. Leer `lib/coverage.ts` → array allHookTypes
3. Leer `.claude/skills/guion/SKILL.md` → tipos listados
4. Los 3 deben tener EXACTAMENTE los mismos tipos.

### CHECK 8: Reglas de diversidad
Verificar que el archivo `.data/reglas-diversidad.md` existe y está referenciado en:
1. `.claude/skills/guion/SKILL.md` → debe estar en archivos obligatorios Y en checklist final
2. `.claude/skills/plan-week/SKILL.md` → debe estar en archivos obligatorios Y tener checklist de diversidad
3. `lib/ai/prompts/system.ts` → debe tener sección "DIVERSIDAD OBLIGATORIA"
4. `CLAUDE.md` → debe tener "Regla anti-repetición"

### CHECK 9: Micro-creencias en sistema
Verificar que los archivos clave mencionan micro-creencias:
1. `lib/ai/prompts/system.ts` → debe tener sección "ARQUITECTURA DE MICRO-CREENCIAS"
2. `lib/ai/schemas/script-output.ts` → debe tener interface `MicroBelief` y campo `micro_beliefs`
3. `lib/ai/generate.ts` → descripción del schema debe incluir `micro_beliefs`
4. `.data/tipos-cuerpo.md` → debe tener tabla "micro-creencia → mejor vehículo"
5. `.claude/skills/guion/SKILL.md` → Paso 3 debe empezar con cadena de creencias

### CHECK 10: Motor de audiencia integrado
Verificar que `motor-audiencia.md` y `jerarquia-decisiones.md` están referenciados en:
1. `.claude/skills/guion/SKILL.md` → motor como archivo obligatorio #15, jerarquía en Paso 0
2. `.claude/skills/plan-week/SKILL.md` → motor como archivo obligatorio #13, jerarquía en Paso 0
3. `CLAUDE.md` → ambos en tabla de sistemas vigentes
4. `.data/motor-audiencia.md` → existe y tiene las 8 secciones
5. `.data/jerarquia-decisiones.md` → existe y tiene los 5 niveles

### CHECK 11: Pre-flight y validación de guardado
Verificar que los scripts de enforcement existen:
1. `scripts/preflight-guion.mjs` → existe y es ejecutable
2. `scripts/save-generation.mjs` → tiene bloque de validación (buscar "ERRORES")

```bash
[ -f scripts/preflight-guion.mjs ] && echo "preflight OK" || echo "FALTA: preflight-guion.mjs"
grep -l "ERRORES" scripts/save-generation.mjs > /dev/null && echo "save-validation OK" || echo "FALTA: validación en save-generation.mjs"
```

### CHECK 12: Modelo de IA
Buscar modelos viejos:
```bash
grep -rn "claude-3-\|claude-sonnet-3\|claude-haiku-3" --include="*.ts" --include="*.tsx" --include="*.md" . | grep -v node_modules | grep -v .next
```
Los modelos actuales son `claude-sonnet-4-6` y `claude-haiku-4-5`.

### CHECK RÁPIDO (para guion individual — solo estos 4)
Cuando se corre antes de `/guion`, ejecutar solo: CHECK 3 + CHECK 4 + CHECK 10 + CHECK 11.
Resultado abreviado, no tabla completa.

## Formato de reporte

Presentar así:

```
## Auditoría de Consistencia — [FECHA]

| Check | Estado | Detalle |
|-------|--------|---------|
| Puertos | ✅/❌ | ... |
| Referencias deprecadas | ✅/❌ | ... |
| Conteos | ✅/❌ | ... |
| Archivos fantasma | ✅/❌ | ... |
| Schema vs código | ✅/❌ | ... |
| Funnel stages | ✅/❌ | ... |
| Hook types | ✅/❌ | ... |
| Diversidad | ✅/❌ | ... |
| Micro-creencias | ✅/❌ | ... |
| Motor audiencia | ✅/❌ | ... |
| Pre-flight/validación | ✅/❌ | ... |
| Modelos IA | ✅/❌ | ... |

### Errores encontrados: N
[Lista de errores con archivo y línea]

### Acción recomendada
[Qué corregir]
```

## Si el argumento es "fix"

Corregir automáticamente todo lo que se pueda sin romper funcionalidad:
- Puertos → reemplazar
- BOFU → RETARGET en código (no en datos históricos)
- Conteos → actualizar en MEMORY.md
- Referencias deprecadas → actualizar texto

**NUNCA corregir automáticamente:**
- Datos en `.data/generations/` (son históricos)
- Campos en `matriz-cobertura.md` (requiere reescaneo completo)
- Schema TypeScript (puede romper la app)
