<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
    <!-- Header -->
    <AppHeader 
      @open-config="configModal.open()"
      @open-modal="handleOpenAnimeModal"
    />

    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <!-- Estadísticas -->
      <StatsDashboard 
        v-if="showStats && !animeStore.loading"
        :stats="animeStore.stats"
      />

      <!-- Sistema de Pestañas -->
      <AnimeTabs
        :active-tab="activeTab"
        :sections="sections"
        :get-count="getSectionCount"
        :view-mode="viewMode"
        @change-tab="activeTab = $event"
        @change-view="setViewMode"
        @drop-anime="handleDropAnime"
      >
        <template #default="{ activeTab: currentTab }">
          <Transition name="fade" mode="out-in">
            <div :key="currentTab">
              <!-- Barra de búsqueda y filtros -->
              <SearchBar
                v-if="!animeStore.loading"
                :estados="animeStore.estados"
                :temporadas="animeStore.temporadas"
                :total-count="animeStore.animes.length"
                :filtered-count="filteredAnimes.length"
                :is-global-search="hasGlobalSearch"
                @update:search="searchQuery = $event"
                @update:filters="filters = $event"
              />

              <!-- Loading State -->
              <AnimeLoadingState v-if="animeStore.loading" />

              <!-- Empty State -->
              <AnimeEmptyState 
                v-else-if="filteredAnimes.length === 0"
                @add-anime="handleOpenAnimeModal"
              />

              <!-- Animes Grid -->
              <AnimeGrid
                v-else
                :animes="filteredAnimes"
                :section-name="getSectionName(currentTab)"
                :count="filteredAnimes.length"
                :view-mode="viewMode"
                :section-id="currentTab"
                @open-anime="animeModal.open"
                @edit="animeModal.open"
                @delete="handleDeleteAnime"
                @change-view="setViewMode"
              />
            </div>
          </Transition>
        </template>
      </AnimeTabs>
    </div>

    <!-- Modal Anime -->
    <AnimeModal
      :show="animeModal.isOpen.value"
      :anime="animeModal.selectedItem.value"
      :estados="animeStore.estados"
      :temporadas="animeStore.temporadas"
      :loading="savingAnime"
      :default-estado="defaultEstadoForNewAnime"
      @close="animeModal.close()"
      @submit="handleSubmitAnime"
      @open-search="searchModal.open()"
    />

    <!-- Modal Búsqueda de Anime -->
    <AnimeSearchModal
      :show="searchModal.isOpen.value"
      @close="searchModal.close()"
      @select="handleAnimeSelected"
    />

    <!-- Modal Configuración -->
    <ConfigSection 
      :show="configModal.isOpen.value"
      :estados="animeStore.estados"
      :temporadas="animeStore.temporadas"
      :saving="savingConfig"
      @close="configModal.close()"
      @save-estados="handleSaveEstados"
      @save-temporadas="handleSaveTemporadas"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="confirmDialog.show.value"
      :title="confirmDialog.title.value"
      :message="confirmDialog.message.value"
      :type="confirmDialog.type.value"
      :confirm-text="confirmDialog.confirmText.value"
      :cancel-text="confirmDialog.cancelText.value"
      @confirm="confirmDialog.onConfirm"
      @cancel="confirmDialog.onCancel"
    />

    <!-- Success Popup -->
    <SuccessPopup
      :show="successPopup.show.value"
      :title="successPopup.title.value"
      :message="successPopup.message.value"
      :duration="successPopup.duration.value"
      @close="successPopup.close"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { useModal } from '../composables/useModal'
import { useAnimeSections } from '../composables/useAnimeSections'
import { useViewMode } from '../composables/useViewMode'
import { useConfirmDialog } from '../composables/useConfirmDialog'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { useSuccessPopup } from '../composables/useSuccessPopup'
import AppHeader from '../components/layout/AppHeader.vue'
import AnimeTabs from '../components/anime/AnimeTabs.vue'
import AnimeGrid from '../components/anime/AnimeGrid.vue'
import AnimeLoadingState from '../components/anime/AnimeLoadingState.vue'
import AnimeEmptyState from '../components/anime/AnimeEmptyState.vue'
import AnimeModal from '../components/anime/AnimeModal.vue'
import AnimeSearchModal from '../components/anime/AnimeSearchModal.vue'
import ConfigSection from '../components/config/ConfigSection.vue'
import StatsDashboard from '../components/anime/StatsDashboard.vue'
import SearchBar from '../components/anime/SearchBar.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import SuccessPopup from '../components/common/SuccessPopup.vue'

const animeStore = useAnimeStore()
const errorStore = useErrorStore()
const animeModal = useModal()
const configModal = useModal()
const searchModal = useModal()
const confirmDialog = useConfirmDialog()
const successPopup = useSuccessPopup()

