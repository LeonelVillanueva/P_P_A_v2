<template>
  <Transition name="modal">
    <div
      v-if="show"
      ref="overlayRef"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @mousedown="handleOverlayMouseDown"
      @mouseup="handleOverlayMouseUp"
    >
      <div
        ref="modalContentRef"
        class="modal-dialog-shell bg-elevated flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-subtle shadow-2xl m-2 sm:m-0 sm:max-h-[80vh]"
        @mousedown.stop
        @mouseup.stop
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted/90 px-5 py-4 sm:px-6"
        >
          <h2 class="font-display flex items-center gap-2 text-lg font-semibold text-ink sm:text-xl">
            <svg class="h-6 w-6 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Buscar anime</span>
          </h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/25"
            @click="$emit('close')"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search Input -->
        <div class="shrink-0 border-b border-border-subtle bg-surface-muted/40 p-4 sm:p-5">
          <div class="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <p>Explora resultados de Jikan y fallback de AniList automáticamente.</p>
            <div class="inline-flex items-center gap-1">
              <kbd class="rounded border border-border-subtle bg-elevated px-1.5 py-0.5 text-[11px] text-ink">Enter</kbd>
              <span>Buscar</span>
            </div>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div class="relative min-w-0 flex-1">
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Busca un anime… (ej: Naruto, One Piece)"
                class="w-full rounded-xl border border-border-subtle bg-elevated py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                @input="debouncedSearch"
                @keydown.enter.prevent="handleSearch"
              />
              <svg
                class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              type="button"
              :disabled="loading || !searchQuery.trim()"
              class="shrink-0 rounded-xl bg-gradient-to-r from-accent to-accent-hover px-6 py-3 text-sm font-semibold text-accent-foreground shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleSearch"
            >
              Buscar
            </button>
          </div>
        </div>

        <!-- Results -->
        <div class="min-h-0 flex-1 overflow-y-auto bg-surface-muted/25 p-4 sm:p-6">
          <div v-if="loading" class="py-12 text-center" role="status" aria-live="polite" aria-label="Buscando animes">
            <div
              class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent/25 border-t-accent"
              aria-hidden="true"
            />
            <p class="mt-4 text-sm text-ink-muted">Buscando animes…</p>
          </div>

          <div v-else-if="error" class="py-12 text-center" role="alert" aria-live="polite">
            <p class="text-sm text-danger">{{ error }}</p>
          </div>

          <div v-else-if="results.length === 0 && searchQuery" class="py-12 text-center" role="status" aria-live="polite">
            <p class="text-sm text-ink-muted">No se encontraron animes</p>
          </div>

          <div v-else-if="results.length > 0" class="space-y-3">
            <div
              v-for="(anime, index) in results"
              :key="anime.mal_id || anime.id"
              class="group cursor-pointer rounded-xl border border-border-subtle bg-elevated p-4 shadow-card transition hover:border-accent/35 hover:shadow-card-lg"
              @click="selectAnime(anime)"
            >
              <div class="flex gap-4">
                <img
                  :src="anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.coverImage?.large"
                  :alt="anime.title"
                  class="h-28 w-20 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                  @error="handleImageError"
                />
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center justify-between gap-3">
                    <span class="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                      #{{ index + 1 }}
                    </span>
                    <span class="text-xs text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">Seleccionar</span>
                  </div>
                  <h3 class="mb-1 text-lg font-semibold text-ink">
                    {{ anime.title || anime.title?.romaji || 'Sin título' }}
                  </h3>
                  <p v-if="anime.title_english || anime.title?.english" class="mb-2 text-sm text-ink-muted">
                    {{ anime.title_english || anime.title?.english }}
                  </p>
                  <div class="mb-2 flex flex-wrap gap-2">
                    <span
                      v-if="anime.score"
                      class="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900"
                    >
                      ⭐ {{ anime.score }}
                    </span>
                    <span
                      v-if="anime.episodes"
                      class="rounded bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-900"
                    >
                      {{ anime.episodes }} episodios
                    </span>
                    <span
                      v-if="anime.status"
                      class="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900"
                    >
                      {{ anime.status }}
                    </span>
                  </div>
                  <p v-if="anime.synopsis" class="line-clamp-2 text-sm text-ink-muted">
                    {{ anime.synopsis }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="py-12 text-center text-ink-muted">
            <p>Escribe el nombre de un anime para buscar</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { animeApiService } from '../../services/animeApiService'
import { useErrorStore } from '../../stores/errorStore'
import { useSearchCache } from '../../composables/useSearchCache'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'select'])

const errorStore = useErrorStore()
const searchCache = useSearchCache()
const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const error = ref(null)
const searchInputRef = ref(null)

const overlayRef = ref(null)
const modalContentRef = ref(null)
const mouseDownTarget = ref(null)

let searchTimeout = null

const handleOverlayMouseDown = (event) => {
  mouseDownTarget.value = event.target
}

const handleOverlayMouseUp = (event) => {
  if (mouseDownTarget.value === overlayRef.value && event.target === overlayRef.value) {
    emit('close')
  }
  mouseDownTarget.value = null
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }

  const cached = searchCache.get(searchQuery.value)
  if (cached) {
    results.value = cached
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await errorStore.handleError(
      () => animeApiService.search(searchQuery.value, 10),
      'Búsqueda de Animes',
      { query: searchQuery.value }
    )
    results.value = data

    searchCache.set(searchQuery.value, data)
  } catch {
    error.value = 'No se pudieron cargar los resultados. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

const selectAnime = (anime) => {
  const formattedAnime = animeApiService.formatJikanAnime(anime)
  emit('select', formattedAnime)

  searchQuery.value = ''
  results.value = []
  error.value = null

  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  emit('close')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 20)
  } else {
    searchQuery.value = ''
    results.value = []
    error.value = null

    if (searchTimeout) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
  }
})

const handleImageError = (event) => {
  event.target.src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin imagen%3C/text%3E%3C/svg%3E'
}

const handleEscape = (e) => {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
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
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog-shell,
.modal-leave-active .modal-dialog-shell {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.modal-enter-from .modal-dialog-shell,
.modal-leave-to .modal-dialog-shell {
  transform: scale(0.95);
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
