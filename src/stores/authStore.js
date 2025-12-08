import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hashPassword, secureCompare, checkRateLimit, recordFailedAttempt, resetAttempts } from '../utils/authSecurity'

/**
 * Store de autenticación para protección privada con seguridad mejorada
 * 
 * IMPORTANTE: Configura la contraseña en la variable de entorno VITE_SITE_PASSWORD
 */
export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const sessionKey = 'anime_saver_auth'
  const rateLimitKey = 'anime_saver_ip' // Identificador para rate limiting

  // Obtener hash de contraseña de variable de entorno
  // La contraseña se hashea al configurarse
  const correctPasswordHash = import.meta.env.VITE_SITE_PASSWORD_HASH
  
  // Si no hay hash, usar la contraseña directa (modo legacy - menos seguro)
  const correctPassword = import.meta.env.VITE_SITE_PASSWORD
  
  // Verificar que la contraseña esté configurada
  if (!correctPassword && !correctPasswordHash && import.meta.env.DEV) {
    console.warn('⚠️ VITE_SITE_PASSWORD o VITE_SITE_PASSWORD_HASH no está configurada en .env')
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
   * Intentar login con contraseña (con seguridad mejorada)
   */
  const login = async (password) => {
    // Obtener identificador único para rate limiting
    const identifier = getIdentifier()
    
    // Verificar rate limiting
    const rateLimit = checkRateLimit(identifier)
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: rateLimit.lockout 
          ? `Demasiados intentos fallidos. Intenta de nuevo en ${rateLimit.remainingMinutes} minutos.`
          : 'Demasiados intentos fallidos'
      }
    }
    
    // Verificar contraseña
    let isValid = false
    
    if (correctPasswordHash) {
      // Modo seguro: comparar hash
      try {
        const inputHash = await hashPassword(password)
        isValid = secureCompare(inputHash, correctPasswordHash)
      } catch (error) {
        console.error('Error hashing password:', error)
        return {
          success: false,
          error: 'Error de autenticación'
        }
      }
    } else if (correctPassword) {
      // Modo legacy: comparación directa (menos seguro pero compatible)
      // Usar comparación segura para evitar timing attacks
      isValid = secureCompare(password, correctPassword)
    } else {
      return {
        success: false,
        error: 'Sistema de autenticación no configurado'
      }
    }
    
    if (isValid) {
      // Login exitoso
      isAuthenticated.value = true
      
      // Resetear intentos fallidos
      resetAttempts(identifier)
      
      // Guardar sesión en localStorage (24 horas)
      if (typeof window !== 'undefined') {
        localStorage.setItem(sessionKey, JSON.stringify({
          timestamp: Date.now()
        }))
      }
      
      return {
        success: true,
        error: null
      }
    } else {
      // Login fallido
      recordFailedAttempt(identifier)
      
      // Verificar si ahora está bloqueado
      const newRateLimit = checkRateLimit(identifier)
      if (newRateLimit.lockout) {
        return {
          success: false,
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${newRateLimit.remainingMinutes} minutos.`
        }
      }
      
      return {
        success: false,
        error: 'Contraseña incorrecta',
        remainingAttempts: newRateLimit.remainingAttempts
      }
    }
  }
  
  /**
   * Obtener identificador único para rate limiting
   */
  const getIdentifier = () => {
    // Usar una combinación de user agent y otras características
    // No es perfecto pero ayuda a prevenir ataques básicos
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || ''
      const lang = navigator.language || ''
      return `${ua.substring(0, 20)}_${lang}_${rateLimitKey}`
    }
    return rateLimitKey
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