const savingAnime = ref(false)
const savingConfig = ref(false)
// Active tab se inicializa dinámicamente cuando hay estados disponibles
const activeTab = ref('')
const searchQuery = ref('')
const filters = ref({})
const showStats = ref(false)

// Modo de vista
const { viewMode, setViewMode } = useViewMode()

const {
  SECTIONS: sections,
  getAnimesPorSeccion,
  getSectionName,
  getSectionCount,
  getStateBySection
} = useAnimeSections(animeStore)

// Verificar si hay búsqueda global activa
const hasGlobalSearch = computed(() => {
  return searchQuery.value.trim().length > 0 || 
         filters.value.estado || 
         filters.value.temporada || 
         filters.value.sortBy
})

// Animes filtrados
const filteredAnimes = computed(() => {
  // Si hay búsqueda o filtros activos, buscar globalmente (en todas las secciones)
  const hasActiveSearch = searchQuery.value.trim().length > 0
  const hasActiveFilters = filters.value.estado || filters.value.temporada || filters.value.sortBy
  
  const filterOptions = {
    search: searchQuery.value,
    estado: hasActiveSearch || hasActiveFilters 
      ? filters.value.estado || undefined  // Si hay búsqueda/filtros, no forzar estado de sección
      : getStateBySection(activeTab.value),  // Si no hay búsqueda, usar estado de sección activa
    temporadas: filters.value.temporada ? [filters.value.temporada] : undefined,
    sortBy: filters.value.sortBy
  }
  
  let result = animeStore.filteredAnimes(filterOptions)
  
  // Si no hay búsqueda ni filtros activos, mostrar solo animes de la sección actual
  if (!hasActiveSearch && !hasActiveFilters) {
    const seccionAnimes = getAnimesPorSeccion(activeTab.value)
    result = result.filter(anime => 
      seccionAnimes.some(a => a.id === anime.id)
    )
  }
  
  return result
})

const handleSubmitAnime = async (formData) => {
  savingAnime.value = true
  try {
    let imagenUrl = formData.imagen_url

    // Solo subir imagen si el usuario seleccionó un archivo nuevo
    // Si imagen_url es una URL externa (de la API), se guarda directamente sin subir
    if (formData.imageFile) {
      const tempId = animeModal.selectedItem.value?.id || 'temp_' + Date.now()
      imagenUrl = await errorStore.handleError(
        () => animeStore.uploadImage(formData.imageFile, tempId),
        'Subir Imagen'
      )
    }
    // Si imagen_url es una URL externa (de la API), se usa directamente
    // Esto evita almacenamiento innecesario en Supabase

    const animeData = {
      nombre: formData.nombre,
      estado: formData.estado,
      temporadas: formData.temporadas,
      imagen_url: imagenUrl
    }

    if (animeModal.selectedItem.value?.id) {
      await errorStore.handleError(
        () => animeStore.updateAnime(animeModal.selectedItem.value.id, animeData),
        'Actualizar Anime'
      )
    } else {
      await errorStore.handleError(
        () => animeStore.createAnime(animeData),
        'Crear Anime'
      )
    }

    animeModal.close()
    await animeStore.fetchAnimes()
  } catch (error) {
    // El error ya fue manejado por handleError
  } finally {
    savingAnime.value = false
  }
}

const handleSaveEstados = async (estados) => {
  savingConfig.value = true
  try {
    await errorStore.handleError(
      () => animeStore.updateConfiguracion('estados', estados),
      'Guardar Estados'
    )
    // Mostrar popup de éxito
    successPopup.showSuccess('Estados guardados correctamente', 'Éxito')
  } catch (error) {
    // Error ya manejado
  } finally {
    savingConfig.value = false
  }
}

const handleSaveTemporadas = async (temporadas) => {
  savingConfig.value = true
  try {
    await errorStore.handleError(
      () => animeStore.updateConfiguracion('temporadas', temporadas),
      'Guardar Temporadas'
    )
    successPopup.showSuccess('Temporadas guardadas correctamente', 'Éxito')
  } catch (error) {
    // Error ya manejado
  } finally {
    savingConfig.value = false
  }
}

const handleAnimeSelected = (animeData) => {
  // Cerrar modal de búsqueda
  searchModal.close()
  
  // Abrir modal de anime con solo nombre e imagen_url de la API
  // El usuario puede completar estado y temporadas manualmente
  // Usar el estado de la sección actual si está disponible
  const estadoInicial = defaultEstadoForNewAnime.value || animeStore.estados[0] || ''
  
  const animeToOpen = {
    nombre: animeData.nombre || '',
    imagen_url: animeData.imagen_url || null,
    estado: estadoInicial,
    temporadas: []
  }
  
  animeModal.open(animeToOpen)
}

