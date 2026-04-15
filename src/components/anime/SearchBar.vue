<template>
  <div class="mb-4">
    <div class="bg-elevated rounded-card shadow-card p-3 sm:p-4">
      <div class="relative mx-auto w-full max-w-[780px]">
        <form
          class="search-shell group relative mx-auto flex w-full items-center overflow-hidden rounded-full border bg-elevated/80 backdrop-blur-sm transition-all"
          :class="[
            isFocused ? 'border-accent/50 shadow-[0_14px_40px_-18px_rgba(124,58,237,0.6)]' : 'border-border-subtle',
            isAnimating ? 'search-shell-burst' : ''
          ]"
          @submit.prevent="handleSubmit"
          @mousemove="handleMouseMove"
          @click="handleClick"
        >
          <div class="search-orb pointer-events-none" :style="orbStyle" />

          <button
            type="button"
            class="z-10 pl-4 text-ink-subtle transition-colors group-hover:text-accent"
            aria-label="Enfocar búsqueda"
            @click="focusSearchInput"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar anime por nombre..."
            class="z-10 w-full bg-transparent px-3 py-3 text-[15px] text-ink outline-none placeholder:text-ink-subtle/80"
            :aria-label="'Buscar anime por nombre'"
            data-main-anime-search="true"
            @input="handleSearch"
            @focus="isFocused = true"
            @blur="handleBlur"
          />

          <button
            v-if="searchQuery.trim()"
            type="submit"
            class="z-10 mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm transition-transform hover:scale-[1.03]"
            aria-label="Ejecutar búsqueda"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <Transition name="search-suggest">
          <div
            v-if="showSuggestions"
            class="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 overflow-hidden rounded-xl border border-border-subtle bg-elevated/95 shadow-card-lg backdrop-blur-md"
          >
            <ul class="max-h-64 overflow-auto p-1.5">
              <li v-for="(suggestion, idx) in suggestions" :key="`${suggestion}-${idx}`">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink transition-colors hover:bg-accent-muted/45"
                  @mousedown.prevent="selectSuggestion(suggestion)"
                >
                  <span class="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  <span class="truncate">{{ suggestion }}</span>
                </button>
              </li>
            </ul>
          </div>
        </Transition>
      </div>

      <div class="mt-3 flex flex-wrap items-end justify-center gap-2 sm:gap-3">
        <div ref="estadoDropdownRef" class="relative min-w-[10rem] w-[min(100%,20rem)] shrink-0">
          <button
            type="button"
            class="custom-select-btn"
            :class="openDropdown === 'estado' ? 'border-accent/60 ring-2 ring-accent-ring/70' : 'border-border-subtle'"
            aria-label="Filtrar por estado"
            :aria-expanded="openDropdown === 'estado'"
            @click="toggleDropdown('estado')"
          >
            <span class="truncate">{{ selectedEstadoLabel }}</span>
            <svg class="h-4 w-4 shrink-0 transition-transform" :class="openDropdown === 'estado' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition name="select-pop">
            <ul v-if="openDropdown === 'estado'" class="custom-select-menu">
              <li v-for="option in estadoOptions" :key="option.value">
                <button
                  type="button"
                  class="custom-select-option"
                  :class="filters.estado === option.value ? 'custom-select-option--active' : ''"
                  @click="setFilterValue('estado', option.value)"
                >
                  {{ option.label }}
                </button>
              </li>
            </ul>
          </Transition>
        </div>

        <div ref="temporadaDropdownRef" class="relative min-w-[10rem] w-[min(100%,20rem)] shrink-0">
          <button
            type="button"
            class="custom-select-btn"
            :class="openDropdown === 'temporada' ? 'border-accent/60 ring-2 ring-accent-ring/70' : 'border-border-subtle'"
            aria-label="Filtrar por temporada"
            :aria-expanded="openDropdown === 'temporada'"
            @click="toggleDropdown('temporada')"
          >
            <span class="truncate">{{ selectedTemporadaLabel }}</span>
            <svg class="h-4 w-4 shrink-0 transition-transform" :class="openDropdown === 'temporada' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition name="select-pop">
            <ul v-if="openDropdown === 'temporada'" class="custom-select-menu">
              <li v-for="option in temporadaOptions" :key="option.value">
                <button
                  type="button"
                  class="custom-select-option"
                  :class="filters.temporada === option.value ? 'custom-select-option--active' : ''"
                  @click="setFilterValue('temporada', option.value)"
                >
                  {{ option.label }}
                </button>
              </li>
            </ul>
          </Transition>
        </div>

        <div ref="sortDropdownRef" class="relative min-w-[11rem] w-[min(100%,24rem)] shrink-0">
          <button
            type="button"
            class="custom-select-btn"
            :class="openDropdown === 'sortBy' ? 'border-accent/60 ring-2 ring-accent-ring/70' : 'border-border-subtle'"
            aria-label="Ordenar resultados"
            :aria-expanded="openDropdown === 'sortBy'"
            @click="toggleDropdown('sortBy')"
          >
            <span class="truncate">{{ selectedSortLabel }}</span>
            <svg class="h-4 w-4 shrink-0 transition-transform" :class="openDropdown === 'sortBy' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition name="select-pop">
            <ul v-if="openDropdown === 'sortBy'" class="custom-select-menu">
              <li v-for="option in sortOptions" :key="option.value">
                <button
                  type="button"
                  class="custom-select-option"
                  :class="filters.sortBy === option.value ? 'custom-select-option--active' : ''"
                  @click="setFilterValue('sortBy', option.value)"
                >
                  {{ option.label }}
                </button>
              </li>
            </ul>
          </Transition>
        </div>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="shrink-0 rounded-card bg-surface-muted px-4 py-2.5 text-ink-muted transition-colors hover:bg-border-subtle focus:outline-none focus:ring-2 focus:ring-border-strong sm:py-3"
          aria-label="Limpiar filtros"
          @click="clearFilters"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="hasActiveFilters" class="mt-3 text-sm text-ink-muted">
        <span v-if="isGlobalSearch" class="font-semibold text-accent">Búsqueda global:</span>
        Mostrando {{ filteredCount }} de {{ totalCount }} animes
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { setMainSearchFocusHandler } from '../../utils/searchFocusBridge'

