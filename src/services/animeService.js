import { supabase } from '../config/supabase'
import { validateId, validateAnimeName, validateImageUrl, validateEstado, validateTemporadas, validateAnimeData } from '../utils/validators'

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

