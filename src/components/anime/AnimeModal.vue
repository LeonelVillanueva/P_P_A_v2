<template>
  <Transition name="modal">
    <div
      v-if="show"
      ref="overlayRef"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4 bg-black bg-opacity-50"
      @mousedown="handleOverlayMouseDown"
      @mouseup="(e) => handleOverlayMouseUp(e, { loading })"
    >
      <div
        class="my-auto flex max-h-[92vh] w-full max-w-[calc(100vw-1.5rem)] flex-col items-stretch justify-center gap-0 sm:max-w-none sm:flex-row sm:items-stretch sm:justify-center"
      >
        <div
          ref="modalContentRef"
          class="bg-elevated shadow-card-lg max-w-xl w-full max-h-[92vh] flex flex-col border border-border-subtle m-1 sm:m-0"
          :class="modalShellClass"
          @mousedown.stop
          @mouseup.stop
        >
          <div class="shrink-0 bg-gradient-to-r from-accent to-accent-hover px-4 py-4 sm:px-5 sm:py-4 flex justify-between items-center gap-2 rounded-t-2xl">
            <h2 class="text-lg sm:text-xl font-bold text-accent-foreground flex items-center gap-2 min-w-0 font-display">
              <svg v-if="isEditing" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <svg v-else class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="truncate">{{ isEditing ? 'Editar anime' : 'Nuevo anime' }}</span>
            </h2>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                v-if="!isEditing"
                type="button"
                class="text-accent-foreground/90 hover:text-accent-foreground hover:bg-white/20 rounded-lg px-2.5 py-1.5 transition-all text-sm flex items-center gap-1.5"
                title="Buscar anime en la API"
                @click="emit('open-search')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="hidden sm:inline">Buscar</span>
              </button>
              <button
                type="button"
                class="text-accent-foreground/90 hover:text-accent-foreground hover:bg-white/20 rounded-lg p-1.5 transition-all"
                @click="$emit('close')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="shrink-0 px-3 sm:px-4 pt-3 pb-2 border-b border-border-subtle bg-surface-muted/90">
            <div class="flex items-center justify-between gap-1 text-[10px] sm:text-xs text-ink-muted mb-1.5">
              <span>Paso {{ currentStepDisplay }} de {{ totalSteps }}</span>
              <span class="font-medium text-accent truncate max-w-[55%] text-right">{{ currentStepLabel }}</span>
            </div>
            <div class="flex gap-1" role="tablist" aria-label="Pasos del formulario">
              <button
                v-for="(sid, i) in stepIds"
                :key="sid"
                type="button"
                role="tab"
                :aria-selected="i === currentStepIndex"
                :aria-current="i === currentStepIndex ? 'step' : undefined"
                class="h-1.5 flex-1 rounded-full transition-colors min-w-0"
                :class="i < currentStepIndex ? 'bg-accent-border' : i === currentStepIndex ? 'bg-accent' : 'bg-border-subtle'"
                :title="stepTooltip(sid)"
                @click="goToStepIndex(i)"
              />
            </div>
          </div>

          <form class="flex flex-col flex-1 min-h-0" @submit.prevent="runPrimarySubmit">
            <div class="flex-1 overflow-y-auto px-3 sm:px-4 py-3 bg-surface-muted/50">
              <Transition name="step" mode="out-in">
                <div :key="currentStepId" class="space-y-3">
                  <AnimeModalStepBasic
                    v-if="currentStepId === 'basic'"
                    v-model:form-data="formData"
                    v-model:obras-list-panel-open="obrasListPanelOpen"
                    :estados="estados"
                    :temporadas="temporadas"
                    :titulo-obra-field-key="tituloObraFieldKey"
                    :step-error="stepError"
                    :step-order="stepOrder"
                  />
                  <AnimeModalStepSerie
                    v-else-if="currentStepId === 'serie'"
                    v-model:form-data="formData"
                    :mostrar-tipo-y-numero-temporada="mostrarTipoYNumeroTemporada"
                    :step-order="stepOrder"
                  />
                  <AnimeModalStepCover
                    v-else-if="currentStepId === 'cover'"
                    v-model:form-data="formData"
                    :preview-image="previewImage"
                    :step-order="stepOrder"
                    @image-change="handleImageChange"
                    @image-error="handleImageError"
                    @open-search-cover="emit('open-search', { mergeCover: true })"
                  />
                  <AnimeModalStepEmission
                    v-else-if="currentStepId === 'emission'"
                    v-model:form-data="formData"
                    :step-order="stepOrder"
                  />
                  <AnimeModalStepRevision
                    v-else-if="currentStepId === 'revision'"
                    v-model:form-data="formData"
                    :step-order="stepOrder"
                    @marcar-hoy="marcarRevisionHoy"
                  />
                </div>
              </Transition>
            </div>

            <div class="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-3 border-t border-border-subtle bg-elevated rounded-b-2xl">
              <div class="flex items-center gap-2 order-2 sm:order-1">
                <button
                  type="button"
                  class="px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted rounded-lg font-medium"
                  @click="$emit('close')"
                >
                  Cancelar
                </button>
              </div>
              <div class="flex flex-wrap items-center justify-end gap-2 order-1 sm:order-2">
                <button
                  v-if="!isFirstStep"
                  type="button"
                  class="px-3 py-2 text-sm text-ink bg-surface-muted rounded-lg hover:bg-border-subtle font-medium"
                  @click="goPrev"
                >
                  Atrás
                </button>
                <button
                  v-if="canSkipCurrentStep"
                  type="button"
                  class="px-2 py-2 text-xs sm:text-sm text-accent hover:underline font-medium"
                  @click="skipStep"
                >
                  Omitir paso
                </button>
                <button
                  v-if="!isLastStep"
                  type="button"
                  class="px-4 py-2 text-sm text-accent-foreground bg-gradient-to-r from-accent to-accent-hover rounded-lg hover:brightness-110 font-semibold shadow-card"
                  @click="goNext"
                >
                  Siguiente
                </button>
                <button
                  v-else
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 text-sm text-accent-foreground bg-gradient-to-r from-accent to-accent-hover rounded-lg font-semibold shadow-card disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ loading ? 'Guardando…' : (isEditing ? 'Guardar' : 'Crear') }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <Transition name="slide-obras-panel">
          <aside
            v-if="obrasPanelVisible"
            class="m-1 flex max-h-[92vh] min-h-0 w-full flex-col overflow-hidden rounded-b-2xl border border-border-subtle bg-elevated shadow-card-lg sm:m-0 sm:w-[min(92vw,26rem)] sm:shrink-0 sm:rounded-l-none sm:rounded-r-2xl sm:border-l-0 sm:border-t-0 sm:border-border-subtle"
          >
            <TituloObraPickerPanel
              v-model="formData.titulo_original"
              @picked="obrasListPanelOpen = false"
              @close="obrasListPanelOpen = false"
            />
          </aside>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAnimeForm } from '../../composables/useAnimeForm'