const props = defineProps({
  estados: {
    type: Array,
    default: () => []
  },
  temporadas: {
    type: Array,
    default: () => []
  },
  animeTitles: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  filteredCount: {
    type: Number,
    default: 0
  },
  isGlobalSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:filters', 'update:search'])

const searchInputRef = ref(null)
const estadoDropdownRef = ref(null)
const temporadaDropdownRef = ref(null)
const sortDropdownRef = ref(null)
const searchQuery = ref('')
const isFocused = ref(false)
const isAnimating = ref(false)
const mousePosition = ref({ x: 50, y: 50 })
const openDropdown = ref(null)

const filters = ref({
  estado: '',
  temporada: '',
  sortBy: ''
})

let searchTimeout = null
let blurTimeout = null

const suggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  const pool = Array.isArray(props.animeTitles) ? props.animeTitles : []
  return [...new Set(pool)]
    .filter((title) => String(title).toLowerCase().includes(q))
    .slice(0, 8)
})

const showSuggestions = computed(() => isFocused.value && suggestions.value.length > 0)

const estadoOptions = computed(() => [
  { label: 'Todos los estados', value: '' },
  ...(props.estados || []).map((value) => ({ label: value, value }))
])

const temporadaOptions = computed(() => [
  { label: 'Todas las temporadas', value: '' },
  ...(props.temporadas || []).map((value) => ({ label: value, value }))
])

const sortOptions = [
  { label: 'Sin ordenar', value: '' },
  { label: 'Nombre (A-Z)', value: 'nombre-asc' },
  { label: 'Nombre (Z-A)', value: 'nombre-desc' },
  { label: 'Más recientes', value: 'fecha-desc' },
  { label: 'Más antiguos', value: 'fecha-asc' },
  { label: 'Última actualización', value: 'actualizado-desc' },
  { label: 'Fecha estreno (próximos)', value: 'fecha-estreno-asc' },
  { label: 'Fecha estreno (pasados)', value: 'fecha-estreno-desc' }
]

const selectedEstadoLabel = computed(
  () => estadoOptions.value.find((opt) => opt.value === filters.value.estado)?.label || 'Todos los estados'
)
const selectedTemporadaLabel = computed(
  () => temporadaOptions.value.find((opt) => opt.value === filters.value.temporada)?.label || 'Todas las temporadas'
)
const selectedSortLabel = computed(
  () => sortOptions.find((opt) => opt.value === filters.value.sortBy)?.label || 'Sin ordenar'
)

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() ||
         filters.value.estado ||
         filters.value.temporada ||
         filters.value.sortBy
})

const orbStyle = computed(() => ({
  left: `${mousePosition.value.x}%`,
  top: `${mousePosition.value.y}%`
}))

const emitSearch = (value) => {
  emit('update:search', value.trim())
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => emitSearch(searchQuery.value), 220)
}

const handleSubmit = () => {
  emitSearch(searchQuery.value)
  if (!searchQuery.value.trim()) return
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 700)
}

const handleFilterChange = () => {
  emit('update:filters', { ...filters.value })
}

const selectSuggestion = (value) => {
  searchQuery.value = value
  emitSearch(value)
  isFocused.value = false
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    estado: '',
    temporada: '',
    sortBy: ''
  }
  openDropdown.value = null
  emit('update:search', '')
  emit('update:filters', { ...filters.value })
}

