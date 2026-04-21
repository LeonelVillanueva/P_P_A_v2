/**
 * Servicio de autenticación que se comunica con la API del servidor
 */

// En desarrollo, usar proxy de Vite. En producción, usar ruta relativa o URL configurada
const API_URL = import.meta.env.VITE_API_URL || '/api/auth'

// Modo fallback: si la API no está disponible, usar autenticación local (solo desarrollo)
const USE_FALLBACK_AUTH = import.meta.env.DEV && import.meta.env.VITE_USE_FALLBACK_AUTH === 'true'

const MAX_SESSION_DAYS = 7
const SESSION_EXPIRES_KEY = 'anime_saver_session_expires'

/** Tras elegir sesión extendida (>1 día), se oculta el selector hasta esta fecha o hasta que expire el token. */
const SESSION_PICKER_HIDDEN_UNTIL_KEY = 'anime_saver_session_picker_hidden_until'
const LAST_SESSION_DAYS_KEY = 'anime_saver_last_session_days'

function normalizeSessionDays(days) {
  const n = Math.floor(Number(days))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(MAX_SESSION_DAYS, n)
}

function clearSessionPickerPreferenceKeys() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_PICKER_HIDDEN_UNTIL_KEY)
  localStorage.removeItem(LAST_SESSION_DAYS_KEY)
}

/**
 * Si la sesión extendida sigue vigente (p. ej. cerraste sesión antes), no mostrar el selector hasta esa fecha.
 * @returns {boolean}
 */
export function shouldShowSessionPicker() {
  if (typeof window === 'undefined') return true
  const raw = localStorage.getItem(SESSION_PICKER_HIDDEN_UNTIL_KEY)
  const lastDays = localStorage.getItem(LAST_SESSION_DAYS_KEY)
  if (!raw) return true
  const until = parseInt(raw, 10)
  if (Number.isNaN(until) || Date.now() >= until) {
    clearSessionPickerPreferenceKeys()
    return true
  }
  if (!lastDays) {
    localStorage.removeItem(SESSION_PICKER_HIDDEN_UNTIL_KEY)
    return true
  }
  return false
}

/**
 * Días a usar al enviar login cuando el selector está oculto.
 * @returns {number}
 */
export function getLastSessionDaysForLogin() {
  if (typeof window === 'undefined') return 1
  const raw = localStorage.getItem(LAST_SESSION_DAYS_KEY)
  if (!raw) return 1
  return normalizeSessionDays(parseInt(raw, 10))
}

/**
 * Tras login correcto con sesión extendida: recordar hasta cuándo ocultar el selector (misma fecha que el token).
 * @param {number} days
 * @param {number} absoluteExpiresAtMs
 */
function persistExtendedSessionPickerPreference(days, absoluteExpiresAtMs) {
  if (typeof window === 'undefined') return
  const d = normalizeSessionDays(days)
  if (d <= 1) return
  localStorage.setItem(SESSION_PICKER_HIDDEN_UNTIL_KEY, String(absoluteExpiresAtMs))
  localStorage.setItem(LAST_SESSION_DAYS_KEY, String(d))
}

/**
 * Autenticación local de fallback (solo desarrollo)
 * @param {number} [sessionDays=1]
 */
