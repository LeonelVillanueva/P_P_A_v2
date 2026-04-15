<template>
  <Transition name="quick-view">
    <div
      v-if="show && (anime || serie)"
      class="pointer-events-none fixed z-40"
      :style="positionStyle"
    >
      <div
        class="pointer-events-auto max-h-[min(70vh,26rem)] w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-xl border-2 border-purple-200 bg-white p-4 shadow-2xl sm:w-96"
        :class="serie ? 'max-w-md' : 'max-w-sm'"
        @mouseenter="$emit('panel-enter')"
        @mouseleave="$emit('panel-leave')"
      >
        <!-- Vista por obra agrupada -->
        <template v-if="serie">
          <div class="mb-3 flex items-start space-x-3">
            <img
              v-if="serie.imagen_url"
              :src="serie.imagen_url"
              :alt="serie.titulo_original"
              class="h-16 w-16 shrink-0 rounded-lg object-cover ring-2 ring-purple-100"
            />
            <div
              v-else
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-100"
            >
              <span class="text-xl font-bold text-white">{{ obraLetter }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-purple-600">Obra</p>
              <h3 class="line-clamp-2 text-sm font-bold text-gray-900">{{ serie.titulo_original }}</h3>
              <p class="mt-1 text-xs text-gray-500">
                {{ serie.total_temporadas }} {{ serie.total_temporadas === 1 ? 'ficha' : 'fichas' }}
              </p>
              <div class="mt-1.5 flex flex-wrap gap-1">
                <span
                  v-for="estado in serie.estados"
                  :key="estado"
                  class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="getEstadoBadgeClass(estado)"
                >
                  {{ estado }}
                </span>
              </div>
            </div>
          </div>
          <div class="mb-3 flex flex-wrap gap-1 border-t border-dashed border-gray-200 pt-3">
            <span class="w-full text-[10px] font-semibold uppercase tracking-wide text-gray-400">Entregas</span>
            <ul class="max-h-28 w-full space-y-1 overflow-y-auto text-xs text-gray-700">
              <li
                v-for="a in serie.temporadas"
                :key="a.id"
                class="line-clamp-2 rounded-md bg-gray-50 px-2 py-1.5"
              >
                {{ getAnimeDisplayTitle(a) }}
              </li>
            </ul>
          </div>
          <div class="flex gap-2 border-t border-gray-200 pt-3">
            <button
              type="button"
              class="flex-1 rounded-lg bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
              @click.stop="$emit('edit-serie', serie)"
            >
              Editar…
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200"
              @click.stop="$emit('view-serie', serie)"
            >
              Ver obra
            </button>
          </div>
        </template>

        <!-- Vista ficha única -->
        <template v-else-if="anime">
          <div class="mb-3 flex items-start space-x-3">
            <img
              v-if="anime.imagen_url"
              :src="anime.imagen_url"
              :alt="getAnimeDisplayTitle(anime)"
              class="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
            <div
              v-else
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"
            >
              <span class="text-xl font-bold text-white">{{ getAnimeDisplayTitle(anime).charAt(0) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-bold text-gray-900">{{ getAnimeDisplayTitle(anime) }}</h3>
              <p class="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Ficha</p>
              <span
                class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="getEstadoBadgeClass(anime.estado)"
              >
                {{ anime.estado }}
              </span>
            </div>
          </div>

          <div class="space-y-2 text-xs text-gray-600">
            <div v-if="anime.temporadas && anime.temporadas.length > 0" class="flex items-center space-x-2">
              <span class="font-semibold">Temporadas:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="temp in anime.temporadas"
                  :key="temp"
                  class="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700"
                >
                  {{ temp }}
                </span>
              </div>
            </div>

            <div v-if="anime.fecha_estreno" class="flex items-center space-x-2">
              <span class="font-semibold">Estreno:</span>
              <span>{{ formatDate(anime.fecha_estreno) }}</span>
            </div>

            <div
              class="-mx-0.5 flex items-start space-x-2 rounded-lg bg-indigo-50/90 px-2 py-1.5 text-indigo-800"
            >
              <span class="shrink-0 font-semibold">Info revisada:</span>
              <span>{{ anime.ultima_revision_info ? formatDate(anime.ultima_revision_info) : 'Sin registrar' }}</span>
            </div>

            <div v-if="anime.episodios" class="flex items-center space-x-2">
              <span class="font-semibold">Episodios:</span>
              <span>{{ anime.episodios }}</span>
            </div>

            <div v-if="anime.generos && anime.generos.length > 0" class="flex items-center space-x-2">
              <span class="font-semibold">Géneros:</span>
              <span class="truncate">{{ anime.generos.join(', ') }}</span>
            </div>

            <div v-if="anime.sinopsis" class="mt-2 border-t border-gray-200 pt-2">
              <p class="line-clamp-3 text-xs text-gray-500">{{ anime.sinopsis }}</p>
            </div>
          </div>

          <div class="mt-3 flex space-x-2 border-t border-gray-200 pt-3">
            <button
              type="button"
              class="flex-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
              @click.stop="$emit('edit', anime)"
            >
              Editar
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
              @click.stop="$emit('view', anime)"
            >
              Ver detalles
            </button>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../../utils/formatters'
import { getAnimeDisplayTitle } from '../../utils/animeTitles'

const props = defineProps({
  show: { type: Boolean, default: false },
  anime: { type: Object, default: null },
  serie: { type: Object, default: null },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 }
})

defineEmits(['edit', 'view', 'edit-serie', 'view-serie', 'panel-enter', 'panel-leave'])

const obraLetter = computed(() => {
  const t = (props.serie?.titulo_original || '?').trim()
  return t.charAt(0) || '?'
})

const positionStyle = computed(() => {
  if (!props.x || !props.y) return {}

  const offsetX = 20
  const offsetY = 16
  const panelW = props.serie ? 400 : 320
  const maxX = window.innerWidth - panelW
  const maxY = window.innerHeight - 280

  return {
    left: `${Math.min(props.x + offsetX, Math.max(8, maxX))}px`,
    top: `${Math.min(props.y + offsetY, Math.max(8, maxY))}px`
  }
})

const getEstadoBadgeClass = (estado) => {
  const classes = {
    'Animes Vistos': 'bg-green-100 text-green-700',
    Estrenos: 'bg-yellow-100 text-yellow-700',
    Emisión: 'bg-blue-100 text-blue-700',
    'En espera': 'bg-orange-100 text-orange-700',
    'Sin fecha': 'bg-gray-100 text-gray-700',
    'Animes faltantes de ver': 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}
</script>

<style scoped>
.quick-view-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.quick-view-leave-active {
  transition: opacity 0.05s ease, transform 0.05s ease;
}

.quick-view-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.quick-view-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
