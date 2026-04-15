<template>
  <!-- Tabs Móvil -->
  <div
    class="sm:hidden mb-3 overflow-hidden rounded-2xl border border-border-subtle bg-elevated shadow-card-lg ring-1 ring-black/[0.04]"
  >
    <div
      class="h-1 w-full bg-gradient-to-r from-accent via-accent-hover to-cyan-500/70"
      aria-hidden="true"
    />
    <div class="space-y-4 p-4 sm:p-5">
      <div>
        <label
          for="mobile-tab-selector"
          class="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
        >
          Sección
        </label>
        <div class="relative">
          <select
            id="mobile-tab-selector"
            :value="activeTab"
            class="w-full cursor-pointer appearance-none rounded-xl border-2 border-border-subtle bg-surface-muted/80 py-3 pl-4 pr-11 text-sm font-semibold text-ink shadow-inner transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring"
            aria-label="Seleccionar sección de animes"
            @change="handleTabClick($event.target.value)"
            @keydown="handleMobileKeydown"
          >
            <option v-for="seccion in sections" :key="seccion.id" :value="seccion.id">
              {{ seccion.nombre }} ({{ getCount(seccion.id) }})
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg class="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="flex justify-center"
        role="toolbar"
        aria-label="Tipo de vista"
      >
        <div class="inline-flex items-center gap-px rounded-lg border border-border-subtle/70 bg-surface-muted/40 p-0.5">
          <button
            v-for="view in viewModes"
            :key="view.id"
            type="button"
            :class="[
              'flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-1',
              viewMode === view.id
                ? 'bg-elevated text-accent shadow-sm'
                : 'text-ink-subtle hover:bg-elevated/80 hover:text-ink'
            ]"
            :aria-label="`Cambiar a vista ${view.label}`"
            :title="view.label"
            @click="$emit('change-view', view.id)"
          >
            <AnimeTabsViewIcon :mode="view.id" icon-class="h-[1.15rem] w-[1.15rem]" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content Móvil -->
    <div
      :id="`tabpanel-mobile-${activeTab}`"
      class="min-h-[400px] border-t border-border-subtle/80 bg-surface-muted/30 p-3"
      role="tabpanel"
      :aria-labelledby="`mobile-tab-selector`"
    >
      <slot :active-tab="activeTab" />
    </div>
  </div>

  <!-- Tabs escritorio -->
  <div
    class="hidden sm:block overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-elevated to-surface-muted/40 shadow-card-lg ring-1 ring-black/[0.04]"
  >
    <div
      class="h-1 w-full bg-gradient-to-r from-accent via-violet-500 to-cyan-500/60"
      aria-hidden="true"
    />

    <div
      class="flex flex-col gap-4 border-b border-border-subtle/90 bg-gradient-to-br from-accent-muted/25 via-elevated/95 to-surface-muted/50 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <p class="font-medium">Navega por estados y cambia el tipo de vista al instante.</p>
        <div class="inline-flex items-center gap-1.5">
          <kbd class="rounded border border-border-subtle bg-elevated px-1.5 py-0.5 text-[11px] text-ink">←</kbd>
          <kbd class="rounded border border-border-subtle bg-elevated px-1.5 py-0.5 text-[11px] text-ink">→</kbd>
          <span>Secciones</span>
        </div>
      </div>

      <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 xl:gap-10">
      <!-- Secciones: pastillas -->
      <div
        class="scrollbar-hide flex min-w-0 flex-1 items-center gap-3 overflow-x-auto overflow-y-visible py-2 pl-1 pr-2 -mx-1 sm:gap-3.5 sm:py-2.5 sm:pr-3"
        role="tablist"
        aria-label="Secciones de animes"
        tabindex="0"
        @keydown="handleKeydown"
      >
        <button
          v-for="(seccion, index) in sections"
          :id="`tab-${seccion.id}`"
          :key="seccion.id"
          :ref="(el) => { if (el) tabRefs[index] = el }"
          type="button"
          :class="[
            'inline-flex max-w-[min(100%,18rem)] shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-ring focus:ring-offset-2 sm:px-5 sm:py-3 sm:text-sm',
            activeTab === seccion.id
              ? 'bg-gradient-to-r from-accent to-accent-hover text-white shadow-md ring-2 ring-accent-border/50'
              : 'bg-elevated/90 text-ink-muted shadow-sm ring-1 ring-border-subtle hover:bg-elevated hover:text-accent hover:ring-accent-border/40',
            draggedOverTab === seccion.id ? 'ring-2 ring-accent ring-offset-2' : ''
          ]"
          role="tab"
          :aria-selected="activeTab === seccion.id"
          :aria-controls="`tabpanel-${seccion.id}`"
          :tabindex="activeTab === seccion.id ? 0 : -1"
          @click="handleTabClick(seccion.id)"
          @focus="handleTabFocus(seccion.id)"
          @dragover="handleTabDragOver($event, seccion.id)"
          @dragleave="handleTabDragLeave"
          @drop="handleTabDrop($event, seccion.id)"
        >
          <span class="min-w-0 flex-1 leading-snug sm:whitespace-normal">{{ seccion.nombre }}</span>
          <span
            :class="[
              'inline-flex min-h-[1.5rem] min-w-[1.75rem] shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums sm:text-xs',
              activeTab === seccion.id
                ? 'bg-white/20 text-white'
                : 'bg-surface-muted text-ink-muted'
            ]"
          >
            {{ getCount(seccion.id) }}
          </span>
        </button>
      </div>

      <!-- Selector de vista: solo iconos, minimal -->
      <div
        class="flex shrink-0 items-center"
        role="toolbar"
        aria-label="Tipo de vista"
      >
        <div
          class="inline-flex items-center gap-px rounded-lg border border-border-subtle/70 bg-surface-muted/35 p-0.5"
        >
          <button
            v-for="view in viewModes"
            :key="view.id"
            type="button"
            :class="[
              'flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 sm:h-10 sm:w-10',
              viewMode === view.id
                ? 'bg-elevated text-accent shadow-sm'
                : 'text-ink-subtle hover:bg-elevated/75 hover:text-ink'
            ]"
            :aria-pressed="viewMode === view.id"
            :aria-label="`Cambiar a vista ${view.label}`"
            :title="view.label"
            @click="$emit('change-view', view.id)"
          >
            <AnimeTabsViewIcon :mode="view.id" icon-class="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div 
      :id="`tabpanel-${activeTab}`"
      class="p-3 sm:p-4 lg:p-5 min-h-[400px] sm:min-h-[520px] lg:min-h-[560px]"
      role="tabpanel"
      :aria-labelledby="`tab-${activeTab}`"
      :class="{ 'bg-accent-muted border-2 border-accent-border border-dashed rounded-card': isDragOver }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AnimeTabsViewIcon from './AnimeTabsViewIcon.vue'

