import { ref } from 'vue'

/**
 * Composable para manejo centralizado de errores
 */
export function useErrorHandler() {
  const errors = ref([])

  /**
   * Agregar un error al sistema
   * @param {Error|string} error - Error o mensaje
   * @param {string} context - Contexto donde ocurrió el error
   * @param {Object} details - Detalles adicionales
   */
  const addError = (error, context = 'Aplicación', details = {}) => {
    const errorObj = {
      id: Date.now() + Math.random(),
      message: error instanceof Error ? error.message : error,
      context,
      details,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : null
    }

    errors.value.unshift(errorObj)

    // Log en consola para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.error(`[${context}]`, errorObj)
    }

    return errorObj.id
  }

  /**
   * Limpiar un error específico
   */
  const removeError = (errorId) => {
    const index = errors.value.findIndex(e => e.id === errorId)
    if (index !== -1) {
      errors.value.splice(index, 1)
    }
  }

  /**
   * Limpiar todos los errores
   */
  const clearAllErrors = () => {
    errors.value = []
  }

  /**
   * Manejar error de forma segura (try-catch wrapper)
   */
  const handleError = async (fn, context = 'Operación', errorMessage = null) => {
    try {
      return await fn()
    } catch (error) {
      addError(
        errorMessage || error,
        context,
        { originalError: error }
      )
      throw error // Re-lanzar para que el caller pueda manejarlo si es necesario
    }
  }

  return {
    errors,
    addError,
    removeError,
    clearAllErrors,
    handleError
  }
}

