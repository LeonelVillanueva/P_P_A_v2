/**
 * Servicio de autenticación que se comunica con la API del servidor
 */

const API_URL = import.meta.env.VITE_API_URL || '/api/auth'

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
    
    const data = await response.json()
    
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
    return {
      success: false,
      error: 'Error de conexión. Verifica tu conexión a internet.'
    }
  }
}

/**
 * Verificar si el token es válido
 */
export async function verifyToken(token) {
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
    
    const data = await response.json()
    
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

