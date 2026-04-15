<template>
  <div class="mb-4">
    <div class="bg-elevated rounded-card shadow-card border border-border-subtle p-3 sm:p-4">
      <!-- Fila 1: búsqueda (prioridad visual) -->
      <div class="relative w-full">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar anime por nombre..."
          class="w-full px-4 py-3 pl-11 border-2 border-border-subtle rounded-card focus:ring-2 focus:ring-accent-ring focus:border-accent transition-all outline-none bg-elevated text-ink placeholder:text-ink-subtle"
          :aria-label="'Buscar anime por nombre'"
          data-main-anime-search="true"
          @input="handleSearch"
        />
        <svg class="absolute left-3 top-3.5 w-5 h-5 text-ink-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Fila 2: filtros (secundarios, wrap en desktop) -->
      <div class="mt-3 flex flex-wrap items-end gap-2 sm:gap-3">
        <select
          v-model="filters.estado"
          class="min-w-[10rem] flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-border-subtle rounded-card focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none bg-elevated text-ink text-sm sm:text-base"
          aria-label="Filtrar por estado"
          @change="handleFilterChange"
        >
          <option value="">Todos los estados</option>
          <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
        </select>

        <select
          v-model="filters.temporada"
          class="min-w-[10rem] flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-border-subtle rounded-card focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none bg-elevated text-ink text-sm sm:text-base"
          aria-label="Filtrar por temporada"
          @change="handleFilterChange"
        >
          <option value="">Todas las temporadas</option>
          <option v-for="temp in temporadas" :key="temp" :value="temp">{{ temp }}</option>
        </select>

        <select
          v-model="filters.sortBy"
          class="min-w-[11rem] flex-1 sm:flex-[1_1_12rem] px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-border-subtle rounded-card focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none bg-elevated text-ink text-sm sm:text-base"
          aria-label="Ordenar resultados"
          @change="handleFilterChange"
        >
          <option value="">Sin ordenar</option>
          <option value="nombre-asc">Nombre (A-Z)</option>
          <option value="nombre-desc">Nombre (Z-A)</option>
          <option value="fecha-desc">Más recientes</option>
          <option value="fecha-asc">Más antiguos</option>
          <option value="actualizado-desc">Última actualización</option>
          <option value="fecha-estreno-asc">Fecha estreno (próximos)</option>
          <option value="fecha-estreno-desc">Fecha estreno (pasados)</option>
        </select>

        <button
          type="button"
          class="px-4 py-2.5 sm:py-3 bg-accent-muted hover:bg-accent-subtle text-accent rounded-card font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-ring flex items-center gap-2 shrink-0"
          aria-label="Filtros avanzados"
          @click="showAdvanced = !showAdvanced"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span class="hidden sm:inline">Avanzado</span>
        </button>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="px-4 py-2.5 sm:py-3 bg-surface-muted hover:bg-border-subtle text-ink-muted rounded-card font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-strong shrink-0"
          aria-label="Limpiar filtros"
          @click="clearFilters"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Filtros Avanzados (expandible) -->
      <Transition name="slide-down">
        <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-border-subtle">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-semibold text-ink mb-2">Año</label>
              <input
                v-model.number="filters.año"
                type="number"
                placeholder="Ej: 2024"
                class="w-full px-3 py-2 border-2 border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none text-sm bg-elevated text-ink"
                @input="handleFilterChange"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-ink mb-2">Episodios (mín)</label>
              <input
                v-model.number="filters.episodiosMin"
                type="number"
                placeholder="Ej: 12"
                class="w-full px-3 py-2 border-2 border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none text-sm bg-elevated text-ink"
                @input="handleFilterChange"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-ink mb-2">Estreno desde</label>
              <input
                v-model="filters.fechaDesde"
                type="date"
                class="w-full px-3 py-2 border-2 border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none text-sm bg-elevated text-ink"
                @change="handleFilterChange"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-ink mb-2">Estreno hasta</label>
              <input
                v-model="filters.fechaHasta"
                type="date"
                class="w-full px-3 py-2 border-2 border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-ring focus:border-accent outline-none text-sm bg-elevated text-ink"
                @change="handleFilterChange"
              />
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                @click="saveFilterPreset"
              >
                Guardar filtros
              </button>
              <select
                v-if="savedFilters.length > 0"
                v-model="selectedPreset"
                class="px-3 py-1.5 border-2 border-border-subtle rounded-lg text-sm focus:ring-2 focus:ring-accent-ring outline-none bg-elevated text-ink"
                @change="loadFilterPreset"
              >
                <option value="">Filtros guardados...</option>
                <option v-for="preset in savedFilters" :key="preset.id" :value="preset.id">
                  {{ preset.name }}
                </option>
              </select>
            </div>
            <button
              v-if="selectedPreset"
              type="button"
              class="px-3 py-1.5 bg-danger-muted text-danger rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              @click="deleteFilterPreset"
            >
              Eliminar preset
            </button>
          </div>
        </div>
      </Transition>

      <div v-if="searchQuery || hasActiveFilters" class="mt-3 text-sm text-ink-muted">
        <span v-if="isGlobalSearch" class="text-accent font-semibold">Búsqueda global:</span>
        Mostrando {{ filteredCount }} de {{ totalCount }} animes
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { setMainSearchFocusHandler } from '../../utils/searchFocusBridge'

