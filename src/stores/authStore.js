import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
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
  /** Solo true tras login con contraseña exitoso; no al restaurar sesión con token. */
  const postLoginRevealPending = ref(false)

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
      
      // Verificar token con el servidor (con timeout)
      const verifyPromise = verifyToken(token)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
      
      let result
      try {
        result = await Promise.race([verifyPromise, timeoutPromise])
      } catch (timeoutError) {
        // Timeout o error - en desarrollo, si el token existe, permitir acceso
        if (import.meta.env.DEV) {
          console.warn('⚠️ Timeout verificando token, permitiendo acceso en desarrollo')
          isAuthenticated.value = true
          checkingAuth.value = false
          return true
        }
        throw timeoutError
      }
      
      if (result && result.authenticated) {
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
      
      // En desarrollo, si hay error pero el token existe, permitir acceso
      if (import.meta.env.DEV) {
        const token = getStoredToken()
        if (token) {
          console.warn('⚠️ Error verificando token, permitiendo acceso en desarrollo')
          isAuthenticated.value = true
          checkingAuth.value = false
          return true
        }
      }
      
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
  /**
   * @param {number} [sessionDays=1] Duración de sesión en días (1–7); el servidor acota el JWT.
   */
  const login = async (password, sessionDays = 1) => {
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
    const result = await apiLogin(password, sessionDays)
    
    if (result.success) {
      // Login exitoso - el token ya está guardado en authService
      // Establecer checkingAuth en false primero, luego isAuthenticated en true
      // Esto asegura que App.vue reaccione correctamente
      checkingAuth.value = false
      postLoginRevealPending.value = true
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
    postLoginRevealPending.value = false
    isAuthenticated.value = false
    removeToken({ preserveSessionPickerPreference: true })
  }

  const completePostLoginReveal = () => {
    postLoginRevealPending.value = false
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    checkingAuth: computed(() => checkingAuth.value),
    postLoginRevealPending: readonly(postLoginRevealPending),
    login,
    logout,
    checkStoredSession,
    completePostLoginReveal
  }
})

