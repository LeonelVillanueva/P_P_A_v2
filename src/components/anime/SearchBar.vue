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
        </select>

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
const filters = ref({
  estado: '',
  temporada: '',
  sortBy: ''
})

let searchTimeout = null

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() || 
         filters.value.estado || 
         filters.value.temporada || 
         filters.value.sortBy
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
    sortBy: ''
  }
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

