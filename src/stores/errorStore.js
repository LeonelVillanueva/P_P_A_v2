import { defineStore } from 'pinia'
import { useErrorHandler } from '../composables/useErrorHandler'

/**
 * Store global para manejo de errores
 */
export const useErrorStore = defineStore('error', () => {
  const {
    errors,
    addError,
    removeError,
    clearAllErrors,
    handleError
  } = useErrorHandler()

  return {
    errors,
    addError,
    removeError,
    clearAllErrors,
    handleError
  }
})

