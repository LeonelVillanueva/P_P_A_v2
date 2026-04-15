import { ref, watch, computed } from 'vue'

const STEP_LABELS = {
  basic: 'Datos básicos',
  serie: 'Serie y fechas',
  cover: 'Portada',
  emission: 'Agenda',
  revision: 'Seguimiento'
}

const BASE_STEP_IDS = ['basic', 'serie', 'cover', 'emission']

/**
 * Navegación y validación por pasos del modal de anime.
 * @param {{ formData: import('vue').Ref<object>, temporadas: import('vue').Ref|import('vue').ComputedRef<Array>, estadosPasoSeguimiento: import('vue').Ref|import('vue').ComputedRef }} opts
 */
export function useAnimeModalSteps({ formData, temporadas, estadosPasoSeguimiento }) {
  const tieneEtiquetasTemporadaEnConfig = computed(() =>
    (temporadas.value || []).some((t) => String(t || '').trim() !== '')
  )

  const mostrarTipoYNumeroTemporada = computed(() => !tieneEtiquetasTemporadaEnConfig.value)

  const mostrarBloqueRevisionInfo = computed(() => {
    const estado = formData.value.estado
    if (!estado) return false
    const cfg = estadosPasoSeguimiento.value
    if (cfg == null) return true
    return cfg.length > 0 && cfg.includes(estado)
  })

  const stepIds = computed(() => {
    const ids = [...BASE_STEP_IDS]
    if (mostrarBloqueRevisionInfo.value) ids.push('revision')
    return ids
  })

  const totalSteps = computed(() => stepIds.value.length)
  const currentStepIndex = ref(0)
  const currentStepId = computed(() => stepIds.value[currentStepIndex.value] || 'basic')

  const currentStepLabel = computed(() => {
    if (currentStepId.value === 'serie' && !mostrarTipoYNumeroTemporada.value) {
      return 'Fecha de estreno'
    }
    return STEP_LABELS[currentStepId.value] || ''
  })

  const currentStepDisplay = computed(() => currentStepIndex.value + 1)

  function stepOrder(id) {
    const i = stepIds.value.indexOf(id)
    return i >= 0 ? i + 1 : 0
  }

  function stepTooltip(sid) {
    if (sid === 'serie' && !mostrarTipoYNumeroTemporada.value) return 'Fecha de estreno'
    return STEP_LABELS[sid] || sid
  }

  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value >= totalSteps.value - 1)

  const canSkipCurrentStep = computed(() => !isFirstStep.value && !isLastStep.value)

  const stepError = ref('')

  function clampStepIndex() {
    const max = Math.max(0, stepIds.value.length - 1)
    if (currentStepIndex.value > max) currentStepIndex.value = max
  }

  watch(stepIds, () => {
    clampStepIndex()
  })

  watch(() => formData.value.estado, () => {
    clampStepIndex()
  })

  function validateBasic() {
    stepError.value = ''
    if (!formData.value.titulo_original?.trim()) {
      stepError.value = 'Indica el título original de la obra.'
      return false
    }
    if (!formData.value.estado) {
      stepError.value = 'Selecciona un estado.'
      return false
    }
    return true
  }

  function goNext() {
    if (currentStepId.value === 'basic' && !validateBasic()) return
    if (currentStepIndex.value < stepIds.value.length - 1) {
      currentStepIndex.value += 1
      stepError.value = ''
    }
  }

  function skipStep() {
    if (isFirstStep.value) return
    if (currentStepIndex.value < stepIds.value.length - 1) {
      currentStepIndex.value += 1
      stepError.value = ''
    }
  }

  function goPrev() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value -= 1
      stepError.value = ''
    }
  }

  function goToStepIndex(i) {
    if (i < 0 || i >= stepIds.value.length) return
    if (i <= currentStepIndex.value) {
      currentStepIndex.value = i
      stepError.value = ''
    }
  }

  function resetStepUi() {
    currentStepIndex.value = 0
    stepError.value = ''
  }

  function runPrimarySubmit(emit, getFormData) {
    if (!isLastStep.value) {
      goNext()
      return
    }
    if (!validateBasic()) {
      currentStepIndex.value = 0
      return
    }
    emit('submit', getFormData())
  }

  return {
    stepIds,
    stepLabels: STEP_LABELS,
    totalSteps,
    currentStepIndex,
    currentStepId,
    currentStepLabel,
    currentStepDisplay,
    mostrarTipoYNumeroTemporada,
    stepOrder,
    stepTooltip,
    isFirstStep,
    isLastStep,
    canSkipCurrentStep,
    stepError,
    validateBasic,
    goNext,
    goPrev,
    skipStep,
    goToStepIndex,
    resetStepUi,
    runPrimarySubmit
  }
}
