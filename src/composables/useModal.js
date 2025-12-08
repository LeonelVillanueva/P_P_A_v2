import { ref } from 'vue'

/**
 * Composable para manejar modales
 */
export function useModal() {
  const isOpen = ref(false)
  const selectedItem = ref(null)

  const open = (item = null) => {
    selectedItem.value = item
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    selectedItem.value = null
  }

  return {
    isOpen,
    selectedItem,
    open,
    close
  }
}

