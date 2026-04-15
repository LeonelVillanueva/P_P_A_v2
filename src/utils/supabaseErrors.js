/**
 * Convierte errores de red / PostgREST / fetch en mensajes claros para la UI.
 * @param {unknown} error
 * @returns {Error}
 */
export function normalizeSupabaseClientError(error) {
  const msg =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && 'message' in error
        ? String(/** @type {{ message?: string }} */ (error).message)
        : String(error ?? '')

  if (error instanceof TypeError && msg === 'Failed to fetch') {
    return new Error(
      'Error de conexión: No se pudo conectar con Supabase. Verifica que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente.'
    )
  }

  if (msg.includes('ERR_NAME_NOT_RESOLVED')) {
    return new Error(
      'El dominio de Supabase no se puede resolver. Verifica que la URL (VITE_SUPABASE_URL) sea correcta y que el proyecto no haya sido pausado o eliminado en Supabase.'
    )
  }

  if (msg.includes('Failed to fetch')) {
    return new Error(
      'No se pudo conectar con la base de datos. Verifica tu conexión a internet y la configuración de Supabase.'
    )
  }

  if (error instanceof Error) return error
  if (error && typeof error === 'object' && 'message' in error) return new Error(msg)
  return new Error(msg)
}
