import { ref, onMounted } from 'vue'

/**
 * Composable para manejar el modo de vista (lista, lista con imagen, cards)
 */
export function useViewMode() {
  const viewMode = ref('series') // 'series', 'cards', 'list', 'list-image' - 'series' es el nuevo modo por defecto
  
  // Cargar preferencia guardada
  onMounted(() => {
    const saved = localStorage.getItem('anime_view_mode')
    if (saved && ['series', 'cards', 'list', 'list-image'].includes(saved)) {
      viewMode.value = saved
    }
  })
  
  /**
   * Cambiar modo de vista
   */
  function setViewMode(mode) {
    if (['series', 'cards', 'list', 'list-image'].includes(mode)) {
      viewMode.value = mode
      localStorage.setItem('anime_view_mode', mode)
    }
  }
  
  return {
    viewMode,
    setViewMode
  }
}

