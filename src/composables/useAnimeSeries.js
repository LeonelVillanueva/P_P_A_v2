import { computed } from 'vue'
import { getAnimeObraKey } from '../utils/animeTitles'

/**
 * Composable para manejar agrupación de animes por obra (titulo_original)
 * Evita duplicados cuando temporadas del mismo anime están en diferentes estados
 */
export function useAnimeSeries(animeStore) {
  /**
   * Agrupa animes por titulo_original (misma obra)
   * Cada serie contiene todas sus temporadas / entregas
   */
  const seriesAgrupadas = computed(() => {
    if (!animeStore.animes || animeStore.animes.length === 0) {
      return []
    }

    const grouped = {}
    
    animeStore.animes.forEach(anime => {
      const serieKey = getAnimeObraKey(anime) || '(sin título)'
      
      if (!grouped[serieKey]) {
        grouped[serieKey] = {
          titulo_original: serieKey,
          imagen_url: anime.imagen_url,
          temporadas: [],
          estados: new Set(),
          jikan_id: anime.jikan_id,
          total_temporadas: 0
        }
      }

      // Agregar temporada
      grouped[serieKey].temporadas.push(anime)
      
      // Actualizar estados
      if (anime.estado) {
        grouped[serieKey].estados.add(anime.estado)
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
   * Obtener serie por titulo_original (clave de obra)
   */
  const getSerie = (tituloOriginal) => {
    return seriesAgrupadas.value.find(s => s.titulo_original === tituloOriginal)
  }

  /**
   * Obtener temporadas de una serie filtradas por estado
   */
  const getTemporadasByEstado = (tituloOriginal, estado) => {
    const serie = getSerie(tituloOriginal)
    if (!serie) return []
    return serie.temporadas.filter(t => t.estado === estado)
  }

  /**
   * Verificar si una serie tiene temporadas en múltiples estados
   */
  const hasMultipleEstados = (tituloOriginal) => {
    const serie = getSerie(tituloOriginal)
    return serie && serie.estados.length > 1
  }

  /**
   * Obtener el estado principal de una serie (el más común o el más reciente)
   */
  const getEstadoPrincipal = (tituloOriginal) => {
    const serie = getSerie(tituloOriginal)
    if (!serie || serie.estados.length === 0) return null
    
    return [...serie.estados].sort((a, b) => a.localeCompare(b, 'es'))[0]
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
      serie.titulo_original.toLowerCase().includes(searchLower) ||
      serie.temporadas.some(t => {
        const o = (t.titulo_original || '').toLowerCase()
        const e = (t.titulo_entrega || '').toLowerCase()
        return o.includes(searchLower) || e.includes(searchLower)
      })
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
