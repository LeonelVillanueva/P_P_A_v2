/**
 * Utilidades para formatear datos
 */

/**
 * Parsea fechas evitando desfases por zona horaria para formato YYYY-MM-DD.
 * Cuando viene solo fecha (sin hora), se crea en hora local.
 */
const parseDateSafe = (value) => {
  if (!value) return null 
  if (value instanceof Date) return value 
  if (typeof value !== 'string') return new Date(value)

  const raw = value.trim()
  if (!raw) return null

  // Caso típico de inputs type="date" almacenados como YYYY-MM-DD.
  const onlyDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (onlyDateMatch) {
    const year = Number(onlyDateMatch[1]) 
    const monthIndex = Number(onlyDateMatch[2]) - 1
    const day = Number(onlyDateMatch[3]) 
    return new Date(year, monthIndex, day) 
  }
  return new Date(raw) 
}

/**
 * Formatea una fecha a formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @param {boolean} short - Si es true, formato corto para móviles
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, short = false) => {
  if (!dateString) return ''
  const date = parseDateSafe(dateString)
  if (!date || Number.isNaN(date.getTime())) return ''
  
  if (short) {
    // Formato corto para móviles: DD/MM
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }
  
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short' 
  })
}

/**
 * Formatea el contador de animes
 * @param {number} count - Cantidad de animes
 * @returns {string} Texto formateado
 */
export const formatAnimeCount = (count) => {
  return count === 1 ? 'anime' : 'animes'
}

/**
 * Formatea fecha y hora completa
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatea tiempo relativo (hace X tiempo)
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays < 7) return `Hace ${diffDays} d`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`
  return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`
}

