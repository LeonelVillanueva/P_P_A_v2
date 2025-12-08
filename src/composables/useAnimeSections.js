import { computed } from 'vue'
import { SECTIONS, getStateBySection } from '../constants/sections'

/**
 * Composable para manejar las secciones de animes
 */
export function useAnimeSections(animeStore) {
  /**
   * Obtiene los animes filtrados por sección
   */
  const getAnimesPorSeccion = (seccionId) => {
    const estado = getStateBySection(seccionId)
    if (!estado) return []
    return animeStore.animes.filter(a => a.estado === estado)
  }

  /**
   * Obtiene el nombre de la sección por su ID
   */
  const getSectionName = (seccionId) => {
    const section = SECTIONS.find(s => s.id === seccionId)
    return section?.nombre || ''
  }

  /**
   * Obtiene el contador de animes por sección
   */
  const getSectionCount = (seccionId) => {
    return getAnimesPorSeccion(seccionId).length
  }

  return {
    SECTIONS,
    getAnimesPorSeccion,
    getSectionName,
    getSectionCount
  }
}