const props = defineProps({
  activeTab: { type: String, default: '' },
  sections: { type: Array, default: () => [] },
  getCount: { type: Function, default: () => () => 0 },
  viewMode: {
    type: String,
    default: 'series',
    validator: (value) => ['series', 'cards', 'list', 'list-image'].includes(value)
  }
})

const emit = defineEmits(['change-tab', 'change-view', 'drop-anime'])

const isDragOver = ref(false)
const draggedOverTab = ref(null)

const viewModes = [
  { id: 'series', label: 'Series' },
  { id: 'cards', label: 'Cards' },
  { id: 'list-image', label: 'Lista con imagen' },
  { id: 'list', label: 'Lista' }
]

const tabRefs = ref([])

/**
 * Obtener índice de la sección activa
 */
function getActiveIndex() {
  return props.sections.findIndex(s => s.id === props.activeTab)
}

/**
 * Cambiar a la siguiente sección
 */
function goToNextTab() {
  const currentIndex = getActiveIndex()
  const nextIndex = currentIndex < props.sections.length - 1 ? currentIndex + 1 : 0
  const nextSection = props.sections[nextIndex]
  if (nextSection) {
    emit('change-tab', nextSection.id)
    // Enfocar el nuevo tab después de un pequeño delay
    setTimeout(() => {
      if (tabRefs.value[nextIndex]) {
        tabRefs.value[nextIndex].focus()
      }
    }, 50)
  }
}

/**
 * Cambiar a la sección anterior
 */
function goToPreviousTab() {
  const currentIndex = getActiveIndex()
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : props.sections.length - 1
  const prevSection = props.sections[prevIndex]
  if (prevSection) {
    emit('change-tab', prevSection.id)
    // Enfocar el nuevo tab después de un pequeño delay
    setTimeout(() => {
      if (tabRefs.value[prevIndex]) {
        tabRefs.value[prevIndex].focus()
      }
    }, 50)
  }
}

/**
 * Ir a la primera sección
 */
function goToFirstTab() {
  if (props.sections.length > 0) {
    emit('change-tab', props.sections[0].id)
    setTimeout(() => {
      if (tabRefs.value[0]) {
        tabRefs.value[0].focus()
      }
    }, 50)
  }
}

/**
 * Ir a la última sección
 */
function goToLastTab() {
  if (props.sections.length > 0) {
    const lastIndex = props.sections.length - 1
    emit('change-tab', props.sections[lastIndex].id)
    setTimeout(() => {
      if (tabRefs.value[lastIndex]) {
        tabRefs.value[lastIndex].focus()
      }
    }, 50)
  }
}

/**
 * Manejar teclas de navegación
 */
