import { computed } from 'vue'

/**
 * Convierte un nombre de estado en un ID de sección (slug)
 */
function estadoToSectionId(estado) {
  return estado
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '_') // Reemplazar caracteres especiales con _
    .replace(/^_+|_+$/g, '') // Eliminar _ al inicio y final
}

/**
 * Composable para manejar las secciones de animes
 * Genera las secciones dinámicamente desde los estados de la base de datos
 */
export function useAnimeSections(animeStore) {
  /**
   * Genera las secciones dinámicamente desde los estados
   */
  const SECTIONS = computed(() => {
    if (!animeStore.estados || animeStore.estados.length === 0) {
      return []
    }
    
    return animeStore.estados.map(estado => ({
      id: estadoToSectionId(estado),
      nombre: estado
    }))
  })

  /**
   * Mapeo dinámico de IDs de sección a nombres de estado
   */
  const SECTION_STATE_MAP = computed(() => {
    const map = {}
    if (animeStore.estados && animeStore.estados.length > 0) {
      animeStore.estados.forEach(estado => {
        map[estadoToSectionId(estado)] = estado
      })
    }
    return map
  })

  /**
   * Obtiene el nombre del estado basado en el ID de sección
   */
  const getStateBySection = (sectionId) => {
    return SECTION_STATE_MAP.value[sectionId] || null
  }

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
    const estado = getStateBySection(seccionId)
    return estado || ''
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
    getSectionCount,
    getStateBySection
  }
}

