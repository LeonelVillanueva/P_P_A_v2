import { ref } from 'vue'

/**
 * Cierre por clic en overlay (mousedown y mouseup en el mismo elemento).
 */
export function useModalOverlay(emitClose) {
  const overlayRef = ref(null)
  const mouseDownTarget = ref(null)

  function handleOverlayMouseDown(event) {
    mouseDownTarget.value = event.target
  }

  function handleOverlayMouseUp(event, { loading = false } = {}) {
    if (
      mouseDownTarget.value === overlayRef.value &&
      event.target === overlayRef.value &&
      !loading
    ) {
      emitClose()
    }
    mouseDownTarget.value = null
  }

  return {
    overlayRef,
    handleOverlayMouseDown,
    handleOverlayMouseUp
  }
}