async function fallbackLogin(password, sessionDays = 1) {
  const days = normalizeSessionDays(sessionDays)
  const durationMs = days * 24 * 60 * 60 * 1000
  console.log('🔧 Usando autenticación local (modo desarrollo)')
  
  const correctPasswordHash = import.meta.env.VITE_SITE_PASSWORD_HASH
  
  if (!correctPasswordHash) {
    console.error('❌ No hay contraseña configurada')
    return {
      success: false,
      error: 'No hay una credencial de acceso configurada en el entorno.'
    }
  }
  
  // Importar funciones de hash
  const { hashPassword, secureCompare } = await import('../utils/authSecurity')
  
  let isValid = false
  
  if (correctPasswordHash) {
    try {
      const inputHash = await hashPassword(password)
      isValid = secureCompare(inputHash, correctPasswordHash)
      console.log('🔐 Verificación con hash:', isValid ? '✅ Válida' : '❌ Inválida')
    } catch (error) {
      console.error('Error hashing password:', error)
      return {
        success: false,
        error: 'Error de autenticación'
      }
    }
  }
  
  if (isValid) {
    const expiresAt = Date.now() + durationMs
    // Generar token simple para desarrollo
    const token = btoa(JSON.stringify({
      authenticated: true,
      timestamp: Date.now(),
      exp: expiresAt
    }))
    
    localStorage.setItem('anime_saver_token', token)
    localStorage.setItem('anime_saver_token_expires', String(expiresAt))
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt))
    persistExtendedSessionPickerPreference(days, expiresAt)
    
    console.log('✅ Login exitoso (modo desarrollo)')
    
    return {
      success: true,
      token: token
    }
  }
  
  console.log('❌ Contraseña incorrecta')
  return {
    success: false,
    error: 'Contraseña incorrecta'
  }
}

/**
 * Intentar login con contraseña (validación en servidor)
 * @param {number} [sessionDays=1] Duración en días (1–7).
 */
export async function login(password, sessionDays = 1) {
  const days = normalizeSessionDays(sessionDays)
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        password,
        sessionDays: days
      })
    })
    
    // Si es 404 y estamos en desarrollo con fallback, usar autenticación local
    if (!response.ok && response.status === 404 && USE_FALLBACK_AUTH) {
      console.warn('⚠️ API no disponible, usando autenticación local (modo desarrollo)')
      return await fallbackLogin(password, days)
    }
    
    if (!response.ok && response.status === 404) {
      return {
        success: false,
        error: 'Servidor de autenticación no disponible. Ejecuta "npm run dev:all" o "npm run dev:api"'
      }
    }
    
    let data
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
    } catch {
      // Si falla parsear y estamos en desarrollo, intentar fallback
      if (USE_FALLBACK_AUTH) {
        console.warn('⚠️ Error al procesar respuesta, usando autenticación local')
        return await fallbackLogin(password, days)
      }
      return {
        success: false,
        error: 'Error al procesar respuesta del servidor'
      }
    }
    
    if (!response.ok) {
      // Si es error 500, intentar usar fallback en desarrollo
      if (response.status === 500 && USE_FALLBACK_AUTH) {
        console.warn('⚠️ Error 500 del servidor, usando autenticación local (modo desarrollo)')
        console.warn('💡 Verifica que las credenciales privadas de autenticación estén configuradas en el entorno.')
        return await fallbackLogin(password, days)
      }
      
      // Proporcionar mensaje de error más descriptivo
      let errorMessage = data.error || 'Error de autenticación'
      if (response.status === 500) {
        if (data.hint) {
          errorMessage += `. ${data.hint}`
        } else if (data.message) {
          errorMessage += `. ${data.message}`
        } else {
          errorMessage += '. Verifica la configuración de autenticación del servidor.'
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
    
    if (data.success) {
      const expiresIn = typeof data.expiresIn === 'number' ? data.expiresIn : days * 24 * 60 * 60 * 1000
      const expiresAt = Date.now() + expiresIn
      // Guardar solo una pista de expiración local; la sesión real vive en cookie HttpOnly.
      localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt))
      persistExtendedSessionPickerPreference(days, expiresAt)
      
      return {
        success: true,
        token: 'cookie-session'
      }
    }
    
    return {
      success: false,
      error: data.error || 'Error de autenticación'
    }
  } catch (error) {
    console.error('Login error:', error)
    
    // Si es error de red y estamos en desarrollo, intentar fallback
    if (USE_FALLBACK_AUTH && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.warn('⚠️ Error de conexión, usando autenticación local (modo desarrollo)')
      return await fallbackLogin(password, days)
    }
    
    return {
      success: false,
      error: 'Error de conexión. Verifica tu conexión a internet.'
    }
  }
}

