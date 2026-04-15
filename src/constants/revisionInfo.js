/**
 * Determina si un estado tiene habilitado el paso Seguimiento de información.
 * - null/undefined: todos los estados (compatibilidad con comportamiento anterior)
 * - []: ninguno
 * - ['x', 'y']: solo los incluidos
 */
export function estadoTienePasoSeguimiento(estado, estadosPasoSeguimiento) {
  const current = (estado || '').trim()
  if (!current) return false
  if (estadosPasoSeguimiento == null) return true
  if (!Array.isArray(estadosPasoSeguimiento) || estadosPasoSeguimiento.length === 0) return false
  return estadosPasoSeguimiento.includes(current)
}
