<template>
  <!-- Tabs Móvil (diseño diferente - selector dropdown) -->
  <div class="sm:hidden bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4">
    <!-- Selector móvil -->
    <div class="p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <div class="flex items-center space-x-2 mb-2">
        <label for="mobile-tab-selector" class="sr-only">Seleccionar sección de animes</label>
        <select
          id="mobile-tab-selector"
          :value="activeTab"
          @change="handleTabClick($event.target.value)"
          @keydown="handleMobileKeydown"
          class="flex-1 px-4 py-3 bg-white border-2 border-purple-300 rounded-xl font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
          aria-label="Seleccionar sección de animes"
        >
          <option v-for="seccion in sections" :key="seccion.id" :value="seccion.id">
            {{ seccion.nombre }} ({{ getCount(seccion.id) }})
          </option>
        </select>
        <div class="relative pointer-events-none -ml-8">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <!-- Selector de vista móvil -->
      <div class="flex items-center justify-end space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="view in viewModes"
          :key="view.id"
          @click="$emit('change-view', view.id)"
          :class="[
            'p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
            viewMode === view.id
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          ]"
          :aria-label="`Cambiar a vista ${view.label}`"
          :title="view.label"
        >
          <svg v-if="view.id === 'cards'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <svg v-else-if="view.id === 'series'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <svg v-else-if="view.id === 'list-image'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4l4 4-4 4" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tab Content Móvil -->
    <div 
      class="p-3 min-h-[400px]"
      :id="`tabpanel-mobile-${activeTab}`"
      role="tabpanel"
      :aria-labelledby="`mobile-tab-selector`"
    >
      <slot :active-tab="activeTab" />
    </div>
  </div>

  <!-- Tabs Web (diseño original) -->
  <div class="hidden sm:block bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50/30">
      <div 
        class="flex items-center justify-between"
      >
        <div 
          class="flex overflow-x-auto scrollbar-hide flex-1"
          role="tablist"
          aria-label="Secciones de animes"
          @keydown="handleKeydown"
          tabindex="0"
        >
          <button
            v-for="(seccion, index) in sections"
            :key="seccion.id"
            :id="`tab-${seccion.id}`"
            :ref="el => { if (el) tabRefs[index] = el }"
            @click="handleTabClick(seccion.id)"
            @focus="handleTabFocus(seccion.id)"
            @dragover="handleTabDragOver($event, seccion.id)"
            @dragleave="handleTabDragLeave"
            @drop="handleTabDrop($event, seccion.id)"
            :class="[
              'px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap border-b-2 relative focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
              activeTab === seccion.id
                ? 'text-purple-600 border-purple-600 bg-white'
                : 'text-gray-600 border-transparent hover:text-purple-500 hover:bg-white/50',
              draggedOverTab === seccion.id ? 'bg-purple-100 border-purple-400' : ''
            ]"
            role="tab"
            :aria-selected="activeTab === seccion.id"
            :aria-controls="`tabpanel-${seccion.id}`"
            :tabindex="activeTab === seccion.id ? 0 : -1"
          >
            <div class="flex items-center space-x-2">
              <span>{{ seccion.nombre }}</span>
              <span 
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  activeTab === seccion.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-200 text-gray-600'
                ]"
              >
                {{ getCount(seccion.id) }}
              </span>
            </div>
          </button>
        </div>
        
        <!-- Selector de vista (visible en todas las secciones) -->
        <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 ml-4 mr-4">
          <button
            v-for="view in viewModes"
            :key="view.id"
            @click="$emit('change-view', view.id)"
            :class="[
              'p-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500',
              viewMode === view.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
            :aria-label="`Cambiar a vista ${view.label}`"
            :title="view.label"
          >
            <svg v-if="view.id === 'series'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <svg v-else-if="view.id === 'cards'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <svg v-else-if="view.id === 'list-image'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4l4 4-4 4" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div 
      class="p-4 sm:p-6 min-h-[400px] sm:min-h-[500px]"
      :id="`tabpanel-${activeTab}`"
      role="tabpanel"
      :aria-labelledby="`tab-${activeTab}`"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{ 'bg-purple-50 border-2 border-purple-300 border-dashed rounded-xl': isDragOver }"
    >
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  activeTab: String,
  sections: Array,
  getCount: Function,
  viewMode: {
    type: String,
    default: 'cards',
    validator: (value) => ['cards', 'list', 'list-image'].includes(value)
  }
})

const emit = defineEmits(['change-tab', 'change-view', 'drop-anime'])

const isDragOver = ref(false)
const draggedOverTab = ref(null)

// Modos de vista disponibles
const viewModes = [
  { id: 'series', label: 'Series' },
  { id: 'cards', label: 'Cards' },
  { id: 'list-image', label: 'Lista con Imagen' },
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

