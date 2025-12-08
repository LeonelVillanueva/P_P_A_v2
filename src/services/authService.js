/**
 * Servicio de autenticación que se comunica con la API del servidor
 */

// En desarrollo, usar proxy de Vite. En producción, usar ruta relativa o URL configurada
const API_URL = import.meta.env.VITE_API_URL || '/api/auth'

// Modo fallback: si la API no está disponible, usar autenticación local (solo desarrollo)
const USE_FALLBACK_AUTH = import.meta.env.DEV && import.meta.env.VITE_USE_FALLBACK_AUTH !== 'false'

/**
 * Autenticación local de fallback (solo desarrollo)
 */
async function fallbackLogin(password) {
  console.log('🔧 Usando autenticación local (modo desarrollo)')
  
  const correctPasswordHash = import.meta.env.VITE_SITE_PASSWORD_HASH
  const correctPassword = import.meta.env.VITE_SITE_PASSWORD
  
  if (!correctPassword && !correctPasswordHash) {
    console.error('❌ No hay contraseña configurada')
    return {
      success: false,
      error: 'Contraseña no configurada en variables de entorno. Agrega VITE_SITE_PASSWORD o VITE_SITE_PASSWORD_HASH en tu .env'
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
  } else if (correctPassword) {
    isValid = secureCompare(password, correctPassword)
    console.log('🔐 Verificación directa:', isValid ? '✅ Válida' : '❌ Inválida')
  }
  
  if (isValid) {
    // Generar token simple para desarrollo
    const token = btoa(JSON.stringify({
      authenticated: true,
      timestamp: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000)
    }))
    
    localStorage.setItem('anime_saver_token', token)
    localStorage.setItem('anime_saver_token_expires', String(Date.now() + (24 * 60 * 60 * 1000)))
    
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
 */
export async function login(password) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        password
      })
    })
    
    // Si es 404 y estamos en desarrollo con fallback, usar autenticación local
    if (!response.ok && response.status === 404 && USE_FALLBACK_AUTH) {
      console.warn('⚠️ API no disponible, usando autenticación local (modo desarrollo)')
      return await fallbackLogin(password)
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
    } catch (e) {
      // Si falla parsear y estamos en desarrollo, intentar fallback
      if (USE_FALLBACK_AUTH) {
        console.warn('⚠️ Error al procesar respuesta, usando autenticación local')
        return await fallbackLogin(password)
      }
      return {
        success: false,
        error: 'Error al procesar respuesta del servidor'
      }
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error de autenticación'
      }
    }
    
    if (data.success && data.token) {
      // Guardar token en localStorage
      localStorage.setItem('anime_saver_token', data.token)
      localStorage.setItem('anime_saver_token_expires', String(Date.now() + data.expiresIn))
      
      return {
        success: true,
        token: data.token
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
      return await fallbackLogin(password)
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
  } catch (error) {
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
  } catch (e) {
    // No es token de fallback, continuar con verificación del servidor
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'verify',
        token
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
    } catch (e) {
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
  
  const token = localStorage.getItem('anime_saver_token')
  const expires = localStorage.getItem('anime_saver_token_expires')
  
  if (!token || !expires) return null
  
  // Verificar si el token expiró
  const now = Date.now()
  const expiresAt = parseInt(expires, 10)
  
  if (now >= expiresAt) {
    // Token expirado, limpiar
    localStorage.removeItem('anime_saver_token')
    localStorage.removeItem('anime_saver_token_expires')
    return null
  }
  
  return token
}

/**
 * Eliminar token
 */
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('anime_saver_token')
    localStorage.removeItem('anime_saver_token_expires')
  }
}

