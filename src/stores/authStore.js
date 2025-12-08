import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, verifyToken, getStoredToken, removeToken } from '../services/authService'
import { checkRateLimit, recordFailedAttempt, resetAttempts } from '../utils/authSecurity'

/**
 * Store de autenticación con validación en servidor
 * 
 * IMPORTANTE: 
 * - Configura JWT_SECRET en Vercel (Environment Variables)
 * - Configura VITE_SITE_PASSWORD o VITE_SITE_PASSWORD_HASH en Vercel
 */
export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const rateLimitKey = 'anime_saver_ip' // Identificador para rate limiting
  const checkingAuth = ref(false)

  /**
   * Obtener identificador único para rate limiting
   */
  const getIdentifier = () => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || ''
      const lang = navigator.language || ''
      return `${ua.substring(0, 20)}_${lang}_${rateLimitKey}`
    }
    return rateLimitKey
  }

  /**
   * Verificar si hay un token válido guardado
   */
  const checkStoredSession = async () => {
    checkingAuth.value = true
    
    try {
      const token = getStoredToken()
      
      if (!token) {
        isAuthenticated.value = false
        checkingAuth.value = false
        return false
      }
      
      // Verificar token con el servidor
      const result = await verifyToken(token)
      
      if (result.authenticated) {
        isAuthenticated.value = true
        checkingAuth.value = false
        return true
      } else {
        // Token inválido, limpiar
        removeToken()
        isAuthenticated.value = false
        checkingAuth.value = false
        return false
      }
    } catch (error) {
      console.error('Error checking session:', error)
      isAuthenticated.value = false
      checkingAuth.value = false
      return false
    }
  }

  // Inicializar: verificar sesión guardada
  checkStoredSession()

  /**
   * Intentar login con contraseña (validación en servidor)
   */
  const login = async (password) => {
    // Obtener identificador único para rate limiting
    const identifier = getIdentifier()
    
    // Verificar rate limiting (cliente)
    const rateLimit = checkRateLimit(identifier)
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: rateLimit.lockout 
          ? `Demasiados intentos fallidos. Intenta de nuevo en ${rateLimit.remainingMinutes} minutos.`
          : 'Demasiados intentos fallidos'
      }
    }
    
    // Llamar a la API del servidor para validar contraseña
    const result = await apiLogin(password)
    
    if (result.success) {
      // Login exitoso
      isAuthenticated.value = true
      
      // Resetear intentos fallidos
      resetAttempts(identifier)
      
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
        error: result.error || 'Contraseña incorrecta',
        remainingAttempts: newRateLimit.remainingAttempts
      }
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = () => {
    isAuthenticated.value = false
    removeToken()
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    checkingAuth: computed(() => checkingAuth.value),
    login,
    logout,
    checkStoredSession
  }
})