import { useAnimeModalSteps } from '../../composables/useAnimeModalSteps'
import { useModalOverlay } from '../../composables/useModalOverlay'
import TituloObraPickerPanel from './TituloObraPickerPanel.vue'
import AnimeModalStepBasic from './anime-modal/AnimeModalStepBasic.vue'
import AnimeModalStepSerie from './anime-modal/AnimeModalStepSerie.vue'
import AnimeModalStepCover from './anime-modal/AnimeModalStepCover.vue'
import AnimeModalStepEmission from './anime-modal/AnimeModalStepEmission.vue'
import AnimeModalStepRevision from './anime-modal/AnimeModalStepRevision.vue'

const props = defineProps({
  show: Boolean,
  anime: { type: Object, default: null },
  estados: { type: Array, default: () => [] },
  estadosPasoSeguimiento: {
    default: null,
    validator: (v) => v === null || Array.isArray(v)
  },
  temporadas: { type: Array, default: () => [] },
  loading: Boolean,
  defaultEstado: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'submit', 'open-search'])

const modalContentRef = ref(null)
const tituloObraFieldKey = ref(0)
const obrasListPanelOpen = ref(false)

const { overlayRef, handleOverlayMouseDown, handleOverlayMouseUp } = useModalOverlay(() =>
  emit('close')
)

