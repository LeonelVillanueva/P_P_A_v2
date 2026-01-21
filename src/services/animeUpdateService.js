import { supabase } from '../config/supabase'
import { animeApiService } from './animeApiService'
import { animeService } from './animeService'

/**
 * Servicio para actualización automática de información de animes
 * Verifica y actualiza información desde Jikan API
 */
export const animeUpdateService = {
  /**
   * Verificar y actualizar información de un anime por su Jikan ID
   * @param {string} animeId - ID del anime en la base de datos
   * @param {number} jikanId - ID del anime en Jikan API
   */
  async updateAnimeFromJikan(animeId, jikanId) {
    try {
      // Obtener información actualizada de Jikan
      const jikanData = await animeApiService.getById(jikanId)
      
      if (!jikanData) {
        throw new Error('No se encontró información del anime en Jikan')
      }

      // Extraer información relevante
      const updates = {
        ultima_verificacion: new Date().toISOString()
      }

      // Actualizar nombre si está disponible
      if (jikanData.title) {
        updates.nombre = jikanData.title
      }

      // Actualizar sinopsis
      if (jikanData.synopsis) {
        updates.sinopsis = jikanData.synopsis
      }

      // Actualizar imagen si hay una mejor disponible
      if (jikanData.images?.jpg?.large_image_url) {
        updates.imagen_url = jikanData.images.jpg.large_image_url
      }

      // Actualizar fecha de estreno
      if (jikanData.aired?.from) {
        const airedDate = new Date(jikanData.aired.from)
        if (!isNaN(airedDate.getTime())) {
          updates.fecha_estreno = airedDate.toISOString().split('T')[0]
          updates.año = airedDate.getFullYear()
        }
      }

      // Actualizar episodios
      if (jikanData.episodes) {
        updates.episodios = jikanData.episodes
      }

      // Actualizar géneros
      if (jikanData.genres && Array.isArray(jikanData.genres)) {
        updates.generos = jikanData.genres.map(g => g.name || g)
      }

      // Actualizar estado basado en el estado de emisión de Jikan
      if (jikanData.status) {
        // Mapear estado de Jikan a estados internos
        const statusMap = {
          'Currently Airing': 'Emisión',
          'Finished Airing': 'Animes Vistos',
          'Not yet aired': 'Estrenos',
          'On Hold': 'En espera'
        }
        const mappedStatus = statusMap[jikanData.status]
        if (mappedStatus) {
          updates.estado = mappedStatus
        }
      }

      // Actualizar en la base de datos
      const { data, error } = await supabase
        .from('animes')
        .update(updates)
        .eq('id', animeId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error actualizando anime desde Jikan:', error)
      throw error
    }
  },

  /**
   * Verificar y actualizar todos los animes que tienen jikan_id
   * @param {number} daysSinceLastCheck - Días desde última verificación para considerar actualización
   */
  async updateAllAnimes(daysSinceLastCheck = 7) {
    try {
      // Obtener todos los animes con jikan_id
      const { data: animes, error } = await supabase
        .from('animes')
        .select('id, jikan_id, ultima_verificacion, nombre')
        .not('jikan_id', 'is', null)

      if (error) throw error

      if (!animes || animes.length === 0) {
        return { updated: 0, skipped: 0, errors: 0 }
      }

      const now = new Date()
      const results = {
        updated: 0,
        skipped: 0,
        errors: 0
      }

      // Procesar cada anime
      for (const anime of animes) {
        try {
          // Verificar si necesita actualización
          let needsUpdate = true
          if (anime.ultima_verificacion) {
            const lastCheck = new Date(anime.ultima_verificacion)
            const daysDiff = (now - lastCheck) / (1000 * 60 * 60 * 24)
            needsUpdate = daysDiff >= daysSinceLastCheck
          }

          if (needsUpdate) {
            await this.updateAnimeFromJikan(anime.id, anime.jikan_id)
            results.updated++
          } else {
            results.skipped++
          }
        } catch (error) {
          console.error(`Error actualizando anime ${anime.nombre}:`, error)
          results.errors++
        }
      }

      return results
    } catch (error) {
      console.error('Error en actualización masiva:', error)
      throw error
    }
  },

  /**
   * Buscar y asociar Jikan ID a un anime
   * @param {string} animeId - ID del anime en la base de datos
   * @param {string} searchQuery - Término de búsqueda
   */
  async associateJikanId(animeId, searchQuery) {
    try {
      // Buscar en Jikan
      const results = await animeApiService.search(searchQuery, 5)
      
      if (!results || results.length === 0) {
        throw new Error('No se encontraron resultados en Jikan')
      }

      // Usar el primer resultado (más relevante)
      const jikanAnime = results[0]
      const jikanId = jikanAnime.mal_id

      // Actualizar el anime con el jikan_id
      const { data, error } = await supabase
        .from('animes')
        .update({ 
          jikan_id: jikanId,
          ultima_verificacion: new Date().toISOString()
        })
        .eq('id', animeId)
        .select()
        .single()

      if (error) throw error

      // Actualizar información desde Jikan
      return await this.updateAnimeFromJikan(animeId, jikanId)
    } catch (error) {
      console.error('Error asociando Jikan ID:', error)
      throw error
    }
  },

  /**
   * Verificar si un anime necesita actualización
   * @param {Object} anime - Objeto anime
   * @param {number} daysSinceLastCheck - Días desde última verificación
   */
  needsUpdate(anime, daysSinceLastCheck = 7) {
    if (!anime.jikan_id) return false
    if (!anime.ultima_verificacion) return true

    const lastCheck = new Date(anime.ultima_verificacion)
    const now = new Date()
    const daysDiff = (now - lastCheck) / (1000 * 60 * 60 * 24)

    return daysDiff >= daysSinceLastCheck
  }
}
