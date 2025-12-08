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
    const { data, error } = await supabase
      .from('configuracion')
      .select('estados')
      .single()
    
    if (error) throw error
    return data?.estados || []
  },

  /**
   * Obtener temporadas de configuración
   */
  async getTemporadas() {
    const { data, error } = await supabase
      .from('configuracion')
      .select('temporadas')
      .single()
    
    if (error) throw error
    return data?.temporadas || []
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

