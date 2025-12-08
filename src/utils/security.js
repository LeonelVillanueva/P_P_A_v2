/**
 * Utilidades de seguridad adicionales
 */

/**
 * Rate limiting simple (cliente)
 * Nota: El rate limiting real debe hacerse en el servidor
 */
const rateLimitStore = new Map()

export function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  // Resetear si la ventana expiró
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  // Incrementar contador
  record.count++
  
  if (record.count > maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: record.resetTime
    }
  }
  
  return { 
    allowed: true, 
    remaining: maxRequests - record.count
  }
}

/**
 * Limpiar rate limit store periódicamente
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Limpiar cada minuto

/**
 * Generar nombre de archivo seguro
 */
export function generateSafeFileName(originalName, prefix = '') {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) 
    ? extension 
    : 'jpg'
  
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
  
  return `${safePrefix}_${timestamp}_${random}.${safeExtension}`
}

/**
 * Validar origen de URL (CORS)
 */
export function isValidImageOrigin(url) {
  if (!url) return false
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // Permitir localhost para desarrollo
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true
    }
    
    // Permitir dominios conocidos de APIs de anime
    const allowedDomains = [
      'cdn.myanimelist.net',
      'api.jikan.moe',
      'images.unsplash.com',
      'supabase.co',
      'storage.supabase.co'
    ]
    
    return allowedDomains.some(domain => hostname.includes(domain))
  } catch {
    return false
  }
}

