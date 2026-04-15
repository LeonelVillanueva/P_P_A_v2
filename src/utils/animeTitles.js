/**
 * Títulos: obra (original) + entrega opcional (secuela / temporada con otro nombre).
 */

/**
 * Texto principal para listados, tarjetas y mensajes.
 * Prioriza el título de la entrega si existe; si no, el título original de la obra.
 */
export function getAnimeDisplayTitle(anime) {
  if (!anime) return ''
  const entrega = (anime.titulo_entrega || '').trim()
  if (entrega) return entrega
  return (anime.titulo_original || '').trim()
}

/**
 * Clave de agrupación: misma obra bajo un solo título original.
 */
export function getAnimeObraKey(anime) {
  if (!anime) return ''
  return (anime.titulo_original || '').trim()
}

/**
 * Ordenación estable (obra + entrega).
 */
export function compareAnimesByTitle(a, b) {
  const ka = `${(a.titulo_original || '').trim()}\u0000${(a.titulo_entrega || '').trim()}`
  const kb = `${(b.titulo_original || '').trim()}\u0000${(b.titulo_entrega || '').trim()}`
  return ka.localeCompare(kb, 'es', { sensitivity: 'base' })
}
