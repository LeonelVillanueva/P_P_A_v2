import { ref, computed } from 'vue'

/**
 * Composable para el Command Palette (búsqueda rápida con Ctrl+K)
 */
export function useCommandPalette() {
  const isOpen = ref(false)
  const query = ref('')
  const selectedIndex = ref(0)

  const commands = computed(() => {
    const baseCommands = [
      { id: 'search', label: 'Buscar anime', icon: '🔍', action: 'search' },
      { id: 'new', label: 'Nuevo anime', icon: '➕', action: 'new-anime' },
      { id: 'calendar', label: 'Vista de calendario', icon: '📅', action: 'calendar' },
      { id: 'stats', label: 'Estadísticas', icon: '📊', action: 'stats' },
      { id: 'config', label: 'Configuración', icon: '⚙️', action: 'config' },
      { id: 'history', label: 'Historial de actividad', icon: '🕐', action: 'history' }
    ]

    if (!query.value.trim()) {
      return baseCommands
    }

    const searchLower = query.value.toLowerCase()
    return baseCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchLower)
    )
  })

  const open = () => {
    isOpen.value = true
    query.value = ''
    selectedIndex.value = 0
  }

  const close = () => {
    isOpen.value = false
    query.value = ''
    selectedIndex.value = 0
  }

  const selectNext = () => {
    if (selectedIndex.value < commands.value.length - 1) {
      selectedIndex.value++
    }
  }

  const selectPrevious = () => {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  }

  const executeSelected = () => {
    if (commands.value[selectedIndex.value]) {
      return commands.value[selectedIndex.value].action
    }
    return null
  }

  return {
    isOpen,
    query,
    selectedIndex,
    commands,
    open,
    close,
    selectNext,
    selectPrevious,
    executeSelected
  }
}