const handleDropAnime = async (anime, targetSectionId) => {
  const targetEstado = getStateBySection(targetSectionId)
  
  if (!targetEstado) {
    console.error('Estado no encontrado para sección:', targetSectionId)
    errorStore.addError('Sección no válida', 'Error', { type: 'error' })
    return
  }
  
  // Comparar estados normalizados (sin espacios extra, mismo case)
  const currentEstado = anime.estado?.trim()
  const normalizedTargetEstado = targetEstado.trim()
  
  if (currentEstado === normalizedTargetEstado) {
    // Ya está en ese estado, no hacer nada
    return
  }

  try {
    if (import.meta.env.DEV) {
      console.log('Moviendo anime:', {
        id: anime.id,
        nombre: anime.nombre,
        estadoActual: currentEstado,
        estadoNuevo: normalizedTargetEstado,
        estadosValidos: animeStore.estados
      })
    }
    
    // Actualizar el anime con el nuevo estado
    await errorStore.handleError(
      () => animeStore.updateAnime(anime.id, { estado: normalizedTargetEstado }),
      'Mover Anime',
      { anime: anime.nombre, estado: normalizedTargetEstado }
    )
    
    // Recargar los animes para reflejar el cambio
    await animeStore.fetchAnimes()
    
    // Mostrar popup de éxito
    successPopup.showSuccess(`"${anime.nombre}" movido a ${normalizedTargetEstado}`, 'Éxito')
  } catch (error) {
    // El error ya fue manejado por handleError, pero agregamos más contexto
    if (import.meta.env.DEV) {
      console.error('Error completo moviendo anime:', error)
    }
  }
}

const handleDeleteAnime = async (anime) => {
  // Confirmar eliminación con modal personalizado
  const confirmed = await confirmDialog.confirm({
    title: 'Eliminar Anime',
    message: `¿Estás seguro de que quieres eliminar "${anime.nombre}"?\n\nEsta acción no se puede deshacer.`,
    type: 'danger',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar'
  })

  if (!confirmed) return

  try {
    await errorStore.handleError(
      () => animeStore.deleteAnime(anime.id),
      'Eliminar Anime',
      { anime: anime.nombre }
    )
    
    // Recargar animes después de eliminar
    await animeStore.fetchAnimes()
    
    // Mostrar popup de éxito
    successPopup.showSuccess(`"${anime.nombre}" eliminado correctamente`, 'Éxito')
  } catch (error) {
    // El error ya fue manejado por handleError
  }
}

// Atajos de teclado
useKeyboardShortcuts({
  'ctrl+k': () => {
    // Abrir búsqueda rápida (por ahora solo enfocar el input de búsqueda)
    const searchInput = document.querySelector('input[placeholder*="Buscar anime"]')
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    }
  },
  'ctrl+n': () => {
    handleOpenAnimeModal()
  },
  'ctrl+,': () => {
    configModal.open()
  },
  'ctrl+/': () => {
    showStats.value = !showStats.value
  }
})

// Limpiar búsqueda cuando cambia de tab
watch(activeTab, () => {
  searchQuery.value = ''
  filters.value = {}
})

// Estado por defecto para nuevo anime basado en la sección actual
const defaultEstadoForNewAnime = computed(() => {
  if (activeTab.value) {
    const estado = getStateBySection(activeTab.value)
    return estado || ''
  }
  return ''
})

// Manejar apertura del modal de anime
const handleOpenAnimeModal = () => {
  // Si hay un estado por defecto, pasarlo al modal
  const estadoInicial = defaultEstadoForNewAnime.value
  if (estadoInicial) {
    animeModal.open({
      estado: estadoInicial
    })
  } else {
    animeModal.open()
  }
}

// Inicializar activeTab cuando los estados estén disponibles
watch(() => sections.value, (newSections) => {
  if (newSections && newSections.length > 0) {
    // Si no hay tab activo o el tab activo ya no existe, seleccionar el primero
    if (!activeTab.value || !newSections.find(s => s.id === activeTab.value)) {
      activeTab.value = newSections[0].id
    }
  }
}, { immediate: true })

onMounted(async () => {
  try {
    await errorStore.handleError(
      () => animeStore.fetchEstados(),
      'Cargar Estados'
    )
    await errorStore.handleError(
      () => animeStore.fetchTemporadas(),
      'Cargar Temporadas'
    )
    await errorStore.handleError(
      () => animeStore.fetchAnimes(),
      'Cargar Animes'
    )
  } catch (error) {
    // Errores ya manejados
  }
  
  // Inicializar activeTab si aún no está inicializado
  if (!activeTab.value && sections.value && sections.value.length > 0) {
    activeTab.value = sections.value[0].id
  }
  
  // Enfocar el tablist después de cargar los datos (para que las flechas funcionen inmediatamente)
  setTimeout(() => {
    const tablist = document.querySelector('[role="tablist"]')
    if (tablist && window.innerWidth >= 640) { // Solo en web
      tablist.focus()
    }
  }, 200)
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

