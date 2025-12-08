/**
 * Utilidades de seguridad para autenticación
 */

/**
 * Hash simple de contraseña (SHA-256)
 * Nota: En producción real, esto debería hacerse en el servidor
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Comparación segura de contraseñas (protección contra timing attacks)
 */
export function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Rate limiting para intentos de login
 */
const loginAttempts = new Map()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutos

export function checkRateLimit(identifier) {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier) || { count: 0, lockoutUntil: 0 }
  
  // Si está bloqueado, verificar si ya pasó el tiempo
  if (attempts.lockoutUntil > now) {
    const remainingMinutes = Math.ceil((attempts.lockoutUntil - now) / 60000)
    return {
      allowed: false,
      lockout: true,
      remainingMinutes
    }
  }
  
  // Si ya pasó el lockout, resetear
  if (attempts.lockoutUntil > 0 && attempts.lockoutUntil <= now) {
    attempts.count = 0
    attempts.lockoutUntil = 0
  }
  
  // Verificar intentos
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockoutUntil = now + LOCKOUT_TIME
    loginAttempts.set(identifier, attempts)
    return {
      allowed: false,
      lockout: true,
      remainingMinutes: 15
    }
  }
  
  return {
    allowed: true,
    lockout: false,
    remainingAttempts: MAX_ATTEMPTS - attempts.count
  }
}

export function recordFailedAttempt(identifier) {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockoutUntil: 0 }
  attempts.count++
  loginAttempts.set(identifier, attempts)
}

export function resetAttempts(identifier) {
  loginAttempts.delete(identifier)
}

/**
 * Limpiar intentos antiguos periódicamente
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, attempts] of loginAttempts.entries()) {
    if (attempts.lockoutUntil > 0 && attempts.lockoutUntil <= now) {
      loginAttempts.delete(key)
    }
  }
}, 60000) // Cada minuto

