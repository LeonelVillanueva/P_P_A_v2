<template>
  <div 
    @click="$emit('open', anime)"
    class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
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
      <div class="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
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

defineEmits(['open'])
</script>

