<template>
  <div class="space-y-3">
    <div
      v-for="anime in animes"
      :key="anime.id"
      :draggable="draggable"
      @dragstart="handleDragStart($event, anime)"
      @dragend="handleDragEnd"
      @contextmenu.prevent="handleContextMenu(anime)"
      class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 relative"
      :class="{ 
        'opacity-50 cursor-move': isDragging, 
        'cursor-pointer': !isDragging,
        'border-[5px] border-black shadow-2xl ring-[6px] ring-black/30 z-10': isSelected(anime.id),
        'border border-gray-200 hover:shadow-lg': !isSelected(anime.id)
      }"
      @click="!isDragging && $emit('open', anime)"
    >
      <!-- Indicador de selección -->
      <div v-if="isSelected(anime.id)" class="absolute top-2 left-2 z-20">
        <span class="px-2 py-1 bg-black text-white text-xs font-bold rounded-lg shadow-lg animate-pulse flex items-center space-x-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Seleccionado</span>
        </span>
      </div>
      
      <div class="flex">
        <!-- Imagen -->
        <div class="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 relative">
          <img
            v-if="anime.imagen_url"
            :src="anime.imagen_url"
            :alt="anime.nombre"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span class="text-white text-2xl font-bold">{{ anime.nombre.charAt(0) }}</span>
          </div>
        </div>
        
        <!-- Contenido -->
        <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <h3 class="font-bold text-gray-800 text-base sm:text-lg mb-2 line-clamp-1">
              {{ anime.nombre }}
            </h3>
            <div class="flex items-center space-x-2 mb-2">
              <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                {{ anime.estado }}
              </span>
              <span class="text-xs text-gray-400">
                {{ formatDate(anime.updated_at, true) }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="temp in anime.temporadas"
                :key="temp"
                class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
              >
                {{ temp }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex items-center space-x-1 p-2">
          <button
            @click.stop="$emit('edit', anime)"
            class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            :aria-label="`Editar anime: ${anime.nombre}`"
            title="Editar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            @click.stop="$emit('delete', anime)"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            :aria-label="`Eliminar anime: ${anime.nombre}`"
            title="Eliminar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAnimeStore } from '../../stores/animeStore'
import { formatDate } from '../../utils/formatters'

const props = defineProps({
  animes: {
    type: Array,
    required: true
  },
  draggable: {
    type: Boolean,
    default: true
  },
  sectionId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['open', 'edit', 'delete', 'drag-start', 'drag-end'])

const animeStore = useAnimeStore()
const isDragging = ref(false)

const isSelected = (animeId) => {
  return animeStore.isAnimeSelected(animeId)
}

const handleContextMenu = (anime) => {
  if (isSelected(anime.id)) {
    animeStore.clearDraggedAnime()
  } else {
    animeStore.setDraggedAnime(anime)
  }
}

const handleDragStart = (event, anime) => {
  if (!props.draggable) return
  
  isDragging.value = true
  
  // Guardar datos del anime en el evento
  const animeData = { ...anime, sectionId: props.sectionId }
  event.dataTransfer.setData('application/json', JSON.stringify(animeData))
  event.dataTransfer.effectAllowed = 'move'
  
  emit('drag-start', event, animeData)
}

const handleDragEnd = (event) => {
  isDragging.value = false
  emit('drag-end', event)
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
}
</script>

