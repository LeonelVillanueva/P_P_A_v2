import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable para auto-guardado y sincronización
 */
export function useAutoSave(options = {}) {
  const {
    debounceMs = 1000,
    onSave = null,
    onSaveError = null
  } = options

  const hasUnsavedChanges = ref(false)
  const isSaving = ref(false)
  const lastSaved = ref(null)
  const saveQueue = ref([])

  let saveTimeout = null

  /**
   * Marcar que hay cambios sin guardar
   */
  const markDirty = () => {
    hasUnsavedChanges.value = true
    scheduleSave()
  }

  /**
   * Programar guardado automático
   */
  const scheduleSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
      performSave()
    }, debounceMs)
  }

  /**
   * Realizar guardado
   */
  const performSave = async () => {
    if (isSaving.value || saveQueue.value.length === 0) {
      return
    }

    isSaving.value = true

    try {
      // Ejecutar función de guardado si está definida
      if (onSave) {
        await onSave(saveQueue.value)
      }

      // Limpiar cola
      saveQueue.value = []
      hasUnsavedChanges.value = false
      lastSaved.value = new Date().toISOString()

      // Mostrar indicador de guardado exitoso
      showSaveIndicator('success')
    } catch (error) {
      console.error('Error en auto-guardado:', error)
      hasUnsavedChanges.value = true
      
      if (onSaveError) {
        onSaveError(error)
      }

      showSaveIndicator('error')
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Agregar cambio a la cola de guardado
   */
  const queueChange = (change) => {
    saveQueue.value.push({
      ...change,
      timestamp: new Date().toISOString()
    })
    markDirty()
  }

  /**
   * Guardar inmediatamente (sin debounce)
   */
  const saveNow = async () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    await performSave()
  }

  /**
   * Mostrar indicador visual de guardado
   */
  const showSaveIndicator = (status) => {
    // Crear elemento de notificación
    const indicator = document.createElement('div')
    indicator.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all ${
      status === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`
    indicator.textContent = status === 'success' ? '✓ Guardado' : '✗ Error al guardar'
    
    document.body.appendChild(indicator)

    setTimeout(() => {
      indicator.style.opacity = '0'
      indicator.style.transform = 'translateY(10px)'
      setTimeout(() => {
        document.body.removeChild(indicator)
      }, 300)
    }, 2000)
  }

  /**
   * Limpiar al desmontar
   */
  onUnmounted(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
  })

  return {
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    markDirty,
    queueChange,
    saveNow,
    performSave
  }
}
