<template>
  <div class="mb-6">
    <div class="bg-white rounded-xl shadow-md border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Búsqueda -->
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Buscar anime por nombre..."
            class="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white text-gray-800 placeholder-gray-400"
            :aria-label="'Buscar anime por nombre'"
          />
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Filtro por Estado -->
        <select
          v-model="filters.estado"
          @change="handleFilterChange"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-gray-800"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
        </select>

        <!-- Filtro por Temporada -->
        <select
          v-model="filters.temporada"
          @change="handleFilterChange"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-gray-800"
          aria-label="Filtrar por temporada"
        >
          <option value="">Todas las temporadas</option>
          <option v-for="temp in temporadas" :key="temp" :value="temp">{{ temp }}</option>
        </select>

        <!-- Ordenar -->
        <select
          v-model="filters.sortBy"
          @change="handleFilterChange"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-gray-800"
          aria-label="Ordenar resultados"
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

        <!-- Filtro avanzado toggle -->
        <button
          @click="showAdvanced = !showAdvanced"
          class="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-2"
          aria-label="Filtros avanzados"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span class="hidden sm:inline">Avanzado</span>
        </button>

        <!-- Limpiar Filtros -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Limpiar filtros"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Filtros Avanzados (expandible) -->
      <Transition name="slide-down">
        <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Filtro por año -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Año</label>
              <input
                v-model.number="filters.año"
                type="number"
                placeholder="Ej: 2024"
                class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                @input="handleFilterChange"
              />
            </div>

            <!-- Filtro por episodios -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Episodios (mín)</label>
              <input
                v-model.number="filters.episodiosMin"
                type="number"
                placeholder="Ej: 12"
                class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                @input="handleFilterChange"
              />
            </div>

            <!-- Filtro por fecha de estreno -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Estreno desde</label>
              <input
                v-model="filters.fechaDesde"
                type="date"
                class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                @change="handleFilterChange"
              />
            </div>

            <!-- Filtro por fecha de estreno hasta -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Estreno hasta</label>
              <input
                v-model="filters.fechaHasta"
                type="date"
                class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                @change="handleFilterChange"
              />
            </div>
          </div>

          <!-- Filtros guardados -->
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="saveFilterPreset"
                class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                💾 Guardar filtros
              </button>
              <select
                v-if="savedFilters.length > 0"
                v-model="selectedPreset"
                @change="loadFilterPreset"
                class="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">Filtros guardados...</option>
                <option v-for="preset in savedFilters" :key="preset.id" :value="preset.id">
                  {{ preset.name }}
                </option>
              </select>
            </div>
            <button
              v-if="selectedPreset"
              @click="deleteFilterPreset"
              class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              🗑️ Eliminar preset
            </button>
          </div>
        </div>
      </Transition>

      <!-- Resultados de búsqueda -->
      <div v-if="searchQuery || hasActiveFilters" class="mt-3 text-sm text-gray-600">
        <span v-if="isGlobalSearch" class="text-purple-600 font-semibold">🔍 Búsqueda global:</span>
        Mostrando {{ filteredCount }} de {{ totalCount }} animes
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
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

// Cargar filtros guardados
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

// Guardar filtros guardados
const saveSavedFilters = () => {
  try {
    localStorage.setItem('anime_filter_presets', JSON.stringify(savedFilters.value))
  } catch (error) {
    console.error('Error guardando filtros:', error)
  }
}

// Guardar preset de filtros
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

// Cargar preset de filtros
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

// Eliminar preset
const deleteFilterPreset = () => {
  if (!selectedPreset.value) return
  if (!confirm('¿Eliminar este preset de filtros?')) return

  savedFilters.value = savedFilters.value.filter(p => p.id !== selectedPreset.value)
  saveSavedFilters()
  selectedPreset.value = ''
}

// Cargar al montar
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
  }, 300) // Debounce de 300ms
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

// Limpiar timeout al desmontar
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

