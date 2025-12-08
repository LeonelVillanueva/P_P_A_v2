import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(shortcuts) {
  const handleKeydown = (event) => {
    // Ignorar si está en un input, textarea o contenteditable
    const target = event.target
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable ||
                    target.closest('[contenteditable="true"]')
    
    if (isInput) {
      // Permitir Ctrl+K en inputs para búsqueda
      if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        if (shortcuts['ctrl+k']) {
          shortcuts['ctrl+k'](event)
        }
      }
      return
    }

    // Construir la combinación de teclas
    const key = event.key.toLowerCase()
    const ctrl = event.ctrlKey || event.metaKey
    const shift = event.shiftKey
    const alt = event.altKey

    let combination = ''
    if (ctrl) combination += 'ctrl+'
    if (shift) combination += 'shift+'
    if (alt) combination += 'alt+'
    combination += key

    // Buscar el atajo
    if (shortcuts[combination]) {
      event.preventDefault()
      shortcuts[combination](event)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

