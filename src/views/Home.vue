<template>
  <div 
    class="min-h-screen bg-surface pb-[5.75rem] sm:pb-0"
    @contextmenu.prevent
  >
    <!-- Chrome: dock móvil + rail escritorio -->
    <AppChrome 
      @open-config="shell.configModal.open()"
      @open-modal="handleOpenAnimeModal"
      @open-calendar="shell.openCalendar()"
      @open-stats="shell.openStats()"
      @manual-ping="shell.handleManualPing"
      @open-help="shell.showHelp = true"
    />

    <div class="mx-auto w-full max-w-[min(100%,2200px)] px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-3 sm:py-4 md:py-5">
      <div class="home-layout-shell home-shell-enter relative isolate">
        <div
          class="pointer-events-none absolute inset-x-0 -top-6 z-0 h-28 bg-[radial-gradient(70%_65%_at_50%_0%,rgba(147,51,234,0.12),transparent_72%)]"
          aria-hidden="true"
        />
        <div class="relative z-10">
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
            <Transition name="home-tab" mode="out-in">
              <div :key="currentTab" class="space-y-4 sm:space-y-5">
                <!-- Barra de búsqueda y filtros -->
                <div
                  v-if="!animeStore.loading"
                  class="home-block home-block--search home-stagger"
                  style="animation-delay: 0ms"
                >
                  <SearchBar
                    :estados="animeStore.estados"
                    :temporadas="animeStore.temporadas"
                    :anime-titles="animeTitles"
                    :total-count="animeStore.animes.length"
                    :filtered-count="filteredAnimes.length"
                    :is-global-search="hasGlobalSearch"
                    @update:search="searchQuery = $event"
                    @update:filters="filters = $event"
                  />
                </div>

                <div
                  class="home-block home-block--main home-stagger"
                  style="animation-delay: 72ms"
                >
                  <!-- Loading State -->
                  <AnimeLoadingState v-if="animeStore.loading" />

                  <!-- Empty State -->
                  <AnimeEmptyState
                    v-else-if="filteredAnimes.length === 0"
                    @add-anime="handleOpenAnimeModal"
                  />

                  <!-- Vista de Series Agrupadas (nuevo modo por defecto) -->
                  <AnimeSeriesView
                    v-else-if="viewMode === 'series'"
                    :series="filteredSeries"
                    @edit="animeModal.open"
                    @delete="handleDeleteAnime"
                    @update-from-api="handleUpdateFromApi"
                    @associate-jikan="handleAssociateJikan"
                  />

                  <!-- Animes Grid (vista tradicional) -->
                  <AnimeGrid
                    v-else
                    :animes="filteredAnimes"
                    :series="gridSeries"
                    :section-name="getSectionName(currentTab)"
                    :count="gridHeaderCount"
                    :view-mode="viewMode"
                    :section-id="currentTab"
                    @open-anime="openAnimeDetail"
                    @open-serie="serieDetailModal.open"
                    @edit-serie="handleEditSerieFromGrid"
                    @edit="animeModal.open"
                    @delete="handleDeleteAnime"
                    @hover="handleGridHover"
                    @leave="handleAnimeLeave"
                    @change-view="setViewMode"
                  />
                </div>
              </div>
            </Transition>
          </template>
        </AnimeTabs>
        </div>
      </div>
    </div>

    <!-- Modal Anime (edición / alta) -->
    <AnimeModal
      ref="animeModalRef"
      :show="animeModal.isOpen.value"
      :anime="animeModal.selectedItem.value"
      :estados="animeStore.estados"
      :estados-paso-seguimiento="animeStore.estadosPasoSeguimiento"
      :temporadas="animeStore.temporadas"
      :loading="savingAnime"
      :default-estado="defaultEstadoForNewAnime"
      @close="animeModal.close()"
      @submit="handleSubmitAnime"
      @open-search="handleOpenSearchFromAnimeModal"
    />

    <!-- Ver detalles (solo lectura) -->
    <AnimeDetailModal
      :show="detailModal.isOpen.value"
      :anime="detailModal.selectedItem.value"
      @close="detailModal.close()"
      @edit="handleDetailModalEdit"
    />

    <SerieDetailModal
      :show="serieDetailModal.isOpen.value"
      :serie="serieDetailModal.selectedItem.value"
      @close="serieDetailModal.close()"
      @edit="handleSerieDetailEdit"
      @delete="handleSerieDetailDelete"
    />

    <PickEntregaEditModal
      :show="pickEntregaModal.isOpen.value"
      :serie="pickEntregaModal.selectedItem.value"
      @close="pickEntregaModal.close()"
      @select="handlePickEntregaEdit"
    />

    <!-- Modal Búsqueda de Anime -->
    <AnimeSearchModal
      :show="searchModal.isOpen.value"
      @close="searchModal.close()"
      @select="handleAnimeSelected"
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

    <!-- Vista Rápida (Quick View) -->
    <AnimeQuickView
      :show="quickView.show"
      :anime="quickView.anime"
      :serie="quickView.serie"
      :x="quickView.x"
      :y="quickView.y"
      @edit="handleQuickViewEdit"
      @view="handleQuickViewView"
      @edit-serie="handleQuickViewEditSerie"
      @view-serie="handleQuickViewViewSerie"
      @panel-enter="handleQuickViewPanelEnter"
      @panel-leave="handleQuickViewPanelLeave"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { useModal } from '../composables/useModal'