const {
  formData,
  previewImage,
  imageFile: _imageFile,
  isEditing,
  resetForm,
  handleImageChange,
  applyExternalImageUrl,
  getFormData
} = useAnimeForm(computed(() => props.anime))

const temporadasRef = computed(() => props.temporadas)
const estadosPasoRef = computed(() => props.estadosPasoSeguimiento)

const {
  stepIds,
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
  goNext,
  goPrev,
  skipStep,
  goToStepIndex,
  resetStepUi,
  runPrimarySubmit: runPrimarySubmitFromSteps
} = useAnimeModalSteps({
  formData,
  temporadas: temporadasRef,
  estadosPasoSeguimiento: estadosPasoRef
})

const obrasPanelVisible = computed(
  () => obrasListPanelOpen.value && currentStepId.value === 'basic'
)

const modalShellClass = computed(() => {
  if (!obrasPanelVisible.value) {
    return 'rounded-2xl'
  }
  return [
    'rounded-t-2xl rounded-b-none border-b-0',
    'sm:rounded-l-2xl sm:rounded-r-none sm:rounded-b-2xl sm:border-b sm:border-r-0'
  ].join(' ')
})

function applyApiSearchResult(animeData) {
  if (animeData?.imagen_url) {
    applyExternalImageUrl(animeData.imagen_url)
  }
}

defineExpose({ applyApiSearchResult })

const marcarRevisionHoy = () => {
  formData.value.ultima_revision_info = new Date().toISOString().slice(0, 10)
}

function runPrimarySubmit() {
  runPrimarySubmitFromSteps(emit, getFormData)
}

watch(currentStepId, (id) => {
  if (id !== 'basic') {
    obrasListPanelOpen.value = false
  }
})

watch(
  () => props.show,
  (newVal) => {
    resetStepUi()
    obrasListPanelOpen.value = false
    if (newVal) {
      tituloObraFieldKey.value += 1
      if (props.anime && props.anime.id) {
        resetForm(props.anime)
      } else if (props.anime && props.anime.estado) {
        resetForm(props.anime)
      } else if (props.defaultEstado) {
        resetForm({ estado: props.defaultEstado })
      } else {
        resetForm(null)
      }
    }
  }
)

watch(
  () => props.anime,
  (newAnime) => {
    if (props.show && newAnime) {
      resetForm(newAnime)
    }
  },
  { deep: true }
)

const handleImageError = (event) => {
  event.target.src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
}

const handleEscape = (e) => {
  if (e.key !== 'Escape' || !props.show || props.loading) return
  if (obrasListPanelOpen.value) {
    obrasListPanelOpen.value = false
    return
  }
  emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-elevated,
.modal-leave-active .bg-elevated {
  transition: transform 0.25s ease;
}
.modal-enter-from .bg-elevated,
.modal-leave-to .bg-elevated {
  transform: scale(0.96);
}

.step-enter-active,
.step-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.slide-obras-panel-enter-active,
.slide-obras-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.22s ease;
}
.slide-obras-panel-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.slide-obras-panel-leave-to {
  opacity: 0;
  transform: translateX(0.75rem);
}
@media (max-width: 639px) {
  .slide-obras-panel-enter-from {
    transform: translateY(0.75rem);
  }
  .slide-obras-panel-leave-to {
    transform: translateY(0.5rem);
  }
}
</style>
