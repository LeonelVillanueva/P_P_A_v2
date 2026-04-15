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
          class="modal-shell bg-elevated shadow-2xl flex w-full max-h-[92vh] max-w-[min(100%,56rem)] flex-col overflow-hidden rounded-xl border border-border-subtle m-1 sm:m-0 md:max-h-[min(92vh,880px)] md:flex-row"
          :class="modalShellClass"
          @mousedown.stop
          @mouseup.stop
        >
          <!-- Sidebar tipo tour: marca + lista de pasos -->
          <aside
            class="flex w-full shrink-0 flex-col gap-6 border-b border-border-subtle bg-surface-muted/90 p-5 md:w-[min(100%,17rem)] md:border-b-0 md:border-r lg:w-72"
            aria-label="Progreso del formulario"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-accent to-accent-hover shadow-md"
                aria-hidden="true"
              >
                <svg class="h-6 w-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="font-display text-base font-semibold text-ink">
                  {{ isEditing ? 'Editar anime' : 'Nuevo anime' }}
                </p>
                <p class="mt-0.5 text-xs leading-snug text-ink-muted">
                  Completa cada paso para guardar la ficha en Hanare.
                </p>
              </div>
            </div>

            <div
              class="space-y-2 border-t border-border-subtle/70 pt-5"
              role="region"
              aria-label="Avance por pasos"
            >
              <div class="flex items-baseline justify-between gap-3 text-xs">
                <span class="shrink-0 font-medium uppercase tracking-wide text-ink-muted"> Progreso </span>
                <span class="min-w-0 text-right text-ink tabular-nums">
                  Paso <span class="font-semibold">{{ currentStepDisplay }}</span> de
                  {{ totalSteps }}
                </span>
              </div>
              <div
                class="h-2.5 w-full overflow-hidden rounded-full bg-border-subtle/80 ring-1 ring-inset ring-black/5"
                role="progressbar"
                :aria-valuenow="currentStepIndex + 1"
                aria-valuemin="1"
                :aria-valuemax="totalSteps"
                :aria-label="`Paso ${currentStepDisplay} de ${totalSteps}`"
              >
                <div
                  class="h-full min-w-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-[width] duration-300 ease-out"
                  :style="{ width: `${stepProgressPercent}%` }"
                />
              </div>
            </div>

            <nav class="flex flex-col gap-3" role="tablist" aria-label="Pasos del formulario">
              <button
                v-for="(sid, i) in stepIds"
                :key="sid"
                type="button"
                role="tab"
                class="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors"
                :class="
                  i === currentStepIndex
                    ? 'bg-accent/15 font-semibold text-ink ring-1 ring-accent/25'
                    : i < currentStepIndex
                      ? 'text-ink hover:bg-surface-muted'
                      : 'cursor-not-allowed text-ink-muted opacity-60'
                "
                :disabled="i > currentStepIndex"
                :aria-selected="i === currentStepIndex"
                :aria-current="i === currentStepIndex ? 'step' : undefined"
                :title="stepTooltip(sid)"
                @click="goToStepIndex(i)"
              >
                <span v-if="i < currentStepIndex" class="text-emerald-600" aria-hidden="true">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span
                  v-else
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :class="i === currentStepIndex ? 'bg-accent' : 'bg-border-subtle'"
                  aria-hidden="true"
                />
                <span class="font-normal leading-tight">{{ stepTooltip(sid) }}</span>
              </button>
            </nav>
          </aside>

          <!-- Contenido principal -->
          <div class="flex min-h-0 min-w-0 flex-1 flex-col">
            <div
              class="flex shrink-0 items-center justify-end gap-2 border-b border-border-subtle bg-elevated px-4 py-3 sm:px-5"
            >
              <div class="flex items-center gap-1.5">
                <button
                  v-if="!isEditing"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                  title="Buscar anime en la API"
                  @click="emit('open-search')"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span class="hidden sm:inline">Buscar</span>
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                  :title="'Cerrar'"
                  @click="$emit('close')"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="runPrimarySubmit">
              <div class="shrink-0 border-b border-border-subtle/80 bg-surface-muted/40 px-4 py-4 sm:px-6">
                <Transition name="step-heading" mode="out-in">
                  <div :key="currentStepId">
                    <h2 class="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                      {{ currentStepLabel }}
                    </h2>
                    <p class="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {{ stepDescription }}
                    </p>
                  </div>
                </Transition>
              </div>

              <div class="flex min-h-0 flex-1 overflow-y-auto bg-surface-muted/30 px-3 py-3 sm:px-5 sm:py-4">
              <Transition name="step" mode="out-in">
                <div :key="currentStepId" class="w-full space-y-3">
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

            <div class="flex shrink-0 flex-col gap-2 border-t border-border-subtle bg-elevated px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3 md:rounded-br-xl">
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
                  class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-foreground shadow-card bg-gradient-to-r from-accent to-accent-hover rounded-lg hover:brightness-110"
                  @click="goNext"
                >
                  Siguiente
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
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
        </div>

        <Transition name="slide-obras-panel">
          <aside
            v-if="obrasPanelVisible"
            class="m-1 flex max-h-[92vh] min-h-0 w-full flex-col overflow-hidden rounded-b-2xl border border-border-subtle bg-elevated shadow-card-lg sm:m-0 sm:w-[min(94vw,min(100%,36rem))] sm:min-w-0 sm:shrink-0 sm:rounded-l-none sm:rounded-r-2xl sm:border-l-0 sm:border-t-0 sm:border-border-subtle"
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
import { ANIME_MODAL_STEP_DESCRIPTIONS } from '../../constants/animeModalStepCopy'

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

const stepDescription = computed(
  () => ANIME_MODAL_STEP_DESCRIPTIONS[currentStepId.value] || ''
)

const stepProgressPercent = computed(() => {
  const n = totalSteps.value
  const idx = currentStepIndex.value
  return n > 0 ? Math.round(((idx + 1) / n) * 100) : 0
})

const modalShellClass = computed(() => {
  if (!obrasPanelVisible.value) {
    return 'rounded-xl'
  }
  return [
    'rounded-t-xl rounded-b-none border-b-0',
    'sm:rounded-l-xl sm:rounded-r-none sm:rounded-b-xl sm:border-b sm:border-r-0'
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
.modal-enter-active .modal-shell,
.modal-leave-active .modal-shell {
  transition: transform 0.25s ease;
}
.modal-enter-from .modal-shell,
.modal-leave-to .modal-shell {
  transform: scale(0.97);
}

.step-heading-enter-active,
.step-heading-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.step-heading-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.step-heading-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