import { useAnimeSections } from '../composables/useAnimeSections'
import { useAnimeSeries } from '../composables/useAnimeSeries'
import { useViewMode } from '../composables/useViewMode'
import { useConfirmDialog } from '../composables/useConfirmDialog'
import { useHomeAnimeActions } from '../composables/useHomeAnimeActions'
import { useHomeQuickView } from '../composables/useHomeQuickView'
import { AppShellKey } from '../injectionKeys'
import AppChrome from '../components/layout/AppChrome.vue'
import AnimeTabs from '../components/anime/AnimeTabs.vue'
import AnimeGrid from '../components/anime/AnimeGrid.vue'
import AnimeSeriesView from '../components/anime/AnimeSeriesView.vue'
import AnimeLoadingState from '../components/anime/AnimeLoadingState.vue'
import AnimeEmptyState from '../components/anime/AnimeEmptyState.vue'
import AnimeModal from '../components/anime/AnimeModal.vue'
import AnimeSearchModal from '../components/anime/AnimeSearchModal.vue'
import SearchBar from '../components/anime/SearchBar.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import AnimeQuickView from '../components/anime/AnimeQuickView.vue'
import AnimeDetailModal from '../components/anime/AnimeDetailModal.vue'
import SerieDetailModal from '../components/anime/SerieDetailModal.vue'
import PickEntregaEditModal from '../components/anime/PickEntregaEditModal.vue'
import { groupAnimesByObra } from '../utils/animeGroup'
const shell = inject(AppShellKey)
if (!shell) {
  throw new Error('Home requiere AppShell (App.vue)')
}

const animeStore = useAnimeStore()
const errorStore = useErrorStore()
const animeModal = useModal()
const detailModal = useModal()
const serieDetailModal = useModal()
const pickEntregaModal = useModal()
const searchModal = useModal()
const confirmDialog = useConfirmDialog()

const savingAnime = ref(false)
const animeModalRef = ref(null)
// Active tab se inicializa dinámicamente cuando hay estados disponibles
const activeTab = ref('')
const searchQuery = ref('')
const filters = ref({})

// Modo de vista
const { viewMode, setViewMode } = useViewMode()

const {
  SECTIONS: sections,
  getAnimesPorSeccion,
  getSectionName,
  getSectionCount,
  getStateBySection
} = useAnimeSections(animeStore)

// Sistema de series agrupadas
const {
  seriesAgrupadas,
  filterSeriesByEstado,
  searchSeries
} = useAnimeSeries(animeStore)

// Verificar si hay búsqueda global activa
const hasGlobalSearch = computed(() => {
  return searchQuery.value.trim().length > 0 || 
         filters.value.estado || 
         filters.value.temporada || 
         filters.value.sortBy
})

const animeTitles = computed(() =>
  (animeStore.animes || [])
    .map((anime) => (anime.titulo_entrega || anime.titulo_original || '').trim())
    .filter(Boolean)
)

