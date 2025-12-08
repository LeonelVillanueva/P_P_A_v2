<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
    <!-- Header -->
    <AppHeader 
      @open-config="configModal.open()"
      @open-modal="animeModal.open()"
    />

    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <!-- Sistema de Pestañas -->
      <AnimeTabs
        :active-tab="activeTab"
        :sections="sections"
        :get-count="getSectionCount"
        @change-tab="activeTab = $event"
      >
        <template #default="{ activeTab: currentTab }">
          <Transition name="fade" mode="out-in">
            <div :key="currentTab">
              <!-- Loading State -->
              <AnimeLoadingState v-if="animeStore.loading" />

              <!-- Empty State -->
              <AnimeEmptyState 
                v-else-if="getAnimesPorSeccion(currentTab).length === 0"
                @add-anime="animeModal.open()"
              />

              <!-- Animes Grid -->
              <AnimeGrid
                v-else
                :animes="getAnimesPorSeccion(currentTab)"
                :section-name="getSectionName(currentTab)"
                :count="getAnimesPorSeccion(currentTab).length"
                @open-anime="animeModal.open"
                @edit="animeModal.open"
                @delete="handleDeleteAnime"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { useModal } from '../composables/useModal'
import { useAnimeSections } from '../composables/useAnimeSections'
import AppHeader from '../components/layout/AppHeader.vue'
import AnimeTabs from '../components/anime/AnimeTabs.vue'
import AnimeGrid from '../components/anime/AnimeGrid.vue'
import AnimeLoadingState from '../components/anime/AnimeLoadingState.vue'
import AnimeEmptyState from '../components/anime/AnimeEmptyState.vue'
import AnimeModal from '../components/AnimeModal.vue'
import AnimeSearchModal from '../components/anime/AnimeSearchModal.vue'
import ConfigSection from '../components/ConfigSection.vue'

const animeStore = useAnimeStore()
const errorStore = useErrorStore()
const animeModal = useModal()
const configModal = useModal()
const searchModal = useModal()

const savingAnime = ref(false)
const savingConfig = ref(false)
const activeTab = ref('vistos')

const {
  SECTIONS: sections,
  getAnimesPorSeccion,
  getSectionName,
  getSectionCount
} = useAnimeSections(animeStore)

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
    // Mostrar éxito (podrías crear un sistema de notificaciones de éxito también)
    errorStore.addError('Estados guardados correctamente', 'Éxito', { type: 'success' })
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
    errorStore.addError('Temporadas guardadas correctamente', 'Éxito', { type: 'success' })
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
  const animeToOpen = {
    nombre: animeData.nombre || '',
    imagen_url: animeData.imagen_url || null,
    estado: animeStore.estados[0] || '',
    temporadas: []
  }
  
  animeModal.open(animeToOpen)
}

const handleDeleteAnime = async (anime) => {
  // Confirmar eliminación
  if (!confirm(`¿Estás seguro de que quieres eliminar "${anime.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
    return
  }

  try {
    await errorStore.handleError(
      () => animeStore.deleteAnime(anime.id),
      'Eliminar Anime',
      { anime: anime.nombre }
    )
    
    // Recargar animes después de eliminar
    await animeStore.fetchAnimes()
    
    // Mostrar mensaje de éxito
    errorStore.addError(`"${anime.nombre}" eliminado correctamente`, 'Éxito', { type: 'success' })
  } catch (error) {
    // El error ya fue manejado por handleError
  }
}

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