/**
 * Verificar token local (fallback para desarrollo)
 */
function verifyFallbackToken(token) {
  try {
    const decoded = JSON.parse(atob(token))
    const now = Date.now()
    
    if (decoded.authenticated && decoded.exp && decoded.exp > now) {
      return { authenticated: true }
    }
    
    return { authenticated: false }
  } catch {
    return { authenticated: false }
  }
}

/**
 * Verificar si el token es válido
 */
export async function verifyToken(token) {
  // Si es token de fallback (base64 simple), verificar localmente
  try {
    // Intentar decodificar como token de fallback
    const decoded = JSON.parse(atob(token))
    if (decoded.authenticated !== undefined) {
      // Es token de fallback, verificar localmente
      return verifyFallbackToken(token)
    }
  } catch {
    // No es token de fallback, continuar con verificación del servidor
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'verify',
        token: token || undefined
      })
    })
    
    if (!response.ok && response.status === 404) {
      // Si API no disponible y es token de fallback, verificar localmente
      if (USE_FALLBACK_AUTH) {
        return verifyFallbackToken(token)
      }
      return {
        authenticated: false,
        error: 'Servidor de autenticación no disponible'
      }
    }
    
    let data
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
    } catch {
      // Si falla parsear y es token de fallback, verificar localmente
      if (USE_FALLBACK_AUTH) {
        return verifyFallbackToken(token)
      }
      return {
        authenticated: false,
        error: 'Error al procesar respuesta del servidor'
      }
    }
    
    if (!response.ok) {
      return {
        authenticated: false,
        error: data.error
      }
    }
    
    return {
      authenticated: data.authenticated || false
    }
  } catch (error) {
    console.error('Token verification error:', error)
    
    // Si es error de red y es token de fallback, verificar localmente
    if (USE_FALLBACK_AUTH) {
      return verifyFallbackToken(token)
    }
    
    return {
      authenticated: false,
      error: 'Error de conexión'
    }
  }
}

/**
 * Obtener token guardado
 */
export function getStoredToken() {
  if (typeof window === 'undefined') return null
  
  const sessionExpires = localStorage.getItem(SESSION_EXPIRES_KEY)
  if (sessionExpires) {
    const now = Date.now()
    const expiresAt = parseInt(sessionExpires, 10)
    if (!Number.isNaN(expiresAt) && now < expiresAt) {
      return 'cookie-session'
    }
    localStorage.removeItem(SESSION_EXPIRES_KEY)
  }

  const token = localStorage.getItem('anime_saver_token')
  const expires = localStorage.getItem('anime_saver_token_expires')
  
  if (!token || !expires) return null
  
  // Verificar si el token expiró
  const now = Date.now()
  const expiresAt = parseInt(expires, 10)
  
  if (now >= expiresAt) {
    // Token expirado: volver a mostrar el selector de duración en el próximo login
    localStorage.removeItem('anime_saver_token')
    localStorage.removeItem('anime_saver_token_expires')
    clearSessionPickerPreferenceKeys()
    return null
  }
  
  return token
}

/**
 * Eliminar token
 * @param {{ preserveSessionPickerPreference?: boolean }} [options] Si es true (p. ej. cierre de sesión manual), se mantiene la preferencia de ocultar el selector hasta la fecha acordada.
 */
export function removeToken(options = {}) {
  const { preserveSessionPickerPreference = false } = options
  if (typeof window === 'undefined') return
  localStorage.removeItem('anime_saver_token')
  localStorage.removeItem('anime_saver_token_expires')
  localStorage.removeItem(SESSION_EXPIRES_KEY)
  fetch(API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' })
  }).catch(() => {})
  if (!preserveSessionPickerPreference) {
    clearSessionPickerPreferenceKeys()
  }
}