function handleKeydown(event) {
  // Verificar si el focus está en un input, textarea o select
  const focusedElement = document.activeElement
  const isInputFocused = focusedElement && (
    focusedElement.tagName === 'INPUT' ||
    focusedElement.tagName === 'TEXTAREA' ||
    focusedElement.tagName === 'SELECT' ||
    focusedElement.isContentEditable
  )
  
  // Si hay un input enfocado, no manejar las flechas (dejar comportamiento nativo)
  if (isInputFocused) return
  
  // Manejar flechas solo si:
  // 1. El focus está en un tab, O
  // 2. El focus está en el contenedor de tabs (tablist), O
  // 3. No hay ningún elemento enfocable enfocado (focus en body/html)
  const isTabFocused = tabRefs.value.some(ref => ref === focusedElement)
  const isTablistFocused = event.currentTarget === focusedElement
  const isBodyFocused = focusedElement === document.body || focusedElement === document.documentElement
  
  // Solo manejar si estamos en contexto de tabs
  if (!isTabFocused && !isTablistFocused && !isBodyFocused) return

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      goToNextTab()
      break
    case 'ArrowLeft':
      event.preventDefault()
      goToPreviousTab()
      break
    case 'Home':
      event.preventDefault()
      goToFirstTab()
      break
    case 'End':
      event.preventDefault()
      goToLastTab()
      break
  }
}

/**
 * Manejar click en tab
 */
function handleTabClick(tabId) {
  emit('change-tab', tabId)
}

/**
 * Manejar focus en tab
 */
function handleTabFocus(tabId) {
  // Si el tab que recibe focus no es el activo, activarlo
  if (tabId !== props.activeTab) {
    emit('change-tab', tabId)
  }
}

/**
 * Manejar teclas en selector móvil
 */
function handleMobileKeydown(event) {
  // En móvil, las flechas funcionan en el select nativo
  // Pero podemos agregar navegación adicional si es necesario
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    // Permitir comportamiento nativo del select
    return
  }
  
  // Para otras teclas, podemos agregar lógica adicional
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    goToNextTab()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goToPreviousTab()
  }
}

// Actualizar tabindex cuando cambia activeTab
watch(() => props.activeTab, () => {
  // Asegurar que solo el tab activo tenga tabindex 0
  tabRefs.value.forEach((ref, index) => {
    if (ref) {
      const section = props.sections[index]
      if (section) {
        ref.setAttribute('tabindex', section.id === props.activeTab ? '0' : '-1')
      }
    }
  })
})

const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  // Solo quitar el highlight si realmente salimos del área
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  
  // Obtener datos del anime desde el evento
  const animeData = event.dataTransfer.getData('application/json')
  if (animeData) {
    try {
      const anime = JSON.parse(animeData)
      // Hacer drop en el tab activo actual
      emit('drop-anime', anime, props.activeTab)
    } catch (e) {
      console.error('Error parsing drag data:', e)
    }
  }
}

// Handlers para los tabs
const handleTabDragOver = (event, tabId) => {
  event.preventDefault()
  event.stopPropagation()
  // Solo mostrar feedback visual, NO cambiar de tab automáticamente
  draggedOverTab.value = tabId
}

const handleTabDragLeave = (event) => {
  // Solo quitar el highlight si realmente salimos del tab
  const relatedTarget = event.relatedTarget
  if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
    draggedOverTab.value = null
  }
}

const handleTabDrop = (event, tabId) => {
  event.preventDefault()
  event.stopPropagation()
  
  draggedOverTab.value = null
  
  // Obtener datos del anime desde el evento ANTES de cambiar de tab
  const animeData = event.dataTransfer.getData('application/json')
  if (!animeData) return
  
  let anime
  try {
    anime = JSON.parse(animeData)
  } catch (e) {
    console.error('Error parsing drag data:', e)
    return
  }
  
  // Si el tab es diferente, cambiar primero y luego hacer el drop
  if (props.activeTab !== tabId) {
    emit('change-tab', tabId)
    // Esperar a que el tab cambie completamente antes de hacer el drop
    setTimeout(() => {
      emit('drop-anime', anime, tabId)
    }, 150)
  } else {
    // Si ya estamos en el tab correcto, hacer el drop inmediatamente
    emit('drop-anime', anime, tabId)
  }
}

onMounted(() => {
  // Inicializar tabindex
  tabRefs.value.forEach((ref, index) => {
    if (ref) {
      const section = props.sections[index]
      if (section) {
        ref.setAttribute('tabindex', section.id === props.activeTab ? '0' : '-1')
      }
    }
  })
  
  // Enfocar automáticamente el tab activo al cargar (solo en web, no móvil)
  if (window.innerWidth >= 640) { // sm breakpoint
    setTimeout(() => {
      const activeIndex = getActiveIndex()
      if (activeIndex >= 0 && tabRefs.value[activeIndex]) {
        tabRefs.value[activeIndex].focus()
      }
    }, 100)
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

