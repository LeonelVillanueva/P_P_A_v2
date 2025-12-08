/**
 * Composable para implementar focus trap en modales
 * Asegura que el focus no salga del modal y permite cerrar con Escape
 */

import { onMounted, onUnmounted } from 'vue'

export function useFocusTrap(modalRef, isOpen, onClose) {
  let previousActiveElement = null
  let firstFocusableElement = null
  let lastFocusableElement = null

  /**
   * Obtener todos los elementos enfocables dentro del modal
   */
  function getFocusableElements() {
    if (!modalRef.value) return []
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')
    
    return Array.from(modalRef.value.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Filtrar elementos ocultos
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
  }

  /**
   * Manejar tecla Escape
   */
  function handleEscape(event) {
    if (event.key === 'Escape' && isOpen.value && onClose) {
      onClose()
    }
  }

  /**
   * Manejar Tab para mantener focus dentro del modal
   */
  function handleTab(event) {
    if (!isOpen.value) return
    
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return
    
    firstFocusableElement = focusableElements[0]
    lastFocusableElement = focusableElements[focusableElements.length - 1]
    
    // Si Tab desde el último elemento, ir al primero
    if (event.shiftKey && document.activeElement === firstFocusableElement) {
      event.preventDefault()
      lastFocusableElement.focus()
    }
    // Si Tab desde el último elemento, ir al primero
    else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      event.preventDefault()
      firstFocusableElement.focus()
    }
  }

  /**
   * Inicializar focus trap
   */
  function initFocusTrap() {
    if (!isOpen.value || !modalRef.value) return
    
    // Guardar elemento activo antes de abrir el modal
    previousActiveElement = document.activeElement
    
    // Obtener elementos enfocables
    const focusableElements = getFocusableElements()
    
    if (focusableElements.length > 0) {
      firstFocusableElement = focusableElements[0]
      lastFocusableElement = focusableElements[focusableElements.length - 1]
      
      // Enfocar el primer elemento
      setTimeout(() => {
        firstFocusableElement.focus()
      }, 100)
    }
    
    // Agregar event listeners
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)
  }

  /**
   * Restaurar focus al elemento anterior
   */
  function restoreFocus() {
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus()
    }
  }

  /**
   * Limpiar event listeners
   */
  function cleanup() {
    document.removeEventListener('keydown', handleEscape)
    document.removeEventListener('keydown', handleTab)
  }

  onMounted(() => {
    if (isOpen.value) {
      initFocusTrap()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    initFocusTrap,
    restoreFocus,
    cleanup
  }
}

