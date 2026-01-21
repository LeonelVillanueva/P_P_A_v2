<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Historial de Actividad</span>
          </h2>
          <button
            @click="$emit('close')"
            class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filtros -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-wrap gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar en historial..."
              class="flex-1 min-w-[200px] px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            />
            <select
              v-model="filterType"
              class="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="create">Crear</option>
              <option value="update">Actualizar</option>
              <option value="delete">Eliminar</option>
              <option value="move">Mover</option>
            </select>
            <button
              v-if="hasFilters"
              @click="clearFilters"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        <!-- Lista de actividad -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="filteredHistory.length === 0" class="text-center py-12 text-gray-500">
            <p>No hay actividad registrada</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="entry in filteredHistory"
              :key="entry.id"
              class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  :class="getTypeColor(entry.type)"
                >
                  {{ getTypeIcon(entry.type) }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900">{{ entry.action }}</p>
                <p v-if="entry.details.anime" class="text-sm text-gray-600 mt-1">
                  {{ entry.details.anime }}
                </p>
                <p v-if="entry.details.details" class="text-xs text-gray-500 mt-1">
                  {{ entry.details.details }}
                </p>
                <p class="text-xs text-gray-400 mt-2">
                  {{ formatDateTime(entry.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            {{ filteredHistory.length }} de {{ history.length }} actividades
          </div>
          <button
            @click="clearAllHistory"
            class="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Limpiar historial
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDateTime } from '../../utils/formatters'

const props = defineProps({
  show: Boolean,
  history: Array
})

const emit = defineEmits(['close', 'clear'])

const searchQuery = ref('')
const filterType = ref('')

const hasFilters = computed(() => {
  return searchQuery.value.trim() || filterType.value
})

const filteredHistory = computed(() => {
  let filtered = [...props.history]

  if (searchQuery.value.trim()) {
    const searchLower = searchQuery.value.toLowerCase()
    filtered = filtered.filter(entry =>
      entry.action.toLowerCase().includes(searchLower) ||
      JSON.stringify(entry.details).toLowerCase().includes(searchLower)
    )
  }

  if (filterType.value) {
    filtered = filtered.filter(entry => entry.type === filterType.value)
  }

  return filtered
})

const getTypeColor = (type) => {
  const colors = {
    create: 'bg-green-500',
    update: 'bg-blue-500',
    delete: 'bg-red-500',
    move: 'bg-purple-500',
    other: 'bg-gray-500'
  }
  return colors[type] || colors.other
}

const getTypeIcon = (type) => {
  const icons = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    move: '↔️',
    other: '📝'
  }
  return icons[type] || icons.other
}

const clearFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
}

const clearAllHistory = () => {
  if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
    emit('clear')
  }
}
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
</style>
