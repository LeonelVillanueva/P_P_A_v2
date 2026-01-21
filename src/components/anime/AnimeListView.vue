<template>
  <div class="space-y-2">
    <div
      v-for="anime in animes"
      :key="anime.id"
      :draggable="draggable"
      @dragstart="handleDragStart($event, anime)"
      @dragend="handleDragEnd"
      @contextmenu.prevent="handleContextMenu(anime)"
      class="bg-white rounded-lg shadow-sm p-4 transition-all duration-200 relative"
      :class="{ 
        'opacity-50 cursor-move': isDragging, 
        'cursor-pointer': !isDragging,
        'border-[5px] border-black shadow-2xl ring-[6px] ring-black/30 z-10': isSelected(anime.id),
        'border border-gray-200 hover:shadow-md': !isSelected(anime.id)
      }"
      @click="!isDragging && $emit('open', anime)"
    >
      <!-- Indicador de selección -->
      <div v-if="isSelected(anime.id)" class="absolute top-2 right-2 z-20">
        <span class="px-2 py-1 bg-black text-white text-xs font-bold rounded-lg shadow-lg animate-pulse flex items-center space-x-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Seleccionado</span>
        </span>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-800 text-base mb-1 truncate">
            {{ anime.nombre }}
          </h3>
          <div class="flex items-center space-x-3 text-sm text-gray-600">
            <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              {{ anime.estado }}
            </span>
            <span class="text-gray-400">
              {{ formatDate(anime.updated_at, true) }}
            </span>
          </div>
        </div>
        
        <div class="flex items-center space-x-2 ml-4">
          <div class="flex flex-wrap gap-1 max-w-xs">
            <span
              v-for="temp in anime.temporadas"
              :key="temp"
              class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
            >
              {{ temp }}
            </span>
          </div>
          
          <div class="flex space-x-1 ml-2">
            <button
              @click.stop="$emit('edit', anime)"
              class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              :aria-label="`Editar anime: ${anime.nombre}`"
              title="Editar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              @click.stop="$emit('delete', anime)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              :aria-label="`Eliminar anime: ${anime.nombre}`"
              title="Eliminar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
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
</script>

