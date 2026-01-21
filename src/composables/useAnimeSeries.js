import { computed } from 'vue'

/**
 * Composable para manejar agrupación de animes por serie
 * Evita duplicados cuando temporadas del mismo anime están en diferentes estados
 */
export function useAnimeSeries(animeStore) {
  /**
   * Agrupa animes por nombre_base (serie)
   * Cada serie contiene todas sus temporadas
   */
  const seriesAgrupadas = computed(() => {
    if (!animeStore.animes || animeStore.animes.length === 0) {
      return []
    }

    const grouped = {}
    
    animeStore.animes.forEach(anime => {
      // Usar nombre_base si existe, sino usar nombre
      const serieKey = anime.nombre_base || anime.nombre
      
      if (!grouped[serieKey]) {
        grouped[serieKey] = {
          nombre_base: serieKey,
          imagen_url: anime.imagen_url,
          temporadas: [],
          estados: new Set(),
          jikan_id: anime.jikan_id,
          // Información agregada de la serie
          total_temporadas: 0,
          temporadas_vistas: 0,
          temporadas_emision: 0,
          temporadas_estrenos: 0
        }
      }

      // Agregar temporada
      grouped[serieKey].temporadas.push(anime)
      
      // Actualizar estados
      if (anime.estado) {
        grouped[serieKey].estados.add(anime.estado)
      }

      // Contar temporadas por estado
      if (anime.estado === 'Animes Vistos') {
        grouped[serieKey].temporadas_vistas++
      } else if (anime.estado === 'Emisión') {
        grouped[serieKey].temporadas_emision++
      } else if (anime.estado === 'Estrenos') {
        grouped[serieKey].temporadas_estrenos++
      }
    })

    // Convertir Set a Array y ordenar temporadas
    return Object.values(grouped).map(serie => {
      serie.estados = Array.from(serie.estados)
      serie.total_temporadas = serie.temporadas.length
      
      // Ordenar temporadas por número de temporada
      serie.temporadas.sort((a, b) => {
        const numA = a.temporada_numero || 0
        const numB = b.temporada_numero || 0
        if (numA !== numB) return numA - numB
        
        // Si no tienen número, ordenar por fecha de creación
        return new Date(a.created_at) - new Date(b.created_at)
      })

      return serie
    })
  })

  /**
   * Obtener serie por nombre_base
   */
  const getSerie = (nombreBase) => {
    return seriesAgrupadas.value.find(s => s.nombre_base === nombreBase)
  }

  /**
   * Obtener temporadas de una serie filtradas por estado
   */
  const getTemporadasByEstado = (nombreBase, estado) => {
    const serie = getSerie(nombreBase)
    if (!serie) return []
    return serie.temporadas.filter(t => t.estado === estado)
  }

  /**
   * Verificar si una serie tiene temporadas en múltiples estados
   */
  const hasMultipleEstados = (nombreBase) => {
    const serie = getSerie(nombreBase)
    return serie && serie.estados.length > 1
  }

  /**
   * Obtener el estado principal de una serie (el más común o el más reciente)
   */
  const getEstadoPrincipal = (nombreBase) => {
    const serie = getSerie(nombreBase)
    if (!serie || serie.estados.length === 0) return null
    
    // Si solo tiene un estado, retornarlo
    if (serie.estados.length === 1) {
      return serie.estados[0]
    }

    // Priorizar: Emisión > Estrenos > En espera > Animes Vistos
    const priority = ['Emisión', 'Estrenos', 'En espera', 'Animes Vistos']
    for (const estado of priority) {
      if (serie.estados.includes(estado)) {
        return estado
      }
    }

    // Si no coincide con prioridad, usar el primero
    return serie.estados[0]
  }

  /**
   * Filtrar series por estado (si alguna temporada tiene ese estado)
   */
  const filterSeriesByEstado = (estado) => {
    if (!estado) return seriesAgrupadas.value
    return seriesAgrupadas.value.filter(serie => 
      serie.estados.includes(estado)
    )
  }

  /**
   * Buscar series por nombre
   */
  const searchSeries = (query) => {
    if (!query || query.trim() === '') {
      return seriesAgrupadas.value
    }

    const searchLower = query.toLowerCase().trim()
    return seriesAgrupadas.value.filter(serie => 
      serie.nombre_base.toLowerCase().includes(searchLower) ||
      serie.temporadas.some(t => t.nombre.toLowerCase().includes(searchLower))
    )
  }

  return {
    seriesAgrupadas,
    getSerie,
    getTemporadasByEstado,
    hasMultipleEstados,
    getEstadoPrincipal,
    filterSeriesByEstado,
    searchSeries
  }
}