const toggleDropdown = (name) => {
  openDropdown.value = openDropdown.value === name ? null : name
}

const setFilterValue = (key, value) => {
  filters.value[key] = value
  openDropdown.value = null
  handleFilterChange()
}

const handleMouseMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  mousePosition.value = {
    x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
    y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
  }
}

const handleClick = (event) => {
  handleMouseMove(event)
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
}

const handleBlur = () => {
  if (blurTimeout) clearTimeout(blurTimeout)
  blurTimeout = setTimeout(() => {
    isFocused.value = false
  }, 160)
}

function focusSearchInput() {
  const el = searchInputRef.value
  if (el && typeof el.focus === 'function') {
    el.focus()
    el.select?.()
  }
}

const handleDocumentClick = (event) => {
  const target = event.target
  if (
    estadoDropdownRef.value?.contains(target) ||
    temporadaDropdownRef.value?.contains(target) ||
    sortDropdownRef.value?.contains(target)
  ) {
    return
  }
  openDropdown.value = null
}

onMounted(() => {
  setMainSearchFocusHandler(focusSearchInput)
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  setMainSearchFocusHandler(null)
  document.removeEventListener('click', handleDocumentClick)
  if (searchTimeout) clearTimeout(searchTimeout)
  if (blurTimeout) clearTimeout(blurTimeout)
})

defineExpose({
  focusSearch: focusSearchInput
})
</script>

<style scoped>
.search-shell {
  min-height: 50px;
}

.search-shell::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 9999px;
  background: linear-gradient(120deg, rgb(124 58 237 / 0.45), rgb(217 70 239 / 0.35), rgb(59 130 246 / 0.25));
  opacity: 0;
  transition: opacity 0.22s ease;
}

.search-shell:focus-within::before {
  opacity: 1;
}

.search-orb {
  position: absolute;
  width: 170px;
  height: 170px;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: radial-gradient(circle, rgb(139 92 246 / 0.24) 0%, rgb(139 92 246 / 0) 70%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.search-shell:focus-within .search-orb {
  opacity: 1;
}

.search-shell-burst {
  animation: search-burst 0.55s ease;
}

@keyframes search-burst {
  0% { transform: scale(1); }
  40% { transform: scale(1.015); }
  100% { transform: scale(1); }
}

.search-suggest-enter-active,
.search-suggest-leave-active {
  transition: all 0.18s ease;
}

.search-suggest-enter-from,
.search-suggest-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .search-shell-burst {
    animation: none;
  }

  .search-suggest-enter-active,
  .search-suggest-leave-active {
    transition: opacity 0.12s ease;
  }

  .search-suggest-enter-from,
  .search-suggest-leave-to {
    transform: none;
  }
}

.custom-select-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-radius: 9999px;
  border-width: 1px;
  background: rgb(255 255 255 / 0.78);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: rgb(31 41 55);
  box-shadow: 0 2px 10px -8px rgb(15 23 42 / 0.45);
  backdrop-filter: blur(6px);
  transition: all 0.2s ease;
}

:global(.dark) .custom-select-btn {
  background: rgb(30 41 59 / 0.72);
  color: rgb(241 245 249);
}

.custom-select-menu {
  position: absolute;
  z-index: 25;
  margin-top: 0.35rem;
  max-height: 16rem;
  width: 100%;
  overflow: auto;
  border-radius: 0.95rem;
  border: 1px solid rgb(148 163 184 / 0.26);
  background: rgb(255 255 255 / 0.95);
  padding: 0.35rem;
  box-shadow: 0 14px 40px -22px rgb(15 23 42 / 0.45);
  backdrop-filter: blur(8px);
}

:global(.dark) .custom-select-menu {
  border-color: rgb(148 163 184 / 0.25);
  background: rgb(15 23 42 / 0.9);
}

.custom-select-option {
  width: 100%;
  border-radius: 0.65rem;
  padding: 0.45rem 0.65rem;
  text-align: left;
  font-size: 0.83rem;
  color: rgb(51 65 85);
  transition: all 0.16s ease;
}

.custom-select-option:hover {
  background: rgb(139 92 246 / 0.12);
  color: rgb(91 33 182);
}

:global(.dark) .custom-select-option {
  color: rgb(226 232 240);
}

:global(.dark) .custom-select-option:hover {
  background: rgb(139 92 246 / 0.22);
  color: rgb(233 213 255);
}

.custom-select-option--active {
  background: linear-gradient(90deg, rgb(124 58 237 / 0.2), rgb(217 70 239 / 0.17));
  color: rgb(91 33 182);
  font-weight: 700;
}

:global(.dark) .custom-select-option--active {
  color: rgb(233 213 255);
}

.select-pop-enter-active,
.select-pop-leave-active {
  transition: all 0.16s ease;
}

.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.985);
}
</style>
