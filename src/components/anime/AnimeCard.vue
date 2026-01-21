<template>
  <!-- Card Móvil (diseño lista horizontal) -->
  <div 
    @click="!isDragging && $emit('open', anime)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @contextmenu.prevent="handleContextMenu"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    class="sm:hidden bg-white rounded-xl shadow-md mb-3 overflow-hidden active:scale-[0.98] transition-transform relative"
    :class="{ 
      'opacity-50 cursor-move': isDragging, 
      'cursor-pointer': !isDragging,
      'border-[5px] border-black shadow-2xl ring-[6px] ring-black/30': isSelected,
      'border border-gray-200': !isSelected
    }"
  >
    <div class="flex">
      <!-- Imagen lateral móvil -->
      <div class="relative w-24 h-24 flex-shrink-0">
      <img 
        v-if="anime.imagen_url" 
        :src="anime.imagen_url" 
        :alt="anime.nombre"
        class="w-full h-full object-cover"
        loading="lazy"
      />
        <div v-else class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span class="text-white text-2xl font-bold">{{ anime.nombre.charAt(0) }}</span>
        </div>
        <!-- Estado en esquina -->
        <div class="absolute top-1 left-1">
          <span class="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-md shadow-sm">
            {{ anime.estado }}
          </span>
        </div>
        <!-- Indicador de selección -->
        <div v-if="isSelected" class="absolute top-1 right-1">
          <span class="px-2 py-0.5 bg-black text-white text-xs font-bold rounded-md shadow-lg animate-pulse">
            ✓ Seleccionado
          </span>
        </div>
      </div>
      
      <!-- Contenido móvil -->
      <div class="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 class="font-bold text-gray-800 text-sm mb-1.5 line-clamp-1">
            {{ anime.nombre }}
          </h3>
          <div class="flex flex-wrap gap-1 mb-2">
            <span 
              v-for="temp in anime.temporadas" 
              :key="temp"
              class="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
            >
              {{ temp }}
            </span>
          </div>
        </div>
        
        <!-- Botones de acción móvil -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-xs text-gray-400 flex items-center space-x-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatDate(anime.updated_at, true) }}</span>
          </span>
          <div class="flex space-x-2">
            <button
              @click.stop="$emit('edit', anime)"
              class="p-1.5 bg-purple-50 text-purple-600 rounded-lg active:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Editar anime: {{ anime.nombre }}"
              title="Editar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              @click.stop="$emit('delete', anime)"
              class="p-1.5 bg-red-50 text-red-600 rounded-lg active:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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

  <!-- Card Web (diseño original) -->
  <div 
    @click="!isDragging && $emit('open', anime)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @contextmenu.prevent="handleContextMenu"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    class="hidden sm:block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1 relative"
    :class="{ 
      'opacity-50 cursor-move': isDragging, 
      'cursor-pointer': !isDragging,
      'border-4 border-black shadow-2xl ring-4 ring-black/20 z-10': isSelected,
      'border border-gray-100 hover:border-purple-200': !isSelected
    }"
  >
    <div class="relative h-56 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img 
          v-if="anime.imagen_url" 
          :src="anime.imagen_url" 
          :alt="anime.nombre"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      <div v-else class="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center">
        <span class="text-white text-4xl font-bold drop-shadow-lg">{{ anime.nombre.charAt(0) }}</span>
      </div>
      <!-- Indicador de selección -->
      <div v-if="isSelected" class="absolute top-2 left-2 z-30">
        <span class="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg shadow-lg animate-pulse flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Seleccionado</span>
        </span>
      </div>
      <div class="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
        <button
          @click.stop="$emit('edit', anime)"
          class="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          :aria-label="`Editar anime: ${anime.nombre}`"
          title="Editar anime"
        >
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', anime)"
          class="bg-red-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          :aria-label="`Eliminar anime: ${anime.nombre}`"
          title="Eliminar anime"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
        {{ anime.nombre }}
      </h3>
      
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span 
          v-for="temp in anime.temporadas" 
          :key="temp"
          class="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200"
        >
          {{ temp }}
        </span>
      </div>
      
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <span class="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
          {{ anime.estado }}
        </span>
        <span class="text-xs text-gray-400 font-medium flex items-center space-x-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ formatDate(anime.updated_at) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnimeStore } from '../../stores/animeStore'
import { formatDate } from '../../utils/formatters'

const props = defineProps({
  anime: {
    type: Object,
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

const emit = defineEmits(['open', 'edit', 'delete', 'drag-start', 'drag-end', 'hover', 'leave'])

const animeStore = useAnimeStore()
const isDragging = ref(false)
let hoverTimeout = null

// Verificar si este anime está seleccionado para el calendario
const isSelected = computed(() => {
  return animeStore.isAnimeSelected(props.anime.id)
})

const handleMouseEnter = (event) => {
  // Delay para evitar que se muestre inmediatamente
  hoverTimeout = setTimeout(() => {
    emit('hover', event, props.anime)
  }, 500) // 500ms de delay
}

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  emit('leave')
}

const handleDragStart = (event) => {
  if (!props.draggable) return
  
  isDragging.value = true
  
  // Cancelar hover si está activo
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  emit('leave')
  
  // Guardar datos del anime en el evento
  const animeData = { ...props.anime, sectionId: props.sectionId }
  event.dataTransfer.setData('application/json', JSON.stringify(animeData))
  event.dataTransfer.effectAllowed = 'move'
  
  // Guardar en el store para drag & drop entre vistas
  import('../../stores/animeStore').then(({ useAnimeStore }) => {
    const animeStore = useAnimeStore()
    animeStore.setDraggedAnime(props.anime)
  })
  
  // Agregar feedback visual mejorado
  event.dataTransfer.setDragImage(event.target, 0, 0)
  
  emit('drag-start', event, animeData)
}

const handleDragEnd = (event) => {
  isDragging.value = false
  
  // NO limpiar el anime arrastrado del store aquí
  // Se limpiará automáticamente cuando se haga drop exitoso en el calendario
  // O cuando el usuario cancele explícitamente en el calendario
  // Esto permite que el drag & drop funcione entre vistas diferentes
  
  emit('drag-end', event)
}

const handleContextMenu = (event) => {
  // Prevenir el menú contextual del navegador
  event.preventDefault()
  
  // Si este anime ya está seleccionado, deseleccionarlo
  if (isSelected.value) {
    animeStore.clearDraggedAnime()
  } else {
    // Si no está seleccionado, seleccionarlo para el calendario
    animeStore.setDraggedAnime(props.anime)
  }
}
</script>

