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
        class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] sm:max-h-[80vh] overflow-hidden flex flex-col border border-gray-100 m-2 sm:m-0"
        @mousedown.stop
        @mouseup.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar Anime</span>
          </h2>
          <button 
            @click="$emit('close')"
            class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search Input -->
        <div class="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div class="flex-1 relative">
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Busca un anime... (ej: Naruto, One Piece)"
                class="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              />
              <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              @click="handleSearch"
              :disabled="loading || !searchQuery.trim()"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
          </div>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div v-if="loading" class="text-center py-12" role="status" aria-live="polite" aria-label="Buscando animes">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600" aria-hidden="true"></div>
            <p class="mt-4 text-gray-500">Buscando animes...</p>
          </div>

          <div v-else-if="error" class="text-center py-12" role="alert" aria-live="polite">
            <p class="text-red-500">{{ error }}</p>
          </div>

          <div v-else-if="results.length === 0 && searchQuery" class="text-center py-12" role="status" aria-live="polite">
            <p class="text-gray-500">No se encontraron animes</p>
          </div>

          <div v-else-if="results.length > 0" class="space-y-3">
            <div
              v-for="anime in results"
              :key="anime.mal_id || anime.id"
              @click="selectAnime(anime)"
              class="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div class="flex space-x-4">
                <img
                  :src="anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.coverImage?.large"
                  :alt="anime.title"
                  class="w-20 h-28 object-cover rounded-lg"
                  loading="lazy"
                  @error="handleImageError"
                />
                <div class="flex-1">
                  <h3 class="font-bold text-lg text-gray-800 mb-1">
                    {{ anime.title || anime.title?.romaji || 'Sin título' }}
                  </h3>
                  <p v-if="anime.title_english || anime.title?.english" class="text-sm text-gray-500 mb-2">
                    {{ anime.title_english || anime.title?.english }}
                  </p>
                  <div class="flex flex-wrap gap-2 mb-2">
                    <span v-if="anime.score" class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                      ⭐ {{ anime.score }}
                    </span>
                    <span v-if="anime.episodes" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {{ anime.episodes }} episodios
                    </span>
                    <span v-if="anime.status" class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      {{ anime.status }}
                    </span>
                  </div>
                  <p v-if="anime.synopsis" class="text-sm text-gray-600 line-clamp-2">
                    {{ anime.synopsis }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-500">
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

const overlayRef = ref(null)
const modalContentRef = ref(null)
const mouseDownTarget = ref(null)

let searchTimeout = null

// Manejar mousedown en el overlay
const handleOverlayMouseDown = (event) => {
  // Guardar dónde comenzó el mousedown
  mouseDownTarget.value = event.target
}

// Manejar mouseup en el overlay
const handleOverlayMouseUp = (event) => {
  // Solo cerrar si tanto el mousedown como el mouseup fueron en el overlay
  // (no en el contenido del modal)
  if (
    mouseDownTarget.value === overlayRef.value && 
    event.target === overlayRef.value
  ) {
    emit('close')
  }
  // Resetear el flag
  mouseDownTarget.value = null
}

// Debounce para evitar demasiadas requests
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500) // Esperar 500ms después de que el usuario deje de escribir
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }

  // Verificar caché
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
    
    // Guardar en caché
    searchCache.set(searchQuery.value, data)
  } catch (err) {
    // El error ya fue manejado por handleError y se mostrará en la notificación
    error.value = 'No se pudieron cargar los resultados. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

const selectAnime = (anime) => {
  // Solo extraer nombre e imagen_url de la API
  const formattedAnime = animeApiService.formatJikanAnime(anime)
  emit('select', formattedAnime)
  
  // Limpiar el campo de búsqueda y resultados
  searchQuery.value = ''
  results.value = []
  error.value = null
  
  // Limpiar el timeout si existe
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
  
  emit('close')
}

// Limpiar cuando se cierra el modal
watch(() => props.show, (newVal) => {
  if (!newVal) {
    // Cuando el modal se cierra, limpiar todo
    searchQuery.value = ''
    results.value = []
    error.value = null
    
    // Limpiar el timeout si existe
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
  }
})

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin imagen%3C/text%3E%3C/svg%3E'
}

// Cerrar con Escape
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
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
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

