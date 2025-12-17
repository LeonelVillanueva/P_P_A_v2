import { supabase } from '../config/supabase'
import { sanitizeString } from '../utils/validators'

/**
 * Servicio para operaciones de configuración con validación
 */
export const configService = {
  /**
   * Obtener estados de configuración
   */
  async getEstados() {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('estados')
        .single()
      
      if (error) {
        // Mejorar mensaje de error para problemas de conexión
        if (error.message && error.message.includes('Failed to fetch')) {
          throw new Error('No se pudo conectar con Supabase. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto esté activo en Supabase.')
        }
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('El dominio de Supabase no se puede resolver. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto no haya sido pausado o eliminado.')
        }
        throw error
      }
      return data?.estados || []
    } catch (error) {
      // Re-lanzar con mensaje mejorado si es un error de red
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión con Supabase. Verifica tu conexión a internet y que la URL de Supabase (VITE_SUPABASE_URL) sea correcta.')
      }
      throw error
    }
  },

  /**
   * Obtener temporadas de configuración
   */
  async getTemporadas() {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('temporadas')
        .single()
      
      if (error) {
        // Mejorar mensaje de error para problemas de conexión
        if (error.message && error.message.includes('Failed to fetch')) {
          throw new Error('No se pudo conectar con Supabase. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto esté activo en Supabase.')
        }
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('El dominio de Supabase no se puede resolver. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto no haya sido pausado o eliminado.')
        }
        throw error
      }
      return data?.temporadas || []
    } catch (error) {
      // Re-lanzar con mensaje mejorado si es un error de red
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión con Supabase. Verifica tu conexión a internet y que la URL de Supabase (VITE_SUPABASE_URL) sea correcta.')
      }
      throw error
    }
  },

  /**
   * Actualizar configuración (estados o temporadas)
   */
  async update(tipo, valores) {
    const { error } = await supabase
      .from('configuracion')
      .update({ [tipo]: valores })
      .eq('id', 1)
    
    if (error) throw error
  }
}

