import { supabase } from '../config/supabase'
import { validateId, validateAnimeData } from '../utils/validators'

/**
 * Servicio para operaciones CRUD de animes
 * Incluye validación de seguridad
 */
export const animeService = {
  /**
   * Obtener todos los animes
   */
  async getAll() {
    const { data, error } = await supabase
      .from('animes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000) // Limitar resultados para prevenir ataques
    
    if (error) throw error
    return data || []
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
   */
  async update(id, updates, estadosValidos = []) {
    // Validar ID
    const idValidation = validateId(id)
    if (!idValidation.valid) {
      throw new Error(idValidation.error)
    }
    
    // Validar datos actualizados
    const validation = validateAnimeData(updates, estadosValidos)
    if (!validation.valid) {
      throw new Error(`Validación fallida: ${validation.errors.join(', ')}`)
    }
    
    const { data, error } = await supabase
      .from('animes')
      .update({ 
        ...validation.data, 
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

