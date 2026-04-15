<template>
  <!-- Móvil -->
  <div
    :draggable="draggable"
    class="sm:hidden relative mb-3 overflow-hidden rounded-xl bg-white shadow-md transition-transform active:scale-[0.98]"
    :class="{
      'cursor-move opacity-50': isDragging,
      'cursor-pointer': !isDragging,
      'border-[5px] border-black shadow-2xl ring-[6px] ring-black/30': isSelected,
      'border border-gray-200': !isSelected
    }"
    @click="!isDragging && $emit('open', serie)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @contextmenu.prevent="handleContextMenu"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="flex">
      <div class="relative h-24 w-24 shrink-0">
        <img
          v-if="serie.imagen_url"
          :src="serie.imagen_url"
          :alt="serie.titulo_original"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
        >
          <span class="text-2xl font-bold text-white">{{ obraLetter }}</span>
        </div>
        <div class="absolute left-1 top-1">
          <span class="rounded-md bg-purple-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            {{ serie.total_temporadas }} {{ serie.total_temporadas === 1 ? 'ficha' : 'fichas' }}
          </span>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <h3 class="mb-1 line-clamp-2 text-sm font-bold text-gray-800">{{ serie.titulo_original }}</h3>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="estado in serie.estados.slice(0, 3)"
              :key="estado"
              class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700"
            >
              {{ estado }}
            </span>
            <span
              v-if="serieTieneSeguimientoInfo"
              class="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700"
            >
              Info act.: {{ ultimaRevisionInfoSerie ? formatDate(ultimaRevisionInfoSerie, true) : 'Sin registrar' }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between border-t border-gray-100 pt-2">
          <span class="text-xs text-gray-400">Obra agrupada</span>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg bg-purple-50 p-1.5 text-purple-600 transition-colors active:bg-purple-100"
              title="Editar una entrega"
              aria-label="Editar"
              @click.stop="$emit('edit', serie)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Escritorio -->
  <div
    :draggable="draggable"
    class="group relative hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-2xl sm:block"
    :class="{
      'cursor-move opacity-50': isDragging,
      'cursor-pointer': !isDragging,
      'z-10 border-4 border-black shadow-2xl ring-4 ring-black/20': isSelected,
    }"
    @click="!isDragging && $emit('open', serie)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @contextmenu.prevent="handleContextMenu"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="relative h-56 overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 z-[12] bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-[13] p-3 opacity-0 transition-all duration-300 group-hover:opacity-100"
      >
        <p class="text-sm font-semibold text-white drop-shadow-md">Ver todas las entregas</p>
        <p class="text-xs text-white/90">{{ serie.total_temporadas }} ficha(s) · Clic en la tarjeta</p>
      </div>
      <img
        v-if="serie.imagen_url"
        :src="serie.imagen_url"
        :alt="serie.titulo_original"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600"
      >
        <span class="text-4xl font-bold text-white drop-shadow-lg">{{ obraLetter }}</span>
      </div>
      <div
        class="absolute right-2 top-2 z-20 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <button
          type="button"
          class="rounded-full bg-white/90 p-1.5 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
          title="Editar una entrega"
          :aria-label="'Editar obra ' + serie.titulo_original"
          @click.stop="$emit('edit', serie)"
        >
          <svg class="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
      <div class="absolute bottom-2 left-2 z-20">
        <span
          class="rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
        >
          {{ serie.total_temporadas }} {{ serie.total_temporadas === 1 ? 'ficha' : 'fichas' }}
        </span>
      </div>
    </div>
    <div class="p-4">
      <h3
        class="mb-2 line-clamp-2 text-base font-bold text-gray-800 transition-colors group-hover:text-purple-600"
      >
        {{ serie.titulo_original }}
      </h3>
      <div class="mb-3 flex flex-wrap gap-1.5">
        <span
          v-for="estado in serie.estados"
          :key="estado"
          class="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-0.5 text-xs font-semibold text-blue-700"
        >
          {{ estado }}
        </span>
        <span
          v-if="serieTieneSeguimientoInfo"
          class="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
        >
          Info act.: {{ ultimaRevisionInfoSerie ? formatDate(ultimaRevisionInfoSerie) : 'Sin registrar' }}
        </span>
      </div>
      <p class="border-t border-gray-100 pt-2 text-xs text-gray-500">
        Clic para ver todas las entregas · Editar para modificar una ficha
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnimeStore } from '../../stores/animeStore'
import { formatDate } from '../../utils/formatters'
import { estadoTienePasoSeguimiento } from '../../constants/revisionInfo'

const props = defineProps({
  serie: { type: Object, required: true },
  draggable: { type: Boolean, default: true },
  sectionId: { type: String, default: '' }
})

const emit = defineEmits(['open', 'edit', 'hover', 'leave', 'drag-start', 'drag-end'])

const animeStore = useAnimeStore()
const isDragging = ref(false)
const dragAnime = computed(() => props.serie?.temporadas?.[0] || null)

const isSelected = computed(() => {
  const a = dragAnime.value
  return a && animeStore.isAnimeSelected(a.id)
})

const obraLetter = computed(() => {
  const t = (props.serie?.titulo_original || '?').trim()
  return t.charAt(0) || '?'
})

const ultimaRevisionInfoSerie = computed(() => {
  const temporadas = props.serie?.temporadas || []
  let latest = null
  for (const anime of temporadas) {
    if (!estadoTienePasoSeguimiento(anime?.estado, animeStore.estadosPasoSeguimiento)) continue
    const d = anime?.ultima_revision_info
    if (!d) continue
    if (!latest || d > latest) latest = d
  }
  return latest
})

const serieTieneSeguimientoInfo = computed(() => {
  const temporadas = props.serie?.temporadas || []
  return temporadas.some((anime) =>
    estadoTienePasoSeguimiento(anime?.estado, animeStore.estadosPasoSeguimiento)
  )
})

let hoverTimeout = null

const handleMouseEnter = (event) => {
  hoverTimeout = setTimeout(() => {
    if (props.serie) emit('hover', event, props.serie)
  }, 320)
}

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  emit('leave')
}

const handleDragStart = (event) => {
  if (!props.draggable || !dragAnime.value) return
  isDragging.value = true
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  emit('leave')
  const animeData = { ...dragAnime.value, sectionId: props.sectionId }
  event.dataTransfer.setData('application/json', JSON.stringify(animeData))
  event.dataTransfer.effectAllowed = 'move'
  import('../../stores/animeStore').then(({ useAnimeStore }) => {
    useAnimeStore().setDraggedAnime(dragAnime.value)
  })
  emit('drag-start', event, animeData)
}

const handleDragEnd = (event) => {
  isDragging.value = false
  emit('drag-end', event)
}

const handleContextMenu = (event) => {
  event.preventDefault()
  const a = dragAnime.value
  if (!a) return
  if (animeStore.isAnimeSelected(a.id)) {
    animeStore.clearDraggedAnime()
  } else {
    animeStore.setDraggedAnime(a)
  }
}
</script>
