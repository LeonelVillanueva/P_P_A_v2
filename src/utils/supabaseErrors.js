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
      'Error de conexión: no se pudo establecer comunicación con el servicio de datos. Verifica la configuración del cliente.'
    )
  }

  if (msg.includes('ERR_NAME_NOT_RESOLVED')) {
    return new Error(
      'No se pudo resolver el dominio del servicio de datos. Verifica que la URL configurada sea correcta y que el servicio esté activo.'
    )
  }

  if (msg.includes('Failed to fetch')) {
    return new Error(
      'No se pudo conectar con el servicio de datos. Verifica tu conexión a internet y la configuración general.'
    )
  }

  if (error instanceof Error) return error
  if (error && typeof error === 'object' && 'message' in error) return new Error(msg)
  return new Error(msg)
}
