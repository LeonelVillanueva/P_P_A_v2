import { ref, computed } from 'vue'

/**
 * Composable para manejar historial de actividad
 */
export function useActivityHistory() {
  const history = ref([])
  const maxHistorySize = 100

  /**
   * Agregar una entrada al historial
   */
  const addEntry = (action, details = {}) => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action,
      details,
      type: getActionType(action)
    }

    history.value.unshift(entry)
    
    // Limitar tamaño del historial
    if (history.value.length > maxHistorySize) {
      history.value = history.value.slice(0, maxHistorySize)
    }

    // Guardar en localStorage
    saveToLocalStorage()
  }

  /**
   * Obtener tipo de acción para categorización
   */
  const getActionType = (action) => {
    if (action.includes('crear') || action.includes('create')) return 'create'
    if (action.includes('actualizar') || action.includes('update')) return 'update'
    if (action.includes('eliminar') || action.includes('delete')) return 'delete'
    if (action.includes('mover') || action.includes('move')) return 'move'
    return 'other'
  }

  /**
   * Obtener historial filtrado
   */
  const getFilteredHistory = (filters = {}) => {
    let filtered = [...history.value]

    if (filters.type) {
      filtered = filtered.filter(entry => entry.type === filters.type)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.details).toLowerCase().includes(searchLower)
      )
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= new Date(filters.dateTo))
    }

    return filtered
  }

  /**
   * Obtener historial de un anime específico
   */
  const getAnimeHistory = (animeId) => {
    return history.value.filter(entry => 
      entry.details.animeId === animeId || 
      entry.details.id === animeId ||
      entry.details.anime?.id === animeId
    )
  }

  /**
   * Limpiar historial
   */
  const clearHistory = () => {
    history.value = []
    saveToLocalStorage()
  }

  /**
   * Guardar en localStorage
   */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('anime_activity_history', JSON.stringify(history.value))
    } catch (error) {
      console.error('Error guardando historial:', error)
    }
  }

  /**
   * Cargar desde localStorage
   */
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('anime_activity_history')
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error cargando historial:', error)
    }
  }

  /**
   * Estadísticas del historial
   */
  const stats = computed(() => {
    const stats = {
      total: history.value.length,
      byType: {},
      recent: history.value.slice(0, 10)
    }

    history.value.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1
    })

    return stats
  })

  // Cargar historial al inicializar
  loadFromLocalStorage()

  return {
    history: computed(() => history.value),
    addEntry,
    getFilteredHistory,
    getAnimeHistory,
    clearHistory,
    stats
  }
}
