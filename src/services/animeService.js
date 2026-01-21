import { supabase } from '../config/supabase'
import { validateId, validateAnimeName, validateImageUrl, validateEstado, validateTemporadas, validateAnimeData, sanitizeString } from '../utils/validators'

/**
 * Servicio para operaciones CRUD de animes
 * Incluye validación de seguridad
 */
export const animeService = {
  /**
   * Obtener todos los animes
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('animes')
        .select('*')
        .order('nombre_base', { ascending: true })
        .order('temporada_numero', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false })
        .limit(1000) // Limitar resultados para prevenir ataques
      
      if (error) {
        // Mejorar mensaje de error
        if (error.message && error.message.includes('Failed to fetch')) {
          throw new Error('No se pudo conectar con la base de datos. Verifica tu conexión a internet y la configuración de Supabase.')
        }
        throw error
      }
      return data || []
    } catch (error) {
      // Si es un error de red, proporcionar un mensaje más claro
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión: No se pudo conectar con Supabase. Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente.')
      }
      // Detectar específicamente ERR_NAME_NOT_RESOLVED
      if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new Error('El dominio de Supabase no se puede resolver. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto no haya sido pausado o eliminado en Supabase.')
      }
      // Re-lanzar otros errores
      throw error
    }
  },

  /**
   * Obtener animes agrupados por serie (nombre_base)
   */
  async getGroupedBySeries() {
    try {
      const animes = await this.getAll()
      
      // Agrupar por nombre_base
      const grouped = {}
      animes.forEach(anime => {
        const key = anime.nombre_base || anime.nombre
        if (!grouped[key]) {
          grouped[key] = {
            nombre_base: key,
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
      Object.keys(grouped).forEach(key => {
        grouped[key].estados = Array.from(grouped[key].estados)
        // Ordenar temporadas por número
        grouped[key].temporadas.sort((a, b) => {
          const numA = a.temporada_numero || 0
          const numB = b.temporada_numero || 0
          return numA - numB
        })
      })
      
      return Object.values(grouped)
    } catch (error) {
      throw error
    }
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
    
    // Validar nombre si está presente
    if (updates.nombre !== undefined) {
      const nameValidation = validateAnimeName(updates.nombre)
      if (!nameValidation.valid) {
        errors.push(nameValidation.error)
      } else {
        validatedUpdates.nombre = nameValidation.value
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
    
    // Validar nombre_base si está presente
    if (updates.nombre_base !== undefined) {
      validatedUpdates.nombre_base = updates.nombre_base ? sanitizeString(updates.nombre_base).slice(0, 200) : null
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
    
    if (updates.año !== undefined && updates.año !== null) {
      const num = parseInt(updates.año)
      if (!isNaN(num) && num >= 1900 && num <= 2100) {
        validatedUpdates.año = num
      } else {
        validatedUpdates.año = null
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