defineProps({
  estados: {
    type: Array,
    default: () => []
  },
  temporadas: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  filteredCount: {
    type: Number,
    default: 0
  },
  isGlobalSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:filters', 'update:search'])

const searchInputRef = ref(null)
const searchQuery = ref('')
const showAdvanced = ref(false)
const selectedPreset = ref('')
const savedFilters = ref([])

const filters = ref({
  estado: '',
  temporada: '',
  sortBy: '',
  año: null,
  episodiosMin: null,
  fechaDesde: '',
  fechaHasta: ''
})

let searchTimeout = null

const loadSavedFilters = () => {
  try {
    const stored = localStorage.getItem('anime_filter_presets')
    if (stored) {
      savedFilters.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error cargando filtros guardados:', error)
  }
}

const saveSavedFilters = () => {
  try {
    localStorage.setItem('anime_filter_presets', JSON.stringify(savedFilters.value))
  } catch (error) {
    console.error('Error guardando filtros:', error)
  }
}

const saveFilterPreset = () => {
  const name = prompt('Nombre del preset de filtros:')
  if (!name) return

  const preset = {
    id: Date.now(),
    name,
    filters: { ...filters.value },
    searchQuery: searchQuery.value
  }

  savedFilters.value.push(preset)
  saveSavedFilters()
  selectedPreset.value = preset.id
}

const loadFilterPreset = () => {
  if (!selectedPreset.value) return

  const preset = savedFilters.value.find(p => p.id === selectedPreset.value)
  if (preset) {
    filters.value = { ...preset.filters }
    searchQuery.value = preset.searchQuery || ''
    handleFilterChange()
    handleSearch()
  }
}

const deleteFilterPreset = () => {
  if (!selectedPreset.value) return
  if (!confirm('¿Eliminar este preset de filtros?')) return

  savedFilters.value = savedFilters.value.filter(p => p.id !== selectedPreset.value)
  saveSavedFilters()
  selectedPreset.value = ''
}

loadSavedFilters()

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() ||
         filters.value.estado ||
         filters.value.temporada ||
         filters.value.sortBy ||
         filters.value.año ||
         filters.value.episodiosMin ||
         filters.value.fechaDesde ||
         filters.value.fechaHasta
})

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('update:search', searchQuery.value.trim())
  }, 300)
}

const handleFilterChange = () => {
  emit('update:filters', { ...filters.value })
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    estado: '',
    temporada: '',
    sortBy: '',
    año: null,
    episodiosMin: null,
    fechaDesde: '',
    fechaHasta: ''
  }
  selectedPreset.value = ''
  emit('update:search', '')
  emit('update:filters', { ...filters.value })
}

function focusSearchInput() {
  const el = searchInputRef.value
  if (el && typeof el.focus === 'function') {
    el.focus()
    el.select?.()
  }
}

onMounted(() => {
  setMainSearchFocusHandler(focusSearchInput)
})

onUnmounted(() => {
  setMainSearchFocusHandler(null)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

defineExpose({
  focusSearch: focusSearchInput
})
</script>
