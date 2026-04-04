#!/bin/bash
# Gate 0: Process log — verifica que exista un log de proceso para análisis IG
# Gate 1: Linter de estructura — chequea que las 19 secciones existan con profundidad mínima
# Gate 2: Evaluador de calidad — Opus compara contra benchmark de Joaco

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  echo '{"decision":"allow","reason":"No file_path found"}'
  exit 0
fi

# Only validate analysis files
case "$FILE_PATH" in
  *.data/analisis-*|*ANALISIS-COMPLETO-STORIES*|*analisis-completo-stories*|*_analisis.md)
    ;;
  *)
    echo '{"decision":"allow","reason":"No es archivo de análisis"}'
    exit 0
    ;;
esac

PROJECT_DIR="/Users/lean/Documents/script-generator"

# Gate 0: Process log check (only for IG profile analyses _analisis.md)
case "$FILE_PATH" in
  *ig-references/*_analisis.md)
    # Extract username from path
    BASENAME=$(basename "$FILE_PATH" _analisis.md)
    PROCESS_LOG="$PROJECT_DIR/.data/ig-references/${BASENAME}_process-log.json"

    if [ ! -f "$PROCESS_LOG" ]; then
      echo "{\"decision\":\"block\",\"reason\":\"❌ GATE 0: No existe process-log.json para @${BASENAME}. Crear ${BASENAME}_process-log.json con los pasos completados ANTES de guardar el análisis. Correr: node scripts/preflight-analisis-ig.mjs @${BASENAME}\"}"
      exit 2
    fi

    # Verify critical steps are marked complete
    STEPS_OK=$(node -e "
      const log = JSON.parse(require('fs').readFileSync('$PROCESS_LOG', 'utf8'));
      const steps = log.steps_completed || {};
      const missing = [];
      if (!steps.paso_0a_metodologia_read) missing.push('Paso 0a: leer metodología');
      if (!steps.paso_1_data_verified) missing.push('Paso 1: verificar data');
      if (!steps.must_read_files_read) missing.push('Leer archivos previos obligatorios');
      if (!steps.frames_extracted) missing.push('Extraer frames (Pasada 6)');
      if (!steps.cross_profile_validation) missing.push('Cross-profile validation');
      if (!steps.lente_a_done) missing.push('Lente A (top vs bottom)');
      if (missing.length > 0) {
        console.log(JSON.stringify({ok: false, missing}));
      } else {
        console.log(JSON.stringify({ok: true}));
      }
    " 2>/dev/null)

    IS_OK=$(echo "$STEPS_OK" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.ok)" 2>/dev/null)

    if [ "$IS_OK" != "true" ]; then
      MISSING_STEPS=$(echo "$STEPS_OK" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.missing.join(', '))" 2>/dev/null)
      echo "{\"decision\":\"block\",\"reason\":\"❌ GATE 0: Process log incompleto para @${BASENAME}. Pasos faltantes: ${MISSING_STEPS}\"}"
      exit 2
    fi
    ;;
esac

# Gate 1: Structure linter
LINT_RESULT=$(node "$PROJECT_DIR/scripts/validate-analysis.mjs" "$FILE_PATH" 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  echo "$LINT_RESULT"
  exit 2
fi

# Gate 2: Quality evaluator (only if structure passed)
QUALITY_RESULT=$(node "$PROJECT_DIR/scripts/quality-check-analysis.mjs" "$FILE_PATH" 2>&1)
QUALITY_EXIT=$?

if [ $QUALITY_EXIT -ne 0 ]; then
  echo "$QUALITY_RESULT"
  exit 2
fi

# Both passed
echo "$QUALITY_RESULT"
exit 0
