<template>
  <!-- Card Móvil (diseño lista horizontal) -->
  <div 
    @click="$emit('open', anime)"
    class="sm:hidden bg-white rounded-xl shadow-md border border-gray-200 mb-3 overflow-hidden active:scale-[0.98] transition-transform"
  >
    <div class="flex">
      <!-- Imagen lateral móvil -->
      <div class="relative w-24 h-24 flex-shrink-0">
        <img 
          v-if="anime.imagen_url" 
          :src="anime.imagen_url" 
          :alt="anime.nombre"
          class="w-full h-full object-cover"
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
              class="p-1.5 bg-purple-50 text-purple-600 rounded-lg active:bg-purple-100 transition-colors"
              title="Editar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              @click.stop="$emit('delete', anime)"
              class="p-1.5 bg-red-50 text-red-600 rounded-lg active:bg-red-100 transition-colors"
              title="Eliminar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    @click="$emit('open', anime)"
    class="hidden sm:block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
  >
    <div class="relative h-56 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <img 
        v-if="anime.imagen_url" 
        :src="anime.imagen_url" 
        :alt="anime.nombre"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center">
        <span class="text-white text-4xl font-bold drop-shadow-lg">{{ anime.nombre.charAt(0) }}</span>
      </div>
      <div class="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
        <button
          @click.stop="$emit('edit', anime)"
          class="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white transition-colors"
          title="Editar anime"
        >
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', anime)"
          class="bg-red-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
          title="Eliminar anime"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import { formatDate } from '../../utils/formatters'

defineProps({
  anime: {
    type: Object,
    required: true
  }
})

defineEmits(['open', 'edit', 'delete'])
</script>

