<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white">
    <div
      class="flex shrink-0 items-center justify-between gap-2 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2.5 sm:px-4"
    >
      <h3 class="text-sm font-bold text-white">Elegir obra</h3>
      <button
        type="button"
        class="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        title="Cerrar panel"
        aria-label="Cerrar panel"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
      <div class="flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
        <div class="flex w-full min-w-0 shrink-0 flex-col md:w-48 lg:w-52">
          <label :for="searchId" class="mb-1 block text-[11px] font-medium text-gray-600">
            Buscar obra ya registrada
          </label>
          <div class="relative">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              :id="searchId"
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              class="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Filtra la lista…"
            />
          </div>
          <p class="mt-2 text-[11px] leading-snug text-gray-500">
            La lista a la derecha tiene scroll propio.
          </p>
        </div>

        <div
          class="flex min-h-[min(42vh,18rem)] flex-1 flex-col overflow-hidden rounded-xl border-2 border-purple-100 bg-white shadow-sm sm:min-h-[min(50vh,20rem)]"
          role="region"
          aria-label="Lista de obras registradas"
        >
          <div
            v-if="ultimoSeleccionado"
            class="shrink-0 border-b border-emerald-100 bg-emerald-50/90 px-3 py-2"
          >
            <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
              Agregado recientemente
            </p>
            <button
              type="button"
              class="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2.5 py-2 text-left text-sm text-emerald-900 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              @click="elegirExistente(ultimoSeleccionado)"
            >
              {{ ultimoSeleccionado }}
            </button>
          </div>
          <div
            class="shrink-0 border-b border-purple-100/80 bg-purple-50/90 px-3 py-2 text-xs font-semibold text-purple-900"
          >
            Obras en tu lista
            <span class="ml-1 font-normal text-purple-700">({{ titulosFiltrados.length }})</span>
          </div>
          <ul
            v-if="titulosFiltrados.length > 0"
            class="min-h-0 flex-1 list-none overflow-y-auto overscroll-y-contain py-1 [scrollbar-gutter:stable]"
            role="listbox"
            :aria-label="'Obras existentes (' + titulosFiltrados.length + ')'"
          >
            <li v-for="titulo in titulosFiltrados" :key="titulo">
              <button
                type="button"
                class="flex w-full items-center px-3 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-purple-50 focus:bg-purple-50 focus:outline-none"
                role="option"
                @click="elegirExistente(titulo)"
              >
                <span class="min-w-0 flex-1 break-words">{{ titulo }}</span>
              </button>
            </li>
          </ul>
          <div
            v-else
            class="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-y-auto px-4 py-6 text-center"
          >
            <p v-if="searchQuery.trim()" class="text-sm text-gray-600">
              No hay coincidencias con «{{ searchQuery.trim() }}».
            </p>
            <p v-else class="text-sm text-gray-600">Aún no hay obras registradas.</p>
            <p class="text-[11px] text-gray-500">Usa el nombre manual abajo.</p>
          </div>
        </div>
      </div>

      <div class="shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-3">
        <p class="mb-2 text-[11px] font-medium text-gray-600">¿No está en la lista? Añade el título manualmente</p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input
            :id="manualId"
            v-model="manualDraft"
            type="text"
            class="min-h-[42px] flex-1 rounded-lg border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ej: nombre exacto de la obra"
            @keydown.enter.prevent="confirmarManual"
          />
          <button
            type="button"
            class="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!manualDraft.trim()"
            @click="confirmarManual"
          >
            Usar este nombre
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAnimeStore } from '../../stores/animeStore'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'picked', 'close'])

const animeStore = useAnimeStore()

const searchId = `titulo-obra-panel-search-${Math.random().toString(36).slice(2, 9)}`
const manualId = `titulo-obra-panel-manual-${Math.random().toString(36).slice(2, 9)}`
const LAST_PICKED_KEY = 'anime:last-picked-work-title'

const titulosExistentes = computed(() => {
  const set = new Set()
  for (const a of animeStore.animes) {
    const t = (a.titulo_original || '').trim()
    if (t) set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
})

const searchQuery = ref('')
const manualDraft = ref('')
const ultimoSeleccionado = ref('')

try {
  ultimoSeleccionado.value = localStorage.getItem(LAST_PICKED_KEY) || ''
} catch {
  ultimoSeleccionado.value = ''
}

const titulosFiltrados = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = titulosExistentes.value
  if (!q) return list
  return list.filter((t) => t.toLowerCase().includes(q))
})

function elegirExistente(titulo) {
  guardarUltimoSeleccionado(titulo)
  emit('update:modelValue', titulo)
  searchQuery.value = ''
  emit('picked')
}

function confirmarManual() {
  const t = manualDraft.value.trim()
  if (!t) return
  guardarUltimoSeleccionado(t)
  emit('update:modelValue', t)
  searchQuery.value = ''
  emit('picked')
}

function guardarUltimoSeleccionado(titulo) {
  const limpio = (titulo || '').trim()
  if (!limpio) return
  ultimoSeleccionado.value = limpio
  try {
    localStorage.setItem(LAST_PICKED_KEY, limpio)
  } catch {
    // Sin storage disponible, mantenemos solo estado en memoria.
  }
}

watch(
  () => props.modelValue,
  (v) => {
    const t = (v || '').trim()
    if (!t) {
      manualDraft.value = ''
    }
  }
)
</script>
