<template>
  <div class="space-y-3">
    <!-- Serie Agrupada -->
    <div
      v-for="serie in series"
      :key="serie.nombre_base"
      class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <!-- Header de Serie (siempre visible) -->
      <div
        @click="toggleSerie(serie.nombre_base)"
        class="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center space-x-4 flex-1 min-w-0">
          <!-- Imagen de la serie -->
          <div class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
            <img
              v-if="serie.imagen_url"
              :src="serie.imagen_url"
              :alt="serie.nombre_base"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-white text-xl font-bold">{{ serie.nombre_base.charAt(0) }}</span>
            </div>
          </div>

          <!-- Información de la serie -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 text-lg truncate">{{ serie.nombre_base }}</h3>
            <div class="flex items-center space-x-3 mt-1 flex-wrap gap-2">
              <!-- Badge de temporadas totales -->
              <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {{ serie.total_temporadas }} {{ serie.total_temporadas === 1 ? 'temporada' : 'temporadas' }}
              </span>
              
              <!-- Estados de las temporadas -->
              <span
                v-for="estado in serie.estados"
                :key="estado"
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getEstadoBadgeClass(estado)"
              >
                {{ estado }}
              </span>
            </div>
            
            <!-- Resumen de temporadas -->
            <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span v-if="serie.temporadas_vistas > 0">
                ✓ {{ serie.temporadas_vistas }} vista{{ serie.temporadas_vistas !== 1 ? 's' : '' }}
              </span>
              <span v-if="serie.temporadas_emision > 0" class="text-blue-600">
                📺 {{ serie.temporadas_emision }} en emisión
              </span>
              <span v-if="serie.temporadas_estrenos > 0" class="text-green-600">
                🆕 {{ serie.temporadas_estrenos }} estreno{{ serie.temporadas_estrenos !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Botón de expandir/colapsar -->
        <button
          class="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          :aria-label="expandedSeries.has(serie.nombre_base) ? 'Colapsar' : 'Expandir'"
        >
          <svg
            class="w-5 h-5 transition-transform"
            :class="{ 'rotate-180': expandedSeries.has(serie.nombre_base) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Temporadas (expandible) -->
      <Transition name="slide-down">
        <div
          v-if="expandedSeries.has(serie.nombre_base)"
          class="border-t border-gray-100 bg-gray-50"
        >
          <div class="p-4 space-y-2">
            <div
              v-for="temporada in serie.temporadas"
              :key="temporada.id"
              @contextmenu.prevent="handleContextMenu(temporada)"
              class="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                      {{ temporada.tipo_temporada || 'Temporada' }} {{ temporada.temporada_numero || '' }}
                    </span>
                    <span
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getEstadoBadgeClass(temporada.estado)"
                    >
                      {{ temporada.estado }}
                    </span>
                    <span
                      v-if="temporada.fecha_estreno"
                      class="text-xs text-gray-500"
                    >
                      📅 {{ formatDate(temporada.fecha_estreno) }}
                    </span>
                    <span
                      v-if="temporada.ultima_verificacion"
                      class="text-xs text-gray-400"
                      :title="`Última verificación: ${formatDateTime(temporada.ultima_verificacion)}`"
                    >
                      🔄 {{ formatRelativeTime(temporada.ultima_verificacion) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button
                      @click="$emit('edit', temporada)"
                      class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      v-if="temporada.jikan_id"
                      @click="$emit('update-from-api', temporada)"
                      class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      :title="`Actualizar desde Jikan API (última verificación: ${temporada.ultima_verificacion ? formatDateTime(temporada.ultima_verificacion) : 'nunca'})`"
                    >
                      🔄 Actualizar
                    </button>
                    <button
                      v-else
                      @click="$emit('associate-jikan', temporada)"
                      class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      🔗 Asociar API
                    </button>
                    <button
                      @click="$emit('delete', temporada)"
                      class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Empty State -->
    <div v-if="series.length === 0" class="text-center py-12 text-gray-500">
      <p>No hay series para mostrar</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnimeStore } from '../../stores/animeStore'
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/formatters'

const props = defineProps({
  series: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'update-from-api', 'associate-jikan'])

const animeStore = useAnimeStore()
const expandedSeries = ref(new Set())

const handleContextMenu = (temporada) => {
  const isSelected = animeStore.isAnimeSelected(temporada.id)
  if (isSelected) {
    animeStore.clearDraggedAnime()
  } else {
    animeStore.setDraggedAnime(temporada)
  }
}

const toggleSerie = (nombreBase) => {
  if (expandedSeries.value.has(nombreBase)) {
    expandedSeries.value.delete(nombreBase)
  } else {
    expandedSeries.value.add(nombreBase)
  }
}

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
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
