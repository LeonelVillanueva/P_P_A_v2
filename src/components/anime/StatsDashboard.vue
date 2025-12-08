<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>Estadísticas</span>
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Animes -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Animes</p>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ stats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Temporadas -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Temporadas</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">{{ stats.totalTemporadas }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Promedio Temporadas -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Promedio Temp/Anime</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ stats.promedioTemporadas }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Estados Únicos -->
      <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Estados Activos</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ Object.keys(stats.porEstado).length }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Distribución por Estado -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Distribución por Estado</h3>
      <div class="space-y-3">
        <div 
          v-for="(count, estado) in stats.porEstado" 
          :key="estado"
          class="flex items-center space-x-3"
        >
          <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              :style="{ width: `${(count / stats.total) * 100}%` }"
            >
              <span class="text-xs font-bold text-white">{{ count }}</span>
            </div>
          </div>
          <span class="text-sm font-medium text-gray-700 w-32 truncate">{{ estado }}</span>
        </div>
      </div>
    </div>

    <!-- Top Temporadas -->
    <div v-if="Object.keys(stats.porTemporada).length > 0">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Temporadas Más Comunes</h3>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="(count, temp) in sortedTemporadas" 
          :key="temp"
          class="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200"
        >
          {{ temp }} ({{ count }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const sortedTemporadas = computed(() => {
  const entries = Object.entries(props.stats.porTemporada)
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
})
</script>