// Animes filtrados (para vista tradicional)
const filteredAnimes = computed(() => {
  // Si hay búsqueda o filtros activos, buscar globalmente (en todas las secciones)
  const hasActiveSearch = searchQuery.value.trim().length > 0
  const hasActiveFilters =
    filters.value.estado || filters.value.temporada || filters.value.sortBy

  const filterOptions = {
    search: searchQuery.value,
    estado: hasActiveSearch || hasActiveFilters
      ? filters.value.estado || undefined
      : getStateBySection(activeTab.value),
    temporada: filters.value.temporada || undefined,
    sortBy: filters.value.sortBy || undefined
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

// Series filtradas (para vista de series agrupadas)
const filteredSeries = computed(() => {
  let series = seriesAgrupadas.value

  // Filtrar por estado si hay búsqueda/filtros activos
  const hasActiveSearch = searchQuery.value.trim().length > 0
  const hasActiveFilters = filters.value.estado || filters.value.temporada || filters.value.sortBy

  if (hasActiveSearch || hasActiveFilters) {
    // Si hay búsqueda, buscar en series
    if (hasActiveSearch) {
      series = searchSeries(searchQuery.value)
    }

    // Filtrar por estado
    if (filters.value.estado) {
      series = filterSeriesByEstado(filters.value.estado)
    }
  } else {
    // Si no hay búsqueda/filtros, filtrar por estado de la sección activa
    const estadoSeccion = getStateBySection(activeTab.value)
    if (estadoSeccion) {
      series = filterSeriesByEstado(estadoSeccion)
    }
  }

  return series
})

/** Una card por obra en la cuadrícula (mismos filtros que filteredAnimes) */
const gridSeries = computed(() => groupAnimesByObra(filteredAnimes.value))

const gridHeaderCount = computed(() =>
  viewMode.value === 'cards' ? gridSeries.value.length : filteredAnimes.value.length
)

const defaultEstadoForNewAnime = computed(() => {
  if (activeTab.value) {
    const estado = getStateBySection(activeTab.value)
    return estado || ''
  }
  return ''
})

const {
  handleSubmitAnime,
  handleAnimeSelected,
  handleOpenSearchFromAnimeModal,
  handleDropAnime,
  handleDeleteAnime,
  handleUpdateFromApi,
  handleAssociateJikan
} = useHomeAnimeActions({
  savingAnime,
  animeModal,
  searchModal,
  defaultEstadoForNewAnime,
  activityHistory: shell.activityHistory,
  successPopup: shell.successPopup,
  confirmDialog,
  getStateBySection,
  animeModalRef
})

const {
  quickView,
  closeQuickView,
  handleAnimeHover,
  handleSerieHover,
  handleAnimeLeave,
  handleQuickViewPanelEnter,
  handleQuickViewPanelLeave,
  handleQuickViewEdit,
  handleQuickViewView,
  openAnimeDetail,
  handleDetailModalEdit
} = useHomeQuickView(animeStore, animeModal, detailModal)

function handleGridHover(event, payload) {
  if (
    payload &&
    typeof payload.total_temporadas === 'number' &&
    payload.titulo_original != null &&
    Array.isArray(payload.temporadas)
  ) {
    handleSerieHover(event, payload)
  } else if (payload) {
    handleAnimeHover(event, payload)
  }
}

function handleQuickViewViewSerie(serie) {
  closeQuickView()
  serieDetailModal.open(serie)
}

function handleQuickViewEditSerie(serie) {
  closeQuickView()
  handleEditSerieFromGrid(serie)
}

const handleOpenAnimeModal = () => {
  const estadoInicial = defaultEstadoForNewAnime.value
  if (estadoInicial) {
    animeModal.open({
      estado: estadoInicial
    })
  } else {
    animeModal.open()
  }
}

function handleEditSerieFromGrid(serie) {
  if (!serie?.temporadas?.length) return
  if (serie.temporadas.length === 1) {
    animeModal.open(serie.temporadas[0])
  } else {
    pickEntregaModal.open(serie)
  }
}

function handlePickEntregaEdit(anime) {
  pickEntregaModal.close()
  animeModal.open(anime)
}

function handleSerieDetailEdit(anime) {
  serieDetailModal.close()
  animeModal.open(anime)
}

async function handleSerieDetailDelete(anime) {
  const ok = await handleDeleteAnime(anime)
  if (ok) serieDetailModal.close()
}

// Limpiar búsqueda cuando cambia de tab
watch(activeTab, () => {
  searchQuery.value = ''
  filters.value = {}
})

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
  shell.setNewAnimeHandler(handleOpenAnimeModal)
  try {
    await errorStore.handleError(
      () => animeStore.fetchConfiguracion(),
      'Cargar configuración'
    )
    await errorStore.handleError(
      () => animeStore.fetchAnimes(),
      'Cargar Animes'
    )
  } catch {
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

onUnmounted(() => {
  shell.setNewAnimeHandler(() => {})
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

.home-tab-enter-active,
.home-tab-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.home-tab-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.home-tab-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Entrada inicial del layout (coherente con Stats) */
.home-shell-enter {
  animation: home-shell-in 0.48s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes home-shell-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Bloques búsqueda + contenido al cargar / al cambiar de pestaña */
.home-stagger {
  animation: home-stagger-in 0.44s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes home-stagger-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-shell-enter,
  .home-stagger {
    animation: none !important;
  }

  .home-tab-enter-active,
  .home-tab-leave-active {
    transition: opacity 0.15s ease !important;
  }

  .home-tab-enter-from,
  .home-tab-leave-to {
    transform: none !important;
  }
}
</style>

