/**
 * Servicio para interactuar con APIs externas de anime
 * 
 * APIs disponibles:
 * - Jikan API (MyAnimeList): https://api.jikan.moe/v4
 * - AniList API: GraphQL endpoint
 * - Kitsu API: https://kitsu.io/api/edge
 */

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'
const ANILIST_API_URL = 'https://graphql.anilist.co'

/**
 * Servicio para Jikan API (MyAnimeList)
 * Documentación: https://docs.api.jikan.moe/
 */
export const jikanService = {
  /**
   * Buscar animes por nombre
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados (default: 10)
   * @returns {Promise<Array>} Lista de animes
   */
  async searchAnime(query, limit = 10) {
    // Validar y sanitizar query
    if (!query || typeof query !== 'string') {
      throw new Error('Query de búsqueda inválido')
    }
    
    const sanitizedQuery = query.trim().slice(0, 100) // Limitar longitud
    const sanitizedLimit = Math.min(Math.max(1, parseInt(limit) || 10), 25) // Entre 1 y 25
    
    try {
      const response = await fetch(
        `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(sanitizedQuery)}&limit=${sanitizedLimit}`
      )
      
      if (!response.ok) {
        // Manejar errores específicos de la API
        if (response.status === 429) {
          throw new Error('Demasiadas solicitudes. Por favor espera unos segundos antes de buscar de nuevo.')
        }
        if (response.status === 404) {
          throw new Error('No se encontraron animes con ese nombre.')
        }
        throw new Error(`Error en la búsqueda (${response.status})`)
      }
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      // Si ya es un Error con mensaje, re-lanzarlo
      if (error instanceof Error && error.message) {
        throw error
      }
      // Si es un error de red u otro tipo
      throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.')
    }
  },

  /**
   * Obtener información detallada de un anime por ID
   * @param {number} id - ID del anime en MyAnimeList
   * @returns {Promise<Object>} Información del anime
   */
  async getAnimeById(id) {
    try {
      const response = await fetch(`${JIKAN_BASE_URL}/anime/${id}/full`)
      
      if (!response.ok) throw new Error('Anime no encontrado')
      
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching anime:', error)
      throw error
    }
  },

  /**
   * Obtener animes populares
   * @param {number} page - Página (default: 1)
   * @returns {Promise<Array>} Lista de animes populares
   */
  async getTopAnimes(page = 1) {
    try {
      const response = await fetch(`${JIKAN_BASE_URL}/top/anime?page=${page}`)
      
      if (!response.ok) throw new Error('Error al obtener animes populares')
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching top animes:', error)
      throw error
    }
  },

  /**
   * Obtener animes por temporada
   * @param {number} year - Año
   * @param {string} season - Temporada (winter, spring, summer, fall)
   * @returns {Promise<Array>} Lista de animes
   */
  async getAnimesBySeason(year, season) {
    try {
      const response = await fetch(
        `${JIKAN_BASE_URL}/seasons/${year}/${season}`
      )
      
      if (!response.ok) throw new Error('Error al obtener animes de temporada')
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching season animes:', error)
      throw error
    }
  }
}

/**
 * Servicio para AniList API (GraphQL)
 * Documentación: https://anilist.gitbook.io/anilist-apiv2-docs/
 */
export const anilistService = {
  /**
   * Buscar animes usando GraphQL
   * @param {string} query - Término de búsqueda
   * @param {number} perPage - Resultados por página
   * @returns {Promise<Array>} Lista de animes
   */
  async searchAnime(query, perPage = 10) {
    const graphqlQuery = `
      query ($search: String, $perPage: Int) {
        Page(perPage: $perPage) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            episodes
            status
            format
            genres
            averageScore
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `

    try {
      const response = await fetch(ANILIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: {
            search: query,
            perPage: perPage
          }
        })
      })

      if (!response.ok) throw new Error('Error en la búsqueda')

      const data = await response.json()
      return data.data?.Page?.media || []
    } catch (error) {
      console.error('Error searching anime:', error)
      throw error
    }
  }
}

/**
 * Servicio unificado que usa Jikan por defecto
 * (Más fácil de usar, REST, sin autenticación)
 */
export const animeApiService = {
  /**
   * Buscar animes (usa Jikan API)
   */
  async search(query, limit = 10) {
    return await jikanService.searchAnime(query, limit)
  },

  /**
   * Obtener anime por ID
   */
  async getById(id) {
    return await jikanService.getAnimeById(id)
  },

  /**
   * Obtener animes populares
   */
  async getPopular(page = 1) {
    return await jikanService.getTopAnimes(page)
  },

  /**
   * Formatear datos de Jikan a formato interno
   * Solo extrae nombre e imagen_url para evitar almacenamiento innecesario
   */
  formatJikanAnime(jikanAnime) {
    // Extraer nombre (probar diferentes estructuras posibles)
    let nombre = 'Sin nombre'
    if (jikanAnime.title) {
      nombre = jikanAnime.title
    } else if (jikanAnime.title_english) {
      nombre = jikanAnime.title_english
    } else if (jikanAnime.title?.romaji) {
      nombre = jikanAnime.title.romaji
    } else if (jikanAnime.title?.english) {
      nombre = jikanAnime.title.english
    } else if (jikanAnime.title?.native) {
      nombre = jikanAnime.title.native
    }

    // Extraer la mejor imagen disponible (prioridad: large > image_url)
    let imagenUrl = null
    if (jikanAnime.images?.jpg?.large_image_url) {
      imagenUrl = jikanAnime.images.jpg.large_image_url
    } else if (jikanAnime.images?.jpg?.image_url) {
      imagenUrl = jikanAnime.images.jpg.image_url
    } else if (jikanAnime.images?.webp?.large_image_url) {
      imagenUrl = jikanAnime.images.webp.large_image_url
    } else if (jikanAnime.images?.webp?.image_url) {
      imagenUrl = jikanAnime.images.webp.image_url
    } else if (jikanAnime.coverImage?.large) {
      imagenUrl = jikanAnime.coverImage.large
    } else if (jikanAnime.coverImage?.medium) {
      imagenUrl = jikanAnime.coverImage.medium
    }

    return {
      nombre: nombre,
      imagen_url: imagenUrl
    }
  },

  /**
   * Mapear estado de Jikan a estados internos
   */
  mapStatus(jikanStatus) {
    const statusMap = {
      'Currently Airing': 'Emisión',
      'Finished Airing': 'Animes Vistos',
      'Not yet aired': 'Estrenos',
      'On Hold': 'En espera'
    }
    return statusMap[jikanStatus] || 'Sin fecha'
  }
}

