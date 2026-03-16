---
name: post-session
description: Flujo post-grabación con Jesús. Actualizar estados, notas, métricas de los guiones grabados.
argument-hint: [batch-name o fecha]
---

# Post-Sesión — ADP (Jesús Tassarolo)

Flujo para después de grabar con Jesús. Actualizar estados de guiones, agregar notas de sesión, y planificar siguiente paso.

## Paso 1: Identificar qué se grabó

Preguntar al usuario o inferir del argumento $ARGUMENTS:
- ¿Qué batch/semana se grabó?
- ¿Se grabaron todos los guiones o solo algunos?

Listar los guiones del batch:
```bash
curl -s http://localhost:3002/api/generations/search | python3 -c "
import sys, json
gens = json.load(sys.stdin)
for g in gens:
    b = g.get('batch')
    if b:
        print(f\"{g['id'][:8]}  {g.get('status','draft'):10s}  {b.get('name','')}  {g.get('title','sin título')}\")
" | head -20
```

## Paso 2: Marcar estados

Para cada guion, preguntar al usuario:
- **Grabado**: se filmó (pasar a "recorded")
- **Borrador**: no se grabó, queda para después
- **Descartado**: Jesús decidió no grabarlo

Actualizar con:
```bash
curl -s -X PATCH http://localhost:3002/api/generate/status \
  -H "Content-Type: application/json" \
  -d '{"generationId":"ID","status":"recorded"}'
```

## Paso 3: Agregar notas de sesión

Para cada guion grabado, preguntar:
- ¿Qué lead eligió Jesús?
- ¿Cambió algo del guion al grabarlo?
- ¿Hubo algo que funcionó especialmente bien?
- ¿Algo que no funcionó o se sintió forzado?

Guardar notas:
```bash
curl -s -X PATCH http://localhost:3002/api/generate/status \
  -H "Content-Type: application/json" \
  -d '{"generationId":"ID","sessionNotes":"NOTAS"}'
```

## Paso 4: Métricas (si hay data de ads)

Si ya se subieron los ads y hay métricas:
```bash
curl -s -X PATCH http://localhost:3002/api/generate/status \
  -H "Content-Type: application/json" \
  -d '{"generationId":"ID","metrics":{"ctr":1.2,"hookRate":35,"holdRate":20,"cpa":5.0}}'
```

Referencia de métricas (Kill/Iterate/Scale):
| Métrica | Kill | Iterate | Scale |
|---------|------|---------|-------|
| CTR | <0.8% | 0.8-1.5% | >1.5% |
| Hook Rate | <20% | 20-35% | >35% |
| Hold Rate | <15% | 15-25% | >25% |
| CPA | >2x target | 1-1.5x | <target |

## Paso 5: Winners

Si algún ad está funcionando bien:
```bash
curl -s -X PATCH http://localhost:3002/api/generate/status \
  -H "Content-Type: application/json" \
  -d '{"generationId":"ID","status":"winner","sessionNotes":"Por qué ganó: lead X, formato Y, ángulo Z"}'
```

## Paso 6: Actualizar matriz de cobertura

Después de procesar todos los guiones:

```
Pedime "actualizá la matriz" para que reescanee todas las generaciones y actualice matriz-cobertura.md
```

## Paso 7: Resumen de sesión

Mostrar al usuario:
- Guiones grabados: X de Y
- Guiones descartados: Z
- Notas clave de la sesión
- Próximos pasos (subir ads, medir, planificar siguiente semana)

## Recordatorios:
- La web tiene vista de sesión en http://localhost:3002/session
- Los guiones se pueden editar inline en la web
- Los packs descargables están en cada guion individual
