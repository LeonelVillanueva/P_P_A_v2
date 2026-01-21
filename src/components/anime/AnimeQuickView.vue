<template>
  <Transition name="quick-view">
    <div
      v-if="show && anime"
      class="fixed z-50 pointer-events-none"
      :style="positionStyle"
    >
      <div class="bg-white rounded-xl shadow-2xl border-2 border-purple-200 p-4 w-80 max-w-sm pointer-events-auto">
        <!-- Header -->
        <div class="flex items-start space-x-3 mb-3">
          <img
            v-if="anime.imagen_url"
            :src="anime.imagen_url"
            :alt="anime.nombre"
            class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div v-else class="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span class="text-white text-xl font-bold">{{ anime.nombre?.charAt(0) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 text-sm truncate">{{ anime.nombre }}</h3>
            <span
              class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full"
              :class="getEstadoBadgeClass(anime.estado)"
            >
              {{ anime.estado }}
            </span>
          </div>
        </div>

        <!-- Información -->
        <div class="space-y-2 text-xs text-gray-600">
          <div v-if="anime.temporadas && anime.temporadas.length > 0" class="flex items-center space-x-2">
            <span class="font-semibold">Temporadas:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="temp in anime.temporadas"
                :key="temp"
                class="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
              >
                {{ temp }}
              </span>
            </div>
          </div>

          <div v-if="anime.fecha_estreno" class="flex items-center space-x-2">
            <span class="font-semibold">Estreno:</span>
            <span>{{ formatDate(anime.fecha_estreno) }}</span>
          </div>

          <div v-if="anime.episodios" class="flex items-center space-x-2">
            <span class="font-semibold">Episodios:</span>
            <span>{{ anime.episodios }}</span>
          </div>

          <div v-if="anime.generos && anime.generos.length > 0" class="flex items-center space-x-2">
            <span class="font-semibold">Géneros:</span>
            <span class="truncate">{{ anime.generos.join(', ') }}</span>
          </div>

          <div v-if="anime.sinopsis" class="mt-2 pt-2 border-t border-gray-200">
            <p class="text-xs text-gray-500 line-clamp-3">{{ anime.sinopsis }}</p>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="mt-3 pt-3 border-t border-gray-200 flex space-x-2">
          <button
            @click="$emit('edit', anime)"
            class="flex-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
          >
            Editar
          </button>
          <button
            @click="$emit('view', anime)"
            class="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../../utils/formatters'

const props = defineProps({
  show: Boolean,
  anime: Object,
  x: Number,
  y: Number
})

const emit = defineEmits(['edit', 'view'])

const positionStyle = computed(() => {
  if (!props.x || !props.y) return {}
  
  // Ajustar posición para que no se salga de la pantalla
  const offsetX = 20
  const offsetY = 20
  const maxX = window.innerWidth - 320 // ancho del tooltip
  const maxY = window.innerHeight - 300 // altura estimada
  
  return {
    left: `${Math.min(props.x + offsetX, maxX)}px`,
    top: `${Math.min(props.y + offsetY, maxY)}px`
  }
})

const getEstadoBadgeClass = (estado) => {
  const classes = {
    'Animes Vistos': 'bg-green-100 text-green-700',
    'Estrenos': 'bg-yellow-100 text-yellow-700',
    'Emisión': 'bg-blue-100 text-blue-700',
    'En espera': 'bg-orange-100 text-orange-700',
    'Sin fecha': 'bg-gray-100 text-gray-700',
    'Animes faltantes de ver': 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}
</script>

<style scoped>
.quick-view-enter-active,
.quick-view-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.quick-view-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.quick-view-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
