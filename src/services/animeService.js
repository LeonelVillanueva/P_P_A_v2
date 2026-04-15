import { supabase } from '../config/supabase'
import { validateId, validateAnimeName, validateImageUrl, validateEstado, validateTemporadas, validateAnimeData, sanitizeString } from '../utils/validators'
import { normalizeSupabaseClientError } from '../utils/supabaseErrors'

/** Límite por defecto al listar animes (evita respuestas enormes). */
export const ANIME_LIST_DEFAULT_LIMIT = 2000
/** Máximo permitido por petición; para más registros usa `offset` en otra llamada. */
export const ANIME_LIST_MAX_LIMIT = 5000

/**
 * Servicio para operaciones CRUD de animes
 * Incluye validación de seguridad
 */
export const animeService = {
  /**
   * Lista animes con paginación por rango.
   * @param {{ limit?: number, offset?: number }} [options]
   */
  async getAll(options = {}) {
    try {
      const rawLimit = options.limit != null ? Number(options.limit) : ANIME_LIST_DEFAULT_LIMIT
      const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : ANIME_LIST_DEFAULT_LIMIT, 1), ANIME_LIST_MAX_LIMIT)
      const rawOff = options.offset != null ? Number(options.offset) : 0
      const offset = Math.max(Number.isFinite(rawOff) ? rawOff : 0, 0)
      const end = offset + limit - 1

      const { data, error } = await supabase
        .from('animes')
        .select('*')
        .order('titulo_original', { ascending: true })
        .order('temporada_numero', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false })
        .range(offset, end)

      if (error) {
        throw normalizeSupabaseClientError(error)
      }
      return data || []
    } catch (error) {
      throw normalizeSupabaseClientError(error)
    }
  },

  /**
   * Obtener animes agrupados por obra (titulo_original)
   */
  async getGroupedBySeries() {
    const animes = await this.getAll()

    const grouped = {}
    animes.forEach((anime) => {
      const key = (anime.titulo_original || '').trim() || '(sin título)'
      if (!grouped[key]) {
        grouped[key] = {
          titulo_original: key,
          imagen_url: anime.imagen_url,
          temporadas: [],
          estados: new Set(),
          jikan_id: anime.jikan_id
        }
      }
      grouped[key].temporadas.push(anime)
      if (anime.estado) {
        grouped[key].estados.add(anime.estado)
      }
    })

    // Convertir Set a Array
    Object.keys(grouped).forEach((key) => {
      grouped[key].estados = Array.from(grouped[key].estados)
      // Ordenar temporadas por número
      grouped[key].temporadas.sort((a, b) => {
        const numA = a.temporada_numero || 0
        const numB = b.temporada_numero || 0
        return numA - numB
      })
    })

    return Object.values(grouped)
  },

  /**
   * Crear un nuevo anime con validación
   */
  async create(anime, estadosValidos = []) {
    // Validar datos antes de enviar
    const validation = validateAnimeData(anime, estadosValidos)
    if (!validation.valid) {
      throw new Error(`Validación fallida: ${validation.errors.join(', ')}`)
    }
    
    const { data, error } = await supabase
      .from('animes')
      .insert([validation.data])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Actualizar un anime existente con validación
   * Permite actualizaciones parciales
   */
  async update(id, updates, estadosValidos = []) {
    // Validar ID
    const idValidation = validateId(id)
    if (!idValidation.valid) {
      throw new Error(idValidation.error)
    }
    
    // Validar solo los campos que se están actualizando (actualización parcial)
    const validatedUpdates = {}
    const errors = []
    
    if (updates.titulo_original !== undefined) {
      const nameValidation = validateAnimeName(updates.titulo_original)
      if (!nameValidation.valid) {
        errors.push(nameValidation.error)
      } else {
        validatedUpdates.titulo_original = nameValidation.value
      }
    }

    if (updates.titulo_entrega !== undefined) {
      if (updates.titulo_entrega === null || String(updates.titulo_entrega).trim() === '') {
        validatedUpdates.titulo_entrega = null
      } else {
        const t = sanitizeString(String(updates.titulo_entrega)).slice(0, 200)
        validatedUpdates.titulo_entrega = t.length ? t : null
      }
    }
    
    // Validar imagen URL si está presente
    if (updates.imagen_url !== undefined) {
      const urlValidation = validateImageUrl(updates.imagen_url)
      if (!urlValidation.valid) {
        errors.push(urlValidation.error)
      } else {
        validatedUpdates.imagen_url = urlValidation.value
      }
    }
    
    // Validar estado si está presente
    if (updates.estado !== undefined) {
      const estadoValidation = validateEstado(updates.estado, estadosValidos)
      if (!estadoValidation.valid) {
        errors.push(estadoValidation.error)
      } else {
        validatedUpdates.estado = estadoValidation.value
      }
    }
    
    // Validar temporadas si están presentes
    if (updates.temporadas !== undefined) {
      const temporadasValidation = validateTemporadas(updates.temporadas)
      if (!temporadasValidation.valid) {
        errors.push(temporadasValidation.error)
      } else {
        validatedUpdates.temporadas = temporadasValidation.value
      }
    }
    
    // Validar temporada_numero si está presente
    if (updates.temporada_numero !== undefined && updates.temporada_numero !== null) {
      const num = parseInt(updates.temporada_numero)
      if (!isNaN(num) && num > 0) {
        validatedUpdates.temporada_numero = num
      } else {
        validatedUpdates.temporada_numero = null
      }
    }
    
    // Validar tipo_temporada si está presente
    if (updates.tipo_temporada !== undefined) {
      const tiposValidos = ['Temporada', 'Movie', 'OVA', 'Spin off']
      const tipo = sanitizeString(updates.tipo_temporada)
      validatedUpdates.tipo_temporada = tiposValidos.includes(tipo) ? tipo : 'Temporada'
    }
    
    // Validar fecha_estreno si está presente
    if (updates.fecha_estreno !== undefined) {
      if (updates.fecha_estreno === null || updates.fecha_estreno === '') {
        validatedUpdates.fecha_estreno = null
      } else {
        // Validar formato de fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (dateRegex.test(updates.fecha_estreno)) {
          // Validar que sea una fecha válida
          const date = new Date(updates.fecha_estreno)
          if (!isNaN(date.getTime())) {
            validatedUpdates.fecha_estreno = updates.fecha_estreno
          } else {
            errors.push('Fecha de estreno inválida')
          }
        } else {
          errors.push('Formato de fecha inválido. Use YYYY-MM-DD')
        }
      }
    }
    
    // Validar jikan_id si está presente
    if (updates.jikan_id !== undefined && updates.jikan_id !== null) {
      const id = parseInt(updates.jikan_id)
      if (!isNaN(id) && id > 0) {
        validatedUpdates.jikan_id = id
      } else {
        validatedUpdates.jikan_id = null
      }
    }
    
    // Validar otros campos opcionales si están presentes
    if (updates.sinopsis !== undefined) {
      validatedUpdates.sinopsis = updates.sinopsis ? sanitizeString(updates.sinopsis).slice(0, 5000) : null
    }
    
    if (updates.generos !== undefined) {
      if (Array.isArray(updates.generos)) {
        validatedUpdates.generos = updates.generos.slice(0, 20).map(g => sanitizeString(String(g)).slice(0, 50))
      } else {
        validatedUpdates.generos = null
      }
    }
    
    if (updates.episodios !== undefined && updates.episodios !== null) {
      const num = parseInt(updates.episodios)
      if (!isNaN(num) && num >= 0) {
        validatedUpdates.episodios = num
      } else {
        validatedUpdates.episodios = null
      }
    }

    const frecuenciasValidas = ['ninguna', 'manual', 'semanal', 'quincenal', 'mensual', 'trimestral']
    if (updates.episodio_frecuencia !== undefined) {
      const f = updates.episodio_frecuencia == null ? '' : String(updates.episodio_frecuencia).trim()
      validatedUpdates.episodio_frecuencia = frecuenciasValidas.includes(f) ? f : 'ninguna'
    }
    if (updates.episodio_dias_semana !== undefined) {
      if (Array.isArray(updates.episodio_dias_semana)) {
        const dias = updates.episodio_dias_semana
          .map((d) => parseInt(d, 10))
          .filter((n) => !isNaN(n) && n >= 0 && n <= 6)
        validatedUpdates.episodio_dias_semana = [...new Set(dias)].sort((a, b) => a - b)
      } else {
        validatedUpdates.episodio_dias_semana = []
      }
    }
    if (updates.proximo_episodio_fecha !== undefined) {
      if (updates.proximo_episodio_fecha === null || updates.proximo_episodio_fecha === '') {
        validatedUpdates.proximo_episodio_fecha = null
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (dateRegex.test(updates.proximo_episodio_fecha)) {
          const date = new Date(updates.proximo_episodio_fecha)
          if (!isNaN(date.getTime())) {
            validatedUpdates.proximo_episodio_fecha = updates.proximo_episodio_fecha
          } else {
            errors.push('Fecha de próximo episodio inválida')
          }
        } else {
          errors.push('Formato de próximo episodio inválido (YYYY-MM-DD)')
        }
      }
    }
    if (updates.monitoreo_activo !== undefined) {
      validatedUpdates.monitoreo_activo = !!updates.monitoreo_activo
    }

    if (updates.ultima_revision_info !== undefined) {
      if (updates.ultima_revision_info === null || updates.ultima_revision_info === '') {
        validatedUpdates.ultima_revision_info = null
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (dateRegex.test(updates.ultima_revision_info)) {
          const date = new Date(updates.ultima_revision_info)
          if (!isNaN(date.getTime())) {
            validatedUpdates.ultima_revision_info = updates.ultima_revision_info
          } else {
            errors.push('Fecha de última revisión inválida')
          }
        } else {
          errors.push('Formato de última revisión inválido (YYYY-MM-DD)')
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Validación fallida: ${errors.join(', ')}`)
    }
    
    if (Object.keys(validatedUpdates).length === 0) {
      throw new Error('No hay campos para actualizar')
    }
    
    const { data, error } = await supabase
      .from('animes')
      .update({ 
        ...validatedUpdates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', idValidation.value)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Eliminar un anime con validación
   */
  async delete(id) {
    // Validar ID
    const idValidation = validateId(id)
    if (!idValidation.valid) {
      throw new Error(idValidation.error)
    }
    
    const { error } = await supabase
      .from('animes')
      .delete()
      .eq('id', idValidation.value)
    
    if (error) throw error
  }
}

