# Script Generator — Instrucciones Automáticas

## Detección automática de intención

Cuando el usuario pida algo relacionado con guiones o estrategia, seguir el proceso COMPLETO de MEMORY.md sin necesidad de comandos. Detectar por contexto:

### Si pide un GUION (detectar: "guion", "script", "ad", "haceme uno de...", "armame un guion", "uno de fitness", "probemos con...", cualquier mención de nicho + generación)
→ Seguir el proceso completo de generación de MEMORY.md:
1. Leer TODOS los archivos de memoria (jesus-adp.md, consejos-jesus.md, jesus-tono-adp-nuevo.md, jesus-historia.md, avatar-frases-reales.md, inteligencia-audiencia.md, tecnicas-retencion.md, tecnicas-venta-emiliano.md, formatos-visuales.md, script-generator-schema.md)
2. Chequear leads quemados
3. Escribir CUERPO primero, después LEADS
4. Validar reglas duras
5. Mostrar al usuario para aprobación
6. Guardar solo si aprueba

### Si pide una ESTRATEGIA SEMANAL (detectar: "estrategia", "plan de la semana", "qué grabamos", "armame 10", "qué hacemos esta semana", "siguiente semana")
→ Seguir el proceso de plan semanal de MEMORY.md:
1. Leer estrategia-semanal.md + matriz-cobertura.md + todos los archivos de contexto
2. Detectar huecos en la matriz
3. Elegir 2 formatos visuales nuevos
4. Armar plan de 10 guiones con justificación
5. Presentar al usuario para aprobación
6. Generar los guiones UNO POR UNO (nunca delegar a agentes)

### Si pide POST-SESIÓN (detectar: "grabamos", "ya grabé", "sesión", "marcar grabados", "métricas", "post-sesión")
→ Seguir el proceso post-sesión de MEMORY.md

## Reglas permanentes

- **NUNCA delegar generación de guiones a subagentes.** Los agentes no tienen el contexto de los archivos de memoria y producen guiones genéricos. Siempre generar en el contexto principal.
- **NUNCA generar guiones sin leer primero TODOS los archivos de memoria.** Si no los leés, el guion va a salir genérico.
- **Idioma:** Español argentino para todo (respuestas, guiones, planes).
- **Si el usuario dice algo ambiguo pero está en contexto de ADP**, asumir que se refiere a guiones/estrategia y actuar.
