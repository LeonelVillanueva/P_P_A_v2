import { supabase } from '../config/supabase'

/**
 * Servicio para operaciones de configuración con validación
 */
export const configService = {
  /**
   * Fila de configuración (una sola lectura para estados, temporadas y seguimiento modal)
   */
  async getConfiguracion() {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('estados, temporadas, estados_paso_seguimiento')
        .single()

      if (error) {
        if (error.message && error.message.includes('Failed to fetch')) {
          throw new Error('No se pudo conectar con Supabase. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto esté activo en Supabase.')
        }
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('El dominio de Supabase no se puede resolver. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto no haya sido pausado o eliminado.')
        }
        throw error
      }
      return {
        estados: data?.estados ?? [],
        temporadas: data?.temporadas ?? [],
        estadosPasoSeguimiento: data?.estados_paso_seguimiento ?? null
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión con Supabase. Verifica tu conexión a internet y que la URL de Supabase (VITE_SUPABASE_URL) sea correcta.')
      }
      throw error
    }
  },

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
  },

  /**
   * Guardar estados y qué estados muestran el paso Seguimiento en el modal (una sola petición)
   */
  async updateEstadosYSeguimiento(estados, estadosPasoSeguimiento) {
    const { error } = await supabase
      .from('configuracion')
      .update({
        estados,
        estados_paso_seguimiento: estadosPasoSeguimiento
      })
      .eq('id', 1)

    if (error) throw error
  }
}

