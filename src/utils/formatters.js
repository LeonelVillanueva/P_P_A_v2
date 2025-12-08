/**
 * Utilidades para formatear datos
 */

/**
 * Formatea una fecha a formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @param {boolean} short - Si es true, formato corto para móviles
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, short = false) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  
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

