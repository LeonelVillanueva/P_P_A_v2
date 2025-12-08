import { ref, onMounted } from 'vue'

/**
 * Composable para manejar el modo de vista (lista, lista con imagen, cards)
 */
export function useViewMode() {
  const viewMode = ref('cards') // 'cards', 'list', 'list-image'
  
  // Cargar preferencia guardada
  onMounted(() => {
    const saved = localStorage.getItem('anime_view_mode')
    if (saved && ['cards', 'list', 'list-image'].includes(saved)) {
      viewMode.value = saved
    }
  })
  
  /**
   * Cambiar modo de vista
   */
  function setViewMode(mode) {
    if (['cards', 'list', 'list-image'].includes(mode)) {
      viewMode.value = mode
      localStorage.setItem('anime_view_mode', mode)
    }
  }
  
  return {
    viewMode,
    setViewMode
  }
}

