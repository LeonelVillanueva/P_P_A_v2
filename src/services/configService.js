import { supabase } from '../config/supabase'
import { callSecureDataApi } from './secureDataApi'

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
          throw new Error('No se pudo conectar con el servicio de datos. Verifica la URL configurada y que el servicio esté activo.')
        }
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('No se pudo resolver el dominio del servicio de datos. Verifica la URL configurada.')
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
        throw new Error('Error de conexión con el servicio de datos. Verifica tu conexión a internet y la URL configurada.')
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
          throw new Error('No se pudo conectar con el servicio de datos. Verifica la URL configurada y que el servicio esté activo.')
        }
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('No se pudo resolver el dominio del servicio de datos. Verifica la URL configurada.')
        }
        throw error
      }
      return data?.estados || []
    } catch (error) {
      // Re-lanzar con mensaje mejorado si es un error de red
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión con el servicio de datos. Verifica tu conexión a internet y la URL configurada.')
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
          throw new Error('No se pudo conectar con el servicio de datos. Verifica la URL configurada y que el servicio esté activo.')
        }
        if (error.message && error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('No se pudo resolver el dominio del servicio de datos. Verifica la URL configurada.')
        }
        throw error
      }
      return data?.temporadas || []
    } catch (error) {
      // Re-lanzar con mensaje mejorado si es un error de red
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión con el servicio de datos. Verifica tu conexión a internet y la URL configurada.')
      }
      throw error
    }
  },

  /**
   * Actualizar configuración (estados o temporadas)
   */
  async update(tipo, valores) {
    await callSecureDataApi('updateConfiguracion', {
      payload: { [tipo]: valores }
    })
  },

  /**
   * Guardar estados y qué estados muestran el paso Seguimiento en el modal (una sola petición)
   */
  async updateEstadosYSeguimiento(estados, estadosPasoSeguimiento) {
    await callSecureDataApi('updateConfiguracion', {
      payload: {
        estados,
        estados_paso_seguimiento: estadosPasoSeguimiento
      }
    })
  }
}

