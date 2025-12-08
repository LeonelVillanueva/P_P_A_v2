/**
 * Utilidades para formatear datos
 */

/**
 * Formatea una fecha a formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
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

