import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store de autenticación para protección privada
 * 
 * IMPORTANTE: Configura la contraseña en la variable de entorno VITE_SITE_PASSWORD
 * O cambia la contraseña por defecto en este archivo
 */
export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const sessionKey = 'anime_saver_auth'

  // Obtener contraseña de variable de entorno
  // Configura VITE_SITE_PASSWORD en tu archivo .env
  const correctPassword = import.meta.env.VITE_SITE_PASSWORD
  
  // Verificar que la contraseña esté configurada
  if (!correctPassword && import.meta.env.DEV) {
    console.warn('⚠️ VITE_SITE_PASSWORD no está configurada en .env')
    console.warn('📝 Agrega VITE_SITE_PASSWORD=tu-contraseña en tu archivo .env')
  }

  // Verificar si ya hay una sesión guardada
  const checkStoredSession = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(sessionKey)
      if (stored) {
        // Verificar que la sesión no haya expirado (24 horas)
        const sessionData = JSON.parse(stored)
        const now = Date.now()
        if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
          isAuthenticated.value = true
          return true
        } else {
          localStorage.removeItem(sessionKey)
        }
      }
    }
    return false
  }

  // Inicializar: verificar sesión guardada
  checkStoredSession()

  /**
   * Intentar login con contraseña
   */
  const login = (password) => {
    // Comparación simple (en producción, usa hash)
    if (password === correctPassword) {
      isAuthenticated.value = true
      
      // Guardar sesión en localStorage (24 horas)
      if (typeof window !== 'undefined') {
        localStorage.setItem(sessionKey, JSON.stringify({
          timestamp: Date.now()
        }))
      }
      
      return true
    }
    return false
  }

  /**
   * Cerrar sesión
   */
  const logout = () => {
    isAuthenticated.value = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem(sessionKey)
    }
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    checkStoredSession
  }
})

